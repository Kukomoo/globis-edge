"""Verification coverage for OCRModelWrapper memory-isolation behaviour."""

from __future__ import annotations

from pathlib import Path

import pytest

from globis_edge.asr import whisper_wrapper as ww
from globis_edge.models.ocr import OCRModelWrapper


class StubOCRBackend:
    def __init__(self) -> None:
        self.calls = 0

    def extract_text(self, image_path: Path) -> str:
        self.calls += 1
        return "Sudan Passport"


@pytest.fixture(autouse=True)
def _reset_whisper_cache() -> None:
    ww._model_cache = {}
    yield
    ww._model_cache = {}


def test_ocr_wrapper_evicts_whisper_cache_before_extract(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    image = tmp_path / "passport.png"
    image.write_bytes(b"synthetic image bytes")

    backend = StubOCRBackend()
    wrapper = OCRModelWrapper(backend=backend)
    cache_state_during_gc: list[object] = []

    def _fake_gc() -> int:
        cache_state_during_gc.append(ww._model_cache)
        return 0

    monkeypatch.setattr("globis_edge.models.ocr.gc.collect", _fake_gc)
    ww._model_cache = {"tiny:cpu:int8": object()}

    assert wrapper.extract_text(image) == "Sudan Passport"
    assert backend.calls == 1
    assert cache_state_during_gc == [None]
    assert ww._model_cache == {}


def test_ocr_wrapper_missing_file_raises(tmp_path: Path) -> None:
    wrapper = OCRModelWrapper()
    with pytest.raises(FileNotFoundError, match="Image file not found"):
        wrapper.extract_text(tmp_path / "missing.png")


def test_ocr_wrapper_simulated_backend_reads_utf8_payload(tmp_path: Path) -> None:
    image = tmp_path / "artifact.png"
    image.write_bytes("SYNTHETIC SCENARIO Sudan Passport".encode("utf-8"))

    wrapper = OCRModelWrapper()
    assert wrapper.extract_text(image) == "SYNTHETIC SCENARIO Sudan Passport"
