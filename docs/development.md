# Development

## Local engine

```bash
python -m venv .venv
. .venv/bin/activate
pip install -e '.[test]'
pytest
python -m cutoutbg.cli remove input.jpg --output output.png
python -m cutoutbg.cli benchmark tests/benchmark
```

The CLI reads only explicitly supplied paths, writes PNG output, and emits structured JSON. Test fixtures are intentionally small. Learned model dependencies and weights are not installed until their licenses are approved.

## Phase 1 limitations

The smoke-test adapter is not production-ready and is not a background-removal quality claim. GPU support, learned-model loading, peak-memory instrumentation, warm/cold timing, and objective mask metrics remain blocked on model selection and fixture availability.
