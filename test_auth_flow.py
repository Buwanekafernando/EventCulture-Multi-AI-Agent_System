#!/usr/bin/env python3
"""
Test script for EventCulture Authentication and Agent Flow
This script demonstrates the complete authentication and agent triggering flow
"""

import asyncio
import httpx
import json
import os
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"

async def test_auth_flow():
    """Test the complete authentication and agent flow"""
    print("🔐 Testing EventCulture Authentication & Agent Flow")
    print("=" * 60)
    
    # Check if server is running
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/")
            if response.status_code == 200:
                print("✅ Server is running")
            else:
                print("❌ Server is not responding properly")
                return
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        print("💡 Make sure to start the server first with: uvicorn main:app --reload")
        return
    
    print("\n📋 AUTHENTICATION FLOW TEST:")
    print("-" * 40)
    
    # Test 1: Check authentication status (should be unauthenticated)
    print("\n1️⃣  Testing unauthenticated access...")
    try:
        async with httpx.AsyncClient() as client:
            # Try to access protected endpoint without auth
            response = await client.get(f"{BASE_URL}/api/collector/events/")
            if response.status_code == 401:
                print("✅ Authentication protection working - 401 Unauthorized")
            else:
                print(f"⚠️  Expected 401, got {response.status_code}")
                
    except Exception as e:
        print(f"❌ Error testing unauthenticated access: {e}")
    
    # Test 2: Check user info (should be unauthenticated)
    print("\n2️⃣  Testing user info endpoint...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/user")
            if response.status_code == 401:
                print("✅ User info endpoint protected - 401 Unauthorized")
            else:
                print(f"⚠️  Expected 401, got {response.status_code}")
                
    except Exception as e:
        print(f"❌ Error testing user info: {e}")
    
    print("\n📋 MANUAL TESTING INSTRUCTIONS:")
    print("-" * 40)
    print("🔗 To test the complete flow manually:")
    print("1. Open your browser and go to: http://localhost:8000/login")
    print("2. Complete Google OAuth authentication")
    print("3. You'll be redirected to: /dashboard?auth=success&user=YourName")
    print("4. The system will automatically trigger agents after login")
    print("5. Test protected endpoints with authenticated session")
    
    print("\n🔗 TESTING ENDPOINTS:")
    print("-" * 40)
    print("📡 Event Collection:")
    print("   GET  /api/collector/events/ - List events (requires auth)")
    print("   POST /api/collector/collect-events/ - Collect events (requires auth)")
    
    print("\n🧠 NLP Processing:")
    print("   POST /api/nlp/batch-enhance - Enhance events with NLP (requires auth)")
    
    print("\n📍 Location Services:")
    print("   GET  /api/location/locate-event/{event_id} - Get event location (requires auth)")
    
    print("\n🎯 Recommendations:")
    print("   POST /api/recommend/discover-events - Get recommendations (requires auth)")
    print("   GET  /api/recommend/recommendations/{user_id} - Get past recommendations (requires auth)")
    
    print("\n🔐 Authentication:")
    print("   GET  /login - Start Google OAuth")
    print("   GET  /user - Get current user info (requires auth)")
    print("   POST /trigger-agents - Manually trigger agents (requires auth)")
    print("   GET  /logout - Logout")

def print_authentication_guide():
    """Print comprehensive authentication guide"""
    print("\n" + "="*60)
    print("🔐 COMPREHENSIVE AUTHENTICATION GUIDE")
    print("="*60)
    
    print("\n1️⃣  ENVIRONMENT SETUP:")
    print("   • Create .env file in backend/ directory")
    print("   • Add required environment variables:")
    print("     - GOOGLE_CLIENT_ID=your_google_client_id")
    print("     - GOOGLE_CLIENT_SECRET=your_google_client_secret")
    print("     - JWT_SECRET=your_jwt_secret_key")
    print("     - GEMINI_API_KEY=your_gemini_api_key")
    
    print("\n2️⃣  GOOGLE OAUTH SETUP:")
    print("   • Go to Google Cloud Console")
    print("   • Create OAuth 2.0 credentials")
    print("   • Add authorized redirect URI: http://localhost:8000/callback")
    print("   • Copy Client ID and Secret to .env file")
    
    print("\n3️⃣  START THE SERVER:")
    print("   cd backend")
    print("   uvicorn main:app --reload")
    print("   • Server will run on http://localhost:8000")
    
    print("\n4️⃣  AUTHENTICATION FLOW:")
    print("   • User visits: http://localhost:8000/login")
    print("   • Redirected to Google OAuth")
    print("   • After successful auth, redirected to: /dashboard?auth=success&user=Name")
    print("   • Agents are automatically triggered")
    print("   • User session is established")
    
    print("\n5️⃣  PROTECTED ENDPOINTS:")
    print("   • All agent endpoints now require authentication")
    print("   • Unauthenticated requests return 401 Unauthorized")
    print("   • User session persists across requests")
    
    print("\n6️⃣  AGENT AUTOMATION:")
    print("   • Event collection runs automatically after login")
    print("   • Manual trigger available: POST /trigger-agents")
    print("   • All agents respect user authentication")
    
    print("\n7️⃣  TESTING WITH CURL:")
    print("   # Test unauthenticated access (should get 401)")
    print("   curl http://localhost:8000/api/collector/events/")
    print("   ")
    print("   # Test with session cookie (after browser login)")
    print("   curl -b 'session=your_session_cookie' http://localhost:8000/api/collector/events/")

async def main():
    """Main test function"""
    print_authentication_guide()
    await test_auth_flow()
    
    print("\n" + "="*60)
    print("🎉 Authentication flow testing completed!")
    print("💡 Use browser to test the complete OAuth flow")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(main())
