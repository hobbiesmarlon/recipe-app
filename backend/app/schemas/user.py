from pydantic import BaseModel, HttpUrl
from typing import Optional

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    username: Optional[str] = None
    profile_picture_url: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    display_name: str
    profile_picture_url: Optional[str] = None
    username_sourced_from_provider: bool
    display_name_sourced_from_provider: bool
    profile_pic_sourced_from_provider: bool

    class Config:
        from_attributes = True

class PresignedUrlResponse(BaseModel):
    url: str
    fields: dict
    public_url: str
