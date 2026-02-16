import asyncio
from app.celery_app import celery_app
from app.services.media_processing import process_recipe_media
from app.core.db import engine

@celery_app.task(
    bind=True, 
    autoretry_for=(Exception,), 
    retry_kwargs={"max_retries": 5, "countdown": 10}
)
def process_recipe_media_task(self, media_id: int):
    """
    Production-grade Celery task.
    Ensures the DB engine is loop-compatible.
    """
    async def run_task():
        try:
            await process_recipe_media(media_id)
        finally:
            # Crucial for production:
            # Prevents connection pooling issues between tasks
            await engine.dispose()

    try:
        # Create a fresh loop for this task execution
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(run_task())
    finally:
        loop.close()

@celery_app.task
def cleanup_media_files_task(keys: list[str]):
    from app.services.media_cleanup import cleanup_media_files
    cleanup_media_files(keys)
