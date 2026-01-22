from sqlalchemy import Column, BigInteger, ForeignKey, Index, TIMESTAMP, text
from app.core.db import Base, TimestampMixin

class UserSavedRecipe(Base, TimestampMixin):
    __tablename__ = "user_saved_recipes"
    user_id = Column(BigInteger, ForeignKey("users.id"), primary_key=True)
    recipe_id = Column(BigInteger, ForeignKey("recipes.id"), primary_key=True)
    saved_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

    __table_args__ = (
        Index('idx_saved_recipes_recipe', 'recipe_id'),
    )
