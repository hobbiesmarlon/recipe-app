from datetime import datetime, timedelta, timezone
from app.services.media_service import list_objects, delete_object

def cleanup_media(media):
    keys = [
        media.key,
        media.thumbnail_small_key,
        media.thumbnail_medium_key,
        media.thumbnail_large_key,
    ]

    for key in keys:
        if key:
            delete_object(key)

def cleanup_media_files(keys: list[str]):
    for key in keys:
        if key:
            delete_object(key)

def cleanup_orphaned_uploads(hours: int = 24):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)

    objects = list_objects(prefix="uploads/tmp/")

    for obj in objects:
        if obj.last_modified < cutoff:
            delete_object(obj.key)

def delete_recipe_media_objects(media):
    keys = [
        media.key,
        media.thumbnail_small_key,
        media.thumbnail_medium_key,
        media.thumbnail_large_key,
    ]

    for key in keys:
        if key:
            delete_object(key)