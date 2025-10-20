from fastapi import APIRouter, HTTPException, Depends
from urllib.parse import quote
from db.database import SessionLocal
from db.models import Event
from agents.location_agent import (
    get_location_data, 
    refine_location_with_llm, 
    get_directions,
    get_multi_directions,
    batch_process_event_locations,
    get_google_maps_data
)
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

@router.get("/directions/summary")
def get_multi_mode_directions_endpoint(
    from_location: str,
    to_location: str,
    current_user: dict = Depends(get_current_user)
):
    """Get distance/time summaries for car, bus, and train (Pro feature)."""
    user_tier = current_user.get("tier", "free")
    if user_tier != "pro":
        raise HTTPException(
            status_code=403,
            detail="Pro tier required for directions feature. Please upgrade to Pro."
        )
    return get_multi_directions(from_location, to_location)

@router.post("/process-locations")
async def process_event_locations(current_user: dict = Depends(get_current_user)):
    """Process all events for location data (Admin/Pro feature)."""
    user_tier = current_user.get("tier", "free")
    
    if user_tier != "pro":
        raise HTTPException(
            status_code=403, 
            detail="Pro tier required for location processing. Please upgrade to Pro."
        )
    
    try:
        result = await batch_process_event_locations()
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process event locations: {str(e)}"
        )

@router.get("/google-maps/{event_id}")
def get_google_maps_event_data(
    event_id: int, 
    user_location: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Get Google Maps data for a specific event with optional user location routes (Pro feature only)."""
    user_tier = current_user.get("tier", "free")
    
    if user_tier != "pro":
        raise HTTPException(
            status_code=403, 
            detail="Pro tier required for Google Maps features. Please upgrade to Pro."
        )
    
    try:
        maps_data = get_google_maps_data(event_id, user_location)
        
        if "error" in maps_data:
            raise HTTPException(status_code=404, detail=maps_data["error"])
        
        return maps_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get Google Maps data: {str(e)}"
        )

@router.get("/user-routes/{event_id}")
def get_user_location_routes(
    event_id: int,
    user_location: str,
    current_user: dict = Depends(get_current_user)
):
    """Get routes from user location to event location with time and distance (Pro feature only)."""
    user_tier = current_user.get("tier", "free")
    
    if user_tier != "pro":
        raise HTTPException(
            status_code=403, 
            detail="Pro tier required for user location routes. Please upgrade to Pro."
        )
    
    if not user_location or not user_location.strip():
        raise HTTPException(
            status_code=400,
            detail="User location is required"
        )
    
    try:
        # Get the event first
        db = SessionLocal()
        event = db.query(Event).filter(Event.id == event_id).first()
        db.close()
        
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Get location data for the event
        raw_location = event.location or ""
        description = event.description or ""
        location_data = get_location_data(raw_location, description, "pro")
        
        if location_data["is_virtual"]:
            return {
                "is_virtual": True,
                "message": "This is a virtual event - no physical routes available",
                "user_routes": []
            }
        
        # Get user routes if coordinates are available
        user_routes = []
        if location_data.get("coordinates"):
            from agents.location_agent import get_user_location_routes
            user_routes = get_user_location_routes(user_location, location_data["location_name"], location_data["coordinates"])
        
        return {
            "is_virtual": False,
            "event_location": location_data["location_name"],
            "user_location": user_location,
            "user_routes": user_routes
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get user location routes: {str(e)}"
        )