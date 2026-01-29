#!/bin/bash
# Quick MySQL connection script

echo "MySQL Connection Options:"
echo "1. Connect as daniel_user"
echo "2. Connect as root"
echo "3. Show tables"
echo "4. Check table counts"
echo "5. Exit"

read -p "Choose option (1-5): " choice

case $choice in
    1)
        echo "Connecting as daniel_user..."
        sudo docker exec -it daniel-mysql mysql -u daniel_user -pdaniel_password_2025 daniel_school
        ;;
    2)
        echo "Connecting as root..."
        sudo docker exec -it daniel-mysql mysql -u root -p
        ;;
    3)
        echo "Showing tables..."
        sudo docker exec -it daniel-mysql mysql -u daniel_user -pdaniel_password_2025 daniel_school -e "SHOW TABLES;"
        ;;
    4)
        echo "Checking table row counts..."
        sudo docker exec -it daniel-mysql mysql -u daniel_user -p daniel_school -e "
        SELECT 'Teacher' as table_name, COUNT(*) as row_count FROM Teacher
        UNION ALL SELECT 'Student', COUNT(*) FROM Student
        UNION ALL SELECT 'Class', COUNT(*) FROM Class
        UNION ALL SELECT 'User', COUNT(*) FROM User
        UNION ALL SELECT 'Enrollment', COUNT(*) FROM Enrollment
        UNION ALL SELECT 'Schedule', COUNT(*) FROM Schedule
        UNION ALL SELECT 'Consent', COUNT(*) FROM Consent
        UNION ALL SELECT 'Log', COUNT(*) FROM Log
        UNION ALL SELECT 'Request', COUNT(*) FROM Request;"
        ;;
    5)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid option"
        ;;
esac