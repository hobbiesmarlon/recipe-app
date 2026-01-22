from typing import List, Optional
from pydantic import BaseModel, Field
from .ingredient import IngredientCreate, IngredientRead
from .step import StepCreate, StepRead
from .media import RecipeMediaRead

class RecipeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    cook_time_minutes: Optional[int] = None
    servings: Optional[int] = None
    is_public: bool = True
    category_ids: List[int] = Field([], alias="categories")
    ingredients: List[IngredientCreate]
    steps: List[StepCreate]

class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cook_time_minutes: Optional[int] = None
    servings: Optional[int] = None
    is_public: Optional[bool] = None
    category_ids: Optional[List[int]] = Field(None, alias="categories")
    ingredients: Optional[List[IngredientCreate]] = None
    steps: Optional[List[StepCreate]] = None

class RecipeRead(BaseModel):
    id: int
    name: str
    description: Optional[str]
    cook_time_minutes: Optional[int]
    servings: Optional[int]
    is_public: bool

    ingredients: List[IngredientRead]
    steps: List[StepRead]
    categories: List[str]
    media: List[RecipeMediaRead]

    class Config:
        from_attributes = True

class RecipeListItem(BaseModel):
    id: int
    name: str
    description: Optional[str]
    cook_time_minutes: Optional[int]
    servings: Optional[int]
    is_public: bool

    class Config:
        from_attributes = True


class PaginatedRecipeList(BaseModel):
    page: int
    limit: int
    total: int
    items: List[RecipeListItem]

class PaginatedRecipes(BaseModel):
    total: int
    page: int
    per_page: int
    recipes: List[RecipeRead]

class RecipeMediaCreate(BaseModel):
    key: str           # the key returned by presigned URL
    type: str          # "image" or "video"
    is_primary: Optional[bool] = False
    display_order: Optional[int] = 0
    content_type: Optional[str] = None  # MIME type for validation

class RecipeCreateWithMedia(BaseModel):
    name: str
    description: Optional[str] = None
    cook_time_minutes: Optional[int] = Field(None, ge=0)
    servings: Optional[int] = Field(None, ge=1)
    is_public: bool = True
    category_ids: Optional[List[int]] = Field([], alias="categories")
    ingredients: List[IngredientCreate]  # keep same as before
    steps: List[StepCreate]        # keep same as before
    media: List[RecipeMediaCreate]
