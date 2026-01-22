from fastapi import HTTPException
from app.services.storage_service import head_object
from app.core.config import settings
from app.models.recipe_media import RecipeMedia


def verify_media_objects(media: list[RecipeMedia]) -> None:
    """
    Verifies all media objects exist and match constraints.
    Raises HTTPException on failure.
    """

    for m in media:
        try:
            metadata = head_object(m.key)
        except Exception as exc:
            raise HTTPException(
                status_code=400,
                detail=f"Media object not found: {m.key}"
            ) from exc

        size_bytes = metadata.get("ContentLength", 0)
        content_type = metadata.get("ContentType", "")

        # ---- Image validation ----
        if m.type == "image":
            if not content_type.startswith("image/"):
                raise HTTPException(
                    400,
                    f"Invalid image content type: {content_type}"
                )

            max_size = settings.recipe_image_max_size_mb * 1024 * 1024
            if size_bytes > max_size:
                raise HTTPException(
                    400,
                    "Image exceeds maximum allowed size"
                )

        # ---- Video validation ----
        elif m.type == "video":
            if not content_type.startswith("video/"):
                raise HTTPException(
                    400,
                    f"Invalid video content type: {content_type}"
                )

            max_size = settings.recipe_video_max_size_mb * 1024 * 1024
            if size_bytes > max_size:
                raise HTTPException(
                    400,
                    "Video exceeds maximum allowed size"
                )

        else:
            raise HTTPException(400, f"Unknown media type: {m.type}")
