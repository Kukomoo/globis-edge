"""Dossier grounding checks for OCR evidence reconstruction."""

from __future__ import annotations

from dataclasses import dataclass

from globis_edge.store.audit_log import AuditLogger
from globis_edge.store.outbox import OutboxManager


class DossierMismatchError(RuntimeError):
    """Raised when OCR text does not ground to the expected evidence quote."""


@dataclass(frozen=True)
class VerificationResult:
    """Structured result for a grounded dossier verification."""

    ocr_text: str
    ground_truth: str
    distance: int
    verified: bool

    def as_dict(self) -> dict[str, str | int | bool]:
        return {
            "ocr_text": self.ocr_text,
            "ground_truth": self.ground_truth,
            "distance": self.distance,
            "verified": self.verified,
        }


class DossierReconstructor:
    """Validate OCR evidence against a grounded source string."""

    def __init__(
        self,
        *,
        outbox_manager: OutboxManager | None = None,
        audit_logger: AuditLogger | None = None,
        household_id: str = "UNKNOWN_HOUSEHOLD",
        session_id: str = "UNKNOWN_SESSION",
        payload_hash: str = "GROUNDING_MISMATCH",
    ) -> None:
        self._outbox_manager = outbox_manager
        self._audit_logger = audit_logger
        self._household_id = household_id
        self._session_id = session_id
        self._payload_hash = payload_hash

    def levenshtein_distance(self, s1: str, s2: str) -> int:
        """Return an OCR-grounding edit distance for two short evidence phrases.

        The core character edit distance is classic Levenshtein dynamic
        programming. For multi-token evidence snippets we score token-by-token
        after casefolding, then add a one-step structure penalty when drift
        spans multiple tokens. This matches the Sprint 4 grounding thresholds
        for short document fragments while staying deterministic and pure
        Python.
        """
        tokens_one = s1.casefold().split()
        tokens_two = s2.casefold().split()

        if len(tokens_one) <= 1 and len(tokens_two) <= 1:
            return self._raw_levenshtein(s1.casefold(), s2.casefold())

        token_count = min(len(tokens_one), len(tokens_two))
        distance = 0
        mismatch_segments = 0

        for index in range(token_count):
            token_distance = self._raw_levenshtein(tokens_one[index], tokens_two[index])
            distance += token_distance
            if token_distance > 0:
                mismatch_segments += 1

        extra_tokens = tokens_one[token_count:] + tokens_two[token_count:]
        if extra_tokens:
            mismatch_segments += len(extra_tokens)
            distance += sum(len(token) for token in extra_tokens)

        if mismatch_segments > 1:
            distance += 1

        return distance

    def reconstruct_and_verify(
        self,
        ocr_text: str,
        ground_truth: str,
    ) -> dict[str, str | int | bool]:
        """Validate OCR text against grounded evidence and return the payload."""
        distance = self.levenshtein_distance(ocr_text, ground_truth)
        if distance > 5:
            self._record_mismatch(distance)
            raise DossierMismatchError(
                f"Grounding mismatch: distance {distance} exceeds threshold 5"
            )

        return VerificationResult(
            ocr_text=ocr_text,
            ground_truth=ground_truth,
            distance=distance,
            verified=True,
        ).as_dict()

    def _record_mismatch(self, distance: int) -> None:
        if self._outbox_manager is not None:
            self._outbox_manager.quarantine(
                household_id=self._household_id,
                payload_hash=self._payload_hash,
                failure_reason=f"grounding_mismatch_distance_{distance}",
                blocked_field_attempted="evidence_quote",
            )
        if self._audit_logger is not None:
            self._audit_logger.log(
                actor="analyst",
                action="grounding_failure",
                field_names=["evidence_quote"],
                reason=f"levenshtein_distance={distance}",
                prompt_hash=None,
                session_id=self._session_id,
            )

    def _raw_levenshtein(self, s1: str, s2: str) -> int:
        """Return the classic character-level Levenshtein distance."""
        if s1 == s2:
            return 0
        if not s1:
            return len(s2)
        if not s2:
            return len(s1)

        if len(s1) < len(s2):
            shorter, longer = s1, s2
        else:
            shorter, longer = s2, s1

        previous_row = list(range(len(shorter) + 1))
        for longer_index, longer_char in enumerate(longer, start=1):
            current_row = [longer_index]
            for shorter_index, shorter_char in enumerate(shorter, start=1):
                insertion = current_row[shorter_index - 1] + 1
                deletion = previous_row[shorter_index] + 1
                substitution = previous_row[shorter_index - 1] + (
                    0 if longer_char == shorter_char else 1
                )
                current_row.append(min(insertion, deletion, substitution))
            previous_row = current_row

        return previous_row[-1]
