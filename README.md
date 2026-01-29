# Daniel Korean Language School Admin Web

A comprehensive web application for managing Korean language school operations including student enrollment, class scheduling, teacher management, and administrative functions.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Docker Management](#docker-management)
- [Image Management](#image-management)
- [User Management](#user-management)
- [API Documentation](#api-documentation)
- [Development Setup](#development-setup)
- [Troubleshooting](#troubleshooting)
- [Backup & Maintenance](#backup--maintenance)
- [Security](#security)
- [File Structure](#file-structure)

## Overview

### Features
- **Student Management**: Registration, enrollment, profile management
- **Class Management**: Course creation, scheduling, capacity management
- **Teacher Management**: Teacher profiles, class assignments, schedules
- **Administrative Tools**: User management, system settings, reporting
- **Image Management**: Upload and manage registration images, logos
- **Multi-language Support**: Korean and English interface
- **Session Management**: Secure authentication and authorization

### Technology Stack
- **Backend**: Python 3.10, FastAPI, SQLAlchemy, MySQL
- **Frontend**: React.js, Material-UI, Axios
- **Infrastructure**: Docker, Docker Compose, Apache2
- **Database**: MySQL 8.0
- **Storage**: Docker Volumes for persistent data

## Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+), macOS, Windows with WSL2
- **Memory**: Minimum 4GB RAM, Recommended 8GB+
- **Storage**: Minimum 10GB available space
- **Network**: Ports 80, 8080, 3306 available

### Required Software
- Docker Engine 20.10+
- Docker Compose 2.0+
- Git (for cloning repository)

### Installation of Prerequisites

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

#### CentOS/RHEL
```bash
# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd danielschool

# 2. Start the application
docker compose up -d

# 3. Wait for initialization (30-60 seconds)
docker compose logs -f

# 4. Access the application
# Frontend: http://localhost (port 80)
# Backend API: http://localhost:8080
# Admin Login: Use default credentials or create new user

# 5. Create first admin user (if needed)
docker exec -it daniel-service python -c "
from workspace.controls.user_control import UserControl
from workspace.db_config import get_db
db = next(get_db())
ctrl = UserControl(db)
ctrl.create_user('admin', 'admin@school.com', 'admin123', 'ADMIN')
"
```

## Installation

### Production Setup (Recommended)

1. **Clone Repository**
```bash
git clone <repository-url>
cd danielschool
```

2. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

3. **Configure Environment Variables**
```env
# Database Configuration
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=daniel_school
MYSQL_USER=daniel_user
MYSQL_PASSWORD=your_secure_password
MYSQL_HOST=daniel-mysql
MYSQL_PORT=3306

# Application Configuration
DATABASE_URL=mysql+pymysql://daniel_user:your_secure_password@daniel-mysql:3306/daniel_school
SECRET_KEY=your_secret_key_here

# Service Configuration
API_PORT=8080
WEB_PORT=80
```

4. **Start Services**
```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Development Setup

1. **Backend Development**
```bash
# Install Python dependencies
cd service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ../requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

2. **Frontend Development**
```bash
# Install Node.js dependencies
cd webapp
npm install

# Start development server
npm start
```

3. **Database Development**
```bash
# Start only database
docker compose up -d daniel-mysql

# Connect to database
mysql -h localhost -P 3306 -u daniel_user -p daniel_school
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MYSQL_ROOT_PASSWORD` | MySQL root password | - | Yes |
| `MYSQL_DATABASE` | Database name | daniel_school | Yes |
| `MYSQL_USER` | Database user | daniel_user | Yes |
| `MYSQL_PASSWORD` | Database password | - | Yes |
| `DATABASE_URL` | Full database URL | - | Yes |
| `SECRET_KEY` | JWT secret key | - | Yes |
| `API_PORT` | Backend API port | 8080 | No |
| `WEB_PORT` | Frontend web port | 80 | No |

### Service Configuration

**Backend Configuration** (`service/configuration.py`)
- Database connection settings
- JWT authentication settings
- File upload limits and paths
- CORS configuration
- Logging configuration

**Frontend Configuration** (`webapp/src/`)
- API endpoint URLs
- UI themes and styling
- Language settings
- Feature flags

## Database Setup

### Automatic Initialization
The database is automatically initialized on first startup with:
- Schema creation from `scripts/init_mysql.sql`
- Default user roles and permissions
- Sample data (optional)

### Manual Database Operations

```bash
# Access MySQL in container
docker exec -it daniel-mysql mysql -u root -p

# Backup database
docker exec daniel-mysql mysqldump -u root -p daniel_school > backup.sql

# Restore database
docker exec -i daniel-mysql mysql -u root -p daniel_school < backup.sql

# Reset database
docker exec daniel-mysql mysql -u root -p -e "DROP DATABASE daniel_school; CREATE DATABASE daniel_school;"
docker compose restart daniel-service
```

### Migration Scripts
```bash
# Run database migrations
docker exec -it daniel-service python -m alembic upgrade head

# Create new migration
docker exec -it daniel-service python -m alembic revision --autogenerate -m "Description"
```

## Docker Management

### Container Operations
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart services
docker compose restart

# Update and restart
docker compose pull
docker compose up -d --force-recreate

# View running containers
docker compose ps

# View logs
docker compose logs -f [service_name]
```

### Container Access
```bash
# Access main application container
sudo docker exec -it daniel-service /bin/bash

# Access MySQL container
docker exec -it daniel-mysql /bin/bash

# Access with specific user
docker exec -it --user root daniel-service /bin/bash
```

### Volume Management
```bash
# List volumes
docker volume ls

# Inspect daniel_data volume
docker volume inspect danielschool_daniel_data

# Backup volume
docker run --rm -v danielschool_daniel_data:/data -v $(pwd):/backup ubuntu tar czf /backup/daniel_data_backup.tar.gz -C /data .

# Restore volume
docker run --rm -v danielschool_daniel_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/daniel_data_backup.tar.gz -C /data
```

## Image Management

The application uses Docker volume storage for persistent image management.

### Supported Image Types
- **Registration Images**: `register01.jpg` to `register05.jpg`
- **School Logo**: `daniel_logo.png`
- **Welcome Image**: `intro.png`

### Upload via Settings Interface
1. Access admin panel: `http://localhost/settings`
2. Select image file (max 10MB)
3. Choose target filename
4. Upload (automatic backup created)

### Manual Image Management
```bash
# Access image directory in container
docker exec -it daniel-service ls -la /home/data/images

# Copy image to container
docker cp local_image.jpg daniel-service:/home/data/images/register01.jpg

# Copy image from container
docker cp daniel-service:/home/data/images/daniel_logo.png ./

# View image directory
docker exec -it daniel-service ls -la /home/data/images
```

### Migration from Previous Version
```bash
# Run migration script (inside container)
docker exec -it daniel-service /workspace/scripts/migrate_images.sh
```

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- Maximum size: 10MB

## User Management

### Create Admin User
```bash
# Using Python script
docker exec -it daniel-service python -c "
from workspace.controls.user_control import UserControl
from workspace.db_config import get_db
db = next(get_db())
ctrl = UserControl(db)
result = ctrl.create_user('admin', 'admin@school.com', 'secure_password', 'ADMIN')
print('User created:', result)
"
```

### User Roles
- **ADMIN**: Full system access, user management
- **TEACHER**: Class management, student enrollment
- **STAFF**: Limited administrative functions
- **PARENT**: View student information only

### Password Reset
```bash
# Reset user password
docker exec -it daniel-service python -c "
from workspace.controls.user_control import UserControl
from workspace.db_config import get_db
db = next(get_db())
ctrl = UserControl(db)
result = ctrl.update_password('username', 'new_password')
print('Password updated:', result)
"
```

## API Documentation

### Authentication
- **Method**: JWT Bearer tokens
- **Login**: `POST /auth/login`
- **Token Refresh**: `POST /auth/refresh`
- **Headers**: `Authorization: Bearer <token>`

### Key Endpoints

#### User Management
- `POST /users/` - Create user
- `GET /users/` - List users
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

#### Student Management
- `POST /students/` - Create student
- `GET /students/` - List students
- `PUT /students/{id}` - Update student
- `GET /students/{id}/classes` - Student classes

#### Class Management
- `POST /classes/` - Create class
- `GET /classes/` - List classes
- `PUT /classes/{id}` - Update class
- `POST /classes/{id}/enroll` - Enroll student

#### Settings & Images
- `GET /settings/image/{filename}` - Serve image
- `POST /settings/upload/{filename}` - Upload image
- `POST /settings/restore/{filename}` - Restore backup
- `GET /settings/info` - System information

### API Testing
```bash
# Test API health
curl http://localhost:8080/health

# Login and get token
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Use token for authenticated request
curl -X GET http://localhost:8080/users/ \
  -H "Authorization: Bearer <your_token>"
```

## Development Setup

### Backend Development
```bash
# Create virtual environment
cd service
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8080

# Run tests
pytest

# Code formatting
black .
isort .
```

### Frontend Development
```bash
# Install dependencies
cd webapp
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Database Development
```bash
# Create migration
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head

# Downgrade migration
alembic downgrade -1
```

## Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker compose logs daniel-service

# Check port conflicts
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :8080

# Restart Docker daemon
sudo systemctl restart docker
```

#### Database Connection Issues
```bash
# Check MySQL status
docker compose logs daniel-mysql

# Test database connection
docker exec daniel-mysql mysql -u daniel_user -p -e "SELECT 1;"

# Reset database container
docker compose down
docker volume rm danielschool_mysql_data
docker compose up -d
```

#### Images Not Loading
```bash
# Check image directory
docker exec -it daniel-service ls -la /home/data/images

# Check service logs
docker compose logs daniel-service | grep -i image

# Restart service
docker compose restart daniel-service

# Clear browser cache
# Chrome: Ctrl+Shift+R
# Firefox: Ctrl+F5
```

#### API Errors
```bash
# Check API logs
docker compose logs daniel-service | grep -i error

# Test API directly
curl -v http://localhost:8080/health

# Check authentication
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Check disk space
df -h
docker system df

# Clean up Docker
docker system prune -f
docker volume prune -f
```

### Debug Mode
```bash
# Enable debug logging
docker exec -it daniel-service python -c "
import logging
logging.getLogger().setLevel(logging.DEBUG)
"

# View detailed logs
docker compose logs -f --tail=100
```

## Backup & Maintenance

### Complete System Backup
```bash
#!/bin/bash
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup database
docker exec daniel-mysql mysqldump -u root -p daniel_school > $BACKUP_DIR/database.sql

# Backup images
docker run --rm -v danielschool_daniel_data:/data -v $(pwd)/$BACKUP_DIR:/backup ubuntu cp -r /data/images /backup/

# Backup configuration
cp docker-compose.yml $BACKUP_DIR/
cp .env $BACKUP_DIR/
```

### Restore from Backup
```bash
#!/bin/bash
BACKUP_DIR="./backups/20240129_120000"  # Specify backup directory

# Stop services
docker compose down

# Restore database
docker compose up -d daniel-mysql
sleep 30
docker exec -i daniel-mysql mysql -u root -p daniel_school < $BACKUP_DIR/database.sql

# Restore images
docker run --rm -v danielschool_daniel_data:/data -v $(pwd)/$BACKUP_DIR:/backup ubuntu cp -r /backup/images /data/

# Start all services
docker compose up -d
```

### Update Procedures
```bash
# 1. Backup current system
./backup_system.sh

# 2. Pull latest code
git pull origin main

# 3. Update containers
docker compose pull
docker compose up -d --force-recreate

# 4. Run migrations if needed
docker exec -it daniel-service python -m alembic upgrade head

# 5. Verify system
curl http://localhost:8080/health
```

### Maintenance Tasks
```bash
# Clean up old backups (keep last 30 days)
find ./backups -name "*.sql" -mtime +30 -delete

# Clean Docker system
docker system prune -f
docker image prune -f

# Optimize database
docker exec daniel-mysql mysql -u root -p -e "OPTIMIZE TABLE daniel_school.*;"

# Check log file sizes
docker exec daniel-service du -sh /var/log/*
```

## Security

### Security Best Practices
1. **Change Default Passwords**: Update all default passwords in `.env`
2. **Use Strong Secrets**: Generate secure JWT secret keys
3. **Enable HTTPS**: Configure SSL certificates for production
4. **Firewall Configuration**: Restrict access to necessary ports only
5. **Regular Updates**: Keep Docker images and dependencies updated

### SSL/HTTPS Setup
```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-apache

# Generate certificate
sudo certbot --apache -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Configuration
```bash
# Ubuntu UFW
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 3306/tcp   # Block external MySQL access
sudo ufw deny 8080/tcp   # Block external API access (use reverse proxy)
```

### Access Control
- Use environment variables for sensitive configuration
- Implement proper user roles and permissions
- Regular security audits and updates
- Monitor access logs for suspicious activity

## File Structure

```
danielschool/
├── docker-compose.yml          # Docker services configuration
├── Dockerfile                  # Container build instructions
├── requirements.txt            # Python dependencies
├── start.sh                   # Container startup script
├── .env                       # Environment variables (create from .env.example)
├── README.md                  # This documentation
├── LICENSE                    # License information
│
├── service/                   # Backend API service
│   ├── main.py               # FastAPI application entry
│   ├── configuration.py      # Application configuration
│   ├── db_config.py          # Database configuration
│   ├── logging_config.py     # Logging setup
│   ├── controls/             # Business logic controllers
│   ├── routers/              # API route handlers
│   └── schemas/              # Database models and schemas
│
├── webapp/                    # Frontend React application
│   ├── package.json          # Node.js dependencies
│   ├── public/               # Static files
│   ├── src/                  # React source code
│   │   ├── App.js           # Main application component
│   │   ├── component/        # React components
│   │   ├── control/          # Frontend controllers
│   │   ├── framework/        # Utility frameworks
│   │   └── language/         # Internationalization
│   └── build/                # Production build output
│
├── scripts/                   # Utility scripts
│   ├── init_mysql.sql        # Database initialization
│   └── migrate_images.sh     # Image migration script
│
├── backups/                   # Database and system backups
│   ├── backup_database.py    # Backup utilities
│   └── [date]/               # Timestamped backup folders
│
├── docs/                      # Documentation
│   └── IMAGE_STORAGE.md      # Image storage configuration guide
│
└── images/                    # Default images for initialization
    ├── daniel_logo.png       # School logo
    ├── intro.png             # Welcome image
    └── register*.jpg         # Registration step images
```

### Important Directories
- **Data Storage**: Docker volume `daniel_data` mounted at `/home/data`
- **Image Storage**: `/home/data/images` (persistent across container restarts)
- **Logs**: Container logs accessible via `docker compose logs`
- **Configuration**: Environment variables in `.env` file

---

## Support & Contributing

### Getting Help
1. Check this README for common solutions
2. Review application logs: `docker compose logs`
3. Check GitHub issues for known problems
4. Create new issue with detailed error information

### Contributing
1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Submit pull request with detailed description

### License
Copyright (c) 2025 Milal Daniel Korean School. See LICENSE file for details.