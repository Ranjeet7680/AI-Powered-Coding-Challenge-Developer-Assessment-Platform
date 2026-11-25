# Multi-stage Production Container for Coding Task Factory (React 19 SPA + FastAPI)
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci || npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
LABEL org.opencontainers.image.source="https://github.com/Ranjeet7680/AI-Powered-Coding-Challenge-Developer-Assessment-Platform"
LABEL org.opencontainers.image.title="Coding Task Factory"
LABEL org.opencontainers.image.description="AI-Powered Coding Challenge & Developer Assessment Platform with 368+ Challenges and Vector PDF Credentials"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    STATIC_FRONTEND_DIR=/app/static_frontend

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./static_frontend

WORKDIR /app/backend
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
