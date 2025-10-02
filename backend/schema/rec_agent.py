from pydantic import BaseModel
from typing import List

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