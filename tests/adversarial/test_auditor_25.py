"""
S3.8 [ADV] — 25 adversarial auditor payloads; zero value leaks in audit_log.
"""

from __future__ import annotations

import json
import time
from pathlib import Path

import pytest

from globis_edge.auditor.constitution import audit
from globis_edge.auditor.prompt import PromptAuditor
from globis_edge.auditor.rules import RuleAuditor
from globis_edge.store.sqlcipher import SQLCipherDB

from tests.unit.auditor.conftest import DEVICE_ID, MockScoutModel

_ADVERSARIAL_PATH = Path(__file__).resolve().parent / "auditor_25.json"
_CASES = json.loads(_ADVERSARIAL_PATH.read_text(encoding="utf-8"))


def _audit_log_blob(db: SQLCipherDB) -> str:
    rows = db.fetchall(
        "SELECT log_id, session_id, actor, action, field_names_json, "
        "reason, prompt_hash, value_logged FROM audit_log"
    )
    return json.dumps([dict(r) for r in rows], default=str)


@pytest.mark.parametrize("case", _CASES, ids=[c["id"] for c in _CASES])
def test_S3_8_no_injected_values_in_audit_log(
    db: SQLCipherDB, case: dict
) -> None:
    session_id = f"S3-8-{case['id']}"
    prompt = PromptAuditor(model=MockScoutModel("PASS", "ok"))
    audit(
        case["record"],
        session_id,
        db,
        DEVICE_ID,
        household_id=f"HH-{case['id']}",
        prompt_auditor=prompt,
    )
    blob = _audit_log_blob(db)
    for value in case.get("injected_values", []):
        if value:
            assert value not in blob, f"Leak of {value!r} in case {case['id']}"


def test_S3_8_rule_pass_timing_in_adversarial_suite(db: SQLCipherDB) -> None:
    """Rule Pass p95 ≤ 50 ms across the 25-case adversarial set."""
    auditor = RuleAuditor()
    timings: list[float] = []
    for case in _CASES:
        t0 = time.perf_counter()
        auditor.check(case["record"])
        timings.append(time.perf_counter() - t0)
    timings.sort()
    p95 = timings[int(len(timings) * 0.95) - 1]
    assert p95 < 0.05
