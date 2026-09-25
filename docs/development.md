# Development

CutoutBG uses native Node and Python tooling for ordinary local development. Docker remains available for reproducible environments and CI, but is not required for the web UI, type checks, or unit tests.

Install JavaScript dependencies with `npm install`, then start the Next.js preview with:

`npm run dev`

Run the TypeScript check and server tests with:

`npm run lint`
`npm run test`

The Fastify API and queue worker are optional until a local Redis, PostgreSQL, and S3-compatible service are available. Start them only when working on the processing backend:

`npm run server`
`npm run worker`

Install the Python package and fast-test dependencies in `.venv` when working on the inference engine:

`pip install -e '.[test]'`
`PYTHONPATH=src python -m pytest`

For learned-model evaluation, install `.[ml,test]`, acquire the exact pinned checkpoint with `python scripts/acquire_birefnet.py --cache-dir ./model-cache`, and run the Phase 1C benchmark from `docs/model-benchmark.md`. Use `--offline` to verify a cache without network access. Do not commit model caches, generated outputs, or benchmark JSON. Do not treat generated fixtures as ground truth.

Check BiRefNet readiness without downloading weights:

`PYTHONPATH=src python -m cutoutbg.cli readiness --cache-dir ./model-cache`

The readiness report checks the declared ML imports and the pinned snapshot files under `./model-cache/huggingface/zhengpeng7--BiRefNet/snapshots/<revision>`. It does not expose paths beyond the configured cache, download files, or make the frontend depend on the result. Acquire the checkpoint only after reviewing the licensing record with:

`PYTHONPATH=src python scripts/acquire_birefnet.py --cache-dir ./model-cache`

Use `--offline` for a cache-only check. The script records a local SHA-256 manifest but does not commit weights. BiRefNet code licensing, checkpoint licensing, training-data provenance, and commercial-use status remain separate review items; the repository status is still `REQUIRES LEGAL REVIEW`.

Run a real local inference only when readiness reports `"inference_ready": true`:

`PYTHONPATH=src python -m cutoutbg.cli remove ./input.png --output ./output.png --model birefnet-general --cache-dir ./model-cache --device cpu`

The default smoke-test model remains dependency-light and is suitable only for pipeline tests, not product quality claims.
