# Globis Edge Constitution

**Version:** 1.0 (Sprint 3)  
**Legal grounding:** Article 31, 1951 Refugee Convention; ExCom Conclusion No. 8 (XXVIII, 1977)

This document states the seven articles enforced by the Constitutional Auditor. The Rule Pass
implements Articles 1, 3, 4, and 7 deterministically. The Prompt Pass (Gemma 4 E2B) implements
Articles 2 and 6. Article 5 is enforced by storage policy (raw artifacts discarded after commit).

---

## Article 1 — Minimum dataset

Every committed record must include all seven IER core elements: `name`, `date_of_birth`,
`sex`, `nationality`, `place_of_origin`, `date_of_arrival`, `group_id`.

**Enforcement:** Rule Pass (`RuleAuditor._check_article_1_minimum_dataset`).

---

## Article 2 — Non-penalisation of irregular entry

**Legal basis:** Article 31, 1951 Refugee Convention.

The system must not record, infer, or imply penalisation for irregular entry or movement.
Narrative fields must not contain credibility attacks, fraud implications, or status predictions.

**Enforcement:** Prompt Pass (`PromptAuditor`).

---

## Article 3 — Prohibited identity-sensitive fields

The following fields are unconditionally banned: `political_affiliation`, `religion`,
`sexual_orientation`, `ethnicity`.

**Enforcement:** Rule Pass. Blocked field **names** may be logged; values never are.

---

## Article 4 — No automated risk scoring

Automated scores are forbidden: `eligibility_score`, `credibility_score`, `fraud_risk`,
`status_prediction`.

**Enforcement:** Rule Pass.

---

## Article 5 — Data minimisation and artifact lifecycle

Raw artifact bytes are not retained after caseworker-signed commit. Provenance hashes only.

**Enforcement:** Storage layer (`discarded=True` on artifacts post-commit).

---

## Article 6 — Competent interpreter

**Legal basis:** ExCom Conclusion No. 8 (XXVIII, 1977).

Records must not deny or bypass interpreter access for status-determination contexts.
Masalit, Fur, and Zaghawa routes require human interpreter triage (see translation capability).

**Enforcement:** Prompt Pass.

---

## Article 7 — Local by default

No external HTTP(S) endpoints outside the LAN (`192.168.0.0/16`). No cloud-routing field names
(e.g. `remote_sync_endpoint`, `upload_url`).

**Enforcement:** Rule Pass.

---

## Audit pipeline order

1. **Rule Pass** — deterministic, ≤ 50 ms p95.
2. **Prompt Pass** — only if Rule Pass is clean; inference failure → **BLOCK** (fail-safe).
3. **Dignity Loop** — refugee confirmation before `POST /commit`.
4. **Outbox** — only when `auditor_status == "clean"` and `dignity_confirmed == true`.
