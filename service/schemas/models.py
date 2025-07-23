# Copyright (c) 2025 Milal Daniel Korean School.

from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, TEXT  # Updated import
from sqlalchemy.orm import relationship
from ..db_config import Base
from datetime import datetime

class Teacher(Base):
    __tablename__ = "Teacher"
    __table_args__ = {"sqlite_autoincrement": True}  # Ensure IDs are not reused in SQLite
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    subject = Column(String)
    email = Column(String, unique=True)
    phone = Column(String, unique=True)

class Student(Base):
    __tablename__ = "Student"
    __table_args__ = {"sqlite_autoincrement": True}  # Ensure IDs are not reused in SQLite
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    birth_date = Column(DateTime)
    email = Column(String)
    phone = Column(String)
    parent_name = Column(String)
    address = Column(String)
    gender = Column(String)
    religion = Column(String)
    church = Column(String)
    korean_level = Column(Integer)
    grade = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Class(Base):
    __tablename__ = "Class"
    __table_args__ = {"sqlite_autoincrement": True}  # Ensure IDs are not reused in SQLite
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    description = Column(String)
    year = Column(Integer)
    term = Column(String) # spring, or fall
    teacher_id = Column(Integer)
    min_grade = Column(Integer)
    max_grade = Column(Integer)
    max_students = Column(Integer)
    period = Column(Integer)
    fee = Column(Float)
    mendatory = Column(Integer)
    enrolled_number = Column(Integer, default=0)
    min_korean_level = Column(Integer, default=1)
    max_korean_level = Column(Integer, default=12)

class User(Base):
    __tablename__ = "User"
    __table_args__ = {"sqlite_autoincrement": True}  # Ensure IDs are not reused in SQLite
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    role = Column(String, default="admin")  # New column for role


class Enrollment(Base):
    __tablename__ = "Enrollment"
    __table_args__ = {"sqlite_autoincrement": True}  # Ensure IDs are not reused in SQLite
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer)
    class_id = Column(Integer)
    comment = Column(String)
    status = Column(String)  # draft, enrolled, waitlisted, dropped
    year = Column(Integer)
    term = Column(String)  # spring, or fall
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Schedule(Base):
    __tablename__ = "Schedule"
    __table_args__ = {"sqlite_autoincrement": True}  # Ensure IDs are not reused in SQLite
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    year = Column(Integer)
    term = Column(String)  # spring, or fall
    opening_time = Column(DateTime)
    closing_time = Column(DateTime)



class Consent(Base):
    __tablename__ = "Consent"
    __table_args__ = {"sqlite_autoincrement": True}  # Ensure IDs are not reused in SQLite
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String)
    content = Column(TEXT)  # Changed to TEXT
    content_eng = Column(TEXT)  # Changed to TEXT

class Log(Base):
    __tablename__ = "Log"
    __table_args__ = {"sqlite_autoincrement": True}  # Ensure IDs are not reused in SQLite
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String)
    log = Column(TEXT)
    action_time = Column(DateTime)

class Request(Base):
    __tablename__ = "Request"
    __table_args__ = {"sqlite_autoincrement": True}  # Ensure IDs are not reused in SQLite
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String)
    phone = Column(String)
    name = Column(String)
    students = Column(String)
    message = Column(TEXT)
    status = Column(String)
    memo = Column(TEXT)
    request_time = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)