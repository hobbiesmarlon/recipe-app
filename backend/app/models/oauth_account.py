import enum
from sqlalchemy import Column, BigInteger, Text, TIMESTAMP, Enum, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.core.db import Base, TimestampMixin

class OAuthProvider(str, enum.Enum):
    X = "x"
    GOOGLE = "google"

class OAuthAccount(Base, TimestampMixin):
    __tablename__ = "oauth_accounts"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    provider = Column(Enum(OAuthProvider, native_enum=False), nullable=False)
    provider_user_id = Column(Text, nullable=False)

    provider_username = Column(Text)
    provider_display_name = Column(Text)
    provider_profile_pic_url = Column(Text)

    access_token = Column(Text)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(TIMESTAMP(timezone=True))

    __table_args__ = (
        UniqueConstraint('provider', 'provider_user_id', name='uq_provider_user'),
        Index('idx_oauth_userid', 'user_id'),
        {"sqlite_autoincrement": True},
    )

    user = relationship("User", back_populates="oauth_accounts")
