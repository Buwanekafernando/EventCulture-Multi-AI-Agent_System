from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List
import openai
import os
import json
from db.mongo import events_collection  # MongoDB events collection
from bson import ObjectId


router = APIRouter()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Input 
class RawEvent(BaseModel):
    event_id: str  #ID in MongoDB
    text: str

# Output 
class EnhancedEvent(BaseModel):
    summary: str
    event_type: str
    sentiment: str

def process_event_text(text: str) -> Dict[str, str]:
   
    prompt = f"""
    You are an intelligent event processor. 
    Given the following event description, perform the following tasks:

    1. Summarize the event in 2–3 sentences.
    2. Classify the event type (choose from: music, tech, sports, education, food, art, other).
    3. Analyze the sentiment (choose from: exciting, formal, casual, neutral).

    Return the result strictly as a JSON object with keys: summary, event_type, sentiment.

    Event Description:
    {text}
    """

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400
    )

    try:
        structured_json = response["choices"][0]["message"]["content"]
        return json.loads(structured_json)
    except Exception as e:
        return {
            "summary": "Error generating summary.",
            "event_type": "unknown",
            "sentiment": f"Error: {str(e)}"
        }

@router.post("/enhance-event")
async def enhance_event(raw: RawEvent):
    """Enhance a single event and update MongoDB"""
    result = process_event_text(raw.text)

    try:
        await events_collection.update_one(
            {"_id": ObjectId(raw.event_id)},
            {"$set": {
                "summary": result["summary"],
                "event_type": result["event_type"],
                "sentiment": result["sentiment"]
            }}
        )
    except Exception as e:
        result["sentiment"] += f" (DB error: {str(e)})"

    return EnhancedEvent(**result)


@router.post("/batch-enhance")
async def batch_enhance_events():
    
    #Batch process all events 
    cursor = events_collection.find({
        "$or": [
            {"summary": {"$exists": False}},
            {"event_type": {"$exists": False}},
            {"sentiment": {"$exists": False}}
        ]
    })

    updated_count = 0
    processed_events: List[Dict] = []

    async for event in cursor:
        desc = event.get("description", "")
        if not desc:
            continue 

        result = process_event_text(desc)

        await events_collection.update_one(
            {"_id": event["_id"]},
            {"$set": {
                "summary": result["summary"],
                "event_type": result["event_type"],
                "sentiment": result["sentiment"]
            }}
        )

        updated_count += 1
        processed_events.append({
            "event_id": str(event["_id"]),
            **result
        })

    return {
        "status": "success",
        "updated_count": updated_count,
        "enhanced_events": processed_events
    }

 #Return all events
@router.get("/enhanced-events")
async def get_enhanced_events():
    
    cursor = events_collection.find({
        "summary": {"$exists": True},
        "event_type": {"$exists": True},
        "sentiment": {"$exists": True}
    })
    return [event async for event in cursor]