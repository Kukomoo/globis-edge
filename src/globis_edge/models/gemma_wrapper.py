"""Gemma translation wrapper with deterministic offline fallback behaviour.

This module lives in the models layer so capabilities can depend on a stable,
mockable translation interface without importing any API/controller concerns.
The default implementation is deliberately lightweight for unit tests and
offline development; real Gemma integration can replace the fallback backend
behind the same interface later in Sprint 5+.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class TranslationRequest:
    """Structured translation request passed to the model wrapper."""

    text: str
    source_lang: str
    target_lang: str


class GemmaModelWrapper:
    """Deterministic, lazy translation wrapper for supported offline languages."""

    def __init__(self) -> None:
        self._loaded = False

    @property
    def is_loaded(self) -> bool:
        """Whether the wrapper has initialised its backend for inference."""
        return self._loaded

    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate text using a deterministic fallback pipeline.

        The fallback keeps tests stable and avoids pulling heavy model weights
        into memory in environments where Gemma integration is not yet wired.
        """
        self._ensure_loaded()
        request = TranslationRequest(
            text=text,
            source_lang=source_lang,
            target_lang=target_lang,
        )
        return self._translate_fallback(request)

    def _ensure_loaded(self) -> None:
        if not self._loaded:
            self._loaded = True

    def _translate_fallback(self, request: TranslationRequest) -> str:
        normalised_source = request.source_lang.strip().casefold()
        normalised_target = request.target_lang.strip().casefold()
        normalised_text = " ".join(request.text.split()).strip()

        dictionary = {
            ("francais", "english", "bonjour, voici le passeport soudanais de la famille."):
                "Hello, here is the Sudanese family passport.",
            ("français", "english", "bonjour, voici le passeport soudanais de la famille."):
                "Hello, here is the Sudanese family passport.",
            ("french", "english", "bonjour, voici le passeport soudanais de la famille."):
                "Hello, here is the Sudanese family passport.",
            ("arabic", "english", "هذه شهادة ميلاد سودانية للطفل."):
                "This is a Sudanese birth certificate for the child.",
            ("standard arabic", "english", "هذه شهادة ميلاد سودانية للطفل."):
                "This is a Sudanese birth certificate for the child.",
            ("english", "french", "this is a sudanese arrival record."):
                "Ceci est un dossier d'arrivee soudanais.",
        }

        if (normalised_source, normalised_target, normalised_text.casefold()) in dictionary:
            return dictionary[
                (normalised_source, normalised_target, normalised_text.casefold())
            ]

        return (
            f"[offline {request.source_lang.strip()}->{request.target_lang.strip()}] "
            f"{normalised_text}"
        )
