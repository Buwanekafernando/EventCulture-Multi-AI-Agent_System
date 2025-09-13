from sqlalchemy import Column, Integer, String, Text, DateTime
from .database import Base

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String, nullable=False)
    location = Column(String)
    date = Column(DateTime)
    description = Column(Text)
    booking_url = Column(String)
    source = Column(String)

    summary = Column(Text, nullable=True)
    event_type = Column(String, nullable=True)
    sentiment = Column(String, nullable=True)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    preferences = Column(Text)