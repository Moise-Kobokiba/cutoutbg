# Development workflow

Phase 0 found no package manifest, framework, test suite, CI, or deployment configuration. Phase 1 should scaffold the proposed monorepo without overwriting this documentation.

## Local services
Docker Compose should run `web`, `api`, `worker`, `postgres`, `redis`, and an S3-compatible object store. Each service must have a health check and explicit environment variables. Use separate development containers for Node and Python so runtime dependencies are reproducible.

## Quality gates
- TypeScript strict mode and Zod contract tests.
- Python formatting, linting, unit tests, and model-adapter tests.
- API integration tests for ownership, validation, idempotency, and job transitions.
- Fixture-based image tests with safe, permissioned assets.
- Dependency/license scanning and container vulnerability scanning.
- CI runs lint, typecheck, tests, and Compose-backed integration tests.

## Environment
Commit `.env.example` with names and safe placeholders only. Keep secrets in the environment manager. Document migrations, seed data, worker device selection, and how to run the benchmark harness.

## Suggested Phase 1 order
1. Confirm target license and benchmark corpus ownership.
2. Scaffold workspace, contracts, Compose, and health endpoints.
3. Implement storage and database migrations.
4. Implement one license-approved adapter behind the model contract.
5. Add an API job lifecycle with a fake adapter for integration tests.
6. Run real model benchmarks and decide whether the adapter is production eligible.
7. Only then build the first upload UI.
