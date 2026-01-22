import os
import io
import tempfile
from PIL import Image
from app.services.video_processing import extract_video_frame
from app.services.media_service import upload_bytes

THUMB_SIZES = {
    "small": 320,
    "medium": 640,
    "large": 1280,
}

SUFFIX_MAP = {
    "small": "sm",
    "medium": "md",
    "large": "lg",
}

"""Generates small/ medium/ large thumbnails for a video."""
def generate_video_thumbnails(video_key: str, base_key: str) -> dict:
    # Use delete=False for Windows compatibility (subprocess cannot open if we hold it open)
    tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
    tmp.close()

    try:
        extract_video_frame(
            source_key=video_key,
            target_path=tmp.name,
        )

        with Image.open(tmp.name) as img:
            img = img.convert("RGB")

            for size_name, max_size in THUMB_SIZES.items():
                thumb = img.copy()
                thumb.thumbnail((max_size, max_size))

                buf = io.BytesIO()
                thumb.save(buf, format="JPEG", quality=85, optimize=True)
                buf.seek(0)

                suffix = SUFFIX_MAP[size_name]
                target_key = f"{base_key}_{suffix}.jpg"

                upload_bytes(
                    key=target_key,
                    data=buf.read(),
                    content_type="image/jpeg",
                )

        return {
            "thumbnail_small_key": f"{base_key}_sm.jpg",    
            "thumbnail_medium_key": f"{base_key}_md.jpg",
            "thumbnail_large_key": f"{base_key}_lg.jpg",
        }

    finally:
        if os.path.exists(tmp.name):
            os.remove(tmp.name)
