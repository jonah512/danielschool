#!/bin/bash
"""
SQLite to MySQL Migration Wrapper Script
Usage: ./run_migration.sh [sqlite_file]
"""

# Set default SQLite file
SQLITE_FILE="${1:-database.sqlite.20251229}"

echo "=========================================="
echo "SQLite to MySQL Data Migration"
echo "=========================================="
echo "SQLite file: $SQLITE_FILE"
echo "MySQL host: localhost:3306"
echo "Target database: daniel_school"
echo "=========================================="

# Check if SQLite file exists
if [ ! -f "$SQLITE_FILE" ]; then
    echo "Error: SQLite file '$SQLITE_FILE' not found!"
    echo "Please ensure the file exists in the current directory."
    exit 1
fi

# Check if MySQL is running
if ! nc -z localhost 3306 2>/dev/null; then
    echo "Error: MySQL is not running on localhost:3306"
    echo "Please ensure MySQL container is running:"
    echo "  sudo docker ps | grep mysql"
    exit 1
fi

echo "Starting migration..."
echo ""

# Update the SQLite path in the migration script
sed -i "s/SQLITE_DB_PATH = .*/SQLITE_DB_PATH = '$SQLITE_FILE'/" migrate_sqlite_advanced.py

# Run the migration
python3 migrate_sqlite_advanced.py

echo ""
echo "Migration completed!"
echo "Check the migration report for details."