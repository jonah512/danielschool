from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..controls.schedule_control import ScheduleControl
from ..schemas.schemas_entity import Schedule, ScheduleCreate
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

@router.post("/schedules/", response_model=Schedule)
def add_schedule(schedule_data: ScheduleCreate, db: Session = Depends(get_db)):
    """Add a new schedule."""
    return ScheduleControl(db).add(schedule_data)

@router.put("/schedules/{schedule_id}/", response_model=Schedule)
def modify_schedule(schedule_id: int, schedule_data: ScheduleCreate, db: Session = Depends(get_db)):
    """Modify an existing schedule."""
    updated_schedule = ScheduleControl(db).modify(schedule_id, schedule_data)
    if not updated_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return updated_schedule

@router.delete("/schedules/{schedule_id}/", response_model=Schedule)
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """Delete a schedule."""
    deleted_schedule = ScheduleControl(db).delete(schedule_id)
    if not deleted_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return deleted_schedule

@router.get("/schedules/{schedule_id}/", response_model=Schedule)
def get_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """Retrieve a schedule by ID."""
    schedule_instance = ScheduleControl(db).get(schedule_id)
    if not schedule_instance:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule_instance

@router.get("/schedules/", response_model=List[Schedule])
def search_schedulees(db: Session = Depends(get_db)):
    """Search for schedule by name, year, or term."""
    schedules = ScheduleControl(db).search()
    # Adjust current_time to EST with daylight saving
    est_offset = timedelta(hours=-5)  # Standard offset for EST
    is_dst = datetime.now().astimezone().dst() != timedelta(0)  # Check if daylight saving is active
    current_time = datetime.now().astimezone(timezone(est_offset + (timedelta(hours=1) if is_dst else timedelta(0)))).isoformat()
    schedules.append(Schedule(id=-1, year=0, term="", opening_time=current_time, closing_time=current_time))
    return schedules
