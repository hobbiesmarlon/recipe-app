# pylint: disable=not-callable
from sqlalchemy import (
    Column, BigInteger, Text, Integer,
    ForeignKey, DateTime, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.db import Base, TimestampMixin

class RecipeStep(Base, TimestampMixin):
    __tablename__ = "recipe_steps"

    __table_args__ = (
        Index('idx_recipe_steps_recipe', 'recipe_id'),
        Index('idx_recipe_steps_recipe_number', 'recipe_id', 'step_number'),
        UniqueConstraint('recipe_id', 'step_number', name='uq_recipe_step'),
    )

    id = Column(BigInteger, primary_key=True)
    recipe_id = Column(BigInteger, ForeignKey("recipes.id", ondelete="CASCADE"))

    step_number = Column(Integer, nullable=False)
    instruction = Column(Text, nullable=False)
    estimated_minutes = Column(Integer)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    recipe = relationship("Recipe", back_populates="steps")
