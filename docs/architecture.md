# CutoutBG architecture

## Phase 0 status
This repository was empty apart from a minimal README. No framework, package manager, scripts, CI, tests, deployment configuration, or application code was found. Phase 0 establishes decisions; it does not implement the production application.

## Target topology

```text
Next.js web app -> TypeScript API -> BullMQ/Redis queue -> Python GPU worker
                                      |                     |
                                      +-> PostgreSQL         +-> object storage
```

The web app, API, and worker are separate deployable processes. The API accepts an upload, validates it, stores the original in private object storage, creates a job, and returns `202 Accepted`. Workers claim jobs, run a model through the `SegmentationModel` contract, write an output object, and update job state. Clients poll initially; webhooks and SSE can be added later without changing the job contract.

## Proposed repository

```text
apps/web        Next.js, React, TypeScript, Tailwind, shadcn/ui
apps/api        Fastify, TypeScript, Zod
services/worker Python, PyTorch/ONNX Runtime, Pillow
packages/contracts shared API and job schemas
packages/model-contract Python model interface and metadata
infra            Compose, environment examples, deployment notes
docs             architecture and operational decisions
```

The web experience should follow Apple HIG principles: clear hierarchy, direct manipulation, forgiving undo/retry states, accessible contrast and focus, progressive disclosure, and responsive layouts. The first UI should keep one primary action—upload image—visible, explain limits before upload, and make progress and download states unambiguous.

## Boundaries
- API owns authentication, validation, authorization, quotas, and job lifecycle.
- Worker owns model loading, preprocessing, inference, postprocessing, and output encoding.
- Storage owns private originals and results; URLs are short-lived and signed.
- PostgreSQL is the source of truth for users, jobs, metadata, and usage records.
- Redis is ephemeral queue state, not the source of truth for user data.

## Initial non-goals
Billing, subscriptions, public API implementation, production deployment, and model selection are intentionally deferred until licensing and benchmark evidence are complete.

## Source references
- Apple HIG design principles: https://developer.apple.com/design/human-interface-guidelines/design-principles
- Next.js: https://nextjs.org/docs
- Fastify: https://fastify.dev/docs/latest/
- BullMQ: https://docs.bullmq.io/
- Docker Compose: https://docs.docker.com/compose/
- PostgreSQL: https://www.postgresql.org/docs/
- S3 API: https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html

## Open decisions
GPU provider, object-storage vendor, authentication provider, retention period, API versioning policy, and final model remain open pending Phase 1 validation.
