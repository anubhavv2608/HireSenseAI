# Architecture

## Overview

HireSense AI is a two-package monorepo: an Express/TypeScript REST API (`backend/`) and a React/
Vite SPA (`frontend/`) that talks to it over HTTP. There is no server-side rendering and no shared
package between the two — the contract between them is the REST API, documented at
`/api/v1/docs` (see [API Documentation](api-documentation.md)).

## Backend layering

Every feature lives in its own module under `backend/src/modules/<feature>/`, with a consistent
internal layering:

```
<feature>.routes.ts       Express Router — wires middleware (auth, validate) to controller methods
<feature>.controller.ts   Thin HTTP adapter — parses req, calls service, shapes the response
<feature>.service.ts      Business logic — orchestrates repositories, external providers, other services
<feature>.repository.ts   Data access only — Mongoose queries, no business rules
<feature>.schema.ts       Mongoose schema/model
<feature>.types.ts        TypeScript types/interfaces for the module
<feature>.validation.ts   Zod request schemas (body/params/query), enforced by the `validate` middleware
<feature>.constants.ts    Module-local constants and user-facing message strings
```

Controllers never talk to Mongoose directly, and repositories never contain conditional business
logic — that boundary is what keeps a controller "thin" and a service testable in isolation from
Express. A handful of AI-driven modules (`resume-parser`, `resume-analysis`,
`job-description-analysis`, `interview-generator`) additionally have a `<feature>.prompt.ts` file
holding the system prompt and the Gemini structured-output response schema for that module — see
[AI Documentation](ai-documentation.md).

Cross-cutting concerns live under `backend/src/shared/`:

- `shared/middleware/` — `authenticate` (JWT verification), `authorize` (role gating), `validate`
  (Zod request validation), `errorHandler`, `requestId`/`requestLogger`, `authRateLimit`.
- `shared/errors/` — a typed `AppError` hierarchy (`BadRequestError`, `UnauthorizedError`,
  `NotFoundError`, `ConflictError`, `TooManyRequestsError`, etc.), all converging on the same
  `ApiResponse.error()` envelope in `errorHandler`.
- `shared/utils/` — `ApiResponse` (success/error envelope), `pagination` (page/limit/skip +
  paginated-response shaping), `asyncHandler`, `escapeRegex`, `dedupeStrings`.
- `shared/config/` — the Zod-validated environment schema (`config/index.ts`) and the Winston
  logger (`config/logger.ts`).
- `shared/swagger/` — the OpenAPI spec builder (`swagger-jsdoc`), consuming `@openapi` JSDoc blocks
  written directly above each route registration.

## Provider-abstraction pattern

Three integrations that could plausibly change vendor are built behind a small interface +
concrete-provider + service-wrapper pattern, rather than being called directly from business logic:

| Concern | Interface | Provider(s) | Service wrapper |
|---|---|---|---|
| AI generation | `ILLMProvider` | `GeminiProvider` (via `LLMProviderFactory`) | `AIService` |
| File storage | `IStorageProvider` | `CloudinaryStorageProvider` | `StorageService` |
| Email | `IEmailProvider` | `ResendEmailProvider`, `SmtpEmailProvider` | `EmailService` |

Business-logic services depend only on the service wrapper (`AIService`, `StorageService`,
`EmailService`), never on a concrete provider or SDK client. Swapping Resend for SMTP, for
instance, is a matter of setting `EMAIL_PROVIDER=smtp` in the environment — `EmailService` picks
the concrete provider at construction time and the calling code is unaware of the change.

Email sends from within a request/response path use `EmailService.sendInBackground()` — a
fire-and-forget wrapper that logs failures but never throws, so a transient email-provider outage
can't break the underlying action (e.g. accepting a friend request still succeeds even if the
notification email fails to send).

## AI request lifecycle

For each AI-driven module (parser, analysis, JD comparison, interview generation), a request goes
through:

1. **Prompt build** — the module's `.prompt.ts` assembles a system prompt (referencing the shared
   `PDF_LINK_CAVEAT` where relevant — see [AI Documentation](ai-documentation.md)) and a
   hand-written Gemini `responseSchema` (JSON-Schema-like, not derived from the module's Zod
   schema, since Gemini's structured-output format differs from JSON-Schema-2020-12).
2. **Generation** — `AIService` calls the configured `ILLMProvider`, with timeout/retry policy
   from `AI_TIMEOUT_MS`/`AI_MAX_RETRIES`, and maps provider errors to typed `AppError`s via
   `mapProviderError`.
3. **Parse** — the raw provider response is `JSON.parse`'d, then validated against the module's
   Zod result schema via `safeParse`. A failed parse becomes a clean `ValidationError`, never a
   partially-valid object reaching the response.
4. **Normalize** — a deterministic post-processing pass (e.g. `reconcileAndNormalize` in
   resume-analysis, `normalizeJdAnalysis` in job-description-analysis) de-duplicates AI-generated
   string lists and cross-checks AI claims against ground truth already known to the code (for
   example, dropping a claimed-missing resume section that the parser actually found present).
5. **Persist** — the repository writes the normalized result, and a "skip re-analysis, reuse the
   existing result" path exists so a second request for the same resume doesn't re-call the AI
   provider.

## Authentication

Access/refresh tokens are signed with `jsonwebtoken`, `HS256` pinned explicitly on `jwt.verify`
calls (never trusting the token's own `alg` header). The access token is sent as a
`Authorization: Bearer` header; the refresh token is set as an httpOnly cookie (with a body
fallback for clients that can't use cookies). `authenticate` middleware decodes the access token
and attaches `req.user`; `authorize(...roles)` gates specific routes by role
(`student`/`admin`/`super_admin`).

## Frontend structure

The frontend mirrors the backend's module boundaries under `src/features/<feature>/`, each with
its own `api/`, `hooks/`, `components/`, and `types/`. Server state is owned entirely by TanStack
Query — there is no separate client-side cache/store for server data, only `src/store/` for local
UI state that doesn't come from the API. Shared, feature-agnostic building blocks live in
`src/components/common/` (page shells, empty/error/loading states, form inputs) and
`src/components/ui/` (shadcn primitives). See [Folder Structure](folder-structure.md) for the full
tree.
