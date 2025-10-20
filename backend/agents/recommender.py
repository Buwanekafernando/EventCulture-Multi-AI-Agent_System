import os
import json
import google.generativeai as genai
from typing import List, Dict
from datetime import datetime, timedelta
from db.database import SessionLocal
from db.models import Event, User

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

def query_gemini(interests: List[str], sentiment: str) -> List[dict]:
    prompt = f"""
    You are an intelligent event recommender for Sri Lanka. Based on the user's interests in {', '.join(interests)}
    and preference for {sentiment} experiences, list 5 upcoming events in Sri Lanka.

    For each event, return:
    - event_name
    - location (must be in Sri Lanka)
    - date (in YYYY-MM-DD format)
    - description
    - booking_url
    - source (always 'recommendation')

    Focus on events happening in major Sri Lankan cities like Colombo, Kandy, Galle, Jaffna, etc.
    Format the output strictly as a JSON array of objects.
    """

    try:
        response = model.generate_content(prompt)
        return json.loads(response.text.strip("```"))
    except Exception as e:
        return [{
            "event_name": "Error",
            "location": "",
            "date": "",
            "description": str(e),
            "booking_url": "",
            "source": "recommendation"
        }]

def get_personalized_recommendations(user_id: int, interests: List[str], sentiment: str, user_tier: str = "free") -> List[Dict]:
    """Get personalized recommendations based on user preferences and existing events."""
    db = SessionLocal()
    try:
        # Get user's preferences
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return []
        
        # Get events from database that match user interests
        events = db.query(Event).filter(
            Event.date >= datetime.now()  # Only future events
        ).all()
        
        # Filter events based on interests and sentiment
        recommended_events = []
        
        for event in events:
            # Check if event matches user interests
            event_matches = False
            
            # Check event tags
            if event.tags and any(interest.lower() in str(event.tags).lower() for interest in interests):
                event_matches = True
            
            # Check event type
            if event.event_type and any(interest.lower() in event.event_type.lower() for interest in interests):
                event_matches = True
            
            # Check event name and description
            event_text = f"{event.event_name} {event.description or ''}".lower()
            if any(interest.lower() in event_text for interest in interests):
                event_matches = True
            
            if event_matches:
                # Check virtual event restrictions for free users
                is_virtual = (event.location and 'virtual' in event.location.lower()) or \
                           (event.description and 'virtual' in event.description.lower()) or \
                           (event.location and 'online' in event.location.lower())
                
                if is_virtual and user_tier == "free":
                    continue  # Skip virtual events for free users
                
                recommended_events.append({
                    "event_id": event.id,
                    "event_name": event.event_name,
                    "location": event.location,
                    "date": event.date.isoformat() if event.date else None,
                    "description": event.description,
                    "booking_url": event.booking_url,
                    "source": event.source,
                    "event_type": event.event_type,
                    "sentiment": event.sentiment,
                    "summary": event.summary,
                    "views": event.views or 0,
                    "clicks": event.clicks or 0,
                    "is_virtual": is_virtual,
                    "tags": event.tags
                })
        
        # If not enough events from database, supplement with AI-generated ones
        max_recommendations = 10 if user_tier == "free" else 50  # Limit for free users
        if len(recommended_events) < max_recommendations:
            ai_events = query_gemini(interests, sentiment)
            for ai_event in ai_events[:max_recommendations-len(recommended_events)]:
                # Check if AI-generated event is virtual
                is_virtual_ai = 'virtual' in ai_event.get("location", "").lower() or \
                              'virtual' in ai_event.get("description", "").lower() or \
                              'online' in ai_event.get("location", "").lower()
                
                if is_virtual_ai and user_tier == "free":
                    continue  # Skip virtual events for free users
                
                recommended_events.append({
                    "event_id": None,  # AI-generated event
                    "event_name": ai_event.get("event_name", ""),
                    "location": ai_event.get("location", ""),
                    "date": ai_event.get("date", ""),
                    "description": ai_event.get("description", ""),
                    "booking_url": ai_event.get("booking_url", ""),
                    "source": "ai_recommendation",
                    "event_type": None,
                    "sentiment": sentiment,
                    "summary": None,
                    "views": 0,
                    "clicks": 0,
                    "is_virtual": is_virtual_ai,
                    "tags": []
                })
        
        # Sort by relevance and engagement
        recommended_events.sort(key=lambda x: (x["views"] + x["clicks"]), reverse=True)
        
        # Apply tier-based limits
        if user_tier == "free":
            return recommended_events[:10]  #  for free users
        else:
            return recommended_events[:50]  # for pro users
        
    except Exception as e:
        print(f"Error getting personalized recommendations: {e}")
        return []
    finally:
        db.close()

def get_trending_events() -> List[Dict]:
    """Get trending events based on views and clicks."""
    db = SessionLocal()
    try:
        # Get events with highest engagement
        events = db.query(Event).filter(
            Event.date >= datetime.now()
        ).order_by(
            (Event.views + Event.clicks).desc()
        ).limit(5).all()
        
        trending_events = []
        for event in events:
            trending_events.append({
                "event_id": event.id,
                "event_name": event.event_name,
                "location": event.location,
                "date": event.date.isoformat() if event.date else None,
                "description": event.description,
                "booking_url": event.booking_url,
                "source": event.source,
                "event_type": event.event_type,
                "sentiment": event.sentiment,
                "summary": event.summary,
                "views": event.views or 0,
                "clicks": event.clicks or 0,
                "engagement_score": (event.views or 0) + (event.clicks or 0)
            })
        
        return trending_events
        
    except Exception as e:
        print(f"Error getting trending events: {e}")
        return []
    finally:
        db.close()
