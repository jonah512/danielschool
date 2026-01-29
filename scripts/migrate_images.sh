#!/bin/bash

# Migration script to move images from webapp/public to docker volume
# This script should be run inside the docker container

WEBAPP_PUBLIC="/workspace/../webapp/public"
DOCKER_VOLUME="/home/data/images"
DEFAULT_IMAGES="/workspace/default_images"

echo "=== Daniel School Image Migration Script ==="
echo "Moving images from webapp/public to docker volume..."

# Create docker volume directory if it doesn't exist
mkdir -p "$DOCKER_VOLUME"

# List of image files to migrate
IMAGE_FILES=(
    "register01.jpg"
    "register02.jpg" 
    "register03.jpg"
    "register04.jpg"
    "register05.jpg"
    "daniel_logo.png"
    "intro.png"
)

# Check if any images exist in webapp/public and copy them
FOUND_IMAGES=false
for file in "${IMAGE_FILES[@]}"; do
    if [ -f "$WEBAPP_PUBLIC/$file" ]; then
        echo "Migrating $file from webapp/public to docker volume..."
        cp "$WEBAPP_PUBLIC/$file" "$DOCKER_VOLUME/$file"
        FOUND_IMAGES=true
    fi
done

# If no images found in webapp/public, use default images
if [ "$FOUND_IMAGES" = false ]; then
    echo "No images found in webapp/public, copying default images..."
    if [ -d "$DEFAULT_IMAGES" ]; then
        cp -r "$DEFAULT_IMAGES"/* "$DOCKER_VOLUME/"
        echo "Default images copied successfully"
    else
        echo "Warning: No default images found at $DEFAULT_IMAGES"
    fi
else
    echo "Migration completed successfully"
fi

# List final contents
echo "=== Final docker volume contents ==="
ls -la "$DOCKER_VOLUME"

echo "=== Migration Complete ==="