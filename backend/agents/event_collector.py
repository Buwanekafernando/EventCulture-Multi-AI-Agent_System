from fastapi import APIRouter
from pydantic import ValidationError
from typing import List
import google.generativeai as genai
import json
import httpx
import os
import logging

from db.database import SessionLocal
from db.models import Event
from schema.event import EventCreate

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")

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
    Extract all events from the following text. For each event, return a JSON object with:
    - event name
    - location
    - date
    - description
    - booking_url
    - source: '{source}'
    Format as a JSON array.
    Text:
    {raw_text}
    """
    try:
        response = model.generate_content(prompt)
        structured_json = response.text.strip("```")
        return json.loads(structured_json)
    except Exception as e:
        logger.warning(f"[Gemini] Failed to parse response from {source}: {e}")
        return []

    
def insert_events_to_db(events: List[Event]) -> List[int]:
    db = SessionLocal()
    inserted_ids = []
    for event in events:
        db.add(event)
        db.flush()
        inserted_ids.append(event.id)
    db.commit()
    db.close()
    return inserted_ids


@router.post("/collect-events")
async def collect_events():
    all_events = []

    for site in EVENT_URLS:
        try:
            page_text = await fetch_page_content(site["url"])
            events = extract_events_from_text(page_text, site["source"])
            all_events.extend(events)
        except Exception as e:
            logger.warning(f"[Fetch] Error fetching {site['url']}: {e}")
            continue


    validated = []
    for event in all_events:
        try:
            validated_event = EventCreate(**event)
            validated.append(Event(**validated_event.dict()))
        except ValidationError as e:
            logger.warning(f"[Validation] Skipped invalid event from {event.get('source', 'unknown')}: {e}")

    try:
        inserted_ids = insert_events_to_db(validated)
        return {
            "status": "success",
            "events_collected": len(validated),
            "inserted_ids": inserted_ids
        }
    except Exception as e:
        logger.error(f"[DB] Failed to insert events: {e}")
        return {"status": "error", "message": str(e)}
