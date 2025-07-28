# Copyright (c) 2025 Milal Daniel Korean School.

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TeacherBase(BaseModel):
    name: str
    subject: str
    email: str
    phone: str

class TeacherCreate(TeacherBase):
    pass

class Teacher(TeacherBase):
    id: int

    class Config:
        orm_mode = True


class StudentBase(BaseModel):
    name: str
    birth_date: datetime
    email: str
    phone: str
    parent_name: str
    address: str
    gender: str
    religion: str
    church: str
    korean_level: int
    grade: int

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True


class ClassBase(BaseModel):
    name: str
    description: str
    year: int
    term: str
    teacher_id: Optional[int] = 1
    min_grade: int
    max_grade: int
    max_students: int
    period: int
    fee: float
    mendatory: bool
    enrolled_number: Optional[int] = 0 
    min_korean_level: int
    max_korean_level: int
    
class ClassCreate(ClassBase):
    pass

class Class(ClassBase):
    id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str
    email: str
    is_active: Optional[int] = 1
    role: str  # New field for role

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class EnrollmentBase(BaseModel):
    student_id: int
    class_id: int
    comment: Optional[str] = None
    status: str = "active"
    year: int
    term: str

class EnrollmentCreate(EnrollmentBase):
    pass

class Enrollment(EnrollmentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True

class ScheduleBase(BaseModel):
    year: int
    term: str
    opening_time: datetime
    closing_time: datetime

class ScheduleCreate(ScheduleBase):
    pass

class Schedule(ScheduleBase):
    id: int
    class Config:
        orm_mode = True


class ConsentBase(BaseModel):
    title: str
    content: str
    content_eng: str

class ConsentCreate(ConsentBase):
    pass

class Consent(ConsentBase):
    id: int
    class Config:
        orm_mode = True

class LogBase(BaseModel):
    email: str
    log: str
    action_time: datetime

class LogCreate(LogBase):
    pass

class Log(LogBase):
    id: int
    class Config:
        orm_mode = True

class RequestBase(BaseModel):
    email: str
    name: str
    phone: str
    students: str
    message: str
    status: str
    memo: str

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


