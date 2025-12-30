"""
Alternative: Database-based Session Management
This approach uses the database for session storage with proper transactions
"""

from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import uuid

# Database session model
class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True)
    email = Column(String(255), nullable=False)
    session_key = Column(String(64), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_access = Column(DateTime, default=datetime.utcnow)
    position = Column(Integer)

class DatabaseSessionControl:
    def __init__(self, db: Session):
        self.db = db
    
    def add(self, email: str):
        """Add session with database transaction"""
        try:
            # Check for existing session
            existing = self.db.query(UserSession).filter(
                UserSession.email == email
            ).first()
            
            if existing:
                existing.last_access = datetime.utcnow()
                self.db.commit()
                return self._session_to_dict(existing)
            
            # Create new session
            session_key = str(uuid.uuid4())
            position = self.db.query(UserSession).count() + 1
            
            new_session = UserSession(
                email=email,
                session_key=session_key,
                position=position
            )
            
            self.db.add(new_session)
            self.db.commit()
            self.db.refresh(new_session)
            
            return self._session_to_dict(new_session)
            
        except Exception as e:
            self.db.rollback()
            raise e
    
    def check(self, email: str, session_key: str):
        """Check session with database lookup"""
        try:
            session = self.db.query(UserSession).filter(
                UserSession.email == email,
                UserSession.session_key == session_key
            ).first()
            
            if session:
                # Update last access
                session.last_access = datetime.utcnow()
                self.db.commit()
                return {"valid": True, "position": session.position}
            
            return {"valid": False, "position": -1}
            
        except Exception as e:
            self.db.rollback()
            return {"valid": False, "position": -1}
    
    def _session_to_dict(self, session):
        return {
            "email": session.email,
            "session_key": session.session_key,
            "position": session.position,
            "last_access": session.last_access
        }