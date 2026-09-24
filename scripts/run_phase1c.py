from __future__ import annotations

import argparse
import json
import os
import platform
import resource
import statistics
import time
from pathlib import Path
from typing import Any

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
    flags: list[str] = []
    if unique < 2:
        flags.append("flat-alpha")
    if transparent >= 0.995:
        flags.append("nearly-all-transparent")
    if opaque >= 0.995:
        flags.append("nearly-all-opaque")
    return {
        "min": min(values),
        "max": max(values),
        "mean": sum(values) / total,
        "unique_values": unique,
        "transparent_fraction": transparent,
        "opaque_fraction": opaque,
        "flags": flags,
    }


def sample(model: BiRefNetModel, path: Path, output_dir: Path | None, categories: list[str]) -> dict[str, object]:
    started = time.perf_counter()
    row: dict[str, object] = {
        "fixture": path.name,
        "categories": categories,
        "status": "FAILURE",
        "device": model.device,
    }
    try:
        image = validate_path(path)
        row["input_dimensions"] = list(image.size)
        preprocess_started = time.perf_counter()
        model_input = model.preprocess(image)
        row["model_dimensions"] = list(reversed(tuple(model_input.shape[-2:])))
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
        if output.size != image.size:
            raise ValueError(f"output dimensions {output.size} do not match input {image.size}")
        if output_dir:
            output_dir.mkdir(parents=True, exist_ok=True)
            output.save(output_dir / f"{path.stem}.png", format="PNG")
        row["status"] = "SUCCESS"
    except Exception as exc:
        row["error"] = f"{type(exc).__name__}: {exc}"
    row["total_seconds"] = time.perf_counter() - started
    row["peak_rss_bytes"] = peak_rss()
    return row


def numeric_summary(rows: list[dict[str, object]], key: str) -> dict[str, float | None]:
    values = [float(row[key]) for row in rows if row.get("status") == "SUCCESS" and key in row]
    return {
        "mean": statistics.mean(values) if values else None,
        "median": statistics.median(values) if values else None,
        "minimum": min(values) if values else None,
        "maximum": max(values) if values else None,
        "stdev": statistics.stdev(values) if len(values) > 1 else None,
    }


def summarize(rows: list[dict[str, object]]) -> dict[str, object]:
    by_category: dict[str, list[dict[str, object]]] = {}
    for row in rows:
        for category in row.get("categories", []):
            by_category.setdefault(category, []).append(row)
    categories: dict[str, object] = {}
    for category, category_rows in sorted(by_category.items()):
        successes = [row for row in category_rows if row["status"] == "SUCCESS"]
        categories[category] = {
            "count": len(category_rows),
            "successes": len(successes),
            "failures": len(category_rows) - len(successes),
            "total_seconds": numeric_summary(category_rows, "total_seconds"),
        }
    return {
        "count": len(rows),
        "successes": sum(row["status"] == "SUCCESS" for row in rows),
        "failures": sum(row["status"] != "SUCCESS" for row in rows),
        "timings": {key: numeric_summary(rows, key) for key in ("preprocess_seconds", "inference_seconds", "postprocess_seconds", "total_seconds")},
        "categories": categories,
    }


def write_report(output_dir: Path, rows: list[dict[str, object]], load_seconds: float, model: BiRefNetModel, manifest: dict[str, Any]) -> dict[str, object]:
    ordered = sorted(rows, key=lambda row: str(row["fixture"]))
    result = {
        "model": {"name": "zhengpeng7/BiRefNet", "revision": model.metadata.revision},
        "environment": {
            "os": platform.platform(),
            "python": platform.python_version(),
            "cpu": platform.processor(),
            "device": model.device,
            "cuda_available": model.device == "cuda",
            "peak_rss_bytes": peak_rss(),
        },
        "load_seconds": load_seconds,
        "fixture_count": len(ordered),
        "rows": ordered,
        "summary": summarize(ordered),
        "manifest_fixture_count": len(manifest),
        "objective_metrics": "N/A — no ground-truth masks available",
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "report.json").write_text(json.dumps(result, indent=2) + "\n")
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("directory", type=Path)
    parser.add_argument("--cache-dir", type=Path, required=True)
    parser.add_argument("--device", choices=["cpu", "cuda"], default="cpu")
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--fixture", action="append", default=[])
    parser.add_argument("--start", type=int, default=0)
    parser.add_argument("--end", type=int)
    parser.add_argument("--state", type=Path)
    args = parser.parse_args()

    manifest_path = Path("tests/benchmark/manifest.json")
    manifest = {item["filename"]: item for item in json.loads(manifest_path.read_text())["fixtures"]}
    files = sorted(path for path in args.directory.iterdir() if path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"})
    if args.fixture:
        selected = set(args.fixture)
        files = [path for path in files if path.name in selected]
    else:
        files = files[args.start:args.end]
    unknown = [path.name for path in files if path.name not in manifest]
    if unknown:
        raise SystemExit(f"fixtures missing from manifest: {', '.join(unknown)}")

    state_path = args.state or (args.output_dir / "state.json")
    prior = json.loads(state_path.read_text()) if state_path.exists() else {"rows": [], "load_seconds": None}
    completed = {row["fixture"]: row for row in prior.get("rows", [])}
    pending = [path for path in files if path.name not in completed]

    model = BiRefNetModel(cache_dir=str(args.cache_dir))
    load_seconds = float(prior.get("load_seconds") or 0)
    if pending:
        load_started = time.perf_counter()
        model.load(args.device)
        load_seconds = time.perf_counter() - load_started
        for path in pending:
            categories = manifest[path.name].get("category", [])
            row = sample(model, path, args.output_dir, categories)
            completed[path.name] = row
            state_path.parent.mkdir(parents=True, exist_ok=True)
            state_path.write_text(json.dumps({"rows": list(completed.values()), "load_seconds": load_seconds}, indent=2) + "\n")
    elif completed:
        model.load(args.device)

    rows = [completed[path.name] for path in files if path.name in completed]
    result = write_report(args.output_dir, rows, load_seconds, model, manifest)
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
