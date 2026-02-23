import os
import pytest
import pytest_asyncio
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
import boto3
from botocore.client import Config
import unittest.mock

# 1. SET ENVIRONMENT VARIABLES FIRST
# These must be set before ANY imports from 'app'
os.environ["DATABASE_URL"] = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:admin@localhost:5434/test_recipe_app")
os.environ["MINIO_ENDPOINT"] = "http://localhost:9000"
os.environ["MEDIA_PUBLIC_BASE_URL"] = "http://localhost:9000/recipe-media"
os.environ["SECRET_KEY"] = "testsecret"
os.environ["AWS_ACCESS_KEY_ID"] = "minioadmin"
os.environ["AWS_SECRET_ACCESS_KEY"] = "minioadmin"
os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

# 2. GLOBAL MOCK FOR BOTO3
# Intercepts both boto3.client and boto3.Session.client
def mocked_client(service_name, **kwargs):
    if service_name == "s3":
        kwargs["endpoint_url"] = "http://localhost:9000"
    return boto3.Session(
        aws_access_key_id="minioadmin",
        aws_secret_access_key="minioadmin",
        region_name="us-east-1"
    )._session.create_client(service_name, **kwargs)

@pytest.fixture(scope="session", autouse=True)
def patch_boto3():
    with unittest.mock.patch("boto3.client", side_effect=mocked_client), \
         unittest.mock.patch("boto3.Session.client", side_effect=mocked_client), \
         unittest.mock.patch("celery.app.task.Task.delay", return_value=None), \
         unittest.mock.patch("celery.app.task.Task.apply_async", return_value=None):
        yield

# 3. Import app components
from app.main import app
from app.core.db import Base
import app.core.db as db_module
import app.services.media_service as media_service
import app.services.storage_service as storage_service
from app.core.config import settings
from app.utils.jwt import create_access_token

# Force settings to match env vars
settings.MINIO_ENDPOINT = os.environ["MINIO_ENDPOINT"]
settings.DATABASE_URL = os.environ["DATABASE_URL"]

# Global placeholders
_engine = None
_sessionmaker = None

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    if os.name == 'nt':
        loop = asyncio.ProactorEventLoop()
    else:
        loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    global _engine, _sessionmaker
    
    _engine = create_async_engine(os.environ["DATABASE_URL"], echo=False, pool_pre_ping=True)
    _sessionmaker = async_sessionmaker(_engine, expire_on_commit=False)
    
    db_module.engine = _engine
    db_module.async_session = _sessionmaker
    
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text("INSERT INTO ingredients (id, name) VALUES (1, 'salt'), (2, 'sugar'), (3, 'butter')"))
        await conn.execute(text("SELECT setval('ingredients_id_seq', 3)"))
        
        # Seed Categories
        await conn.execute(text("INSERT INTO category_groups (id, name) VALUES (1, 'Meal Type'), (3, 'Dietary')"))
        await conn.execute(text("SELECT setval('category_groups_id_seq', 3)"))
        await conn.execute(text(
            "INSERT INTO categories (id, group_id, name) VALUES "
            "(1, 1, 'Breakfast'), "
            "(57, 3, 'Fruit-Based')"
        ))
        await conn.execute(text("SELECT setval('categories_id_seq', 57)"))

        # Include boolean source flags to pass UserResponse validation
        await conn.execute(text(
            "INSERT INTO users (id, email, username, display_name, "
            "username_sourced_from_provider, display_name_sourced_from_provider, profile_pic_sourced_from_provider) "
            "VALUES (1, 'test@example.com', 'testuser', 'Test User', false, false, false), "
            "(2, 'other@example.com', 'otheruser', 'Other User', false, false, false)"
        ))
        await conn.execute(text("SELECT setval('users_id_seq', 2)"))

    # Setup S3
    test_s3_client = boto3.client("s3")
    media_service.s3_client = test_s3_client
    storage_service.s3_client = test_s3_client

    for bucket in [settings.MEDIA_BUCKET_NAME, settings.PROFILE_PICTURE_BUCKET_NAME]:
        try:
            test_s3_client.create_bucket(Bucket=bucket)
        except Exception:
            pass

    yield
    await _engine.dispose()

@pytest_asyncio.fixture(scope="session")
async def db() -> AsyncGenerator[AsyncSession, None]:
    async with _sessionmaker() as session:
        yield session

@pytest_asyncio.fixture(scope="session")
async def client() -> AsyncGenerator[AsyncClient, None]:
    from fastapi import BackgroundTasks
    import unittest.mock

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        with unittest.mock.patch.object(BackgroundTasks, "add_task", return_value=None):
            yield ac

@pytest.fixture(scope="session")
def test_user_id() -> int:
    return 1

@pytest.fixture(scope="session")
def auth_headers(test_user_id: int) -> dict:
    access_token = create_access_token(user_id=test_user_id)
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture(scope="session")
def other_auth_headers() -> dict:
    access_token = create_access_token(user_id=2)
    return {"Authorization": f"Bearer {access_token}"}
