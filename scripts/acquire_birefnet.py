from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

MODEL_ID = "zhengpeng7/BiRefNet"
MODEL_REVISION = "e2bf8e4460fc8fa32bba5ea4d94b3233d367b0e4"
WEIGHT_FILENAME = "model.safetensors"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description="Acquire the pinned BiRefNet checkpoint")
    parser.add_argument("--cache-dir", type=Path, required=True)
    parser.add_argument("--offline", action="store_true")
    args = parser.parse_args()

    try:
        from huggingface_hub import snapshot_download
    except ImportError as exc:
        raise SystemExit("Install the ML extra before acquiring BiRefNet") from exc

    cache_dir = args.cache_dir.expanduser().resolve()
    cache_dir.mkdir(parents=True, exist_ok=True)
    snapshot = Path(snapshot_download(
        MODEL_ID,
        revision=MODEL_REVISION,
        cache_dir=str(cache_dir),
        local_files_only=args.offline,
        allow_patterns=[
            "config.json",
            "model.safetensors",
            "README.md",
            "BiRefNet_config.py",
            "birefnet.py",
            "handler.py",
            "requirements.txt",
        ],
    ))
    weights = snapshot / WEIGHT_FILENAME
    if not weights.is_file():
        raise SystemExit(f"Pinned snapshot is missing {WEIGHT_FILENAME}: {weights}")

    manifest = {
        "model": MODEL_ID,
        "revision": MODEL_REVISION,
        "weight_filename": WEIGHT_FILENAME,
        "weight_size_bytes": weights.stat().st_size,
        "weight_sha256": sha256(weights),
        "cache_snapshot": str(snapshot),
        "acquisition": "cache" if args.offline else "download_or_existing_cache",
    }
    manifest_path = cache_dir / "cutoutbg-birefnet-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
