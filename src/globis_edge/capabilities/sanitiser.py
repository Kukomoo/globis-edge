"""
ASR → LLM injection boundary (capabilities layer).

PRD §Security — controls before any ASR output reaches the Gemma prompt:
  1. Truncation: 2,048 characters maximum.
  2. Character-class filter: Latin, Arabic script, Latin Extended.
  3. Gemma delimiter and SQL-injection marker stripping (S2.6 [ADV]).
  4. Whitespace normalisation; empty output raises ValueError.

Pure Python — no ML imports.
"""

from __future__ import annotations

import re

import structlog

log = structlog.get_logger(__name__)

MAX_CHARS: int = 2_048

# Module contract + PRD allowlist (applied after truncation).
ALLOWED_CHARS_RE = re.compile(r"[^\x20-\x7E؀-ۿÀ-ž]", re.UNICODE)

# S2.6 — strip LLM structural control tokens and SQL injection fragments.
MARKER_RE = re.compile(r"<\|.*?\|>", re.UNICODE)
SQL_INJECTION_RE = re.compile(r"\bDROP\s+TABLE\b", re.IGNORECASE | re.UNICODE)


class ASRSanitiser:
    """Sanitise raw ASR text before it is passed to any model prompt."""

    @classmethod
    def sanitise(cls, raw: str) -> str:
        """
        Truncate, filter, neutralise injection markers, normalise whitespace.

        Raises
        ------
        ValueError
            If input is empty/whitespace-only or the result is empty after filtering.
        """
        if not raw or not raw.strip():
            raise ValueError("Input text is empty")

        original_length = len(raw)
        truncated = raw[:MAX_CHARS]
        was_truncated = len(raw) > MAX_CHARS

        filtered = ALLOWED_CHARS_RE.sub("", truncated)
        stripped_count = len(truncated) - len(filtered)

        clean = MARKER_RE.sub("", filtered)
        clean = SQL_INJECTION_RE.sub("", clean)
        final_output = " ".join(clean.split()).strip()

        if not final_output:
            raise ValueError("Sanitisation returned empty string")

        log.info(
            "asr.sanitise_complete",
            original_length=original_length,
            after_truncate_length=len(truncated),
            final_length=len(final_output),
            stripped_char_count=stripped_count,
            was_truncated=was_truncated,
            text_logged=False,
        )

        return final_output
