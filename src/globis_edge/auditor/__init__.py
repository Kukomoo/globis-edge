"""Constitutional Auditor — Rule Pass + Prompt Pass.

Imports are lazy so that importing globis_edge.api.main (the demo shim)
does not trigger the full production import chain which requires sqlcipher3.
"""

from __future__ import annotations

__all__ = [
    "AuditResult",
    "ConstitutionalAuditor",
    "InferenceError",
    "PromptAuditResult",
    "PromptAuditor",
    "RuleAuditor",
    "audit",
    "rule_check",
]


def __getattr__(name: str):
    if name in ("ConstitutionalAuditor", "audit"):
        from globis_edge.auditor.constitution import ConstitutionalAuditor, audit  # noqa: PLC0415
        globals()["ConstitutionalAuditor"] = ConstitutionalAuditor
        globals()["audit"] = audit
        return globals()[name]
    if name in ("InferenceError", "PromptAuditor", "PromptAuditResult"):
        from globis_edge.auditor.prompt import InferenceError, PromptAuditor, PromptAuditResult  # noqa: PLC0415
        globals()["InferenceError"] = InferenceError
        globals()["PromptAuditor"] = PromptAuditor
        globals()["PromptAuditResult"] = PromptAuditResult
        return globals()[name]
    if name in ("AuditResult", "RuleAuditor", "rule_check"):
        from globis_edge.auditor.rules import AuditResult, RuleAuditor, audit as rule_check  # noqa: PLC0415
        globals()["AuditResult"] = AuditResult
        globals()["RuleAuditor"] = RuleAuditor
        globals()["rule_check"] = rule_check
        return globals()[name]
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
