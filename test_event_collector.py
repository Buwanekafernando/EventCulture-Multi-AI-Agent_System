#!/usr/bin/env python3
"""
Test script for EventCulture Event Collector Agent
This script tests the event collector functionality
"""

import asyncio
import httpx
import json
import os
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
COLLECT_ENDPOINT = f"{BASE_URL}/api/collector/collect-events/"
LIST_EVENTS_ENDPOINT = f"{BASE_URL}/api/collector/events/"

async def test_event_collection():
    """Test the event collection functionality"""
    print("🚀 Testing Event Collector Agent")
    print("=" * 50)
    
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
    
    # Test 1: Collect events
    print("\n📡 Testing event collection...")
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(COLLECT_ENDPOINT)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Event collection successful!")
                print(f"   📊 Events collected: {result.get('events_collected', 0)}")
                print(f"   🆔 Inserted IDs: {result.get('inserted_ids', [])}")
            else:
                print(f"❌ Event collection failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return
                
    except Exception as e:
        print(f"❌ Error during event collection: {e}")
        return
    
    # Test 2: List collected events
    print("\n📋 Testing event listing...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(LIST_EVENTS_ENDPOINT)
            
            if response.status_code == 200:
                events = response.json()
                print(f"✅ Found {len(events)} events in database")
                
                if events:
                    print("\n📅 Sample events:")
                    for i, event in enumerate(events[:3]):  # Show first 3 events
                        print(f"   {i+1}. {event.get('event_name', 'N/A')}")
                        print(f"      📍 Location: {event.get('location', 'N/A')}")
                        print(f"      📅 Date: {event.get('date', 'N/A')}")
                        print(f"      🔗 Source: {event.get('source', 'N/A')}")
                        print()
                else:
                    print("   ⚠️  No events found in database")
            else:
                print(f"❌ Failed to list events: {response.status_code}")
                
    except Exception as e:
        print(f"❌ Error listing events: {e}")

def check_environment():
    """Check if required environment variables are set"""
    print("🔍 Checking environment setup...")
    
    required_vars = ["GEMINI_API_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("💡 Create a .env file with:")
        for var in missing_vars:
            print(f"   {var}=your_api_key_here")
        return False
    else:
        print("✅ All required environment variables are set")
        return True

def print_testing_guide():
    """Print comprehensive testing guide"""
    print("\n" + "="*60)
    print("🧪 COMPREHENSIVE TESTING GUIDE")
    print("="*60)
    
    print("\n1️⃣  ENVIRONMENT SETUP:")
    print("   • Create .env file in backend/ directory")
    print("   • Add: GEMINI_API_KEY=your_gemini_api_key")
    print("   • Install dependencies: pip install -r requirements.txt")
    
    print("\n2️⃣  START THE SERVER:")
    print("   cd backend")
    print("   uvicorn main:app --reload")
    print("   • Server will run on http://localhost:8000")
    
    print("\n3️⃣  TEST ENDPOINTS:")
    print("   • POST /api/collector/collect-events/ - Collect events")
    print("   • GET  /api/collector/events/ - List all events")
    print("   • GET  / - Health check")
    
    print("\n4️⃣  MANUAL TESTING:")
    print("   • Use Postman/Insomnia to test endpoints")
    print("   • Use curl commands:")
    print("     curl -X POST http://localhost:8000/api/collector/collect-events/")
    print("     curl http://localhost:8000/api/collector/events/")
    
    print("\n5️⃣  EXPECTED BEHAVIOR:")
    print("   • Collects events from 3 Sri Lanka sources")
    print("   • Extracts: event_name, location, date, description, booking_url, source")
    print("   • Stores events in SQLite database")
    print("   • Returns success status with event count")
    
    print("\n6️⃣  TROUBLESHOOTING:")
    print("   • Check GEMINI_API_KEY is valid")
    print("   • Ensure internet connection for web scraping")
    print("   • Check server logs for errors")
    print("   • Verify database file is created (eventfinder.db)")

async def main():
    """Main test function"""
    print_testing_guide()
    
    if not check_environment():
        return
    
    await test_event_collection()
    
    print("\n" + "="*50)
    print("🎉 Testing completed!")
    print("="*50)

if __name__ == "__main__":
    asyncio.run(main())
