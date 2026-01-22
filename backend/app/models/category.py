from sqlalchemy import Column, BigInteger, Text, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.db import Base, TimestampMixin

class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    __table_args__ = (
        Index('idx_categories_group', 'group_id'),
        UniqueConstraint('group_id', 'name', name='uq_category_group_name'),
    )

    id = Column(BigInteger, primary_key=True)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=True)

    group_id = Column(
        BigInteger,
        ForeignKey("category_groups.id", ondelete="CASCADE"),
        nullable=False,
    )

    group = relationship("CategoryGroup", back_populates="categories")
