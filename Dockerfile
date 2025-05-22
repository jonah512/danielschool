# Copyright (c) 2025 Milal Daniel Korean School.

# official Python image
FROM python:3.10-slim

COPY requirements.txt .
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host=files.pythonhosted.org -r requirements.txt
RUN mkdir -p /workspace
COPY service /workspace
RUN apt-get update && apt-get install -y zip

# use 9714 port for this service
EXPOSE 8080

# command to start server
CMD ["uvicorn", "workspace.main:app", "--host", "0.0.0.0", "--port", "8080"]
