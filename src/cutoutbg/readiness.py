from __future__ import annotations

import importlib.util
import json
from pathlib import Path
from typing import Any

from .birefnet import MODEL_CACHE_SUBDIR, MODEL_ID, MODEL_REVISION

ML_MODULES = ("torch", "torchvision", "transformers", "huggingface_hub", "einops", "kornia", "timm")


def _dependencies_status() -> dict[str, Any]:
    missing = [name for name in ML_MODULES if importlib.util.find_spec(name) is None]
    return {"available": not missing, "missing": missing}


def _weights_status(cache_dir: str | None) -> dict[str, Any]:
    if not cache_dir:
        return {"available": False, "reason": "no local cache directory configured"}
    snapshot = Path(cache_dir) / MODEL_CACHE_SUBDIR
    if not snapshot.is_dir():
        return {"available": False, "reason": "pinned model snapshot is not present"}
    expected = ("config.json", "model.safetensors")
    missing = [name for name in expected if not (snapshot / name).is_file()]
    return {"available": not missing, "missing": missing, "reason": "required snapshot files are missing" if missing else None}


def model_readiness(cache_dir: str | None) -> dict[str, Any]:
    dependencies = _dependencies_status()
    weights = _weights_status(cache_dir)
    return {
        "model": MODEL_ID,
        "revision": MODEL_REVISION,
        "model_dependencies": dependencies,
        "model_weights": weights,
        "inference_ready": dependencies["available"] and weights["available"],
    }


def readiness_json(cache_dir: str | None) -> str:
    return json.dumps(model_readiness(cache_dir), indent=2)


__all__ = ["model_readiness", "readiness_json"]
