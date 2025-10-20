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
from schema.event_agent_s import EventCreate

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Check if API key exists
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is required")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-2.5-flash")

# Search queries for Sri Lankan events
SEARCH_QUERIES = [
    "Events in Sri Lanka 2025",
    "Upcoming events in sri lanka",
    "Colombo events upcoming",
    "Kandy events upcoming",
    "Upcoming Sports events in sri lanka",
    "Upcoming Sports events in colombo",
    "Upcoming Sports events in kandy",
    "Upcoming International Cricket Events in sri lanka",
    "upcoming business events in sri lanka",
    "upcoming exhibitions in sri lanka",
    "upcoming conferences in sri lanka",
    "upcoming workshops in sri lanka",
    "upcoming music events in sri lanka",
    "upcoming Big Match cricket events in sri lanka",
    "upcoming exhibitions in colombo",
    "upcoming exhibitions in kandy",
    "upcoming art exhibitions in sri lanka"
]


async def fetch_page_content(url: str) -> str:
    async with httpx.AsyncClient(timeout=30) as client: 
        r = await client.get(url)
        r.raise_for_status() 
        return r.text # taking HTML TEXT content from the pages

async def search_google_for_events(query: str) -> List[dict]:
    """Search Google for events using Gemini AI"""
    prompt = f"""
    You are an event discovery agent. Search for upcoming events in Sri Lanka based on this query: "{query}"
    
    Return a JSON array of events with the following structure for each event:
    - event_name (string)
    - location (string, must be in Sri Lanka)
    - date (string in yyyy-mm-dd format, must be future dates)
    - description (string)
    - booking_url (string, if available)
    - source (string, set to "Google Search")
    
    Focus on:
    - Events happening in major Sri Lankan cities (Colombo, Kandy, Galle, Jaffna, Negombo, etc.)
    - Only upcoming events (future dates)
    - Various event types: music, tech, art, food, cultural, business, etc.
    - Include both free and paid events
    
    Return maximum 5 events per query. Return valid JSON array only, no explanations.
    """
    
    try:
        response = model.generate_content(prompt)
        # Clean the response to extract JSON
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        events = json.loads(response_text)
        
        # Convert date strings to datetime objects
        for event in events:
            if event.get('date') and isinstance(event['date'], str):
                try:
                    from datetime import datetime
                    event['date'] = datetime.strptime(event['date'], '%Y-%m-%d')
                except ValueError:
                    logger.warning(f"Invalid date format for Google event: {event.get('event_name', 'Unknown')}")
                    event['date'] = None
        
        return events
    except Exception as e:
        logger.warning(f"[Google Search] Failed to search for '{query}': {e}")
        return []

async def search_bing_for_events(query: str) -> List[dict]:
    """Search Bing for events using Gemini AI"""
    prompt = f"""
    You are an event discovery agent. Search for upcoming events in Sri Lanka based on this query: "{query}"
    
    Return a JSON array of events with the following structure for each event:
    - event_name (string)
    - location (string, must be in Sri Lanka)
    - date (string in yyyy-mm-dd format, must be future dates)
    - description (string)
    - booking_url (string, if available)
    - source (string, set to "Bing Search")
    
    Focus on:
    - Events happening in major Sri Lankan cities (Colombo, Kandy, Galle, Jaffna, Negombo, etc.)
    - Only upcoming events (future dates)
    - Various event types: music, tech, art, food, cultural, business, etc.
    - Include both free and paid events
    
    Return maximum 5 events per query. Return valid JSON array only, no explanations.
    """
    
    try:
        response = model.generate_content(prompt)
        # Clean the response to extract JSON
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        events = json.loads(response_text)
        
        # Convert date strings to datetime objects
        for event in events:
            if event.get('date') and isinstance(event['date'], str):
                try:
                    from datetime import datetime
                    event['date'] = datetime.strptime(event['date'], '%Y-%m-%d')
                except ValueError:
                    logger.warning(f"Invalid date format for Bing event: {event.get('event_name', 'Unknown')}")
                    event['date'] = None
        
        return events
    except Exception as e:
        logger.warning(f"[Bing Search] Failed to search for '{query}': {e}")
        return []

    
def extract_events_from_text(raw_text: str, source: str) -> List[dict]: #send the content
    prompt = f"""
    You are an event extraction agent. From the following raw HTML/text, extract only upcoming events.

    For each event, return a JSON object with:
    - event_name
    - location
    - date (in yyyy-mm-dd format)
    - description
    - booking_url
    - source: '{source}'

    Only include events that are scheduled **after today's date**.

    Return the result as a JSON array. Do not include any explanation or commentary.

    Raw Text:
    {raw_text} 
    """

    try:
        response = model.generate_content(prompt)
        structured_json = response.text.strip("```")
        events = json.loads(structured_json)
        
        # Convert date strings to datetime objects
        for event in events:
            if event.get('date') and isinstance(event['date'], str):
                try:
                    from datetime import datetime
                    event['date'] = datetime.strptime(event['date'], '%Y-%m-%d')
                except ValueError:
                    logger.warning(f"Invalid date format for event: {event.get('event_name', 'Unknown')}")
                    event['date'] = None
        
        return events
    except Exception as e:
        logger.warning(f"[Gemini] Failed to parse response from {source}: {e}")
        return [] 

    
def insert_events_to_db(events: List[Event]) -> List[int]: 
    db = SessionLocal()
    inserted_ids = []
    try:
        for event in events:
            db.add(event)
            db.flush()
            inserted_ids.append(event.id)
        db.commit()
        return inserted_ids
    except Exception as e:
        db.rollback()
        logger.error(f"[DB] Failed to insert events: {e}")
        raise e
    finally:
        db.close()

def insert_single_event(event_data: dict) -> Event:
    db = SessionLocal()
    try:
        validated_event = EventCreate(**event_data)
        event = Event(**validated_event.dict())
        db.add(event)
        db.commit()
        db.refresh(event)
        return event
    finally:
        db.close()

def cleanup_outdated_events():
    """Remove events that are older than today"""
    from datetime import datetime, date
    
    db = SessionLocal()
    try:
        today = date.today()
        outdated_events = db.query(Event).filter(Event.date < today).all()
        
        if outdated_events:
            for event in outdated_events:
                db.delete(event)
            db.commit()
            logger.info(f"Cleaned up {len(outdated_events)} outdated events")
        else:
            logger.info("No outdated events found")
            
    except Exception as e:
        logger.error(f"Error cleaning up outdated events: {e}")
        db.rollback()
    finally:
        db.close()


@router.post("/collect-event") #post request 
async def collect_event():
    all_events = []

    # Clean up outdated events first
    logger.info("Cleaning up outdated events...")
    cleanup_outdated_events()

    # Collect events from Google search
    logger.info("Starting Google search for Sri Lankan events...")
    for query in SEARCH_QUERIES:
        try:
            events = await search_google_for_events(query)
            all_events.extend(events)
            logger.info(f"Found {len(events)} events for Google query: {query}")
        except Exception as e:
            logger.warning(f"[Google Search] Error searching for '{query}': {e}")
            continue

    # Collect events from Bing search
    logger.info("Starting Bing search for Sri Lankan events...")
    for query in SEARCH_QUERIES:
        try:
            events = await search_bing_for_events(query)
            all_events.extend(events)
            logger.info(f"Found {len(events)} events for Bing query: {query}")
        except Exception as e:
            logger.warning(f"[Bing Search] Error searching for '{query}': {e}")
            continue

    logger.info(f"Total events collected: {len(all_events)}")

    # Validate and deduplicate events
    validated = []
    seen_events = set()  # To avoid duplicates
    
    for event in all_events:
        try:
            # Create a unique key for deduplication
            event_key = f"{event.get('event_name', '').lower()}_{event.get('location', '').lower()}_{event.get('date', '')}"
            
            if event_key in seen_events:
                logger.info(f"Skipping duplicate event: {event.get('event_name', 'Unknown')}")
                continue
                
            seen_events.add(event_key)
            
            validated_event = EventCreate(**event) #validating 
            validated.append(Event(**validated_event.dict())) #valid events 
        except ValidationError as e:
            logger.warning(f"[Validation] Skipped invalid event from {event.get('source', 'unknown')}: {e}")

    logger.info(f"Valid events after deduplication: {len(validated)}")

    try:
        inserted_ids = insert_events_to_db(validated) #adding after validation 
        
        # Trigger NLP processing for newly added events
        logger.info("Triggering NLP processing for newly collected events...")
        try:
            from agents.nlp_agent import batch_process_events
            nlp_result = await batch_process_events()
            logger.info(f"NLP processing completed: {nlp_result}")
        except Exception as nlp_error:
            logger.warning(f"NLP processing failed: {nlp_error}")
            # Don't fail the entire collection if NLP processing fails
        
        return {
            "status": "success",
            "events_collected": len(validated),
            "inserted_ids": inserted_ids,
            "sources": {
                "google_search": len([e for e in all_events if e.get('source') == 'Google Search']),
                "bing_search": len([e for e in all_events if e.get('source') == 'Bing Search'])
            },
            "nlp_processing": "triggered"
        }
    except Exception as e:
        logger.error(f"[DB] Failed to insert events: {e}")
        return {"status": "error", "message": str(e)}