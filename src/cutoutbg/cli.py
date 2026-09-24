from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

from .model import create_model
from .pipeline import InputValidationError, remove_background, validate_path


def remove_command(args: argparse.Namespace) -> int:
    started = time.perf_counter()
    model = create_model(args.model)
    try:
        model.load(args.device)
        image = validate_path(args.input)
        pre_inference = time.perf_counter()
        output = remove_background(image, model)
        output.save(args.output, format="PNG", optimize=False)
        elapsed = time.perf_counter() - started
        print(json.dumps({"status": "success", "output": str(args.output), "width": output.width, "height": output.height, "seconds": round(elapsed, 6), "pre_inference_seconds": round(pre_inference - started, 6)}))
        return 0
    except InputValidationError as exc:
        print(json.dumps({"status": "failure", "error_category": exc.code, "error": exc.message}))
        return 2
    finally:
        model.close()


def benchmark_command(args: argparse.Namespace) -> int:
    root = Path(args.directory)
    rows: list[dict[str, object]] = []
    for path in sorted(root.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
            continue
        started = time.perf_counter()
        model = create_model(args.model)
        try:
            model.load(args.device)
            image = validate_path(path)
            output = remove_background(image, model)
            rows.append({"image": str(path), "input_dimensions": image.size, "output_dimensions": output.size, "device": model.device, "seconds": round(time.perf_counter() - started, 6), "success": True})
        except (InputValidationError, RuntimeError, OSError) as exc:
            rows.append({"image": str(path), "seconds": round(time.perf_counter() - started, 6), "success": False, "error": str(exc)})
        finally:
            model.close()
    print(json.dumps({"model": args.model, "rows": rows}, indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(prog="cutoutbg")
    subparsers = parser.add_subparsers(dest="command", required=True)
    remove = subparsers.add_parser("remove", help="remove a background locally")
    remove.add_argument("input", type=Path)
    remove.add_argument("--output", type=Path, required=True)
    remove.add_argument("--model", default="center-contrast-smoke-test")
    remove.add_argument("--device", default="auto", choices=["auto", "cpu", "cuda"])
    remove.set_defaults(function=remove_command)
    benchmark = subparsers.add_parser("benchmark", help="benchmark a fixture directory")
    benchmark.add_argument("directory", type=Path)
    benchmark.add_argument("--model", default="center-contrast-smoke-test")
    benchmark.add_argument("--device", default="auto", choices=["auto", "cpu", "cuda"])
    benchmark.set_defaults(function=benchmark_command)
    args = parser.parse_args()
    return args.function(args)


if __name__ == "__main__":
    raise SystemExit(main())
