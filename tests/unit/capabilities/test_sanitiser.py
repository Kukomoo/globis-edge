"""
Verification plan S2.1–S2.7 for ASRSanitiser (capabilities layer).
"""

from __future__ import annotations

import importlib
import sys
from pathlib import Path

import pytest

from globis_edge.capabilities.sanitiser import ASRSanitiser, MAX_CHARS


# S2.1 — Clean ASCII passes through unchanged.
def test_s2_1_ascii_unchanged() -> None:
    text = "The quick brown fox jumps over the lazy dog."
    assert ASRSanitiser.sanitise(text) == text


def test_clean_ascii_unchanged() -> None:
    text = "My name is Aisha. I arrived on 12 March."
    assert ASRSanitiser.sanitise(text) == text


# S2.2 — Strips disallowed characters; leaves valid Latin.
def test_S2_2_strips_disallowed_characters() -> None:
    assert ASRSanitiser.sanitise("A\x00🛑中") == "A"


# S2.3 — Preserves Arabic script.
def test_s2_2_arabic_preserved() -> None:
    arabic_text = "العربية لغة جميلة"
    assert ASRSanitiser.sanitise(arabic_text) == arabic_text


def test_S2_3_preserves_arabic() -> None:
    arabic = "اسم عائشة"
    assert ASRSanitiser.sanitise(arabic) == arabic


# S2.3 — French accented characters preserved.
def test_s2_3_french_preserved() -> None:
    french_text = "Éléphant près de la forêt"
    assert ASRSanitiser.sanitise(french_text) == french_text


def test_french_accented_passes() -> None:
    french = "Je m'appelle Hawa. J'ai fui la République centrafricaine."
    assert ASRSanitiser.sanitise(french) == french


# S2.4 — CJK and emoji stripped.
def test_s2_4_cjk_and_emojis_stripped() -> None:
    assert ASRSanitiser.sanitise("Hello 世界 🌍") == "Hello"


# S2.4 — Idempotent.
def test_S2_4_idempotent() -> None:
    samples = [
        "Hello 中 world",
        "Je m'appelle Hawa. J'ai fui la République centrafricaine.",
        "اسمي يوسف",
        "a" * 3_000,
    ]
    for sample in samples:
        once = ASRSanitiser.sanitise(sample)
        twice = ASRSanitiser.sanitise(once)
        assert twice == once


# S2.5 — Control characters removed.
def test_s2_5_control_characters_removed() -> None:
    assert ASRSanitiser.sanitise("Line\x00One\x0bTwo") == "LineOneTwo"


# S2.5 — Empty / emoji-only output raises ValueError [ADV].
def test_S2_5_empty_output_raises() -> None:
    with pytest.raises(ValueError, match="empty"):
        ASRSanitiser.sanitise("🛑中")


def test_empty_string_raises_value_error() -> None:
    with pytest.raises(ValueError, match="Input text is empty"):
        ASRSanitiser.sanitise("   ")


# S2.6 — covered in tests/adversarial/test_asr_injection.py.


# S2.7 — Truncation at 2,048 characters.
def test_s2_7_truncation_limits() -> None:
    assert len(ASRSanitiser.sanitise("a" * 3_000)) == MAX_CHARS


def test_exact_max_chars_not_truncated() -> None:
    text = "b" * MAX_CHARS
    assert len(ASRSanitiser.sanitise(text)) == MAX_CHARS


# S2.7 — Zero ML imports [ADV].
def test_S2_7_no_ml_imports() -> None:
    root = Path(__file__).resolve().parents[3]
    text = (root / "src/globis_edge/capabilities/sanitiser.py").read_text(encoding="utf-8")
    for forbidden in ("transformers", "llama_cpp", "faster_whisper", "torch"):
        assert forbidden not in text
    importlib.import_module("globis_edge.capabilities.sanitiser")
    assert "globis_edge.capabilities.sanitiser" in sys.modules
