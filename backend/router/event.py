from fastapi import APIRouter
from schema.event import EventCreate, EventOut
from agents.event_collector import collect_event

router = APIRouter()

@router.post("/events/", response_model=EventOut)
def create_event(event: EventCreate):
    event_dict = event.dict()
    saved_event = collect_event(event_dict)
    return saved_event

