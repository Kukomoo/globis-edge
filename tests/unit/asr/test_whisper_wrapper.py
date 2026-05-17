"""
Verification cases S2.9–S2.11 for the Whisper wrapper.

faster-whisper is mocked throughout — these tests verify the wrapper's
contract (file-not-found, hard timeout, structlog emission) without
requiring a model download or GPU.
"""

from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from globis_edge.asr import whisper_wrapper as ww
from globis_edge.asr.whisper_wrapper import RawTranscript, transcribe


@pytest.fixture(autouse=True)
def _clear_model_cache() -> None:
    ww._model_cache.clear()
    yield
    ww._model_cache.clear()


# S2.9 — FileNotFoundError raised for missing audio file.
def test_missing_file_raises():
    with pytest.raises(FileNotFoundError, match="Audio file not found"):
        transcribe(Path("/nonexistent/audio.wav"))


# S2.10 — RuntimeError raised when transcription exceeds the 30 s hard timeout.
def test_hard_timeout_raises(tmp_path: Path):
    audio = tmp_path / "clip.wav"
    audio.write_bytes(b"RIFF")

    mock_segment = MagicMock()
    mock_segment.text = "slow"

    mock_info = MagicMock()
    mock_info.language = "en"
    mock_info.duration = 30.0

    mock_model = MagicMock()
    mock_model.transcribe.return_value = ([mock_segment], mock_info)

    with patch.object(ww, "_get_model", return_value=mock_model):
        with patch.object(ww.time, "perf_counter", side_effect=[0.0, 31.0]):
            with pytest.raises(RuntimeError, match="exceeded hard timeout"):
                transcribe(audio)


# S2.11 — Successful transcription returns RawTranscript and logs asr.transcribe_complete.
def test_transcribe_success_returns_raw_transcript_and_logs(tmp_path: Path):
    audio = tmp_path / "sample.wav"
    audio.write_bytes(b"RIFF")

    mock_segment = MagicMock()
    mock_segment.text = "Hello world"

    mock_info = MagicMock()
    mock_info.language = "fr"
    mock_info.duration = 12.5

    mock_model = MagicMock()
    mock_model.transcribe.return_value = ([mock_segment], mock_info)

    with patch.object(ww, "_get_model", return_value=mock_model):
        with patch.object(ww, "log") as mock_log:
            result = transcribe(audio)

    assert isinstance(result, RawTranscript)
    assert result.text == "Hello world"
    assert result.language == "fr"
    assert result.duration_seconds == 12.5
    assert result.transcription_seconds >= 0.0

    mock_model.transcribe.assert_called_once_with(
        str(audio),
        beam_size=5,
        vad_filter=True,
    )

    mock_log.info.assert_called_once()
    event, kwargs = mock_log.info.call_args[0][0], mock_log.info.call_args[1]
    assert event == "asr.transcribe_complete"
    assert kwargs["audio_file"] == "sample.wav"
    assert kwargs["detected_language"] == "fr"
    assert kwargs["duration_seconds"] == 12.5
    assert "transcription_seconds" in kwargs
    assert "within_budget" in kwargs
