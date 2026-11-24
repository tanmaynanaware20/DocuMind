# Dockerfile for DocuMind FastAPI Python Engine
FROM python:3.11-slim

# System dependencies for PyMuPDF, ReportLab, and document utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libmupdf-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency requirements
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Create runtime directories for uploads and PDF reports
RUN mkdir -p /app/backend/uploads /app/backend/reports

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
