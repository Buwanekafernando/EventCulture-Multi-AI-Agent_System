import os
import json
import google.generativeai as genai
from typing import Dict, List, Optional
import httpx

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")


genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")


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
        # Fallback to Sri Lanka center if geocoding fails
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
    """Get directions between two locations (Pro feature)."""
    # This would integrate with Google Maps Directions API
    # For demo purposes, return a mock response
    return {
        "status": "success",
        "from": from_location,
        "to": to_location,
        "travel_mode": travel_mode,
        "duration": "25 minutes",
        "distance": "12.5 km",
        "directions_url": f"https://www.google.com/maps/dir/{from_location}/{to_location}/@{travel_mode}"
    }  

        response = model.generate_content(prompt)
        return response.text.strip("```").strip()
    except Exception as e:
        return raw_location  

