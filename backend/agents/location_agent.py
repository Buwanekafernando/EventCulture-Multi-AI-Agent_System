import os
import json
import google.generativeai as genai
from typing import Dict, List, Optional
import httpx
import asyncio
import logging
from datetime import datetime
from db.database import SessionLocal
from db.models import Event

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

def refine_location_with_llm(raw_location: str, description: str) -> str:
    prompt = f"""
    You are a location assistant. Given the raw location and event description, infer the most accurate physical location name suitable for Google Maps search.

    Return only the cleaned location string.

    Raw Location: {raw_location}
    Event Description: {description}
    """

    try:
        response = model.generate_content(prompt) 
        return response.text.strip("```").strip()
    except Exception as e:
        return raw_location

def geocode_location(location: str) -> Optional[Dict]:
    """Geocode a location to get coordinates for OpenLayers mapping."""
    try:
        # Using a free geocoding service (you can replace with Google Maps Geocoding API)
        async def fetch_coordinates():
            async with httpx.AsyncClient() as client:
                # Using OpenStreetMap Nominatim (free, no API key required)
                url = f"https://nominatim.openstreetmap.org/search"
                params = {
                    "q": location,
                    "format": "json",
                    "limit": 1,
                    "countrycodes": "lk"  # Limit to Sri Lanka
                }
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    if data:
                        return {
                            "lat": float(data[0]["lat"]),
                            "lon": float(data[0]["lon"]),
                            "display_name": data[0]["display_name"]
                        }
                return None
        
        import asyncio
        return asyncio.run(fetch_coordinates())
    except Exception as e:
        print(f"Geocoding error: {e}")
        return None

def is_virtual_event(location: str, description: str) -> bool:
    """Determine if an event is virtual/online."""
    virtual_keywords = [
        "online", "virtual", "zoom", "teams", "webinar", "live stream",
        "streaming", "digital", "remote", "web-based"
    ]
    
    location_lower = location.lower() if location else ""
    description_lower = description.lower() if description else ""
    
    text_to_check = f"{location_lower} {description_lower}"
    
    return any(keyword in text_to_check for keyword in virtual_keywords)

def get_location_data(location: str, description: str, user_tier: str = "free") -> Dict:
    """Get comprehensive location data for OpenLayers mapping."""
    is_virtual = is_virtual_event(location, description)
    
    if is_virtual:
        return {
            "is_virtual": True,
            "location_name": "Virtual Event",
            "coordinates": None,
            "map_center": {"lat": 7.8731, "lon": 80.7718},  # Sri Lanka center
            "zoom_level": 7,
            "directions_available": user_tier == "pro",
            "enhanced_features": user_tier == "pro"
        }
    
    # Clean the location
    cleaned_location = refine_location_with_llm(location, description)
    
    # Try to geocode
    coordinates = geocode_location(cleaned_location)
    
    if coordinates:
        return {
            "is_virtual": False,
            "location_name": cleaned_location,
            "coordinates": coordinates,
            "map_center": {"lat": coordinates["lat"], "lon": coordinates["lon"]},
            "zoom_level": 12,
            "directions_available": user_tier == "pro",
            "enhanced_features": user_tier == "pro",
            "google_maps_url": f"https://www.google.com/maps/search/?api=1&query={coordinates['lat']},{coordinates['lon']}" if user_tier == "pro" else None
        }
    else:
        # Fallback to Sri Lanka center 
        return {
            "is_virtual": False,
            "location_name": cleaned_location,
            "coordinates": None,
            "map_center": {"lat": 7.8731, "lon": 80.7718},
            "zoom_level": 7,
            "directions_available": user_tier == "pro",
            "enhanced_features": user_tier == "pro"
        }

def get_directions(from_location: str, to_location: str, travel_mode: str = "driving") -> Dict:
    """Get directions between two locations using Google Directions API (Pro feature)."""
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not api_key:
        logger.warning("GOOGLE_MAPS_API_KEY not configured; returning fallback directions link only")
        return {
            "status": "error",
            "message": "Directions API key missing",
            "from": from_location,
            "to": to_location,
            "travel_mode": travel_mode,
            "directions_url": f"https://www.google.com/maps/dir/?api=1&origin={from_location}&destination={to_location}&travelmode={travel_mode}"
        }

    # Normalize travel mode to allowed values
    mode = travel_mode.lower()
    if mode not in ["driving", "walking", "bicycling", "transit"]:
        mode = "driving"

    params = {
        "origin": from_location,
        "destination": to_location,
        "mode": "transit" if mode in ["bus", "train"] else mode,
        "key": api_key
    }
    # Add specific transit filter when requested
    if mode == "bus":
        params["transit_mode"] = "bus"
    elif mode == "train":
        params["transit_mode"] = "rail"

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.get("https://maps.googleapis.com/maps/api/directions/json", params=params)
            data = resp.json()

        if data.get("status") != "OK" or not data.get("routes"):
            message = data.get("status") or "Directions request failed"
            error_detail = data.get("error_message")
            if error_detail:
                message = f"{message}: {error_detail}"
            logger.warning(f"Directions API error: {message}")
            return {
                "status": "error",
                "message": message,
                "from": from_location,
                "to": to_location,
                "travel_mode": mode,
                "directions_url": f"https://www.google.com/maps/dir/?api=1&origin={from_location}&destination={to_location}&travelmode={mode}"
            }

        route = data["routes"][0]
        leg = route["legs"][0]

        steps = []
        for s in leg.get("steps", []):
            steps.append({
                "instruction": s.get("html_instructions", ""),
                "distance": s.get("distance", {}).get("text"),
                "duration": s.get("duration", {}).get("text"),
            })

        result = {
            "status": "success",
            "from": from_location,
            "to": to_location,
            "travel_mode": mode,
            "start_address": leg.get("start_address"),
            "end_address": leg.get("end_address"),
            "duration": leg.get("duration", {}).get("text"),
            "distance": leg.get("distance", {}).get("text"),
            "steps": steps,
            "google_maps_url": f"https://www.google.com/maps/dir/?api=1&origin={from_location}&destination={to_location}&travelmode={mode}"
        }
        return result
    except Exception as e:
        logger.error(f"Directions API exception: {e}")
        return {
            "status": "error",
            "message": str(e),
            "from": from_location,
            "to": to_location,
            "travel_mode": mode,
            "directions_url": f"https://www.google.com/maps/dir/?api=1&origin={from_location}&destination={to_location}&travelmode={mode}"
        }

def get_multi_directions(from_location: str, to_location: str) -> Dict:
    """Return distance and time summaries for car, bus, and train."""
    modes = [
        {"key": "car", "mode": "driving"},
        {"key": "bus", "mode": "bus"},
        {"key": "train", "mode": "train"}
    ]
    results = {}
    for m in modes:
        info = get_directions(from_location, to_location, m["mode"])
        results[m["key"]] = {
            "status": info.get("status"),
            "message": info.get("message"),
            "duration": info.get("duration"),
            "distance": info.get("distance"),
            "url": info.get("google_maps_url") or info.get("directions_url")
        }
    return {"status": "success", "from": from_location, "to": to_location, "summaries": results}


SRI_LANKAN_LANDMARKS = {
    "colombo": {
        "name": "Colombo Fort Railway Station",
        "coordinates": {"lat": 6.9344, "lon": 79.8428},
        "description": "Main railway station in Colombo"
    },
    "kandy": {
        "name": "Kandy Railway Station", 
        "coordinates": {"lat": 7.2906, "lon": 80.6331},
        "description": "Main railway station in Kandy"
    },
    "galle": {
        "name": "Galle Fort",
        "coordinates": {"lat": 6.0259, "lon": 80.2170},
        "description": "Historic Galle Fort"
    },
    "jaffna": {
        "name": "Jaffna Railway Station",
        "coordinates": {"lat": 9.6615, "lon": 80.0255},
        "description": "Main railway station in Jaffna"
    },
    "negombo": {
        "name": "Negombo Bus Stand",
        "coordinates": {"lat": 7.2086, "lon": 79.8358},
        "description": "Main bus terminal in Negombo"
    },
    "anuradhapura": {
        "name": "Anuradhapura Railway Station",
        "coordinates": {"lat": 8.3114, "lon": 80.4037},
        "description": "Main railway station in Anuradhapura"
    }
}

def get_user_location_routes(user_location: str, event_location: str, event_coordinates: Dict) -> List[Dict]:
    """Get route options from user input location to event location with time and distance."""
    routes = []
    
    # First, geocode the user location to get coordinates
    user_coordinates = geocode_location(user_location)
    
    if not user_coordinates or not event_coordinates:
        logger.warning(f"Could not geocode user location '{user_location}' or event coordinates missing")
        return routes
    
    # Calculate approximate distance 
    lat_diff = abs(event_coordinates["lat"] - user_coordinates["lat"])
    lon_diff = abs(event_coordinates["lon"] - user_coordinates["lon"])
    distance_km = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111  # Rough conversion
    
    # Generate route options using Google Directions API for accurate time/distance
    travel_modes = ["driving", "transit", "walking"]
    
    for mode in travel_modes:
        try:
            # Get actual directions from Google API
            directions = get_directions(user_location, event_location, mode)
            
            if directions.get("status") == "success":
                route = {
                    "mode": mode,
                    "from": user_location,
                    "to": event_location,
                    "duration": directions.get("duration", f"{int(distance_km * 2)} minutes"),
                    "distance": directions.get("distance", f"{distance_km:.1f} km"),
                    "description": f"Travel by {mode} from {user_location} to {event_location}",
                    "google_maps_url": directions.get("google_maps_url"),
                    "start_address": directions.get("start_address"),
                    "end_address": directions.get("end_address")
                }
                routes.append(route)
            else:
                # Fallback to estimated values if API fails
                estimated_duration = int(distance_km * 2) if mode == "driving" else int(distance_km * 3) if mode == "transit" else int(distance_km * 15)
                route = {
                    "mode": mode,
                    "from": user_location,
                    "to": event_location,
                    "duration": f"{estimated_duration} minutes (estimated)",
                    "distance": f"{distance_km:.1f} km (estimated)",
                    "description": f"Travel by {mode} from {user_location} to {event_location}",
                    "google_maps_url": f"https://www.google.com/maps/dir/{user_coordinates['lat']},{user_coordinates['lon']}/{event_coordinates['lat']},{event_coordinates['lon']}/@{mode}",
                    "note": "Estimated values - API unavailable"
                }
                routes.append(route)
                
        except Exception as e:
            logger.error(f"Error getting directions for mode {mode}: {e}")
            # Add fallback route with estimated values
            estimated_duration = int(distance_km * 2) if mode == "driving" else int(distance_km * 3) if mode == "transit" else int(distance_km * 15)
            route = {
                "mode": mode,
                "from": user_location,
                "to": event_location,
                "duration": f"{estimated_duration} minutes (estimated)",
                "distance": f"{distance_km:.1f} km (estimated)",
                "description": f"Travel by {mode} from {user_location} to {event_location}",
                "google_maps_url": f"https://www.google.com/maps/dir/{user_coordinates['lat']},{user_coordinates['lon']}/{event_coordinates['lat']},{event_coordinates['lon']}/@{mode}",
                "note": "Estimated values - API error"
            }
            routes.append(route)
    
    return routes

def get_landmark_routes(event_location: str, event_coordinates: Dict) -> List[Dict]:
    """Get route options from well-known landmarks to event location."""
    routes = []
    
    for landmark_key, landmark_data in SRI_LANKAN_LANDMARKS.items():
        # Calculate approximate distance 
        if event_coordinates:
            lat_diff = abs(event_coordinates["lat"] - landmark_data["coordinates"]["lat"])
            lon_diff = abs(event_coordinates["lon"] - landmark_data["coordinates"]["lon"])
            distance_km = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 111  # Rough conversion
            
            # Generate route options 
            bus_route = {
                "mode": "bus",
                "from": landmark_data["name"],
                "to": event_location,
                "duration": f"{int(distance_km * 2)} minutes",
                "distance": f"{distance_km:.1f} km",
                "description": f"Take a bus from {landmark_data['name']} to {event_location}",
                "google_maps_url": f"https://www.google.com/maps/dir/{landmark_data['coordinates']['lat']},{landmark_data['coordinates']['lon']}/{event_coordinates['lat']},{event_coordinates['lon']}/@transit"
            }
            
            train_route = {
                "mode": "train",
                "from": landmark_data["name"],
                "to": event_location,
                "duration": f"{int(distance_km * 1.5)} minutes",
                "distance": f"{distance_km:.1f} km",
                "description": f"Take a train from {landmark_data['name']} to nearest station, then bus to {event_location}",
                "google_maps_url": f"https://www.google.com/maps/dir/{landmark_data['coordinates']['lat']},{landmark_data['coordinates']['lon']}/{event_coordinates['lat']},{event_coordinates['lon']}/@transit"
            }
            
            walk_route = {
                "mode": "walk",
                "from": landmark_data["name"],
                "to": event_location,
                "duration": f"{int(distance_km * 15)} minutes",
                "distance": f"{distance_km:.1f} km",
                "description": f"Walk from {landmark_data['name']} to {event_location}",
                "google_maps_url": f"https://www.google.com/maps/dir/{landmark_data['coordinates']['lat']},{landmark_data['coordinates']['lon']}/{event_coordinates['lat']},{event_coordinates['lon']}/@walking"
            }
            
            # Only include routes if they're reasonable (less than 50km)
            if distance_km < 50:
                routes.extend([bus_route, train_route, walk_route])
    
    return routes

def get_unprocessed_events() -> List[Event]:
    """Get events that haven't been processed for location data yet."""
    db = SessionLocal()
    try:
        # Get events that don't have coordinates
        events = db.query(Event).filter(
            (Event.location.isnot(None)) & 
            (Event.location != "")
        ).all()
        return events
    except Exception as e:
        logger.error(f"Error retrieving events for location processing: {e}")
        return []
    finally:
        db.close()

def update_event_location_data(event_id: int, location_data: Dict) -> bool:
    """Update event with enhanced location data."""
    db = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            logger.warning(f"Event {event_id} not found")
            return False
        
        # Store location data in a JSON field or create a new field
        
        if location_data.get("coordinates"):
            # Store coordinates in a structured way
            event.location = f"{location_data['location_name']}|{location_data['coordinates']['lat']},{location_data['coordinates']['lon']}"
        else:
            event.location = location_data['location_name']
        
        db.commit()
        logger.info(f"Successfully updated event {event_id} with location data")
        return True
    except Exception as e:
        logger.error(f"Error updating event {event_id} location: {e}")
        db.rollback()
        return False
    finally:
        db.close()

async def process_single_event_location(event: Event) -> bool:
    """Process a single event for location data."""
    try:
        raw_location = event.location or ""
        description = event.description or ""
        
        if not raw_location.strip():
            logger.warning(f"Event {event.id} has no location to process")
            return False
        
        # Get location data
        location_data = get_location_data(raw_location, description, "free")  # Process for all users
        
        # Update the event
        success = update_event_location_data(event.id, location_data)
        
        if success:
            logger.info(f"Successfully processed location for event: {event.event_name}")
        else:
            logger.error(f"Failed to update location for event: {event.event_name}")
        
        return success
    except Exception as e:
        logger.error(f"Error processing location for event {event.id}: {e}")
        return False

async def batch_process_event_locations() -> Dict:
    """Process all events for location data in batch."""
    logger.info("Starting location processing for all events...")
    
    # Get all events
    events = get_unprocessed_events()
    
    if not events:
        logger.info("No events found for location processing")
        return {
            "status": "success",
            "message": "No events found for location processing",
            "processed_count": 0,
            "total_events": 0
        }
    
    logger.info(f"Found {len(events)} events for location processing")
    
    processed_count = 0
    failed_count = 0
    
    # Process each event
    for event in events:
        try:
            success = await process_single_event_location(event)
            if success:
                processed_count += 1
            else:
                failed_count += 1
        except Exception as e:
            logger.error(f"Failed to process location for event {event.id}: {e}")
            failed_count += 1
    
    logger.info(f"Location processing completed. Processed: {processed_count}, Failed: {failed_count}")
    
    return {
        "status": "success",
        "message": f"Processed {processed_count} event locations successfully",
        "processed_count": processed_count,
        "failed_count": failed_count,
        "total_events": len(events)
    }

def get_google_maps_data(event_id: int, user_location: str = None) -> Dict:
    """Get Google Maps data for a specific event, optionally including routes from user location."""
    db = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return {"error": "Event not found"}
        
        raw_location = event.location or ""
        description = event.description or ""
        
        # Get location data
        location_data = get_location_data(raw_location, description, "pro")
        
        if location_data["is_virtual"]:
            return {
                "is_virtual": True,
                "location_name": "Virtual Event",
                "coordinates": None,
                "map_center": {"lat": 7.8731, "lon": 80.7718},
                "zoom_level": 7,
                "routes": [],
                "user_routes": []
            }
        
        # Get route options if coordinates are available
        landmark_routes = []
        user_routes = []
        
        if location_data.get("coordinates"):
            # Get landmark routes (existing functionality)
            landmark_routes = get_landmark_routes(location_data["location_name"], location_data["coordinates"])
            
            # Get user location routes if user location is provided
            if user_location and user_location.strip():
                user_routes = get_user_location_routes(user_location, location_data["location_name"], location_data["coordinates"])
        
        return {
            "is_virtual": False,
            "location_name": location_data["location_name"],
            "coordinates": location_data.get("coordinates"),
            "map_center": location_data["map_center"],
            "zoom_level": location_data["zoom_level"],
            "google_maps_url": location_data.get("google_maps_url"),
            "routes": landmark_routes,  # Routes from landmarks
            "user_routes": user_routes  # Routes from user location
        }
    except Exception as e:
        logger.error(f"Error getting Google Maps data for event {event_id}: {e}")
        return {"error": str(e)}
    finally:
        db.close()  