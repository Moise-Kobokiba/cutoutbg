import json
from pathlib import Path

import pytest
from PIL import Image

from cutoutbg.pipeline import InputValidationError, remove_background, validate_bytes


def test_manifest_has_provenance_for_every_fixture():
    manifest = json.loads(Path("tests/benchmark/manifest.json").read_text())
    assert manifest["fixtures"]
    for fixture in manifest["fixtures"]:
        assert fixture["fixture_id"] and fixture["filename"] and fixture["source"]
        assert fixture["license"] and fixture["provenance_status"] and fixture["category"]


def test_output_dimensions_and_alpha():
    from cutoutbg.model import CenterContrastModel
    image = Image.new("RGB", (1600, 900), "white")
    model = CenterContrastModel()
    model.load("cpu")
    output = remove_background(image, model)
    assert output.mode == "RGBA"
    assert output.size == (1600, 900)
    assert output.getchannel("A").getextrema()[1] > 0


@pytest.mark.parametrize("data", [b"", b"not an image", b"\x89PNG\r\n\x1a\ninvalid"])
def test_invalid_input_is_actionable(data):
    with pytest.raises(InputValidationError):
        validate_bytes(data)
