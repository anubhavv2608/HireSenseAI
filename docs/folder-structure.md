# Folder Structure

## Backend (`backend/src/`)

```
modules/
  admin/                       Admin dashboard, user/resume moderation, Daily DSA assignment authoring
  auth/                        Registration, login, tokens, password reset, username management
  profile/                     Student profile CRUD, public profiles, Student Search
  resume/                      Resume upload, versioning, active-version selection, history
  resume-parser/                AI extraction of structured data (contact/education/experience/skills) from a resume
  resume-processing/           Orchestrates the parse -> analyze pipeline end-to-end
  resume-analysis/             AI scoring/feedback (category + detailed dimension scores)
  job-description-analysis/    AI comparison of a resume against a job description
  interview-generator/         AI-generated interview questions grounded in the resume
  job-input/                   Job description text extraction from an uploaded file
  dashboard/                   Aggregated per-user dashboard summary
  daily-dsa/                   Daily coding-practice assignments, completion, streaks
  statistics/                  Platform-wide usage statistics
  leaderboard/                 Daily DSA leaderboards (overall/daily/weekly/monthly)
  notifications/               In-app notifications
  friends/                     Friend requests and connections
  challenges/                  Peer-to-peer coding challenges
  health/                      Liveness/readiness health checks

shared/
  ai/                          ILLMProvider interface, GeminiProvider, AIService, prompts, error mapping
  config/                      Zod-validated environment schema, Winston logger
  constants/                   Cross-module constants (API_PREFIX, pagination defaults, roles)
  email/                       IEmailProvider interface, Resend/SMTP providers, EmailService, templates
  errors/                      Typed AppError hierarchy (BadRequestError, NotFoundError, etc.)
  middleware/                  authenticate, authorize, validate, errorHandler, rate limiters
  pdf/                         PDF text-extraction abstraction
  storage/                     IStorageProvider interface, CloudinaryStorageProvider, StorageService, file validation
  swagger/                     OpenAPI spec builder (swagger-jsdoc config + component schemas)
  types/                       Shared cross-module TypeScript types
  utils/                       ApiResponse envelope, pagination helpers, asyncHandler, escapeRegex, dedupeStrings
  validators/                  Shared Zod primitives reused across modules

scripts/                       One-off/maintenance scripts (seedAdmin, backfillUsernames, migrateProfileUrlFields)
app.ts                         Express app wiring (middleware, routes, error handler, Swagger UI mount)
server.ts                      Process entrypoint (connects DB, starts HTTP server, graceful shutdown)
```

Each feature module under `modules/` follows the same internal file layout — see
[Architecture](architecture.md#backend-layering) for what each file is responsible for.

## Frontend (`frontend/src/`)

```
features/
  auth/                        Login/register/forgot-password forms, auth hooks, token types
  profile/                     Profile view/edit, Student Search, public profile page
  resume/                      Resume upload, history, active-version card
  resume-analysis/             Resume analysis results UI (category + detailed scores)
  job-analysis/                Job description analysis results UI (gap analysis, learning roadmap)
  interview/                   Interview question generation UI
  daily-dsa/                   Daily DSA today/history/streak UI
  dashboard/                   Dashboard widgets (profile summary, community, resume status, quick actions)
  friends/                     Friends list, requests, friend-status/actions
  challenges/                  Challenge list, challenge card, challenge actions
  leaderboard/                 Leaderboard table and dashboard preview widget
  notifications/               Notification bell, notification list/item, infinite scroll
  admin/                       Admin dashboard, user/resume/assignment management tables
  job-input/                   Job description file upload/extraction

Each feature/<name>/ directory follows: api/ (HTTP calls), hooks/ (TanStack Query hooks),
components/ (feature-specific UI), types/ (TypeScript types) — mirroring the backend's per-module
boundary on the client side.

components/
  common/                      Shared, feature-agnostic building blocks: PageContainer, PageHeader,
                                Section, ContentCard, EmptyState, ErrorState, LoadingSkeleton,
                                Pagination, SearchInput, UserAvatar, StatusBadge, Modal,
                                ConfirmationDialog, Toast, analysis/ (AnalysisHeader, ScoreCard, etc.)
  layout/                      AppLayout, Sidebar, Navbar — the authenticated app shell
  ui/                          shadcn/ui primitives (button, card, dialog, input, tabs, etc.)

pages/                         Route-level page components (thin — compose features/* components)
routes/                        AppRoutes, route guards (ProtectedRoute/RoleProtectedRoute/PublicRoute), route paths
hooks/                         App-wide hooks (useAuth, useDebounce, useMediaQuery, useInfiniteScroll)
lib/                           env (typed import.meta.env access), queryClient, cn/utils
providers/                     App-wide context providers (QueryProvider, etc.)
store/                         Client-side auth context (not server state — that's TanStack Query's job)
services/                      tokenStorage (access/refresh token persistence)
api/                           axiosClient, apiError helpers
app/                           App.tsx root component
```
