"""
Constitutional Auditor orchestrator — Rule Pass then Prompt Pass.

This is the only entry point the application should call for full audit.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any

from globis_edge.auditor.prompt import InferenceError, PromptAuditor
from globis_edge.auditor.rules import AuditResult, RuleAuditor
from globis_edge.store.audit_log import AuditLogger
from globis_edge.store.outbox import OutboxManager
from globis_edge.store.sqlcipher import SQLCipherDB


def payload_hash(record: dict[str, Any]) -> str:
    """SHA-256 of the serialised draft record (quarantine metadata only)."""
    return hashlib.sha256(
        json.dumps(record, sort_keys=True, default=str).encode("utf-8")
    ).hexdigest()


class ConstitutionalAuditor:
    """Orchestrates Rule Pass → Prompt Pass with quarantine and audit logging."""

    def __init__(
        self,
        db: SQLCipherDB,
        device_id: str,
        *,
        prompt_auditor: PromptAuditor | None = None,
    ) -> None:
        self._db = db
        self._rule = RuleAuditor()
        self._prompt = prompt_auditor or PromptAuditor()
        self._audit_log = AuditLogger(db)
        self._outbox = OutboxManager(db, device_id=device_id)

    def audit(
        self,
        draft_record: dict[str, Any],
        session_id: str,
        *,
        household_id: str = "HH-AUDIT",
    ) -> AuditResult:
        """
        Run the dual-pass auditor. Prompt Pass is skipped when Rule Pass blocks.

        On Prompt Pass inference failure, returns ``violated=True`` with
        ``reason="inference_failure"`` (fail-safe).
        """
        pre_hash = self._prompt.compute_prompt_hash(draft_record)
        rule_result = self._rule.check(draft_record)

        if rule_result.violated:
            self._rule.log_blocked_attempt(
                rule_result,
                session_id,
                pre_hash,
                audit_logger=self._audit_log,
            )
            blocked_name = (
                rule_result.blocked_field_names[0]
                if rule_result.blocked_field_names
                else None
            )
            self._outbox.quarantine(
                household_id=household_id,
                payload_hash=payload_hash(draft_record),
                failure_reason=rule_result.reason or "rule_auditor_block",
                blocked_field_attempted=blocked_name,
            )
            return rule_result

        try:
            prompt_result = self._prompt.check(draft_record, session_id)
        except InferenceError:
            self._audit_log.log(
                actor="auditor",
                action="prompt_auditor_inference_failure",
                field_names=[],
                reason="inference_failure",
                prompt_hash=pre_hash,
                session_id=session_id,
            )
            self._outbox.quarantine(
                household_id=household_id,
                payload_hash=payload_hash(draft_record),
                failure_reason="inference_failure",
                blocked_field_attempted=None,
            )
            return AuditResult(
                violated=True,
                reason="inference_failure",
                violated_article="prompt_pass",
                blocked_field_names=[],
                requires_caseworker_review_chip=True,
                value_logged=False,
            )

        if prompt_result.verdict == "BLOCK":
            self._audit_log.log(
                actor="auditor",
                action="prompt_auditor_block",
                field_names=[],
                reason=prompt_result.reason,
                prompt_hash=prompt_result.prompt_hash,
                session_id=session_id,
            )
            self._outbox.quarantine(
                household_id=household_id,
                payload_hash=payload_hash(draft_record),
                failure_reason=prompt_result.reason,
                blocked_field_attempted=None,
            )
            return AuditResult(
                violated=True,
                reason=prompt_result.reason,
                violated_article="prompt_pass",
                blocked_field_names=[],
                requires_caseworker_review_chip=True,
                value_logged=False,
            )

        self._audit_log.log(
            actor="auditor",
            action="audit_pass",
            field_names=[],
            reason=None,
            prompt_hash=prompt_result.prompt_hash,
            session_id=session_id,
        )
        return AuditResult.clean()


def audit(
    draft_record: dict[str, Any],
    session_id: str,
    db: SQLCipherDB,
    device_id: str,
    *,
    household_id: str = "HH-AUDIT",
    prompt_auditor: PromptAuditor | None = None,
) -> AuditResult:
    """Module-level entry point — see :class:`ConstitutionalAuditor`."""
    return ConstitutionalAuditor(
        db,
        device_id,
        prompt_auditor=prompt_auditor,
    ).audit(draft_record, session_id, household_id=household_id)
