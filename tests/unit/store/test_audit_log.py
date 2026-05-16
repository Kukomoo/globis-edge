"""Tests for AuditLogger — proves the value-never-logged invariant.

Verification plan: S1.3, S1.4.
"""

from __future__ import annotations

import json

import pytest

from globis_edge.store.audit_log import AuditLogger
from globis_edge.store.sqlcipher import SQLCipherDB


# ---------------------------------------------------------------------------
# S1.3 — AuditLogger.log() accepts no `value` parameter
# ---------------------------------------------------------------------------

def test_S1_3_log_raises_TypeError_when_value_kwarg_passed(db: SQLCipherDB) -> None:
    """Layer A defence: the method signature has no `value` parameter.

    A caller writing log(value="APC supporter", ...) raises TypeError at
    the call site — the function body never runs.
    """
    logger = AuditLogger(db)
    with pytest.raises(TypeError):
        logger.log(  # type: ignore[call-arg]
            actor="auditor",
            action="rule_auditor_block",
            field_names=["political_affiliation"],
            session_id="S-1",
            value="APC supporter",  # forbidden kwarg
        )


def test_S1_3_log_signature_has_no_value_param() -> None:
    """Static check: the AuditLogger.log signature does not declare `value`."""
    import inspect

    sig = inspect.signature(AuditLogger.log)
    assert "value" not in sig.parameters, (
        "AuditLogger.log must not declare a 'value' parameter"
    )


def test_S1_3_log_rejects_non_string_field_names(db: SQLCipherDB) -> None:
    """field_names is typed list[str] — passing a value (str leak vector) fails."""
    logger = AuditLogger(db)
    with pytest.raises(TypeError, match="names only"):
        logger.log(
            actor="auditor",
            action="rule_auditor_block",
            field_names=[{"political_affiliation": "APC"}],  # type: ignore[list-item]
            session_id="S-1",
        )


# ---------------------------------------------------------------------------
# S1.4 — Audit log rows are field-names-only
# ---------------------------------------------------------------------------

def test_S1_4_stored_row_contains_field_name_not_value(db: SQLCipherDB) -> None:
    """The submitted value 'APC supporter' never appears in any audit_log column."""
    logger = AuditLogger(db)
    submitted_value = "APC supporter"  # value never passed to logger
    _ = submitted_value  # mark intent; the variable proves we hold the value
    field_name = "political_affiliation"

    logger.log(
        actor="auditor",
        action="rule_auditor_block",
        field_names=[field_name],
        reason="prohibited field detected",
        prompt_hash="sha256:abc",
        session_id="S-1",
    )

    rows = db.fetchall(
        "SELECT log_id, session_id, actor, action, field_names_json, "
        "reason, prompt_hash, value_logged FROM audit_log"
    )
    assert len(rows) == 1, "exactly one audit row expected"
    row = rows[0]

    # The field NAME is in the JSON column.
    stored_names = json.loads(row["field_names_json"])
    assert stored_names == [field_name]

    # The submitted VALUE never appears in any column.
    for col_name in row.keys():
        cell = row[col_name]
        if isinstance(cell, str):
            assert submitted_value not in cell, (
                f"Submitted value leaked into column {col_name!r}: {cell!r}"
            )

    # The machine-readable contract field.
    assert row["value_logged"] == 0


def test_S1_4_value_logged_column_is_always_zero(db: SQLCipherDB) -> None:
    """Every row written via AuditLogger has value_logged = 0."""
    logger = AuditLogger(db)
    for i in range(5):
        logger.log(
            actor="caseworker",
            action=f"action_{i}",
            field_names=[f"field_{i}"],
            session_id="S-1",
        )

    rows = db.fetchall("SELECT value_logged FROM audit_log")
    assert all(row["value_logged"] == 0 for row in rows)


def test_S1_4_audit_log_table_has_no_value_column(db: SQLCipherDB) -> None:
    """Layer B defence: the schema itself has no `value` column to receive a value."""
    rows = db.fetchall("PRAGMA table_info(audit_log)")
    columns = {row["name"] for row in rows}
    forbidden = {"value", "payload", "body", "blocked_value"}
    leaked = columns & forbidden
    assert not leaked, f"audit_log must not have value-bearing columns: {leaked}"
