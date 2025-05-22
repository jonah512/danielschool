from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..schemas import schemas_entity
from ..schemas.models import User
from ..controls.user_control import UserControl
from ..db_config import SessionLocal
from typing import List, Optional

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(prefix="/users", tags=["users"])
user_control = UserControl(db=SessionLocal())

@router.post("/", response_model=schemas_entity.User)
def create_new_user(user: schemas_entity.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_control.create_user( user)

@router.get("/{user_id}", response_model=schemas_entity.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = user_control.get_user_by_id( user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=list[schemas_entity.User])
def list_users(name: Optional[str] = None, db: Session = Depends(get_db)):
    return user_control.get_all_users( name=name)

# Define a Pydantic model for the login request
class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    if UserControl(db).login_check( email = request.email, password = request.password):
        return {"success": True, "message": "Login successful", "user_role": "developer"}
    raise HTTPException(status_code=401, detail="Invalid email or password")
