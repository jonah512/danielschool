# Copyright (c) 2025 Milal Daniel Korean School.
'''
This file handles the CRUD operations (Create, Read, Update, Delete) for the TrainingJob model. 
This defines implementations of API functions.
'''
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
import csv
from io import StringIO

# Initialize the logger
logger = logging.getLogger(__name__)

class StudentControl:
    def __init__(self, db: Session):
        self.db = db

    def add(self, student_data: schemas_entity.StudentCreate):
        """Add a new student to the database."""
        new_student = models.Student(**student_data.dict())
        self.db.add(new_student)
        self.db.commit()
        self.db.refresh(new_student)
        return new_student

    def modify(self, student_id: int, student_data: schemas_entity.StudentCreate):
        """Modify an existing student's details."""
        student = self.db.query(models.Student).filter(models.Student.id == student_id).first()
        if not student:
            return None
        for key, value in student_data.dict().items():
            setattr(student, key, value)
        self.db.commit()
        self.db.refresh(student)
        return student

    def delete(self, student_id: int):
        """Delete a student from the database."""
        student = self.db.query(models.Student).filter(models.Student.id == student_id).first()
        if not student:
            return None
        self.db.delete(student)
        self.db.commit()
        return student

    def search(self, name: str = None):
        """Search for students by name or email with pagination."""
        query = self.db.query(models.Student)
        if name:
            query = query.filter(
                func.lower(models.Student.name).like(f"%{name.lower()}%") |
                func.lower(models.Student.email).like(f"%{name.lower()}%")
            )
        return query.all()

    def get(self, student_id: int):
        """Retrieve a student by ID."""
        student = self.db.query(models.Student).filter(models.Student.id == student_id).first()
        return student

    def bulk_add_from_csv(self, csv_content: str):
        """Add multiple students from a CSV file."""
        csv_reader = csv.DictReader(StringIO(csv_content))
        students = []
        for row in csv_reader:
            # Remove BOM marker if present in the keys
            row = {key.lstrip('\ufeff'): value for key, value in row.items()}
            
            # Ensure required fields are present
            if not row.get('name'):
                logger.warning("Skipping row due to missing 'name': %s", row)
                continue
            
            # Set default birth_date if missing or invalid
            if not row.get('birth_date'):
                row['birth_date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            try:
                student_data = schemas_entity.StudentCreate(**row)
                students.append(models.Student(**student_data.dict()))
            except Exception as e:
                logger.error("Error creating student from row: %s, error: %s", row, e)
                continue
        
        self.db.bulk_save_objects(students)
        self.db.commit()
        return students
