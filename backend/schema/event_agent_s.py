from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EventCreate(BaseModel): #event from ai output 
    event_name: str
    location: Optional[str]
    date: Optional[datetime]
    description: Optional[str]
    booking_url: Optional[str]
    source: Optional[str]


class EventOut(EventCreate):
    id: int
