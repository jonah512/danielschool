#!/bin/bash
# Database Restore Script Wrapper
# Copyright (c) 2025 Milal Daniel Korean School.

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Database Restore Wrapper ==="
echo "Script directory: $SCRIPT_DIR"

# Check if Python script exists
PYTHON_SCRIPT="$SCRIPT_DIR/restore_database.py"
if [ ! -f "$PYTHON_SCRIPT" ]; then
    echo "Error: Python restore script not found at $PYTHON_SCRIPT"
    exit 1
fi

# Ensure dependencies are available (reuse logic from backup script)
echo "Checking dependencies..."
if ! python3 -c "import pandas, sqlalchemy, pymysql" 2>/dev/null; then
    echo "Installing required Python packages..."
    
    # Try system packages first (Ubuntu/Debian)
    if command -v apt-get >/dev/null 2>&1; then
        echo "Trying to install via apt..."
        sudo apt-get update -qq
        sudo apt-get install -y python3-pandas python3-sqlalchemy python3-pymysql 2>/dev/null
    fi
    
    # Check if packages are now available
    if ! python3 -c "import pandas, sqlalchemy, pymysql" 2>/dev/null; then
        echo "System packages not available, creating virtual environment..."
        
        # Ensure python3-venv is installed
        if command -v apt-get >/dev/null 2>&1; then
            sudo apt-get install -y python3-venv python3-full 2>/dev/null
        fi
        
        # Create virtual environment in the script directory
        VENV_DIR="$SCRIPT_DIR/.backup_venv"
        if [ ! -d "$VENV_DIR" ]; then
            python3 -m venv "$VENV_DIR"
        fi
        
        # Install packages in virtual environment
        "$VENV_DIR/bin/pip" install pandas sqlalchemy pymysql
        
        # Use virtual environment python for the rest of the script
        PYTHON_CMD="$VENV_DIR/bin/python"
    else
        PYTHON_CMD="python3"
    fi
else
    echo "✓ All dependencies already available"
    PYTHON_CMD="python3"
fi

# Make the Python script executable
chmod +x "$PYTHON_SCRIPT"

# Show usage if help is requested
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo ""
    echo "Usage: $0 [BACKUP_DIR] [TABLE_NAMES...]"
    echo ""
    echo "Examples:"
    echo "  $0                           # Restore all tables from ./backups/"
    echo "  $0 Teacher Student           # Restore only Teacher and Student tables"
    echo "  $0 /path/to/backups/         # Restore from specific backup directory"
    echo "  $0 /path/to/backups/ Teacher # Restore Teacher table from specific directory"
    echo ""
    echo "Environment variables:"
    echo "  DATABASE_URL                 # MySQL connection string (required for MySQL)"
    echo ""
    echo "WARNING: This will DELETE all existing data in the specified tables!"
    echo "Make sure you have a backup before running this script."
    exit 0
fi

# Confirmation prompt for safety
echo ""
echo "⚠️  WARNING: This will DELETE all existing data in the target tables!"
echo "   Make sure you have a current backup before proceeding."
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [[ "$confirm" != "yes" && "$confirm" != "y" ]]; then
    echo "Restore cancelled."
    exit 0
fi

# Run the restore script
echo ""
if [ $# -gt 0 ]; then
    echo "Running restore with parameters: $@"
    "$PYTHON_CMD" "$PYTHON_SCRIPT" "$@"
else
    echo "Running full database restore..."
    "$PYTHON_CMD" "$PYTHON_SCRIPT"
fi

echo ""
echo "Restore script completed."