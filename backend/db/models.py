from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from .database import Base

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(255), nullable=False)
    location = Column(String(255))
    date = Column(DateTime)
    description = Column(Text)
    booking_url = Column(String(500))
    source = Column(String(100))
    tags = Column(JSON)
    summary = Column(Text, nullable=True)
    event_type = Column(String(100), nullable=True)
    sentiment = Column(String(50), nullable=True)
    entities = Column(JSON)
    views = Column(Integer, default=0)
    clicks = Column(Integer, default=0)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    name = Column(String(255))
    preferences = Column(Text)
    role = Column(String(50), default="person")
    tier = Column(String(20), default="free")  # "free" or "pro"
    subscription_status = Column(String(20), default="active")  # "active", "expired", "cancelled"
    subscription_start_date = Column(DateTime, nullable=True)
    subscription_end_date = Column(DateTime, nullable=True)
    recommendation_count = Column(Integer, default=0)  # Track recommendations for free users


class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    interests = Column(Text)
    sentiment = Column(String(50))
    events_json = Column(Text)


class UserSubscription(Base):
    __tablename__ = "user_subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    tier = Column(String(20))  # "free" or "pro"
    status = Column(String(20))  # "active", "expired", "cancelled"
    start_date = Column(DateTime)
    end_date = Column(DateTime, nullable=True)
    upgrade_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)  