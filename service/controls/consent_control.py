import logging
from sqlalchemy.orm import Session
from ..schemas import models, schemas_entity

logger = logging.getLogger(__name__)

class ConsentControl:
    def __init__(self, db: Session):
        self.db = db

    def add(self, consent_data: schemas_entity.ConsentCreate):
        """Add a new consent to the database."""
        new_consent = models.Consent(**consent_data.dict())
        self.db.add(new_consent)
        self.db.commit()
        self.db.refresh(new_consent)
        return new_consent

    def modify(self, consent_id: int, consent_data: schemas_entity.ConsentCreate):
        """Modify an existing consent's details."""
        consent_instance = self.db.query(models.Consent).filter(models.Consent.id == consent_id).first()
        if not consent_instance:
            return None
        for key, value in consent_data.dict().items():
            setattr(consent_instance, key, value)
        self.db.commit()
        self.db.refresh(consent_instance)
        return consent_instance

    def delete(self, consent_id: int):
        """Delete a consent from the database."""
        consent_instance = self.db.query(models.Consent).filter(models.Consent.id == consent_id).first()
        if not consent_instance:
            return None
        self.db.delete(consent_instance)
        self.db.commit()
        return consent_instance

    def get(self, consent_id: int):
        """Retrieve a consent by ID."""
        consent_instance = self.db.query(models.Consent).filter(models.Consent.id == consent_id).first()
        return consent_instance

    def search(self):
        """Search for consentes by name, year, or term."""
        query = self.db.query(models.Consent)
        return query.all()
