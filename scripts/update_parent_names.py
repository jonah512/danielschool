#!/usr/bin/env python3
"""
Update Parent Names Script for Daniel School
Copyright (c) 2025 Milal Daniel Korean School.

This script updates parent_name field in Student table based on name and email match.
"""

import os
import sys
import csv
import sqlite3
from datetime import datetime

# Parent name CSV file path
CSV_FILE = "parent_name.csv"
DB_PATH = "/home/data/master_db/database.sqlite"

def update_parent_names():
    """Update parent names in the Student table."""
    if not os.path.exists(CSV_FILE):
        print(f"❌ CSV file not found: {CSV_FILE}")
        print("Please ensure the parent_name.csv file is in the current directory.")
        return False
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        updated = 0
        not_found = 0
        errors = 0
        
        with open(CSV_FILE, 'r', encoding='utf-8-sig') as file:
            csv_reader = csv.DictReader(file)
            
            # Validate headers
            expected_headers = ['name', 'email', 'parent_name']
            actual_headers = csv_reader.fieldnames
            print(f"📋 CSV Headers found: {actual_headers}")
            
            for row_num, row in enumerate(csv_reader, start=2):
                try:
                    # Extract data with safety checks
                    student_name = row.get('name', '').strip()
                    student_email = row.get('email', '').strip()
                    parent_name = row.get('parent_name', '').strip()
                    
                    if not student_name or not student_email:
                        print(f"⚠️  Skipped row {row_num}: Missing name or email")
                        continue
                    
                    if not parent_name:
                        print(f"⚠️  Skipped row {row_num}: Missing parent name for {student_name}")
                        continue
                    
                    # Find student by name and email
                    cursor.execute(
                        "SELECT id FROM Student WHERE name = ? AND email = ?",
                        (student_name, student_email)
                    )
                    student_record = cursor.fetchone()
                    
                    if student_record:
                        student_id = student_record[0]
                        
                        # Update parent_name and updated_at
                        current_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.%f")
                        cursor.execute(
                            "UPDATE Student SET parent_name = ?, updated_at = ? WHERE id = ?",
                            (parent_name, current_time, student_id)
                        )
                        
                        updated += 1
                        print(f"✅ Updated row {row_num}: {student_name} → Parent: {parent_name}")
                        
                    else:
                        not_found += 1
                        print(f"❌ Row {row_num}: Student not found - {student_name} ({student_email})")
                    
                except Exception as e:
                    errors += 1
                    print(f"❌ Error row {row_num}: {e}")
                    continue
        
        conn.commit()
        
        print("\n" + "=" * 70)
        print(f"🎉 Parent name update completed!")
        print(f"✅ Successfully updated: {updated} students")
        print(f"❌ Students not found: {not_found}")
        print(f"⚠️  Errors: {errors}")
        
        # Show sample of updated records
        cursor.execute("""
            SELECT name, email, parent_name 
            FROM Student 
            WHERE parent_name != '' 
            LIMIT 5
        """)
        sample_records = cursor.fetchall()
        
        if sample_records:
            print(f"\n📋 Sample of updated records:")
            print("-" * 70)
            for name, email, parent_name in sample_records:
                print(f"  {name} ({email}) → Parent: {parent_name}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def preview_parent_csv():
    """Preview the parent name CSV data."""
    if not os.path.exists(CSV_FILE):
        print(f"❌ CSV file not found: {CSV_FILE}")
        return
    
    print("📋 Preview of parent name CSV data:")
    print("=" * 80)
    
    with open(CSV_FILE, 'r', encoding='utf-8-sig') as file:
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
    if not os.path.exists(CSV_FILE):
        return 0
    
    with open(CSV_FILE, 'r', encoding='utf-8-sig') as file:
        csv_reader = csv.DictReader(file)
        return sum(1 for row in csv_reader)

def verify_database():
    """Verify database connection and show current parent name status."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Count total students
        cursor.execute("SELECT COUNT(*) FROM Student")
        total_students = cursor.fetchone()[0]
        
        # Count students with parent names
        cursor.execute("SELECT COUNT(*) FROM Student WHERE parent_name != ''")
        with_parent = cursor.fetchone()[0]
        
        # Count students without parent names
        without_parent = total_students - with_parent
        
        print(f"📊 Database Status:")
        print(f"  Total students: {total_students}")
        print(f"  With parent names: {with_parent}")
        print(f"  Without parent names: {without_parent}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def main():
    """Main function."""
    print("Daniel School - Parent Name Update")
    print("=" * 50)
    
    # Check if CSV file exists
    if not os.path.exists(CSV_FILE):
        print(f"❌ CSV file not found: {CSV_FILE}")
        print("Please place the parent_name.csv file in the current directory.")
        return 1
    
    # Verify database connection
    if not verify_database():
        return 1
    
    # Count records
    total_records = count_parent_csv_records()
    print(f"\n📊 Found {total_records} parent name records in CSV file")
    
    # Preview data
    response = input("\nPreview parent name CSV data? (y/N): ")
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
        print("2. Check for any students that weren't found")
        print("3. Manually update any remaining missing parent names")
        return 0
    else:
        print("\n❌ Parent name update failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())