import asyncio
import logging
import httpx
from datetime import datetime
from sqlalchemy import select
from app.celery_app import celery_app
from app.core.db import async_session, engine
from app.models.user import User
from app.models.oauth_account import OAuthAccount, OAuthProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

async def sync_x_user_details(oauth_acc: OAuthAccount, db):
    """Fetches details from X and updates the database if they changed."""
    try:
        async with httpx.AsyncClient() as client:
            url = "https://api.twitter.com/2/users/me"
            response = await client.get(
                url,
                headers={"Authorization": f"Bearer {oauth_acc.access_token}"},
                params={"user.fields": "id,name,username,profile_image_url"}
            )
            
            if response.status_code == 401:
                return False

            response.raise_for_status()
            user_data = response.json().get("data", {})
            
            x_username = user_data.get("username")
            name = user_data.get("name")
            profile_pic_url = user_data.get("profile_image_url")
            
            if profile_pic_url:
                profile_pic_url = profile_pic_url.replace("_normal", "")

            # Update OAuthAccount
            changed = False
            if oauth_acc.provider_username != x_username:
                oauth_acc.provider_username = x_username
                changed = True
            if oauth_acc.provider_display_name != name:
                oauth_acc.provider_display_name = name
                changed = True
            if oauth_acc.provider_profile_pic_url != profile_pic_url:
                oauth_acc.provider_profile_pic_url = profile_pic_url
                changed = True

            # Update User if details are sourced from provider
            user = await db.get(User, oauth_acc.user_id)
            if user:
                if user.username_sourced_from_provider and x_username and user.username != x_username:
                    user.username = x_username
                    changed = True
                
                if user.display_name_sourced_from_provider and name and user.display_name != name:
                    user.display_name = name
                    changed = True
                
                if user.profile_pic_sourced_from_provider and profile_pic_url and user.profile_picture_url != profile_pic_url:
                    user.profile_picture_url = profile_pic_url
                    changed = True

            return changed
    except Exception as e:
        logger.error(f"Error syncing X user {oauth_acc.provider_user_id}: {e}")
        return False

# --- CORE LOGIC ---

async def sync_all_oauth_users_logic():
    """Background logic to sync all OAuth users."""
    async with async_session() as db:
        stmt = select(OAuthAccount).where(OAuthAccount.provider == OAuthProvider.X)
        accounts = (await db.execute(stmt)).scalars().all()
        
        updated_count = 0
        for acc in accounts:
            if acc.access_token:
                if await sync_x_user_details(acc, db):
                    updated_count += 1
        
        if updated_count > 0:
            await db.commit()
            
        return f"Synced {len(accounts)} X accounts, {updated_count} updated."

# --- CELERY TASK WRAPPERS ---

@celery_app.task(name="app.tasks.user_sync.sync_oauth_details")
def sync_oauth_details():
    """Celery task wrapper for syncing OAuth details."""
    async def run():
        return await sync_all_oauth_users_logic()

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    try:
        return loop.run_until_complete(run())
    finally:
        # Match maintenance.py pattern of engine.dispose()
        # but ensure we don't dispose if other tasks share it in the same process 
        # (usually okay in prefork worker)
        loop.run_until_complete(engine.dispose())
