from pathlib import Path

import pytest

from cutoutbg.integrity import verify_sha256


def test_checksum_mismatch_deletes_artifact(tmp_path: Path) -> None:
    artifact = tmp_path / "model.safetensors"
    artifact.write_bytes(b"not a model")
    with pytest.raises(ValueError, match="SHA-256 mismatch"):
        verify_sha256(artifact, "0" * 64)
    assert not artifact.exists()


def test_checksum_accepts_expected_digest(tmp_path: Path) -> None:
    artifact = tmp_path / "model.safetensors"
    artifact.write_bytes(b"model")
    verify_sha256(artifact, "9372c470eeadd5ecd9c3c74c2b3cb633f8e2f2fad799250a0f70d652b6b825e4")
