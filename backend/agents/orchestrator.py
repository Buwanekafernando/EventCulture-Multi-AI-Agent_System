from fastapi import APIRouter
from agents.event_collector import router as collector_router
from agents.nlp_agent import router as nlp_router
from router.rec_agent import router as recommender_router
from agents.location_agent import router as location_router

router = APIRouter()

#event collector agent
router.include_router(collector_router, prefix="/collector")



# Location Agent
router.include_router(location_router, prefix="/location")

