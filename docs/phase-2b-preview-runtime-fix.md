# Phase 2B: Preview runtime boundary fix

## Root cause

The preview error was caused by the development CSS pipeline evaluating the aggregate `tailwindcss` entrypoint and failing inside Tailwind's `@theme default` block. The production build happened to compile successfully, but the ordinary Next.js preview path failed before any page could render. Separately, the frontend processing client had a hard-coded `http://localhost:4100` fallback, so an unconfigured preview could not distinguish an unavailable processing service from a configured one.

## Fix

- Split the global CSS import into Tailwind's explicit theme, preflight, and utilities entries so the Next.js preview compiler does not evaluate the failing aggregate entrypoint.
- Removed the localhost fallback from the browser API client. `NEXT_PUBLIC_API_URL` is now optional and browser-safe.
- Added typed client errors for missing configuration, network failure, HTTP failure, malformed responses, failed jobs, and polling timeout.
- Added an honest unavailable state on `/remove-background`; selecting an image with no configured processing API does not create a fake job or result.
- Kept all PostgreSQL, Redis/BullMQ, S3/MinIO, filesystem, Python, and model code in backend-only modules. No frontend route imports server infrastructure.
- Updated tool copy to describe the real processing boundary rather than a mock or client-side result.

## Validation

The public routes render in frontend-only mode, including `/`, `/remove-background`, `/tools`, `/pricing`, `/developers`, `/login`, `/signup`, `/dashboard`, and `/account`. The mobile 390×525 preview was checked, and an uploaded image produced the explicit message: `Background removal is temporarily unavailable. The processing service is not connected in this environment.`

`npm run lint`, `npm run build`, `npm run test:server`, and `git diff --check` pass. Full-stack runtime and real inference remain unverified because PostgreSQL, Redis, MinIO, Docker, and the worker are not available in this environment.

Status: frontend preview PASS; backend runtime UNVERIFIED; real end-to-end inference UNVERIFIED; decision CONTINUE.
