# Development

Install the package and fast-test dependencies in `.venv`. The normal suite does not download model weights:

`pip install -e '.[test]'`

`PYTHONPATH=src python -m pytest`

For learned-model evaluation, install `.[ml,test]`, acquire the exact pinned checkpoint with `python scripts/acquire_birefnet.py --cache-dir ./model-cache`, and run the Phase 1C benchmark from `docs/model-benchmark.md`. Use `--offline` to verify a cache without network access. Do not commit model caches, generated outputs, or benchmark JSON. Do not treat generated fixtures as ground truth.
