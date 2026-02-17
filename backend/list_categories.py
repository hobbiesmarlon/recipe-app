import sys
import os
import asyncio

# Ensure backend is in path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.core.db import async_session
from app.models.category import Category
from sqlalchemy import select

async def main():
    try:
        async with async_session() as db:
            stmt = select(Category).order_by(Category.id)
            result = await db.execute(stmt)
            categories = result.scalars().all()

            print(f"{'ID':<5} | {'NAME':<30} | {'GROUP_ID'}")
            print("-" * 50)
            
            for c in categories:
                print(f"{c.id:<5} | {c.name:<30} | {c.group_id}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
