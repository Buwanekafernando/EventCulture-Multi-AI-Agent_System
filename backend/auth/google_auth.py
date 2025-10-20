from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from authlib.integrations.starlette_client import OAuth
import os
from dotenv import load_dotenv
from fastapi.responses import JSONResponse
from typing import Optional
import httpx
from datetime import datetime, timedelta
from db.database import SessionLocal
from db.models import User
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
load_dotenv()

oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
    # Add proper state handling
    authorize_params={"access_type": "offline", "prompt": "consent"},
)

@router.post("/select-tier")
async def select_tier(request: Request):
    """Store selected tier in session before login"""
    body = await request.json()
    tier = body.get("tier", "free")
    
    print(f"Select tier called with: {tier}")
    print(f"Session ID before: {request.session.get('_id', 'No session ID')}")
    
    if tier not in ["free", "pro"]:
        raise HTTPException(status_code=400, detail="Invalid tier selection")
    
    request.session["selected_tier"] = tier
    print(f"Tier stored in session: {request.session.get('selected_tier')}")
    print(f"Session ID after: {request.session.get('_id', 'No session ID')}")
    
    return JSONResponse({"status": "success", "tier": tier})

@router.get("/login")
async def login(request: Request):
    redirect_uri = request.url_for("auth_callback")
    # Ensure we're using the same base URL for consistency
    base_url = str(request.base_url).rstrip('/')
    redirect_uri = f"{base_url}/callback"
    
    # Get the selected tier from session and pass it as state
    selected_tier = request.session.get("selected_tier", "free")
    state = f"tier:{selected_tier}"
    
    print(f"Login called with tier: {selected_tier}, state: {state}")
    
    return await oauth.google.authorize_redirect(request, redirect_uri, state=state)

@router.get("/callback", name="auth_callback")
async def auth_callback(request: Request):
    try:
        # Debug: Print session info
        print(f"Session ID: {request.session.get('_id', 'No session ID')}")
        print(f"Session keys: {list(request.session.keys())}")
        print(f"Selected tier from session: {request.session.get('selected_tier', 'NOT FOUND')}")
        
        # Get tier from OAuth state parameter
        state = request.query_params.get("state", "")
        print(f"OAuth state parameter: {state}")
        
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
            
    except Exception as e:
        print(f"OAuth callback error: {e}")
        # Return a more user-friendly error page
        return HTMLResponse(
            content="""
            <html>
                <body>
                    <h1>Authentication Error</h1>
                    <p>There was an error during authentication. Please try again.</p>
                    <a href="/login">Try Again</a>
                </body>
            </html>
            """,
            status_code=400
        )
    
    # Upsert user with role persistence
    db = SessionLocal()
    try:
        email = user_info.get("email")
        user = db.query(User).filter(User.email == email).first()
        
        # Get selected tier from OAuth state parameter or session or default to free
        selected_tier = "free"
        if state.startswith("tier:"):
            selected_tier = state.split(":")[1]
            print(f"Tier extracted from state: {selected_tier}")
        else:
            selected_tier = request.session.get("selected_tier", "free")
            print(f"Tier from session: {selected_tier}")
        
        print(f"Final selected tier for user: {selected_tier}")
        
        if not user:
            user = User(
                email=email, 
                name=user_info.get("given_name"), 
                preferences="", 
                role="person",
                tier=selected_tier
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"New user created with tier: {user.tier}")
        else:
            # Update tier if it was changed during login
            if user.tier != selected_tier:
                print(f"Updating existing user tier from {user.tier} to {selected_tier}")
                user.tier = selected_tier
                db.commit()
            else:
                print(f"User tier unchanged: {user.tier}")
        
        # Store session
        request.session["user"] = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "picture": user_info.get("picture"),
            "role": user.role,
            "tier": user.tier,
            "authenticated": True
        }
        
        # Start Analysis agent session for real-time tracking
        try:
            from agents.analysis_agent import AnalysisAgent
            analysis_agent = AnalysisAgent()
            session_data = {
                "user_tier": user.tier,
                "user_role": user.role,
                "login_time": datetime.now().isoformat()
            }
            analysis_result = analysis_agent.start_user_session(user.id, session_data)
            if analysis_result["status"] == "success":
                request.session["analysis_session_id"] = analysis_result["session_id"]
                logger.info(f"Started analysis session for user {user.id}")
        except Exception as analysis_error:
            logger.warning(f"Failed to start analysis session: {analysis_error}")
            # Don't fail login if analysis session fails
    finally:
        db.close()
    
    # Note: Event collection is now handled on server startup, not during login
    # This makes the login process much faster
    
    # Redirect to frontend user home after successful login
    return RedirectResponse(
        url="http://localhost:3000/user-home",
        status_code=302
    )

@router.get("/logout")
async def logout(request: Request):
    # End analysis session if it exists
    analysis_session_id = request.session.get("analysis_session_id")
    if analysis_session_id:
        try:
            from agents.analysis_agent import AnalysisAgent
            analysis_agent = AnalysisAgent()
            analysis_agent.end_user_session(analysis_session_id)
            logger.info(f"Ended analysis session: {analysis_session_id}")
        except Exception as e:
            logger.warning(f"Failed to end analysis session: {e}")
    
    request.session.pop("user", None)
    request.session.pop("analysis_session_id", None)
    return RedirectResponse(url="/")

# Authentication dependency
async def get_current_user(request: Request):
    """Get current authenticated user from session"""
    user = request.session.get("user")
    if not user or not user.get("authenticated"):
        raise HTTPException(
            status_code=401, 
            detail="Authentication required. Please login with Google."
        )
    return user

# Note: Event collection is now handled on server startup for better performance

# User info endpoint
@router.get("/user")
async def get_user_info(request: Request):
    """Get current user information"""
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return JSONResponse({
        "authenticated": True,
        "user": {
            "id": user.get("id"),
            "name": user.get("name"),
            "email": user.get("email"),
            "picture": user.get("picture"),
            "role": user.get("role", "person"),
            "tier": user.get("tier", "free")
        }
    })

@router.post("/user/role")
async def set_user_role(request: Request):
    body = await request.json()
    role = body.get("role", "person")
    session_user = request.session.get("user")
    if not session_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == session_user["id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.role = role
        db.commit()
        request.session["user"]["role"] = role
        return JSONResponse({"status":"ok","role":role})
    finally:
        db.close()

@router.post("/user/upgrade")
async def upgrade_user_tier(request: Request):
    """Upgrade user from Free to Pro tier"""
    session_user = request.session.get("user")
    if not session_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == session_user["id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.tier == "pro":
            return JSONResponse({"status": "already_pro", "message": "User is already on Pro tier"})
        
        # Upgrade to Pro
        user.tier = "pro"
        user.subscription_status = "active"
        user.subscription_start_date = datetime.utcnow()
        # Set subscription end date to 30 days from now (for demo purposes)
        user.subscription_end_date = datetime.utcnow() + timedelta(days=30)
        
        # Create subscription record
        from db.models import UserSubscription
        subscription = UserSubscription(
            user_id=user.id,
            tier="pro",
            status="active",
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=30),
            upgrade_date=datetime.utcnow()
        )
        db.add(subscription)
        
        db.commit()
        request.session["user"]["tier"] = "pro"
        
        return JSONResponse({
            "status": "success", 
            "message": "Successfully upgraded to Pro tier",
            "tier": "pro",
            "subscription_end": user.subscription_end_date.isoformat()
        })
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upgrade failed: {str(e)}")
    finally:
        db.close()

# Manual event collection endpoint (for admin use)
@router.post("/trigger-event-collection")
async def trigger_event_collection_manually(request: Request, current_user: dict = Depends(get_current_user)):
    """Manually trigger event collection"""
    try:
        from agents.event_collector import collect_event
        result = await collect_event()
        return JSONResponse({
            "status": "success",
            "message": "Event collection completed",
            "result": result
        })
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to trigger event collection: {str(e)}"
        )
