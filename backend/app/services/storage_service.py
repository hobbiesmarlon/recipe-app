import boto3
from botocore.config import Config
from app.core.config import settings

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.S3_ACCESS_KEY,
    aws_secret_access_key=settings.S3_SECRET_KEY,
    region_name=settings.S3_REGION,
    config=Config(
        signature_version="s3v4",
        s3={'addressing_style': 'virtual'}
    )
)

def head_object(key: str, bucket_name: str = settings.MEDIA_BUCKET_NAME) -> dict:
    """
    Perform HEAD request on S3/MinIO object.
    Raises ClientError if object does not exist.
    """
    return s3_client.head_object(
        Bucket=bucket_name,
        Key=key,
    )

def generate_presigned_post(
    key: str,
    content_type: str,
    max_size_bytes: int,
    bucket_name: str = settings.MEDIA_BUCKET_NAME,
) -> dict:
    response = s3_client.generate_presigned_post(
        Bucket=bucket_name,
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
    
    return response
