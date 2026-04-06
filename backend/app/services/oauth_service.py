import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.oauth_account import OAuthAccount, OAuthProvider
from app.core.config import settings

def get_now_utc():
    """Returns modern UTC datetime for Python 3.12+ compatibility."""
    return datetime.now(timezone.utc).replace(tzinfo=None)

async def refresh_x_token(db: AsyncSession, oauth_acc: OAuthAccount) -> str:
    """
    Uses the 6-month refresh token to get a new 2-hour access token from X.
    Implements Refresh Token Rotation as required by X.
    """
    if not oauth_acc.refresh_token:
        raise Exception("No refresh token available for this account")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.twitter.com/2/oauth2/token",
            data={
                "grant_type": "refresh_token",
                "refresh_token": oauth_acc.refresh_token,
                "client_id": settings.X_CLIENT_ID,
            },
            auth=(settings.X_CLIENT_ID, settings.X_CLIENT_SECRET),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to refresh X token: {response.text}")

        token_json = response.json()
        new_access_token = token_json["access_token"]
        new_refresh_token = token_json.get("refresh_token")
        expires_in = token_json.get("expires_in", 7200)

        # Update the database with the new tokens (Rotation!)
        oauth_acc.access_token = new_access_token
        if new_refresh_token:
            oauth_acc.refresh_token = new_refresh_token
        
        oauth_acc.token_expires_at = get_now_utc() + timedelta(seconds=expires_in)
        
        await db.commit()
        await db.refresh(oauth_acc)
        
        return new_access_token

async def get_valid_x_token(db: AsyncSession, user_id: int) -> Optional[str]:
    """
    Gets a valid access token for X. If the current one is expired or 
    about to expire (within 5 mins), it automatically refreshes it.
    """
    result = await db.execute(
        select(OAuthAccount).where(
            OAuthAccount.user_id == user_id,
            OAuthAccount.provider == OAuthProvider.X
        )
    )
    oauth_acc = result.scalars().first()
    
    if not oauth_acc:
        return None

    # Check if expired or expiring soon (5 min buffer)
    # This ensures we refresh BEFORE it actually dies during a request
    is_expired = True
    if oauth_acc.token_expires_at:
        now_plus_buffer = get_now_utc() + timedelta(minutes=5)
        if oauth_acc.token_expires_at > now_plus_buffer:
            is_expired = False

    if is_expired:
        try:
            return await refresh_x_token(db, oauth_acc)
        except Exception:
            return None # Fail silently to avoid blocking the main app session
    
    return oauth_acc.access_token
