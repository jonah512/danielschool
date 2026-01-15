#!/usr/bin/env python3
"""
Database Restore Script
Restores database tables from CSV backup files.
Supports both MySQL (production) and SQLite (local development).
Copyright (c) 2025 Milal Daniel Korean         # Insert data using pandas
        print(f"  Inserting {len(df)} rows into '{table_name}'...")
        
        # Use pandas to_sql with the engine
        df.to_sql(table_name, engine, if_exists='append', index=False, chunksize=500)
        
        # Verify data was inserted by querying the count
        inspector = inspect(engine)
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT COUNT(*) as cnt FROM `{table_name}`"))
            count = result.fetchone()[0]
            print(f"  Verified: {count} rows in '{table_name}'")os
"""
import os
import csv
import sys
from datetime import datetime

# Add parent directory to path to import service module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text, inspect, MetaData, Table, Column, event, insert
from sqlalchemy import Integer, String, DateTime, Float, TEXT
from sqlalchemy.orm import sessionmaker
import pandas as pd
from db_config import engine

def get_database_connection():
    """Get database connection using the engine from db_config."""
    print("Using database engine from db_config...")
    return engine

def get_csv_files(backup_dir):
    """Get list of CSV files (excluding timestamped versions)."""
    if not os.path.exists(backup_dir):
        print(f"Backup directory not found: {backup_dir}")
        return []
    
    csv_files = []
    for file in os.listdir(backup_dir):
        if file.endswith('.csv') and not any(char.isdigit() for char in file.split('.')[0]):
            # This excludes timestamped files (those with numbers)
            if not file.endswith('_README.csv') and file != 'backup_database.csv':
                table_name = file.replace('.csv', '')
                csv_files.append((table_name, os.path.join(backup_dir, file)))
    
    print(f"Found {len(csv_files)} CSV files to restore: {[name for name, _ in csv_files]}")
    return csv_files

def create_table_schema(engine, table_name):
    """Create table schema based on known table structures."""
    metadata = MetaData()
    
    # Define table schemas based on your models.py
    table_schemas = {
        'Teacher': Table('Teacher', metadata,
            Column('id', Integer, primary_key=True),
            Column('name', String(100)),
            Column('subject', String(100)),
            Column('email', String(255)),
            Column('phone', String(20))
        ),
        'Student': Table('Student', metadata,
            Column('id', Integer, primary_key=True),
            Column('name', String(100)),
            Column('birth_date', DateTime),
            Column('email', String(255)),
            Column('phone', String(20)),
            Column('parent_name', String(100)),
            Column('address', String(500)),
            Column('gender', String(10)),
            Column('religion', String(50)),
            Column('church', String(200)),
            Column('korean_level', Integer),
            Column('korean_level_confirmed', Integer),
            Column('grade', Integer),
            Column('created_at', DateTime),
            Column('updated_at', DateTime)
        ),
        'Class': Table('Class', metadata,
            Column('id', Integer, primary_key=True),
            Column('name', String(100)),
            Column('description', String(500)),
            Column('year', Integer),
            Column('term', String(20)),
            Column('teacher_id', Integer),
            Column('min_grade', Integer),
            Column('max_grade', Integer),
            Column('max_students', Integer),
            Column('period', Integer),
            Column('fee', Float),
            Column('mendatory', Integer),
            Column('enrolled_number', Integer),
            Column('min_korean_level', Integer),
            Column('max_korean_level', Integer),
            Column('display_order', Integer)
        ),
        'User': Table('User', metadata,
            Column('id', Integer, primary_key=True),
            Column('username', String(50)),
            Column('email', String(255)),
            Column('hashed_password', String(255)),
            Column('is_active', Integer),
            Column('created_at', DateTime),
            Column('updated_at', DateTime),
            Column('role', String(20))
        ),
        'Enrollment': Table('Enrollment', metadata,
            Column('id', Integer, primary_key=True),
            Column('student_id', Integer),
            Column('class_id', Integer),
            Column('comment', String(1000)),
            Column('status', String(20)),
            Column('year', Integer),
            Column('term', String(20)),
            Column('created_at', DateTime),
            Column('updated_at', DateTime)
        ),
        'Schedule': Table('Schedule', metadata,
            Column('id', Integer, primary_key=True),
            Column('year', Integer),
            Column('term', String(20)),
            Column('opening_time', DateTime),
            Column('closing_time', DateTime)
        ),
        'Consent': Table('Consent', metadata,
            Column('id', Integer, primary_key=True),
            Column('title', String(200)),
            Column('content', TEXT),
            Column('content_eng', TEXT)
        ),
        'Log': Table('Log', metadata,
            Column('id', Integer, primary_key=True),
            Column('email', String(255)),
            Column('log', TEXT),
            Column('action_time', DateTime)
        ),
        'Request': Table('Request', metadata,
            Column('id', Integer, primary_key=True),
            Column('email', String(255)),
            Column('phone', String(20)),
            Column('name', String(100)),
            Column('students', String(500)),
            Column('message', TEXT),
            Column('status', String(20)),
            Column('memo', TEXT),
            Column('request_time', DateTime)
        )
    }
    
    if table_name in table_schemas:
        table = table_schemas[table_name]
        # Create the table in the database
        metadata.create_all(engine)
        return table
    else:
        print(f"Warning: No schema defined for table '{table_name}', will try to create from CSV structure")
        return None

def restore_table_from_csv(engine, table_name, csv_filepath):
    """Restore a single table from CSV file."""
    print(f"  Restoring table '{table_name}' from '{csv_filepath}'")
    try:
        # Check if CSV file exists and is not empty
        if not os.path.exists(csv_filepath):
            print(f"  ✗ CSV file not found: {csv_filepath}")
            return False, 0
        
        # Read CSV file
        df = pd.read_csv(csv_filepath)
        
        if df.empty:
            print(f"  Warning: CSV file '{csv_filepath}' is empty")
            return True, 0
        
        print(f"  Found {len(df)} rows to restore in '{table_name}'")
        
        # Convert datetime columns
        datetime_columns = ['birth_date', 'created_at', 'updated_at', 'action_time', 'request_time', 
                          'opening_time', 'closing_time']
        for col in datetime_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        
        # Handle NaN values
        df = df.where(pd.notnull(df), None)
        
        # Check if table exists
        inspector = inspect(engine)
        table_exists = table_name in inspector.get_table_names()
        
        if table_exists:
            # Truncate existing table
            print(f"  Table '{table_name}' exists, truncating...")
            with engine.begin() as conn:
                conn.execute(text(f"DELETE FROM `{table_name}`"))
                
                # Reset auto increment if it exists
                if 'mysql' in str(engine.url):
                    try:
                        conn.execute(text(f"ALTER TABLE `{table_name}` AUTO_INCREMENT = 1"))
                    except:
                        pass  # Table might not have auto increment
        else:
            # Create table with schema
            print(f"  Table '{table_name}' doesn't exist, creating...")
            create_table_schema(engine, table_name)
        
        # Insert data using pandas
        print(f"  Inserting {len(df)} rows into '{table_name}'...")
        
        try:
            df.to_sql(table_name, con=engine, if_exists='append', index=False, chunksize=100)
            
            # Verify data was inserted
            with engine.connect() as conn:
                result = conn.execute(text(f"SELECT COUNT(*) FROM `{table_name}`"))
                count = result.scalar()
                print(f"  Verified: {count} rows in '{table_name}'")
            
            print(f"  ✓ Restored '{table_name}' with {len(df)} rows")
            return True, len(df)
        except Exception as insert_error:
            print(f"  Error during insertion: {str(insert_error)}")
            return False, 0
        
    except Exception as e:
        print(f"  ✗ Error restoring '{table_name}': {str(e)}")
        import traceback
        traceback.print_exc()
        return False, 0

def restore_database(backup_dir, table_names=None):
    """Main restore function."""
    print("=== Database Restore Script ===")
    print(f"Restore started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if not backup_dir:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        backup_dir = os.path.join(script_dir, "/workspace/backups/20260111")
    
    print(f"Restoring from: {backup_dir}")
    
    try:
        # Get database connection
        engine = get_database_connection()
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✓ Database connection successful")
        
        # Get CSV files to restore
        csv_files = get_csv_files(backup_dir)
        
        if not csv_files:
            print("No CSV files found to restore")
            return
        
        # Filter by specific tables if requested
        if table_names:
            csv_files = [(name, path) for name, path in csv_files if name in table_names]
            print(f"Filtered to restore only: {[name for name, _ in csv_files]}")
        
        if not csv_files:
            print("No matching CSV files found for specified tables")
            return
        
        # Restore each table
        print(f"\nRestoring tables...")
        successful_restores = 0
        total_rows = 0
        
        # Disable foreign key checks for the entire restore process (MySQL)
        if 'mysql' in str(engine.url):
            with engine.begin() as conn:
                conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        
        try:
            for table_name, csv_filepath in csv_files:
                print(f"Restoring table: {table_name}")
                success, row_count = restore_table_from_csv(engine, table_name, csv_filepath)
                if success:
                    successful_restores += 1
                    total_rows += row_count
        finally:
            # Re-enable foreign key checks (MySQL)
            if 'mysql' in str(engine.url):
                with engine.begin() as conn:
                    conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        
        # Summary
        print(f"\n=== Restore Summary ===")
        print(f"Tables processed: {len(csv_files)}")
        print(f"Successful restores: {successful_restores}")
        print(f"Failed restores: {len(csv_files) - successful_restores}")
        print(f"Total rows restored: {total_rows}")
        print(f"Restore completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Final verification
        print(f"\n=== Final Verification ===")
        inspector = inspect(engine)
        for table_name in inspector.get_table_names():
            with engine.connect() as conn:
                result = conn.execute(text(f"SELECT COUNT(*) as cnt FROM `{table_name}`"))
                count = result.fetchone()[0]
                print(f"  {table_name}: {count} rows")
        
        if successful_restores == len(csv_files):
            print("\n✓ All tables restored successfully!")
        else:
            print(f"\n⚠ {len(csv_files) - successful_restores} tables failed to restore")
            
    except Exception as e:
        print(f"✗ Critical error during restore: {str(e)}")
        sys.exit(1)
    
    finally:
        if 'engine' in locals():
            engine.dispose()

if __name__ == "__main__":
    # Parse command line arguments
    backup_dir = None
    table_names = None
    
    if len(sys.argv) > 1:
        # Check if first argument is a directory path
        if os.path.isdir(sys.argv[1]):
            backup_dir = sys.argv[1]
            table_names = sys.argv[2:] if len(sys.argv) > 2 else None
        else:
            # All arguments are table names
            table_names = sys.argv[1:]
    
    restore_database(backup_dir, table_names)