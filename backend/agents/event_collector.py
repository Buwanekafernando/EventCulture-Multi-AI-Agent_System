from fastapi import APIRouter
from db.mongo import events_collection
from pydantic import BaseModel
from typing import List
import openai
import json
import httpx
import os
import logging



router = APIRouter()
openai.api_key = os.getenv("OPENAI_API_KEY")

logger = logging.getLogger(__name__)


class Event(BaseModel):
    event_name:str
    location:str
    date:str
    description:str
    booking_url:str
    source:str

EVENT_URLS = [
    {"url": "https://www.eventbrite.com/d/sri-lanka/all-events/", "source": "Eventbrite"},
    {"url": "https://www.meetup.com/cities/lk/colombo/", "source": "Meetup"},
    {"url": "https://allevents.in/colombo", "source": "AllEvents"},
]

