from __future__ import annotations

import io
import os
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError

from .model import SegmentationModel


@dataclass(frozen=True)
class ValidationLimits:
    max_bytes: int = 25 * 1024 * 1024
    max_width: int = 12_000
    max_height: int = 12_000
    max_pixels: int = 40_000_000


class InputValidationError(ValueError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def _magic_format(data: bytes) -> str | None:
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "PNG"
    if data.startswith(b"\xff\xd8\xff"):
        return "JPEG"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "WEBP"
    return None


def validate_bytes(data: bytes, limits: ValidationLimits = ValidationLimits()) -> Image.Image:
    if not data:
        raise InputValidationError("empty_file", "input file is empty")
    if len(data) > limits.max_bytes:
        raise InputValidationError("file_too_large", "input exceeds byte limit")
    magic = _magic_format(data)
    if magic is None:
        raise InputValidationError("unsupported_type", "unsupported or invalid image signature")
    try:
        with Image.open(io.BytesIO(data)) as image:
            image.verify()
        with Image.open(io.BytesIO(data)) as image:
            width, height = image.size
            if width < 1 or height < 1:
                raise InputValidationError("invalid_dimensions", "image dimensions are invalid")
            if width > limits.max_width or height > limits.max_height:
                raise InputValidationError("dimensions_too_large", "image dimensions exceed limits")
            if width * height > limits.max_pixels:
                raise InputValidationError("pixel_count_too_large", "image pixel count exceeds limits")
            if image.format != magic:
                raise InputValidationError("mime_mismatch", "image signature and decoder format differ")
            return ImageOps.exif_transpose(image).convert("RGB")
    except InputValidationError:
        raise
    except (UnidentifiedImageError, OSError, SyntaxError) as exc:
        raise InputValidationError("malformed_image", "image could not be decoded safely") from exc


def validate_path(path: str | os.PathLike[str], limits: ValidationLimits = ValidationLimits()) -> Image.Image:
    source = Path(path)
    if not source.is_file():
        raise InputValidationError("file_not_found", "input path is not a regular file")
    try:
        return validate_bytes(source.read_bytes(), limits)
    except OSError as exc:
        raise InputValidationError("read_failed", "input file could not be read") from exc


def remove_background(image: Image.Image, model: SegmentationModel) -> Image.Image:
    original_size = image.size
    model_input = model.preprocess(image)
    prediction = model.infer(model_input)
    alpha = model.postprocess(prediction, original_size)
    if alpha.mode != "L" or alpha.size != original_size:
        raise RuntimeError("model returned an invalid alpha mask")
    output = image.convert("RGBA")
    output.putalpha(alpha)
    return output
