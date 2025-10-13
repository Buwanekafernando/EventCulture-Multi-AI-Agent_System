from fastapi import APIRouter
from pydantic import ValidationError
from typing import Dict, List
import os
import google.generativeai as genai
import json
import spacy
from transformers import pipeline
from datetime import datetime
import asyncio
import logging
from db.database import SessionLocal
from db.models import Event

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

# Load spaCy and transformers
try:
    nlp_spacy = spacy.load("en_core_web_lg")  # Larger model for better entities
except OSError:
    # Fallback to smaller model if large model not available
    nlp_spacy = spacy.load("en_core_web_sm")
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

def is_virtual_event(location: str, description: str) -> bool:
    """Determine if an event is virtual/online."""
    virtual_keywords = [
        "online", "virtual", "zoom", "teams", "webinar", "live stream",
        "streaming", "digital", "remote", "web-based", "virtual event"
    ]
    
    location_lower = location.lower() if location else ""
    description_lower = description.lower() if description else ""
    
    text_to_check = f"{location_lower} {description_lower}"
    
    return any(keyword in text_to_check for keyword in virtual_keywords)

def extract_entities(text: str) -> List[dict]:
    """Extract named entities from text using spaCy."""
    try:
        doc = nlp_spacy(text)
        return [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
    except Exception as e:
        logger.warning(f"Error extracting entities: {e}")
        return []

def classify_event_type(text: str, location: str = "") -> str:
    """Classify event type using transformers."""
    try:
        # Check if it's a virtual event first
        if is_virtual_event(location, text):
            return "visual"  # Mark virtual events as "visual" type
        
        candidate_labels = ["music", "tech", "sports", "education", "food", "art", "business", "cultural", "fashion", "comedy", "theater", "photography", "other"]
        result = classifier(text, candidate_labels, multi_label=False)
        return result["labels"][0] if result["labels"] else "other"
    except Exception as e:
        logger.warning(f"Error classifying event type: {e}")
        return "other"

async def process_event_text(text: str, location: str = "") -> Dict[str, any]:
    """Process event text to generate summary, tags, and sentiment."""
    prompt = f"""
    Analyze this event description and return a JSON object with:
    - summary (max 30 words, readable and engaging)
    - tags (3–5 relevant keywords)
    - sentiment (exciting, formal, casual, neutral)

    Ensure sentiment is one of: exciting, formal, casual, neutral.
    Return valid JSON. No markdown or explanations.

    Description:
    {text}
    """
    try:
        response = await asyncio.get_event_loop().run_in_executor(None, model.generate_content, prompt)
        gemini_result = json.loads(response.text.strip("```json\n").strip("```"))
        # Validate sentiment
        valid_sentiments = {"exciting", "formal", "casual", "neutral"}
        if gemini_result.get("sentiment") not in valid_sentiments:
            gemini_result["sentiment"] = "neutral"
    except (json.JSONDecodeError, Exception) as e:
        logger.warning(f"Error processing event text with Gemini: {e}")
        gemini_result = {
            "summary": "Event details available upon request.",
            "tags": [],
            "sentiment": "neutral"
        }

    entities = extract_entities(text)
    event_type = classify_event_type(text, location)

    return {
        "summary": gemini_result.get("summary", ""),
        "tags": gemini_result.get("tags", []),
        "event_type": event_type,
        "sentiment": gemini_result.get("sentiment", "neutral"),
        "entities": entities
    }

def get_unprocessed_events() -> List[Event]:
    """Retrieve events that haven't been processed by NLP agent yet."""
    db = SessionLocal()
    try:
        # Get events that don't have summary, tags, or event_type set
        events = db.query(Event).filter(
            (Event.summary.is_(None)) | 
            (Event.tags.is_(None)) | 
            (Event.event_type.is_(None))
        ).all()
        return events
    except Exception as e:
        logger.error(f"Error retrieving unprocessed events: {e}")
        return []
    finally:
        db.close()

def update_event_with_nlp_data(event_id: int, nlp_data: Dict) -> bool:
    """Update event record with NLP processed data."""
    db = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            logger.warning(f"Event {event_id} not found")
            return False
        
        # Update event with NLP data
        event.summary = nlp_data.get("summary", "")
        event.tags = nlp_data.get("tags", [])
        event.event_type = nlp_data.get("event_type", "other")
        event.sentiment = nlp_data.get("sentiment", "neutral")
        event.entities = nlp_data.get("entities", [])
        
        db.commit()
        logger.info(f"Successfully updated event {event_id} with NLP data")
        return True
    except Exception as e:
        logger.error(f"Error updating event {event_id}: {e}")
        db.rollback()
        return False
    finally:
        db.close()

async def process_single_event(event: Event) -> bool:
    """Process a single event with NLP agent."""
    try:
        # Combine event description and location for processing
        text_to_process = f"{event.description or ''} {event.location or ''}"
        
        if not text_to_process.strip():
            logger.warning(f"Event {event.id} has no text to process")
            return False
        
        # Process the event text
        nlp_data = await process_event_text(text_to_process, event.location or "")
        
        # Update the event in database
        success = update_event_with_nlp_data(event.id, nlp_data)
        
        if success:
            logger.info(f"Successfully processed event: {event.event_name}")
        else:
            logger.error(f"Failed to update event: {event.event_name}")
        
        return success
    except Exception as e:
        logger.error(f"Error processing event {event.id}: {e}")
        return False

async def batch_process_events() -> Dict:
    """Process all unprocessed events in batch."""
    logger.info("Starting NLP batch processing...")
    
    # Get all unprocessed events
    unprocessed_events = get_unprocessed_events()
    
    if not unprocessed_events:
        logger.info("No unprocessed events found")
        return {
            "status": "success",
            "message": "No unprocessed events found",
            "processed_count": 0,
            "total_events": 0
        }
    
    logger.info(f"Found {len(unprocessed_events)} unprocessed events")
    
    processed_count = 0
    failed_count = 0
    
    # Process each event
    for event in unprocessed_events:
        try:
            success = await process_single_event(event)
            if success:
                processed_count += 1
            else:
                failed_count += 1
        except Exception as e:
            logger.error(f"Failed to process event {event.id}: {e}")
            failed_count += 1
    
    logger.info(f"NLP batch processing completed. Processed: {processed_count}, Failed: {failed_count}")
    
    return {
        "status": "success",
        "message": f"Processed {processed_count} events successfully",
        "processed_count": processed_count,
        "failed_count": failed_count,
        "total_events": len(unprocessed_events)
    }