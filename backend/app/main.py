from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.users import router as users_router
from app.api.v1.auth import router as auth_router
from app.api.v1.recipes import router as recipes_router
from app.api.v1.media import router as media_router

app = FastAPI(title="Recipe App API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://192.168.100.190:3000",
    "http://192.168.100.190",
    "http://192.168.100.190:3000",
    "http://192.168.100.190:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(auth_router) # auth_router already has prefix /auth
app.include_router(recipes_router, prefix="/recipes", tags=["Recipes"])
app.include_router(media_router) # media_router already has prefix /media
