from pathlib import Path

from cutoutbg.birefnet import MODEL_CACHE_SUBDIR
from cutoutbg.readiness import model_readiness


def test_readiness_reports_missing_dependencies_and_weights(tmp_path: Path) -> None:
    result = model_readiness(str(tmp_path))
    assert result["model"] == "zhengpeng7/BiRefNet"
    assert result["revision"]
    assert result["model_weights"]["available"] is False
    assert result["inference_ready"] is False


def test_readiness_requires_pinned_snapshot_files(tmp_path: Path) -> None:
    snapshot = tmp_path / MODEL_CACHE_SUBDIR
    snapshot.mkdir(parents=True)
    (snapshot / "config.json").write_text("{}", encoding="utf-8")
    result = model_readiness(str(tmp_path))
    assert result["model_weights"]["available"] is False
    assert "model.safetensors" in result["model_weights"]["missing"]


def test_readiness_without_cache_is_safe() -> None:
    result = model_readiness(None)
    assert result["model_weights"]["available"] is False
    assert result["inference_ready"] is False
