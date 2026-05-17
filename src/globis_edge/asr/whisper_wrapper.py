"""
ASR wrapper using faster-whisper.

Accepts a file path to a .wav or .m4a audio file.
Returns a raw transcript string.

Latency budget (PRD §Performance): 12 s p95 for a 30-second clip on Pi 5.
faster-whisper on ARM typically delivers 6–8 s for that clip, giving
adequate headroom before the sanitiser and auditor run.

Model choice: "tiny" for hackathon demo (fits 8 GB RAM budget alongside
E4B + Surya; see PRD §RAM budget). Caseworker-configurable via config.yaml.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from pathlib import Path

import structlog

log = structlog.get_logger(__name__)

# faster-whisper is imported lazily so the module loads in test environments
# that mock the model, without requiring a full model download.
_model_cache: dict[str, object] = {}


def _get_model(model_size: str, device: str, compute_type: str) -> object:
    """Load and cache the faster-whisper model. Thread-safe for single-process use."""
    cache_key = f"{model_size}:{device}:{compute_type}"
    if cache_key not in _model_cache:
        from faster_whisper import WhisperModel  # type: ignore
        log.info("asr.model_load", model_size=model_size, device=device)
        _model_cache[cache_key] = WhisperModel(
            model_size,
            device=device,
            compute_type=compute_type,
        )
    return _model_cache[cache_key]


@dataclass(frozen=True)
class RawTranscript:
    """Raw output from the ASR layer before sanitisation."""
    text: str
    language: str          # BCP-47 detected language tag, e.g. "ar", "fr", "de"
    duration_seconds: float
    transcription_seconds: float  # wall-clock time for latency tracking


def transcribe(
    audio_path: Path | str,
    *,
    model_size: str = "tiny",
    device: str = "cpu",
    compute_type: str = "int8",
    beam_size: int = 5,
) -> RawTranscript:
    """
    Transcribe an audio file and return a RawTranscript.

    Parameters
    ----------
    audio_path:
        Path to the audio file (.wav, .m4a, .mp3).  Must exist.
    model_size:
        faster-whisper model size.  "tiny" fits the Pi 5 RAM budget.
        "base" is the upgrade path when audio accuracy matters more.
    device:
        "cpu" on Pi 5 (no CUDA).  "cuda" for GPU-accelerated environments.
    compute_type:
        "int8" minimises RAM on ARM.  "float16" on GPU.
    beam_size:
        Beam search width.  5 is the faster-whisper default.

    Raises
    ------
    FileNotFoundError:
        If audio_path does not exist.
    RuntimeError:
        If transcription wall time exceeds 30 s (hard timeout guard, not a
        soft budget warning — the soft budget is 12 s p95 per PRD).
    """
    audio_path = Path(audio_path)
    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    model = _get_model(model_size, device, compute_type)

    t_start = time.perf_counter()
    segments, info = model.transcribe(  # type: ignore[attr-defined]
        str(audio_path),
        beam_size=beam_size,
        vad_filter=True,  # skip silent regions; reduces hallucination on short clips
    )

    # Materialise the generator — faster-whisper yields lazily.
    text_parts: list[str] = [segment.text for segment in segments]
    t_end = time.perf_counter()

    elapsed = t_end - t_start

    if elapsed > 30.0:
        raise RuntimeError(
            f"Transcription exceeded hard timeout: {elapsed:.1f} s "
            f"for {audio_path.name}"
        )

    transcript_text = " ".join(text_parts).strip()
    duration = getattr(info, "duration", 0.0)

    log.info(
        "asr.transcribe_complete",
        audio_file=audio_path.name,
        detected_language=info.language,
        duration_seconds=round(duration, 2),
        transcription_seconds=round(elapsed, 3),
        within_budget=elapsed <= 12.0,
    )

    return RawTranscript(
        text=transcript_text,
        language=info.language,
        duration_seconds=duration,
        transcription_seconds=elapsed,
    )
