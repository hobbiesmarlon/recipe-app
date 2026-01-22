from sqlalchemy import (
    Column, BigInteger, Text, Integer, Numeric,
    ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.core.db import Base, TimestampMixin

class RecipeIngredient(Base, TimestampMixin):
    __tablename__ = "recipe_ingredients"

    __table_args__ = (
        Index('idx_recipe_ingredients_ing', 'ingredient_id'),
        Index('idx_recipe_ingredients_recipe', 'recipe_id'),
        Index('idx_recipe_ingredients_recipe_ingredient', 'recipe_id', 'ingredient_id'),
    )

    id = Column(BigInteger, primary_key=True)
    recipe_id = Column(BigInteger, ForeignKey("recipes.id", ondelete="CASCADE"))
    ingredient_id = Column(BigInteger, ForeignKey("ingredients.id", ondelete="SET NULL"))

    name_text = Column(Text, nullable=False)
    quantity = Column(Numeric(12, 4))
    quantity_text = Column(Text)
    unit_id = Column(BigInteger, ForeignKey("units.id", ondelete="SET NULL"))
    preparation_notes = Column(Text)
    display_order = Column(Integer, nullable=False, default=0)

    recipe = relationship("Recipe", back_populates="ingredients")
    # ADD THESE:
    ingredient = relationship("Ingredient")
    unit = relationship("Unit")
