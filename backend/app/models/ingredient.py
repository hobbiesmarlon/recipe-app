from app.core.db import Base, TimestampMixin
from sqlalchemy import Column, BigInteger, Text, ForeignKey, Index, text, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class Ingredient(Base, TimestampMixin):
    __tablename__ = "ingredients"

    __table_args__ = (
        Index('idx_ingredient_name_lower', text("lower(name)")),
        Index('idx_ingredients_base', 'base_ingredient_id'),
    )

    id = Column(BigInteger, primary_key=True)
    name = Column(Text, unique=True, nullable=False)
    base_ingredient_id = Column(BigInteger, ForeignKey("ingredients.id", ondelete="SET NULL"))
    description = Column(Text)

    # Self-referential relationship for base ingredients
    parent_ingredient = relationship(
        "Ingredient",
        remote_side=[id],
        back_populates="variants",
        foreign_keys=[base_ingredient_id]
    )

    variants = relationship(
        "Ingredient",
        back_populates="parent_ingredient",
        cascade="all, delete-orphan"
    )
    aliases = relationship("IngredientAlias", back_populates="ingredient")

class IngredientAlias(Base):
    __tablename__ = "ingredient_aliases"

    __table_args__ = (
        Index('idx_ingredient_alias_lower', text("lower(alias_text)")),
        Index('idx_aliases_canonical', 'canonical_ingredient_id'),
    )

    alias_text = Column(Text, primary_key=True)
    canonical_ingredient_id = Column(BigInteger, ForeignKey("ingredients.id", ondelete="CASCADE"),
                                     nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    ingredient = relationship("Ingredient", back_populates="aliases")
