# Phase 2A runtime verification

## Runtime architecture

The runtime path is API -> PostgreSQL job record -> Redis/BullMQ -> worker -> Python `cutoutbg` BiRefNet inference -> private S3-compatible storage -> controlled result URL. Development uses Docker Compose services for PostgreSQL, Redis, MinIO, API, and worker.

Set `DATABASE_URL`, `REDIS_URL`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, and `S3_SECRET_KEY` to enable the persistent runtime. Without them, development falls back to process-local jobs and filesystem storage; `/ready` reports `503` and this is not a production-ready mode.

## Commands

```sh
docker compose config
docker compose up --build
npm run server
npm run worker
npm run test:server
npm run lint
npm run build
```

The PostgreSQL schema is initialized from `infrastructure/postgres/001_processing_jobs.sql`. MinIO remains private; results are returned through a five-minute signed URL when S3 is configured. Storage keys are generated under `jobs/{jobId}/` and user filenames are metadata only.

## Safety and lifecycle

Uploads are decoded with Sharp and constrained by byte, pixel, and dimension limits. The worker loads the existing pinned Python BiRefNet implementation, uses concurrency `1`, validates PNG/RGBA dimensions and alpha, and records safe failure messages. Job transitions are restricted to queued -> processing -> completed/failed. Temporary worker files are removed after processing.

## Verification status

Static validation passed: `npm run lint`, `npm run build`, `npm run test:server` (2 tests), and `git diff --check`. Docker is unavailable in the current environment, so PostgreSQL runtime, Redis/BullMQ runtime, MinIO runtime, real model inference through HTTP, persistence restarts, and browser display/download of a real result remain unverified. No end-to-end result is claimed.

Phase 1D remains the performance baseline: warm mean approximately 26.86 seconds/image and peak RSS approximately 4.93 GiB on CPU. GPU validation is unavailable. BiRefNet commercial/legal status remains `REQUIRES LEGAL REVIEW`.
