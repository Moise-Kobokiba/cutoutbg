from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

from PIL import Image


@dataclass(frozen=True)
class ModelMetadata:
    name: str
    revision: str
    repository: str
    code_license: str
    weight_license: str
    commercial_status: str
    attribution: str
    redistribution: str
    model_size: str
    runtime: str
    supports_cpu: bool
    supports_gpu: bool


class SegmentationModel(Protocol):
    metadata: ModelMetadata

    def load(self, device: str = "auto") -> None: ...
    def preprocess(self, image: Image.Image) -> Any: ...
    def infer(self, model_input: Any) -> Any: ...
    def postprocess(self, prediction: Any, original_size: tuple[int, int]) -> Image.Image: ...
    def close(self) -> None: ...


class CenterContrastModel:
    """Dependency-light smoke-test adapter, not a production segmentation model.

    It deliberately has unresolved commercial suitability and exists to exercise
    the complete pipeline before a licensed learned model is approved.
    """

    metadata = ModelMetadata(
        name="center-contrast-smoke-test",
        revision="0.1.0",
        repository="local implementation",
        code_license="CutoutBG repository license pending",
        weight_license="No weights",
        commercial_status="unresolved; not a production recommendation",
        attribution="None",
        redistribution="No weights redistributed",
        model_size="0 MB",
        runtime="Pillow",
        supports_cpu=True,
        supports_gpu=False,
    )

    def __init__(self) -> None:
        self.device = "cpu"
        self._loaded = False

    def load(self, device: str = "auto") -> None:
        if device not in {"auto", "cpu"}:
            raise ValueError("center-contrast-smoke-test supports only cpu")
        self.device = "cpu"
        self._loaded = True

    def preprocess(self, image: Image.Image) -> Image.Image:
        if not self._loaded:
            raise RuntimeError("model is not loaded")
        return image.convert("RGB")

    def infer(self, model_input: Image.Image) -> Image.Image:
        if not self._loaded:
            raise RuntimeError("model is not loaded")
        # A conservative, deterministic soft matte for pipeline smoke tests.
        gray = model_input.convert("L")
        return gray.point(lambda value: max(0, min(255, int((value - 24) * 1.35))))

    def postprocess(self, prediction: Image.Image, original_size: tuple[int, int]) -> Image.Image:
        return prediction.resize(original_size, Image.Resampling.LANCZOS).convert("L")

    def close(self) -> None:
        self._loaded = False


def create_model(name: str) -> SegmentationModel:
    if name == "center-contrast-smoke-test":
        return CenterContrastModel()
    raise ValueError(f"unknown model: {name}")
