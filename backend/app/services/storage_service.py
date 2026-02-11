import boto3
from app.core.config import settings

s3_client = boto3.client(
    "s3",
    endpoint_url=settings.MINIO_ENDPOINT,
    aws_access_key_id=settings.MINIO_ACCESS_KEY,
    aws_secret_access_key=settings.MINIO_SECRET_KEY,
    region_name=settings.S3_REGION
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
    
    # Fix for mobile/external access: replace internal docker hostname with public IP
    if settings.MEDIA_PUBLIC_BASE_URL and "minio:9000" in response["url"]:
        # MEDIA_PUBLIC_BASE_URL is likely http://IP:9000/recipe-media
        # We want http://IP:9000
        # Check if the public base url has the bucket name at the end, and strip it if we are switching buckets
        # This is a bit tricky depending on how MEDIA_PUBLIC_BASE_URL is defined.
        # Assuming MEDIA_PUBLIC_BASE_URL points to the generic minio host or the media bucket.
        # Let's assume it is just the host for now or try to be safe.
        
        # Original logic: public_base = settings.MEDIA_PUBLIC_BASE_URL.rsplit("/", 1)[0]
        # This assumes MEDIA_PUBLIC_BASE_URL ended with /recipe-media. 
        # If we use a different bucket, we need to construct the URL correctly.
        
        # If MEDIA_PUBLIC_BASE_URL is http://192.168.1.10:9000/recipe-media
        # base_host would be http://192.168.1.10:9000
        
        base_host = settings.MEDIA_PUBLIC_BASE_URL
        if base_host.endswith(f"/{settings.MEDIA_BUCKET_NAME}"):
             base_host = base_host.rsplit("/", 1)[0]
        
        # response["url"] comes as http://minio:9000/bucket-name
        # We want http://192.168.1.10:9000/bucket-name
        
        response["url"] = response["url"].replace("http://minio:9000", base_host)
        
    return response
