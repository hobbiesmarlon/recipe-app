import httpx
from typing import Optional, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.db import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# --- Cognito Public Key Cache ---
# In production, we fetch AWS public keys once and cache them.
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
        
        # Find the correct public key
        key = next((k for kid_val in jwks.get("keys", []) if (k := kid_val).get("kid") == kid), None)
        if not key:
            raise JWTError("Public key not found in JWKS")

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.COGNITO_APP_CLIENT_ID,
            issuer=f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/{settings.COGNITO_USER_POOL_ID}"
        )
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Cognito token: {str(e)}",
        )

# --- Dependency ---

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        if settings.USE_COGNITO:
            # 🚀 Production Mode: Verify via AWS Cognito
            payload = await verify_cognito_token(token)
            # Cognito usually uses 'sub' (a UUID) as the unique ID.
            # We map this to our local user table.
            external_id = payload.get("sub")
            # You might need to find the user by their cognito_sub or email
            # For now, we'll assume email is the bridge:
            email = payload.get("email")
            from sqlalchemy import select
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
        else:
            # 🛠️ Local Mode: Verify using your local SECRET_KEY
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("sub")
            if user_id is None:
                raise credentials_exception
            user = await db.get(User, int(user_id))

        if user is None:
            raise credentials_exception
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
        return await get_current_user(token, db)
    except HTTPException:
        return None