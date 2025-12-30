#!/usr/bin/env python3
"""
SQLite to MySQL Data Migration Script
Migrates data from database.sqlite.20251229 to MySQL database
"""

import sqlite3
import pymysql
import sys
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Database configurations
SQLITE_DB_PATH = '../backup/database.sqlite.20251229'
MYSQL_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'daniel_user',
    'password': 'daniel_password_2025',
    'database': 'daniel_school',
    'charset': 'utf8mb4'
}

# Table mapping and column configurations
TABLES = [
    'Teacher',
    'Student', 
    'Class',
    'User',
    'Enrollment',
    'Schedule',
    'Consent',
    'Log',
    'Request'
]

def connect_sqlite():
    """Connect to SQLite database"""
    if not os.path.exists(SQLITE_DB_PATH):
        logger.error(f"SQLite database file not found: {SQLITE_DB_PATH}")
        return None
    
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row  # Enable column name access
        logger.info(f"Connected to SQLite database: {SQLITE_DB_PATH}")
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to SQLite: {e}")
        return None

def connect_mysql():
    """Connect to MySQL database"""
    try:
        conn = pymysql.connect(**MYSQL_CONFIG)
        logger.info("Connected to MySQL database")
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to MySQL: {e}")
        return None

def get_table_columns(sqlite_conn, table_name):
    """Get column names from SQLite table"""
    try:
        cursor = sqlite_conn.cursor()
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [row[1] for row in cursor.fetchall()]
        return columns
    except Exception as e:
        logger.error(f"Failed to get columns for table {table_name}: {e}")
        return []

def clear_mysql_table(mysql_conn, table_name):
    """Clear existing data from MySQL table"""
    try:
        cursor = mysql_conn.cursor()
        cursor.execute(f"DELETE FROM {table_name}")
        mysql_conn.commit()
        logger.info(f"Cleared existing data from {table_name}")
    except Exception as e:
        logger.warning(f"Failed to clear table {table_name}: {e}")

def migrate_table(sqlite_conn, mysql_conn, table_name):
    """Migrate data from SQLite table to MySQL table"""
    try:
        # Check if table exists in SQLite
        sqlite_cursor = sqlite_conn.cursor()
        sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
        if not sqlite_cursor.fetchone():
            logger.warning(f"Table {table_name} not found in SQLite database")
            return 0
        
        # Get table structure
        columns = get_table_columns(sqlite_conn, table_name)
        if not columns:
            logger.warning(f"No columns found for table {table_name}")
            return 0
        
        # Fetch all data from SQLite
        sqlite_cursor.execute(f"SELECT * FROM {table_name}")
        rows = sqlite_cursor.fetchall()
        
        if not rows:
            logger.info(f"No data found in table {table_name}")
            return 0
        
        # Clear existing MySQL data
        clear_mysql_table(mysql_conn, table_name)
        
        # Prepare MySQL insert statement
        placeholders = ', '.join(['%s'] * len(columns))
        column_names = ', '.join([f"`{col}`" for col in columns])
        insert_sql = f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders})"
        
        # Insert data into MySQL
        mysql_cursor = mysql_conn.cursor()
        rows_inserted = 0
        
        for row in rows:
            try:
                # Convert Row object to tuple
                values = tuple(row[col] for col in columns)
                mysql_cursor.execute(insert_sql, values)
                rows_inserted += 1
            except Exception as e:
                logger.error(f"Failed to insert row in {table_name}: {e}")
                logger.error(f"Row data: {dict(row)}")
                continue
        
        mysql_conn.commit()
        logger.info(f"Migrated {rows_inserted} rows to table {table_name}")
        return rows_inserted
        
    except Exception as e:
        logger.error(f"Failed to migrate table {table_name}: {e}")
        mysql_conn.rollback()
        return 0

def verify_migration(sqlite_conn, mysql_conn, table_name):
    """Verify migration by comparing row counts"""
    try:
        # Count SQLite rows
        sqlite_cursor = sqlite_conn.cursor()
        sqlite_cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        sqlite_count = sqlite_cursor.fetchone()[0]
        
        # Count MySQL rows
        mysql_cursor = mysql_conn.cursor()
        mysql_cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        mysql_count = mysql_cursor.fetchone()[0]
        
        if sqlite_count == mysql_count:
            logger.info(f"✓ {table_name}: {mysql_count} rows migrated successfully")
            return True
        else:
            logger.warning(f"✗ {table_name}: Row count mismatch - SQLite: {sqlite_count}, MySQL: {mysql_count}")
            return False
            
    except Exception as e:
        logger.error(f"Failed to verify migration for {table_name}: {e}")
        return False

def main():
    """Main migration function"""
    logger.info("Starting SQLite to MySQL data migration...")
    
    # Connect to databases
    sqlite_conn = connect_sqlite()
    mysql_conn = connect_mysql()
    
    if not sqlite_conn or not mysql_conn:
        logger.error("Failed to establish database connections")
        sys.exit(1)
    
    try:
        total_migrated = 0
        successful_tables = []
        failed_tables = []
        
        # Migrate each table
        for table_name in TABLES:
            logger.info(f"\n--- Migrating table: {table_name} ---")
            rows_migrated = migrate_table(sqlite_conn, mysql_conn, table_name)
            
            if rows_migrated >= 0:  # 0 is success (empty table), negative is failure
                total_migrated += rows_migrated
                successful_tables.append(table_name)
                
                # Verify migration
                verify_migration(sqlite_conn, mysql_conn, table_name)
            else:
                failed_tables.append(table_name)
        
        # Summary
        logger.info(f"\n=== Migration Summary ===")
        logger.info(f"Total rows migrated: {total_migrated}")
        logger.info(f"Successful tables: {len(successful_tables)}")
        logger.info(f"Failed tables: {len(failed_tables)}")
        
        if successful_tables:
            logger.info(f"Successfully migrated: {', '.join(successful_tables)}")
        
        if failed_tables:
            logger.warning(f"Failed to migrate: {', '.join(failed_tables)}")
        
        logger.info("Migration completed!")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        sys.exit(1)
    
    finally:
        # Close connections
        if sqlite_conn:
            sqlite_conn.close()
        if mysql_conn:
            mysql_conn.close()

if __name__ == "__main__":
    main()