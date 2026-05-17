"""
Prompt Pass unit tests — verification S3.7 (mocked LLM).
"""

from __future__ import annotations

import pytest

from globis_edge.auditor.prompt import InferenceError, PromptAuditor, compute_prompt_hash

from tests.unit.auditor.conftest import MockScoutModel


def test_prompt_pass_returns_pass_verdict(clean_record: dict) -> None:
    auditor = PromptAuditor(model=MockScoutModel("PASS", "Articles 2 and 6 clear."))
    result = auditor.check(clean_record, session_id="S-PROMPT")
    assert result.verdict == "PASS"
    assert result.prompt_hash == compute_prompt_hash(auditor._system_prompt, clean_record)


def test_prompt_pass_returns_block_verdict(clean_record: dict) -> None:
    auditor = PromptAuditor(
        model=MockScoutModel("BLOCK", "Article 2 credibility language detected.")
    )
    result = auditor.check(clean_record, session_id="S-PROMPT")
    assert result.verdict == "BLOCK"


def test_S3_7_inference_failure_raises_inference_error(clean_record: dict) -> None:
    class FailingModel:
        def generate(self, system_prompt: str, user_message: str) -> str:
            raise RuntimeError("model offline")

    auditor = PromptAuditor(model=FailingModel())
    with pytest.raises(InferenceError):
        auditor.check(clean_record, session_id="S-PROMPT")


def test_no_model_configured_raises_inference_error(clean_record: dict) -> None:
    auditor = PromptAuditor(model=None)
    with pytest.raises(InferenceError, match="No Scout model"):
        auditor.check(clean_record, session_id="S-PROMPT")
