from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..controls.consent_control import ConsentControl
from ..schemas.schemas_entity import Consent, ConsentCreate
from ..db_config import SessionLocal
from datetime import datetime, timezone, timedelta  # Import timezone and timedelta
router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/consents/", response_model=Consent)
def add_consent(consent_data: ConsentCreate, db: Session = Depends(get_db)):
    """Add a new consent."""
    return ConsentControl(db).add(consent_data)

@router.put("/consents/{consent_id}/", response_model=Consent)
def modify_consent(consent_id: int, consent_data: ConsentCreate, db: Session = Depends(get_db)):
    """Modify an existing consent."""
    updated_consent = ConsentControl(db).modify(consent_id, consent_data)
    if not updated_consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    return updated_consent

@router.delete("/consents/{consent_id}/", response_model=Consent)
def delete_consent(consent_id: int, db: Session = Depends(get_db)):
    """Delete a consent."""
    deleted_consent = ConsentControl(db).delete(consent_id)
    if not deleted_consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    return deleted_consent

@router.get("/consents/{consent_id}/", response_model=Consent)
def get_consent(consent_id: int, db: Session = Depends(get_db)):
    """Retrieve a consent by ID."""
    consent_instance = ConsentControl(db).get(consent_id)
    if not consent_instance:
        raise HTTPException(status_code=404, detail="Consent not found")
    return consent_instance

@router.get("/consents/", response_model=List[Consent])
def search_consentes(db: Session = Depends(get_db)):
    """Search for consent by name, year, or term."""
    consents = ConsentControl(db).search()
    return consents
