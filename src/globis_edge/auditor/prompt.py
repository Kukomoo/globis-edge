"""
Prompt Pass — Gemma 4 E2B constitutional review of post-Rule-Pass records.
"""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal, Protocol

import structlog

log = structlog.get_logger(__name__)

_REPO_ROOT = Path(__file__).resolve().parents[3]
_DEFAULT_PROMPT_PATH = _REPO_ROOT / "prompts" / "auditor.md"


class InferenceError(RuntimeError):
    """Raised when the Scout model call fails."""


class ScoutModel(Protocol):
    """Minimal interface for Gemma E2B generation (mockable in tests)."""

    def generate(self, system_prompt: str, user_message: str) -> str:
        """Return raw model text containing a JSON verdict object."""


@dataclass(frozen=True)
class PromptAuditResult:
    """Result of the Prompt Pass."""

    verdict: Literal["PASS", "BLOCK"]
    reason: str
    prompt_hash: str


def load_system_prompt(path: Path | None = None) -> str:
    """Load the auditor system prompt from ``prompts/auditor.md``."""
    prompt_path = path or _DEFAULT_PROMPT_PATH
    return prompt_path.read_text(encoding="utf-8")


def compute_prompt_hash(system_prompt: str, record: dict[str, Any]) -> str:
    """SHA-256 fingerprint of system prompt + serialised record (no values in logs)."""
    payload = system_prompt + json.dumps(record, sort_keys=True, default=str)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _parse_verdict(raw: str) -> PromptAuditResult:
    """Extract JSON verdict from model output."""
    match = re.search(r"\{[^{}]*\"verdict\"[^{}]*\}", raw, re.DOTALL | re.IGNORECASE)
    if not match:
        raise InferenceError("Prompt Pass returned no JSON verdict object")
    data = json.loads(match.group())
    verdict = str(data.get("verdict", "")).upper()
    if verdict not in ("PASS", "BLOCK"):
        raise InferenceError(f"Invalid verdict: {verdict!r}")
    reason = str(data.get("reason", ""))[:200]
    return PromptAuditResult(
        verdict=verdict,  # type: ignore[arg-type]
        reason=reason,
        prompt_hash="",
    )


class PromptAuditor:
    """LLM-based Prompt Pass using ``prompts/auditor.md``."""

    def __init__(
        self,
        *,
        system_prompt: str | None = None,
        prompts_path: Path | None = None,
        model: ScoutModel | None = None,
    ) -> None:
        self._system_prompt = system_prompt or load_system_prompt(prompts_path)
        self._model = model

    def compute_prompt_hash(self, record: dict[str, Any]) -> str:
        return compute_prompt_hash(self._system_prompt, record)

    def check(self, record: dict[str, Any], session_id: str) -> PromptAuditResult:
        """
        Run the Prompt Pass on a Rule-Pass-clean record.

        Raises
        ------
        InferenceError
            If the model is unavailable or returns unparseable output.
        """
        _ = session_id  # reserved for future per-session prompt variants
        prompt_hash = self.compute_prompt_hash(record)
        user_message = (
            "Review this draft IER record and return JSON only:\n"
            + json.dumps(record, sort_keys=True, default=str)
        )

        if self._model is None:
            raise InferenceError("No Scout model configured for Prompt Pass")

        try:
            raw = self._model.generate(self._system_prompt, user_message)
        except Exception as exc:
            log.warning(
                "prompt_auditor_inference_error",
                session_id=session_id,
                error_type=type(exc).__name__,
                value_logged=False,
            )
            raise InferenceError(str(exc)) from exc

        parsed = _parse_verdict(raw)
        return PromptAuditResult(
            verdict=parsed.verdict,
            reason=parsed.reason,
            prompt_hash=prompt_hash,
        )
