#!/usr/bin/env python3
"""
Database Migration Script - SQLite to MySQL
Copyright (c) 2025 Milal Daniel Korean School.

This script helps migrate data from SQLite to MySQL and creates tables.
"""

import os
import sys
import sqlite3
import pymysql
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import json
from datetime import datetime

# Add the service directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'service'))

try:
    from service.schemas.models import Base, Student, Teacher, Class, User, Enrollment, Schedule, Consent, Log, Request
    from service.db_config import engine, SessionLocal
except ImportError:
    print("Warning: Could not import models. Creating tables manually.")

def create_mysql_tables():
    """Create all tables in MySQL database"""
    try:
        # Create all tables using SQLAlchemy
        Base.metadata.create_all(bind=engine)
        print("✅ MySQL tables created successfully")
        return True
    except Exception as e:
        print(f"❌ Error creating MySQL tables: {e}")
        return False

def migrate_data_from_sqlite(sqlite_path="/home/data/master_db/database.sqlite"):
    """Migrate data from SQLite to MySQL"""
    if not os.path.exists(sqlite_path):
        print(f"SQLite database not found at {sqlite_path}")
        return False
    
    try:
        # Connect to SQLite
        sqlite_conn = sqlite3.connect(sqlite_path)
        sqlite_conn.row_factory = sqlite3.Row  # Enable column access by name
        
        # Connect to MySQL
        mysql_session = SessionLocal()
        
        print("Starting data migration from SQLite to MySQL...")
        
        # Tables to migrate (in order to handle dependencies)
        tables = [
            'Teacher', 'Student', 'Class', 'User', 
            'Enrollment', 'Schedule', 'Consent', 'Log', 'Request'
        ]
        
        for table in tables:
            print(f"Migrating {table}...")
            
            # Read from SQLite
            cursor = sqlite_conn.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            
            if not rows:
                print(f"  No data found in {table}")
                continue
            
            # Get column names
            columns = [description[0] for description in cursor.description]
            
            migrated_count = 0
            for row in rows:
                try:
                    # Convert row to dict
                    row_dict = dict(zip(columns, row))
                    
                    # Handle datetime conversion
                    for key, value in row_dict.items():
                        if key in ['created_at', 'updated_at', 'action_time', 'request_time', 'birth_date', 'opening_time', 'closing_time'] and value:
                            try:
                                # Try to parse datetime string
                                if isinstance(value, str):
                                    row_dict[key] = datetime.fromisoformat(value.replace('Z', ''))
                            except:
                                row_dict[key] = datetime.now()
                    
                    # Insert into MySQL using raw SQL to avoid SQLAlchemy model issues
                    placeholders = ', '.join(['%s'] * len(row_dict))
                    columns_str = ', '.join(row_dict.keys())
                    values = list(row_dict.values())
                    
                    query = f"INSERT INTO {table} ({columns_str}) VALUES ({placeholders})"
                    mysql_session.execute(text(query), values)
                    migrated_count += 1
                    
                except Exception as e:
                    print(f"  Error migrating row in {table}: {e}")
                    continue
            
            print(f"  ✅ Migrated {migrated_count} records from {table}")
        
        mysql_session.commit()
        mysql_session.close()
        sqlite_conn.close()
        
        print("✅ Data migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Migration error: {e}")
        return False

def verify_migration():
    """Verify the migration by checking record counts"""
    try:
        mysql_session = SessionLocal()
        
        print("\nVerifying migration...")
        tables = [
            ('Teacher', Teacher),
            ('Student', Student), 
            ('Class', Class),
            ('User', User),
            ('Enrollment', Enrollment),
            ('Schedule', Schedule),
            ('Consent', Consent),
            ('Log', Log),
            ('Request', Request)
        ]
        
        for table_name, model in tables:
            count = mysql_session.query(model).count()
            print(f"  {table_name}: {count} records")
        
        mysql_session.close()
        print("✅ Migration verification completed")
        return True
        
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False

def main():
    print("MySQL Migration Tool for Daniel School")
    print("=" * 50)
    
    # Check if MySQL environment variables are set
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL environment variable not set")
        print("Please run this script in the Docker container or set MySQL connection details")
        return False
    
    print(f"Database URL: {database_url.replace('daniel_password_2025', '***')}")
    
    # Step 1: Create tables
    print("\n1. Creating MySQL tables...")
    if not create_mysql_tables():
        return False
    
    # Step 2: Migrate data (optional)
    print("\n2. Data migration...")
    choice = input("Do you want to migrate data from SQLite? (y/N): ")
    if choice.lower() == 'y':
        if migrate_data_from_sqlite():
            # Step 3: Verify migration
            verify_migration()
        else:
            print("❌ Data migration failed")
            return False
    else:
        print("Skipping data migration")
    
    print("\n🎉 MySQL setup completed!")
    print("\nYour application is now configured to use MySQL instead of SQLite.")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)