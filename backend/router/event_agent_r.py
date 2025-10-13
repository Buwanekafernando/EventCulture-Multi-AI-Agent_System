from fastapi import APIRouter, Request, Depends, HTTPException
from schema.event_agent_s import EventCreate, EventOut
from agents.event_collector import insert_single_event, collect_event
from db.database import SessionLocal
from db.models import Event
from typing import List
from auth.google_auth import get_current_user
from fastapi.responses import PlainTextResponse

router = APIRouter()

@router.post("/events/", response_model=EventOut)
def create_event(event: EventCreate, current_user: dict = Depends(get_current_user)):
    """Create a new event (requires authentication)"""
    event_dict = event.dict()
    saved_event = insert_single_event(event_dict)
    return saved_event

@router.get("/events/", response_model=List[EventOut])
def list_events(current_user: dict = Depends(get_current_user)):
    """List all events (requires authentication)"""
    db = SessionLocal()
    try:
        events = db.query(Event).all()
        return events
    finally:
        db.close()

@router.get("/events/public/", response_model=List[EventOut])
def list_events_public():
    """List all events (public access - no authentication required)"""
    db = SessionLocal()
    try:
        events = db.query(Event).all()
        return events
    finally:
        db.close()

@router.get("/events/{event_id}", response_model=EventOut)
def get_event(event_id: int, current_user: dict = Depends(get_current_user)):
    """Get a specific event by ID (requires authentication)"""
    db = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event
    finally:
        db.close()

@router.get("/events/{event_id}/public", response_model=EventOut)
def get_event_public(event_id: int):
    """Get a specific event by ID (public access - no authentication required)"""
    db = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event
    finally:
        db.close()

@router.post("/collect-events/")
async def collect_events(current_user: dict = Depends(get_current_user)):
    """Collect events from all sources and store in database (requires authentication)"""
    return await collect_event()

@router.post("/events/{event_id}/view")
def track_view(event_id: int, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return {"status": "not_found"}
        event.views = (event.views or 0) + 1
        db.commit()
        return {"status": "ok", "views": event.views}
    finally:
        db.close()

@router.post("/events/{event_id}/click")
def track_click(event_id: int, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return {"status": "not_found"}
        event.clicks = (event.clicks or 0) + 1
        db.commit()
        return {"status": "ok", "clicks": event.clicks}
    finally:
        db.close()

@router.get("/events/report/text")
def report_text(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        events = db.query(Event).all()
        lines = ["Event Report", "================", ""]
        total_views = 0
        total_clicks = 0
        for e in events:
            v = e.views or 0; c = e.clicks or 0
            total_views += v; total_clicks += c
            lines.append(f"- {e.event_name} | views: {v} | clicks: {c}")
        lines.append("")
        lines.append(f"Totals -> views: {total_views}, clicks: {total_clicks}")
        return "\n".join(lines)
    finally:
        db.close()

@router.get("/events/{event_id}/report", response_class=PlainTextResponse)
def event_report(event_id: int, current_user: dict = Depends(get_current_user)):
    """Return a plain-text detail report for a specific event. Organizer only."""
    if current_user.get("role") != "event":
        raise HTTPException(status_code=403, detail="Organizer access required")
    db = SessionLocal()
    try:
        e = db.query(Event).filter(Event.id == event_id).first()
        if not e:
            raise HTTPException(status_code=404, detail="Event not found")
        lines = [
            f"Event Detail Report",
            f"===================",
            f"ID: {e.id}",
            f"Name: {e.event_name}",
            f"Location: {e.location or 'Virtual'}",
            f"Date: {e.date}",
            f"Source: {e.source}",
            f"Booking: {e.booking_url}",
            f"Tags: {', '.join(e.tags or [])}",
            f"Type: {e.event_type}",
            f"Sentiment: {e.sentiment}",
            f"Views: {e.views or 0}",
            f"Clicks: {e.clicks or 0}",
            "",
            "Summary:",
            e.summary or "",
            "",
            "Description:",
            e.description or "",
        ]
        return "\n".join(lines)
    finally:
        db.close()

@router.get("/events/{event_id}/booking")
def get_booking_info(event_id: int, current_user: dict = Depends(get_current_user)):
    """Get booking information for an event."""
    db = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        return {
            "event_id": event.id,
            "event_name": event.event_name,
            "booking_url": event.booking_url,
            "location": event.location,
            "date": event.date.isoformat() if event.date else None,
            "source": event.source,
            "is_available": bool(event.booking_url)
        }
    finally:
        db.close()

@router.post("/events/{event_id}/book")
def book_event(event_id: int, current_user: dict = Depends(get_current_user)):
    """Track booking interaction and return booking URL."""
    # Check if user has Pro tier for booking
    user_tier = current_user.get("tier", "free")
    if user_tier == "free":
        raise HTTPException(
            status_code=403, 
            detail="Pro tier required for direct event booking. Please upgrade to Pro."
        )
    
    db = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        if not event.booking_url:
            raise HTTPException(status_code=400, detail="No booking URL available for this event")
        
        # Track the booking interaction
        event.clicks = (event.clicks or 0) + 1
        db.commit()
        
        return {
            "status": "success",
            "booking_url": event.booking_url,
            "event_name": event.event_name,
            "message": "Redirecting to booking page..."
        }
    finally:
        db.close()