#!/usr/bin/env python3
"""
Database Backup Script
Exports all database tables to CSV files in the backups folder.
Supports both MySQL (production) and SQLite (local development).

Copyright (c) 2025 Milal Daniel Korean School.
"""

import os
import csv
import sys
from datetime import datetime
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
import pandas as pd

def get_database_connection():
    """Get database connection based on environment."""
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    if DATABASE_URL:
        # Production MySQL configuration
        print("Connecting to MySQL database...")
        engine = create_engine(
            DATABASE_URL,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=3600
        )
    else:
        # Local development SQLite fallback
        print("Connecting to SQLite database...")
        BASE_DIR = "/home/data/master_db"
        DATABASE_FILENAME = "database.sqlite"
        SQLITE_DATABASE_URL = f"sqlite:///{BASE_DIR}/{DATABASE_FILENAME}"
        
        if not os.path.exists(f"{BASE_DIR}/{DATABASE_FILENAME}"):
            print(f"Error: SQLite database not found at {BASE_DIR}/{DATABASE_FILENAME}")
            sys.exit(1)
            
        engine = create_engine(
            SQLITE_DATABASE_URL, connect_args={"check_same_thread": False}
        )
    
    return engine

def get_all_tables(engine):
    """Get list of all tables in the database."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Found {len(tables)} tables: {', '.join(tables)}")
    return tables

def backup_table_to_csv(engine, table_name, backup_dir):
    """Backup a single table to CSV file."""
    try:
        # Create backup directory if it doesn't exist
        os.makedirs(backup_dir, exist_ok=True)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_filename = f"{table_name}_{timestamp}.csv"
        csv_filepath = os.path.join(backup_dir, csv_filename)
        
        # Also create a latest version without timestamp
        latest_csv_filepath = os.path.join(backup_dir, f"{table_name}.csv")
        
        # Read table data using pandas
        query = f"SELECT * FROM `{table_name}`"
        df = pd.read_sql(query, engine)
        
        if df.empty:
            print(f"  Warning: Table '{table_name}' is empty")
        else:
            print(f"  Found {len(df)} rows in '{table_name}'")
        
        # Export to CSV with timestamp
        df.to_csv(csv_filepath, index=False, encoding='utf-8')
        
        # Export to CSV without timestamp (latest version)
        df.to_csv(latest_csv_filepath, index=False, encoding='utf-8')
        
        print(f"  ✓ Backed up '{table_name}' to {csv_filename}")
        return True, len(df)
        
    except Exception as e:
        print(f"  ✗ Error backing up '{table_name}': {str(e)}")
        return False, 0

def backup_database():
    """Main backup function."""
    print("=== Database Backup Script ===")
    print(f"Backup started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Set backup directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backup_dir = os.path.join(script_dir, "backups")
    
    try:
        # Get database connection
        engine = get_database_connection()
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✓ Database connection successful")
        
        # Get all tables
        tables = get_all_tables(engine)
        
        if not tables:
            print("No tables found in database")
            return
        
        # Backup each table
        print(f"\nBacking up tables to: {backup_dir}")
        successful_backups = 0
        total_rows = 0
        
        for table in tables:
            print(f"Backing up table: {table}")
            success, row_count = backup_table_to_csv(engine, table, backup_dir)
            if success:
                successful_backups += 1
                total_rows += row_count
        
        # Summary
        print(f"\n=== Backup Summary ===")
        print(f"Tables processed: {len(tables)}")
        print(f"Successful backups: {successful_backups}")
        print(f"Failed backups: {len(tables) - successful_backups}")
        print(f"Total rows backed up: {total_rows}")
        print(f"Backup completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        if successful_backups == len(tables):
            print("✓ All tables backed up successfully!")
        else:
            print(f"⚠ {len(tables) - successful_backups} tables failed to backup")
            
    except Exception as e:
        print(f"✗ Critical error during backup: {str(e)}")
        sys.exit(1)
    
    finally:
        if 'engine' in locals():
            engine.dispose()

def backup_specific_tables(table_names):
    """Backup only specific tables."""
    print("=== Selective Database Backup ===")
    print(f"Backing up tables: {', '.join(table_names)}")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backup_dir = os.path.join(script_dir, "backups")
    
    try:
        engine = get_database_connection()
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        # Get all available tables to validate input
        available_tables = get_all_tables(engine)
        
        successful_backups = 0
        total_rows = 0
        
        for table_name in table_names:
            if table_name not in available_tables:
                print(f"✗ Table '{table_name}' not found in database")
                continue
                
            print(f"Backing up table: {table_name}")
            success, row_count = backup_table_to_csv(engine, table_name, backup_dir)
            if success:
                successful_backups += 1
                total_rows += row_count
        
        print(f"\n=== Selective Backup Summary ===")
        print(f"Requested tables: {len(table_names)}")
        print(f"Successful backups: {successful_backups}")
        print(f"Total rows backed up: {total_rows}")
        
    except Exception as e:
        print(f"✗ Error during selective backup: {str(e)}")
        sys.exit(1)
    
    finally:
        if 'engine' in locals():
            engine.dispose()

if __name__ == "__main__":
    # Check if specific tables are requested via command line
    if len(sys.argv) > 1:
        # Backup specific tables
        requested_tables = sys.argv[1:]
        backup_specific_tables(requested_tables)
    else:
        # Backup all tables
        backup_database()