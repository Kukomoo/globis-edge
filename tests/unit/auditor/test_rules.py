"""
Rule Pass unit tests — verification S3.3, S3.4, S3.5 + roadmap rule matrix.
"""

from __future__ import annotations

import json
import time

import pytest

from globis_edge.auditor.rules import (
    PROHIBITED_FIELDS,
    SCORE_FIELDS,
    AuditResult,
    RuleAuditor,
)
from globis_edge.store.audit_log import AuditLogger

from tests.unit.auditor.conftest import CLEAN_IER_RECORD


@pytest.fixture
def auditor() -> RuleAuditor:
    return RuleAuditor()


# --- Roadmap: 8 rule scenarios ---


def test_clean_record_passes(auditor: RuleAuditor, clean_record: dict) -> None:
    result = auditor.check(clean_record)
    assert not result.violated
    assert result.value_logged is False


@pytest.mark.parametrize("field", sorted(PROHIBITED_FIELDS))
def test_each_prohibited_field_blocked(
    auditor: RuleAuditor, clean_record: dict, field: str
) -> None:
    record = {**clean_record, field: "INJECTED-VALUE-MUST-NOT-LOG"}
    result = auditor.check(record)
    assert result.violated
    assert result.blocked_field_names == [field]
    assert result.value_logged is False


@pytest.mark.parametrize("field", sorted(SCORE_FIELDS))
def test_each_score_field_blocked(
    auditor: RuleAuditor, clean_record: dict, field: str
) -> None:
    record = {**clean_record, field: 0.99}
    result = auditor.check(record)
    assert result.violated
    assert field in result.blocked_field_names


def test_missing_ier_field_blocked(auditor: RuleAuditor, clean_record: dict) -> None:
    record = dict(clean_record)
    del record["group_id"]
    result = auditor.check(record)
    assert result.violated
    assert "group_id" in result.blocked_field_names


def test_egress_without_authoriser_blocked(auditor: RuleAuditor, clean_record: dict) -> None:
    record = {**clean_record, "remote_sync_endpoint": "https://cloud.example/sync"}
    result = auditor.check(record)
    assert result.violated
    assert result.violated_article == "article_7"


def test_log_blocked_attempt_writes_audit_log(db, auditor: RuleAuditor) -> None:
    logger = AuditLogger(db)
    record = {**CLEAN_IER_RECORD, "political_affiliation": "APC supporter"}
    result = auditor.check(record)
    auditor.log_blocked_attempt(
        result,
        session_id="S-RULE",
        prompt_hash="sha256:test",
        audit_logger=logger,
    )
    rows = db.fetchall("SELECT field_names_json, value_logged FROM audit_log")
    assert len(rows) == 1
    assert json.loads(rows[0]["field_names_json"]) == ["political_affiliation"]
    assert rows[0]["value_logged"] == 0
    blob = json.dumps(dict(rows[0]))
    assert "APC supporter" not in blob


# S3.5 — Rule Pass p95 ≤ 50 ms [PERF]
def test_S3_5_rule_pass_under_50ms_p95(auditor: RuleAuditor, clean_record: dict) -> None:
    record = {**clean_record, "political_affiliation": "x"}
    timings: list[float] = []
    for _ in range(100):
        t0 = time.perf_counter()
        auditor.check(record)
        timings.append(time.perf_counter() - t0)
    timings.sort()
    p95 = timings[94]
    assert p95 < 0.05, f"Rule Pass p95 {p95*1000:.1f} ms exceeds 50 ms budget"
