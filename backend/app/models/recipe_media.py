import enum
from sqlalchemy import (
    Column,
    BigInteger,
    ForeignKey,
    String,
    Text,
    Integer,
    Boolean,
    Enum,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from app.core.db import Base, TimestampMixin
from app.core.config import settings

class MediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"


class StorageProvider(str, enum.Enum):
    MINIO = "minio"
    S3 = "s3"


class RecipeMedia(Base, TimestampMixin):
    __tablename__ = "recipe_media"

    __table_args__ = (
        Index("idx_recipe_media_recipe_id", "recipe_id"),
        Index("idx_recipe_media_type", "media_type"),
        Index("idx_recipe_media_primary", "is_primary"),
        Index("idx_recipe_media_order", "display_order"),
    )

    id = Column(BigInteger, primary_key=True)

    # Relation to recipe (BigInt PK preserved)
    recipe_id = Column(
        BigInteger,
        ForeignKey("recipes.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Optional UUID mirror for external systems / safety
    recipe_uuid = Column(
        UUID(as_uuid=True),
        nullable=True,
    )

    # Storage metadata
    storage_provider = Column(
        Enum(
            StorageProvider,
            name="storage_provider",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
    )

    bucket = Column(Text, nullable=False)
    object_key = Column(Text, nullable=False)  # path/key in S3/MinIO

    # Media metadata
    media_type = Column(
        Enum(
            MediaType,
            name="media_type",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
    )

    content_type = Column(Text, nullable=False)  # image/jpeg, video/mp4
    size_bytes = Column(BigInteger, nullable=False)

    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    duration_seconds = Column(Integer, nullable=True)  # videos only

    processed = Column(Boolean, default=False)
    processing_error = Column(String, nullable=True)

    thumbnail_small_key = Column(Text, nullable=True)  # S3 key for small thumbnail
    thumbnail_medium_key = Column(Text, nullable=True)  # S3 key for medium thumbnail
    thumbnail_large_key = Column(Text, nullable=True)  # S3 key for large thumbnail

    key = Column(String, nullable=False)  # recipes/uuid_filename.jpg
    type = Column(String, nullable=False)  # image | video

    # Display / behavior
    is_primary = Column(Boolean, nullable=False, default=False)
    display_order = Column(Integer, nullable=False, default=0)
    url = Column(Text, nullable=True)

    # Relationships
    recipe = relationship(
        "Recipe",
        back_populates="media",
    )

    @hybrid_property
    def public_url(self) -> str:
        return f"{settings.MEDIA_CDN_BASE_URL}/{self.object_key}"
