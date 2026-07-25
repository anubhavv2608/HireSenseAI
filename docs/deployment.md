# Deployment Guide

## Docker Compose (recommended)

The repository ships with a `docker-compose.yml` at the root that builds and runs both services.
MongoDB is **not** containerized — point `MONGO_URI` at an external/managed instance (e.g. MongoDB
Atlas); this keeps the compose file simple and matches how the app is actually run in development.

1. Copy the root env template and fill in real values:

   ```bash
   cp .env.example .env
   ```

   At minimum you need a real `MONGO_URI`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, and
   `GEMINI_API_KEY`. See [Environment Variables](environment-variables.md) for the full list and
   what each one unlocks.

2. Build and start both services:

   ```bash
   docker compose up --build
   ```

   - Backend: `http://localhost:5001` (health check at `/health`, docs at `/api/v1/docs`)
   - Frontend: `http://localhost:5173`

3. To run in the background: `docker compose up --build -d`. To stop: `docker compose down`.

### Frontend build-time variables

`VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID` are **compiled into the static bundle** by Vite —
they can't be changed at container-start time the way the backend's environment variables can.
`docker-compose.yml` passes them as Docker build args:

```yaml
frontend:
  build:
    args:
      VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:5001/api/v1}
      VITE_GOOGLE_CLIENT_ID: ${VITE_GOOGLE_CLIENT_ID}
```

If you change either value, you must rebuild the frontend image
(`docker compose build frontend`) — restarting the container alone will not pick up the change.

### What each Dockerfile does

- **`backend/Dockerfile`** — multi-stage: a `node:20-alpine` build stage runs `npm ci` + `tsc`
  (compiling `src/` to `dist/`), then a separate slim runtime stage installs only production
  dependencies and copies in the compiled `dist/` output. The final image never contains
  TypeScript source, dev dependencies, or the compiler.
- **`frontend/Dockerfile`** — multi-stage: a `node:20-alpine` build stage runs `vite build`
  (producing static assets in `dist/`), then an `nginx:1.27-alpine` runtime stage serves those
  assets. `frontend/nginx.conf` adds a SPA fallback (`try_files ... /index.html`) so client-side
  routes like `/dashboard` resolve correctly on a hard refresh, plus gzip and long-lived caching
  for static assets.

Both Dockerfiles have a matching `.dockerignore` so `node_modules`, `.env` files, and build
artifacts never get copied into the build context.

## Running without Docker

See the [Quick Start](../README.md#quick-start-local-development) in the root README — `npm run
dev` in each package, pointed at the same environment variables described above (via `.env`
files instead of container env/build-args).

## Health checks

- `GET /health` — full snapshot (uptime, DB connectivity, version, environment).
- `GET /health/ready` — readiness probe; returns `503` if MongoDB is disconnected. Suitable for a
  load balancer or orchestrator's readiness check.
- `GET /health/live` — liveness probe; always `200` if the process is running.

`docker-compose.yml`'s backend service already wires `/health` into a container healthcheck.

## Production checklist

- `JWT_SECRET` / `REFRESH_TOKEN_SECRET` are real, distinct, random values — the app will refuse to
  start in `NODE_ENV=production` if either is left at its placeholder default.
- `CORS_ORIGIN` matches the real frontend origin exactly (it's also used to build links in emails).
- `EMAIL_PROVIDER` and its corresponding credentials are set, or password-reset/friend-request/
  challenge/Daily-DSA emails will silently fail to send (logged, not thrown).
- `GEMINI_API_KEY` is set, or every AI-driven feature (resume parsing/analysis, JD comparison,
  interview generation) will fail.
