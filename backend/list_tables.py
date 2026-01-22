import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def list_tables():
    url = "postgresql+asyncpg://postgres:admin@localhost:5433/recipe_app"
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        res = await conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """))
        tables = [r[0] for r in res]
        print(f"Tables in DB: {tables}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(list_tables())
