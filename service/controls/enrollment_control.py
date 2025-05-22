from sqlalchemy.orm import Session
from ..schemas import models, schemas_entity

class EnrollmentControl:
    def __init__(self, db: Session):
        self.db = db

    def add(self, enrollment_data: schemas_entity.EnrollmentCreate):
        """Add a new enrollment to the database."""
        new_enrollment = models.Enrollment(**enrollment_data.dict())
        self.db.add(new_enrollment)
        self.db.commit()
        self.db.refresh(new_enrollment)
        return new_enrollment

    def get(self, year: int, term: str):
        """Retrieve an enrollment by ID."""
        return self.db.query(models.Enrollment).filter(models.Enrollment.year == year, models.Enrollment.term == term).all()

    def modify(self, enrollment_id: int, enrollment_data: schemas_entity.EnrollmentCreate):
        """Modify an existing enrollment's details."""
        enrollment = self.db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
        if not enrollment:
            return None
        for key, value in enrollment_data.dict().items():
            setattr(enrollment, key, value)
        self.db.commit()
        self.db.refresh(enrollment)
        return enrollment

    def delete(self, enrollment_id: int):
        """Delete an enrollment from the database."""
        enrollment = self.db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
        if not enrollment:
            return None
        self.db.delete(enrollment)
        self.db.commit()
        return enrollment
