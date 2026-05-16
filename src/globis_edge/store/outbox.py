"""outbox.py — Lamport-clock outbox with compound-key collision detection.

Logic Lock fix (Lamport-clock race condition)
---------------------------------------------
The original system used ``logical_seq`` alone as the conflict-detection key.
That allowed a race condition where two offline devices could each create
``logical_seq=1`` for the same household, and the duplicate went undetected
on sync.

The fix introduces a COMPOUND KEY: ``(household_id, logical_seq, device_id)``,
enforced at three levels:

1. Schema-level UNIQUE constraint in ``schema.sql`` — prevents a single
   device from duplicating its own counter.
2. ``next_logical_seq()`` filters by ``device_id`` so each device counts
   independently — two devices may legitimately both reach ``logical_seq=1``.
3. ``detect_collision()`` returns True only when a record exists with the
   same ``(household_id, logical_seq)`` but a **different** ``device_id`` —
   that is the precise definition of a Lamport race.

Connection model
----------------
This module no longer opens its own database connection. The roadmap
requires every data-layer module to share the single :class:`SQLCipherDB`
instance constructed at process startup, so encryption, schema migration,
and parameter binding are uniform across the codebase.
"""

from __future__ import annotations

import uuid as _uuid
from datetime import datetime, timezone
from typing import Any

from .sqlcipher import SQLCipherDB

PENDING_SYNC = "PENDING_SYNC"
SYNCED = "SYNCED"
CONFLICTED = "CONFLICTED"

VALID_OP_TYPES = frozenset({"INSERT", "UPDATE", "DELETE"})
"""op_type values permitted by the schema CHECK constraint."""

_IDENTITY_CRITICAL = frozenset({"name", "date_of_birth", "nationality", "case_id"})


def _now_iso() -> str:
    """Return the current UTC time as an ISO-8601 string with millisecond precision."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def _new_uuid() -> str:
    """Return a new random UUID4 as a lowercase hyphenated string."""
    return str(_uuid.uuid4())


class OutboxManager:
    """Manages the outbox and quarantine tables for a single device.

    Args:
        db: The shared :class:`SQLCipherDB` connection. All reads and writes
            go through this; no module-local connection is ever opened.
        device_id: Opaque identifier for this device, minted on first run
            and persisted in config. Used as the third component of the
            compound key.
    """

    def __init__(self, db: SQLCipherDB, device_id: str) -> None:
        self._db = db
        self._device_id = device_id

    # ------------------------------------------------------------------
    # Logical sequence
    # ------------------------------------------------------------------

    def next_logical_seq(self, household_id: str) -> int:
        """Return the next logical-sequence number for THIS device in ``household_id``.

        Filtered by ``device_id`` so each device maintains an independent
        counter. Two devices both holding ``logical_seq=1`` for the same
        household is legitimate offline divergence, not a duplicate.

        Returns:
            One greater than the current maximum ``logical_seq`` for this
            device in this household, or 1 if no records exist yet.
        """
        row = self._db.fetchone(
            """
            SELECT MAX(logical_seq) AS max_seq
            FROM outbox
            WHERE household_id = ? AND device_id = ?
            """,
            (household_id, self._device_id),
        )
        current_max = row["max_seq"] if row else None
        return 1 if current_max is None else current_max + 1

    # ------------------------------------------------------------------
    # Insertion
    # ------------------------------------------------------------------

    def insert(
        self,
        household_id: str,
        entity_type: str,
        op_type: str,
        payload_hash: str,
    ) -> str:
        """Insert one outbox row and return its UUID.

        ``op_type`` must be one of ``INSERT``, ``UPDATE``, ``DELETE`` — any
        other value is rejected at the SQL CHECK constraint.
        """
        if op_type not in VALID_OP_TYPES:
            raise ValueError(
                f"op_type must be one of {sorted(VALID_OP_TYPES)}, got {op_type!r}"
            )

        record_uuid = _new_uuid()
        logical_seq = self.next_logical_seq(household_id)
        created_at = _now_iso()

        self._db.execute(
            """
            INSERT INTO outbox
                (uuid, household_id, entity_type, op_type, payload_hash,
                 logical_seq, device_id, created_at_iso, sync_status, attempts)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record_uuid,
                household_id,
                entity_type,
                op_type,
                payload_hash,
                logical_seq,
                self._device_id,
                created_at,
                PENDING_SYNC,
                0,
            ),
        )
        self._db.commit()
        return record_uuid

    # ------------------------------------------------------------------
    # Collision detection (Logic Lock fix)
    # ------------------------------------------------------------------

    def detect_collision(
        self,
        household_id: str,
        logical_seq: int,
        incoming_device_id: str,
    ) -> bool:
        """Detect a Lamport-clock collision using the compound key.

        Returns True iff a row exists in ``outbox`` with the same
        ``household_id`` and ``logical_seq`` as the incoming record, BUT
        a different ``device_id``. That is the precise definition of a
        cross-device race condition.

        A row from the same ``device_id`` is a local duplicate (already
        prevented by the schema's UNIQUE constraint) and is not a
        collision.
        """
        row = self._db.fetchone(
            """
            SELECT 1
            FROM outbox
            WHERE household_id = ?
              AND logical_seq  = ?
              AND device_id   != ?
            LIMIT 1
            """,
            (household_id, logical_seq, incoming_device_id),
        )
        return row is not None

    # ------------------------------------------------------------------
    # Collision resolution
    # ------------------------------------------------------------------

    def resolve_collision(self, field_type: str) -> str:
        """Return the resolution strategy for a detected collision.

        Identity-critical fields require explicit caseworker sign-off
        because an automated merge could silently corrupt a person's
        record. Numeric assistance fields default to ``SERVER_WINS``.
        Last-write-wins was removed per PRD.
        """
        if field_type in _IDENTITY_CRITICAL:
            return "ASK_USER"
        return "SERVER_WINS"

    # ------------------------------------------------------------------
    # Quarantine
    # ------------------------------------------------------------------

    def quarantine(
        self,
        household_id: str,
        payload_hash: str,
        failure_reason: str,
        blocked_field_attempted: str | None = None,
    ) -> str:
        """Write a failed record to the quarantine table.

        Append-only by convention: ``reviewed_at_iso`` starts NULL and is
        the only column ever subsequently updated. ``blocked_field_attempted``
        is a field *name*, never a value.
        """
        record_uuid = _new_uuid()
        now = _now_iso()

        self._db.execute(
            """
            INSERT INTO quarantine_outbox
                (uuid, household_id, payload_hash, logical_seq, device_id,
                 quarantine_at_iso, failure_reason, blocked_field_attempted,
                 attempts, reviewed_at_iso)
            VALUES (?, ?, ?, 0, '', ?, ?, ?, 0, NULL)
            """,
            (
                record_uuid,
                household_id,
                payload_hash,
                now,
                failure_reason,
                blocked_field_attempted,
            ),
        )
        self._db.commit()
        return record_uuid

    def quarantine_count(self) -> int:
        """Return the number of quarantine records that have not been reviewed."""
        row = self._db.fetchone(
            "SELECT COUNT(*) AS cnt FROM quarantine_outbox WHERE reviewed_at_iso IS NULL"
        )
        return int(row["cnt"]) if row else 0

    def quarantine_total(self) -> int:
        """Return the total number of quarantine records (reviewed and not)."""
        row = self._db.fetchone("SELECT COUNT(*) AS cnt FROM quarantine_outbox")
        return int(row["cnt"]) if row else 0

    def quarantine_summary(self) -> list[dict[str, Any]]:
        """Return unreviewed quarantine records ordered oldest-first.

        Payload values are never included — only field *names* and
        triage metadata.
        """
        rows = self._db.fetchall(
            """
            SELECT uuid,
                   household_id,
                   failure_reason,
                   blocked_field_attempted,
                   quarantine_at_iso,
                   attempts
            FROM quarantine_outbox
            WHERE reviewed_at_iso IS NULL
            ORDER BY quarantine_at_iso ASC
            """
        )
        return [dict(row) for row in rows]

    def mark_quarantine_reviewed(self, record_uuid: str) -> None:
        """Mark one quarantine record as manually reviewed.

        Raises ``ValueError`` if no record with the given UUID exists.
        """
        reviewed_at = _now_iso()
        cursor = self._db.execute(
            """
            UPDATE quarantine_outbox
            SET reviewed_at_iso = ?
            WHERE uuid = ? AND reviewed_at_iso IS NULL
            """,
            (reviewed_at, record_uuid),
        )
        self._db.commit()
        if cursor.rowcount == 0:
            raise ValueError(
                f"No unreviewed quarantine record found with uuid={record_uuid!r}"
            )
