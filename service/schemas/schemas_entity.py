# Copyright (c) 2025 Milal Daniel Korean School.

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TeacherBase(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class TeacherCreate(TeacherBase):
    pass

class Teacher(TeacherBase):
    id: int

    class Config:
        from_attributes = True


class StudentBase(BaseModel):
    name: Optional[str] = None
    birth_date: Optional[datetime] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    parent_name: Optional[str] = None
    address: Optional[str] = None
    gender: Optional[str] = None
    religion: Optional[str] = None
    church: Optional[str] = None
    korean_level: Optional[int] = None
    korean_level_confirmed: Optional[int] = 0
    grade: Optional[int] = None

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True


class ClassBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    year: Optional[int] = None
    term: Optional[str] = None
    teacher_id: Optional[int] = 1
    min_grade: Optional[int] = None
    max_grade: Optional[int] = None
    max_students: Optional[int] = None
    period: Optional[int] = None
    fee: Optional[float] = None
    mendatory: Optional[bool] = None
    enrolled_number: Optional[int] = 0 
    min_korean_level: Optional[int] = None
    max_korean_level: Optional[int] = None
    display_order: Optional[int] = None
    
class ClassCreate(ClassBase):
    pass

class Class(ClassBase):
    id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[int] = 1
    role: Optional[str] = "admin"  # New field for role

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class EnrollmentBase(BaseModel):
    student_id: Optional[int] = None
    class_id: Optional[int] = None
    comment: Optional[str] = None
    status: Optional[str] = "active"
    year: Optional[int] = None
    term: Optional[str] = None

class EnrollmentCreate(EnrollmentBase):
    pass

class Enrollment(EnrollmentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True

class ScheduleBase(BaseModel):
    year: Optional[int] = None
    term: Optional[str] = None
    opening_time: Optional[datetime] = None
    closing_time: Optional[datetime] = None

class ScheduleCreate(ScheduleBase):
    pass

class Schedule(ScheduleBase):
    id: int
    class Config:
        orm_mode = True


class ConsentBase(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    content_eng: Optional[str] = None

class ConsentCreate(ConsentBase):
    pass

class Consent(ConsentBase):
    id: int
    class Config:
        orm_mode = True

class LogBase(BaseModel):
    email: Optional[str] = None
    log: Optional[str] = None
    action_time: Optional[datetime] = None

class LogCreate(LogBase):
    pass

class Log(LogBase):
    id: int
    class Config:
        orm_mode = True

class RequestBase(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    students: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None
    memo: Optional[str] = None

class RequestCreate(RequestBase):
    pass

class Request(RequestBase):
    id: int
    request_time: datetime
    class Config:
        orm_mode = True

class EmailRequest(BaseModel):
    receiver: str
    title: str
    body: str


