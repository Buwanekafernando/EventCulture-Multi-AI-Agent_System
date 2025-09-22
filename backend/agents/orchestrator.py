from fastapi import APIRouter
from agents.event_collector import router as collector_router


router = APIRouter()

#event collector agent
router.include_router(collector_router, prefix="/collector")


