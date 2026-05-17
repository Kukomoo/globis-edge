"""
rules.py — Constitutional Auditor Rule Pass with blocked-field logging fix.

Constitution articles enforced
------------------------------
Article 1  — Minimum dataset: all seven IER core elements must be present.
Article 3  — Prohibited fields: identity-sensitive categories are banned.
Article 4  — No risk scoring: automated eligibility/fraud scores are banned.
Article 7  — Local by default: records must not reference external URIs or
              contain fields that imply cloud routing.

Blocked-field logging fix
-------------------------
The original implementation logged the *value* of blocked fields in the
audit trail, which itself constituted a data protection violation.

The fix: ``AuditResult.blocked_field_names`` contains only the field
*names* (e.g. ``"political_affiliation"``), never the submitted values.
``log_blocked_attempt`` explicitly sets ``value_logged=False`` in every
structlog emission and includes a ``blocked_field_names`` list (not values)
so the caseworker UI chip can display which categories were blocked.
"""

from __future__ import annotations

import dataclasses
import json
from dataclasses import dataclass, field
from typing import Any

import structlog

from globis_edge.store.audit_log import AuditLogger

# ---------------------------------------------------------------------------
# Field-set constants
# ---------------------------------------------------------------------------

PROHIBITED_FIELDS: frozenset[str] = frozenset(
    {
        "political_affiliation",
        "religion",
        "sexual_orientation",
        "ethnicity",
    }
)
"""Fields that are unconditionally banned from any record (Article 3)."""

SCORE_FIELDS: frozenset[str] = frozenset(
    {
        "eligibility_score",
        "credibility_score",
        "fraud_risk",
        "status_prediction",
    }
)
"""Automated risk/scoring fields forbidden by Article 4."""

ALLOWED_IER_FIELDS: frozenset[str] = frozenset(
    {
        "name",
        "date_of_birth",
        "sex",
        "nationality",
        "place_of_origin",
        "date_of_arrival",
        "group_id",
    }
)
"""The seven core IER elements required by Article 1."""

SYSTEM_FIELDS: frozenset[str] = frozenset(
    {
        "specific_needs",
        "auditor",
        "dignity_loop",
        "explainer",
        "provenance",
        "session_id",
        "caseworker_justification",
    }
)
"""Housekeeping fields that are always permitted alongside IER fields."""

# ---------------------------------------------------------------------------
# AuditResult dataclass
# ---------------------------------------------------------------------------


@dataclass
class AuditResult:
    """Result of a single constitutional rule pass.

    Designed to be directly JSON-serialisable so it can be forwarded to
    the Scout UI as-is. When ``requires_caseworker_review_chip`` is
    ``True``, the UI reads ``blocked_field_names`` to populate the
    caseworker chip (e.g. "A sensitive field was blocked:
    political_affiliation") without ever exposing the submitted value.

    Attributes:
        violated: ``True`` when at least one article is violated.
        reason: Human-readable description of the first (or combined)
            violation. ``None`` when clean.
        violated_article: The article identifier that was violated first,
            e.g. ``"article_3"``. ``None`` when clean.
        blocked_field_names: List of field *names* that triggered a block.
            Never contains field *values*. May be empty even when
            ``violated`` is ``True`` (e.g. for minimum-dataset failures
            where there are no values to block).
        requires_caseworker_review_chip: ``True`` when the UI must display
            the review chip to the caseworker.
        value_logged: Always ``False``. Present to make the contract
            explicit: the auditor never records submitted field values.
    """

    violated: bool
    reason: str | None
    violated_article: str | None
    blocked_field_names: list[str]
    requires_caseworker_review_chip: bool
    value_logged: bool = field(default=False)

    def to_dict(self) -> dict[str, Any]:
        """Return a JSON-serialisable dict representation."""
        return dataclasses.asdict(self)

    def to_json(self) -> str:
        """Return a compact JSON string representation."""
        return json.dumps(self.to_dict(), ensure_ascii=False)

    @classmethod
    def clean(cls) -> AuditResult:
        """Factory: return a clean (no-violation) result."""
        return cls(
            violated=False,
            reason=None,
            violated_article=None,
            blocked_field_names=[],
            requires_caseworker_review_chip=False,
            value_logged=False,
        )


# ---------------------------------------------------------------------------
# RuleAuditor
# ---------------------------------------------------------------------------


class RuleAuditor:
    """Constitutional auditor that runs all article checks against a record.

    All checks are defensive: they accumulate *all* violations across
    articles before returning so the caseworker sees the complete picture
    in a single pass rather than one error at a time.

    Usage::

        auditor = RuleAuditor()
        result = auditor.check(record)
        if result.violated:
            auditor.log_blocked_attempt(result, session_id, prompt_hash)
    """

    def __init__(self) -> None:
        self._log = structlog.get_logger(__name__)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def check(self, record: dict[str, Any]) -> AuditResult:
        """Run all four article checks and return a combined AuditResult.

        All checks execute regardless of whether an earlier one failed.
        ``blocked_field_names`` is the union of blocked names from every
        violated article. The ``violated_article`` field reflects the
        *first* article violated (Article 1 → 3 → 4 → 7).

        The returned ``AuditResult`` is JSON-serialisable and can be sent
        directly to the Scout UI. When ``requires_caseworker_review_chip``
        is ``True``, the UI chip reads ``blocked_field_names`` to display
        which field categories were blocked — without exposing any values.

        Args:
            record: The candidate IER record dict. Keys are field names;
                values are the submitted data.

        Returns:
            A fully populated :class:`AuditResult`.
        """
        checks = [
            self._check_article_1_minimum_dataset(record),
            self._check_article_3_prohibited_fields(record),
            self._check_article_4_no_risk_scoring(record),
            self._check_article_7_local_by_default(record),
        ]

        violations = [r for r in checks if r is not None]

        if not violations:
            return AuditResult.clean()

        # Aggregate all blocked field names from every violated article.
        all_blocked: list[str] = []
        for v in violations:
            for name in v.blocked_field_names:
                if name not in all_blocked:
                    all_blocked.append(name)

        # Use the first violation as the primary reason / article reference.
        primary = violations[0]

        return AuditResult(
            violated=True,
            reason=primary.reason,
            violated_article=primary.violated_article,
            blocked_field_names=all_blocked,
            requires_caseworker_review_chip=True,
            value_logged=False,
        )

    # ------------------------------------------------------------------
    # Individual article checks
    # ------------------------------------------------------------------

    def _check_article_1_minimum_dataset(
        self, record: dict[str, Any]
    ) -> AuditResult | None:
        """Article 1 — Minimum dataset.

        All seven IER core elements (``ALLOWED_IER_FIELDS``) must be
        present as top-level keys in the record. A missing element is a
        data-completeness violation, not a privacy violation, so
        ``blocked_field_names`` lists the absent field names (they were
        never submitted, so naming them is safe).

        Args:
            record: The candidate record dict.

        Returns:
            An :class:`AuditResult` if the article is violated,
            ``None`` otherwise.
        """
        missing = sorted(ALLOWED_IER_FIELDS - set(record.keys()))
        if not missing:
            return None

        missing_readable = ", ".join(missing)
        return AuditResult(
            violated=True,
            reason=(
                f"Article 1 violation: required IER fields are absent: {missing_readable}"
            ),
            violated_article="article_1",
            blocked_field_names=missing,  # safe: these fields were not submitted
            requires_caseworker_review_chip=True,
            value_logged=False,
        )

    def _check_article_3_prohibited_fields(
        self, record: dict[str, Any]
    ) -> AuditResult | None:
        """Article 3 — Prohibited fields.

        Any field in ``PROHIBITED_FIELDS`` is unconditionally rejected.
        Only the field *name* is collected; the submitted value is
        deliberately discarded and never logged.

        Prohibited categories: political affiliation, religion, sexual
        orientation, ethnicity.

        Args:
            record: The candidate record dict.

        Returns:
            An :class:`AuditResult` if the article is violated,
            ``None`` otherwise.
        """
        found = sorted(PROHIBITED_FIELDS & set(record.keys()))
        if not found:
            return None

        found_readable = ", ".join(found)
        return AuditResult(
            violated=True,
            reason=(
                f"Article 3 violation: prohibited identity-sensitive field(s) "
                f"detected: {found_readable}. Values were NOT logged."
            ),
            violated_article="article_3",
            blocked_field_names=found,
            requires_caseworker_review_chip=True,
            value_logged=False,
        )

    def _check_article_4_no_risk_scoring(
        self, record: dict[str, Any]
    ) -> AuditResult | None:
        """Article 4 — No automated risk scoring.

        Automated eligibility, credibility, or fraud scores are forbidden.
        The prohibition covers any field whose *name* appears in
        ``SCORE_FIELDS``, regardless of its value.

        Args:
            record: The candidate record dict.

        Returns:
            An :class:`AuditResult` if the article is violated,
            ``None`` otherwise.
        """
        found = sorted(SCORE_FIELDS & set(record.keys()))
        if not found:
            return None

        found_readable = ", ".join(found)
        return AuditResult(
            violated=True,
            reason=(
                f"Article 4 violation: automated risk/scoring field(s) "
                f"detected: {found_readable}. Automated scoring of asylum "
                f"claimants is unconditionally prohibited."
            ),
            violated_article="article_4",
            blocked_field_names=found,
            requires_caseworker_review_chip=True,
            value_logged=False,
        )

    def _check_article_7_local_by_default(
        self, record: dict[str, Any]
    ) -> AuditResult | None:
        """Article 7 — Local by default.

        Records must not contain fields or values that imply external
        routing (e.g. HTTP/HTTPS URIs outside the local 192.168.x.x
        subnet, or a ``remote_sync_endpoint`` field). The check scans
        field *names* for known cloud-routing indicators and string
        *values* for external URI patterns without logging the values.

        Blocked field names that hint at remote routing: any key whose
        name contains ``remote``, ``cloud``, ``upload_url``, or
        ``sync_endpoint``.

        Args:
            record: The candidate record dict.

        Returns:
            An :class:`AuditResult` if the article is violated,
            ``None`` otherwise.
        """
        import re

        # Patterns that indicate a field name implies external routing.
        _ROUTING_NAME_PATTERN = re.compile(
            r"(remote|cloud|upload_url|sync_endpoint)", re.IGNORECASE
        )

        # Pattern that catches external HTTP(S) URIs in string values.
        # Local addresses (192.168.x.x, 10.x.x.x, 127.x.x.x) are allowed.
        _EXTERNAL_URI_PATTERN = re.compile(
            r"https?://(?!(?:192\.168\.|10\.|127\.))\S+", re.IGNORECASE
        )

        suspicious_field_names: list[str] = []

        for key, value in record.items():
            # Check field name for routing hints.
            if _ROUTING_NAME_PATTERN.search(key):
                suspicious_field_names.append(key)
                continue  # already flagged; don't double-count

            # Check string values for external URIs (we flag the field
            # name only — the value itself is not recorded).
            if isinstance(value, str) and _EXTERNAL_URI_PATTERN.search(value):
                suspicious_field_names.append(key)

        if not suspicious_field_names:
            return None

        suspicious_field_names = sorted(set(suspicious_field_names))
        readable = ", ".join(suspicious_field_names)
        return AuditResult(
            violated=True,
            reason=(
                f"Article 7 violation: field(s) implying external routing "
                f"detected: {readable}. All data must remain local. "
                f"Values were NOT logged."
            ),
            violated_article="article_7",
            blocked_field_names=suspicious_field_names,
            requires_caseworker_review_chip=True,
            value_logged=False,
        )

    # ------------------------------------------------------------------
    # Structured audit logging
    # ------------------------------------------------------------------

    def log_blocked_attempt(
        self,
        audit_result: AuditResult,
        session_id: str,
        prompt_hash: str,
        audit_logger: AuditLogger | None = None,
    ) -> None:
        """Emit structlog and optionally persist a field-names-only audit row.

        Args:
            audit_result: The result returned by :meth:`check`. Must have
                ``violated=True``; calling this on a clean result is a no-op.
            session_id: Active caseworker session identifier.
            prompt_hash: SHA-256 fingerprint of the prompt template + inputs.
            audit_logger: When provided, appends one row to ``audit_log`` via
                :meth:`AuditLogger.log` (names only — never values).
        """
        if not audit_result.violated:
            self._log.warning(
                "log_blocked_attempt called on a clean AuditResult — no-op",
                session_id=session_id,
                prompt_hash=prompt_hash,
            )
            return

        self._log.warning(
            "rule_auditor_block",
            action="rule_auditor_block",
            violated_article=audit_result.violated_article,
            reason=audit_result.reason,
            blocked_field_names=audit_result.blocked_field_names,
            value_logged=False,
            requires_caseworker_review_chip=audit_result.requires_caseworker_review_chip,
            session_id=session_id,
            prompt_hash=prompt_hash,
        )

        if audit_logger is not None:
            audit_logger.log(
                actor="auditor",
                action="rule_auditor_block",
                field_names=list(audit_result.blocked_field_names),
                reason=audit_result.reason,
                prompt_hash=prompt_hash,
                session_id=session_id,
            )


# ---------------------------------------------------------------------------
# Module-level convenience function
# ---------------------------------------------------------------------------


def audit(record: dict[str, Any]) -> AuditResult:
    """Module-level shorthand: create a :class:`RuleAuditor` and run :meth:`check`.

    Useful for one-off checks in scripts or notebooks where maintaining
    a long-lived auditor instance is unnecessary.

    Args:
        record: The candidate IER record dict.

    Returns:
        A :class:`AuditResult` from a freshly instantiated auditor.
    """
    return RuleAuditor().check(record)
