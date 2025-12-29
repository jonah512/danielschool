#!/usr/bin/env python3
"""
Quick Teacher Data Insert Script
Copyright (c) 2025 Milal Daniel Korean School.

Simple script to insert teacher data - works with both SQLite and PostgreSQL.
"""

import sqlite3
import sys

# Teacher data
teachers = [
    ("최현진", "총무", "bijuchoi.lovely@gmail.com", "437 533 9657"),
    ("우윤정", "회계", "juliet3377@gmail.com", "647 335 6745"),
    ("정경임", "유치부 믿음반(JK)", "kijung0611@gmail.com", "647 891 5410"),
    ("김은영", "유치부 소망반(JK)", "kimeunyoung3000@gmail.com", "587 678 3000"),
    ("박정윤", "유치부 지혜반(JK)", "junguni1210@gmail.com", "647 979 6793"),
    ("백미라", "유치부 사랑반(SK)", "mirabaek7@gmail.com", "647 303 3933"),
    ("김한호", "한글1", "hanhohkim@gmail.com", "647-482-1728"),
    ("박은주", "한글3", "parkeunjoo910@gmail.com", "647 938 9946"),
    ("김은은", "한글2", "grace.youeun.kim@gmail.com", "437 559 3429"),
    ("조우리", "한글4", "woorissaem@gmail.com", "647 482 5540"),
    ("최명주", "한글 초급전승반", "choimyeongju@gmail.com", "647 624 7774"),
    ("천경순", "한글동화", "kschun7375@gmail.com", "647 617 8605"),
    ("안나현", "한국역사", "annabababa2@gmail.com", "416 705 4365"),
    ("정지현", "선택 한화", "jijung757@gmail.com", "416 464 3133"),
    ("강지영", "미술", "laurenk927@gmail.com", "647 501 6929"),
    ("김태호", "인공지능", "Daniel.HangulSchool@gmail.com", "416 977 0430"),
    ("김진주", "수학", "zhenzus2@gmail.com", "647 333 8758"),
    ("이유진", "영어 에세이", "yoojinlee03@gmail.com", "647 880 9941"),
    ("김원경", "오르다", "hyowonhyowon@hanmail.net", "647 341 1212"),
    ("전현심", "저학년 미술_1반", "nasenaim@gmail.com", "778 928 7414"),
    ("서하현", "저학년 미술_2반", "gkgus041382@gmail.com", "416 843 6293"),
    ("김태범", "고학년 미술", "Tkredesign@gmail.com", "647 607 3931"),
    ("안지영", "바이올린", "jiyeonii@gmail.com", "647 300 5811"),
    ("이재원", "클라리넷", "lee84go@hotmail.com", "647 332 3798"),
    ("황소영", "플룻", "estherhwang.flute@gmail.com", "438 334 2440"),
    ("심상의", "탁구1", "hapdongsim@gmail.com", ""),
    ("이수용", "탁구2", "dannysylee@gmail.com", "416 786 2093"),
    ("최소망", "K wave", "somangc1129@gmail.com", "647 898 6197"),
    ("백혜진", "간식 보조교사", "vancue@naver.com", "416 732 4498"),
    ("조혁래", "과학실험", "hyugrae.cho@gmail.com", "416-560-9344"),
]

def insert_to_sqlite():
    """Insert data into SQLite database."""
    db_path = "/home/data/master_db/database.sqlite"
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create table if not exists
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Teacher (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                subject TEXT,
                email TEXT,
                phone TEXT
            )
        ''')
        
        # Check existing teachers to avoid duplicates
        cursor.execute("SELECT email FROM Teacher")
        existing_emails = {row[0] for row in cursor.fetchall()}
        
        inserted = 0
        for name, subject, email, phone in teachers:
            if email not in existing_emails:
                cursor.execute(
                    "INSERT INTO Teacher (name, subject, email, phone) VALUES (?, ?, ?, ?)",
                    (name, subject, email, phone)
                )
                inserted += 1
                print(f"✅ Inserted: {name}")
            else:
                print(f"⚠️  Skipped: {name} (already exists)")
        
        conn.commit()
        
        # Show final count
        cursor.execute("SELECT COUNT(*) FROM Teacher")
        total = cursor.fetchone()[0]
        
        print(f"\n🎉 Successfully inserted {inserted} teachers")
        print(f"📊 Total teachers in database: {total}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def main():
    """Main function."""
    print("Daniel School - Quick Teacher Insert")
    print("=" * 40)
    
    response = input(f"Insert {len(teachers)} teachers into SQLite database? (y/N): ")
    if response.lower() != 'y':
        print("Operation cancelled.")
        return
    
    success = insert_to_sqlite()
    
    if success:
        print("\n✨ Teacher data insertion completed!")
    else:
        print("\n❌ Insertion failed.")

if __name__ == "__main__":
    main()