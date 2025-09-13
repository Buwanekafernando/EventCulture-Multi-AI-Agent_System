from fastapi import FastAPI
from router import event
from auth.google_auth import router as auth_router
from db.database import Base, engine

app = FastAPI()

app.include_router(orchestrator_router, prefix="/api")
app.include_router(auth_router, prefix="/auth")

#database initialize
Base.metadata.create_all(bind=engine)



app = FastAPI()
app.include_router(event.router)
