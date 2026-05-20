# Data Ethics & Responsible AI Statement

**Globis Edge — Gemma 4 Good Hackathon Submission**

---

## Executive Summary

Globis Edge is a **proof-of-concept prototype** that demonstrates responsible agentic reasoning for humanitarian intake scenarios. It is built entirely on **synthetic data**, uses **explicit protection mechanisms** (Constitutional Auditor dual-pass review, field-level blocking, value masking), and requires **human oversight** for all consequential decisions. This document outlines our data ethics, responsible AI practices, and explicit constraints.

---

## 1. Synthetic Data Only

**All refugee cases, testimonies, ID documents, and personal information in this prototype are synthetic examples created for demonstration purposes.**

- No real UNHCR registrations, refugee identities, or PII are used.
- Synthetic families (Hawa, Tobias, Aisha, Yusuf, etc.) are fictional personas with plausible intake scenarios.
- Test cases are designed to illustrate system behavior (cross-modal conflict detection, protected attribute blocking) rather than represent real individuals.
- No real data from PRIMES, proGres v4, BIMS, PING, or other UNHCR systems is accessed or ingested.

**Why this matters:** This ensures that no real refugee data is exposed, processed, or at risk due to model errors, privacy leaks, or system failures during development and demonstration.

---

## 2. Responsible AI Practices

### 2.1 Constitutional Auditor: Dual-Pass Review

Globis Edge uses a two-stage audit before intake records are committed:

**Pass 1 — Rule Pass (Deterministic):**
- Scans intake form fields for explicitly protected attributes: ethnicity, religion, political affiliation, caste, sexual orientation.
- Uses hardcoded field name matching (no model inference; no false negatives on these fields).
- If a protected field is detected, the entire intake is blocked before proceeding to Pass 2.
- Blocks are logged with field names only; no values are recorded.

**Pass 2 — Prompt Pass (LLM-based):**
- Only runs if Pass 1 clears the record.
- Uses Gemma 4 E2B to detect cross-modal conflicts: discrepancies in name spelling, birth year, stated origin across ID image, audio testimony, and typed notes.
- Conflicts are explained to the caseworker (e.g., "birth year differs: 2016 in ID, 2017 in testimony").
- **No automated denial or status determination is made by the model.** Conflicts surface to the caseworker for human review.

**Why this design:**
- Prevents collection of unnecessary sensitive attributes that could enable discrimination or harm.
- Catches data inconsistencies early, prompting caseworker review before records are finalized.
- Maintains human agency: the caseworker, not the model, decides how to resolve conflicts or proceed.

### 2.2 Field-Level Protection

Protected fields are identified before model inference:

| Attribute | Action | Reasoning |
|-----------|--------|-----------|
| Ethnicity | Block | Risk of algorithmic discrimination; not needed for core intake |
| Religion | Block | Risk of targeting; outside scope of humanitarian assistance determination |
| Political affiliation | Block | Risk of persecution if leaked; outside scope |
| Caste | Block | Caste-based discrimination risk; outside scope |
| Sexual orientation | Block | Risk of harm in conservative contexts; outside scope |

**Implementation:** Simple string matching in Rule Pass; no machine learning applied to these fields.

### 2.3 Value Masking

- Blocked field values are **never stored in logs or databases**.
- Only field names and the reason for blocking are recorded (e.g., "ethnicity_field_detected").
- This prevents accidental data leakage if logs are accessed or breached.

### 2.4 No Automated Denial

- The system **never automatically denies assistance or determines refugee status**.
- Verdicts are binary: "intake record clean" or "conflict detected; caseworker review required."
- All consequential decisions (eligibility, assistance level, casework plan) remain with human caseworkers.
- Conflicts do not result in rejection—they surface for human judgment.

### 2.5 No Biometric Matching, Document Authentication, or Outcome Prediction

- This prototype does **not** perform facial biometric matching, document authenticity verification, or fraud detection.
- It does not predict likelihood of being a refugee, assign risk scores, or forecast behavior.
- These capabilities are explicitly excluded to avoid compounding harm from algorithmic errors.

---

## 3. UNHCR Alignment (Prototype)

Globis Edge is designed to align with UNHCR principles and data protection guidance:

### 3.1 UNHCR Data Protection Principles

Our approach respects:
- **Data minimization:** We collect only fields necessary for intake (name, DOB, origin, family composition, immediate needs). Protected attributes are actively rejected.
- **Purpose limitation:** Data collected is used solely for intake, outbox creation, and caseworker briefing. No secondary uses (analytics, research, targeting).
- **Access & rectification:** Caseworkers can view and correct their own intake records. No automated data sharing.
- **No automated denial:** As stated, all consequential decisions involve human review.

### 3.2 Alignment with PRIMES Conceptually

We map Globis Edge outputs to PRIMES-like JSON schemas (proGres v4-style structure) but:
- **Do not integrate with production proGres v4 or BIMS.**
- **Do not access real UNHCR registration databases or state registries.**
- We provide structured JSON that *could* be imported by a caseworker into PRIMES after human review, but this is manual, not automated.

### 3.3 Not a Replacement for Substantive Interviews

This prototype is **intake support only.** It does not replace:
- Full Refugee Status Determination (RSD) interviews.
- Needs assessments by caseworkers.
- UNHCR eligibility reviews.

Globis Edge is a "triage and consistency check" tool, not a decision system.

### 3.4 Field Deployment Requires Governance

Before any field deployment:
- UNHCR or implementing partner approval (no unilateral deployment).
- Data Protection Impact Assessment (DPIA).
- Formal agreements with national authorities.
- Caseworker training and consent.
- Local context review (legal, cultural, security).

This prototype is **research-grade**, not operational.

---

## 4. Key Constraints

### 4.1 Offline by Design

- The system **does not require internet connectivity** for core intake.
- Model inference runs on-device (Raspberry Pi 5, CPU-only).
- No cloud dependency, no telemetry, no data egress to external services.

### 4.2 No Cloud Egress Except Consent-Gated Commit

- Intake records are stored locally (SQLCipher database).
- Export to PRIMES or cloud systems requires explicit caseworker consent and triggers a clear "commit" action.
- No automatic syncing or background uploads.

### 4.3 No Collection of Unnecessary Sensitive Data

- We do **not** collect: GPS location (during intake), financial information, health records (beyond immediate needs), family separation status, previous asylum claims.
- These are either excluded from the form or marked as optional with clear warnings.

### 4.4 No Substantive Asylum Interviews

- This tool does not conduct needs assessments, security interviews, or eligibility determination.
- It captures basic intake (identity, origin, immediate needs) and flags inconsistencies for caseworker follow-up.

---

## 5. Failure Modes & Mitigations

### 5.1 Cross-Modal Conflict False Negatives

**Risk:** The model misses a genuine conflict (e.g., name spelled differently but caseworker assumes it's the same person).  
**Mitigation:** Caseworker is prompted to manually review any record flagged by the system AND to spot-check clean records regularly. Conflicts are not hidden; they are shown with reasoning.

### 5.2 Protected Field Detection False Positives

**Risk:** A legitimate intake field is incorrectly flagged as "ethnicity" (e.g., "ethnicity_based_conflict_history").  
**Mitigation:** Rule Pass uses explicit field name matching; caseworkers can override blocking after reviewing the flag. Override is logged.

### 5.3 Model Hallucination or Jailbreak

**Risk:** The model generates malicious or false verdicts (e.g., invents conflicts that don't exist).  
**Mitigation:** 
- Verdicts are constrained to JSON format: {"verdict": "PASS" | "BLOCK", "reason": "..."}.
- Reason text is logged and auditable; caseworkers see the exact model output.
- No action is taken on model output without caseworker review (no automated commits).

### 5.4 Data Breach or Loss

**Risk:** The SQLCipher database is accessed or corrupted.  
**Mitigation:**
- Database is encrypted at rest (SQLCipher) with a per-device key.
- Access is limited to the local API process (no public ports).
- Regular backups to removable media, stored in caseworker custody.
- No network connectivity for backup by default.

---

## 6. Limitations & What This Is NOT

**Globis Edge is NOT:**
- A biometric identification system.
- A fraud detection or lie detection system.
- A risk scoring or behavioral prediction tool.
- A replacement for substantive asylum interviews.
- An automated eligibility determination system.
- A production deployment without UNHCR oversight.

**Globis Edge IS:**
- A structured intake capture tool with consistency checks.
- A proof-of-concept for edge-based humanitarian AI.
- A demonstration of responsible agentic reasoning (dual-pass audits, explicit rule layers, human-in-the-loop).
- A research artifact for the Gemma 4 Good Hackathon.

---

## 7. Transparency & Auditability

- **All prompts are in `prompts/` directory and in source code** (not hidden or black-boxed).
- **Constitutional Auditor rules are explicit and human-readable** (`prompts/auditor.md`).
- **Verdicts include reasoning traces** (why the model passed or blocked a record).
- **Logs record all protected field blocks with reason, but no values.**
- **Source code is open and reproducible** (GitHub repo with commit history).

---

## 8. Responsible AI Commitments

We commit to:

1. **Data minimization:** Collect only what is needed; reject sensitive fields by default.
2. **Human oversight:** No automated consequential decisions; all outcomes surface to caseworkers.
3. **Transparency:** Publish prompts, rules, and reasoning in clear language.
4. **Testability:** Use synthetic data that is safe to share; publish test scenarios and results.
5. **Honesty about limitations:** Do not claim the system can detect fraud, predict refugee status, or ensure safety.
6. **Governance alignment:** Design for UNHCR principles, not around them; acknowledge regulatory gaps.
7. **Community input:** Solicit feedback from caseworkers, humanitarian practitioners, and affected communities before any field use.

---

## 9. Contact & Questions

For questions about data ethics, responsible AI practices, or field deployment considerations:

- **GitHub:** https://github.com/[your-repo]  
- **Email:** Nad1071996@outlook.com  
- **Submission:** Gemma 4 Good Hackathon, Kaggle  

---

## 10. License & Attribution

**Globis Edge** is licensed under the Apache License 2.0.

**Copyright © 2026 Nada Khas**

Built with Gemma 4 E2B for the Gemma 4 Good Hackathon.  
Synthetic data only. No real refugee data is used.

---

**Document Version:** 1.0  
**Date:** May 18, 2026  
**Status:** Final for Kaggle submission
