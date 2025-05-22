
from fastapi import FastAPI, Depends, HTTPException, APIRouter
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
from ..controls.enrollment_control import EnrollmentControl

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/enrollment/", response_model=schemas_entity.Enrollment)
def create_enrollment(enrollment: schemas_entity.EnrollmentCreate, db: Session = Depends(get_db)):
    control = EnrollmentControl(db)
    return control.add(enrollment)

@router.get("/enrollment/", response_model=List[schemas_entity.Enrollment])
def get_enrollment(year: int, term: str, db: Session = Depends(get_db)):
    control = EnrollmentControl(db)
    enrollment = control.get(year, term)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return enrollment

@router.put("/enrollment/{enrollment_id}", response_model=schemas_entity.Enrollment)
def update_enrollment(enrollment_id: int, enrollment: schemas_entity.EnrollmentCreate, db: Session = Depends(get_db)):
    control = EnrollmentControl(db)
    updated_enrollment = control.modify(enrollment_id, enrollment)
    if not updated_enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return updated_enrollment

@router.delete("/enrollment/{enrollment_id}")
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    control = EnrollmentControl(db)
    deleted = control.delete(enrollment_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"detail": "Enrollment deleted successfully"}
