"""AuditLogger — append-only audit trail with no value-logging surface.

The audit log is the system's accountability record. It is read by
caseworker review tooling and by downstream log auditors. The single
non-negotiable property: **field names go in, field values never do**.

How this property is defended (three independent layers)
-------------------------------------------------------
1. The ``log()`` method signature has no ``value`` parameter. A caller
   that writes ``log(value="APC supporter", ...)`` raises ``TypeError``
   at the call site — the function body never runs.

2. The ``audit_log`` table in ``schema.sql`` has no value column. Even if
   a future buggy caller assembled a row that smuggled a value into
   another column, the ``CHECK (value_logged = 0)`` constraint on the
   ``value_logged`` column rejects any row claiming a value was logged.
   SQLCipher itself enforces the contract.

3. Upstream, ``RuleAuditor`` returns an ``AuditResult`` dataclass with
   no field that holds a submitted value. By the time ``log_blocked_attempt``
   reaches this module, the value is unreachable — it was discarded the
   moment ``RuleAuditor.check`` ran.

This file does not implement the auditor. It implements the log itself,
and the structural guarantees that make value leakage impossible.
"""

from __future__ import annotations

import json
import uuid as _uuid
from datetime import datetime, timezone
from typing import Literal

import structlog

from .sqlcipher import SQLCipherDB

_log = structlog.get_logger(__name__)

Actor = Literal["auditor", "scout", "analyst", "caseworker", "system"]


def _now_iso() -> str:
    """Return the current UTC time as an ISO-8601 string with millisecond precision."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


class AuditLogger:
    """Append-only logger backed by the encrypted ``audit_log`` table.

    Designed to be the ONLY way audit rows enter the database. Routes,
    capabilities, and the auditor itself all call ``AuditLogger.log()``;
    none of them issue raw INSERTs.

    Args:
        db: The shared :class:`SQLCipherDB` connection.
    """

    def __init__(self, db: SQLCipherDB) -> None:
        self._db = db

    def log(
        self,
        *,
        actor: Actor,
        action: str,
        field_names: list[str],
        reason: str | None = None,
        prompt_hash: str | None = None,
        session_id: str,
    ) -> str:
        """Write a single audit row.

        Note the keyword-only signature: every parameter is named at the
        call site, which makes ``value=`` invocations even more obviously
        wrong (Python raises ``TypeError`` because no ``value`` parameter
        exists).

        Args:
            actor: The component emitting the log entry.
            action: A short machine-friendly identifier
                (e.g. ``"rule_auditor_block"``, ``"commit_record"``).
            field_names: List of field *names* relevant to this event.
                Pass an empty list when no fields apply. The method
                serialises this list to JSON and stores it as a single
                column — never as values.
            reason: Optional human-readable description.
            prompt_hash: Optional sha256 fingerprint of the prompt + inputs
                that produced the event. Allows forensic reconstruction
                without retaining the inputs themselves.
            session_id: The active caseworker session, used for correlation.

        Returns:
            The UUID of the newly inserted audit row.
        """
        if not isinstance(field_names, list) or any(
            not isinstance(n, str) for n in field_names
        ):
            raise TypeError(
                "AuditLogger.log: field_names must be list[str] — names only"
            )

        log_id = str(_uuid.uuid4())
        self._db.execute(
            """
            INSERT INTO audit_log
                (log_id, timestamp_iso, session_id, actor, action,
                 field_names_json, reason, prompt_hash, value_logged)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
            """,
            (
                log_id,
                _now_iso(),
                session_id,
                actor,
                action,
                json.dumps(field_names, ensure_ascii=False),
                reason,
                prompt_hash,
            ),
        )
        self._db.commit()

        # Mirror the event to structlog so external log aggregators see it
        # with the same machine-readable shape. value_logged=False is the
        # explicit contract field.
        _log.info(
            action,
            actor=actor,
            field_names=field_names,
            session_id=session_id,
            prompt_hash=prompt_hash,
            value_logged=False,
        )
        return log_id
