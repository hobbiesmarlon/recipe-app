from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text, delete
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.exc import IntegrityError
from app.core.db import get_db
from app.models.recipe import Recipe
from app.models.recipe_ingredient import RecipeIngredient
from app.models.recipe_step import RecipeStep
from app.models.category import Category
from app.models.recipe_like import RecipeLike
from app.models.saved_recipe import UserSavedRecipe
from app.models.recipe_category import RecipeCategory
from app.models.category_group import CategoryGroup
from app.schemas.recipe import RecipeCreate, RecipeRead, RecipeUpdate
from app.schemas.ingredient import IngredientRead
from app.api.deps import get_current_user, get_optional_current_user
from app.models.user import User
from app.core.config import settings
from app.services.ingredient_matcher import mock_match_ingredient
from app.schemas.recipe import PaginatedRecipes
from app.schemas.media import RecipeMediaRead

from app.schemas.recipe import RecipeCreateWithMedia
from app.models.recipe_media import RecipeMedia, StorageProvider, MediaType
from app.services.recipe_validation import validate_publishable, validate_media_upload
from app.services.media_processing import process_recipe_media
from app.services.media_cleanup import cleanup_media_files
from app.tasks.media import process_recipe_media_task
from botocore.exceptions import ClientError
from app.services.storage_service import head_object

router = APIRouter()

@router.post("", response_model=RecipeRead)
async def create_recipe(
    data: RecipeCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Create recipe
    recipe = Recipe(
        user_id=user.id,
        name=data.name,
        description=data.description,
        chefs_note=data.chefs_note,
        cook_time_minutes=data.cook_time_minutes,
        servings=data.servings,
        is_public=data.is_public,
    )
    db.add(recipe)
    await db.flush()  # Ensure recipe.id is available

    # Batch ingredients
    recipe_ingredients = []
    for ing in data.ingredients:
        ingredient_id = await mock_match_ingredient(ing.name_text)
        recipe_ingredients.append(
            RecipeIngredient(
                recipe_id=recipe.id,
                ingredient_id=ingredient_id,
                **ing.dict()
            )
        )
    db.add_all(recipe_ingredients)

    # Batch steps
    recipe_steps = [RecipeStep(recipe_id=recipe.id, **step.dict()) for step in data.steps]
    db.add_all(recipe_steps)

    # Categories
    if data.category_ids:
        result = await db.execute(
            select(Category).where(Category.id.in_(data.category_ids))
        )
        recipe.categories = result.scalars().all()

    await db.commit()
    # Return fully populated recipe
    return await get_recipe(recipe.id, db, user=user)

@router.get("", response_model=PaginatedRecipes)
async def list_recipes(
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, le=100),
    category_ids: Optional[List[int]] = Query(None),
    max_cook_time: Optional[int] = Query(None, alias="maxTime"),
    search: Optional[str] = Query(None),
    author_id: Optional[int] = Query(None),
):
    stmt = select(Recipe).options(
        selectinload(Recipe.ingredients).joinedload(RecipeIngredient.unit),
        selectinload(Recipe.steps),
        selectinload(Recipe.categories),
        selectinload(Recipe.media),
        joinedload(Recipe.author),
    )

    # Filter by author
    if author_id:
        stmt = stmt.where(Recipe.user_id == author_id)

    # Filter by categories
    if category_ids:
        stmt = stmt.join(Recipe.categories).where(Category.id.in_(category_ids))

    # Filter by cook time
    if max_cook_time is not None:
        stmt = stmt.where(Recipe.cook_time_minutes <= max_cook_time)

    # Full-text search on name + description
    if search:
        search = search.strip()
        stmt = stmt.where(
            text(
                "to_tsvector('english', coalesce(recipes.name, '') || ' ' || "
                "coalesce(recipes.description, '')) @@ plainto_tsquery(:q)" 
                 )
        ).params(q=search)

    # Total count for pagination
    # pylint: disable=not-callable
    total_stmt = select(func.count('*')).select_from(stmt.subquery())
    total_result = await db.execute(total_stmt)
    total = total_result.scalar() or 0

    # Pagination
    stmt = stmt.order_by(Recipe.created_at.desc())
    stmt = stmt.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(stmt)
    recipes = result.scalars().unique().all()

    # Sort media for each recipe
    for r in recipes:
        r.media.sort(key=lambda m: (not m.is_primary, m.display_order))

    # Fetch likes/saves status
    recipe_ids = [r.id for r in recipes]
    liked_ids = set()
    saved_ids = set()
    likes_counts = {}

    if recipe_ids:
        count_stmt = select(RecipeLike.recipe_id, func.count('*')).where(RecipeLike.recipe_id.in_(recipe_ids)).group_by(RecipeLike.recipe_id)
        count_result = await db.execute(count_stmt)
        likes_counts = {r_id: count for r_id, count in count_result.all()}

        if user:
            like_stmt = select(RecipeLike.recipe_id).where(RecipeLike.user_id == user.id, RecipeLike.recipe_id.in_(recipe_ids))
            like_result = await db.execute(like_stmt)
            liked_ids = set(like_result.scalars().all())

            save_stmt = select(UserSavedRecipe.recipe_id).where(UserSavedRecipe.user_id == user.id, UserSavedRecipe.recipe_id.in_(recipe_ids))
            save_result = await db.execute(save_stmt)
            saved_ids = set(save_result.scalars().all())

    return PaginatedRecipes(
        total=total,
        page=page,
        per_page=per_page,
        recipes=[
            RecipeRead(
                id=r.id,
                name=r.name,
                description=r.description,
                chefs_note=r.chefs_note,
                cook_time_minutes=r.cook_time_minutes,
                servings=r.servings,
                is_public=r.is_public,
                author_name=r.author.display_name if r.author else "Anonymous",
                ingredients=[
                    IngredientRead(
                        id=ing.id,
                        ingredient_id=ing.ingredient_id,
                        name_text=ing.name_text,
                        quantity=float(ing.quantity) if ing.quantity else None,
                        quantity_text=ing.quantity_text,
                        unit_id=ing.unit_id,
                        unit_name=ing.unit.name if ing.unit else None,
                        preparation_notes=ing.preparation_notes,
                        display_order=ing.display_order
                    ) for ing in r.ingredients
                ],
                steps=r.steps,
                categories=[c.name for c in r.categories],
                media=r.media,
                is_liked=(r.id in liked_ids),
                is_saved=(r.id in saved_ids),
                likes_count=likes_counts.get(r.id, 0),
            )
            for r in recipes
        ]
    )


@router.get("/{recipe_id}", response_model=RecipeRead)
async def get_recipe(
    recipe_id: int, 
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_current_user)
):
    result = await db.execute(
        select(Recipe)
        .options(
            selectinload(Recipe.ingredients).joinedload(RecipeIngredient.unit),
            selectinload(Recipe.steps),
            selectinload(Recipe.categories),
            selectinload(Recipe.media),
            joinedload(Recipe.author),
        )
        .where(Recipe.id == recipe_id)
    )
    recipe = result.scalars().first()
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    # Sort media
    recipe.media.sort(key=lambda m: (not m.is_primary, m.display_order))

    # Fetch stats
    count_stmt = select(func.count('*')).where(RecipeLike.recipe_id == recipe_id)
    likes_count = (await db.execute(count_stmt)).scalar() or 0

    is_liked = False
    is_saved = False
    if user:
        is_liked = (await db.execute(select(RecipeLike).where(RecipeLike.user_id == user.id, RecipeLike.recipe_id == recipe_id))).scalars().first() is not None
        is_saved = (await db.execute(select(UserSavedRecipe).where(UserSavedRecipe.user_id == user.id, UserSavedRecipe.recipe_id == recipe_id))).scalars().first() is not None

    return RecipeRead(
        id=recipe.id,
        name=recipe.name,
        description=recipe.description,
        chefs_note=recipe.chefs_note,
        cook_time_minutes=recipe.cook_time_minutes,
        servings=recipe.servings,
        is_public=recipe.is_public,
        author_name=recipe.author.display_name if recipe.author else "Anonymous",
        ingredients=[
            IngredientRead(
                id=ing.id,
                ingredient_id=ing.ingredient_id,
                name_text=ing.name_text,
                quantity=float(ing.quantity) if ing.quantity else None,
                quantity_text=ing.quantity_text,
                unit_id=ing.unit_id,
                unit_name=ing.unit.name if ing.unit else None,
                preparation_notes=ing.preparation_notes,
                display_order=ing.display_order
            ) for ing in recipe.ingredients
        ],
        steps=recipe.steps,
        categories=[c.name for c in recipe.categories],
        media=recipe.media,
        is_liked=is_liked,
        is_saved=is_saved,
        likes_count=likes_count,
    )

@router.patch("/{recipe_id}", response_model=RecipeRead)
async def update_recipe(
    recipe_id: int,
    data: RecipeUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    recipe = await db.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    if recipe.user_id != user.id:
        raise HTTPException(403, "Not authorized")

    publish_requested = False

    # Update basic fields
    for field, value in data.dict(exclude_unset=True).items():
        if field in {"ingredients", "steps", "category_ids"}:
            continue
        if field == "is_public" and value is True:
            publish_requested = True
        setattr(recipe, field, value)

    # Replace ingredients
    if data.ingredients is not None:
        await db.execute(
            RecipeIngredient.__table__.delete().where(
                RecipeIngredient.recipe_id == recipe.id
            )
        )
        recipe_ingredients = []
        for ing in data.ingredients:
            ingredient_id = await mock_match_ingredient(ing.name_text)
            recipe_ingredients.append(
                RecipeIngredient(
                    recipe_id=recipe.id,
                    ingredient_id=ingredient_id,
                    **ing.dict(),
                )
            )
        db.add_all(recipe_ingredients)

    # Replace steps
    if data.steps is not None:
        await db.execute(
            RecipeStep.__table__.delete().where(
                RecipeStep.recipe_id == recipe.id
            )
        )
        recipe_steps = [
            RecipeStep(recipe_id=recipe.id, **step.dict())
            for step in data.steps
        ]
        db.add_all(recipe_steps)

    # Update categories
    if data.category_ids is not None:
        result = await db.execute(
            select(Category).where(Category.id.in_(data.category_ids))
        )
        recipe.categories = result.scalars().all()

    # ✅ Enforce publish rules only if publishing
    if publish_requested:
        await db.refresh(recipe)
        validate_publishable(recipe)

    await db.commit()
    return await get_recipe(recipe.id, db, user=user)

@router.delete("/{recipe_id}", status_code=204)
async def delete_recipe(
    recipe_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    recipe = await db.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(404)

    if recipe.user_id != user.id:
        raise HTTPException(403)

    media_keys = []
    for media in recipe.media:
        media_keys.extend([
            media.key,
            media.thumbnail_small_key,
            media.thumbnail_medium_key,
            media.thumbnail_large_key,
        ])
    
    if media_keys:
        background_tasks.add_task(cleanup_media_files, media_keys)

    await db.delete(recipe)
    await db.commit()

# --- INTERACTIONS ---

@router.post("/{recipe_id}/like", status_code=201)
async def like_recipe(
    recipe_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    recipe = await db.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    try:
        like = RecipeLike(user_id=user.id, recipe_id=recipe_id)
        db.add(like)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        # Already liked is fine
    
    return {"status": "liked"}

@router.delete("/{recipe_id}/like", status_code=204)
async def unlike_recipe(
    recipe_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await db.execute(
        delete(RecipeLike).where(
            RecipeLike.user_id == user.id,
            RecipeLike.recipe_id == recipe_id
        )
    )
    await db.commit()

@router.post("/{recipe_id}/save", status_code=201)
async def save_recipe(
    recipe_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    recipe = await db.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    try:
        save = UserSavedRecipe(user_id=user.id, recipe_id=recipe_id)
        db.add(save)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        # Already saved is fine
    
    return {"status": "saved"}

@router.delete("/{recipe_id}/save", status_code=204)
async def unsave_recipe(
    recipe_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await db.execute(
        delete(UserSavedRecipe).where(
            UserSavedRecipe.user_id == user.id,
            UserSavedRecipe.recipe_id == recipe_id
        )
    )
    await db.commit()

@router.post("/with-media", response_model=dict)
async def create_recipe_with_media(
    data: RecipeCreateWithMedia,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # ✅ Validate media against env-based limits
    validate_media_upload([m.dict() for m in data.media])

    images = [m for m in data.media if m.type == "image"]

    if not images:
        raise HTTPException(400, "At least one image is required")

    # Ensure a primary image exists
    if not any(m.is_primary for m in images):
        images[0].is_primary = True

    recipe = Recipe(
        user_id=user.id,
        name=data.name,
        description=data.description,
        chefs_note=data.chefs_note,
        cook_time_minutes=data.cook_time_minutes,
        servings=data.servings,
        is_public=data.is_public,
    )
    db.add(recipe)
    await db.flush()

    # --- CATEGORY RESOLUTION ---
    if data.category_ids:
        # Use simple ID resolution without creating new categories
        for cat_id in data.category_ids:
            # We don't verify if ID exists here for speed, assuming FK constraint handles validity
            # But we must insert into association table manually to avoid lazy load issues
            db.add(RecipeCategory(recipe_id=recipe.id, category_id=cat_id))

    # Ingredients
    for ing in data.ingredients:
        ingredient_id = await mock_match_ingredient(ing.name_text)
        db.add(
            RecipeIngredient(
                recipe_id=recipe.id,
                ingredient_id=ingredient_id,
                **ing.dict(),
            )
        )

    # Steps
    for step in data.steps:
        db.add(RecipeStep(recipe_id=recipe.id, **step.dict()))

    # Media
    for m in data.media:
        try:
            # 🔍 Verify object exists in MinIO/S3 and get metadata
            metadata = head_object(m.key)
        except ClientError:
            raise HTTPException(400, f"Media file not found in storage: {m.key}")

        media = RecipeMedia(
            recipe_id=recipe.id,
            recipe_uuid=recipe.uuid,
            key=m.key,
            object_key=m.key,
            bucket=settings.MEDIA_BUCKET_NAME,
            storage_provider=StorageProvider.MINIO,  # Use enum member (value="minio")
            media_type=MediaType(m.type),
            content_type=metadata.get("ContentType", "application/octet-stream"),
            size_bytes=metadata.get("ContentLength", 0),
            type=m.type,
            is_primary=m.is_primary,
            display_order=m.display_order,
        )
        db.add(media)
        await db.flush()

        process_recipe_media_task.delay(media.id)

    await db.commit()  # Move outside the context manager

    return {
        "id": recipe.id,
        "uuid": recipe.uuid,
        "media_count": len(data.media),
    }