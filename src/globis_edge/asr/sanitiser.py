"""
ASR → LLM injection boundary.

PRD §Security: Two controls before any ASR output reaches the Gemma prompt.
  1. Truncation: 2,048 characters maximum.
  2. Character-class filter: Latin, Arabic script, Latin Extended,
     standard punctuation and numerals.

The JSON Schema gate is downstream (auditor layer, Sprint 3).
This module is the first defence; it must not pass anything outside
the allowed character classes regardless of what faster-whisper emits.

Allowed scripts (PRD §Security + PRD §Synthetic demo scenarios):
  - Basic Latin and Latin-1 Supplement:   U+0020–U+007E, U+00A0–U+00FF
  - Latin Extended-A and -B:              U+0100–U+024F
  - Arabic:                               U+0600–U+06FF
  - Arabic Supplement:                    U+0750–U+077F
  - Arabic Extended-A:                    U+08A0–U+08FF
  - Arabic Presentation Forms:            U+FB50–U+FDFF, U+FE70–U+FEFF
  - General punctuation and digits:       covered by U+0020–U+007E

Masalit, Fur, and Zaghawa are routed to a human interpreter (PRD §Translation).
Their scripts (if any non-Arabic script is used) are stripped by this filter,
which is correct behaviour — the model should never see those tokens.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

import structlog

from globis_edge.asr.whisper_wrapper import RawTranscript

log = structlog.get_logger(__name__)

# Hard truncation limit — PRD §Security.
MAX_CHARS: int = 2_048

# Single compiled regex covering all permitted Unicode ranges.
# Anything outside these ranges is stripped before the transcript
# reaches the Gemma prompt.
_ALLOWED_PATTERN = re.compile(
    r"[^\u0020-\u007E"   # Basic Latin (printable ASCII)
    r"\u00A0-\u00FF"     # Latin-1 Supplement
    r"\u0100-\u024F"     # Latin Extended-A and -B
    r"\u0600-\u06FF"     # Arabic
    r"\u0750-\u077F"     # Arabic Supplement
    r"\u08A0-\u08FF"     # Arabic Extended-A
    r"\uFB50-\uFDFF"     # Arabic Presentation Forms-A
    r"\uFE70-\uFEFF"     # Arabic Presentation Forms-B
    r"]",
    re.UNICODE,
)


@dataclass(frozen=True)
class SanitisedTranscript:
    """
    Output of the ASR sanitiser.  Safe to pass to the Constitutional Auditor.

    Fields
    ------
    text:
        The sanitised, truncated transcript text.
    language:
        BCP-47 language tag from the ASR layer.
    was_truncated:
        True if the raw transcript exceeded MAX_CHARS.
    stripped_char_count:
        Number of characters removed by the character-class filter.
        Logged for audit purposes; never surfaced to the UI.
    original_length:
        Length of the raw transcript before any transformation.
        Used in the audit log and latency benchmark.
    """
    text: str
    language: str
    was_truncated: bool
    stripped_char_count: int
    original_length: int


def sanitise(raw: RawTranscript) -> SanitisedTranscript:
    """
    Apply the two-stage injection boundary to a RawTranscript.

    Stage 1 — Character-class filter.
    Stage 2 — Truncation to MAX_CHARS.

    The order is intentional: filter first so the truncation limit is
    applied to already-clean text, not to text that will lose characters
    afterward (which could cause the effective Gemma prompt to be shorter
    than expected and waste context budget).

    Returns a SanitisedTranscript safe for forwarding to the auditor.
    """
    original_length = len(raw.text)

    # Stage 1: strip disallowed characters.
    filtered_text = _ALLOWED_PATTERN.sub("", raw.text)
    stripped_count = original_length - len(filtered_text)

    # Stage 2: truncate.
    was_truncated = len(filtered_text) > MAX_CHARS
    final_text = filtered_text[:MAX_CHARS]

    log.info(
        "asr.sanitise_complete",
        language=raw.language,
        original_length=original_length,
        after_filter_length=len(filtered_text),
        final_length=len(final_text),
        stripped_char_count=stripped_count,
        was_truncated=was_truncated,
        # Never log the text content itself — it may contain PII.
        text_logged=False,
    )

    return SanitisedTranscript(
        text=final_text,
        language=raw.language,
        was_truncated=was_truncated,
        stripped_char_count=stripped_count,
        original_length=original_length,
    )
