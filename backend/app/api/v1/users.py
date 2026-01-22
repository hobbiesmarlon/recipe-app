from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db
from app.models.user import User
from app.utils.jwt import decode_access_token

router = APIRouter()
security = HTTPBearer()

@router.get("/me")
async def me(token=Depends(security), db: AsyncSession = Depends(get_db)):
    user_id = decode_access_token(token.credentials)
    if not user_id:
        raise HTTPException(status_code=401)

    user = await db.get(User, user_id)
    return user
