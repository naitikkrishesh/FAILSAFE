from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# os → used to read environment variables
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://naitikkrishesh:naitikkrishesh@localhost:5432/failsafe_db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base() # Base = parent class for all database models

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
