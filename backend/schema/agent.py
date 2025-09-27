from pydantic import BaseModel
from typing import List

class RawEvent(BaseModel):
    event_id: int

class EnhancedEvent(BaseModel):
    summary: str
    tags: List[str]
    event_type: str
    sentiment: str