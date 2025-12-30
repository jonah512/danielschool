#!/bin/bash
# MySQL Migration Helper Script
# Copyright (c) 2025 Milal Daniel Korean School.

echo "Daniel School - MySQL Migration Helper"
echo "======================================"

# Build and start services
echo "1. Building Docker containers with MySQL..."
sudo docker-compose -p daniel down
sudo docker-compose -p daniel up --build -d

# Wait for MySQL to be ready
echo "2. Waiting for MySQL to be ready..."
sleep 30

# Check if MySQL is ready
echo "3. Checking MySQL connection..."
sudo docker exec daniel-mysql mysql -u daniel_user -pdaniel_password_2025 -e "SELECT 'MySQL is ready!' as status;"

if [ $? -eq 0 ]; then
    echo "✅ MySQL is ready!"
    
    # Run migration script
    echo "4. Running migration script..."
    sudo docker exec -it daniel-service python3 /workspace/migrate_to_mysql.py
    
    echo "5. Migration completed!"
    echo ""
    echo "Your application is now using MySQL instead of SQLite."
    echo "MySQL data is persisted in the 'mysql_data' Docker volume."
    echo ""
    echo "Connection details:"
    echo "  Host: localhost (or daniel-mysql from within containers)"
    echo "  Port: 3306"
    echo "  Database: daniel_school"
    echo "  User: daniel_user"
    echo "  Password: daniel_password_2025"
    echo ""
    echo "To connect to MySQL directly:"
    echo "  sudo docker exec -it daniel-mysql mysql -u daniel_user -pdaniel_password_2025 daniel_school"
else
    echo "❌ MySQL is not ready. Please check the logs:"
    echo "  sudo docker-compose -p daniel logs daniel-mysql"
fi