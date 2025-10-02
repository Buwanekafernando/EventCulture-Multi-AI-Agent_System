from fastapi import FastAPI
#<<<<<<< agent-praneepa
#=======
#<<<<<<< agent-savindi
#>>>>>>> main
from router import event
from auth.google_auth import router as auth_router
from agents.orchestrator import router as orchestrator_router  
from db.database import Base, engine


app = FastAPI()


app.include_router(orchestrator_router, prefix="/api")
app.include_router(auth_router, prefix="/auth")
app.include_router(event.router)


#<<<<<<< agent-praneepa
Base.metadata.create_all(bind=engine)
#=======
Base.metadata.create_all(bind=engine)
#=======
from agents.orchestrator import router as orchestrator_router
from auth.google_oauth import router as auth_router

app = FastAPI()

app.include_router(orchestrator_router, prefix="/api")
app.include_router(auth_router, prefix="/auth")
#>>>>>>> main
#>>>>>>> main
