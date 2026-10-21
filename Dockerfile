# ==============================================================================
# FreelanceCanvas — Multi-Stage Production Dockerfile
# ==============================================================================

# --- Stage 1: Build Frontend Assets ---
FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# --- Stage 2: Production Application Runtime ---
FROM python:3.12-slim AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8010

WORKDIR /app

# Install lightweight system build tools and curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code, configuration templates, and scripts
COPY backend/ ./backend/
COPY scripts/ ./scripts/
COPY README.md .env.example ./

# Copy compiled frontend from Stage 1
COPY --from=frontend-builder /build/dist ./frontend/dist

# Initialize persistence folders
RUN mkdir -p /app/data/artifacts /app/data/uploads /app/data/portfolio /app/data/qdrant_storage

EXPOSE 8010

# Docker healthcheck ping
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8010/api/health || exit 1

CMD ["python", "scripts/run_backend.py"]
