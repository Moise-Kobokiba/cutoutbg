# Phase 2D — Real runtime and end-to-end verification

Status: **BLOCKED**

Branch: `v0/phase-2d-runtime-e2e`

## Runtime prerequisites

- Node.js 24.16.0 and npm 11.13.0: available.
- Python 3.13.11: available.
- Docker and Docker Compose: unavailable (`docker: command not found`).
- Python ML runtime: unavailable. `torch`, `torchvision`, `transformers`, `huggingface_hub`, `numpy`, Pillow, and pytest are not installed in the host environment.
- CUDA: unavailable because PyTorch is not installed; no GPU was claimed.
- Disk and memory were inspected; host capacity alone does not establish runtime readiness.

## Runtime path audited

Browser -> `lib/remove-background.ts` -> Fastify `POST /api/v1/jobs` -> PostgreSQL job repository -> BullMQ/Redis -> `server/worker.ts` -> Python `cutoutbg remove` -> BiRefNet revision `e2bf8e4460fc8fa32bba5ea4d94b3233d367b0e4` -> RGBA PNG validation -> private S3-compatible storage -> controlled signed result URL -> browser.

The Compose definition was hardened with healthchecks, persistent PostgreSQL/MinIO/model-cache volumes, dependency health conditions, and ML extras in the runtime Dockerfile. It could not be started or validated because Docker is not installed.

## Acceptance matrix

| Component | Result | Evidence |
|---|---|---|
| PostgreSQL | BLOCKED | Docker unavailable |
| Redis | BLOCKED | Docker unavailable |
| BullMQ | BLOCKED | Docker unavailable |
| MinIO | BLOCKED | Docker unavailable |
| API | PASS (unit/runtime-free) | Fastify server tests passed; live provider connection unverified |
| Worker | BLOCKED | Docker, Python ML packages, and checkpoint unavailable |
| BiRefNet checkpoint | BLOCKED | No runtime/cache; no download performed |
| Real inference | BLOCKED | Not executed |
| Browser upload | PASS (unavailable path) | Browser selected a real fixture and received honest unavailable state |
| Real job creation | BLOCKED | No live API provider runtime |
| Queue consumption | BLOCKED | No Redis/worker runtime |
| Result storage/signed URL | BLOCKED | No MinIO runtime |
| Browser result/download | BLOCKED | No real processed result |

## Failure-path verification

- Browser backend-unavailable state: PASS. The UI displayed `Background removal is temporarily unavailable. The processing service is not connected in this environment.` after selecting `public/demo-subject.png`.
- Fastify non-multipart request: PASS in server tests; returned structured HTTP 400 instead of exposing a stack trace.
- Unsupported, malformed, oversized, missing-object, worker-failure, and storage-failure live tests: BLOCKED without the runtime.

## Persistence/restart test

BLOCKED. PostgreSQL and Redis were not available, so no API or worker restart could be performed and no persistence claim is made.

## Performance

No Phase 2D runtime measurements were recorded. Historical Phase 1D CPU values remain context only: cold load 4.498s, warm mean 26.860s, peak RSS approximately 4.93 GiB. They were not re-run here.

## Validation

- `npm run lint`: PASS
- `npm run build`: PASS
- `npm run test:server`: PASS, 2 tests
- `git diff --check`: PASS
- Python tests: BLOCKED; pytest and Python dependencies unavailable
- Docker/Compose health checks: BLOCKED; Docker unavailable
- Real HTTP-to-model E2E: BLOCKED

BiRefNet remains `REQUIRES LEGAL REVIEW`; no commercial clearance is claimed.

Phase 2D is not complete. The exact blocker is the absence of Docker/Compose and the corresponding Python ML runtime/checkpoint in this environment.
