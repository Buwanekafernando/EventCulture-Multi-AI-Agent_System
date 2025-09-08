from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
import openai
import os
import json
from agents.collector_agent import Event 
from db.mongo import db 

router = APIRouter()
openai.api_key = os.getenv("OPENAI_API_KEY")
recommendations_collection = db["event_recommendations"]

class UserProfile(BaseModel):
    user_id: str
    recent_interests: List[str]  # e.g., ["music", "tech"]
    sentiment: str               # e.g., "casual", "exciting"

class Event(BaseModel):
    event_name: str
    location: str
    date: str
    description: str
    booking_url: str
    source: str

def query_openai_for_events(interests: List[str], sentiment: str) -> List[dict]:
    prompt = f"""
    You are an intelligent event recommender. Based on the user's interests in {', '.join(interests)} 
    and preference for {sentiment} experiences, list 5 upcoming events.

    For each event, return:
    - event_name
    - location
    - date
    - description
    - booking_url
    - source (always 'recommendation')

    Format the output strictly as a JSON array of objects.
    """
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=600
    )

    try:
        return json.loads(response['choices'][0]['message']['content'])
    except Exception as e:
        return [{"name": "Error", "location": "", "date": "", "description": str(e), "booking_url": ""}]

@router.post("/discover-events")
async def discover_events(profile: UserProfile):
    # Ask OpenAI for events
    events = query_openai_for_events(profile.recent_interests, profile.sentiment)

    # Validate and prepare for DB
    validated_events = [EventRecommendation(**event).dict() for event in events]

    # Store in MongoDB
    doc = {
        "user_id": profile.user_id,
        "interests": profile.recent_interests,
        "sentiment": profile.sentiment,
        "events": validated_events
    }
    result = await recommendations_collection.insert_one(doc)

    return {
        "status": "success",
        "recommendation_id": str(result.inserted_id),
        "recommended_events": validated_events
    }