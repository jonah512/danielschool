# Copyright (c) 2025 Milal Daniel Korean School.

# official Python image
FROM python:3.10-slim

# Update package list and install system dependencies first
RUN apt-get update && apt-get install -y \
    zip \
    apache2 \
    default-mysql-client \
    default-libmysqlclient-dev \
    pkg-config \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host=files.pythonhosted.org -r requirements.txt

# Copy application files
RUN mkdir -p /workspace
COPY service /workspace
COPY webapp/build /var/www/html

# Add a script to start both uvicorn and apache2
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Set the ServerName to suppress Apache warnings
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# use 8080 port for uvicorn and 80 for apache
EXPOSE 8080
EXPOSE 80

# Use the custom script to start both servers
CMD ["/start.sh"]

