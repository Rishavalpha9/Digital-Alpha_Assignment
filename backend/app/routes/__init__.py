from fastapi import APIRouter

from app.routes.analytics import router as analytics_router
from app.routes.rewards import router as rewards_router
from app.routes.transactions import router as transactions_router

api_router = APIRouter()
api_router.include_router(transactions_router)
api_router.include_router(analytics_router)
api_router.include_router(rewards_router)
