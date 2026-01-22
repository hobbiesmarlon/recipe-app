import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check():
    url = "postgresql+asyncpg://postgres:admin@localhost:5433/recipe_app"
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'oauth_accounts'"))
        columns = [r[0] for r in res]
        print(f"Columns in oauth_accounts: {columns}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check())
