FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY scripts ./scripts

# Data + config live on mounted volumes at runtime (see docker-compose.yml).
# Uvicorn is run with the default single worker on purpose: the JsonStore's
# per-file asyncio.Lock only serializes writes within a single process.
EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
