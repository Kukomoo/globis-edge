"""Sprint 5 translation-service verification."""

from __future__ import annotations

from dataclasses import dataclass

from globis_edge.capabilities.translation import TranslationService
from globis_edge.models.gemma_wrapper import GemmaModelWrapper


@dataclass
class SpyGemmaWrapper(GemmaModelWrapper):
    """Test double that records whether translation inference was attempted."""

    call_count: int = 0

    def __post_init__(self) -> None:
        super().__init__()

    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        self.call_count += 1
        return super().translate(text, source_lang, target_lang)


def test_standard_french_to_english_translation_succeeds() -> None:
    service = TranslationService()

    result = service.translate(
        "Bonjour, voici le passeport soudanais de la famille.",
        "French",
        "English",
    )

    assert result.translated_text == "Hello, here is the Sudanese family passport."
    assert result.source_lang == "French"
    assert result.target_lang == "English"
    assert result.requires_human_triage is False
    assert result.triage_reason is None


def test_standard_arabic_to_english_translation_succeeds() -> None:
    service = TranslationService()

    result = service.translate(
        "هذه شهادة ميلاد سودانية للطفل.",
        "Arabic",
        "English",
    )

    assert result.translated_text == "This is a Sudanese birth certificate for the child."
    assert result.requires_human_triage is False


def test_masalit_triage_bypasses_model_execution() -> None:
    model = SpyGemmaWrapper()
    service = TranslationService(model=model)

    result = service.translate(
        "Nda tii kaanung.",
        "Masalit",
        "English",
    )

    assert result.translated_text == "Nda tii kaanung."
    assert result.requires_human_triage is True
    assert "Professional human interpreter required for Masalit" in result.triage_reason
    assert model.call_count == 0
    assert model.is_loaded is False


def test_fur_source_language_requires_human_triage() -> None:
    model = SpyGemmaWrapper()
    service = TranslationService(model=model)

    result = service.translate(
        "Aba koro tokko.",
        "Fur",
        "English",
    )

    assert result.requires_human_triage is True
    assert "Fur" in result.triage_reason
    assert model.call_count == 0
    assert model.is_loaded is False


def test_zaghawa_target_language_requires_human_triage() -> None:
    model = SpyGemmaWrapper()
    service = TranslationService(model=model)

    result = service.translate(
        "This family presented a Sudanese passport at the eastern border.",
        "English",
        "Zaghawa",
    )

    assert result.requires_human_triage is True
    assert "Zaghawa" in result.triage_reason
    assert model.call_count == 0
    assert model.is_loaded is False
