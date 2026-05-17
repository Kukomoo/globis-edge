"""Offline translation service with low-resource dialect triage safeguards."""

from __future__ import annotations

from dataclasses import dataclass

from globis_edge.models.gemma_wrapper import GemmaModelWrapper

_LOW_RESOURCE_DIALECTS = frozenset({"masalit", "fur", "zaghawa"})


@dataclass(frozen=True)
class TranslationResult:
    """Result returned to callers after translation or human-triage routing."""

    translated_text: str
    source_lang: str
    target_lang: str
    requires_human_triage: bool
    triage_reason: str | None


class TranslationService:
    """Translate supported offline languages and triage low-resource dialects."""

    def __init__(self, model: GemmaModelWrapper | None = None) -> None:
        self._model = model if model is not None else GemmaModelWrapper()

    def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
    ) -> TranslationResult:
        """Translate text or return a deterministic human-triage signal."""
        source = source_lang.strip()
        target = target_lang.strip()

        triage_language = self._triage_language(source, target)
        if triage_language is not None:
            return TranslationResult(
                translated_text=text,
                source_lang=source,
                target_lang=target,
                requires_human_triage=True,
                triage_reason=(
                    "Professional human interpreter required for "
                    f"{triage_language} to protect caseworker accuracy and refugee dignity."
                ),
            )

        translated_text = self._model.translate(text, source, target)
        return TranslationResult(
            translated_text=translated_text,
            source_lang=source,
            target_lang=target,
            requires_human_triage=False,
            triage_reason=None,
        )

    def _triage_language(self, source_lang: str, target_lang: str) -> str | None:
        source = source_lang.casefold()
        target = target_lang.casefold()

        if source in _LOW_RESOURCE_DIALECTS:
            return source_lang
        if target in _LOW_RESOURCE_DIALECTS:
            return target_lang
        return None
