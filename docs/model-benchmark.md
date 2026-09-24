# Model benchmark

The fixture manifest is `tests/benchmark/manifest.json`. It intentionally contains no images until provenance and repository redistribution permission are recorded. Add only project-owned, generated, public-domain, or permissively licensed fixtures with dimensions, category, source, usage permission, expected subject, and difficulty metadata.

Example evaluation command after the pinned checkpoint is cached:

```sh
python -m cutoutbg.cli benchmark tests/benchmark --model birefnet-general --device cpu --cache-dir /path/to/huggingface-cache
```

The runner currently reports per-image elapsed time and success/failure. Cold and warm inference, preprocessing/postprocessing, peak memory, objective mask metrics, and qualitative review remain required before a recommendation. No benchmark result is valid without actual fixture images and recorded hardware.
