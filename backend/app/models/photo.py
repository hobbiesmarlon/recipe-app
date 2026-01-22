from app.core.db import Base, TimestampMixin
from sqlalchemy import Column, BigInteger, Text, ForeignKey, Boolean, Integer, Index, TIMESTAMP
from sqlalchemy.sql import func

class RecipePhoto(Base, TimestampMixin):
    __tablename__ = "recipe_photos"

    __table_args__ = (
        Index('idx_recipe_photos_recipe', 'recipe_id'),
    )

    id = Column(BigInteger, primary_key=True)
    recipe_id = Column(BigInteger, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    url = Column(Text, nullable=False)
    alt_text = Column(Text)
    is_primary = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    uploaded_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
