from fastapi import FastAPI
from agents.orchestrator import router as orchestrator_router
from auth.google_oauth import router as auth_router

app = FastAPI()

app.include_router(orchestrator_router, prefix="/api")
app.include_router(auth_router, prefix="/auth")