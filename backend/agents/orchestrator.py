from fastapi import APIRouter
from router.event_agent_r import router as collector_router
from router.nlp_agent_r import router as nlp_router
from router.rec_agent_r import router as recommender_router
from router.location_agent_r import router as location_router
from router.analysis_agent_r import router as analysis_router

# Create a router for the orchestrator
router = APIRouter()

router.include_router(collector_router, prefix="/collector")

router.include_router(nlp_router, prefix="/nlp")

router.include_router(recommender_router, prefix="/recommend")

router.include_router(location_router, prefix="/location")

router.include_router(analysis_router, prefix="/analytics")

