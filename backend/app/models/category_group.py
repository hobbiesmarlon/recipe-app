from sqlalchemy import Column, BigInteger, Text
from sqlalchemy.orm import relationship
from app.core.db import Base, TimestampMixin

class CategoryGroup(Base, TimestampMixin):
    __tablename__ = "category_groups"

    id = Column(BigInteger, primary_key=True)
    name = Column(Text, nullable=False, unique=True)
    description = Column(Text)


    categories = relationship(
        "Category",
        back_populates="group",
        cascade="all, delete-orphan",
    )
