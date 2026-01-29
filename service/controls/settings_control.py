import os
import shutil
from pathlib import Path
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from ..logging_config import setup_logging
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

class SettingsControl:
    def __init__(self, db: Session = None):
        self.db = db
        # Define the path to docker volume for image storage
        self.webapp_public_dir = os.path.abspath('/home/data/images')
        
        # Create directory if it doesn't exist
        self._ensure_directory_exists()
        
        self.allowed_files = [
            'register01.jpg',
            'register02.jpg',
            'register03.jpg',
            'register04.jpg',
            'register05.jpg',
            'daniel_logo.png',
            'intro.png'
        ]
        self.allowed_extensions = {'.jpg', '.jpeg', '.png'}
        self.max_file_size = 5 * 1024 * 1024  # 5MB

    def _ensure_directory_exists(self):
        """Ensure the docker volume image directory exists, create if necessary."""
        try:
            if not os.path.exists(self.webapp_public_dir):
                os.makedirs(self.webapp_public_dir, exist_ok=True)
                logger.info(f"Created directory: {self.webapp_public_dir}")
            else:
                logger.debug(f"Directory already exists: {self.webapp_public_dir}")
        except Exception as e:
            logger.error(f"Failed to create directory {self.webapp_public_dir}: {str(e)}")
            raise

    def get_image_info(self, filename: str) -> Dict:
        """Get information about a specific image file."""
        if filename not in self.allowed_files:
            raise ValueError(f"File {filename} is not in the allowed files list")
        
        file_path = os.path.join(self.webapp_public_dir, filename)
        
        info = {
            'filename': filename,
            'exists': os.path.exists(file_path),
            'path': f"/{filename}",
            'size': 0,
            'modified_date': None
        }
        
        if info['exists']:
            stat = os.stat(file_path)
            info['size'] = stat.st_size
            info['modified_date'] = datetime.fromtimestamp(stat.st_mtime)
        
        return info

    def get_all_images_info(self) -> List[Dict]:
        """Get information about all allowed image files."""
        images = []
        for filename in self.allowed_files:
            try:
                images.append(self.get_image_info(filename))
            except Exception as e:
                logger.error(f"Error getting info for {filename}: {str(e)}")
                # Add error entry
                images.append({
                    'filename': filename,
                    'exists': False,
                    'path': f"/{filename}",
                    'size': 0,
                    'modified_date': None,
                    'error': str(e)
                })
        
        return images

    def validate_file(self, filename: str, file_content: bytes) -> bool:
        """Validate file name, type and size."""
        # Check if filename is allowed
        if filename not in self.allowed_files:
            raise ValueError(f"File {filename} is not allowed for upload")
        
        # Check file extension
        file_ext = Path(filename).suffix.lower()
        if file_ext not in self.allowed_extensions:
            raise ValueError(f"File extension {file_ext} is not allowed. Only {', '.join(self.allowed_extensions)} are allowed")
        
        # Check file size
        if len(file_content) > self.max_file_size:
            raise ValueError(f"File size {len(file_content)} exceeds maximum size of {self.max_file_size} bytes")
        
        return True

    def create_backup(self, filename: str) -> Optional[str]:
        """Create a backup of existing file before replacing it."""
        # Ensure directory exists
        self._ensure_directory_exists()
        
        file_path = os.path.join(self.webapp_public_dir, filename)
        
        if not os.path.exists(file_path):
            return None
        
        # Create backup with timestamp
        backup_filename = f"{filename}.backup.{uuid.uuid4().hex[:8]}"
        backup_path = os.path.join(self.webapp_public_dir, backup_filename)
        
        try:
            shutil.copy2(file_path, backup_path)
            logger.info(f"Created backup: {backup_path}")
            return backup_path
        except Exception as e:
            logger.error(f"Failed to create backup for {filename}: {str(e)}")
            return None

    def save_file(self, filename: str, file_content: bytes) -> bool:
        """Save file content to the public directory."""
        try:
            # Ensure directory exists before saving
            self._ensure_directory_exists()
            
            self.validate_file(filename, file_content)
            
            file_path = os.path.join(self.webapp_public_dir, filename)
            backup_path = self.create_backup(filename)
            
            try:
                # Write the new file
                with open(file_path, 'wb') as f:
                    f.write(file_content)
                
                logger.info(f"Successfully saved {filename} ({len(file_content)} bytes)")
                return True
                
            except Exception as write_error:
                # If write failed and we created a backup, restore it
                if backup_path and os.path.exists(backup_path):
                    try:
                        shutil.copy2(backup_path, file_path)
                        logger.info(f"Restored backup due to write error: {filename}")
                    except Exception as restore_error:
                        logger.error(f"Failed to restore backup: {str(restore_error)}")
                raise write_error
                
        except Exception as e:
            logger.error(f"Error saving {filename}: {str(e)}")
            raise

    def get_backup_files(self, filename: str = None) -> List[Dict]:
        """Get list of backup files, optionally filtered by original filename."""
        backups = []
        
        try:
            for file in os.listdir(self.webapp_public_dir):
                if '.backup.' in file:
                    original_name = file.split('.backup.')[0]
                    
                    # Filter by filename if specified
                    if filename and original_name != filename:
                        continue
                    
                    backup_path = os.path.join(self.webapp_public_dir, file)
                    stat = os.stat(backup_path)
                    
                    backups.append({
                        'backup_filename': file,
                        'original_filename': original_name,
                        'path': backup_path,
                        'size': stat.st_size,
                        'created_date': datetime.fromtimestamp(stat.st_ctime),
                        'modified_date': datetime.fromtimestamp(stat.st_mtime)
                    })
            
            # Sort by creation time (newest first)
            backups.sort(key=lambda x: x['created_date'], reverse=True)
            
        except Exception as e:
            logger.error(f"Error getting backup files: {str(e)}")
            
        return backups

    def restore_from_backup(self, filename: str, backup_filename: str = None) -> bool:
        """Restore file from backup. If no backup_filename specified, uses most recent."""
        try:
            if filename not in self.allowed_files:
                raise ValueError(f"File {filename} is not allowed")
            
            if backup_filename:
                # Use specific backup file
                backup_path = os.path.join(self.webapp_public_dir, backup_filename)
                if not os.path.exists(backup_path):
                    raise FileNotFoundError(f"Backup file {backup_filename} not found")
            else:
                # Find most recent backup
                backups = self.get_backup_files(filename)
                if not backups:
                    raise FileNotFoundError(f"No backup found for {filename}")
                backup_path = backups[0]['path']
            
            # Restore the file
            target_path = os.path.join(self.webapp_public_dir, filename)
            shutil.copy2(backup_path, target_path)
            
            logger.info(f"Restored {filename} from {os.path.basename(backup_path)}")
            return True
            
        except Exception as e:
            logger.error(f"Error restoring {filename}: {str(e)}")
            raise

    def cleanup_old_backups(self, keep_count: int = 3) -> List[str]:
        """Remove old backup files, keeping only the specified number of most recent ones per file."""
        removed_files = []
        
        try:
            # Group backups by original filename
            backup_groups = {}
            for backup in self.get_backup_files():
                original = backup['original_filename']
                if original not in backup_groups:
                    backup_groups[original] = []
                backup_groups[original].append(backup)
            
            # Clean up each group
            for original_name, backups in backup_groups.items():
                if len(backups) > keep_count:
                    # Remove oldest backups
                    for backup in backups[keep_count:]:
                        try:
                            os.remove(backup['path'])
                            removed_files.append(backup['backup_filename'])
                            logger.info(f"Removed old backup: {backup['backup_filename']}")
                        except Exception as e:
                            logger.error(f"Error removing backup {backup['backup_filename']}: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error during backup cleanup: {str(e)}")
            
        return removed_files

    def get_system_info(self) -> Dict:
        """Get system information about the docker volume image directory."""
        try:
            stat = os.stat(self.webapp_public_dir)
            
            # Count files
            total_files = 0
            backup_files = 0
            image_files = 0
            
            for file in os.listdir(self.webapp_public_dir):
                total_files += 1
                if '.backup.' in file:
                    backup_files += 1
                elif file in self.allowed_files:
                    image_files += 1
            
            return {
                'webapp_public_dir': self.webapp_public_dir,
                'directory_exists': os.path.exists(self.webapp_public_dir),
                'total_files': total_files,
                'image_files': image_files,
                'backup_files': backup_files,
                'allowed_files': self.allowed_files,
                'max_file_size_mb': self.max_file_size / (1024 * 1024)
            }
            
        except Exception as e:
            logger.error(f"Error getting system info: {str(e)}")
            return {
                'webapp_public_dir': self.webapp_public_dir,
                'directory_exists': False,
                'error': str(e)
            }