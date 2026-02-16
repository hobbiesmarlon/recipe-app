from sqlalchemy import Column, BigInteger, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.db import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True)
    username = Column(Text, nullable=False)
    display_name = Column(Text, nullable=False)
    profile_picture_url = Column(Text, nullable=True)

    username_sourced_from_provider = Column(Boolean, default=True)
    display_name_sourced_from_provider = Column(Boolean, default=True)
    profile_pic_sourced_from_provider = Column(Boolean, default=True)
    email = Column(Text, unique=True, nullable=True)

    # Relationship to OAuthAccount
    oauth_accounts = relationship(
        "OAuthAccount",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    recipes = relationship("Recipe", back_populates="author", cascade="all, delete-orphan")
