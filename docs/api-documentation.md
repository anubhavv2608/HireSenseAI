# API Documentation

## Interactive docs

The full, authoritative API reference is generated from the code (via `swagger-jsdoc`) and served
as an interactive Swagger UI at:

```
{API_BASE_URL}/api/v1/docs
```

e.g. `http://localhost:5001/api/v1/docs` in local development. It covers all 18 route modules and
every registered endpoint — this page intentionally doesn't duplicate that endpoint-by-endpoint
listing; it documents the conventions the generated reference assumes.

To try an authenticated endpoint from the Swagger UI: log in via `POST /auth/login` (or
`/auth/register`) from any HTTP client, then click **Authorize** in the UI and paste the
`accessToken` from the response as a Bearer token.

## Response envelope

Every response — success or error — is a `ApiResponse` envelope:

```json
{
  "success": true,
  "message": "Human-readable summary",
  "data": { "...": "endpoint-specific payload, or null" },
  "errors": null
}
```

On failure, `success` is `false`, `data` is `null`, and `errors` holds either Zod validation
issues (for a 400 from a bad request body/query/params) or, in development only, the error's
stack trace. Never branch on HTTP status code alone without also checking `success` — some
endpoints (e.g. `/health/ready`) intentionally return a non-2xx status with this same envelope
shape rather than throwing.

## Pagination

Any endpoint that returns a list (Student Search, Friends, Challenges, Leaderboard, Notifications,
Admin's user/resume/assignment lists, etc.) uses the same paginated shape inside `data`:

```json
{
  "data": [ /* items */ ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

`page` and `limit` are accepted as query parameters on every such endpoint (`limit` capped at 100
server-side); omitting them falls back to page 1 / a module-specific default limit.

## Authentication

Send the access token returned by `/auth/login`, `/auth/register`, `/auth/google`, or
`/auth/refresh` as `Authorization: Bearer <token>` on every subsequent request to an authenticated
endpoint (all endpoints except `/auth/register`, `/auth/login`, `/auth/refresh`,
`/auth/forgot-password`, `/auth/reset-password`, `/auth/google`,
`/auth/username/available`, and the `/health/*` checks).

The refresh token is set as an httpOnly cookie by the server on login/register/refresh — a
browser-based client doesn't need to manage it manually; `POST /auth/refresh` will read it from
the cookie automatically. Non-browser clients that can't rely on cookies may instead pass
`{ "refreshToken": "..." }` in the request body.

Login, registration, and forgot-password are additionally rate-limited (stricter than the app's
global rate limiter) to slow down credential-guessing and account-enumeration attempts.

## Error status codes

| Status | Meaning |
|---|---|
| 400 | A business-rule precondition wasn't met (e.g. resume isn't active yet, can't friend/challenge yourself) — thrown from controller/service logic, not from request-shape validation |
| 401 | Missing/expired/invalid access token |
| 403 | Authenticated, but the caller's role doesn't permit this action |
| 404 | The requested resource doesn't exist (or doesn't belong to the caller) |
| 409 | The request conflicts with current state (e.g. duplicate friend request, username taken) |
| 422 | The request body/query/params failed Zod schema validation (the `validate` middleware always returns 422 for this, never 400) — `errors` holds a `{ field, message }[]` list |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |
| 503 | Dependency unavailable (e.g. `/health/ready` when MongoDB is disconnected) |

400 and 422 are easy to conflate since both are "the request was bad" — the distinction that
matters for a client: 422 is deterministic and fixable by correcting the request shape (missing
field, wrong type); 400 usually means the request was well-formed but the action isn't currently
allowed given the resource's state.

## Keeping docs in sync

Each route file (`<feature>.routes.ts`) carries its own `@openapi` JSDoc blocks directly above the
route registrations they describe, and reusable schemas/response shapes live in
`backend/src/shared/swagger/swagger.ts`. When you add or change an endpoint, update the JSDoc block
in the same commit — there's no separate spec file to keep in sync by hand.
