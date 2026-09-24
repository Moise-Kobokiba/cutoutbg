# API design

Version: `/v1`. Processing is asynchronous.

## Endpoints

- `POST /v1/remove-background` — authenticated multipart upload or validated object reference; returns `202` with `jobId`, `imageId`, and status URL.
- `GET /v1/jobs/:id` — returns `queued`, `processing`, `succeeded`, or `failed`, plus safe progress/error information.
- `GET /v1/images/:id` — returns metadata and an authorization-checked, short-lived result URL when ready.
- `DELETE /v1/images/:id` — queues deletion after ownership check; idempotent.
- `GET /v1/usage` — returns scoped usage counters for the current account.

## Request constraints
Initial formats: JPEG, PNG, WebP. Enforce byte, pixel, dimension, and timeout limits from configuration. Output defaults to transparent PNG; output format and quality are validated against an allowlist. Do not accept arbitrary callback URLs in v1.

## Authentication
Browser requests use the web session. API requests use a stored, hashed API key sent as `Authorization: Bearer ...`; keys are scoped to an account and can be revoked. Every query is scoped to the authenticated user/account.

## Error envelope

```json
{"error":{"code":"IMAGE_TOO_LARGE","message":"The image exceeds the configured limit.","requestId":"req_..."}}
```

Messages are safe for clients; internal stack traces and storage keys stay server-side. Use `401` for missing credentials, `403` for ownership/scope failures, `413` for size limits, `415` for unsupported media, `429` for rate limits, and `5xx` only for actionable server failures.

## Rate limits
Define separate upload, status, download, and API-key buckets. Return `Retry-After` on `429`. Exact quotas remain an open product decision and must be configuration, not hardcoded UI copy.

## Idempotency and consistency
Accept an idempotency key on job creation. A repeated key returns the original job rather than enqueueing duplicate work. The API persists the job before enqueueing and has a reconciler for database jobs missing from Redis.
