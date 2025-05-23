import hashlib
from sqlalchemy.orm import Session
from ..schemas.models import User
from ..schemas.schemas_entity import UserCreate
from passlib.context import CryptContext
from ..db_config import SessionLocal
from sqlalchemy import func
from sqlalchemy import desc
from ..schemas import models, schemas_entity
from typing import List
from ..logging_config import setup_logging
import logging
import uuid
logger = logging.getLogger(__name__)


class UserControl:
    def __init__(self, db: Session):
        self.db = db
        self.ensure_default_user()

    def get_password_hash(self, password: str) -> str:
        # Return MD5 hash of the password
        return hashlib.md5(password.encode()).hexdigest()

    def ensure_default_user(self):
        default_email = "danielschoolonthehill@gmail.com"
        default_password = "danielschoolmanager"
        user = self.db.query(User).filter(User.email == default_email).first()
        if not user:
            hashed_password = self.get_password_hash(default_password)
            default_user = User(
                username="admin",
                email=default_email,
                hashed_password=hashed_password,
                is_active=1,
                role="admin"  # Set role for default user
            )
            self.db.add(default_user)
            self.db.commit()
            self.db.refresh(default_user)
            print (f"Default user created: {default_user.username} with email: {default_user.email}")

    def create_user(self, user: UserCreate) -> User:
        hashed_password = self.get_password_hash(user.password)
        new_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password,
            is_active=user.is_active,
            role=user.role  # Set role for new user
        )
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user

    def get_user_by_id(self, user_id: int) -> User:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_all_users(self, name: str = None) -> list[User]:
        query = self.db.query(models.User)
        if name:
            query = query.filter(
                func.lower(models.User.username).like(f"%{name.lower()}%") |
                func.lower(models.User.email).like(f"%{name.lower()}%")
            )
        return query.all()
        
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        # Compare the MD5 hash of the plain password with the stored hashed password
        return self.get_password_hash(plain_password) == hashed_password

    def login_check(self, email: str, password: str) -> (bool, str):
        user = self.db.query(User).filter(User.email == email).first()
        print(f"User: {user}")
        print(f"email: {email}")
        print(f"Password: {password}")  
        print(f"Hashed Password: {user.hashed_password}")
        random_uuid = str(uuid.uuid4())
        #random uuid should be stored in session manager controller : TBD
        print(f"Generated UUID: {random_uuid}")
        if user and password == user.hashed_password:
            return True, random_uuid
        return False, None
