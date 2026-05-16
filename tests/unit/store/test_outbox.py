"""Tests for OutboxManager — proves the compound-key Logic Lock fix.

Verification plan: S1.5.
"""

from __future__ import annotations

import pytest
import sqlcipher3.dbapi2 as sqlcipher

from globis_edge.store.outbox import OutboxManager
from globis_edge.store.sqlcipher import SQLCipherDB


DEVICE_A = "device-alpha-0001"
DEVICE_B = "device-bravo-0002"
HOUSEHOLD = "HH-2026-001"


# ---------------------------------------------------------------------------
# Basic insertion + per-device sequence
# ---------------------------------------------------------------------------

def test_insert_and_logical_seq_increments(db: SQLCipherDB) -> None:
    mgr = OutboxManager(db, device_id=DEVICE_A)
    mgr.insert(HOUSEHOLD, "person", "INSERT", "hash-aaa")
    mgr.insert(HOUSEHOLD, "person", "UPDATE", "hash-bbb")
    assert mgr.next_logical_seq(HOUSEHOLD) == 3


def test_insert_rejects_invalid_op_type(db: SQLCipherDB) -> None:
    mgr = OutboxManager(db, device_id=DEVICE_A)
    with pytest.raises(ValueError, match="op_type must be one of"):
        mgr.insert(HOUSEHOLD, "person", "CREATE", "hash")


# ---------------------------------------------------------------------------
# S1.5 — Compound key prevents silent collision
# ---------------------------------------------------------------------------

def test_S1_5_two_devices_can_hold_same_logical_seq(db: SQLCipherDB) -> None:
    """The schema UNIQUE constraint permits cross-device same-seq inserts.

    Two offline devices independently reaching logical_seq=1 for one
    household is legitimate divergence, not a duplicate. The schema must
    accept both rows.
    """
    mgr_a = OutboxManager(db, device_id=DEVICE_A)
    mgr_b = OutboxManager(db, device_id=DEVICE_B)

    uid_a = mgr_a.insert(HOUSEHOLD, "person", "INSERT", "hash-A")
    uid_b = mgr_b.insert(HOUSEHOLD, "person", "INSERT", "hash-B")

    assert uid_a != uid_b
    # Each device's next_logical_seq is independent.
    assert mgr_a.next_logical_seq(HOUSEHOLD) == 2
    assert mgr_b.next_logical_seq(HOUSEHOLD) == 2


def test_S1_5_same_device_cannot_duplicate_compound_key(db: SQLCipherDB) -> None:
    """Schema-level UNIQUE catches a same-device counter bug."""
    mgr = OutboxManager(db, device_id=DEVICE_A)
    mgr.insert(HOUSEHOLD, "person", "INSERT", "hash-A")

    # Bypass next_logical_seq and try to insert a duplicate row directly.
    with pytest.raises(sqlcipher.IntegrityError):
        db.execute(
            """
            INSERT INTO outbox
                (uuid, household_id, entity_type, op_type, payload_hash,
                 logical_seq, device_id, created_at_iso, sync_status, attempts)
            VALUES (?, ?, 'person', 'INSERT', 'hash-dup', 1, ?, '2026-01-01T00:00:00Z',
                    'PENDING_SYNC', 0)
            """,
            ("uuid-dup", HOUSEHOLD, DEVICE_A),
        )


def test_S1_5_detect_collision_returns_True_for_different_device(
    db: SQLCipherDB,
) -> None:
    """Cross-device same-seq → genuine Lamport race → True."""
    mgr_a = OutboxManager(db, device_id=DEVICE_A)
    mgr_a.insert(HOUSEHOLD, "person", "INSERT", "hash-A")

    # Incoming record from device B with logical_seq=1 for the same household.
    assert mgr_a.detect_collision(
        household_id=HOUSEHOLD,
        logical_seq=1,
        incoming_device_id=DEVICE_B,
    )


def test_S1_5_detect_collision_returns_False_for_same_device(db: SQLCipherDB) -> None:
    """Checking the device's own record is not a collision."""
    mgr_a = OutboxManager(db, device_id=DEVICE_A)
    mgr_a.insert(HOUSEHOLD, "person", "INSERT", "hash-A")

    assert not mgr_a.detect_collision(
        household_id=HOUSEHOLD,
        logical_seq=1,
        incoming_device_id=DEVICE_A,
    )


def test_S1_5_detect_collision_returns_False_when_seq_does_not_match(
    db: SQLCipherDB,
) -> None:
    mgr_a = OutboxManager(db, device_id=DEVICE_A)
    mgr_a.insert(HOUSEHOLD, "person", "INSERT", "hash-A")

    assert not mgr_a.detect_collision(
        household_id=HOUSEHOLD,
        logical_seq=99,
        incoming_device_id=DEVICE_B,
    )


# ---------------------------------------------------------------------------
# Collision resolution routing
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "field_type",
    ["name", "date_of_birth", "nationality", "case_id"],
)
def test_resolve_collision_identity_critical(db: SQLCipherDB, field_type: str) -> None:
    mgr = OutboxManager(db, device_id=DEVICE_A)
    assert mgr.resolve_collision(field_type) == "ASK_USER"


@pytest.mark.parametrize("field_type", ["benefit_amount", "assistance_units"])
def test_resolve_collision_numeric_assistance(db: SQLCipherDB, field_type: str) -> None:
    mgr = OutboxManager(db, device_id=DEVICE_A)
    assert mgr.resolve_collision(field_type) == "SERVER_WINS"


# ---------------------------------------------------------------------------
# Quarantine cycle
# ---------------------------------------------------------------------------

def test_quarantine_insert_count_summary_review_cycle(db: SQLCipherDB) -> None:
    mgr = OutboxManager(db, device_id=DEVICE_A)
    assert mgr.quarantine_count() == 0
    assert mgr.quarantine_total() == 0

    q_uuid = mgr.quarantine(
        household_id=HOUSEHOLD,
        payload_hash="hash-bad-001",
        failure_reason="schema_validation_error",
        blocked_field_attempted="political_affiliation",
    )
    assert mgr.quarantine_count() == 1
    assert mgr.quarantine_total() == 1

    summary = mgr.quarantine_summary()
    assert len(summary) == 1
    record = summary[0]
    assert record["uuid"] == q_uuid
    assert record["household_id"] == HOUSEHOLD
    assert record["failure_reason"] == "schema_validation_error"
    assert record["blocked_field_attempted"] == "political_affiliation"
    # Payload-bearing columns must not appear in the summary.
    assert "payload_hash" not in record

    mgr.mark_quarantine_reviewed(q_uuid)
    assert mgr.quarantine_count() == 0
    assert mgr.quarantine_total() == 1  # row retained for audit trail


def test_mark_quarantine_reviewed_unknown_uuid_raises(db: SQLCipherDB) -> None:
    mgr = OutboxManager(db, device_id=DEVICE_A)
    with pytest.raises(ValueError):
        mgr.mark_quarantine_reviewed("nonexistent-uuid")
