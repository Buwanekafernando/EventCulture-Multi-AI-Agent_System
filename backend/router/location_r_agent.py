from fastapi import APIRouter, HTTPException
from urllib.parse import quote
from db.database import SessionLocal
from db.models import Event
from agents.location_agent import refine_location_with_llm
from schema.location import LocationResponse  

router = APIRouter()

@router.get("/locate-event/{event_id}", response_model=LocationResponse)
def locate_event(event_id: int):
    db = SessionLocal()
    event = db.query(Event).filter(Event.id == event_id).first()
    db.close()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    raw_location = event.location or ""
    description = event.description or ""
    is_physical = True  

    if not is_physical:
        return LocationResponse(
            cleaned_location="Virtual Event",
            map_url="",
            embed_url=""
        )

    cleaned_location = refine_location_with_llm(raw_location, description)
    encoded_location = quote(cleaned_location)

    map_url = f"https://www.google.com/maps/search/?api=1&query={encoded_location}"
    embed_url = f"https://www.google.com/maps/embed/v1/search?key=YOUR_GOOGLE_MAPS_API_KEY&q={encoded_location}"

    return LocationResponse(
        cleaned_location=cleaned_location,
        map_url=map_url,
        embed_url=embed_url
    )