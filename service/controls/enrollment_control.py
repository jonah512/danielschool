from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from ..schemas import models, schemas_entity
from fastapi import HTTPException

class EnrollmentControl:
    def __init__(self, db: Session):
        self.db = db

    def _update_enrolled_number(self, class_id: int, year: int, term: str):
        """Update the enrolled_number for a specific class, filtered by year and term."""
        enrolled_count = (
            self.db.query(func.count(models.Enrollment.id))
            .filter(
                models.Enrollment.class_id == class_id,
                models.Enrollment.year == year,
                models.Enrollment.term == term
            )
            .scalar()
        )
        class_record = self.db.query(models.Class).filter(models.Class.id == class_id).first()
        if class_record:
            class_record.enrolled_number = enrolled_count
            self.db.commit()

    def add(self, enrollment_data: schemas_entity.EnrollmentCreate):
        """Add a new enrollment to the database."""
        new_enrollment = models.Enrollment(**enrollment_data.dict())
        self.db.add(new_enrollment)
        self.db.commit()
        self.db.refresh(new_enrollment)
        self._update_enrolled_number(new_enrollment.class_id, new_enrollment.year, new_enrollment.term)  # Update enrolled_number
        return new_enrollment

    def condition_add(self, enrollment_data: schemas_entity.EnrollmentCreate):
        """Add a new enrollment to the database with a condition."""
        class_record = self.db.query(models.Class).filter(models.Class.id == enrollment_data.class_id).first()
        if not class_record:
            raise HTTPException(status_code=404, detail="Class not found")

        if class_record.enrolled_number >= class_record.max_students:
            raise HTTPException(status_code=400, detail="Class is full")

        new_enrollment = models.Enrollment(**enrollment_data.dict())
        self.db.add(new_enrollment)
        self.db.commit()
        self.db.refresh(new_enrollment)
        self._update_enrolled_number(new_enrollment.class_id, new_enrollment.year, new_enrollment.term)  # Update enrolled_number
        return new_enrollment

    def get(self, year: int, term: str):
        """Retrieve enrollments by year and term."""
        return self.db.query(models.Enrollment).filter(models.Enrollment.year == year, models.Enrollment.term == term).all()

    def modify(self, enrollment_id: int, enrollment_data: schemas_entity.EnrollmentCreate):
        """Modify an existing enrollment's details."""
        enrollment = self.db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
        if not enrollment:
            return None
        old_class_id = enrollment.class_id
        old_year = enrollment.year
        old_term = enrollment.term
        for key, value in enrollment_data.dict().items():
            setattr(enrollment, key, value)
        self.db.commit()
        self.db.refresh(enrollment)
        self._update_enrolled_number(old_class_id, old_year, old_term)  # Update old class enrolled_number
        self._update_enrolled_number(enrollment.class_id, enrollment.year, enrollment.term)  # Update new class enrolled_number
        return enrollment

    def delete(self, enrollment_id: int):
        """Delete an enrollment from the database."""
        enrollment = self.db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
        if not enrollment:
            return None
        class_id = enrollment.class_id
        year = enrollment.year
        term = enrollment.term
        self.db.delete(enrollment)
        self.db.commit()
        self._update_enrolled_number(class_id, year, term)  # Update enrolled_number
        return enrollment
