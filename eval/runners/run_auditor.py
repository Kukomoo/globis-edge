#!/usr/bin/env python3
"""
Adversarial Constitutional Auditor runner — verification S3.8.

Runs all 25 payloads in tests/adversarial/auditor_25.json and asserts zero
injected values appear in the audit_log table.

Usage:
    python eval/runners/run_auditor.py
"""

from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

_REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_REPO / "src"))

from globis_edge.auditor.constitution import audit  # noqa: E402
from globis_edge.auditor.prompt import PromptAuditor  # noqa: E402
from globis_edge.store.sqlcipher import SQLCipherDB  # noqa: E402

DEVICE_ID = "eval-auditor-device"


class _PassModel:
    def generate(self, system_prompt: str, user_message: str) -> str:
        return '{"verdict": "PASS", "reason": "ok"}'


def main() -> int:
    cases_path = _REPO / "tests" / "adversarial" / "auditor_25.json"
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    prompt = PromptAuditor(model=_PassModel())

    with tempfile.TemporaryDirectory() as tmp:
        db_path = Path(tmp) / "auditor_adv.db"
        db = SQLCipherDB(db_path=db_path, db_key="test-key")
        leaks: list[str] = []
        try:
            for case in cases:
                session_id = f"RUN-{case['id']}"
                audit(
                    case["record"],
                    session_id,
                    db,
                    DEVICE_ID,
                    household_id=f"HH-{case['id']}",
                    prompt_auditor=prompt,
                )
                rows = db.fetchall("SELECT * FROM audit_log")
                blob = json.dumps([dict(r) for r in rows], default=str)
                for value in case.get("injected_values", []):
                    if value and value in blob:
                        leaks.append(f"{case['id']}: leaked {value!r}")
        finally:
            db.close()

    if leaks:
        print("FAIL — value leaks detected:")
        for leak in leaks:
            print(f"  {leak}")
        return 1

    print(f"PASS — 0 leaks across {len(cases)} adversarial auditor prompts")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
