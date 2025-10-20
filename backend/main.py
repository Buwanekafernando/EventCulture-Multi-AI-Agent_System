import os
from fastapi import FastAPI
from starlette.staticfiles import StaticFiles
from pathlib import Path
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi import Request
from fastapi.responses import HTMLResponse



from auth.google_auth import router as google_auth_router

from agents.orchestrator import router as orchestrator_router  
from db.database import Base, engine

load_dotenv()

app = FastAPI()

# Add CORS middleware first
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure session middleware with proper settings
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("JWT_SECRET", "fallback-secret-key-for-development"),
    max_age=3600,  # 1 hour
    same_site="lax",  # Allow cross-site requests for OAuth
    https_only=False  # Allow HTTP for localhost development
)

@app.get("/session-test")#test the middleware works
async def session_test(request: Request):
    request.session["test_key"] = "test_value"
    return {
        "session_value": request.session.get("test_key"),
        "session_id": request.session.get("_id", "No session ID"),
        "all_session_keys": list(request.session.keys())
    }


app.include_router(google_auth_router)

app.include_router(orchestrator_router, prefix="/api")



# Ensure tables exist without dropping existing data
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

# Startup event: Prompt user for agent execution
@app.on_event("startup")
async def startup_event():
    """Prompt user to run agents on server startup"""
    import asyncio
    import sys
    
    print("=" * 60)
    print("EventCulture Multi-AI-Agent System Starting...")
    print("=" * 60)
    
    # Ask user if they want to run the agents
    try:
        response = input("\nDo you want to run Event Collector and NLP agents? (y/n): ").strip().lower()
        
        if response in ['y', 'yes']:
            print("\nRunning Event Collector and NLP agents...")
            print("This may take a few minutes to collect and process events...")
            
            # Run event collection and NLP processing
            asyncio.create_task(run_agents_on_startup())
        else:
            print("\n Skipping agent execution. Server will start with existing database records.")
            print(" You can manually trigger agents later if needed.")
    except (EOFError, KeyboardInterrupt):
        print("\n  Skipping agent execution. Server will start with existing database records.")
    
    print("\n Server is ready to accept requests!")
    print("=" * 60)

async def run_agents_on_startup():
    """Background task to run Event Collector, NLP, and Location agents on startup"""
    try:
        from agents.event_collector import collect_event
        from agents.nlp_agent import batch_process_events
        from agents.location_agent import batch_process_event_locations
        
        print(" Starting Event Collector agent...")
        result = await collect_event()
        print(f"Event collection completed: {result.get('events_collected', 0)} events collected")
        
        print(" Starting NLP agent for post-processing...")
        nlp_result = await batch_process_events()
        print(f" NLP processing completed: {nlp_result.get('processed_count', 0)} events processed")
        
        print(" Starting Location agent for location processing...")
        location_result = await batch_process_event_locations()
        print(f" Location processing completed: {location_result.get('processed_count', 0)} events processed")
        
        print(" All agents completed successfully!")
        
    except Exception as e:
        print(f" Agent execution failed: {e}")
        print(" Server will continue running with existing data.")

@app.get("/")
def read_root():
    return {"message": "EventCulture backend is running  "}


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard():
    # Minimal placeholder to satisfy redirect target
    return "<html><body><h1>Dashboard</h1><p>Login success.</p></body></html>"

# Serve frontend static files (only if build exists)
_frontend_build = (Path(__file__).resolve().parent.parent / "frontend" / "build")
if _frontend_build.exists():
    # Mount the entire build directory to serve all static assets
    app.mount("/app", StaticFiles(directory=str(_frontend_build), html=True), name="frontend")
    
    # Mount static files directory for JS/CSS bundles
    app.mount("/static", StaticFiles(directory=str(_frontend_build / "static")), name="static")
    
    print("Frontend static files mounted successfully")
else:
    print("Frontend build not found. Run 'npm run build' in the frontend directory.")

# Add specific routes for common static files
@app.get("/manifest.json")
async def serve_manifest():
    """Serve the manifest.json file"""
    _frontend_build = (Path(__file__).resolve().parent.parent / "frontend" / "build")
    manifest_path = _frontend_build / "manifest.json"
    
    if manifest_path.exists():
        from fastapi.responses import FileResponse
        return FileResponse(manifest_path, media_type="application/json")
    else:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Manifest not found")

@app.get("/favicon.ico")
async def serve_favicon():
    """Serve the favicon.ico file"""
    _frontend_build = (Path(__file__).resolve().parent.parent / "frontend" / "build")
    favicon_path = _frontend_build / "favicon.ico"
    
    if favicon_path.exists():
        from fastapi.responses import FileResponse
        return FileResponse(favicon_path, media_type="image/x-icon")
    else:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Favicon not found")

@app.get("/logo192.png")
async def serve_logo192():
    """Serve the logo192.png file"""
    _frontend_build = (Path(__file__).resolve().parent.parent / "frontend" / "build")
    logo_path = _frontend_build / "logo192.png"
    
    if logo_path.exists():
        from fastapi.responses import FileResponse
        return FileResponse(logo_path, media_type="image/png")
    else:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Logo192 not found")

@app.get("/logo512.png")
async def serve_logo512():
    """Serve the logo512.png file"""
    _frontend_build = (Path(__file__).resolve().parent.parent / "frontend" / "build")
    logo_path = _frontend_build / "logo512.png"
    
    if logo_path.exists():
        from fastapi.responses import FileResponse
        return FileResponse(logo_path, media_type="image/png")
    else:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Logo512 not found")

@app.get("/robots.txt")
async def serve_robots():
    """Serve the robots.txt file"""
    _frontend_build = (Path(__file__).resolve().parent.parent / "frontend" / "build")
    robots_path = _frontend_build / "robots.txt"
    
    if robots_path.exists():
        from fastapi.responses import FileResponse
        return FileResponse(robots_path, media_type="text/plain")
    else:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Robots.txt not found")

# Manual agent execution endpoints
@app.post("/trigger-agents")
async def trigger_agents_manually():
    """Manually trigger Event Collector, NLP, and Location agents"""
    try:
        from agents.event_collector import collect_event
        from agents.nlp_agent import batch_process_events
        from agents.location_agent import batch_process_event_locations
        
        # Run Event Collector
        print(" Manually triggering Event Collector agent...")
        event_result = await collect_event()
        
        # Run NLP Agent
        print(" Manually triggering NLP agent...")
        nlp_result = await batch_process_events()
        
        # Run Location Agent
        print(" Manually triggering Location agent...")
        location_result = await batch_process_event_locations()
        
        return {
            "status": "success",
            "message": "All agents executed successfully",
            "event_collection": event_result,
            "nlp_processing": nlp_result,
            "location_processing": location_result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to trigger agents: {str(e)}"
        )

@app.post("/trigger-event-collection")
async def trigger_event_collection_manually():
    """Manually trigger event collection only"""
    try:
        from agents.event_collector import collect_event
        result = await collect_event()
        return {
            "status": "success",
            "message": "Event collection completed",
            "result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to trigger event collection: {str(e)}"
        )

@app.post("/trigger-nlp-processing")
async def trigger_nlp_processing_manually():
    """Manually trigger NLP processing only"""
    try:
        from agents.nlp_agent import batch_process_events
        result = await batch_process_events()
        return {
            "status": "success",
            "message": "NLP processing completed",
            "result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to trigger NLP processing: {str(e)}"
        )

@app.post("/trigger-location-processing")
async def trigger_location_processing_manually():
    """Manually trigger location processing only"""
    try:
        from agents.location_agent import batch_process_event_locations
        result = await batch_process_event_locations()
        return {
            "status": "success",
            "message": "Location processing completed",
            "result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to trigger location processing: {str(e)}"
        )


