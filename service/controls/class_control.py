import logging
from sqlalchemy.orm import Session
from ..schemas import models, schemas_entity

logger = logging.getLogger(__name__)

class ClassControl:
    def __init__(self, db: Session):
        self.db = db

    def add(self, class_data: schemas_entity.ClassCreate):
        """Add a new class to the database."""
        new_class = models.Class(**class_data.dict())
        self.db.add(new_class)
        self.db.commit()
        self.db.refresh(new_class)
        return new_class

    def modify(self, class_id: int, class_data: schemas_entity.ClassCreate):
        """Modify an existing class's details."""
        class_instance = self.db.query(models.Class).filter(models.Class.id == class_id).first()
        if not class_instance:
            return None
        for key, value in class_data.dict().items():
            setattr(class_instance, key, value)
        self.db.commit()
        self.db.refresh(class_instance)
        return class_instance

    def delete(self, class_id: int):
        """Delete a class from the database."""
        class_instance = self.db.query(models.Class).filter(models.Class.id == class_id).first()
        if not class_instance:
            return None
        self.db.delete(class_instance)
        self.db.commit()
        return class_instance

    def get(self, class_id: int):
        """Retrieve a class by ID."""
        class_instance = self.db.query(models.Class).filter(models.Class.id == class_id).first()
        return class_instance

    def search(self, name: str = None, year: int = None, term: str = None):
        """Search for classes by name, year, or term."""
        query = self.db.query(models.Class)
        if name:
            query = query.filter(models.Class.name.ilike(f"%{name}%"))
        if year:
            query = query.filter(models.Class.year == year)
        if term:
            query = query.filter(models.Class.term.ilike(f"%{term}%"))
        return query.all()
