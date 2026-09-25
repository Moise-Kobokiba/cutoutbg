from __future__ import annotations

from typing import Any

from PIL import Image

from .model import ModelMetadata

MODEL_ID = "zhengpeng7/BiRefNet"
MODEL_REVISION = "e2bf8e4460fc8fa32bba5ea4d94b3233d367b0e4"
MODEL_CACHE_SUBDIR = "models--zhengpeng7--BiRefNet/snapshots/" + MODEL_REVISION


class BiRefNetModel:
    """Lazy, revision-pinned adapter for the official BiRefNet checkpoint.

    Optional ML dependencies are imported only when this adapter is loaded. The
    repository never downloads weights implicitly through the normal test suite.
    """

    metadata = ModelMetadata(
        name="birefnet-general",
        revision=MODEL_REVISION,
        repository="https://huggingface.co/zhengpeng7/BiRefNet",
        code_license="MIT (upstream repository)",
        weight_license="MIT (Hugging Face model card; verify exact terms before release)",
        commercial_status="requires legal review before commercial use",
        attribution="Zheng Peng et al.; retain MIT copyright notice",
        redistribution="Do not redistribute weights until legal review is complete",
        model_size="not measured locally",
        runtime="PyTorch + Transformers",
        supports_cpu=True,
        supports_gpu=True,
    )

    def __init__(self, cache_dir: str | None = None) -> None:
        self.cache_dir = cache_dir
        self.device = "cpu"
        self._loaded = False
        self._model: Any = None
        self._torch: Any = None
        self._transform: Any = None

    def load(self, device: str = "auto") -> None:
        if device not in {"auto", "cpu", "cuda"}:
            raise ValueError("device must be auto, cpu, or cuda")
        try:
            import torch
            from torchvision import transforms
            from transformers import AutoModelForImageSegmentation
        except ImportError as exc:
            raise RuntimeError(
                "BiRefNet requires optional dependencies; install the pinned ML extra"
            ) from exc

        selected = "cuda" if device == "auto" and torch.cuda.is_available() else device
        if selected == "cuda" and not torch.cuda.is_available():
            raise RuntimeError("CUDA was requested but no CUDA device is available")
        kwargs: dict[str, Any] = {
            "revision": MODEL_REVISION,
            "trust_remote_code": True,
            "local_files_only": self.cache_dir is not None,
        }
        if self.cache_dir:
            kwargs["cache_dir"] = self.cache_dir
        try:
            self._model = AutoModelForImageSegmentation.from_pretrained(MODEL_ID, **kwargs)
        except (OSError, RuntimeError) as exc:
            raise RuntimeError(
                f"BiRefNet revision {MODEL_REVISION} is unavailable in the configured local cache"
            ) from exc
        self._torch = torch
        self._transform = transforms.Compose([
            transforms.Resize((1024, 1024)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])
        self.device = selected
        self._model.to(selected).eval()
        self._loaded = True

    def preprocess(self, image: Image.Image) -> Any:
        if not self._loaded:
            raise RuntimeError("model is not loaded")
        return self._transform(image.convert("RGB")).unsqueeze(0).to(self.device)

    def infer(self, model_input: Any) -> Any:
        if not self._loaded:
            raise RuntimeError("model is not loaded")
        with self._torch.no_grad():
            return self._model(model_input)[-1].sigmoid().detach().cpu()

    def postprocess(self, prediction: Any, original_size: tuple[int, int]) -> Image.Image:
        if not self._loaded:
            raise RuntimeError("model is not loaded")
        mask = prediction[0].squeeze().clamp(0, 1)
        array = (mask.numpy() * 255).astype("uint8")
        return Image.fromarray(array, mode="L").resize(original_size, Image.Resampling.LANCZOS)

    def close(self) -> None:
        self._model = None
        self._torch = None
        self._transform = None
        self._loaded = False


def model_cache_path(cache_root: str) -> str:
    from pathlib import Path
    return str(Path(cache_root) / MODEL_CACHE_SUBDIR)
