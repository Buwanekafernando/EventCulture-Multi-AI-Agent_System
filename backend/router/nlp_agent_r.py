from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import asyncio
import json

from schema.nlp_agent_s import RawEvent, EnhancedEvent
from db.database import SessionLocal
from db.models import Event
from agents.nlp_agent import process_event_text, batch_process_events, get_unprocessed_events
from auth.google_auth import get_current_user

router = APIRouter()

@router.post("/nlp/enhance", response_model=EnhancedEvent)
async def enhance_event(raw: RawEvent, current_user: dict = Depends(get_current_user)):
    """Enhance a single event with NLP processing."""
    db: Session = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == raw.event_id).first()
        if not event or not event.description:
            return EnhancedEvent(
                summary="No description available.",
                tags=[],
                event_type="unknown",
                sentiment="neutral"
            )
        result = await process_event_text(event.description, event.location or "")
        event.summary = result["summary"]
        event.tags = result["tags"]  # Store as list (update DB model)
        event.event_type = result["event_type"]
        event.sentiment = result["sentiment"]
        event.entities = result["entities"]
        db.commit()
        return EnhancedEvent(**result)
    finally:
        db.close()

@router.post("/batch-enhance")
async def batch_enhance_events(current_user: dict = Depends(get_current_user)):
    """Process all unprocessed events in batch (post-processing after Event Collector)."""
    try:
        result = await batch_process_events()
        return result
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/unprocessed-events")
async def get_unprocessed_events_count(current_user: dict = Depends(get_current_user)):
    """Get count of events that haven't been processed by NLP agent yet."""
    try:
        unprocessed = get_unprocessed_events()
        return {
            "status": "success",
            "unprocessed_count": len(unprocessed),
            "events": [
                {
                    "id": event.id,
                    "event_name": event.event_name,
                    "has_summary": event.summary is not None,
                    "has_tags": event.tags is not None,
                    "has_event_type": event.event_type is not None
                }
                for event in unprocessed[:10]  # Limit to first 10 for response size
            ]
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}