import logging
from sqlalchemy.orm import Session
from ..schemas import models, schemas_entity

logger = logging.getLogger(__name__)

class ScheduleControl:
    def __init__(self, db: Session):
        self.db = db

    def add(self, schedule_data: schemas_entity.ScheduleCreate):
        """Add a new schedule to the database."""
        new_schedule = models.Schedule(**schedule_data.dict())
        self.db.add(new_schedule)
        self.db.commit()
        self.db.refresh(new_schedule)
        return new_schedule

    def modify(self, schedule_id: int, schedule_data: schemas_entity.ScheduleCreate):
        """Modify an existing schedule's details."""
        schedule_instance = self.db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()
        if not schedule_instance:
            return None
        for key, value in schedule_data.dict().items():
            setattr(schedule_instance, key, value)
        self.db.commit()
        self.db.refresh(schedule_instance)
        return schedule_instance

    def delete(self, schedule_id: int):
        """Delete a schedule from the database."""
        schedule_instance = self.db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()
        if not schedule_instance:
            return None
        self.db.delete(schedule_instance)
        self.db.commit()
        return schedule_instance

    def get(self, schedule_id: int):
        """Retrieve a schedule by ID."""
        schedule_instance = self.db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()
        return schedule_instance

    def search(self):
        """Search for schedulees by name, year, or term."""
        query = self.db.query(models.Schedule)
        return query.all()
    