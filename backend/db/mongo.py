from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()
#connect
client = AsyncIOMotorClient(os.getenv("MONGO_URI"))

#database
db = client["event_finder"]

#user
users_collection = db["users"]
#events
events_collection = db["events"]
#recommendations
recommendations_collection = db["recommendations"]