# NLP and Analysis Agent Modifications

## Overview

This document outlines the modifications made to the NLP Agent and Analysis Agent based on the specified requirements. The changes implement a post-processing workflow for the NLP Agent and real-time session tracking for the Analysis Agent.

## 🔄 NLP Agent Modifications

### **Post-Processing Workflow**

The NLP Agent now operates as a **post-processing step** that runs after the Event Collector agent has finished adding raw event details to the database.

#### **Key Changes:**

1. **Database Integration**: Added functions to retrieve unprocessed events from the database
2. **Batch Processing**: Implemented `batch_process_events()` to process all unprocessed events
3. **Virtual Event Detection**: Added `is_virtual_event()` function to detect virtual/online events
4. **Event Type Classification**: Virtual events are now marked as "visual" type
5. **Enhanced Processing**: Improved error handling and logging throughout

#### **New Functions:**

```python
def get_unprocessed_events() -> List[Event]:
    """Retrieve events that haven't been processed by NLP agent yet."""

def update_event_with_nlp_data(event_id: int, nlp_data: Dict) -> bool:
    """Update event record with NLP processed data."""

async def process_single_event(event: Event) -> bool:
    """Process a single event with NLP agent."""

async def batch_process_events() -> Dict:
    """Process all unprocessed events in batch."""

def is_virtual_event(location: str, description: str) -> bool:
    """Determine if an event is virtual/online."""
```

#### **Workflow:**

1. **Event Collector** adds raw events to database
2. **NLP Agent** automatically triggers via `batch_process_events()`
3. **Retrieves** unprocessed events (missing summary, tags, or event_type)
4. **Processes** each event to generate:
   - Readable summary (max 30 words)
   - Relevant tags (3-5 keywords)
   - Sentiment classification (exciting, formal, casual, neutral)
   - Event type (including "visual" for virtual events)
   - Named entities extraction
5. **Updates** database with enriched data

#### **Virtual Event Handling:**

- Detects virtual events using keywords: "online", "virtual", "zoom", "teams", "webinar", etc.
- Marks virtual events with `event_type = "visual"`
- Processes both location and description text for accurate detection

---

## 📊 Analysis Agent Modifications

### **Real-Time Session Tracking**

The Analysis Agent now triggers during **active user sessions** and monitors user interactions in real-time.

#### **Key Changes:**

1. **Session Management**: Added active session tracking with unique session IDs
2. **Real-Time Tracking**: Monitors user interactions during active sessions
3. **Interaction Buffering**: Stores interactions for batch processing
4. **Session Analytics**: Provides detailed session summaries and metrics

#### **New Functions:**

```python
def start_user_session(self, user_id: int, session_data: Dict) -> Dict:
    """Initialize analysis tracking for a user session."""

def end_user_session(self, session_id: str) -> Dict:
    """End user session and process all interactions."""

def track_event_interaction(self, event_id: int, interaction_type: str, 
                          user_id: Optional[int] = None, 
                          session_id: Optional[str] = None) -> Dict:
    """Track real-time user interactions with events."""

def _process_session_interactions(self, session: Dict) -> List[Dict]:
    """Process all interactions from a user session."""

def get_active_sessions_count(self) -> int:
    """Get count of currently active user sessions."""

def get_session_summary(self) -> Dict:
    """Get summary of all active sessions."""
```

#### **Session Workflow:**

1. **User Login**: Analysis session automatically starts
2. **Real-Time Tracking**: All user interactions (views, clicks) are tracked
3. **Session Data**: Stores user tier, role, and interaction history
4. **User Logout**: Session ends and processes all interactions
5. **Analytics**: Provides engagement metrics and insights

#### **Integration Points:**

- **Authentication**: Automatically starts analysis session on login
- **Event Interactions**: Tracks views and clicks in real-time
- **Session Management**: Links analysis sessions to user sessions
- **Logout Cleanup**: Properly ends analysis sessions on logout

---

## 🔗 Integration Updates

### **Event Collector Integration**

```python
# After inserting events to database
try:
    from agents.nlp_agent import batch_process_events
    nlp_result = await batch_process_events()
    logger.info(f"NLP processing completed: {nlp_result}")
except Exception as nlp_error:
    logger.warning(f"NLP processing failed: {nlp_error}")
```

### **Authentication Integration**

```python
# On user login
from agents.analysis_agent import AnalysisAgent
analysis_agent = AnalysisAgent()
session_data = {
    "user_tier": user.tier,
    "user_role": user.role,
    "login_time": datetime.now().isoformat()
}
analysis_result = analysis_agent.start_user_session(user.id, session_data)
request.session["analysis_session_id"] = analysis_result["session_id"]
```

### **Logout Integration**

```python
# On user logout
analysis_session_id = request.session.get("analysis_session_id")
if analysis_session_id:
    analysis_agent.end_user_session(analysis_session_id)
```

---

## 🛠️ API Endpoints

### **NLP Agent Endpoints**

- `POST /api/nlp/batch-enhance` - Process all unprocessed events
- `GET /api/nlp/unprocessed-events` - Get count of unprocessed events
- `POST /api/nlp/enhance` - Enhance single event (existing)

### **Analysis Agent Endpoints**

- `POST /api/analytics/start-session` - Start analysis session
- `POST /api/analytics/end-session` - End analysis session
- `GET /api/analytics/session-status` - Get session status
- `POST /api/analytics/track-interaction` - Track real-time interactions
- `GET /api/analytics/active-sessions` - Get active sessions summary (organizer only)

---

## 📈 Benefits

### **NLP Agent Benefits:**

1. **Automated Processing**: No manual intervention required
2. **Consistent Quality**: All events get processed with same standards
3. **Virtual Event Support**: Properly identifies and categorizes virtual events
4. **Error Resilience**: Continues processing even if individual events fail
5. **Performance**: Batch processing is more efficient than individual processing

### **Analysis Agent Benefits:**

1. **Real-Time Insights**: Immediate tracking of user behavior
2. **Session Analytics**: Detailed user journey analysis
3. **Engagement Metrics**: Accurate view/click tracking
4. **Organizer Insights**: Valuable data for event organizers
5. **Scalable Tracking**: Handles multiple concurrent user sessions

---

## 🔧 Technical Implementation

### **Database Changes:**

- No schema changes required
- Uses existing Event model fields (summary, tags, event_type, sentiment, entities)
- Leverages existing User model for session tracking

### **Session Management:**

- Analysis sessions stored in memory (AnalysisAgent instance)
- Session IDs linked to user authentication sessions
- Automatic cleanup on logout or session timeout

### **Error Handling:**

- Graceful degradation if NLP processing fails
- Session tracking continues even if individual interactions fail
- Comprehensive logging for debugging and monitoring

---

## 🚀 Usage Examples

### **Automatic NLP Processing:**

```python
# Event Collector automatically triggers NLP processing
result = await collect_event()
# Returns: {"nlp_processing": "triggered", ...}
```

### **Real-Time Interaction Tracking:**

```python
# Frontend tracks user interactions
await analyticsAPI.trackInteraction(eventId, 'view')
await analyticsAPI.trackInteraction(eventId, 'click')
```

### **Session Management:**

```python
# Check session status
status = await analyticsAPI.getSessionStatus()
# Returns: {"status": "active", "session_id": "...", ...}
```

---

## 📝 Summary

These modifications implement a robust, automated workflow where:

1. **Event Collector** gathers raw event data
2. **NLP Agent** automatically enriches the data post-collection
3. **Analysis Agent** tracks user interactions in real-time during sessions
4. **Virtual events** are properly identified and categorized
5. **Organizers** get valuable insights through comprehensive analytics

The system now provides both **enriched content** and **actionable metrics** as specified in the requirements.







