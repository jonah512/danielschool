#!/usr/bin/env python3
"""
Student Data Import Script for Daniel School
Copyright (c) 2025 Milal Daniel Korean School.

This script imports student data from CSV file into the Student table.
"""

import os
import sys
import csv
import sqlite3
from datetime import datetime
import re

# Student CSV file path
CSV_FILE = "students.csv"
DB_PATH = "/home/data/master_db/database.sqlite"

def parse_grade(grade_str):
    """Parse grade string to integer."""
    if not grade_str or grade_str.strip() == "":
        return 0
    
    # Extract number from grade string like "Grade 3", "Junior Kindergarten", etc.
    if "Junior Kindergarten" in grade_str or "JK" in grade_str:
        return -1  # Use -1 for JK
    elif "Senior Kindergarten" in grade_str or "SK" in grade_str:
        return 0   # Use 0 for SK
    else:
        # Extract number from "Grade X" format
        match = re.search(r'\d+', grade_str)
        return int(match.group()) if match else 0

def parse_birth_date(date_str):
    """Parse birth date string to datetime object."""
    if not date_str or date_str.strip() == "" or "1/1/2000" in date_str or "8/17/2025" in date_str:
        return None
    
    try:
        # Handle various date formats
        date_str = date_str.strip()
        
        # Try MM/DD/YYYY format first
        if "/" in date_str:
            parts = date_str.split("/")
            if len(parts) == 3:
                month, day, year = parts
                return datetime(int(year), int(month), int(day))
        
        # Try other formats if needed
        return None
    except:
        return None

def clean_phone(phone_str):
    """Clean phone number string."""
    if not phone_str:
        return ""
    
    # Remove non-digit characters except spaces and dashes
    phone = re.sub(r'[^\d\s\-\.\+\(\)\/]', '', phone_str.strip())
    return phone

def extract_parent_email(email_str):
    """Extract parent email from email field."""
    if not email_str:
        return ""
    
    # The email field seems to contain parent email
    return email_str.strip()

def insert_students_sqlite():
    """Insert student data into SQLite database."""
    if not os.path.exists(CSV_FILE):
        print(f"❌ CSV file not found: {CSV_FILE}")
        print("Please ensure the students.csv file is in the current directory.")
        return False
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Create table if not exists
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Student (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                birth_date DATETIME,
                email TEXT,
                phone TEXT,
                parent_name TEXT,
                address TEXT,
                gender TEXT,
                religion TEXT,
                church TEXT,
                korean_level INTEGER,
                korean_level_confirmed INTEGER DEFAULT 0,
                grade INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Check existing students to avoid duplicates
        cursor.execute("SELECT name, email FROM Student")
        existing_students = {(row[0], row[1]) for row in cursor.fetchall()}
        
        inserted = 0
        skipped = 0
        errors = 0
        
        with open(CSV_FILE, 'r', encoding='utf-8-sig') as file:  # Use utf-8-sig to handle BOM
            csv_reader = csv.DictReader(file)
            
            # Validate headers
            expected_headers = ['name', 'grade', 'korean_level', 'birth_date', 'email', 'phone', 'religion', 'church']
            actual_headers = csv_reader.fieldnames
            print(f"📋 CSV Headers found: {actual_headers}")
            
            missing_headers = [h for h in expected_headers if h not in actual_headers]
            if missing_headers:
                print(f"⚠️  Missing headers: {missing_headers}")
            
            for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 for header row
                try:
                    # Extract and clean data with safety checks
                    name = row.get('name', '').strip()
                    if not name:
                        print(f"⚠️  Skipped row {row_num}: Empty name")
                        skipped += 1
                        continue
                    
                    grade_str = row.get('grade', '').strip()
                    korean_level_str = row.get('korean_level', '1')
                    korean_level = int(korean_level_str) if korean_level_str else 1
                    birth_date = parse_birth_date(row.get('birth_date', ''))
                    email = extract_parent_email(row.get('email', ''))
                    phone = clean_phone(row.get('phone', ''))
                    religion = row.get('religion', '').strip()
                    church = row.get('church', '').strip()
                    
                    # Parse grade
                    grade = parse_grade(grade_str)
                    
                    # Skip if student already exists (by name and email combination)
                    if (name, email) in existing_students:
                        print(f"⚠️  Skipped row {row_num}: {name} (already exists)")
                        skipped += 1
                        continue
                    
                    # Prepare birth_date for insertion
                    if birth_date:
                        birth_date_str = birth_date.strftime("%Y-%m-%d %H:%M:%S.%f")
                    else:
                        # Set default date for students with missing birth_date to avoid API validation errors
                        default_date = datetime(2010, 1, 1)  # Default to Jan 1, 2010
                        birth_date_str = default_date.strftime("%Y-%m-%d %H:%M:%S.%f")
                        
                    current_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.%f")
                    
                    # Insert student
                    cursor.execute('''
                        INSERT INTO Student (
                            name, birth_date, email, phone, parent_name, address, 
                            gender, religion, church, korean_level, korean_level_confirmed, grade,
                            created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        name, 
                        birth_date_str, 
                        email, 
                        phone, 
                        "",  # parent_name - not in CSV, using empty string
                        "",  # address - not in CSV, using empty string
                        "",  # gender - not in CSV, using empty string  
                        religion, 
                        church, 
                        korean_level, 
                        0,   # korean_level_confirmed - default to 0
                        grade,
                        current_time,  # created_at
                        current_time   # updated_at
                    ))
                    
                    inserted += 1
                    if inserted % 10 == 0:  # Show progress every 10 insertions
                        print(f"✅ Processed {inserted} students...")
                    
                except Exception as e:
                    errors += 1
                    print(f"❌ Error row {row_num} ({name if 'name' in locals() else 'unknown'}): {e}")
                    continue
        
        conn.commit()
        
        # Show final count
        cursor.execute("SELECT COUNT(*) FROM Student")
        total = cursor.fetchone()[0]
        
        print("\n" + "=" * 60)
        print(f"🎉 Student import completed!")
        print(f"✅ Successfully inserted: {inserted} students")
        print(f"⚠️  Skipped (duplicates): {skipped} students") 
        print(f"❌ Errors: {errors} students")
        print(f"📊 Total students in database: {total}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def preview_csv():
    """Preview the first few rows of CSV data."""
    if not os.path.exists(CSV_FILE):
        print(f"❌ CSV file not found: {CSV_FILE}")
        return
    
    print("📋 Preview of CSV data:")
    print("=" * 80)
    
    with open(CSV_FILE, 'r', encoding='utf-8-sig') as file:  # Use utf-8-sig to handle BOM
        csv_reader = csv.DictReader(file)
        
        # Show headers
        print(f"Headers: {', '.join(csv_reader.fieldnames)}")
        print("-" * 80)
        
        # Show first 5 rows
        for i, row in enumerate(csv_reader):
            if i >= 5:
                break
            # Use safe dictionary access
            name = row.get('name', 'N/A')
            grade = row.get('grade', 'N/A')
            korean_level = row.get('korean_level', 'N/A')
            birth_date = row.get('birth_date', 'N/A')
            print(f"Row {i+2}: {name} | {grade} | Korean: {korean_level} | {birth_date}")
        
        print("..." + " (showing first 5 rows)")

def count_csv_records():
    """Count total records in CSV."""
    if not os.path.exists(CSV_FILE):
        return 0
    
    with open(CSV_FILE, 'r', encoding='utf-8-sig') as file:  # Use utf-8-sig to handle BOM
        csv_reader = csv.DictReader(file)
        return sum(1 for row in csv_reader)

def main():
    """Main function."""
    print("Daniel School - Student Data Import")
    print("=" * 50)
    
    # Check if CSV file exists
    if not os.path.exists(CSV_FILE):
        print(f"❌ CSV file not found: {CSV_FILE}")
        print("Please place the students.csv file in the current directory.")
        return 1
    
    # Count records
    total_records = count_csv_records()
    print(f"📊 Found {total_records} student records in CSV file")
    
    # Preview data
    response = input("Preview CSV data? (y/N): ")
    if response.lower() == 'y':
        preview_csv()
        print()
    
    # Confirm import
    response = input(f"Import {total_records} students into the database? (y/N): ")
    if response.lower() != 'y':
        print("Import cancelled.")
        return 0
    
    # Import students
    success = insert_students_sqlite()
    
    if success:
        print("\n✨ Student data import completed successfully!")
        print("\nNext steps:")
        print("1. Verify the imported data in your application")
        print("2. Update any missing information (parent_name, address, gender)")
        print("3. Confirm Korean levels for students as needed")
        return 0
    else:
        print("\n❌ Student data import failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())