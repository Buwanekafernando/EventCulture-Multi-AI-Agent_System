from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from urllib.parse import quote
import openai
import os


router = APIRouter()
openai.api_key = os.getenv("OPENAI_API_KEY")

class LocationResponse(BaseModel):
    cleaned_location: str
    map_url: str
    embed_url: str

def refine_location_with_llm(raw_location: str, description: str) -> str:
    prompt = f"""
        You are a location assistant. Given the raw location and event description, infer the most accurate physical location name suitable for Google Maps search.

        Return only the cleaned location string.

        Raw Location: {raw_location}
        Event Description: {description}
        """
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=100
    )
    return response['choices'][0]['message']['content'].strip()

@router.get("/locate-event/{event_id}")
async def locate_event(event_id: str):
    event_data = await events_collection.find_one({"_id": event_id})
    if not event_data:
        raise HTTPException(status_code=404, detail="Event not found")

   
    raw_location = event_data.get("location", "")
    description = event_data.get("description", "")
    is_physical = event_data.get("is_physical", True)

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