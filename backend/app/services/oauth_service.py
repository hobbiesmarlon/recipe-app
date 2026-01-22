# app/services/oauth_service.py
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.oauth_account import OAuthAccount, OAuthProvider
from app.core.config import settings
from app.services.jwt_service import create_access_token

async def create_or_get_user(
    provider: OAuthProvider,
    provider_user_id: str,
    username: str | None,
    display_name: str | None,
    profile_pic_url: str | None,
    db: AsyncSession,
    access_token: str
):
    # Check if user exists
    result = await db.execute(
    select(OAuthAccount).where(
        OAuthAccount.provider == OAuthProvider(provider),
        OAuthAccount.provider_user_id == provider_user_id
    )
)

    user = result.scalar_one_or_none()

    if not user:
        # Create new user
        user = User(username=username or provider_user_id, display_name=display_name or username)
        db.add(user)
        await db.commit()
        await db.refresh(user)

        oauth_acc = OAuthAccount(
            user_id=user.id,
            provider=provider,
            provider_user_id=provider_user_id,
            provider_username=username,
            provider_display_name=display_name,
            provider_profile_pic_url=profile_pic_url,
            access_token=access_token
        )
        db.add(oauth_acc)
        await db.commit()

    # Return JWT token
    token = create_access_token(user.id)
    return token

async def oauth_google(code: str, db: AsyncSession):
    async with AsyncClient() as client:
        # Exchange code for access token
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            }
        )
        token_data = token_resp.json()
        access_token = token_data["access_token"]

        # Fetch user info
        user_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_info = user_resp.json()
        return await create_or_get_user(
            provider=OAuthProvider.GOOGLE,
            provider_user_id=user_info["id"],
            username=user_info.get("email"),
            display_name=user_info.get("name", user_info.get("email")),
            profile_pic_url=user_info.get("picture"),
            db=db,
            access_token=access_token
        )

async def oauth_x():
    # X OAuth is handled by app/api/v1/auth.py
    # This function is kept for backwards compatibility if needed
    pass
