import secrets
import hashlib
import base64
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt

from app.core.config import settings  # load SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES

# ---------------- PKCE ---------------- #

def generate_code_verifier(length: int = 128) -> str:
    return secrets.token_urlsafe(length)[:length]

def generate_code_challenge(code_verifier: str) -> str:
    digest = hashlib.sha256(code_verifier.encode()).digest()
    return base64.urlsafe_b64encode(digest).decode().rstrip("=")

# ---------------- JWT ---------------- #

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.
                                                             ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
