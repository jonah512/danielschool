# Copyright (c) 2025 Milal Daniel Korean School.

from fastapi import FastAPI, Depends, HTTPException, APIRouter, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from ..schemas import models, schemas_entity
from ..db_config import SessionLocal, engine
from ..logging_config import setup_logging
import logging
from typing import List, Optional
import time
from pathlib import Path

from ..controls.student_control import StudentControl
from ..schemas.schemas_entity import Student, StudentCreate

setup_logging()
logger = logging.getLogger(__name__)

logger.info("==================================================")
logger.info("====          Daneil Service Begins!          ====")
logger.info("==================================================")

# Initialize database
models.Base.metadata.create_all(bind=engine)

router = APIRouter()

#training_server_control = TrainingServerControl() # Instantiate the impl class for the training server management


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

student_control = StudentControl(db=SessionLocal())

@router.post("/students/", response_model=Student)
def add_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Add a new student."""
    return student_control.add(student)

@router.put("/students/{student_id}/", response_model=Student)
def modify_student(student_id: int, student: StudentCreate, db: Session = Depends(get_db)):
    """Modify an existing student."""
    updated_student = student_control.modify(student_id, student)
    if not updated_student:
        raise HTTPException(status_code=404, detail="Student not found")
    return updated_student

@router.delete("/students/{student_id}/", response_model=Student)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Delete a student."""
    deleted_student = student_control.delete(student_id)
    if not deleted_student:
        raise HTTPException(status_code=404, detail="Student not found")
    return deleted_student

@router.get("/students/{student_id}/", response_model=Student)
def get_student(student_id: int, db: Session = Depends(get_db)):
    """Retrieve a student by ID."""
    student = student_control.get(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.get("/students/", response_model=List[Student])
def search_students(name: Optional[str] = None, db: Session = Depends(get_db)):
    """Search for students by name or email."""
    return student_control.search(name=name)

@router.post("/students/upload_csv/")
def upload_students_csv(file: UploadFile, db: Session = Depends(get_db)):
    """Upload a CSV file and add students."""
    if file.content_type != "text/csv":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")
    content = file.file.read().decode("utf-8")
    students = student_control.bulk_add_from_csv(content)
    return {"message": f"{len(students)} students added successfully."}