from sqlalchemy import Column, BigInteger, ForeignKey, Index, TIMESTAMP, text
from app.core.db import Base, TimestampMixin

class UserRecipeView(Base, TimestampMixin):
    __tablename__ = "user_recipe_views"
    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id"))
    recipe_id = Column(BigInteger, ForeignKey("recipes.id"))
    viewed_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

    __table_args__ = (
        Index('idx_views_recipe', 'recipe_id'),
        Index('idx_views_user', 'user_id'),
    )
