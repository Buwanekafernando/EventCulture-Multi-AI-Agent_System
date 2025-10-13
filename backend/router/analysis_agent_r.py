from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict
from agents.analysis_agent import AnalysisAgent
from auth.google_auth import get_current_user

router = APIRouter()

@router.post("/track-interaction")
def track_event_interaction(
    request: Request,
    interaction_data: dict,
    current_user: dict = Depends(get_current_user)
) -> Dict:
    """Track real-time user interactions with events (views, clicks, bookings)."""
    event_id = interaction_data.get("event_id")
    interaction_type = interaction_data.get("interaction_type")
    
    if not event_id or not interaction_type:
        raise HTTPException(status_code=400, detail="Missing event_id or interaction_type")
    
    if interaction_type not in ["view", "click", "booking"]:
        raise HTTPException(status_code=400, detail="Invalid interaction type")
    
    # Get analysis session ID from user session
    analysis_session_id = request.session.get("analysis_session_id")
    
    agent = AnalysisAgent()
    result = agent.track_event_interaction(
        event_id, 
        interaction_type, 
        current_user.get("id"),
        analysis_session_id
    )
    return result

@router.post("/start-session")
def start_analysis_session(
    request: Request,
    current_user: dict = Depends(get_current_user)
) -> Dict:
    """Start a new analysis session for real-time tracking."""
    agent = AnalysisAgent()
    session_data = {
        "user_tier": current_user.get("tier", "free"),
        "user_role": current_user.get("role", "person"),
        "login_time": request.session.get("user", {}).get("login_time")
    }
    result = agent.start_user_session(current_user.get("id"), session_data)
    
    if result["status"] == "success":
        request.session["analysis_session_id"] = result["session_id"]
    
    return result

@router.post("/end-session")
def end_analysis_session(
    request: Request,
    current_user: dict = Depends(get_current_user)
) -> Dict:
    """End the current analysis session and process interactions."""
    analysis_session_id = request.session.get("analysis_session_id")
    if not analysis_session_id:
        return {"status": "error", "message": "No active session found"}
    
    agent = AnalysisAgent()
    result = agent.end_user_session(analysis_session_id)
    
    if result["status"] == "success":
        request.session.pop("analysis_session_id", None)
    
    return result

@router.get("/session-status")
def get_session_status(
    request: Request,
    current_user: dict = Depends(get_current_user)
) -> Dict:
    """Get status of current analysis session."""
    analysis_session_id = request.session.get("analysis_session_id")
    if not analysis_session_id:
        return {"status": "no_session", "message": "No active analysis session"}
    
    agent = AnalysisAgent()
    return {
        "status": "active",
        "session_id": analysis_session_id,
        "active_sessions_count": agent.get_active_sessions_count()
    }

@router.get("/event-analytics/{event_id}")
def get_event_analytics(
    event_id: int, 
    current_user: dict = Depends(get_current_user)
) -> Dict:
    """Get comprehensive analytics for a specific event."""
    agent = AnalysisAgent()
    result = agent.get_event_analytics(event_id)
    return result

@router.get("/organizer-dashboard")
def get_organizer_dashboard(current_user: dict = Depends(get_current_user)) -> Dict:
    """Get analytics dashboard for event organizers."""
    # Check if user has organizer role
    if current_user.get("role") != "event":
        raise HTTPException(status_code=403, detail="Organizer access required")
    
    agent = AnalysisAgent()
    result = agent.get_organizer_dashboard(current_user.get("id"))
    return result

@router.get("/user-engagement/{user_id}")
def get_user_engagement_history(
    user_id: int, 
    current_user: dict = Depends(get_current_user)
) -> Dict:
    """Get user's engagement history with events."""
    # Users can only view their own engagement history
    if current_user.get("id") != user_id and current_user.get("role") != "event":
        raise HTTPException(status_code=403, detail="Access denied")
    
    agent = AnalysisAgent()
    result = agent.get_user_engagement_history(user_id)
    return result

@router.get("/analytics-summary")
def get_analytics_summary(current_user: dict = Depends(get_current_user)) -> Dict:
    """Get a summary of analytics data."""
    agent = AnalysisAgent()
    
    if current_user.get("role") == "event":
        # Organizer view
        result = agent.get_organizer_dashboard(current_user.get("id"))
    else:
        # Person view - their engagement history
        result = agent.get_user_engagement_history(current_user.get("id"))
    
    return result

@router.get("/active-sessions")
def get_active_sessions_summary(current_user: dict = Depends(get_current_user)) -> Dict:
    """Get summary of all active analysis sessions (admin/organizer only)."""
    if current_user.get("role") != "event":
        raise HTTPException(status_code=403, detail="Organizer access required")
    
    agent = AnalysisAgent()
    return agent.get_session_summary()
