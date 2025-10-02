import os
from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
from fastapi import Request



from auth.google_auth import router as google_auth_router

from agents.orchestrator import router as orchestrator_router  
from db.database import Base, engine

load_dotenv()

app = FastAPI()


app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("JWT_SECRET") or "super-secret-key"
)

@app.get("/session-test")#test the middleware works
async def session_test(request: Request):
    request.session["test_key"] = "test_value"
    return {"session_value": request.session.get("test_key")}


app.include_router(google_auth_router)

app.include_router(orchestrator_router, prefix="/api")



Base.metadata.create_all(bind=engine) #create table if not exist

@app.get("/")
def read_root():
    return {"message": "EventCulture backend is running  "}


