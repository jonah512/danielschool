-- MySQL Database Initialization Script
-- Copyright (c) 2025 Milal Daniel Korean School.

-- Create database if not exists (handled by Docker environment variables)
-- USE daniel_school;

-- Set charset and collation
ALTER DATABASE daniel_school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create tables will be handled by SQLAlchemy migrations
-- This script is mainly for initial database setup and sample data

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON daniel_school.* TO 'daniel_user'@'%';
-- FLUSH PRIVILEGES;

SELECT 'MySQL Database initialized successfully' as Status;