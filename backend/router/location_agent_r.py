from fastapi import APIRouter, HTTPException, Depends
from urllib.parse import quote
from db.database import SessionLocal
from db.models import Event
from agents.location_agent import get_location_data, refine_location_with_llm, get_directions
from schema.location_agent_s import LocationResponse, OpenLayersLocationResponse
from auth.google_auth import get_current_user  
import os

router = APIRouter()

@router.get("/locate-event/{event_id}", response_model=LocationResponse)
def locate_event(event_id: int, current_user: dict = Depends(get_current_user)):
    """Get location data for Google Maps integration."""
    db = SessionLocal()
    event = db.query(Event).filter(Event.id == event_id).first()
    db.close()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found") 

    raw_location = event.location or ""
    description = event.description or ""
    user_tier = current_user.get("tier", "free")

    location_data = get_location_data(raw_location, description, user_tier)
    
    if location_data["is_virtual"]:
        return LocationResponse(
            cleaned_location="Virtual Event",
            map_url="",
            embed_url=""
        )

    cleaned_location = location_data["location_name"]
    encoded_location = quote(cleaned_location)

    map_url = f"https://www.google.com/maps/search/?api=1&query={encoded_location}"
    
    # Use environment variable for Google Maps API key
    maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY", "GOOGLE_MAPS_API_KEY")
    embed_url = f"https://www.google.com/maps/embed/v1/search?key={maps_api_key}&q={encoded_location}"

    return LocationResponse(
        cleaned_location=cleaned_location,
        map_url=map_url,
        embed_url=embed_url
    )

@router.get("/openlayers-location/{event_id}", response_model=OpenLayersLocationResponse)
def get_openlayers_location(event_id: int, current_user: dict = Depends(get_current_user)):
    """Get location data optimized for OpenLayers mapping."""
    db = SessionLocal()
    event = db.query(Event).filter(Event.id == event_id).first()
    db.close()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found") 

    raw_location = event.location or ""
    description = event.description or ""
    user_tier = current_user.get("tier", "free")

    location_data = get_location_data(raw_location, description, user_tier)
    
    return OpenLayersLocationResponse(
        is_virtual=location_data["is_virtual"],
        location_name=location_data["location_name"],
        coordinates=location_data["coordinates"],
        map_center=location_data["map_center"],
        zoom_level=location_data["zoom_level"]
    )

@router.get("/events-map")
def get_events_map_data(current_user: dict = Depends(get_current_user)):
    """Get all events with location data for map display."""
    db = SessionLocal()
    events = db.query(Event).all()
    db.close()

    events_data = []
    for event in events:
        location_data = get_location_data(event.location or "", event.description or "")
        
        events_data.append({
            "event_id": event.id,
            "event_name": event.event_name,
            "location_name": location_data["location_name"],
            "is_virtual": location_data["is_virtual"],
            "coordinates": location_data["coordinates"],
            "date": event.date.isoformat() if event.date else None,
            "event_type": event.event_type,
            "sentiment": event.sentiment
        })
    
    return {
        "events": events_data,
        "map_center": {"lat": 7.8731, "lon": 80.7718},  # Sri Lanka center
        "zoom_level": 7
    }

@router.get("/directions")
def get_directions_endpoint(
    from_location: str, 
    to_location: str, 
    travel_mode: str = "driving",
    current_user: dict = Depends(get_current_user)
):
    """Get directions between two locations (Pro feature only)."""
    user_tier = current_user.get("tier", "free")
    
    if user_tier != "pro":
        raise HTTPException(
            status_code=403, 
            detail="Pro tier required for directions feature. Please upgrade to Pro."
        )
    
    return get_directions(from_location, to_location, travel_mode)