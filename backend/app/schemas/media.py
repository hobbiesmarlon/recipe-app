# app/schemas/media.py
from typing import Literal, Optional
from pydantic import BaseModel, Field, computed_field
from app.services.media_urls import public_media_url

class PresignedMediaRequest(BaseModel):
    filename: str           # e.g., "pancake.jpg" or "recipe.mp4"
    content_type: str       # MIME type, e.g., "image/jpeg"
    type: Literal["image", "video"]

class PresignedMediaResponse(BaseModel):
    url: str     # Presigned URL for uploading
    key: str               # S3 object key

class PresignedPostRequest(BaseModel):
    filename: str
    type: str          # image | video
    content_type: str


class PresignedPostResponse(BaseModel):
    key: str
    url: str
    fields: dict


class RecipeMediaRead(BaseModel):
    id: int
    type: str
    is_primary: bool
    display_order: int
    processed: bool = False
    
    # Internal keys (excluded from JSON output)
    key: str = Field(exclude=True)
    thumbnail_small_key: Optional[str] = Field(None, exclude=True)
    thumbnail_medium_key: Optional[str] = Field(None, exclude=True)
    thumbnail_large_key: Optional[str] = Field(None, exclude=True)

    width: Optional[int] = None
    height: Optional[int] = None
    duration_seconds: Optional[int] = None
    processing_error: Optional[str] = None

    @computed_field
    def url(self) -> str | None:
        return public_media_url(self.key)

    @computed_field
    def thumbnail_small_url(self) -> str | None:
        return public_media_url(self.thumbnail_small_key)

    @computed_field
    def thumbnail_medium_url(self) -> str | None:
        return public_media_url(self.thumbnail_medium_key)

    @computed_field
    def thumbnail_large_url(self) -> str | None:
        return public_media_url(self.thumbnail_large_key)

    class Config:
        from_attributes = True
