# app/services/recipe_validation.py
from fastapi import HTTPException
from app.models.recipe import Recipe
from app.core.config import settings
from app.services.media_verification import verify_media_objects


def validate_publishable(recipe: Recipe):
    """
    Raises HTTPException if the recipe is not complete enough to be public.
    """

    if not recipe.ingredients:
        raise HTTPException(400, "Recipe must have at least one ingredient.")

    if not recipe.steps:
        raise HTTPException(400, "Recipe must have at least one step.")

    images = [m for m in recipe.media if m.type == "image"]
    if not images:
        raise HTTPException(400, "Recipe must have at least one image.")

    for m in recipe.media:
        if not m.processed:
            raise HTTPException(
                409,
                "Media processing still in progress. Try again shortly."
            )

    if not any(m.is_primary for m in images):
        raise HTTPException(400, "Recipe must have a primary image.")

    videos = [m for m in recipe.media if m.type == "video"]
    for video in videos:
        if video.duration_seconds is None:
            raise HTTPException(
                400,
                "Video metadata not processed yet. Please try again later."
            )
        if video.duration_seconds > settings.recipe_video_max_duration:
            raise HTTPException(
                400,
                f"Video exceeds maximum duration of {settings.recipe_video_max_duration} seconds."
            )

    # 🔐 NEW: verify media exists + valid
    verify_media_objects(recipe.media)


def validate_media_upload(media_list: list[dict]):
    images = [m for m in media_list if m['type'] == 'image']
    videos = [m for m in media_list if m['type'] == 'video']

    if len(images) > settings.recipe_image_max_count:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {settings.recipe_image_max_count} images allowed."
        )

    if len(videos) > settings.recipe_video_max_count:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {settings.recipe_video_max_count} video allowed."
        )

    for m in media_list:
        if m['type'] == 'image' and m.get('size', 0) >settings.recipe_image_max_size_mb:
            raise HTTPException(status_code=400, detail="Image exceeds max size.")
        if m['type'] == 'video':
            if m.get('size', 0) > settings.recipe_video_max_size_mb:
                raise HTTPException(status_code=400, detail="Video exceeds max size.")
            if m.get('duration', 0) > settings.recipe_video_max_duration:
                raise HTTPException(status_code=400, detail="Video exceeds max duration.")
