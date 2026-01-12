#!/usr/bin/env python3
"""
Database Cleanup Script
Deletes all data from database tables while preserving table structure.
Supports both MySQL (production) and SQLite (local development).

Copyright (c) 2025 Milal Daniel Korean School.
"""

import os
import sys
from datetime import datetime

# Add parent directory to path to import service module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text, inspect
from service.db_config import engine

def get_database_connection():
    """Get database connection using the engine from db_config."""
    print("Using database engine from db_config...")
    return engine

def cleanup_database():
    """Main cleanup function - truncates all tables."""
    print("=== Database Cleanup Script ===")
    print(f"Cleanup started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Get database connection
        db_engine = get_database_connection()
        
        # Test connection
        with db_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✓ Database connection successful")
        
        # Get all table names
        inspector = inspect(db_engine)
        table_names = inspector.get_table_names()
        
        if not table_names:
            print("No tables found in the database")
            return
        
        print(f"Found {len(table_names)} tables: {table_names}")
        
        # Confirm cleanup
        print("\n⚠️  WARNING: This will delete all data from the following tables:")
        for table in table_names:
            print(f"  - {table}")
        
        response = input("\nDo you want to continue? (yes/no): ").strip().lower()
        if response not in ['yes', 'y']:
            print("Cleanup cancelled")
            return
        
        # Disable foreign key checks for the entire cleanup process (MySQL)
        if 'mysql' in str(db_engine.url):
            with db_engine.connect() as conn:
                conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
                conn.commit()
        
        # Truncate each table
        print(f"\nCleaning up tables...")
        cleaned_tables = 0
        
        for table_name in table_names:
            try:
                print(f"  Cleaning table: {table_name}")
                with db_engine.connect() as conn:
                    conn.execute(text(f"DELETE FROM `{table_name}`"))
                    
                    # Reset auto increment if it exists (MySQL)
                    if 'mysql' in str(db_engine.url):
                        try:
                            conn.execute(text(f"ALTER TABLE `{table_name}` AUTO_INCREMENT = 1"))
                        except:
                            pass  # Table might not have auto increment
                    
                    conn.commit()
                
                print(f"  ✓ Cleaned '{table_name}'")
                cleaned_tables += 1
            except Exception as e:
                print(f"  ✗ Error cleaning '{table_name}': {str(e)}")
        
        # Re-enable foreign key checks (MySQL)
        if 'mysql' in str(db_engine.url):
            with db_engine.connect() as conn:
                conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
                conn.commit()
        
        # Summary
        print(f"\n=== Cleanup Summary ===")
        print(f"Tables processed: {len(table_names)}")
        print(f"Successfully cleaned: {cleaned_tables}")
        print(f"Failed: {len(table_names) - cleaned_tables}")
        print(f"Cleanup completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        if cleaned_tables == len(table_names):
            print("✓ All tables cleaned successfully!")
        else:
            print(f"⚠ {len(table_names) - cleaned_tables} tables failed to clean")
            
    except Exception as e:
        print(f"✗ Critical error during cleanup: {str(e)}")
        sys.exit(1)
    
    finally:
        if 'db_engine' in locals():
            db_engine.dispose()

if __name__ == "__main__":
    cleanup_database()
