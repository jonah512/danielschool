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

logger = logging.getLogger(__name__)

class RequestControl:
    def __init__(self, db: Session):
        self.db = db

    def add(self, request_data: schemas_entity.RequestCreate):
        """Add a new request to the database."""
        new_request = models.Request(**request_data.dict())
        self.db.add(new_request)
        self.db.commit()
        self.db.refresh(new_request)
        return new_request

    def modify(self, request_id: int, request_data: schemas_entity.RequestCreate):
        """Modify an existing request's details."""
        request = self.db.query(models.Request).filter(models.Request.id == request_id).first()
        if not request:
            return None
        for key, value in request_data.dict().items():
            setattr(request, key, value)
        self.db.commit()
        self.db.refresh(request)
        return request

    def delete(self, request_id: int):
        """Delete a request from the database."""
        request = self.db.query(models.Request).filter(models.Request.id == request_id).first()
        if not request:
            return None
        self.db.delete(request)
        self.db.commit()
        return request

    def get(self, request_id: int):
        """Retrieve a request by ID."""
        request = self.db.query(models.Request).filter(models.Request.id == request_id).first()
        return request

    def search(self, name: str = None):
        """Search for requests by name ."""
        query = self.db.query(models.Request)
        if name:
            query = query.filter(
                func.lower(models.Request.name).like(f"%{name.lower()}%") |
                func.lower(models.Request.students).like(f"%{name.lower()}%") |
                func.lower(models.Request.phone).like(f"%{name.lower()}%") |
                func.lower(models.Request.email).like(f"%{name.lower()}%")
            )
        return query.all()
