from sqlalchemy import Column, BigInteger, ForeignKey, Index
from app.core.db import Base, TimestampMixin

class RecipeCategory(Base, TimestampMixin):
    __tablename__ = "recipe_categories"

    __table_args__ = (
        Index('idx_recipe_categories_category', 'category_id'),
    )

    recipe_id = Column(
        BigInteger,
        ForeignKey("recipes.id", ondelete="CASCADE"),
        primary_key=True,
    )
    category_id = Column(
        BigInteger,
        ForeignKey("categories.id", ondelete="CASCADE"),
        primary_key=True,
    )
