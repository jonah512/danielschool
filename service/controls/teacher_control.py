import os
import logging
import requests
from sqlalchemy.orm import Session
from ..schemas import models, schemas_entity
import json
from typing import List
from datetime import datetime 
from sqlalchemy import func
from sqlalchemy import desc

logger = logging.getLogger(__name__)

class TeacherControl:
    def __init__(self, db: Session):
        self.db = db

    def add(self, teacher_data: schemas_entity.TeacherCreate):
        """Add a new teacher to the database."""
        new_teacher = models.Teacher(**teacher_data.dict())
        self.db.add(new_teacher)
        self.db.commit()
        self.db.refresh(new_teacher)
        return new_teacher

    def modify(self, teacher_id: int, teacher_data: schemas_entity.TeacherCreate):
        """Modify an existing teacher's details."""
        teacher = self.db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
        if not teacher:
            return None
        for key, value in teacher_data.dict().items():
            setattr(teacher, key, value)
        self.db.commit()
        self.db.refresh(teacher)
        return teacher

    def delete(self, teacher_id: int):
        """Delete a teacher from the database."""
        teacher = self.db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
        if not teacher:
            return None
        self.db.delete(teacher)
        self.db.commit()
        return teacher

    def get(self, teacher_id: int):
        """Retrieve a teacher by ID."""
        teacher = self.db.query(models.Teacher).filter(models.Teacher.id == teacher_id).first()
        return teacher

    def search(self, name: str = None):
        """Search for teachers by name ."""
        query = self.db.query(models.Teacher)
        if name:
            query = query.filter(
                func.lower(models.Teacher.name).like(f"%{name.lower()}%") |
                func.lower(models.Teacher.subject).like(f"%{name.lower()}%") |
                func.lower(models.Teacher.email).like(f"%{name.lower()}%")
            )
        return query.all()
