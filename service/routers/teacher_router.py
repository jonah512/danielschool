from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..controls.teacher_control import TeacherControl
from ..schemas.schemas_entity import Teacher, TeacherCreate
from ..db_config import SessionLocal

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/teachers/", response_model=Teacher)
def add_teacher(teacher: TeacherCreate, db: Session = Depends(get_db)):
    """Add a new teacher."""
    return TeacherControl(db).add(teacher)

@router.put("/teachers/{teacher_id}/", response_model=Teacher)
def modify_teacher(teacher_id: int, teacher: TeacherCreate, db: Session = Depends(get_db)):
    """Modify an existing teacher."""
    updated_teacher = TeacherControl(db).modify(teacher_id, teacher)
    if not updated_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return updated_teacher

@router.delete("/teachers/{teacher_id}/", response_model=Teacher)
def delete_teacher(teacher_id: int, db: Session = Depends(get_db)):
    """Delete a teacher."""
    deleted_teacher = TeacherControl(db).delete(teacher_id)
    if not deleted_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return deleted_teacher

@router.get("/teachers/{teacher_id}/", response_model=Teacher)
def get_teacher(teacher_id: int, db: Session = Depends(get_db)):
    """Retrieve a teacher by ID."""
    teacher = TeacherControl(db).get(teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.get("/teachers/", response_model=List[Teacher])
def search_teachers(name: Optional[str] = None, db: Session = Depends(get_db)):
    """Search for teachers by name or email."""
    return TeacherControl(db).search(name=name)
