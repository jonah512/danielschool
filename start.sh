#!/bin/bash

# Start Apache in the background
apache2ctl -D FOREGROUND &

# Start Uvicorn
uvicorn workspace.main:app --host 0.0.0.0 --port 8080
