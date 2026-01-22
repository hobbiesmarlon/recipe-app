# app/services/media_service.py
import boto3
from botocore.client import Config
from app.core.config import settings

s3_client = boto3.client(
    "s3",
    endpoint_url=settings.MINIO_ENDPOINT,
    aws_access_key_id=settings.MINIO_ACCESS_KEY,
    aws_secret_access_key=settings.MINIO_SECRET_KEY,
    config=Config(signature_version="s3v4"),
)

def generate_presigned_upload_url(key: str, content_type: str, expires_in: int = 3600) -> str:
    return s3_client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.MEDIA_BUCKET_NAME,
            "Key": key,
            "ContentType": content_type,
        },
        ExpiresIn=expires_in
    )

def generate_presigned_download_url(key: str, expires_seconds: int = 3600) -> str:
    return s3_client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": settings.MEDIA_BUCKET_NAME,
            "Key": key,
        },
        ExpiresIn=expires_seconds,
    )

def upload_file_object(
    file_path: str,
    key: str,
    content_type: str,
):
    s3_client.upload_file(
        Filename=file_path,
        Bucket=settings.MEDIA_BUCKET_NAME,
        Key=key,
        ExtraArgs={
            "ContentType": content_type,
            "ACL": "public-read",  # or private + CDN
        },
    )

def list_objects(prefix: str = ""):
    response = s3_client.list_objects_v2(
        Bucket=settings.MEDIA_BUCKET_NAME,
        Prefix=prefix,
    )
    return response.get("Contents", [])

def delete_object(key: str):
    s3_client.delete_object(
        Bucket=settings.MEDIA_BUCKET_NAME,
        Key=key,
    )

def upload_bytes(
    key: str,
    data: bytes,
    content_type: str,
):
    s3_client.put_object(
        Bucket=settings.MEDIA_BUCKET_NAME,
        Key=key,
        Body=data,
        ContentType=content_type,
        ACL="public-read",  # or private + CDN
    )
