import io
import requests
from PIL import Image
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import async_session
from app.models.recipe_media import RecipeMedia
from app.services.image_processing import generate_thumbnail
from app.services.video_thumbnails import generate_video_thumbnails
from app.services.video_processing import get_video_metadata
from app.services.media_service import generate_presigned_download_url

async def process_recipe_media(
    media_id: int,
):
    async with async_session() as db:
        media = await db.get(RecipeMedia, media_id)
        if not media:
            return
        try:
            if media.type == "image":
                # 🖼️ Extract Metadata
                url = generate_presigned_download_url(media.key)
                resp = requests.get(url, timeout=30)
                resp.raise_for_status()
                
                with Image.open(io.BytesIO(resp.content)) as img:
                    media.width, media.height = img.size

            elif media.type == "video":
                # 🎥 Extract Metadata
                meta = get_video_metadata(media.key)
                media.width = meta["width"]
                media.height = meta["height"]
                media.duration_seconds = int(meta["duration"])

            media.processed = True

        except (OSError, ValueError, RuntimeError, requests.RequestException) as e:
            media.processing_error = str(e)
        await db.commit()
