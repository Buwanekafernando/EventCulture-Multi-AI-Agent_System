from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

def _build_mysql_url() -> str:
    from urllib.parse import quote_plus
    
    user = os.getenv("MYSQL_USER")
    password = os.getenv("MYSQL_PASSWORD")
    host = os.getenv("MYSQL_HOST")
    port = os.getenv("MYSQL_PORT")
    db_name = os.getenv("MYSQL_DB")
    
    
    encoded_password = quote_plus(password)
    
    return f"mysql+pymysql://{user}:{encoded_password}@{host}:{port}/{db_name}?charset=utf8mb4"

DATABASE_URL =_build_mysql_url()

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()