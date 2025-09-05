from fastapi import APIRouter
from db.mongo import events_collection
from pydantic import BaseModel
from typing import List
import openai
import json
import httpx
import os
import logging



