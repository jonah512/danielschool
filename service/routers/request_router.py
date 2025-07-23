from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..controls.request_control import RequestControl
from ..schemas.schemas_entity import Request, RequestCreate
from ..db_config import SessionLocal

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/requests/", response_model=Request)
def add_request(request: RequestCreate, db: Session = Depends(get_db)):
    """Add a new request."""
    return RequestControl(db).add(request)

@router.put("/requests/{request_id}/", response_model=Request)
def modify_request(request_id: int, request: RequestCreate, db: Session = Depends(get_db)):
    """Modify an existing request."""
    updated_request = RequestControl(db).modify(request_id, request)
    if not updated_request:
        raise HTTPException(status_code=404, detail="Request not found")
    return updated_request

@router.delete("/requests/{request_id}/", response_model=Request)
def delete_request(request_id: int, db: Session = Depends(get_db)):
    """Delete a request."""
    deleted_request = RequestControl(db).delete(request_id)
    if not deleted_request:
        raise HTTPException(status_code=404, detail="Request not found")
    return deleted_request

@router.get("/requests/{request_id}/", response_model=Request)
def get_request(request_id: int, db: Session = Depends(get_db)):
    """Retrieve a request by ID."""
    request = RequestControl(db).get(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request

@router.get("/requests/", response_model=List[Request])
def search_requests(name: Optional[str] = None, db: Session = Depends(get_db)):
    """Search for requests by name or email."""
    return RequestControl(db).search(name=name)
