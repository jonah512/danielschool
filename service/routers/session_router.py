from fastapi import FastAPI, Depends, HTTPException, APIRouter
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from ..db_config import SessionLocal
from ..controls.session_control import SessionControl
from ..schemas.schemas_entity import Log, LogCreate
from typing import List, Optional

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()
session_control = SessionControl(db=SessionLocal())

@router.get("/GetServerStatus")
def get_server_status(db: Session = Depends(get_db)):
    try:
        # Simulate fetching server status
        server_status = {
            "status": "running",
            "uptime": "48 hours",
            "active_users": 12
        }
        return {"success": True, "data": server_status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching server status: {str(e)}")

@router.post("/StartSession")
def start_session(email: str, db: Session = Depends(get_db)):
    try:
        return session_control.add(email)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting session: {str(e)}")


@router.post("/EndSession")
def end_session(email: str, session_key: str, db: Session = Depends(get_db)):
    try:
       return session_control.remove(email, session_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ending session: {str(e)}")

@router.post("/CheckSession")
def check_session(email: str, session_key: str, db: Session = Depends(get_db)):
    try:
        result = session_control.check(email, session_key)
        if result["valid"]:
            return {"success": True, "message": "Session is valid", "position": result["position"]}
        else:
            raise HTTPException(status_code=401, detail="Invalid session")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking session: {str(e)}")

@router.get("/GetSessionQueue")
def get_session_queue(db: Session = Depends(get_db)):
    try:
        return session_control.get_sessions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching session queue: {str(e)}")

@router.get("/ClearSessionQueue")
def clear_session_queue(db: Session = Depends(get_db)):
    try:
        session_control.clear_sessions()
        return {"success": True, "message": "Session queue cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing session queue: {str(e)}")
    
@router.post("/AddLog", response_model=Log)
def add_log(email : str, log: str, db: Session = Depends(get_db)):
    result = session_control.add_log(email, log)
    return result

@router.get("/GetLog", response_model=List[Log])
def get_log(email: str, db: Session = Depends(get_db)):
    return session_control.get_log(email)
