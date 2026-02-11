# app/api/auth.py
import secrets
import urllib.parse
import os
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse, JSONResponse
from app.core.security import generate_code_verifier, generate_code_challenge, create_access_token
from app.core.db import get_db
from app.models.user import User
from app.models.oauth_account import OAuthAccount, OAuthProvider
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import httpx

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------- In-memory PKCE store (for dev) ----------------
pkce_store = {}

def get_redirect_uri(request: Request, provider: str):
    """
    Dynamically determine the redirect URI based on the request's host.
    This allows both localhost and IP-based access to work correctly.
    """
    host = request.headers.get("host")
    scheme = request.url.scheme
    
    # X (Twitter) often blocks 'localhost', so we force 127.0.0.1
    if provider == "x" and "localhost" in host:
        host = host.replace("localhost", "127.0.0.1")
        
    return f"{scheme}://{host}/auth/{provider}/callback"

# ---------------- Providers Config ----------------
OAUTH_PROVIDERS = {
    "google": {
        "client_id": os.environ["GOOGLE_CLIENT_ID"],
        "client_secret": os.environ["GOOGLE_CLIENT_SECRET"],
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "user_info_url": "https://openidconnect.googleapis.com/v1/userinfo",
        "scope": "openid email profile",
    },
    "x": {
        "client_id": os.environ["X_CLIENT_ID"],
        "client_secret": os.environ["X_CLIENT_SECRET"],
        "auth_url": "https://twitter.com/i/oauth2/authorize",
        "token_url": "https://api.twitter.com/2/oauth2/token",
        "user_info_url": "https://api.twitter.com/2/users/me",
        "scope": "tweet.read users.read offline.access",
    }
}

# ---------------- Step 1: Login URL ----------------
@router.get("/{provider}/login")
async def login(provider: str, request: Request):
    provider = provider.lower()
    if provider not in OAUTH_PROVIDERS:
        raise HTTPException(status_code=400, detail="Unsupported provider")

    code_verifier = generate_code_verifier()
    code_challenge = generate_code_challenge(code_verifier)
    state = secrets.token_urlsafe(32)

    pkce_store[state] = code_verifier
    conf = OAUTH_PROVIDERS[provider]
    redirect_uri = get_redirect_uri(request, provider)

    params = {
        "client_id": conf["client_id"],
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": conf["scope"],
        "state": state,
    }

    # Only add PKCE params for providers that support it
    if provider == "google":
        params["code_challenge"] = code_challenge
        params["code_challenge_method"] = "S256"
    elif provider == "x":
        params["code_challenge"] = code_challenge
        params["code_challenge_method"] = "S256"

    url = conf["auth_url"] + "?" + urllib.parse.urlencode(params)
    return RedirectResponse(url)

# ---------------- Step 2: Callback ----------------
@router.get("/{provider}/callback")
async def callback(provider: str, code: str, state: str, request: Request, db: AsyncSession = Depends(get_db)):
    provider = provider.lower()
    if provider not in OAUTH_PROVIDERS:
        raise HTTPException(status_code=400, detail="Unsupported provider")

    if state not in pkce_store:
        raise HTTPException(status_code=400, detail="Invalid state")

    code_verifier = pkce_store.pop(state)
    conf = OAUTH_PROVIDERS[provider]
    redirect_uri = get_redirect_uri(request, provider)

    # ---------------- Exchange code for access token ----------------
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
    }

    request_body_data = data.copy()
    headers = {}
    auth = None

    if provider == "google":
        request_body_data["code_verifier"] = code_verifier
        request_body_data["client_id"] = conf["client_id"]
        request_body_data["client_secret"] = conf["client_secret"]

    elif provider == "x":
        request_body_data["code_verifier"] = code_verifier
        # X requires Basic Auth in header, NOT in body
        auth = (conf["client_id"], conf["client_secret"])
        headers["Content-Type"] = "application/x-www-form-urlencoded"

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            conf["token_url"],
            data=request_body_data,
            auth=auth,
            headers=headers if headers else None
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get access token")

        token_json = token_resp.json()
        access_token = token_json.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="No access token returned")

        # ---------------- Fetch user info ----------------
        user_resp = await client.get(
            conf["user_info_url"],
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if user_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user info")

        if provider == "google":
            user_json = user_resp.json()
            email = user_json["email"]
            name = user_json.get("name") or email.split("@")[0]
            provider_user_id = user_json["sub"]
            profile_pic_url = user_json.get("picture")
        elif provider == "x":
            user_resp = await client.get(
                conf["user_info_url"],
                headers={"Authorization": f"Bearer {access_token}"},
                params={"user.fields": "id,name,username,profile_image_url"}
            )
            if user_resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to fetch user info")
            user_json = user_resp.json()
            user_data = user_json.get("data", {})
            provider_user_id = user_data.get("id")
            x_username = user_data.get("username")
            name = user_data.get("name") or x_username or f"user_{provider_user_id}"
            email = f"{provider_user_id}@x.com"
            profile_pic_url = user_data.get("profile_image_url")
            # X returns normal size by default, replace '_normal' for higher res if needed
            if profile_pic_url:
                profile_pic_url = profile_pic_url.replace("_normal", "")

    # ---------------- Step 3: Upsert user ----------------
    result = await db.execute(
        select(OAuthAccount).where(
            OAuthAccount.provider == OAuthProvider(provider),
            OAuthAccount.provider_user_id == provider_user_id
        )
    )
    oauth_acc = result.scalars().first()
    
    is_new_user = False

    if oauth_acc:
        user = await db.get(User, oauth_acc.user_id)
        # Update OAuth info
        oauth_acc.provider_username = x_username if provider == "x" else None
        oauth_acc.provider_display_name = name
        oauth_acc.provider_profile_pic_url = profile_pic_url
        
        # Update User sourcing flags based on current provider login
        if provider == "google":
             user.username_sourced_from_provider = False
             user.display_name_sourced_from_provider = False
             user.profile_pic_sourced_from_provider = False
        elif provider == "x":
             user.username_sourced_from_provider = True
             user.display_name_sourced_from_provider = True
             user.profile_pic_sourced_from_provider = True

        # Update User info if sourced from provider
        if user.profile_pic_sourced_from_provider and profile_pic_url:
             user.profile_picture_url = profile_pic_url
        if user.display_name_sourced_from_provider and name:
             user.display_name = name
    else:
        is_new_user = True
        if provider == "x":
            username = x_username if x_username else email.split("@")[0]
            # X users have details sourced from provider by default
            sourced = True
        else:
            username = email.split("@")[0] if email and "@" in email else email
            # Google users can choose their own details
            sourced = False

        user = User(
            username=username, 
            display_name=name,
            profile_picture_url=profile_pic_url,
            username_sourced_from_provider=sourced,
            display_name_sourced_from_provider=sourced,
            profile_pic_sourced_from_provider=sourced
        )
        db.add(user)
        await db.flush()
        oauth_acc = OAuthAccount(
            user_id=user.id,
            provider=OAuthProvider(provider),
            provider_user_id=provider_user_id,
            access_token=access_token,
            provider_username=x_username if provider == "x" else None,
            provider_display_name=name,
            provider_profile_pic_url=profile_pic_url
        )
        db.add(oauth_acc)

    await db.commit()

    # ---------------- Step 4: Return JWT ----------------
    token = create_access_token(subject=str(user.id))
    
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    redirect_url = f"{frontend_url}/auth/callback?token={token}&provider={provider}&is_new_user={str(is_new_user).lower()}"
    
    return RedirectResponse(url=redirect_url)
