from fastapi import APIRouter
from db.mongo import events_collection
from pydantic import BaseModel
from typing import List
import openai
import json
import httpx
import os
import logging

router = APIRouter()
openai.api_key = os.getenv("OPENAI_API_KEY")

logger = logging.getLogger(__name__)


class Event(BaseModel):
    event_name:str
    location:str
    date:str
    description:str
    booking_url:str
    source:str

EVENT_URLS = [
    {"url": "https://www.eventbrite.com/d/sri-lanka/all-events/", "source": "Eventbrite"},
    {"url": "https://www.meetup.com/cities/lk/colombo/", "source": "Meetup"},
    {"url": "https://allevents.in/colombo", "source": "AllEvents"},
]

async def fetch_page_content(url: str) -> str:
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.text
    
def extract_events_from_text(raw_text: str, source: str) -> List[dict]:
    prompt = f"""
    You are an AI assistant. Extract all events from the following text. For each event, return a JSON object with these keys:

    - event name
    - location
    - date
    - description
    - booking_url
    - source (include '{source}' as the value)

    Format the output as a JSON array of objects.

    Text:
    {raw_text}
    """

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=600
    )

    try:
        structured_json = response['choices'][0]['message']['content']
        return json.loads(structured_json)
    except json.JSONDecodeError:
        return []
    
@router.post("/collect-events")
async def collect_events():
    all_events = []
    for site in EVENT_URLS:
        try:
            page_text = await fetch_page_content(site["url"])
            events = extract_events_from_text(page_text, site["source"])
            all_events.extend(events)
        except Exception as e:
            logger.warning(f"Error fetching {site['url']}: {e}")
            continue

    # Validate
    validated = [Event(**event).dict() for event in all_events if event]

    try:
        # Insert into MongoDB 
        result = await events_collection.insert_many(validated)
        return {
            "status": "success",
            "events_collected": len(validated),
            "inserted_ids": [str(id) for id in result.inserted_ids]
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

