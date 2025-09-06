from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
import openai
import os
import json

router = APIRouter()
openai.api_key = os.getenv("OPENAI_API_KEY")

