from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.db import get_db
from app.models.recipe import Recipe
from app.core.config import settings

from app.models.user import User

router = APIRouter(prefix="/share", tags=["Share"])

@router.get("/user/{user_id}", response_class=HTMLResponse)
async def share_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch User
    user = await db.get(User, user_id)
    
    if not user:
        return HTMLResponse(content="<h1>User not found</h1>", status_code=404)

    # 2. Prepare Meta Data
    display_name = user.display_name
    username = user.username or "user"
    title = f"{display_name} (@{username}) on Recipe App"
    description = f"Check out {display_name}'s recipes and profile!"
    
    # Profile Picture or Fallback
    image_url = user.profile_picture_url or "https://via.placeholder.com/1200x630?text=No+Profile+Pic"

    # 3. Construct Frontend Redirect URL
    frontend_base = settings.FRONTEND_URL or "http://localhost:5173"
    redirect_url = f"{frontend_base.rstrip('/')}/u/{user.id}"

    # 4. Generate HTML with OG Tags
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>{title}</title>
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="profile" />
        <meta property="og:url" content="{redirect_url}" />
        <meta property="og:title" content="{title}" />
        <meta property="og:description" content="{description}" />
        <meta property="og:image" content="{image_url}" />

        <!-- Twitter -->
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content="{redirect_url}" />
        <meta property="twitter:title" content="{title}" />
        <meta property="twitter:description" content="{description}" />
        <meta property="twitter:image" content="{image_url}" />
        
        <!-- Redirect for humans -->
        <script>
            window.location.href = "{redirect_url}";
        </script>
    </head>
    <body>
        <h1>{title}</h1>
        <p>{description}</p>
        <img src="{image_url}" alt="{title}" style="max-width: 100%; height: auto;" />
        <p>Redirecting to profile...</p>
        <a href="{redirect_url}">Click here if you are not redirected</a>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content)

@router.get("/recipe/{recipe_id}", response_class=HTMLResponse)
async def share_recipe(
    recipe_id: int, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch Recipe
    result = await db.execute(
        select(Recipe)
        .options(selectinload(Recipe.media))
        .where(Recipe.id == recipe_id)
    )
    recipe = result.scalars().first()
    
    if not recipe:
        return HTMLResponse(content="<h1>Recipe not found</h1>", status_code=404)

    # 2. Prepare Meta Data
    title = recipe.name
    description = recipe.description or f"Check out this delicious {recipe.name} recipe!"
    
    # Find primary image, or first image, or fallback
    image_url = "https://via.placeholder.com/1200x630?text=No+Image"
    
    # Sort media to prioritize primary
    sorted_media = sorted(recipe.media, key=lambda m: (not m.is_primary, m.display_order))
    
    # Find first image
    for m in sorted_media:
        if m.type == "image":
            # Assuming m.url is a property or we construct it. 
            # In your API logic you usually construct it or it's a property on the model?
            # Let's check how it's done in schemas.media.py or recipes.py
            # Usually it depends on your storage (S3/MinIO)
            # If `m.url` isn't a DB column, we might need to construct it.
            # Based on previous file reads, `RecipeMedia` usually has a computed `url`.
            # If not, we use MEDIA_PUBLIC_BASE_URL.
            
            if hasattr(m, 'url') and m.url:
                 image_url = m.url
            elif m.object_key:
                 # Fallback construction
                 base = settings.MEDIA_PUBLIC_BASE_URL.rstrip('/')
                 image_url = f"{base}/{m.object_key}"
            break

    # 3. Construct Frontend Redirect URL
    # If FRONTEND_URL is set, use it. Otherwise default to localhost.
    frontend_base = settings.FRONTEND_URL or "http://localhost:5173"
    redirect_url = f"{frontend_base.rstrip('/')}/recipe/{recipe.id}"

    # 4. Generate HTML with OG Tags
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>{title}</title>
        
        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="article" />
        <meta property="og:url" content="{redirect_url}" />
        <meta property="og:title" content="{title}" />
        <meta property="og:description" content="{description}" />
        <meta property="og:image" content="{image_url}" />

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="{redirect_url}" />
        <meta property="twitter:title" content="{title}" />
        <meta property="twitter:description" content="{description}" />
        <meta property="twitter:image" content="{image_url}" />
        
        <!-- Redirect for humans -->
        <script>
            window.location.href = "{redirect_url}";
        </script>
    </head>
    <body>
        <h1>{title}</h1>
        <p>{description}</p>
        <img src="{image_url}" alt="{title}" style="max-width: 100%; height: auto;" />
        <p>Redirecting to recipe...</p>
        <a href="{redirect_url}">Click here if you are not redirected</a>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content)
