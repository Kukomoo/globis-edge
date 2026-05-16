"""Tests for SQLCipherDB — proves the database is genuinely encrypted.

Verification plan: S1.1, S1.2, S1.8.
"""

from __future__ import annotations

import sqlite3
import subprocess
import sys
from pathlib import Path

import pytest

from globis_edge.store.sqlcipher import DatabaseError, SQLCipherDB

# Tables required to exist after schema initialisation (S1.2).
EXPECTED_TABLES = {
    "persons",
    "claims",
    "evidence",
    "artifacts",
    "specific_needs",
    "audit_log",
    "explainers",
    "outbox",
    "quarantine_outbox",
}


# ---------------------------------------------------------------------------
# S1.1 — SQLCipher encryption is real
# ---------------------------------------------------------------------------

def test_S1_1_database_is_encrypted_at_rest(db: SQLCipherDB, db_path: Path) -> None:
    """Open the .db file with stdlib sqlite3 (no key). The read must fail.

    If this test ever passes a stdlib sqlite3 query, the database is being
    stored in plaintext — a critical security regression.
    """
    # First, write a row so the file has content to (try to) decrypt.
    db.execute(
        """
        INSERT INTO persons (person_id, household_id, created_at_iso, session_id)
        VALUES (?, ?, ?, ?)
        """,
        ("P-001", "H-001", "2026-05-16T00:00:00Z", "S-1"),
    )
    db.commit()
    db.close()

    # Now attempt to read the raw file with stdlib sqlite3. SQLCipher
    # surfaces this as a DatabaseError ("file is not a database") because
    # the header bytes are encrypted.
    plain = sqlite3.connect(str(db_path))
    try:
        with pytest.raises(sqlite3.DatabaseError):
            plain.execute("SELECT * FROM persons").fetchall()
    finally:
        plain.close()


def test_S1_1_raw_bytes_do_not_contain_plaintext(
    db: SQLCipherDB, db_path: Path
) -> None:
    """The encrypted file's raw bytes must not contain insertable plaintext."""
    sentinel_household = "HH-SENTINEL-PLAINTEXT-PROBE-42"
    db.execute(
        """
        INSERT INTO persons (person_id, household_id, created_at_iso, session_id)
        VALUES (?, ?, ?, ?)
        """,
        ("P-sentinel", sentinel_household, "2026-05-16T00:00:00Z", "S-1"),
    )
    db.commit()
    db.close()

    raw = Path(db_path).read_bytes()
    assert sentinel_household.encode("utf-8") not in raw, (
        "Plaintext sentinel found in encrypted database file — encryption broken"
    )


# ---------------------------------------------------------------------------
# S1.2 — Schema tables exist after init
# ---------------------------------------------------------------------------

def test_S1_2_all_schema_tables_exist(db: SQLCipherDB) -> None:
    rows = db.fetchall("SELECT name FROM sqlite_master WHERE type='table'")
    present = {row["name"] for row in rows}
    missing = EXPECTED_TABLES - present
    assert not missing, f"Missing tables after schema init: {missing}"


def test_S1_2_audit_log_value_logged_check_constraint(db: SQLCipherDB) -> None:
    """The audit_log CHECK (value_logged = 0) must reject any other value.

    Schema-layer guard against value logging. Independent of AuditLogger.
    """
    import sqlcipher3.dbapi2 as sqlcipher
    with pytest.raises(sqlcipher.IntegrityError):
        db.execute(
            """
            INSERT INTO audit_log
                (log_id, timestamp_iso, session_id, actor, action,
                 field_names_json, reason, prompt_hash, value_logged)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "LOG-1",
                "2026-05-16T00:00:00Z",
                "S-1",
                "system",
                "test",
                "[]",
                None,
                None,
                1,  # claim a value was logged — must be rejected
            ),
        )


# ---------------------------------------------------------------------------
# Execute primitive enforces tuple-only params (anti-injection rail)
# ---------------------------------------------------------------------------

def test_execute_rejects_non_tuple_params(db: SQLCipherDB) -> None:
    """SQLCipherDB.execute must refuse params that are not a tuple.

    This is the single line that prevents f-string SQL drift.
    """
    with pytest.raises(TypeError, match="must be a tuple"):
        db.execute("SELECT * FROM persons WHERE person_id = ?", ["P-1"])  # list
    with pytest.raises(TypeError, match="must be a tuple"):
        db.execute("SELECT * FROM persons WHERE person_id = ?", "P-1")  # str


# ---------------------------------------------------------------------------
# S1.8 — No plain sqlite3 import in src/
# ---------------------------------------------------------------------------

def test_S1_8_no_stdlib_sqlite3_import_in_src() -> None:
    """grep -r 'import sqlite3' src/ must return zero matches.

    Plain stdlib sqlite3 is forbidden in production code: unencrypted
    storage must not be possible.
    """
    repo_root = Path(__file__).resolve().parents[3]
    src_root = repo_root / "src"
    assert src_root.is_dir(), f"src/ not found at {src_root}"

    offenders: list[str] = []
    for path in src_root.rglob("*.py"):
        for lineno, line in enumerate(
            path.read_text(encoding="utf-8").splitlines(), start=1
        ):
            stripped = line.strip()
            if stripped.startswith("import sqlite3") or stripped.startswith(
                "from sqlite3"
            ):
                offenders.append(f"{path.relative_to(repo_root)}:{lineno}: {stripped}")
    assert not offenders, "Forbidden stdlib sqlite3 imports in src/:\n" + "\n".join(
        offenders
    )


# ---------------------------------------------------------------------------
# Wrong-key probe (defensive: confirms key derivation actually matters)
# ---------------------------------------------------------------------------

def test_wrong_key_raises_DatabaseError(db_path: Path) -> None:
    """Reopening with a different key must fail loudly."""
    a = SQLCipherDB(db_path=db_path, db_key="correct-key")
    a.execute(
        """
        INSERT INTO persons (person_id, household_id, created_at_iso, session_id)
        VALUES (?, ?, ?, ?)
        """,
        ("P-001", "H-001", "2026-05-16T00:00:00Z", "S-1"),
    )
    a.commit()
    a.close()

    with pytest.raises(DatabaseError):
        SQLCipherDB(db_path=db_path, db_key="wrong-key")
