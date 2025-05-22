from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..controls.class_control import ClassControl
from ..schemas.schemas_entity import Class, ClassCreate
from ..db_config import SessionLocal

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/classes/", response_model=Class)
def add_class(class_data: ClassCreate, db: Session = Depends(get_db)):
    """Add a new class."""
    return ClassControl(db).add(class_data)

@router.put("/classes/{class_id}/", response_model=Class)
def modify_class(class_id: int, class_data: ClassCreate, db: Session = Depends(get_db)):
    """Modify an existing class."""
    updated_class = ClassControl(db).modify(class_id, class_data)
    if not updated_class:
        raise HTTPException(status_code=404, detail="Class not found")
    return updated_class

@router.delete("/classes/{class_id}/", response_model=Class)
def delete_class(class_id: int, db: Session = Depends(get_db)):
    """Delete a class."""
    deleted_class = ClassControl(db).delete(class_id)
    if not deleted_class:
        raise HTTPException(status_code=404, detail="Class not found")
    return deleted_class

@router.get("/classes/{class_id}/", response_model=Class)
def get_class(class_id: int, db: Session = Depends(get_db)):
    """Retrieve a class by ID."""
    class_instance = ClassControl(db).get(class_id)
    if not class_instance:
        raise HTTPException(status_code=404, detail="Class not found")
    return class_instance

@router.get("/classes/", response_model=List[Class])
def search_classes(name: Optional[str] = None, year: Optional[int] = None, term: Optional[str] = None, db: Session = Depends(get_db)):
    """Search for classes by name, year, or term."""
    return ClassControl(db).search(name=name, year=year, term=term)
