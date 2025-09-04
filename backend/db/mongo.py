from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()
#connect
client = AsyncIOMotorClient(os.getenv("MONGO_URI"))

#database
db = client["event_finder"]

#collections
events_collection = db["events"]