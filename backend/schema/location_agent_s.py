from pydantic import BaseModel
from typing import Optional, Dict

class LocationResponse(BaseModel):
    cleaned_location: str
    map_url: str
    embed_url: str

class Coordinates(BaseModel):
    lat: float
    lon: float
    display_name: Optional[str] = None

class MapCenter(BaseModel):
    lat: float
    lon: float

class OpenLayersLocationResponse(BaseModel):
    is_virtual: bool
    location_name: str
    coordinates: Optional[Coordinates] = None
    map_center: MapCenter
    zoom_level: int