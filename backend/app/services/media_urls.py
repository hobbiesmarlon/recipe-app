from app.core.config import settings
from app.services.media_service import generate_presigned_download_url

def public_media_url(key: str | None) -> str | None:
    if not key:
        return None

    # CDN / Public URL
    if settings.MEDIA_PUBLIC_BASE_URL:
        return f"{settings.MEDIA_PUBLIC_BASE_URL}/{key}"

    # Fallback to presigned URL (private / dev)
    return generate_presigned_download_url(key)
