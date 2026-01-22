from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    INGREDIENT_MATCH_URL: str | None = None

    S3_BUCKET: str | None = None
    S3_REGION: str | None = None
    S3_ACCESS_KEY: str | None = None
    S3_SECRET_KEY: str | None = None
    AWS_ENDPOINT_URL: str | None = None

    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    s3_bucket_name: str = "recipe-media"

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

    CELERY_BROKER_URL: str = "sqs://"
    AWS_SQS_ENDPOINT_URL: str | None = None

    # AWS Cognito
    COGNITO_USER_POOL_ID: str | None = None
    COGNITO_APP_CLIENT_ID: str | None = None
    COGNITO_REGION: str = "us-east-1"
    USE_COGNITO: bool = False

    media_presigned_expiry_seconds: int = 900

    class Config:
        env_file = [".env", "../.env"]
        extra = "forbid"

settings = Settings()
