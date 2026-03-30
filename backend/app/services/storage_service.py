import logging
import boto3
from botocore.config import Config
from app.core.config import settings

logger = logging.getLogger(__name__)

# Use common AWS credentials if available, fallback to S3_ specific ones
aws_access_key = settings.AWS_ACCESS_KEY_ID or settings.S3_ACCESS_KEY
aws_secret_key = settings.AWS_SECRET_ACCESS_KEY or settings.S3_SECRET_KEY

s3_client = boto3.client(
    "s3",
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key,
    region_name=settings.S3_REGION,
    endpoint_url=settings.AWS_ENDPOINT_URL, # Crucial for MinIO/Local dev
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
