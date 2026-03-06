from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.db import get_db
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse, PresignedUrlResponse
from app.api.deps import get_current_user
from app.services import storage_service
import uuid
import json

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return user

@router.patch("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    # Prevent updates if sourced from provider (double check, though frontend disables inputs)
    if user_update.username is not None:
        if user.username_sourced_from_provider:
             raise HTTPException(status_code=400, detail="Username is managed by your login provider.")
        # Check uniqueness if changing
        if user_update.username != user.username:
            result = await db.execute(select(User).where(User.username == user_update.username))
            if result.scalars().first():
                raise HTTPException(status_code=400, detail="Username already taken.")
            user.username = user_update.username

    if user_update.display_name is not None:
        if user.display_name_sourced_from_provider:
             raise HTTPException(status_code=400, detail="Display name is managed by your login provider.")
        user.display_name = user_update.display_name

    if user_update.profile_picture_url is not None:
        if user.profile_pic_sourced_from_provider:
             raise HTTPException(status_code=400, detail="Profile picture is managed by your login provider.")
        user.profile_picture_url = user_update.profile_picture_url

    await db.commit()
    await db.refresh(user)
    return user

@router.post("/me/profile-picture-upload-url", response_model=PresignedUrlResponse)
async def get_profile_upload_url(
    file_type: str = Body(..., embed=True),
    user: User = Depends(get_current_user)
):
    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    if file_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only .jpg, .jpeg, and .png files are allowed.")

    file_extension = file_type.split("/")[-1]
    if file_extension == "jpeg": file_extension = "jpg"
    
    # Generate a unique filename
    filename = f"user_{user.id}_{uuid.uuid4().hex[:8]}.{file_extension}"
    
    # Use the specific profile picture bucket
    bucket_name = settings.PROFILE_PICTURE_BUCKET_NAME
    
    # Create bucket if not exists and ensure policy
    try:
        try:
            storage_service.s3_client.head_bucket(Bucket=bucket_name)
        except:
            storage_service.s3_client.create_bucket(Bucket=bucket_name)
            
        # Always enforce public read policy to fix existing private buckets
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicRead",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
                }
            ]
        }
        storage_service.s3_client.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(policy)
        )
    except Exception as e:
        print(f"Failed to ensure bucket policy for {bucket_name}: {e}")

    presigned = storage_service.generate_presigned_post(
        key=filename,
        content_type=file_type,
        max_size_bytes=5 * 1024 * 1024, # 5MB limit
        bucket_name=bucket_name
    )
    
    # Calculate public URL
    base_url = settings.MEDIA_PUBLIC_BASE_URL
    default_bucket = settings.MEDIA_BUCKET_NAME
    
    if base_url.endswith(f"/{default_bucket}"):
        base_url = base_url[:-len(default_bucket)] + bucket_name
        
    public_url = f"{base_url}/{filename}"
    
    return PresignedUrlResponse(url=presigned["url"], fields=presigned["fields"], public_url=public_url)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user
