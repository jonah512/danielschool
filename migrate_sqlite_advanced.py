#!/usr/bin/env python3
"""
Advanced SQLite to MySQL Data Migration Script
Handles data type conversions and edge cases
"""

import sqlite3
import pymysql
import sys
import os
from datetime import datetime
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Database configurations
SQLITE_DB_PATH = 'database.sqlite.20251229'
MYSQL_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'daniel_user',
    'password': 'daniel_password_2025',
    'database': 'daniel_school',
    'charset': 'utf8mb4'
}

# Column mappings and transformations
COLUMN_TRANSFORMATIONS = {
    'Teacher': {
        'name': lambda x: x[:100] if x else None,  # Truncate to VARCHAR(100)
        'subject': lambda x: x[:100] if x else None,
        'email': lambda x: x[:255] if x else None,
        'phone': lambda x: x[:20] if x else None,
    },
    'Student': {
        'name': lambda x: x[:100] if x else None,
        'email': lambda x: x[:255] if x else None,
        'phone': lambda x: x[:20] if x else None,
        'parent_name': lambda x: x[:100] if x else None,
        'address': lambda x: x[:500] if x else None,
        'gender': lambda x: x[:10] if x else None,
        'religion': lambda x: x[:50] if x else None,
        'church': lambda x: x[:200] if x else None,
    },
    'Class': {
        'name': lambda x: x[:100] if x else None,
        'description': lambda x: x[:500] if x else None,
        'term': lambda x: x[:20] if x else None,
    },
    'User': {
        'username': lambda x: x[:50] if x else None,
        'email': lambda x: x[:255] if x else None,
        'hashed_password': lambda x: x[:255] if x else None,
        'role': lambda x: x[:20] if x else None,
    },
    'Enrollment': {
        'comment': lambda x: x[:1000] if x else None,
        'status': lambda x: x[:20] if x else None,
        'term': lambda x: x[:20] if x else None,
    },
    'Schedule': {
        'term': lambda x: x[:20] if x else None,
    },
    'Consent': {
        'title': lambda x: x[:200] if x else None,
    },
    'Log': {
        'email': lambda x: x[:255] if x else None,
    },
    'Request': {
        'email': lambda x: x[:255] if x else None,
        'phone': lambda x: x[:20] if x else None,
        'name': lambda x: x[:100] if x else None,
        'students': lambda x: x[:500] if x else None,
        'status': lambda x: x[:20] if x else None,
    }
}

def connect_sqlite():
    """Connect to SQLite database"""
    if not os.path.exists(SQLITE_DB_PATH):
        logger.error(f"SQLite database file not found: {SQLITE_DB_PATH}")
        return None
    
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
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

def get_sqlite_tables(sqlite_conn):
    """Get list of all tables in SQLite database, excluding system tables"""
    try:
        cursor = sqlite_conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        all_tables = [row[0] for row in cursor.fetchall()]
        
        # Filter out SQLite system tables
        system_tables = ['sqlite_sequence', 'sqlite_stat1', 'sqlite_stat2', 'sqlite_stat3', 'sqlite_stat4']
        tables = [table for table in all_tables if table not in system_tables]
        
        logger.info(f"Found SQLite tables: {', '.join(all_tables)}")
        logger.info(f"Migrating tables: {', '.join(tables)}")
        if len(all_tables) != len(tables):
            skipped = [table for table in all_tables if table not in tables]
            logger.info(f"Skipping system tables: {', '.join(skipped)}")
        
        return tables
    except Exception as e:
        logger.error(f"Failed to get SQLite tables: {e}")
        return []

def get_table_info(sqlite_conn, table_name):
    """Get detailed table information"""
    try:
        cursor = sqlite_conn.cursor()
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns_info = cursor.fetchall()
        
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        row_count = cursor.fetchone()[0]
        
        return {
            'columns': [col[1] for col in columns_info],
            'column_info': columns_info,
            'row_count': row_count
        }
    except Exception as e:
        logger.error(f"Failed to get table info for {table_name}: {e}")
        return None

def transform_value(table_name, column_name, value):
    """Apply transformations to column values"""
    if value is None:
        return None
    
    if table_name in COLUMN_TRANSFORMATIONS:
        if column_name in COLUMN_TRANSFORMATIONS[table_name]:
            transformer = COLUMN_TRANSFORMATIONS[table_name][column_name]
            return transformer(value)
    
    return value

def migrate_table_advanced(sqlite_conn, mysql_conn, table_name):
    """Advanced table migration with error handling and transformations"""
    logger.info(f"Starting migration for table: {table_name}")
    
    # Get table information
    table_info = get_table_info(sqlite_conn, table_name)
    if not table_info:
        return 0
    
    if table_info['row_count'] == 0:
        logger.info(f"Table {table_name} is empty, skipping")
        return 0
    
    logger.info(f"Table {table_name}: {table_info['row_count']} rows, {len(table_info['columns'])} columns")
    
    try:
        # Clear existing MySQL data
        mysql_cursor = mysql_conn.cursor()
        mysql_cursor.execute(f"DELETE FROM {table_name}")
        mysql_conn.commit()
        logger.info(f"Cleared existing data from MySQL table {table_name}")
        
        # Fetch data from SQLite
        sqlite_cursor = sqlite_conn.cursor()
        sqlite_cursor.execute(f"SELECT * FROM {table_name}")
        
        # Prepare MySQL insert
        columns = table_info['columns']
        placeholders = ', '.join(['%s'] * len(columns))
        column_names = ', '.join([f"`{col}`" for col in columns])
        insert_sql = f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders})"
        
        rows_migrated = 0
        rows_failed = 0
        batch_size = 100
        batch = []
        
        for row in sqlite_cursor:
            try:
                # Transform values
                transformed_values = []
                for i, column_name in enumerate(columns):
                    original_value = row[i]
                    transformed_value = transform_value(table_name, column_name, original_value)
                    transformed_values.append(transformed_value)
                
                batch.append(tuple(transformed_values))
                
                # Process batch
                if len(batch) >= batch_size:
                    try:
                        mysql_cursor.executemany(insert_sql, batch)
                        mysql_conn.commit()
                        rows_migrated += len(batch)
                        batch = []
                    except Exception as batch_e:
                        logger.error(f"Batch insert failed for {table_name}: {batch_e}")
                        mysql_conn.rollback()
                        
                        # Try individual inserts for this batch
                        for single_row in batch:
                            try:
                                mysql_cursor.execute(insert_sql, single_row)
                                mysql_conn.commit()
                                rows_migrated += 1
                            except Exception as single_e:
                                logger.error(f"Single row insert failed: {single_e}")
                                logger.error(f"Row data: {single_row}")
                                rows_failed += 1
                        batch = []
                
            except Exception as e:
                logger.error(f"Row processing failed: {e}")
                rows_failed += 1
                continue
        
        # Process remaining batch
        if batch:
            try:
                mysql_cursor.executemany(insert_sql, batch)
                mysql_conn.commit()
                rows_migrated += len(batch)
            except Exception as batch_e:
                logger.error(f"Final batch insert failed for {table_name}: {batch_e}")
                mysql_conn.rollback()
                
                for single_row in batch:
                    try:
                        mysql_cursor.execute(insert_sql, single_row)
                        mysql_conn.commit()
                        rows_migrated += 1
                    except Exception as single_e:
                        logger.error(f"Single row insert failed: {single_e}")
                        rows_failed += 1
        
        logger.info(f"Table {table_name}: {rows_migrated} rows migrated, {rows_failed} rows failed")
        return rows_migrated
        
    except Exception as e:
        logger.error(f"Failed to migrate table {table_name}: {e}")
        mysql_conn.rollback()
        return 0

def generate_migration_report(results):
    """Generate a detailed migration report"""
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_tables': len(results),
        'successful_tables': len([r for r in results if r['success']]),
        'total_rows_migrated': sum(r['rows_migrated'] for r in results),
        'tables': results
    }
    
    # Save report to file
    report_file = f"migration_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    logger.info(f"Migration report saved to: {report_file}")
    return report

def main():
    """Main migration function with comprehensive reporting"""
    logger.info("=" * 60)
    logger.info("Starting Advanced SQLite to MySQL Data Migration")
    logger.info("=" * 60)
    
    # Connect to databases
    sqlite_conn = connect_sqlite()
    mysql_conn = connect_mysql()
    
    if not sqlite_conn or not mysql_conn:
        logger.error("Failed to establish database connections")
        sys.exit(1)
    
    try:
        # Get all tables from SQLite
        sqlite_tables = get_sqlite_tables(sqlite_conn)
        
        results = []
        total_rows_migrated = 0
        
        for table_name in sqlite_tables:
            logger.info(f"\n{'='*20} {table_name} {'='*20}")
            
            start_time = datetime.now()
            rows_migrated = migrate_table_advanced(sqlite_conn, mysql_conn, table_name)
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            result = {
                'table_name': table_name,
                'rows_migrated': rows_migrated,
                'success': rows_migrated >= 0,
                'duration_seconds': duration,
                'timestamp': start_time.isoformat()
            }
            results.append(result)
            total_rows_migrated += rows_migrated if rows_migrated > 0 else 0
        
        # Generate report
        report = generate_migration_report(results)
        
        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("MIGRATION SUMMARY")
        logger.info("=" * 60)
        logger.info(f"Total tables processed: {report['total_tables']}")
        logger.info(f"Successful migrations: {report['successful_tables']}")
        logger.info(f"Total rows migrated: {report['total_rows_migrated']}")
        
        successful_tables = [r['table_name'] for r in results if r['success']]
        failed_tables = [r['table_name'] for r in results if not r['success']]
        
        if successful_tables:
            logger.info(f"✓ Successfully migrated: {', '.join(successful_tables)}")
        
        if failed_tables:
            logger.warning(f"✗ Failed to migrate: {', '.join(failed_tables)}")
        
        logger.info(f"Migration completed! Report saved to: migration_report_*.json")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        sys.exit(1)
    
    finally:
        if sqlite_conn:
            sqlite_conn.close()
        if mysql_conn:
            mysql_conn.close()

if __name__ == "__main__":
    main()