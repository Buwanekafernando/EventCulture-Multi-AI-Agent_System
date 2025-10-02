from fastapi import APIRouter
from agents.event_collector import router as collector_router
from agents.nlp_agent import router as nlp_router

router = APIRouter()

#event collector agent
router.include_router(collector_router, prefix="/collector")

#<<<<<<< agent-praneepa

router.include_router(recommender_router, prefix="/recommend")
#=======
#nlp agent
router.include_router(nlp_router, prefix="/nlp")
#>>>>>>> main
