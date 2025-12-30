#!/usr/bin/env python3
"""
Script to populate the Enrollment table based on enrollment.csv data.
This script matches students by email and classes by name and period,
then creates enrollment records.
"""

import csv
import sys
import os
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

import csv
import sys
import os
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, TEXT

# Create Base for SQLAlchemy models
Base = declarative_base()

# Define models directly in this script to avoid import issues
class Teacher(Base):
    __tablename__ = "Teacher"
    __table_args__ = {"sqlite_autoincrement": True}
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    subject = Column(String)
    email = Column(String)
    phone = Column(String)

class Student(Base):
    __tablename__ = "Student"
    __table_args__ = {"sqlite_autoincrement": True}
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    birth_date = Column(DateTime)
    email = Column(String)
    phone = Column(String)
    parent_name = Column(String)
    address = Column(String)
    gender = Column(String)
    religion = Column(String)
    church = Column(String)
    korean_level = Column(Integer)
    korean_level_confirmed = Column(Integer, default=0)
    grade = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Class(Base):
    __tablename__ = "Class"
    __table_args__ = {"sqlite_autoincrement": True}
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True)
    description = Column(String)
    year = Column(Integer)
    term = Column(String)
    teacher_id = Column(Integer)
    min_grade = Column(Integer)
    max_grade = Column(Integer)
    max_students = Column(Integer)
    period = Column(Integer)
    fee = Column(Float)
    mendatory = Column(Integer)
    enrolled_number = Column(Integer, default=0)
    min_korean_level = Column(Integer, default=1)
    max_korean_level = Column(Integer, default=12)
    display_order = Column(Integer, default=0)

class Enrollment(Base):
    __tablename__ = "Enrollment"
    __table_args__ = {"sqlite_autoincrement": True}
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer)
    class_id = Column(Integer)
    comment = Column(String)
    status = Column(String)
    year = Column(Integer)
    term = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Database configuration
db_path = "/home/data/master_db/database.sqlite"
DATABASE_URL = f"sqlite:///{db_path}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_or_create_student(session, name, email, phone, grade, korean_level):
    """
    Get existing student by email or create a new one if not found.
    """
    # First try to find by email
    student = session.query(Student).filter(Student.email == email).first()
    
    if student:
        print(f"Found existing student: {student.name} ({email})")
        return student
    
    # If not found, create a new student
    print(f"Creating new student: {name} ({email})")
    
    # Convert grade string (e.g., "G1", "JK", "SK") to integer
    grade_int = 0
    if grade.startswith('G'):
        try:
            grade_int = int(grade[1:])
        except ValueError:
            grade_int = 0
    elif grade == 'JK':
        grade_int = -1  # Junior Kindergarten
    elif grade == 'SK':
        grade_int = -2   # Senior Kindergarten
    elif grade == '성인':
        grade_int = 13  # Adult class
    
    student = Student(
        name=name,
        email=email,
        phone=phone,
        grade=grade_int,
        korean_level=int(korean_level) if korean_level.isdigit() else 1,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    session.add(student)
    session.flush()  # To get the ID
    return student

def find_class_by_name_and_period(session, class_name, period):
    """
    Find a class by name and period number.
    """
    if not class_name or class_name.strip() == '':
        return None
    
    class_obj = session.query(Class).filter(
        Class.name == class_name.strip(),
        Class.period == period
    ).first()
    
    if not class_obj:
        print(f"Warning: Class '{class_name}' for period {period} not found in database")
    
    return class_obj

def create_enrollment(session, student_id, class_id, year=2025, term='spring'):
    """
    Create an enrollment record if it doesn't already exist.
    """
    # Check if enrollment already exists
    existing = session.query(Enrollment).filter(
        Enrollment.student_id == student_id,
        Enrollment.class_id == class_id,
        Enrollment.year == year,
        Enrollment.term == term
    ).first()
    
    if existing:
        print(f"Enrollment already exists for student_id {student_id}, class_id {class_id}")
        return existing
    
    enrollment = Enrollment(
        student_id=student_id,
        class_id=class_id,
        status='enrolled',
        year=year,
        term=term,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    session.add(enrollment)
    return enrollment

def main():
    """
    Main function to process the enrollment.csv file and populate the database.
    """
    csv_file = 'enrollment.csv'
    
    if not os.path.exists(csv_file):
        print(f"Error: {csv_file} not found in current directory")
        sys.exit(1)
    
    session = SessionLocal()
    
    try:
        enrollments_created = 0
        students_processed = 0
        
        with open(csv_file, 'r', encoding='utf-8-sig') as file:
            reader = csv.DictReader(file)
            
            # Debug: print the field names
            print(f"CSV field names: {reader.fieldnames}")
            
            for row in reader:
                students_processed += 1
                
                # Handle potential missing 'name' field
                name = row.get('name', '').strip()
                if not name:
                    print(f"Warning: Row {students_processed} has no name, skipping...")
                    continue
                    
                email = row.get('email', '').strip()
                phone = row.get('phone', '').strip()
                grade = row.get('grade', '').strip()
                korean_level = row.get('korean_level', '1').strip()
                
                print(f"\nProcessing student {students_processed}: {name} ({email})")
                
                # Get or create student
                student = get_or_create_student(session, name, email, phone, grade, korean_level)
                
                # Process each period
                for period_num in [1, 2, 3]:
                    period_key = f'period_{period_num}'
                    class_name = row.get(period_key, '').strip()
                    
                    if class_name:
                        print(f"  Period {period_num}: {class_name}")
                        
                        # Find the class
                        class_obj = find_class_by_name_and_period(session, class_name, period_num)
                        
                        if class_obj:
                            # Create enrollment
                            enrollment = create_enrollment(session, student.id, class_obj.id)
                            if enrollment:
                                enrollments_created += 1
                                print(f"    ✓ Enrolled in {class_name}")
                        else:
                            print(f"    ✗ Could not find class '{class_name}' for period {period_num}")
                    else:
                        print(f"  Period {period_num}: No class assigned")
        
        # Commit all changes
        session.commit()
        
        print(f"\n" + "="*50)
        print(f"Processing complete!")
        print(f"Students processed: {students_processed}")
        print(f"Enrollments created: {enrollments_created}")
        print(f"="*50)
        
    except Exception as e:
        print(f"Error processing enrollment data: {e}")
        session.rollback()
        raise
    
    finally:
        session.close()

if __name__ == "__main__":
    main()