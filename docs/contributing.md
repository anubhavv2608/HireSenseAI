# Contribution Guide

## Setup

See the [Quick Start](../README.md#quick-start-local-development) in the root README to get both
packages running locally.

## Coding conventions

These are the conventions this codebase already follows — match them rather than introducing a
new pattern:

- **Layering (backend)**: routes → controllers → services → repositories. Controllers stay thin
  (parse request, call one service method, shape the response) — no business logic in a
  controller. Repositories only do data access — no conditional business rules. See
  [Architecture](architecture.md#backend-layering).
- **Validation**: every request body/params/query is validated by a Zod schema in the module's
  `<feature>.validation.ts`, applied via the shared `validate` middleware. Add new fields
  additively — never remove or rename an existing field on a schema another client already
  depends on without a clear migration story.
- **Errors**: throw one of the typed errors from `shared/errors/ApiError.ts`
  (`BadRequestError`, `NotFoundError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`,
  `TooManyRequestsError`, etc.) — never a bare `Error` or a raw `res.status().json()` from inside
  a service. The global `errorHandler` converts these into the standard `ApiResponse.error()`
  envelope automatically.
- **Provider abstractions**: if you're integrating a new AI/storage/email vendor, add a concrete
  provider implementing the existing interface (`ILLMProvider`/`IStorageProvider`/
  `IEmailProvider`) rather than calling the vendor SDK directly from business logic. See
  [Architecture](architecture.md#provider-abstraction-pattern).
- **Frontend data fetching**: all server state goes through TanStack Query hooks in each
  feature's `hooks/` folder — never `fetch`/`axios` directly from a component. Give slow-changing,
  high-traffic queries an explicit `staleTime` (5 minutes is the existing convention — see
  `useLeaderboard`, `useFriends`, `useLatestResumeAnalysis`) rather than leaving the default.
  Watch for query-key collisions between a paginated (`useQuery`) and infinite (`useInfiniteQuery`)
  hook reading overlapping data — they must use distinct cache keys even if the underlying
  endpoint is the same, since React Query caches by key, not by hook.
- **Shared UI**: reach for `components/common/` (`PageContainer`, `PageHeader`, `Section`,
  `ContentCard`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, etc.) before writing a new
  page-level layout primitive from scratch.
- **No unnecessary abstraction**: this codebase deliberately favors a few repeated lines over a
  premature shared helper. Don't introduce a new abstraction layer for a pattern that's only used
  once or twice.

## Before opening a PR

Run both packages' typecheck and lint — there is no automated test suite, so these (plus manual
verification of the actual behavior you changed) are the only automated signal available:

```bash
# Backend
cd backend && npx tsc --noEmit && npx eslint src

# Frontend
cd frontend && npx tsc -b && npx oxlint src
```

If you touched an API route, update its `@openapi` JSDoc block in the same `.routes.ts` file (see
[API Documentation](api-documentation.md)) so the Swagger docs stay in sync with the code.

## Verifying behavior changes

Since there's no test suite, verify real behavior before calling a change done:

- For a backend change touching the database, write a small throwaway script (via `npx tsx`) that
  exercises the real code path against a real (or disposable) database record, then delete the
  script — don't leave one-off verification scripts in the repo.
- For a frontend change, actually click through the feature in a browser. Type-checking proves the
  code compiles, not that the feature works.
- Never verify against your own live/running dev session if you can help it — prefer spinning up
  a second instance on different ports (backend and frontend) so you're not at risk of disrupting
  work in progress in the primary session.
- Clean up any test accounts/records/containers/temporary tool installs you created purely for
  verification once you're done with them.

## Commit scope

Keep changes additive and backward-compatible unless a breaking change is explicitly the point of
the task — existing clients (mobile apps, other consumers of the API, cached frontend bundles that
haven't picked up a deploy yet) may still be relying on the old shape.
