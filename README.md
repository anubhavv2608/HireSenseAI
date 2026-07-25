# HireSense AI

HireSense AI is a resume intelligence and career-prep platform for students. It combines an
AI-powered resume/job-matching pipeline with a peer community layer — usernames, friends, peer
coding challenges, leaderboards, and notifications — built on top of a Daily DSA practice habit
tracker.

## Features

- **Resume pipeline** — upload, versioning, AI-powered structured parsing, scoring/feedback
  analysis (category + detailed dimension scores), and job-description comparison with a gap
  analysis and learning roadmap.
- **Interview prep** — AI-generated interview questions grounded in the candidate's actual resume
  and, when available, the job description they're targeting.
- **Daily DSA** — a daily coding-practice habit tracker with streaks, admin-curated assignments,
  and optional email reminders.
- **Community platform** — usernames, public profiles, student search, friend requests,
  peer-to-peer coding challenges, notifications, and leaderboards (overall/daily/weekly/monthly).
- **Admin portal** — user management, resume moderation, Daily DSA assignment authoring and
  publishing (with email fan-out to opted-in students).

## Tech stack

| Layer | Stack |
|---|---|
| Backend | Node.js, Express 5, TypeScript, Mongoose (MongoDB) |
| Frontend | React, Vite, TypeScript, TanStack Query, Tailwind CSS, shadcn/ui |
| AI | Google Gemini via `@google/genai`, with a provider-abstraction layer |
| Storage | Cloudinary (resume/profile-picture files), provider-abstracted |
| Email | Resend or SMTP/Gmail, provider-abstracted, selected via `EMAIL_PROVIDER` |
| Docs | OpenAPI 3 via `swagger-jsdoc` + `swagger-ui-express`, served at `/api/v1/docs` |

## Repository layout

```
HireSenseAI/
├── backend/     Express API (see backend/src/modules for feature modules)
├── frontend/    React SPA (see frontend/src/features for feature modules)
├── docs/        Project documentation (this folder)
└── docker-compose.yml
```

See [docs/folder-structure.md](docs/folder-structure.md) for the full breakdown.

## Quick start (local development)

Prerequisites: Node.js 20+, a MongoDB instance (local or Atlas), and API keys for whichever AI/
email/storage providers you intend to use.

```bash
# Backend
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT secrets, GEMINI_API_KEY, etc.
npm install
npm run dev             # http://localhost:5001

# Frontend (in a separate terminal)
cd frontend
cp .env.example .env.local   # set VITE_API_BASE_URL to the backend above
npm install
npm run dev             # http://localhost:5173
```

Full environment variable reference: [docs/environment-variables.md](docs/environment-variables.md).

## Running with Docker

```bash
cp .env.example .env   # fill in real values — see docs/deployment.md
docker compose up --build
```

See [docs/deployment.md](docs/deployment.md) for details, including how the frontend's
build-time `VITE_*` variables are wired through `docker-compose.yml`.

## API documentation

Once the backend is running, interactive OpenAPI docs are available at:

```
http://localhost:5001/api/v1/docs
```

See [docs/api-documentation.md](docs/api-documentation.md) for API conventions (response
envelope, pagination, authentication).

## Further reading

- [Architecture](docs/architecture.md) — layering, module boundaries, provider-abstraction pattern
- [Folder Structure](docs/folder-structure.md)
- [Environment Variables](docs/environment-variables.md)
- [Deployment Guide](docs/deployment.md)
- [Contribution Guide](docs/contributing.md)
- [AI Documentation](docs/ai-documentation.md) — prompts, scoring model, validation layer
- [API Documentation](docs/api-documentation.md)
