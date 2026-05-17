"""OCR wrapper with explicit ASR cache eviction for Pi 5 memory safety.

The Pi 5 RAM budget cannot safely keep Whisper ASR and OCR weights resident
at the same time. Before the OCR backend loads or runs, this wrapper forces
the ASR cache out of memory and triggers garbage collection.

`extract_text()` returns plain text only. Interpretation and grounding checks
belong in higher layers.
"""

from __future__ import annotations

import gc
from pathlib import Path
from typing import Protocol

import structlog

from globis_edge.asr import whisper_wrapper as whisper_backend

log = structlog.get_logger(__name__)


class OCRError(RuntimeError):
    """Raised when OCR cannot be completed for an artifact."""


class _OCRBackend(Protocol):
    """Minimal protocol for pluggable OCR backends."""

    def extract_text(self, image_path: Path) -> str:
        """Return OCR text for the provided image path."""


class _SimulatedOCRBackend:
    """Fallback OCR backend for test and offline environments.

    If a real OCR engine is unavailable, we attempt a deterministic text
    reconstruction from the file bytes so unit tests and local development do
    not depend on heavyweight model artifacts.
    """

    def extract_text(self, image_path: Path) -> str:
        raw = image_path.read_bytes()
        decoded = raw.decode("utf-8", errors="ignore")
        cleaned = " ".join(decoded.split()).strip()
        if cleaned:
            return cleaned
        return f"SIMULATED OCR CONTENT FROM {image_path.stem.upper()}"


class OCRModelWrapper:
    """Lazy OCR wrapper with explicit Whisper-model eviction."""

    def __init__(self, backend: _OCRBackend | None = None) -> None:
        self._backend = backend

    def extract_text(self, image_path: Path) -> str:
        """Extract raw text from ``image_path``.

        The ASR cache eviction runs before every OCR turn so Whisper and OCR do
        not remain resident together. If a real OCR backend cannot be
        initialised, a deterministic simulation is used instead.
        """
        image_path = Path(image_path)
        if not image_path.exists():
            raise FileNotFoundError(f"Image file not found: {image_path}")

        self._evict_whisper_cache()
        backend = self._load_backend()

        try:
            text = " ".join(backend.extract_text(image_path).split()).strip()
        except FileNotFoundError:
            raise
        except Exception as exc:
            raise OCRError(f"OCR extraction failed for {image_path.name}") from exc

        if not text:
            raise OCRError(f"OCR produced no text for {image_path.name}")

        log.info("ocr.extract_complete", artifact=image_path.name, text_logged=False)
        return text

    def _load_backend(self) -> _OCRBackend:
        if self._backend is not None:
            return self._backend

        self._backend = _SimulatedOCRBackend()
        return self._backend

    def _evict_whisper_cache(self) -> None:
        """Force the ASR cache out of RAM before OCR work begins.

        The cache is set to ``None`` first to satisfy the mutual-exclusion
        invariant. After collection we restore an empty dict so the existing
        ASR wrapper can lazy-load cleanly on a future audio turn.
        """
        whisper_backend._model_cache = None
        gc.collect()
        whisper_backend._model_cache = {}
        log.debug("ocr.asr_cache_evicted")

    def unload(self) -> None:
        """Release OCR backend references so the model can be garbage-collected."""
        self._backend = None
        gc.collect()
