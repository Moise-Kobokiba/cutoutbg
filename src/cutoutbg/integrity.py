from __future__ import annotations

import hashlib
from pathlib import Path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_sha256(path: Path, expected: str) -> None:
    actual = sha256(path)
    if actual.lower() != expected.lower():
        path.unlink(missing_ok=True)
        raise ValueError(f"SHA-256 mismatch for {path.name}: expected {expected}, got {actual}")
