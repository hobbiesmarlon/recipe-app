import uuid
import enum
from sqlalchemy import (
    Column, BigInteger, Text, Integer, Boolean,
    ForeignKey, Index, text, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import TSVECTOR, UUID
from app.core.db import Base, TimestampMixin

class RecipeStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class Recipe(Base, TimestampMixin):
    __tablename__ = "recipes"

    __table_args__ = (
        # Existing indexes (UNCHANGED)
        Index('idx_recipes_cook_time', 'cook_time_minutes'),
        Index('idx_recipes_user_id', 'user_id'),
        Index('idx_recipes_user', 'user_id'),
        Index('idx_recipes_is_public', 'is_public'),
        Index('idx_recipes_name', 'name'),

        Index('idx_recipes_search_vector', 'search_vector', postgresql_using='gin'),

        Index(
            'idx_recipes_name_desc_fts',
            func.to_tsvector(
                text("'english'"),
                text("coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(chefs_note, '')")
            ),
            postgresql_using='gin'
        ),

        Index(
            'idx_recipes_name_trgm',
            'name',
            postgresql_using='gin',
            postgresql_ops={'name': 'gin_trgm_ops'}
        ),

        Index(
            'idx_recipes_description_trgm',
            'description',
            postgresql_using='gin',
            postgresql_ops={'description': 'gin_trgm_ops'}
        ),

        # NEW indexes
        Index('idx_recipes_uuid', 'uuid', unique=True),
        Index('idx_recipes_status', 'status'),
        Index('idx_recipes_user_public', 'user_id', 'is_public'),
    )

    # EXISTING PRIMARY KEY (UNCHANGED)
    id = Column(BigInteger, primary_key=True)

    # NEW: UUID for public/external usage
    uuid = Column(
        UUID(as_uuid=True),
        nullable=False,
        unique=True,
        default=uuid.uuid4,
    )

    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))

    # EXISTING FIELDS (UNCHANGED)
    name = Column(Text, nullable=False)
    description = Column(Text)
    chefs_note = Column(Text, nullable=True)
    cook_time_minutes = Column(Integer)
    servings = Column(Integer)
    is_public = Column(Boolean, nullable=False, default=True)

    # NEW: Draft / publish state
    status = Column(
        Enum(RecipeStatus, name="recipe_status"),
        nullable=False,
        server_default=RecipeStatus.draft.value,
    )

    author = relationship("User", back_populates="recipes")

    search_vector = Column(TSVECTOR, FetchedValue())

    # EXISTING RELATIONSHIPS (UNCHANGED)
    ingredients = relationship(
        "RecipeIngredient",
        back_populates="recipe",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    steps = relationship(
        "RecipeStep",
        back_populates="recipe",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    categories = relationship(
        "Category",
        secondary="recipe_categories",
        lazy="selectin",
    )

    # NEW: Media relationship
    media = relationship(
        "RecipeMedia",
        back_populates="recipe",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
