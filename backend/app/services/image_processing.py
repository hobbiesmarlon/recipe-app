import io
import requests
from PIL import Image
from app.services.media_service import (
    upload_bytes, generate_presigned_download_url
)

def generate_thumbnail(
    source_key: str,
    target_key: str,
    max_size: int,
):
    url = generate_presigned_download_url(source_key)

    resp = requests.get(url, timeout=20)
    resp.raise_for_status()

    img = Image.open(io.BytesIO(resp.content))
    img = img.convert("RGB")
    img.thumbnail((max_size, max_size))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85, optimize=True)
    buf.seek(0)

    upload_bytes(
        key=target_key,
        data=buf.read(),
        content_type="image/jpeg",
    )
