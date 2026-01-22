import boto3
from app.core.config import settings

s3_client = boto3.client(
    "s3",
    endpoint_url=settings.MINIO_ENDPOINT,
    aws_access_key_id=settings.MINIO_ACCESS_KEY,
    aws_secret_access_key=settings.MINIO_SECRET_KEY,
    region_name=settings.S3_REGION
)

def head_object(key: str) -> dict:
    """
    Perform HEAD request on S3/MinIO object.
    Raises ClientError if object does not exist.
    """
    return s3_client.head_object(
        Bucket=settings.MEDIA_BUCKET_NAME,
        Key=key,
    )

def generate_presigned_post(
    key: str,
    content_type: str,
    max_size_bytes: int,
) -> dict:
    return s3_client.generate_presigned_post(
        Bucket=settings.MEDIA_BUCKET_NAME,
        Key=key,
        Fields={
            "Content-Type": content_type,
        },
        Conditions=[
            {"Content-Type": content_type},
            ["content-length-range", 1, max_size_bytes],
        ],
        ExpiresIn=settings.media_presigned_expiry_seconds,
    )
