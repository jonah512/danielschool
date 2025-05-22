from fastapi import FastAPI, Depends, HTTPException, APIRouter
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from ..db_config import SessionLocal

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(prefix="/session", tags=["session"])

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
