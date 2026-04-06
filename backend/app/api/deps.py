import httpx
from datetime import datetime, timezone
from typing import Optional, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.db import get_db
from app.models.user import User
from app.services.oauth_service import get_valid_x_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def get_now_utc():
    """Returns modern UTC datetime for Python 3.12+ compatibility."""
    return datetime.now(timezone.utc).replace(tzinfo=None)

# --- Cognito Public Key Cache ---
cognito_jwks: Optional[dict] = None

async def get_cognito_jwks() -> dict:
    global cognito_jwks
    if cognito_jwks is None:
        url = f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/{settings.COGNITO_USER_POOL_ID}/.well-known/jwks.json"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url)
            resp.raise_for_status()
            cognito_jwks = resp.json()
    return cognito_jwks

async def verify_cognito_token(token: str) -> dict:
    """Verifies a JWT token issued by AWS Cognito."""
    try:
        jwks = await get_cognito_jwks()
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        key = next((k for kid_val in jwks.get("keys", []) if (k := kid_val).get("kid") == kid), None)
        if not key:
            raise JWTError("Public key not found in JWKS")

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.COGNITO_APP_CLIENT_ID,
            issuer=f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/{settings.COGNITO_USER_POOL_ID}",
            options={"verify_at_hash": False}
        )
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Cognito token: {str(e)}",
        )

async def get_verified_cognito_data(
    token: Optional[str] = Depends(oauth2_scheme),
) -> dict:
    """
    Verifies the Cognito token and returns the payload.
    Does NOT check if the user exists in our local DB.
    Useful for registration-time actions like uploading a profile photo.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing",
        )

    if not settings.USE_COGNITO:
        # Fallback to local token check if Cognito is disabled
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            return payload
        except:
            raise HTTPException(status_code=401, detail="Invalid token")

    try:
        payload = await verify_cognito_token(token)
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Cognito token: {str(e)}",
        )

# --- Dependency ---

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme),
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 1. Try AWS Cognito (if enabled)
    if settings.USE_COGNITO:
        try:
            payload = await verify_cognito_token(token)
            cognito_sub = payload.get("sub")
            email = payload.get("email")
            profile_picture_url = payload.get("custom:picture")
            
            from sqlalchemy import select
            stmt = select(User).where(
                (User.cognito_sub == cognito_sub) | (User.email == email)
            )
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "code": "registration_incomplete",
                        "cognito_sub": cognito_sub,
                        "email": email,
                        "profile_picture_url": profile_picture_url
                    }
                )
            
            if not user.cognito_sub:
                user.cognito_sub = cognito_sub
                await db.commit()
            
            return user
        except HTTPException as e:
            if e.status_code == 403:
                raise e
            # If it's 401, maybe it's not a Cognito token, let's try local
            pass
        except Exception:
            # Fall through to local verification
            pass

    # 2. Try Local HS256 Token (for X and other local providers)
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user = await db.get(User, int(user_id))
        if user is None:
            raise credentials_exception
        
        # 🛡️ BULLETPROOF REFRESH: If user has an X account, ensure it's fresh
        # This keeps the session alive beyond the 2hr X access token limit
        try:
            # get_valid_x_token handles the expiry check and refresh silently
            await get_valid_x_token(db, user.id)
        except Exception:
            # Don't let a failed X refresh block the whole app session
            pass
            
        return user
    except (JWTError, ValueError):
        raise credentials_exception

async def get_optional_current_user(
    db: AsyncSession = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme),
) -> Optional[User]:
    if not token:
        return None
    try:
        return await get_current_user(db=db, token=token)
    except HTTPException:
        return None
