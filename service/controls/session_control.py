# Copyright (c) 2025 Milal Daniel Korean School.
'''
This file handles the CRUD operations (Create, Read, Update, Delete) for the TrainingJob model. 
This defines implementations of API functions.
'''
import os
import logging
import requests
from sqlalchemy.orm import Session
from ..schemas import models, schemas_entity
import json
from typing import List
from datetime import datetime 
from sqlalchemy import func
from sqlalchemy import desc
import csv
from io import StringIO
from threading import Timer, Lock

# Initialize the logger
logger = logging.getLogger(__name__)

class SessionControl:
    _instance = None
    _initialized = False
    _session_id_counter = 0
    
    def __new__(cls, db: Session = None):
        if cls._instance is None:
            cls._instance = super(SessionControl, cls).__new__(cls)
        return cls._instance
    
    def __init__(self, db: Session = None):
        # Only initialize once
        if not SessionControl._initialized:
            self.session_queue = []
            self.index = 0
            self.lock = Lock()  # Thread synchronization lock
            self.db = db
            self.schedule_remove_disconnected()
            SessionControl._initialized = True
        elif db is not None:
            # Update db session for subsequent calls
            self.db = db

    def schedule_remove_disconnected(self):
        self.remove_disconnected()
        Timer(10, self.schedule_remove_disconnected).start()

    @classmethod
    def get_instance(cls, db: Session = None):
        """Get the singleton instance"""
        if cls._instance is None:
            cls._instance = cls(db)
        elif db is not None:
            cls._instance.db = db
        return cls._instance
    
    @classmethod
    def reset_instance(cls):
        """Reset singleton instance (useful for testing)"""
        cls._instance = None
        cls._initialized = False

    def check(self, email: str, session_key: str):
        """Check if the session key is valid for the given email and return its position in the queue."""
        with self.lock:  # Thread-safe access
            for index, session in enumerate(self.session_queue):
                if session["email"] == email and session["session_key"] == session_key:
                    session["last_access"] = datetime.now()                
                    position = index + 1 # Position in the queue (1-based index)
                    session["position"] = position 
                    logger.info(f"Session valid for {email} with key {session_key}, position {position}")
                    return {"valid": True, "position": position}
            logger.warning(f"Invalid session for {email} with key {session_key}")
            return {"valid": True, "position": -1}

    def add(self, email: str):
        """ generate a random session key and add it to session queue."""
        with self.lock:  # Thread-safe access           
            session_data = {
                "index": self.index,
                "email": email,
                "session_key": f"{self.index }-{os.urandom(16).hex()}",
                "last_access": datetime.now(),
                "position": len(self.session_queue) + 1
            }
            logger.info(f"Adding session for {email} with session_data {session_data}")
            self.session_queue.append(session_data)
            self.index += 1
            logger.info(f"Session added for {email} with key {session_data['session_key']}")
            return session_data

    def remove(self, email: str, session_key: str):
        """Remove a session based on email and session key."""
        with self.lock:  # Thread-safe access
            for i, session in enumerate(self.session_queue):
                if session["email"] == email and session["session_key"] == session_key:
                    del self.session_queue[i]
                    logger.info(f"Session removed for {email} with key {session_key}")
                    return True
            logger.warning(f"Session not found for {email} with key {session_key}")
            return False

    def remove_disconnected(self):
        """Remove sessions that have not been accessed in the last 30 minutes."""
        with self.lock:  # Thread-safe access
            if len(self.session_queue) == 0:
                return True
            current_time = datetime.now()
            
            # Find sessions to remove
            sessions_to_remove = [
                session for session in self.session_queue
                if (current_time - session["last_access"]).total_seconds() >= 5*60 # 30 min session timeout
            ]
            
            # Log removed sessions
            for session in sessions_to_remove:
                time_diff = (current_time - session["last_access"]).total_seconds()
                logger.info(f"Removing disconnected session: email={session['email']}, key={session['session_key'][:8]} lastaccess={session['last_access']}, inactive_time={time_diff:.1f}s")
            
            # Keep only active sessions
            self.session_queue = [
                session for session in self.session_queue
                if (current_time - session["last_access"]).total_seconds() <  5*60 # 10 minutes session timeout
            ]
            
            if sessions_to_remove:
                logger.info(f"Removed {len(sessions_to_remove)} disconnected sessions.")
            else:
                logger.info("No disconnected sessions to remove.")

            if len(self.session_queue) == 0:
                self.index = 0
                logger.info("Session queue is empty, index reset to 0.")
            return True

    def get_sessions(self) -> List[dict]:
        """Retrieve all sessions."""
        with self.lock:  # Thread-safe access
            return self.session_queue.copy()  # Return a copy to avoid external modifications


    def clear_sessions(self):
        """Clear all sessions."""
        with self.lock:  # Thread-safe access
            self.session_queue.clear()
            self.index = 0
            logger.info("All sessions cleared.")
            return True

    def add_log(self, email: str, log: str, db: Session = None):
        """Add log entry - use provided db session or instance db session"""
        db_session = db or self.db
        if not db_session:
            logger.error("No database session available for add_log")
            return None
            
        # Check if the Log table size exceeds 10,000
        log_count = db_session.query(models.Log).count()
        if log_count >= 10000:
            oldest_log = db_session.query(models.Log).order_by(models.Log.action_time.asc()).first()
            if oldest_log:
                db_session.delete(oldest_log)
                db_session.commit()
                logger.info(f"Oldest log with ID {oldest_log.id} removed to maintain table size limit.")

        # Create a new log entry using the mapped SQLAlchemy model
        new_log = models.Log(
            email=email,
            log=log,
            action_time=datetime.now()
        )
        db_session.add(new_log)
        db_session.commit()
        db_session.refresh(new_log)
        logger.info(f"Log added for {new_log.email} with log {new_log.log}")
        return new_log
    

    def get_log(self, email: str, db: Session = None) -> List[models.Log]:
        """Retrieve logs for a specific email - use provided db session or instance db session"""
        db_session = db or self.db
        if not db_session:
            logger.error("No database session available for get_log")
            return []
            
        logs = db_session.query(models.Log).filter(models.Log.email == email).order_by(models.Log.action_time.desc()).all()
        logger.info(f"Retrieved {len(logs)} logs for email {email}.")
        return logs
