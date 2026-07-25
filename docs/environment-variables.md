# Environment Variables

This reference is generated from the actual Zod schema at
`backend/src/shared/config/index.ts` — if you change that schema, update this table to match.

All variables are read by the **backend**. The frontend has its own, much smaller set (see
[Frontend variables](#frontend-variables) below).

## Backend variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `NODE_ENV` | No | `development` | One of `development`, `production`, `test`. |
| `PORT` | No | `5000` | The `.env.example` template uses `5001`. |
| `MONGO_URI` | No | `mongodb://localhost:27017/hiresense` | Must be a valid Mongo connection string (Atlas SRV URIs work). |
| `JWT_SECRET` | **Yes in production** | `supersecretplaceholder` | Signs access tokens. **The app refuses to boot in production if this is left at the placeholder value.** |
| `JWT_EXPIRES_IN` | No | `15m` | Access token lifetime. |
| `REFRESH_TOKEN_SECRET` | **Yes in production** | `supersecretrefreshplaceholder` | Signs refresh tokens. Same production guard as `JWT_SECRET`. |
| `REFRESH_TOKEN_EXPIRES_IN` | No | `7d` | Refresh token lifetime. |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Must match the frontend's origin exactly — also used to build absolute links in emails (password reset, friend/challenge notifications). |
| `GOOGLE_CLIENT_ID` | No | — | Enables Google OAuth login when set. |
| `CLOUDINARY_CLOUD_NAME` | No | — | Required for resume/profile-picture uploads to work. |
| `CLOUDINARY_API_KEY` | No | — | See above. |
| `CLOUDINARY_API_SECRET` | No | — | See above. |
| `GEMINI_API_KEY` | No | — | Required for every AI-driven module (resume parsing, analysis, JD comparison, interview generation) to work. |
| `AI_PROVIDER` | No | `gemini` | Currently only `gemini` is implemented. |
| `AI_MODEL` | No | `gemini-3.6-flash` | Passed straight through to the provider. |
| `AI_TIMEOUT_MS` | No | `30000` | Per-request AI call timeout. |
| `AI_MAX_RETRIES` | No | `2` | Retry count for retryable AI provider errors (429/503/504). |
| `AI_TEMPERATURE` | No | `0.2` | 0–2. |
| `RESEND_API_KEY` | No | — | Required when `EMAIL_PROVIDER=resend`. |
| `EMAIL_FROM` | No | `HireSenseAI <onboarding@resend.dev>` | From-address used by every outgoing email template. |
| `EMAIL_PROVIDER` | No | `resend` | One of `resend`, `gmail`, `smtp` — `gmail` and `smtp` both route through the SMTP provider. |
| `SMTP_HOST` | No | — | Required when `EMAIL_PROVIDER` is `gmail` or `smtp`. |
| `SMTP_PORT` | No | — | See above. |
| `SMTP_USER` | No | — | See above. |
| `SMTP_PASS` | No | — | See above — for Gmail, this must be an App Password, not the account password. |

## Frontend variables

Read via `frontend/src/lib/env.ts`, and — unlike the backend's variables — **baked into the
static bundle at build time**, not read at runtime. Changing them requires a rebuild.

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | e.g. `http://localhost:5001/api/v1` — the backend's API prefix. |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Must match the backend's `GOOGLE_CLIENT_ID` for Google OAuth to work. |

## Where to set these

- **Local development**: `backend/.env` and `frontend/.env.local` (see each package's
  `.env.example` for a starting point).
- **Docker Compose**: a single root-level `.env` file — see [Deployment](deployment.md) and the
  root `.env.example`.
