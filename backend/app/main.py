from fastapi import FastAPI
from app.api.v1.router import api_router
from app.api.v1.auth import router as auth_router
from app.api.v1.recipes import router as recipes_router
from app.api.v1.media import router as media_router

app = FastAPI(title="Recipe App API")

app.include_router(api_router, prefix="/users", tags=["Users"])
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(recipes_router, prefix="/recipes", tags=["Recipes"])
app.include_router(media_router, prefix="/media", tags=["Media"])
