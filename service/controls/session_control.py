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
from threading import Timer

# Initialize the logger
logger = logging.getLogger(__name__)

class SessionControl:
    def __init__(self, db: Session):
        self.session_queue = []
        self.db = db
        self.index = 0
        self.schedule_remove_disconnected()

    def schedule_remove_disconnected(self):
        self.remove_disconnected()
        Timer(10, self.schedule_remove_disconnected).start()

    def check(self, email: str, session_key: str):
        """Check if the session key is valid for the given email and return its position in the queue."""
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
        session_key = os.urandom(16).hex()
        session_data = {
            "index": self.index,
            "email": email,
            "session_key": session_key,
            "last_access": datetime.now(),
            "position": len(self.session_queue) + 1
        }
        logger.info(f"Adding session for {email} with session_data {session_data}")
        self.session_queue.append(session_data)
        self.index += 1
        logger.info(f"Session added for {email} with key {session_key}")
        return session_data

    def remove(self, email: str, session_key: str):
        """Remove a session based on email and session key."""
        for i, session in enumerate(self.session_queue):
            if session["email"] == email and session["session_key"] == session_key:
                del self.session_queue[i]
                logger.info(f"Session removed for {email} with key {session_key}")
                return True
        logger.warning(f"Session not found for {email} with key {session_key}")
        return False

    def remove_disconnected(self):
        """Remove sessions that have not been accessed in the last 30 minutes."""
        if len(self.session_queue) == 0:
            return True
        current_time = datetime.now()
        self.session_queue = [
            session for session in self.session_queue
            if (current_time - session["last_access"]).total_seconds() < 30 # 30 seconds session timeout
        ]
        logger.info("Disconnected sessions removed.")

        if len(self.session_queue) == 0:
            self.index = 0
            logger.info("Session queue is empty, index reset to 0.")
        return True

    def get_sessions(self) -> List[dict]:
        """Retrieve all sessions."""
        return self.session_queue


    def clear_sessions(self):
        """Clear all sessions."""
        self.session_queue.clear()
        self.index = 0
        logger.info("All sessions cleared.")
        return True

    def add_log(self, email: str, log: str):
        # Check if the Log table size exceeds 10,000
        log_count = self.db.query(models.Log).count()
        if log_count >= 10000:
            oldest_log = self.db.query(models.Log).order_by(models.Log.action_time.asc()).first()
            if oldest_log:
                self.db.delete(oldest_log)
                self.db.commit()
                logger.info(f"Oldest log with ID {oldest_log.id} removed to maintain table size limit.")

        # Create a new log entry using the mapped SQLAlchemy model
        new_log = models.Log(
            email=email,
            log=log,
            action_time=datetime.now()
        )
        self.db.add(new_log)
        self.db.commit()
        self.db.refresh(new_log)
        logger.info(f"Log added for {new_log.email} with log {new_log.log}")
        return new_log
    

    def get_log(self, email: str) -> List[models.Log]:
        """Retrieve logs for a specific email."""
        logs = self.db.query(models.Log).filter(models.Log.email == email).order_by(models.Log.action_time.desc()).all()
        logger.info(f"Retrieved {len(logs)} logs for email {email}.")
        return logs