import os
import json
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from db.database import SessionLocal
from db.models import Event, User, Recommendation

# Configure 
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AnalysisAgent:
    
    def __init__(self):
        self.active_sessions = {}  # Track active user sessions
        self.interaction_buffer = {}  # Buffer for batch processing interactions
    
    def start_user_session(self, user_id: int, session_data: Dict) -> Dict:
        """Initialize analysis tracking for a user session."""
        try:
            session_id = f"session_{user_id}_{datetime.now().timestamp()}"
            
            self.active_sessions[session_id] = {
                "user_id": user_id,
                "start_time": datetime.now(),
                "interactions": [],
                "events_viewed": set(),
                "events_clicked": set(),
                "session_data": session_data
            }
            
            logger.info(f"Started analysis session for user {user_id}: {session_id}")
            
            return {
                "status": "success",
                "session_id": session_id,
                "message": "Analysis session started"
            }
        except Exception as e:
            logger.error(f"Error starting user session: {e}")
            return {"status": "error", "message": str(e)}
    
    def end_user_session(self, session_id: str) -> Dict:
        """End user session and process all interactions."""
        try:
            if session_id not in self.active_sessions:
                return {"status": "error", "message": "Session not found"}
            
            session = self.active_sessions[session_id]
            session["end_time"] = datetime.now()
            
            # Process all interactions from this session
            processed_interactions = self._process_session_interactions(session)
            
            # Remove session from active sessions
            del self.active_sessions[session_id]
            
            logger.info(f"Ended analysis session {session_id}, processed {len(processed_interactions)} interactions")
            
            return {
                "status": "success",
                "session_id": session_id,
                "processed_interactions": processed_interactions,
                "session_duration": (session["end_time"] - session["start_time"]).total_seconds()
            }
        except Exception as e:
            logger.error(f"Error ending user session: {e}")
            return {"status": "error", "message": str(e)}
    
    def track_event_interaction(self, event_id: int, interaction_type: str, user_id: Optional[int] = None, session_id: Optional[str] = None) -> Dict:
        """Track real-time user interactions with events."""
        try:
            db = SessionLocal()
            
            # Get event
            event = db.query(Event).filter(Event.id == event_id).first()
            if not event:
                return {"status": "error", "message": "Event not found"}
            
            # Update event metrics
            if interaction_type == "view":
                event.views = (event.views or 0) + 1
            elif interaction_type == "click":
                event.clicks = (event.clicks or 0) + 1
            
            db.commit()
            
            # Track in active session if session_id provided
            if session_id and session_id in self.active_sessions:
                session = self.active_sessions[session_id]
                interaction_record = {
                    "event_id": event_id,
                    "interaction_type": interaction_type,
                    "timestamp": datetime.now(),
                    "user_id": user_id
                }
                session["interactions"].append(interaction_record)
                
                # Track unique events
                if interaction_type == "view":
                    session["events_viewed"].add(event_id)
                elif interaction_type == "click":
                    session["events_clicked"].add(event_id)
            
            logger.info(f"Tracked {interaction_type} for event {event_id} by user {user_id}")
            
            return {
                "status": "success",
                "event_id": event_id,
                "interaction_type": interaction_type,
                "views": event.views,
                "clicks": event.clicks,
                "session_tracked": session_id is not None
            }
        except Exception as e:
            logger.error(f"Error tracking interaction: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            db.close()
    
    def _process_session_interactions(self, session: Dict) -> List[Dict]:
        """Process all interactions from a user session."""
        processed_interactions = []
        
        try:
            # Group interactions by event
            event_interactions = {}
            for interaction in session["interactions"]:
                event_id = interaction["event_id"]
                if event_id not in event_interactions:
                    event_interactions[event_id] = []
                event_interactions[event_id].append(interaction)
            
            # Process each event's interactions
            for event_id, interactions in event_interactions.items():
                # Calculate engagement metrics
                view_count = len([i for i in interactions if i["interaction_type"] == "view"])
                click_count = len([i for i in interactions if i["interaction_type"] == "click"])
                
                processed_interactions.append({
                    "event_id": event_id,
                    "view_count": view_count,
                    "click_count": click_count,
                    "engagement_score": view_count + click_count,
                    "session_duration": (session["end_time"] - session["start_time"]).total_seconds()
                })
            
            return processed_interactions
        except Exception as e:
            logger.error(f"Error processing session interactions: {e}")
            return []
    
    def get_event_analytics(self, event_id: int) -> Dict:
        """Get comprehensive analytics for a specific event."""
        try:
            db = SessionLocal()
            event = db.query(Event).filter(Event.id == event_id).first()
            if not event:
                return {"status": "error", "message": "Event not found"}
            
            # Calculate engagement metrics
            total_interactions = (event.views or 0) + (event.clicks or 0)
            engagement_rate = (event.clicks or 0) / max(event.views or 1, 1) * 100
            
            return {
                "status": "success",
                "event_id": event_id,
                "event_name": event.event_name,
                "analytics": {
                    "views": event.views or 0,
                    "clicks": event.clicks or 0,
                    "total_interactions": total_interactions,
                    "engagement_rate": round(engagement_rate, 2),
                    "source": event.source,
                    "event_type": event.event_type,
                    "sentiment": event.sentiment,
                    "created_date": event.date.isoformat() if event.date else None
                }
            }
        except Exception as e:
            logger.error(f"Error getting event analytics: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            db.close()
    
    def get_organizer_dashboard(self, user_id: int) -> Dict:
        """Get analytics dashboard for event organizers.""" #no need now 
        try:
            db = SessionLocal()
            # Get all events 
            events = db.query(Event).all()
            
            if not events:
                return {
                    "status": "success",
                    "total_events": 0,
                    "total_views": 0,
                    "total_clicks": 0,
                    "top_events": [],
                    "engagement_summary": {}
                }
            
            # Calculate overall metrics
            total_views = sum(event.views or 0 for event in events)
            total_clicks = sum(event.clicks or 0 for event in events)
            total_interactions = total_views + total_clicks
            overall_engagement = (total_clicks / max(total_views, 1)) * 100
            
            # Get top performing events
            top_events = sorted(events, key=lambda x: (x.views or 0) + (x.clicks or 0), reverse=True)[:5]
            
            # Event type performance
            event_types = {}
            for event in events:
                event_type = event.event_type or "unknown"
                if event_type not in event_types:
                    event_types[event_type] = {"views": 0, "clicks": 0, "count": 0}
                event_types[event_type]["views"] += event.views or 0
                event_types[event_type]["clicks"] += event.clicks or 0
                event_types[event_type]["count"] += 1
            
            return {
                "status": "success",
                "dashboard": {
                    "total_events": len(events),
                    "total_views": total_views,
                    "total_clicks": total_clicks,
                    "total_interactions": total_interactions,
                    "overall_engagement_rate": round(overall_engagement, 2),
                    "top_events": [
                        {
                            "event_id": event.id,
                            "event_name": event.event_name,
                            "views": event.views or 0,
                            "clicks": event.clicks or 0,
                            "engagement_rate": round((event.clicks or 0) / max(event.views or 1, 1) * 100, 2)
                        }
                        for event in top_events
                    ],
                    "event_type_performance": event_types,
                    "engagement_summary": {
                        "high_engagement": len([e for e in events if (e.clicks or 0) / max(e.views or 1, 1) > 0.1]),
                        "medium_engagement": len([e for e in events if 0.05 < (e.clicks or 0) / max(e.views or 1, 1) <= 0.1]),
                        "low_engagement": len([e for e in events if (e.clicks or 0) / max(e.views or 1, 1) <= 0.05])
                    }
                }
            }
        except Exception as e:
            logger.error(f"Error getting organizer dashboard: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            db.close()
    
    def get_user_engagement_history(self, user_id: int) -> Dict:
        """Get user's engagement history with events."""
        try:
            db = SessionLocal()
            # This would require a user_events table to track individual user interactions
            # For now, return basic user info and recommendations
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"status": "error", "message": "User not found"}
            
            recommendations = db.query(Recommendation).filter(
                Recommendation.user_id == user_id
            ).order_by(Recommendation.id.desc()).limit(10).all()
            
            return {
                "status": "success",
                "user_id": user_id,
                "user_name": user.name,
                "preferences": user.preferences,
                "role": user.role,
                "recent_recommendations": [
                    {
                        "recommendation_id": rec.id,
                        "interests": rec.interests,
                        "sentiment": rec.sentiment,
                        "events_count": len(json.loads(rec.events_json)) if rec.events_json else 0
                    }
                    for rec in recommendations
                ]
            }
        except Exception as e:
            logger.error(f"Error getting user engagement history: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            db.close()
    
    def get_active_sessions_count(self) -> int:
        """Get count of currently active user sessions."""
        return len(self.active_sessions)
    
    def get_session_summary(self) -> Dict:
        """Get summary of all active sessions."""
        try:
            session_summaries = []
            for session_id, session in self.active_sessions.items():
                session_summaries.append({
                    "session_id": session_id,
                    "user_id": session["user_id"],
                    "start_time": session["start_time"].isoformat(),
                    "events_viewed": len(session["events_viewed"]),
                    "events_clicked": len(session["events_clicked"]),
                    "total_interactions": len(session["interactions"])
                })
            
            return {
                "status": "success",
                "active_sessions_count": len(self.active_sessions),
                "sessions": session_summaries
            }
        except Exception as e:
            logger.error(f"Error getting session summary: {e}")
            return {"status": "error", "message": str(e)}
