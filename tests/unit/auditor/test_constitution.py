"""
Constitutional orchestrator — verification S3.1, S3.2, S3.6, S3.7.
"""

from __future__ import annotations

import json
import pytest

from globis_edge.auditor.constitution import ConstitutionalAuditor, audit
from globis_edge.auditor.prompt import InferenceError, PromptAuditor
from globis_edge.store.sqlcipher import SQLCipherDB

from tests.unit.auditor.conftest import DEVICE_ID, MockScoutModel


@pytest.fixture
def constitutional(db: SQLCipherDB, pass_prompt_auditor: PromptAuditor) -> ConstitutionalAuditor:
    return ConstitutionalAuditor(db, DEVICE_ID, prompt_auditor=pass_prompt_auditor)


# S3.1 — Clean record passes
def test_S3_1_clean_record_passes(
    db: SQLCipherDB,
    constitutional: ConstitutionalAuditor,
    clean_record: dict,
) -> None:
    result = constitutional.audit(clean_record, session_id="S3-1", household_id="HH-001")
    assert not result.violated
    rows = db.fetchall("SELECT action FROM audit_log WHERE session_id = 'S3-1'")
    assert len(rows) == 1
    assert rows[0]["action"] == "audit_pass"
    assert constitutional._outbox.quarantine_count() == 0  # noqa: SLF001


# S3.2 — political_affiliation blocked by Rule Pass
def test_S3_2_political_affiliation_quarantined(
    db: SQLCipherDB, clean_record: dict, pass_prompt_auditor: PromptAuditor
) -> None:
    injected_value = "APC supporter"
    record = {**clean_record, "political_affiliation": injected_value}
    result = audit(
        record,
        "S3-2",
        db,
        DEVICE_ID,
        household_id="HH-002",
        prompt_auditor=pass_prompt_auditor,
    )
    assert result.violated
    assert result.blocked_field_names == ["political_affiliation"]
    assert result.value_logged is False

    q_rows = db.fetchall(
        "SELECT blocked_field_attempted FROM quarantine_outbox WHERE household_id = 'HH-002'"
    )
    assert len(q_rows) == 1
    assert q_rows[0]["blocked_field_attempted"] == "political_affiliation"
    assert injected_value not in q_rows[0]["blocked_field_attempted"]

    audit_rows = db.fetchall("SELECT field_names_json FROM audit_log")
    blob = json.dumps([dict(r) for r in audit_rows])
    assert injected_value not in blob


# S3.6 — Prompt Pass not invoked when Rule Pass blocks
def test_S3_6_prompt_pass_skipped_on_rule_block(
    db: SQLCipherDB, clean_record: dict
) -> None:
    mock_model = MockScoutModel()
    prompt = PromptAuditor(model=mock_model)
    record = {**clean_record, "religion": "Evangelical Christian"}
    audit(
        record,
        "S3-6",
        db,
        DEVICE_ID,
        prompt_auditor=prompt,
    )
    assert mock_model.call_count == 0


# S3.7 — Inference failure fail-safe
def test_S3_7_inference_failure_blocks(
    db: SQLCipherDB, clean_record: dict
) -> None:
    class FailingModel:
        def generate(self, system_prompt: str, user_message: str) -> str:
            raise RuntimeError("offline")

    result = audit(
        clean_record,
        "S3-7",
        db,
        DEVICE_ID,
        prompt_auditor=PromptAuditor(model=FailingModel()),
    )
    assert result.violated
    assert result.reason == "inference_failure"
