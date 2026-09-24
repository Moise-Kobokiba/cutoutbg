# Development

Create an isolated environment and install the test extra for ordinary checks:

```sh
python -m venv .venv
. .venv/bin/activate
python -m pip install -e '.[test]'
pytest
```

For learned-model evaluation, install `.[ml,test]` in an isolated environment. Acquire the pinned checkpoint and its exact-revision remote-code files with `python scripts/acquire_birefnet.py --cache-dir ./model-cache`, or verify an existing cache with `--offline`. Then run `python -m cutoutbg benchmark tests/benchmark --model birefnet-general --device cpu --cache-dir ./model-cache`. Do not commit model weights or benchmark outputs. The ordinary test suite does not require ML dependencies.

Phase 1A is not production-ready and does not provide a web service, accounts, billing, or deployment infrastructure.
