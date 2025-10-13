from pydantic import BaseModel
from typing import List, Dict, Optional

class InteractionRequest(BaseModel):
    event_id: int
    interaction_type: str  # "view", "click", "booking"

class EventAnalytics(BaseModel):
    event_id: int
    event_name: str
    views: int
    clicks: int
    total_interactions: int
    engagement_rate: float
    source: Optional[str]
    event_type: Optional[str]
    sentiment: Optional[str]
    created_date: Optional[str]

class TopEvent(BaseModel):
    event_id: int
    event_name: str
    views: int
    clicks: int
    engagement_rate: float

class EventTypePerformance(BaseModel):
    event_type: str
    views: int
    clicks: int
    count: int
    avg_engagement: float

class EngagementSummary(BaseModel):
    high_engagement: int
    medium_engagement: int
    low_engagement: int

class OrganizerDashboard(BaseModel):
    total_events: int
    total_views: int
    total_clicks: int
    total_interactions: int
    overall_engagement_rate: float
    top_events: List[TopEvent]
    event_type_performance: Dict[str, EventTypePerformance]
    engagement_summary: EngagementSummary

class UserEngagementHistory(BaseModel):
    user_id: int
    user_name: str
    preferences: Optional[str]
    role: str
    recent_recommendations: List[Dict]

class AnalyticsResponse(BaseModel):
    status: str
    data: Optional[Dict] = None
    message: Optional[str] = None
