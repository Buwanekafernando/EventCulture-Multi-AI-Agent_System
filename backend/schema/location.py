from pydantic import BaseModel

class LocationResponse(BaseModel):
    cleaned_location: str
    map_url: str
    embed_url: str