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
from cutoutbg.pipeline import validate_path


def peak_rss() -> int:
    value = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    return int(value * (1024 if platform.system() != "Darwin" else 1))


def alpha_stats(alpha: Image.Image) -> dict[str, object]:
    values = list(alpha.getdata())
    total = len(values)
    transparent = sum(value == 0 for value in values) / total
    opaque = sum(value == 255 for value in values) / total
    unique = len(set(values))
    flags = []
    if unique < 2:
        flags.append("flat-alpha")
    if transparent >= 0.995:
        flags.append("nearly-all-transparent")
    if opaque >= 0.995:
        flags.append("nearly-all-opaque")
    return {
        "min": min(values), "max": max(values), "mean": sum(values) / total,
        "unique_values": unique, "transparent_fraction": transparent,
        "opaque_fraction": opaque, "flags": flags,
    }


def sample(model: BiRefNetModel, path: Path, output_dir: Path | None, categories: list[str]) -> dict[str, object]:
    started = time.perf_counter()
    row: dict[str, object] = {"fixture": path.name, "categories": categories, "status": "FAILURE"}
    try:
        image = validate_path(path)
        row["input_dimensions"] = list(image.size)
        preprocess_started = time.perf_counter()
        model_input = model.preprocess(image)
        row["model_dimensions"] = list(model_input["pixel_values"].shape[-2:][::-1])
        row["preprocess_seconds"] = time.perf_counter() - preprocess_started
        infer_started = time.perf_counter()
        prediction = model.infer(model_input)
        row["inference_seconds"] = time.perf_counter() - infer_started
        post_started = time.perf_counter()
        alpha = model.postprocess(prediction, image.size)
        output = image.convert("RGBA")
        output.putalpha(alpha)
        row["postprocess_seconds"] = time.perf_counter() - post_started
        row["output_dimensions"] = list(output.size)
        row["alpha"] = alpha_stats(alpha)
        if output_dir:
            output_dir.mkdir(parents=True, exist_ok=True)
            output.save(output_dir / f"{path.stem}.png", format="PNG")
        row["status"] = "SUCCESS"
    except Exception as exc:
        row["error"] = f"{type(exc).__name__}: {exc}"
    row["total_seconds"] = time.perf_counter() - started
    row["peak_rss_bytes"] = peak_rss()
    return row


def summarize(rows: list[dict[str, object]]) -> dict[str, object]:
    successes = [row for row in rows if row["status"] == "SUCCESS"]
    durations = [float(row["total_seconds"]) for row in successes]
    by_category: dict[str, list[dict[str, object]]] = {}
    for row in rows:
        for category in row.get("categories", []):
            by_category.setdefault(category, []).append(row)
    categories = {}
    for category, category_rows in sorted(by_category.items()):
        category_successes = sum(row["status"] == "SUCCESS" for row in category_rows)
        categories[category] = {"count": len(category_rows), "successes": category_successes, "failures": len(category_rows) - category_successes}
    return {"count": len(rows), "successes": len(successes), "failures": len(rows) - len(successes), "mean_seconds": statistics.mean(durations) if durations else None, "median_seconds": statistics.median(durations) if durations else None, "minimum_seconds": min(durations) if durations else None, "maximum_seconds": max(durations) if durations else None, "stdev_seconds": statistics.stdev(durations) if len(durations) > 1 else None, "categories": categories}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("directory", type=Path)
    parser.add_argument("--cache-dir", type=Path, required=True)
    parser.add_argument("--device", choices=["cpu", "cuda"], default="cpu")
    parser.add_argument("--warm-samples", type=int, default=1)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--fixture", action="append", default=[])
    parser.add_argument("--start", type=int, default=0)
    parser.add_argument("--end", type=int)
    parser.add_argument("--state", type=Path)
    args = parser.parse_args()
    manifest_path = Path("tests/benchmark/manifest.json")
    manifest = {item["filename"]: item for item in json.loads(manifest_path.read_text())["fixtures"]}
    files = sorted(p for p in args.directory.iterdir() if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"})
    if args.fixture:
        files = [path for path in files if path.name in args.fixture]
    else:
        files = files[args.start:args.end]
    state_path = args.state or (args.output_dir / "state.json")
    prior = json.loads(state_path.read_text()) if state_path.exists() else {"rows": []}
    completed = {row["fixture"]: row for row in prior.get("rows", [])}
    files = [path for path in files if path.name not in completed]
    model = BiRefNetModel(cache_dir=str(args.cache_dir))
    load_started = time.perf_counter()
    model.load(args.device)
    load_seconds = time.perf_counter() - load_started
    for path in files:
        categories = manifest.get(path.name, {}).get("category", [])
        for _ in range(args.warm_samples):
            row = sample(model, path, args.output_dir, categories)
            completed[path.name] = row
            state_path.parent.mkdir(parents=True, exist_ok=True)
            state_path.write_text(json.dumps({"rows": list(completed.values())}, indent=2) + "\n")
    rows = [completed[path.name] for path in sorted(files, key=lambda item: item.name) if path.name in completed]
    result = {"model": {"name": "zhengpeng7/BiRefNet", "revision": model.metadata.revision}, "environment": {"os": platform.platform(), "python": platform.python_version(), "cpu": platform.processor(), "device": model.device, "cuda_available": model.device == "cuda", "peak_rss_bytes": peak_rss()}, "load_seconds": load_seconds, "fixture_count": len(rows), "rows": rows, "summary": summarize(rows), "objective_metrics": "N/A — no ground-truth masks available"}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / "report.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
