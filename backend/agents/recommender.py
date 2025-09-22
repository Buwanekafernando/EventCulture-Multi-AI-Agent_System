import os
import json
import google.generativeai as genai
from typing import List

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")

def query_gemini(interests: List[str], sentiment: str) -> List[dict]:
    prompt = f"""
    You are an intelligent event recommender. Based on the user's interests in {', '.join(interests)}
    and preference for {sentiment} experiences, list 5 upcoming events.

    For each event, return:
    - event_name
    - location
    - date
    - description
    - booking_url
    - source (always 'recommendation')

    Format the output strictly as a JSON array of objects.
    """

    try:
        response = model.generate_content(prompt)
        return json.loads(response.text.strip("```"))
    except Exception as e:
        return [{
            "event_name": "Error",
            "location": "",
            "date": "",
            "description": str(e),
            "booking_url": "",
            "source": "recommendation"
        }]
