# Copyright (c) 2025 Milal Daniel Korean School.

from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, TEXT  # Updated import
from sqlalchemy.orm import relationship
from ..db_config import Base
from datetime import datetime

class Teacher(Base):
    __tablename__ = "Teacher"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), index=True)
    subject = Column(String(100))
    email = Column(String(255))
    phone = Column(String(20))

class Student(Base):
    __tablename__ = "Student"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), index=True)
    birth_date = Column(DateTime)
    email = Column(String(255))
    phone = Column(String(20))
    parent_name = Column(String(100))
    address = Column(String(500))
    gender = Column(String(10))
    religion = Column(String(50))
    church = Column(String(200))
    korean_level = Column(Integer)
    korean_level_confirmed = Column(Integer, default=0)
    grade = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Class(Base):
    __tablename__ = "Class"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), index=True)
    description = Column(String(500))
    year = Column(Integer)
    term = Column(String(20)) # spring, or fall
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
    display_order = Column(Integer, default=0)

class User(Base):
    __tablename__ = "User"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    role = Column(String(20), default="admin")  # New column for role


class Enrollment(Base):
    __tablename__ = "Enrollment"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer)
    class_id = Column(Integer)
    comment = Column(String(1000))
    status = Column(String(20))  # draft, enrolled, waitlisted, dropped
    year = Column(Integer)
    term = Column(String(20))  # spring, or fall
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Schedule(Base):
    __tablename__ = "Schedule"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    year = Column(Integer)
    term = Column(String(20))  # spring, or fall
    opening_time = Column(DateTime)
    closing_time = Column(DateTime)



class Consent(Base):
    __tablename__ = "Consent"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200))
    content = Column(TEXT)  # Changed to TEXT
    content_eng = Column(TEXT)  # Changed to TEXT

class Log(Base):
    __tablename__ = "Log"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255))
    log = Column(TEXT)
    action_time = Column(DateTime)

class Request(Base):
    __tablename__ = "Request"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255))
    phone = Column(String(20))
    name = Column(String(100))
    students = Column(String(500))
    message = Column(TEXT)
    status = Column(String(20))
    memo = Column(TEXT)
    request_time = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)