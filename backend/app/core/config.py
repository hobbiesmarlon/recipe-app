import json
from typing import Any
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080 # 7 Days
    INGREDIENT_MATCH_URL: str | None = None

    S3_BUCKET: str | None = None
    S3_REGION: str = "af-south-1"
    S3_ACCESS_KEY: str | None = None
    S3_SECRET_KEY: str | None = None
    AWS_ENDPOINT_URL: str | None = None

    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    s3_bucket_name: str = "recipe-media"

    AWS_REGION: str = "us-east-1"

    X_CLIENT_ID: str
    X_CLIENT_SECRET: str
    X_REDIRECT_URI: str

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    recipe_image_max_count: int = 10
    recipe_video_max_count: int = 1
    recipe_image_max_size_mb: int = 5
    recipe_video_max_size_mb: int = 50
    recipe_video_max_duration: int = 60

    MEDIA_CDN_BASE_URL: str
    MEDIA_PUBLIC_BASE_URL: str
    MEDIA_BUCKET_NAME: str
    PROFILE_PICTURE_BUCKET_NAME: str = "profile-pictures"

    CELERY_BROKER_URL: str = "sqs://"
    AWS_SQS_ENDPOINT_URL: str | None = None

    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None

    FRONTEND_URL: str = "http://localhost:5173"

    CORS_ORIGINS: Any = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")  # ← indented inside class
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("["):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return parsed
                except json.JSONDecodeError:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # AWS Cognito
    COGNITO_USER_POOL_ID: str | None = None
    COGNITO_APP_CLIENT_ID: str | None = None
    COGNITO_REGION: str = "us-east-1"
    USE_COGNITO: bool = False

    media_presigned_expiry_seconds: int = 900

    class Config:
        env_file = [".env", "../.env"]
        extra = "ignore"

settings = Settings()