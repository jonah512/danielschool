#!/bin/bash

# Function to wait for MySQL to be ready
wait_for_mysql() {
    echo "Waiting for MySQL to be ready..."
    for i in {1..30}; do
        if mysql -h${MYSQL_HOST:-daniel-mysql} -P${MYSQL_PORT:-3306} -u${MYSQL_USER:-daniel_user} -p${MYSQL_PASSWORD:-daniel_password_2025} --skip-ssl -e "SELECT 1;" >/dev/null 2>&1; then
            echo "MySQL is ready!"
            return 0
        fi
        echo "MySQL is not ready yet, waiting 5 seconds... (attempt $i/30)"
        sleep 5
    done
    echo "Error: MySQL did not become ready after 150 seconds"
    return 1
}

# Wait for MySQL if DATABASE_URL is set (production mode)
if [ -n "$DATABASE_URL" ]; then
    if ! wait_for_mysql; then
        echo "Starting without MySQL connection (will attempt to reconnect later)"
    fi
fi

# Initialize images in docker volume if not already present
echo "Initializing images in docker volume..."
mkdir -p /home/data/images
if [ ! -f "/home/data/images/daniel_logo.png" ] && [ -d "/workspace/default_images" ]; then
    echo "Copying default images to docker volume..."
    cp -r /workspace/default_images/* /home/data/images/
    echo "Default images copied successfully"
else
    echo "Images already exist in docker volume or default images not found"
fi

# Start Apache in the background
apache2ctl -D FOREGROUND &

# Start Uvicorn
uvicorn workspace.main:app --host 0.0.0.0 --port 8080
