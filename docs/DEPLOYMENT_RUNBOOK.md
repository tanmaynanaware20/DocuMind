# DocuMind Production Deployment & Operations Runbook

This runbook guides DevOps, SRE, and platform engineers through deploying, scaling, and maintaining the DocuMind platform in commercial production environments.

---

## 1. System Architecture Overview

```
                      +-----------------------------+
                      |   Cloudflare / Ingress TLS  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |   Vite SPA (React / Nginx)  |
                      +--------------+--------------+
                                     |  REST API / SSE
                                     v
                      +-----------------------------+
                      |    FastAPI Python Engine    |
                      |   (Gunicorn + Uvicorn)      |
                      +-------+--------------+------+
                              |              |
                Task Queue    |              | DB Session
                     v        |              v
           +------------------+-+     +-------------------+
           |    Redis Broker    |     | PostgreSQL + pgvector|
           |  (Cache & Queues)  |     |  (Relational + RAG) |
           +--------------------+     +-------------------+
```

---

## 2. Docker Compose Production Deployment

```yaml
version: '3.8'

services:
  db:
    image: pgvector/pgvector:pg16
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-documind}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-documind}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U documind"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redisdata:/data

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    restart: always
    environment:
      DATABASE_URL: postgresql://documind:${POSTGRES_PASSWORD}@db:5432/documind
      REDIS_URL: redis://redis:6379/0
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      DOCUMIND_CRYPTO_KEY: ${DOCUMIND_CRYPTO_KEY}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    ports:
      - "8000:8000"

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
  redisdata:
```

---

## 3. Kubernetes Health Check & Self-Healing Probes

```yaml
livenessProbe:
  httpGet:
    path: /api/health/live
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 15
  timeoutSeconds: 3
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /api/health/ready
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 2
```

---

## 4. Disaster Recovery & Backup Strategy

1. **Database Snapshot**: Daily automated pg_dump with SHA-256 integrity verification.
2. **Immutable Audit Verification**: Nightly cron executing `python -m backend.app.services.audit_verifier` to assert unbroken hash chains.
3. **Rollback Plan**: Zero-downtime blue/green deployment strategy via Kubernetes deployment replica rollout.
