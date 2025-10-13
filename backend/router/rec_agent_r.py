from fastapi import APIRouter, Depends, HTTPException
from schema.rec_agent_s import UserProfile, RecommendedEvent, PersonalizedRecommendation
from agents.recommender import get_personalized_recommendations, get_trending_events, query_gemini
from db.database import SessionLocal
from db.models import Recommendation, User
from typing import List
import json
from auth.google_auth import get_current_user

router = APIRouter()

@router.post("/discover-events", response_model=List[RecommendedEvent])
def discover_events(profile: UserProfile, current_user: dict = Depends(get_current_user)):
    """Get AI-generated event recommendations."""
    events = query_gemini(profile.recent_interests, profile.sentiment)

    # Save recommendation
    db = SessionLocal()
    try:
        rec = Recommendation(
            user_id=profile.user_id,
            interests=", ".join(profile.recent_interests),
            sentiment=profile.sentiment,
            events_json=json.dumps(events)
        )
        db.add(rec)
        db.commit()
    finally:
        db.close()

    return events

@router.post("/personalized-recommendations", response_model=List[PersonalizedRecommendation])
def get_personalized_recommendations_endpoint(
    profile: UserProfile, 
    current_user: dict = Depends(get_current_user)
):
    """Get personalized recommendations based on user preferences and existing events."""
    user_tier = current_user.get("tier", "free")
    recommendations = get_personalized_recommendations(
        profile.user_id, 
        profile.recent_interests, 
        profile.sentiment,
        user_tier
    )
    
    # Save personalized recommendation
    db = SessionLocal()
    try:
        rec = Recommendation(
            user_id=profile.user_id,
            interests=", ".join(profile.recent_interests),
            sentiment=profile.sentiment,
            events_json=json.dumps(recommendations)
        )
        db.add(rec)
        db.commit()
    finally:
        db.close()
    
    return recommendations

@router.get("/trending-events")
def get_trending_events_endpoint(current_user: dict = Depends(get_current_user)):
    """Get trending events based on engagement metrics."""
    return get_trending_events()

@router.get("/trending-events/public")
def get_trending_events_public():
    """Get trending events based on engagement metrics (public access - no authentication required)."""
    return get_trending_events()

@router.get("/recommendations/{user_id}")
def get_past_recommendations(user_id: int, current_user: dict = Depends(get_current_user)):
    """Get past recommendations for a user."""
    # Users can only view their own recommendations unless they're an organizer
    if current_user.get("id") != user_id and current_user.get("role") != "event":
        raise HTTPException(status_code=403, detail="Access denied")
    
    db = SessionLocal()
    try:
        recs = db.query(Recommendation).filter(
            Recommendation.user_id == user_id
        ).order_by(Recommendation.id.desc()).all()
        
        return [
            {
                "recommendation_id": r.id,
                "interests": r.interests,
                "sentiment": r.sentiment,
                "events": json.loads(r.events_json) if r.events_json else []
            }
            for r in recs
        ]
    finally:
        db.close()

@router.get("/user-preferences/{user_id}")
def get_user_preferences(user_id: int, current_user: dict = Depends(get_current_user)):
    """Get user preferences for recommendation personalization."""
    if current_user.get("id") != user_id and current_user.get("role") != "event":
        raise HTTPException(status_code=403, detail="Access denied")
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "user_id": user.id,
            "name": user.name,
            "preferences": user.preferences,
            "role": user.role
        }
    finally:
        db.close()

@router.get("/personalized-recommendations/{user_id}")
def get_user_personalized_recommendations(
    user_id: int, 
    current_user: dict = Depends(get_current_user)
):
    """Get personalized recommendations for a user based on their current preferences."""
    if current_user.get("id") != user_id and current_user.get("role") != "event":
        raise HTTPException(status_code=403, detail="Access denied")
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user.preferences:
            return {
                "status": "no_preferences",
                "message": "User has not set preferences yet",
                "recommendations": []
            }
        
        # Parse user preferences
        interests = [pref.strip() for pref in user.preferences.split(',') if pref.strip()]
        if not interests:
            return {
                "status": "no_preferences",
                "message": "User preferences are empty",
                "recommendations": []
            }
        
        # Get personalized recommendations
        user_tier = current_user.get("tier", "free")
        recommendations = get_personalized_recommendations(
            user_id, 
            interests, 
            "exciting",  # Default sentiment
            user_tier
        )
        
        return {
            "status": "success",
            "user_id": user_id,
            "preferences": user.preferences,
            "recommendations": recommendations,
            "tier": user_tier,
            "recommendation_count": len(recommendations)
        }
    finally:
        db.close()

@router.put("/user-preferences/{user_id}")
def update_user_preferences(
    user_id: int, 
    request_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update user preferences for better recommendations."""
    if current_user.get("id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Extract preferences from request body
    preferences = request_data.get("preferences", "")
    if not preferences:
        raise HTTPException(status_code=400, detail="Preferences field is required")
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.preferences = preferences
        db.commit()
        
        return {"status": "success", "message": "Preferences updated"}
    finally:
        db.close()
