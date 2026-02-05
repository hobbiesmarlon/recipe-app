from sqlalchemy import Column, BigInteger, ForeignKey, Index, TIMESTAMP, text
from app.core.db import Base, TimestampMixin

class RecipeLike(Base, TimestampMixin):
    __tablename__ = "recipe_likes"
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    recipe_id = Column(BigInteger, ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

    __table_args__ = (
        Index('idx_recipe_likes_recipe', 'recipe_id'),
    )
