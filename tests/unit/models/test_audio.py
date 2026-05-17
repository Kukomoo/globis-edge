"""
Verification plan S2.8–S2.11 — AudioTranscriber and faster-whisper wrapper.
"""

from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from globis_edge.asr import whisper_wrapper as ww
from globis_edge.asr.whisper_wrapper import RawTranscript
from globis_edge.models.audio import AudioTranscriber, TranscriptionError


@pytest.fixture(autouse=True)
def _clear_model_cache() -> None:
    ww._model_cache.clear()
    yield
    ww._model_cache.clear()


@pytest.fixture
def transcriber() -> AudioTranscriber:
    return AudioTranscriber()


# S2.8 — Model cache cleared and gc.collect after each transcribe.
def test_S2_8_unloads_model_after_transcribe(
    transcriber: AudioTranscriber, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    audio = tmp_path / "clip.wav"
    audio.write_bytes(b"RIFF")
    gc_called = False

    def _fake_gc() -> None:
        nonlocal gc_called
        gc_called = True

    monkeypatch.setattr("globis_edge.models.audio.gc.collect", _fake_gc)

    mock_result = RawTranscript(
        text="hello",
        language="en",
        duration_seconds=1.0,
        transcription_seconds=0.5,
    )
    with patch.object(ww, "transcribe", return_value=mock_result) as mock_tw:
        assert transcriber.transcribe(audio) == "hello"
        mock_tw.assert_called_once()

    assert ww._model_cache == {}
    assert gc_called


# S2.9 — FileNotFoundError for missing audio.
def test_S2_9_missing_file_raises(transcriber: AudioTranscriber) -> None:
    with pytest.raises(FileNotFoundError, match="Audio file not found"):
        transcriber.transcribe(Path("/nonexistent/audio.wav"))


# S2.10 — Hard timeout surfaces as TranscriptionError.
def test_S2_10_hard_timeout_raises(transcriber: AudioTranscriber, tmp_path: Path) -> None:
    audio = tmp_path / "clip.wav"
    audio.write_bytes(b"RIFF")

    mock_segment = MagicMock()
    mock_segment.text = "slow"
    mock_info = MagicMock(language="en", duration=30.0)
    mock_model = MagicMock()
    mock_model.transcribe.return_value = ([mock_segment], mock_info)

    with patch.object(ww, "_get_model", return_value=mock_model):
        with patch.object(ww.time, "perf_counter", side_effect=[0.0, 31.0]):
            with pytest.raises(TranscriptionError, match="exceeded hard timeout"):
                transcriber.transcribe(audio)


# S2.11 — Successful transcribe returns raw string.
def test_S2_11_transcribe_returns_raw_string(
    transcriber: AudioTranscriber, tmp_path: Path
) -> None:
    audio = tmp_path / "sample.wav"
    audio.write_bytes(b"RIFF")

    mock_segment = MagicMock()
    mock_segment.text = "Hello world"
    mock_info = MagicMock(language="fr", duration=12.5)
    mock_model = MagicMock()
    mock_model.transcribe.return_value = ([mock_segment], mock_info)

    with patch.object(ww, "_get_model", return_value=mock_model):
        assert transcriber.transcribe(audio) == "Hello world"

    mock_model.transcribe.assert_called_once_with(
        str(audio),
        beam_size=5,
        vad_filter=True,
    )
