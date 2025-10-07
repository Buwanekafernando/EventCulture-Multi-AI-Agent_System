import os
import json
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")

def refine_location_with_llm(raw_location: str, description: str) -> str:
    prompt = f"""
    You are a location assistant. Given the raw location and event description, infer the most accurate physical location name suitable for Google Maps search.

    Return only the cleaned location string.

    Raw Location: {raw_location}
    Event Description: {description}
    """

    try:
        response = model.generate_content(prompt)
        return response.text.strip("```").strip()
    except Exception as e:
        return raw_location  