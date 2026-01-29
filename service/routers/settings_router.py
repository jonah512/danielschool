from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from pathlib import Path
import uuid
from ..db_config import SessionLocal
from ..logging_config import setup_logging
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Define allowed file extensions and size limits
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Define the path to docker volume for image storage
WEBAPP_PUBLIC_DIR = os.path.abspath('/home/data/images')

def ensure_directory_exists():
    """Ensure the docker volume image directory exists, create if necessary."""
    try:
        if not os.path.exists(WEBAPP_PUBLIC_DIR):
            os.makedirs(WEBAPP_PUBLIC_DIR, exist_ok=True)
            logger.info(f"Created directory: {WEBAPP_PUBLIC_DIR}")
        return True
    except Exception as e:
        logger.error(f"Failed to create directory {WEBAPP_PUBLIC_DIR}: {str(e)}")
        return False

def validate_file(file: UploadFile) -> bool:
    """Validate uploaded file type and size."""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
    
    # File size validation will be done during upload
    return True

@router.get("/settings/image/{filename}")
def get_image_file(filename: str):
    """Serve image files from the docker volume image directory."""
    try:
        # Validate filename is in allowed list
        allowed_files = [
            'register01.jpg',
            'register02.jpg',
            'register03.jpg', 
            'register04.jpg',
            'register05.jpg',
            'daniel_logo.png',
            'intro.png'
        ]
        
        if filename not in allowed_files:
            raise HTTPException(status_code=404, detail=f"File {filename} not found or not allowed")
        
        file_path = os.path.join(WEBAPP_PUBLIC_DIR, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"File {filename} not found")
        
        # Return the file
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type='image/jpeg' if filename.endswith('.jpg') else 'image/png'
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving image {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error serving image: {str(e)}")

@router.get("/settings/images")
def get_images():
    """Get list of available images with their status."""
    try:
        image_files = [
            'register01.jpg',
            'register02.jpg', 
            'register03.jpg',
            'register04.jpg',
            'register05.jpg',
            'daniel_logo.png',
            'intro.png'
        ]
        
        images = []
        for filename in image_files:
            file_path = os.path.join(WEBAPP_PUBLIC_DIR, filename)
            images.append({
                'filename': filename,
                'exists': os.path.exists(file_path),
                'path': f"/settings/image/{filename}",  # Use service URL
                'size': os.path.getsize(file_path) if os.path.exists(file_path) else 0
            })
        
        return {"images": images}
    
    except Exception as e:
        logger.error(f"Error getting images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving images: {str(e)}")

@router.post("/settings/upload/{filename}")
async def upload_image(filename: str, file: UploadFile = File(...)):
    """Upload and replace an image file."""
    try:
        logger.info(f"Upload request for {filename}, file: {file.filename}, size: {file.size}")
        logger.info(f"WEBAPP_PUBLIC_DIR: {WEBAPP_PUBLIC_DIR}")
        
        # Ensure directory exists
        if not ensure_directory_exists():
            raise HTTPException(status_code=500, detail="Could not create upload directory")
        
        # Validate filename is in allowed list
        allowed_files = [
            'register01.jpg',
            'register02.jpg',
            'register03.jpg', 
            'register04.jpg',
            'register05.jpg',
            'daniel_logo.png',
            'intro.png'
        ]
        
        if filename not in allowed_files:
            raise HTTPException(status_code=400, detail=f"File {filename} is not allowed for upload")
        
        # Validate file type and size
        if not validate_file(file):
            raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG and PNG files are allowed")
        
        # Read file content and check size
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB")
        
        # Reset file pointer
        await file.seek(0)
        
        # Create backup of existing file if it exists
        target_path = os.path.join(WEBAPP_PUBLIC_DIR, filename)
        backup_path = None
        
        if os.path.exists(target_path):
            backup_path = os.path.join(WEBAPP_PUBLIC_DIR, f"{filename}.backup.{uuid.uuid4().hex[:8]}")
            shutil.copy2(target_path, backup_path)
            logger.info(f"Created backup: {backup_path}")
        
        try:
            # Write the new file
            logger.info(f"Writing file to: {target_path}")
            with open(target_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            logger.info(f"Successfully uploaded {filename}")
            
            return JSONResponse(
                status_code=200,
                content={
                    "message": f"Successfully uploaded {filename}",
                    "filename": filename,
                    "size": len(contents),
                    "backup_created": backup_path is not None
                }
            )
            
        except Exception as write_error:
            logger.error(f"Error writing file {filename}: {str(write_error)}")
            # If write failed and we created a backup, restore it
            if backup_path and os.path.exists(backup_path):
                try:
                    shutil.copy2(backup_path, target_path)
                    os.remove(backup_path)
                    logger.info(f"Restored backup due to write error")
                except Exception as restore_error:
                    logger.error(f"Failed to restore backup: {str(restore_error)}")
            raise write_error
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.post("/settings/restore/{filename}")
def restore_image_backup(filename: str):
    """Restore an image from its most recent backup."""
    try:
        # Find the most recent backup file
        backup_files = []
        for file in os.listdir(WEBAPP_PUBLIC_DIR):
            if file.startswith(f"{filename}.backup."):
                backup_path = os.path.join(WEBAPP_PUBLIC_DIR, file)
                backup_files.append((backup_path, os.path.getctime(backup_path)))
        
        if not backup_files:
            raise HTTPException(status_code=404, detail=f"No backup found for {filename}")
        
        # Get the most recent backup
        most_recent_backup = max(backup_files, key=lambda x: x[1])[0]
        target_path = os.path.join(WEBAPP_PUBLIC_DIR, filename)
        
        # Restore the backup
        shutil.copy2(most_recent_backup, target_path)
        
        logger.info(f"Restored {filename} from backup: {most_recent_backup}")
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Successfully restored {filename} from backup",
                "filename": filename,
                "backup_used": os.path.basename(most_recent_backup)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error restoring {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error restoring file: {str(e)}")

@router.delete("/settings/cleanup-backups")
def cleanup_old_backups(keep_count: int = 3):
    """Clean up old backup files, keeping only the most recent ones."""
    try:
        cleaned_files = []
        
        # Group backup files by original filename
        backup_groups = {}
        for file in os.listdir(WEBAPP_PUBLIC_DIR):
            if '.backup.' in file:
                original_name = file.split('.backup.')[0]
                if original_name not in backup_groups:
                    backup_groups[original_name] = []
                backup_path = os.path.join(WEBAPP_PUBLIC_DIR, file)
                backup_groups[original_name].append((backup_path, os.path.getctime(backup_path)))
        
        # Clean up each group
        for original_name, backups in backup_groups.items():
            if len(backups) > keep_count:
                # Sort by creation time (newest first)
                backups.sort(key=lambda x: x[1], reverse=True)
                
                # Remove old backups
                for backup_path, _ in backups[keep_count:]:
                    os.remove(backup_path)
                    cleaned_files.append(os.path.basename(backup_path))
                    logger.info(f"Removed old backup: {backup_path}")
        
        return JSONResponse(
            status_code=200,
            content={
                "message": f"Cleaned up {len(cleaned_files)} old backup files",
                "removed_files": cleaned_files,
                "kept_per_file": keep_count
            }
        )
        
    except Exception as e:
        logger.error(f"Error cleaning up backups: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error cleaning up backups: {str(e)}")