# Copyright (c) 2025 Milal Daniel Korean School.

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get database URL from environment variable, fallback to SQLite for local development
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Production MySQL configuration
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600
    )
else:
    # Local development SQLite fallback
    BASE_DIR = "/home/data/master_db"
    DATABASE_FILENAME = "database.sqlite"
    SQLITE_DATABASE_URL = f"sqlite:///{BASE_DIR}/{DATABASE_FILENAME}"
    
    os.makedirs(BASE_DIR, exist_ok=True)
    engine = create_engine(
        SQLITE_DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
