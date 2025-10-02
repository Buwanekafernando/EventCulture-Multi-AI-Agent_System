from fastapi import APIRouter
from schema.rec_agent import UserProfile, RecommendedEvent
from agents.recommender import query_gemini
from db.database import SessionLocal
from db.models import Recommendation
from typing import List
import json


router = APIRouter()

@router.post("/discover-events", response_model=List[RecommendedEvent])
def discover_events(profile: UserProfile):
    events = query_gemini(profile.recent_interests, profile.sentiment)

    # Save
    db = SessionLocal()
    rec = Recommendation(
        user_id=profile.user_id,
        interests=", ".join(profile.recent_interests),
        sentiment=profile.sentiment,
        events_json=json.dumps(events)
    )
    db.add(rec)
    db.commit()
    db.close()

    return events


@router.get("/recommendations/{user_id}")
def get_past_recommendations(user_id: int):
    db = SessionLocal()
    #get all for user
    recs = db.query(Recommendation).filter(Recommendation.user_id == user_id).order_by(Recommendation.id.desc()).all()
    db.close()

    return [
        {
            "recommendation_id": r.id,
            "interests": r.interests,
            "sentiment": r.sentiment,
            "events": json.loads(r.events_json)
        }
        for r in recs
    ]
