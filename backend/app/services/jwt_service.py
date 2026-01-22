# app/services/jwt_service.py
from datetime import datetime, timedelta
import jwt
from app.core.config import settings

def create_access_token(user_id: int, expires_delta: int | None = None) -> str:
    expire = datetime.utcnow() + timedelta(minutes=expires_delta or
                                           settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "exp": expire
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token
