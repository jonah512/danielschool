# Docker Volume Image Storage Configuration

## Overview

The Daniel School application now stores all managed images in a Docker volume for persistent storage across container restarts and updates.

## Configuration Details

### Storage Location
- **Docker Volume**: `daniel_data` mounted at `/home/data`
- **Image Directory**: `/home/data/images`
- **Managed Files**:
  - `register01.jpg` - Registration Step 1 image
  - `register02.jpg` - Registration Step 2 image  
  - `register03.jpg` - Registration Step 3 image
  - `register04.jpg` - Registration Step 4 image
  - `register05.jpg` - Registration Step 5 image
  - `daniel_logo.png` - School logo
  - `intro.png` - Welcome/intro image

### Code Changes

#### Backend (Python)
- **Settings Control**: Updated to use `/home/data/images` instead of `webapp/public`
- **Settings Router**: Image serving endpoint updated to use Docker volume path
- **Backup System**: All backup operations now work within Docker volume

#### Frontend (React)
- **Service URLs**: All components use service API endpoints to load images
- **Cache Busting**: Timestamp parameters prevent browser caching issues
- **Settings UI**: Upload and restore functionality works with Docker volume

#### Infrastructure
- **Dockerfile**: Copies default images during build
- **start.sh**: Initializes Docker volume with default images on first run
- **docker-compose.yml**: Existing `daniel_data:/home/data` volume mapping

## Benefits

1. **Persistence**: Images survive container restarts and updates
2. **Separation**: Application code separated from user data
3. **Backup**: Easy to backup/restore entire image collection
4. **Security**: Proper file permissions and access control
5. **Scalability**: Ready for multi-container deployments

## Usage

### Upload New Images
1. Access Settings page in admin interface
2. Select image file (jpg, jpeg, png, gif, webp)
3. Choose target filename from dropdown
4. Upload - creates automatic backup of existing file

### Restore Images  
1. Access Settings page in admin interface
2. Select filename to restore from backup
3. Restore - reverts to previous version

### Manual File Operations
```bash
# Access docker volume
docker exec -it <container_name> bash

# View images
ls -la /home/data/images

# Copy files manually
cp /path/to/image.jpg /home/data/images/register01.jpg

# Restart service to clear any caches
docker restart <container_name>
```

### Migration from Previous Version
If upgrading from a version that stored images in `webapp/public`:

1. Use migration script: `./scripts/migrate_images.sh` (run inside container)
2. Or manually copy files from `webapp/public` to `/home/data/images`
3. Rebuild and restart containers

## File Validation

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)  
- GIF (.gif)
- WebP (.webp)

### Size Limits
- Maximum file size: 10MB
- Recommended: Under 2MB for web performance

### Security
- Filename validation prevents directory traversal
- File type validation by extension and content
- Automatic backup before overwriting

## Troubleshooting

### Images Not Loading
1. Check Docker volume mount: `docker inspect <container_name>`
2. Verify files exist: `docker exec <container> ls /home/data/images`
3. Check service logs: `docker logs <container_name>`
4. Clear browser cache (images use cache-busting URLs)

### Upload Errors
1. Check file size (must be under 10MB)
2. Verify file format is supported
3. Check disk space in Docker volume
4. Review server logs for detailed error messages

### Backup/Restore Issues
1. Verify backup files exist in `/home/data/images`
2. Check file permissions in Docker volume
3. Ensure sufficient disk space for backup operations

## API Endpoints

### Image Serving
- `GET /settings/image/{filename}` - Serve image files
- Cache headers and proper MIME types included

### Image Management  
- `POST /settings/upload/{filename}` - Upload new image
- `POST /settings/restore/{filename}` - Restore from backup
- `DELETE /settings/cleanup/{filename}` - Clean up backup files
- `GET /settings/info` - Get system information

### System Information
- `GET /settings/info` - Returns directory status, file counts, configuration