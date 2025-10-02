from fastapi import APIRouter
from schema.event_agent_s import EventCreate, EventOut
from agents.event_collector import insert_single_event
from db.database import SessionLocal
from db.models import Event

router = APIRouter()


@router.post("/events/", response_model=EventOut)
def create_event(event: EventCreate):
    event_dict = event.dict()
    saved_event = insert_single_event(event_dict)
    return saved_event #send one event to the frontend

@router.get("/events/", response_model=list[EventOut])
def list_events():
    db = SessionLocal()
    events = db.query(Event).all()
    db.close()
    return events #all event to  the frontend
