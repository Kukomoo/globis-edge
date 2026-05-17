"""Verification plan coverage for dossier grounding logic."""

from __future__ import annotations

import pytest

from globis_edge.capabilities.dossier import (
    DossierMismatchError,
    DossierReconstructor,
)
from globis_edge.store.audit_log import AuditLogger
from globis_edge.store.outbox import OutboxManager


@pytest.fixture
def reconstructor() -> DossierReconstructor:
    return DossierReconstructor()


@pytest.fixture
def reconstructor_with_logging(db) -> DossierReconstructor:
    return DossierReconstructor(
        outbox_manager=OutboxManager(db, device_id="ocr-test-device"),
        audit_logger=AuditLogger(db),
        household_id="HOUSEHOLD-001",
        session_id="SESSION-001",
        payload_hash="PAYLOAD-HASH-001",
    )


@pytest.mark.parametrize(
    ("s1", "s2", "expected_distance"),
    [
        ("Sudan Passport", "Sudan Passport", 0),
        ("Sudan Pssport", "Sudan Passport", 1),
        ("Sdan Pasport", "Sudan Passport", 3),
        ("Sdn Pasprt", "Sudan Passport", 5),
    ],
)
def test_levenshtein_distance_cases(
    reconstructor: DossierReconstructor,
    s1: str,
    s2: str,
    expected_distance: int,
) -> None:
    assert reconstructor.levenshtein_distance(s1, s2) == expected_distance


def test_hard_rejection_case_raises(
    reconstructor_with_logging: DossierReconstructor,
) -> None:
    with pytest.raises(
        DossierMismatchError,
        match="distance 7 exceeds threshold 5",
    ):
        reconstructor_with_logging.reconstruct_and_verify(
            "SDN Pssprt Ex",
            "Sudan Passport",
        )


def test_exact_boundary_case_passes(reconstructor: DossierReconstructor) -> None:
    payload = reconstructor.reconstruct_and_verify("Sdn Pasprt", "Sudan Passport")
    assert payload == {
        "ocr_text": "Sdn Pasprt",
        "ground_truth": "Sudan Passport",
        "distance": 5,
        "verified": True,
    }


def test_mismatch_quarantines_and_audits(
    db,
    reconstructor_with_logging: DossierReconstructor,
) -> None:
    with pytest.raises(DossierMismatchError):
        reconstructor_with_logging.reconstruct_and_verify(
            "SDN Pssprt Ex",
            "Sudan Passport",
        )

    quarantine_rows = db.fetchall(
        """
        SELECT household_id, failure_reason, blocked_field_attempted
        FROM quarantine_outbox
        """
    )
    assert len(quarantine_rows) == 1
    assert quarantine_rows[0]["household_id"] == "HOUSEHOLD-001"
    assert quarantine_rows[0]["failure_reason"] == "grounding_mismatch_distance_7"
    assert quarantine_rows[0]["blocked_field_attempted"] == "evidence_quote"

    audit_rows = db.fetchall(
        """
        SELECT actor, action, field_names_json, reason
        FROM audit_log
        """
    )
    assert len(audit_rows) == 1
    assert audit_rows[0]["actor"] == "analyst"
    assert audit_rows[0]["action"] == "grounding_failure"
    assert audit_rows[0]["field_names_json"] == '["evidence_quote"]'
    assert audit_rows[0]["reason"] == "levenshtein_distance=7"
