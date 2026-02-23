import os
import pytest
import pytest_asyncio
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

# SET ENVIRONMENT VARIABLES
TEST_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:admin@localhost:5434/test_recipe_app")
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["MINIO_ENDPOINT"] = os.getenv("MINIO_ENDPOINT", "http://localhost:9090")
os.environ["MEDIA_PUBLIC_BASE_URL"] = os.getenv("MEDIA_PUBLIC_BASE_URL", "http://localhost:9090/recipe-media")
os.environ["SECRET_KEY"] = os.getenv("SECRET_KEY", "testsecret")

# Import app components
from app.main import app
from app.core.db import Base
import app.core.db as db_module
import app.services.media_service as media_service
from app.core.config import settings
from app.utils.jwt import create_access_token
import boto3
from botocore.client import Config

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
    
    # Create engine inside the loop
    _engine = create_async_engine(TEST_DATABASE_URL, echo=False, pool_pre_ping=True)
    _sessionmaker = async_sessionmaker(_engine, expire_on_commit=False)
    
    # Patch app globals
    db_module.engine = _engine
    db_module.async_session = _sessionmaker
    
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text("INSERT INTO ingredients (id, name) VALUES (1, 'salt'), (2, 'sugar'), (3, 'butter')"))
        await conn.execute(text("SELECT setval('ingredients_id_seq', 3)"))
        
        await conn.execute(text(
            "INSERT INTO users (id, email, username, display_name) "
            "VALUES (1, 'test@example.com', 'testuser', 'Test User')"
        ))
        await conn.execute(text("SELECT setval('users_id_seq', 1)"))

    # Setup S3
    media_service.s3_client = boto3.client(
        "s3",
        endpoint_url=os.environ["MINIO_ENDPOINT"],
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        config=Config(signature_version="s3v4"),
    )
    try:
        media_service.s3_client.create_bucket(Bucket=settings.MEDIA_BUCKET_NAME)
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