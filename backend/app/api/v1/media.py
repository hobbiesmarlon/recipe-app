import uuid
from typing import List
from fastapi import APIRouter, HTTPException

from app.schemas.media import (
    PresignedPostRequest,
    PresignedPostResponse,
)
from app.services.storage_service import generate_presigned_post
from app.core.config import settings

router = APIRouter(prefix="/media", tags=["media"])


@router.post("/presigned-posts", response_model=List[PresignedPostResponse])
async def get_presigned_posts(files: List[PresignedPostRequest]):
    images = [f for f in files if f.type == "image"]
    videos = [f for f in files if f.type == "video"]

    if len(images) > settings.recipe_image_max_count:
        raise HTTPException(
            400,
            f"Maximum {settings.recipe_image_max_count} images allowed"
        )

    if len(videos) > settings.recipe_video_max_count:
        raise HTTPException(
            400,
            f"Maximum {settings.recipe_video_max_count} video allowed"
        )

    results = []

    for file in files:
        key = f"recipes/{uuid.uuid4()}_{file.filename}"

        if file.type == "image":
            max_size = settings.recipe_image_max_size_mb * 1024 * 1024
        elif file.type == "video":
            max_size = settings.recipe_video_max_size_mb * 1024 * 1024
        else:
            raise HTTPException(400, "Invalid media type")

        presigned = generate_presigned_post(
            key=key,
            content_type=file.content_type,
            max_size_bytes=max_size,
        )

        results.append(
            PresignedPostResponse(
                key=key,
                url=presigned["url"],
                fields=presigned["fields"],
            )
        )

    return results
