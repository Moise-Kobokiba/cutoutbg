import io

import pytest
from PIL import Image

from cutoutbg.model import CenterContrastModel
from cutoutbg.pipeline import InputValidationError, ValidationLimits, remove_background, validate_bytes


def image_bytes(format: str = "PNG", size: tuple[int, int] = (8, 6)) -> bytes:
    image = Image.new("RGB", size, (180, 80, 40))
    out = io.BytesIO()
    image.save(out, format=format)
    return out.getvalue()


def test_valid_png_and_jpeg() -> None:
    assert validate_bytes(image_bytes("PNG")).size == (8, 6)
    assert validate_bytes(image_bytes("JPEG")).mode == "RGB"


def test_valid_webp() -> None:
    assert validate_bytes(image_bytes("WEBP")).size == (8, 6)


def test_rejects_unsupported_and_malformed_inputs() -> None:
    with pytest.raises(InputValidationError) as unsupported:
        validate_bytes(b"not an image")
    assert unsupported.value.code == "unsupported_type"
    with pytest.raises(InputValidationError) as malformed:
        validate_bytes(b"\x89PNG\r\n\x1a\nnot valid")
    assert malformed.value.code == "malformed_image"


def test_rejects_limits() -> None:
    with pytest.raises(InputValidationError) as exc:
        validate_bytes(image_bytes(), ValidationLimits(max_bytes=2))
    assert exc.value.code == "file_too_large"
    with pytest.raises(InputValidationError) as pixels:
        validate_bytes(image_bytes(size=(8, 6)), ValidationLimits(max_pixels=10))
    assert pixels.value.code == "pixel_count_too_large"


def test_pipeline_returns_transparent_rgba_png() -> None:
    image = validate_bytes(image_bytes())
    model = CenterContrastModel()
    model.load("cpu")
    output = remove_background(image, model)
    assert output.mode == "RGBA"
    assert output.size == image.size
    assert output.getchannel("A").getextrema()[0] < 255


def test_model_requires_load_and_rejects_gpu() -> None:
    model = CenterContrastModel()
    with pytest.raises(RuntimeError):
        model.preprocess(Image.new("RGB", (2, 2)))
    with pytest.raises(ValueError):
        model.load("cuda")
