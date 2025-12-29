#!/usr/bin/env python3
"""
Parent Name Update Script for Daniel School
Copyright (c) 2025 Milal Daniel Korean School.

This script updates parent_name in the Student table based on parent_name.csv data.
"""

import os
import sys
import csv
import sqlite3
from datetime import datetime

# CSV file path
PARENT_CSV_FILE = "parent_name.csv"
DB_PATH = "/home/data/master_db/database.sqlite"

def update_parent_names():
    """Update parent names in Student table based on CSV data."""
    if not os.path.exists(PARENT_CSV_FILE):
        print(f"❌ CSV file not found: {PARENT_CSV_FILE}")
        print("Please ensure the parent_name.csv file is in the current directory.")
        return False
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        updated = 0
        not_found = 0
        errors = 0
        
        with open(PARENT_CSV_FILE, 'r', encoding='utf-8-sig') as file:
            csv_reader = csv.DictReader(file)
            
            # Validate headers
            expected_headers = ['name', 'email', 'parent_name']
            actual_headers = csv_reader.fieldnames
            print(f"📋 CSV Headers found: {actual_headers}")
            
            missing_headers = [h for h in expected_headers if h not in actual_headers]
            if missing_headers:
                print(f"⚠️  Missing headers: {missing_headers}")
                return False
            
            for row_num, row in enumerate(csv_reader, start=2):
                try:
                    # Extract data from CSV
                    student_name = row.get('name', '').strip()
                    student_email = row.get('email', '').strip()
                    parent_name = row.get('parent_name', '').strip()
                    
                    if not student_name or not student_email:
                        print(f"⚠️  Skipped row {row_num}: Missing name or email")
                        continue
                    
                    if not parent_name:
                        print(f"⚠️  Skipped row {row_num}: Empty parent name for {student_name}")
                        continue
                    
                    # Find matching student in database
                    cursor.execute(
                        "SELECT id, parent_name FROM Student WHERE name = ? AND email = ?",
                        (student_name, student_email)
                    )
                    results = cursor.fetchall()
                    
                    if not results:
                        print(f"❌ Row {row_num}: No student found for '{student_name}' with email '{student_email}'")
                        not_found += 1
                        continue
                    
                    # Update all matching students (in case of duplicates)
                    for student_id, current_parent_name in results:
                        # Update parent_name and updated_at timestamp
                        current_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.%f")
                        
                        cursor.execute(
                            "UPDATE Student SET parent_name = ?, updated_at = ? WHERE id = ?",
                            (parent_name, current_time, student_id)
                        )
                        
                        updated += 1
                        print(f"✅ Updated {student_name}: '{current_parent_name}' → '{parent_name}'")
                
                except Exception as e:
                    errors += 1
                    print(f"❌ Error row {row_num}: {e}")
                    continue
        
        # Commit all changes
        conn.commit()
        
        print("\n" + "=" * 60)
        print(f"🎉 Parent name update completed!")
        print(f"✅ Successfully updated: {updated} records")
        print(f"❌ Students not found: {not_found}")
        print(f"⚠️  Errors: {errors}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def preview_parent_csv():
    """Preview the first few rows of parent CSV data."""
    if not os.path.exists(PARENT_CSV_FILE):
        print(f"❌ CSV file not found: {PARENT_CSV_FILE}")
        return
    
    print("📋 Preview of parent CSV data:")
    print("=" * 80)
    
    with open(PARENT_CSV_FILE, 'r', encoding='utf-8-sig') as file:
        csv_reader = csv.DictReader(file)
        
        # Show headers
        print(f"Headers: {', '.join(csv_reader.fieldnames)}")
        print("-" * 80)
        
        # Show first 5 rows
        for i, row in enumerate(csv_reader):
            if i >= 5:
                break
            name = row.get('name', 'N/A')
            email = row.get('email', 'N/A')
            parent_name = row.get('parent_name', 'N/A')
            print(f"Row {i+2}: {name} | {email} | Parent: {parent_name}")
        
        print("..." + " (showing first 5 rows)")

def count_parent_csv_records():
    """Count total records in parent CSV."""
    if not os.path.exists(PARENT_CSV_FILE):
        return 0
    
    with open(PARENT_CSV_FILE, 'r', encoding='utf-8-sig') as file:
        csv_reader = csv.DictReader(file)
        return sum(1 for row in csv_reader)

def check_database_students():
    """Check how many students currently have empty parent_name."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Count total students
        cursor.execute("SELECT COUNT(*) FROM Student")
        total_students = cursor.fetchone()[0]
        
        # Count students with empty parent_name
        cursor.execute("SELECT COUNT(*) FROM Student WHERE parent_name IS NULL OR parent_name = ''")
        empty_parent_name = cursor.fetchone()[0]
        
        # Count students with parent_name
        cursor.execute("SELECT COUNT(*) FROM Student WHERE parent_name IS NOT NULL AND parent_name != ''")
        has_parent_name = cursor.fetchone()[0]
        
        print(f"📊 Database Status:")
        print(f"   Total students: {total_students}")
        print(f"   With parent name: {has_parent_name}")
        print(f"   Without parent name: {empty_parent_name}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database check error: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def main():
    """Main function."""
    print("Daniel School - Parent Name Update")
    print("=" * 50)
    
    # Check if CSV file exists
    if not os.path.exists(PARENT_CSV_FILE):
        print(f"❌ CSV file not found: {PARENT_CSV_FILE}")
        print("Please place the parent_name.csv file in the current directory.")
        return 1
    
    # Count records in CSV
    total_records = count_parent_csv_records()
    print(f"📊 Found {total_records} parent records in CSV file")
    
    # Check database status
    print()
    check_database_students()
    print()
    
    # Preview data
    response = input("Preview parent CSV data? (y/N): ")
    if response.lower() == 'y':
        preview_parent_csv()
        print()
    
    # Confirm update
    response = input(f"Update parent names for {total_records} records? (y/N): ")
    if response.lower() != 'y':
        print("Update cancelled.")
        return 0
    
    # Update parent names
    success = update_parent_names()
    
    if success:
        print("\n✨ Parent name update completed successfully!")
        print("\nNext steps:")
        print("1. Verify the updated data in your application")
        print("2. Check for any students that still need parent names")
        return 0
    else:
        print("\n❌ Parent name update failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())