#!/bin/bash
# Database Backup Script Wrapper
# Copyright (c) 2025 Milal Daniel Korean School.

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Database Backup Wrapper ==="
echo "Script directory: $SCRIPT_DIR"

# Check if Python script exists
PYTHON_SCRIPT="$SCRIPT_DIR/backup_database.py"
if [ ! -f "$PYTHON_SCRIPT" ]; then
    echo "Error: Python backup script not found at $PYTHON_SCRIPT"
    exit 1
fi

# Ensure pandas is installed
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

# Check if specific tables are requested
if [ $# -gt 0 ]; then
    echo "Running selective backup for tables: $@"
    "$PYTHON_CMD" "$PYTHON_SCRIPT" "$@"
else
    echo "Running full database backup..."
    "$PYTHON_CMD" "$PYTHON_SCRIPT"
fi

echo ""
echo "Backup files location: $SCRIPT_DIR/backups/"
echo "Script completed."