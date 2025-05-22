# Copyright (c) 2025 Milal Daniel Korean School.

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = "/home/data/master_db"
DATABASE_FILENAME = "database.sqlite"
SQLITE_DATABASE_URL = f"sqlite:///{BASE_DIR}/{DATABASE_FILENAME}"

os.makedirs(BASE_DIR, exist_ok=True)
engine = create_engine(
    SQLITE_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
