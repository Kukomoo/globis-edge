"""Shared fixtures for auditor tests."""

from __future__ import annotations

import json
from typing import Any

import pytest

from globis_edge.auditor.prompt import PromptAuditor, ScoutModel
from globis_edge.store.outbox import OutboxManager

DEVICE_ID = "auditor-test-device"


CLEAN_IER_RECORD: dict[str, Any] = {
    "name": "Yusuf Hassan",
    "date_of_birth": "1988-04-02",
    "sex": "M",
    "nationality": "TCD",
    "place_of_origin": "N'Djamena",
    "date_of_arrival": "2026-05-10",
    "group_id": "GRP-YUSUF-001",
}


class MockScoutModel:
    """Returns a fixed JSON verdict for Prompt Pass unit tests."""

    def __init__(self, verdict: str = "PASS", reason: str = "ok") -> None:
        self.verdict = verdict
        self.reason = reason
        self.call_count = 0

    def generate(self, system_prompt: str, user_message: str) -> str:
        self.call_count += 1
        return json.dumps({"verdict": self.verdict, "reason": self.reason})


@pytest.fixture
def clean_record() -> dict[str, Any]:
    return dict(CLEAN_IER_RECORD)


@pytest.fixture
def pass_prompt_auditor() -> PromptAuditor:
    return PromptAuditor(model=MockScoutModel("PASS", "Articles 2 and 6 clear."))


@pytest.fixture
def outbox_mgr(db) -> OutboxManager:
    return OutboxManager(db, device_id=DEVICE_ID)
