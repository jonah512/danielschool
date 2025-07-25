# Copyright (c) 2025 Milal Daniel Korean School.

# official Python image
FROM python:3.10-slim

COPY requirements.txt .
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host=files.pythonhosted.org -r requirements.txt
RUN mkdir -p /workspace
COPY service /workspace
COPY webapp/build /var/www/html
RUN apt-get update && apt-get install -y zip
RUN apt-get install -y apache2
RUN apt-get install -y sqlite3

# Add a script to start both uvicorn and apache2
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Set the ServerName to suppress Apache warnings
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# use 9714 port for this service
EXPOSE 8080
EXPOSE 80

# Use the custom script to start both servers
CMD ["/start.sh"]

