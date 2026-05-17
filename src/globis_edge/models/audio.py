"""
AudioTranscriber — lazy-loaded ASR for Pi 5 (faster-whisper backend).

Returns a raw transcript string with no sanitisation; callers must run
:class:`globis_edge.capabilities.sanitiser.ASRSanitiser` immediately after.
"""

from __future__ import annotations

import gc
from pathlib import Path

import structlog

from globis_edge.asr import whisper_wrapper as ww

log = structlog.get_logger(__name__)


class TranscriptionError(RuntimeError):
    """Raised when the ASR model fails to produce a transcript."""


class AudioTranscriber:
    """Transcribe WAV audio via faster-whisper; unload model after each call."""

    def __init__(
        self,
        *,
        model_size: str = "tiny",
        device: str = "cpu",
        compute_type: str = "int8",
        beam_size: int = 5,
    ) -> None:
        self._model_size = model_size
        self._device = device
        self._compute_type = compute_type
        self._beam_size = beam_size

    def transcribe(self, wav_path: Path | str) -> str:
        """
        Transcribe ``wav_path`` and return the raw transcript string.

        The faster-whisper model is unloaded after each call so Surya OCR and
        audio models are not resident together on the Pi 5 8 GB RAM budget.
        """
        try:
            result = ww.transcribe(
                wav_path,
                model_size=self._model_size,
                device=self._device,
                compute_type=self._compute_type,
                beam_size=self._beam_size,
            )
            return result.text
        except FileNotFoundError:
            raise
        except RuntimeError as exc:
            raise TranscriptionError(str(exc)) from exc
        finally:
            ww._model_cache.clear()
            gc.collect()
            log.debug("asr.model_unloaded", model_size=self._model_size)
