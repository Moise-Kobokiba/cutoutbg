# Phase 2 processing backend

The local backend is split into a Fastify HTTP service, BullMQ queue, Python inference worker, and replaceable filesystem storage adapter. The worker invokes the existing `SegmentationModel` pipeline through the Python CLI; TypeScript does not reimplement BiRefNet.

## Development

Install dependencies, start Redis/Postgres/MinIO with `docker compose up -d`, then run `REDIS_URL=redis://localhost:6379 npm run server` and `REDIS_URL=redis://localhost:6379 npm run worker`. The API listens on port 4100 by default.

`POST /api/v1/jobs` accepts a multipart `file` field. `GET /api/v1/jobs/:id` returns lifecycle state and a controlled result URL. `GET /health` is process liveness; `/ready` requires Redis configuration.

Development defaults are intentionally conservative: 25 MiB, 12,000×12,000 pixels/dimensions, 40 million pixels, and worker concurrency 1 because Phase 1D measured approximately 4.93 GiB peak RSS and 26.9 seconds warm CPU inference.

The current job repository is process-local while the PostgreSQL schema is established in `infrastructure/postgres/001_processing_jobs.sql`; wiring the repository to PostgreSQL and MinIO/S3 is the next hardening step. Docker was unavailable in the validation environment, so a real queue/worker end-to-end run is not claimed.

Model licensing remains `REQUIRES LEGAL REVIEW`; no production readiness or commercial clearance is implied.
