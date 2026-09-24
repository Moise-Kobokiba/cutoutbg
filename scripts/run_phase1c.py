from __future__ import annotations

import argparse
import json
import os
import platform
import resource
import statistics
import time
from pathlib import Path

from PIL import Image

from cutoutbg.birefnet import BiRefNetModel
from cutoutbg.pipeline import remove_background, validate_path


def sample(model: BiRefNetModel, path: Path, output_dir: Path | None) -> dict[str, object]:
    total_start = time.perf_counter()
    image = validate_path(path)
    preprocess_start = time.perf_counter()
    model_input = model.preprocess(image)
    preprocess = time.perf_counter() - preprocess_start
    infer_start = time.perf_counter()
    prediction = model.infer(model_input)
    inference = time.perf_counter() - infer_start
    post_start = time.perf_counter()
    alpha = model.postprocess(prediction, image.size)
    output = image.convert("RGBA")
    output.putalpha(alpha)
    postprocess = time.perf_counter() - post_start
    if output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)
        output.save(output_dir / f"{path.stem}.png", format="PNG")
    values = list(alpha.getdata())
    unique = len(set(values))
    return {"fixture": path.name, "input_dimensions": list(image.size), "output_dimensions": list(output.size), "preprocess_seconds": preprocess, "inference_seconds": inference, "postprocess_seconds": postprocess, "total_seconds": time.perf_counter() - total_start, "alpha_min": min(values), "alpha_max": max(values), "alpha_unique_values": unique, "suspicious_mask": unique < 2 or max(values) < 8 or min(values) > 247}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("directory", type=Path)
    parser.add_argument("--cache-dir", type=Path, required=True)
    parser.add_argument("--device", choices=["cpu", "cuda"], default="cpu")
    parser.add_argument("--warm-samples", type=int, default=3)
    parser.add_argument("--output-dir", type=Path)
    args = parser.parse_args()
    files = sorted(p for p in args.directory.iterdir() if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"})
    model = BiRefNetModel(cache_dir=str(args.cache_dir))
    load_start = time.perf_counter()
    model.load(args.device)
    load_seconds = time.perf_counter() - load_start
    cold = sample(model, files[0], args.output_dir) if files else None
    warm_rows = []
    for path in files:
        for _ in range(args.warm_samples):
            warm_rows.append(sample(model, path, args.output_dir))
    durations = [row["total_seconds"] for row in warm_rows]
    peak_rss = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss * (1024 if platform.system() != "Darwin" else 1)
    gpu = {}
    if model.device == "cuda":
        import torch
        gpu = {"name": torch.cuda.get_device_name(0), "vram_bytes": torch.cuda.get_device_properties(0).total_memory, "peak_allocated_bytes": torch.cuda.max_memory_allocated()}
    result = {"model": {"name": "BiRefNet", "revision": model.metadata.revision}, "environment": {"os": platform.platform(), "python": platform.python_version(), "cpu": platform.processor(), "peak_rss_bytes": peak_rss, "device": model.device, "gpu": gpu}, "fixture_count": len(files), "cold": cold, "load_seconds": load_seconds, "warm": {"sample_count": len(durations), "mean_seconds": statistics.mean(durations) if durations else None, "median_seconds": statistics.median(durations) if durations else None, "minimum_seconds": min(durations) if durations else None, "maximum_seconds": max(durations) if durations else None, "stdev_seconds": statistics.stdev(durations) if len(durations) > 1 else None, "rows": warm_rows}}
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
