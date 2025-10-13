from pydantic import BaseModel
from typing import List, Optional

class UserProfile(BaseModel):
    user_id: int
    recent_interests: List[str]
    sentiment: str

class RecommendedEvent(BaseModel):
    event_name: str
    location: str
    date: str
    description: str
    booking_url: str
    source: str

class PersonalizedRecommendation(BaseModel):
    event_id: Optional[int] = None
    event_name: str
    location: str
    date: Optional[str] = None
    description: str
    booking_url: str
    source: str
    event_type: Optional[str] = None
    sentiment: Optional[str] = None
    summary: Optional[str] = None
    views: int = 0
    clicks: int = 0
    engagement_score: Optional[int] = None