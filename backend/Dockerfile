FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Cloud Run sets the PORT env variable (default 8080)
# Listen on $PORT to satisfy Cloud Run requirements
CMD uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 2
