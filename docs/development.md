# Development

Create an isolated environment and install the test extra for ordinary checks:

```sh
python -m venv .venv
. .venv/bin/activate
python -m pip install -e '.[test]'
pytest
```

For learned-model evaluation, install `.[ml,test]` in an isolated environment. Populate a local Hugging Face cache only at the pinned BiRefNet revision recorded in `docs/model-selection.md`, then run the benchmark with `--cache-dir`. Do not commit model weights or benchmark outputs. The ordinary test suite does not require ML dependencies.

Phase 1A is not production-ready and does not provide a web service, accounts, billing, or deployment infrastructure.
