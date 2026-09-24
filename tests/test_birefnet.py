from cutoutbg.birefnet import MODEL_ID, MODEL_REVISION, BiRefNetModel


def test_birefnet_is_revision_pinned_and_lazy() -> None:
    model = BiRefNetModel(cache_dir="/tmp/cutoutbg-cache")
    assert MODEL_ID == "zhengpeng7/BiRefNet"
    assert len(MODEL_REVISION) == 40
    assert model._loaded is False


def test_birefnet_reports_unresolved_commercial_status() -> None:
    assert "legal review" in BiRefNetModel.metadata.commercial_status


def test_birefnet_missing_runtime_is_actionable() -> None:
    model = BiRefNetModel(cache_dir="/tmp/cutoutbg-cache")
    try:
        model.load("cpu")
    except RuntimeError as exc:
        assert "optional dependencies" in str(exc) or "local" in str(exc)
