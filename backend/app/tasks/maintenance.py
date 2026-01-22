import asyncio
import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, update, or_
from app.celery_app import celery_app
from app.core.db import async_session, engine
from app.models.recipe import Recipe
from app.models.recipe_media import RecipeMedia
from app.services.media_cleanup import cleanup_media
from app.services.storage_service import head_object
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

# --- CORE LOGIC FUNCTIONS (Pure Async) ---

async def cleanup_orphaned_media_logic(hours: int = 24):
    """1. 🧹 Delete media records never attached to a recipe."""
    async with async_session() as db:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        stmt = select(RecipeMedia).where(
            (RecipeMedia.recipe_id == None) & (RecipeMedia.created_at < cutoff)
        )
        orphans = (await db.execute(stmt)).scalars().all()
        for media in orphans:
            cleanup_media(media)
            await db.delete(media)
        await db.commit()
        return f"Cleaned up {len(orphans)} orphaned media items."

async def delete_failed_media_logic(days: int = 7):
    """2. 🧹 Delete media that failed processing after N days."""
    async with async_session() as db:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        stmt = select(RecipeMedia).where(
            (RecipeMedia.processing_error != None) & 
            (RecipeMedia.processed == False) &
            (RecipeMedia.created_at < cutoff)
        )
        failed = (await db.execute(stmt)).scalars().all()
        for media in failed:
            cleanup_media(media)
            await db.delete(media)
        await db.commit()
        return f"Deleted {len(failed)} failed media items older than {days} days."

async def retry_stuck_media_logic(minutes: int = 30):
    """3. 🔁 Retry media that is neither processed nor errored (stuck)."""
    from app.tasks.media import process_recipe_media_task
    async with async_session() as db:
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
        stmt = select(RecipeMedia).where(
            (RecipeMedia.processed == False) & 
            (RecipeMedia.processing_error == None) &
            (RecipeMedia.updated_at < cutoff)
        )
        stuck = (await db.execute(stmt)).scalars().all()
        for media in stuck:
            process_recipe_media_task.delay(media.id)
        return f"Re-enqueued {len(stuck)} stuck media items."

async def clean_expired_drafts_logic(days: int = 30):
    """4. 🧼 Clean recipes marked private (drafts) that haven't been updated in 30 days."""
    async with async_session() as db:
        # Use timezone-aware UTC now
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(days=days)
        
        stmt = select(Recipe).where(
            (Recipe.is_public == False) & 
            (Recipe.updated_at < cutoff)
        )
        expired = (await db.execute(stmt)).scalars().all()
        count = len(expired)
        for recipe in expired:
            await db.delete(recipe)
        
        if count > 0:
            await db.commit()
        return f"Cleaned up {count} expired drafts."

async def verify_and_regenerate_thumbnails_logic():
    """5 & 6. 🔄 Verify integrity and regenerate thumbnails if missing."""
    from app.tasks.media import process_recipe_media_task
    async with async_session() as db:
        stmt = select(RecipeMedia).where(RecipeMedia.processed == True).limit(50)
        items = (await db.execute(stmt)).scalars().all()
        regenerated = 0
        for media in items:
            try:
                if media.thumbnail_small_key:
                    head_object(media.thumbnail_small_key)
            except (ClientError, AttributeError):
                process_recipe_media_task.delay(media.id)
                regenerated += 1
        return f"Verified items, triggered regeneration for {regenerated} items."

# --- CELERY TASK WRAPPERS ---

@celery_app.task(name="app.tasks.maintenance.run_all_maintenance")
def run_all_maintenance():
    """Master task to run all maintenance jobs. (Handles loop for Celery)"""
    async def run():
        results = []
        results.append(await cleanup_orphaned_media_logic())
        results.append(await delete_failed_media_logic())
        results.append(await retry_stuck_media_logic())
        results.append(await clean_expired_drafts_logic())
        results.append(await verify_and_regenerate_thumbnails_logic())
        return results

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    if loop.is_running():
        # This part should theoretically not be hit in Celery worker (prefoked)
        # but is useful for local testing
        return "Task cannot be run synchronously in a running loop."
    
    try:
        return loop.run_until_complete(run())
    finally:
        loop.run_until_complete(engine.dispose())
