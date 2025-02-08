from fastapi import APIRouter
from backend.api.auth import router as auth_router
from backend.api.routes import router as routes_router

api_blueprint = APIRouter()
api_blueprint.include_router(auth_router, prefix="/auth", tags=["auth"])
api_blueprint.include_router(routes_router, prefix="", tags=["routes"])
