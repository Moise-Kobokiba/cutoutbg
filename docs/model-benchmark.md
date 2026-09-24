# Model benchmark

Run `python -m cutoutbg.cli benchmark tests/benchmark --model center-contrast-smoke-test`. The runner records model, image, dimensions, device, elapsed time, success, and errors as JSON. Fixture folders are present under `tests/benchmark/`; no images or results are fabricated.

Benchmark timing currently includes validation, preprocessing, inference, postprocessing, and encoding. Cold-start and warm-inference measurements are future work for learned adapters. Ground-truth metrics (IoU, Dice, precision, recall, and boundary metrics) must only be calculated when a matching mask fixture exists.

## Results

See `docs/model-benchmark-results.md`. The smoke-test adapter is not a quality benchmark and must not be used to claim segmentation accuracy.
