from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List
import os
import google.generativeai as genai
import json


genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")




def process_event_text(text: str) -> dict:
    prompt = f"""
    Analyze the following event description and return:
    - summary (max 30 words)
    - tags (3–5 relevant keywords)
    - event_type (music, tech, sports, education, food, art, other)
    - sentiment (exciting, formal, casual, neutral)

    Format as a JSON object with keys: summary, tags, event_type, sentiment.

    Description:
    {text}
    """
    try:
        response = model.generate_content(prompt)
        return json.loads(response.text.strip("```"))
    except Exception as e:
        return {
            "summary": "Error generating summary.",
            "tags": [],
            "event_type": "unknown",
            "sentiment": f"Error: {str(e)}"
        }

