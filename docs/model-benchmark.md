# Phase 1C benchmark protocol

Run the fast suite with `PYTHONPATH=src .venv/bin/python -m pytest`. Run the learned-model benchmark separately because it requires the pinned local cache and can take several minutes:

`PYTHONPATH=src .venv/bin/python scripts/run_phase1c.py tests/fixtures --cache-dir ./model-cache --device cpu --warm-samples 3 --output-dir ./benchmark-results/phase1c`

The runner loads the model once, records cold load and first-sample timing, then records preprocessing, inference, postprocessing, total time, alpha extrema, suspicious-mask flags, repeated warm statistics, environment details, and peak process RSS. CUDA is only run when PyTorch reports a usable NVIDIA device; unavailable GPU measurements must remain explicitly unavailable.

All fixture provenance is in `tests/benchmark/manifest.json`. Fixtures are project-generated and do not provide ground truth. Therefore IoU, Dice, precision, recall, and boundary metrics are N/A. Generated outputs and benchmark JSON are ignored by Git. Review outputs category-by-category before changing the decision in `docs/model-benchmark-results.md`.
