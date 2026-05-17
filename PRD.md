# Globis Edge 2.0 — Product Requirements Document

**Author:** Nadu  
**Version:** 10.0 — Final, Hardened, Logic Lock Resolved  
**Date:** May 16, 2026  
**Status:** Locked. All architectural findings resolved. Ready to build and submit.

---

## Why I am building this

I am building Globis Edge because the frontline of refugee reception in 2026 is still mostly paper, phones held up to faces, and caseworkers translating bureaucracy into something a frightened person can actually use — and the AI tools that exist either pretend to be more than they are or refuse to leave the cloud. I want to put a genuinely useful, genuinely offline tool in the hands of the people doing the work, on hardware they can afford, with safety constraints baked into the model loop, not added as a disclaimer.

This is my submission to the Gemma 4 Good Hackathon. It is also the first version of a tool I intend to keep building after the hackathon ends.

---

## Research and Build Method

I conducted the initial project research myself, including field-workflow framing, governance constraints, and PRIMES-aligned data structure mapping. I then wrote the PRD, structured the sprint plan, and supervised implementation and verification across each sprint closeout.

For model-assisted research, build iteration, and test support, I primarily used **Gemma 4 Cloud running locally on Ollama**. I also personally authored the Kaggle write-up and maintained final editorial control over architecture, safety decisions, and release hardening outcomes.

---

## What Globis Edge is

Globis Edge 2.0 is an offline, on-device caseworker companion that runs on a **Raspberry Pi 5 (8 GB)** and a mid-tier Android phone. It uses **Gemma 4 E2B and E4B** under Apache 2.0 to give frontline workers four capabilities they do not currently have in any integrated form:

1. **Context-Aware Translation** — real-time, culturally sensitive interpretation with dialect-aware triage that routes Masalit/Fur/Zaghawa speakers to a human interpreter rather than pretending the model speaks their language.
2. **Document Fragment Reconstruction** — ingests scattered, partial, damaged refugee documents and synthesises them into one unified, provenance-grounded dossier where every field traces to its source artifact.
3. **Jargon-Free Explanation Engine** — turns asylum decisions, housing notices, and medical referrals into a plain-language one-page explainer in the refugee's preferred language, signed by the caseworker.
4. **Dynamic Glossary Ledger** — when jargon is unavoidable, auto-compiles a glossary that defines each term in accessible language, placed where comprehension research says it works.

Behind these capabilities, three pieces of infrastructure make the system safe to ship: a **Constitutional Auditor** (dual-pass review against Article 31 of the 1951 Refugee Convention and ExCom Conclusion No. 8), a **Cross-Modal Consistency Check** that surfaces conflicts to the caseworker without scoring the refugee, and a **Dignity Loop** that reads every committed record back to the refugee in their own language before any export happens.

The system does not participate in substantive asylum interviews, biometric matching, document authentication, or outcome prediction. These are out of scope by design, enforced in the Constitutional Auditor, and visible on every screen.

---

## Who Globis Edge is for

The user is the **frontliner**. Not the refugee. The refugee is the beneficiary of the Dignity Loop and the explainer; the frontliner is the person who taps Commit.

Two named personas ground every design decision:

**Hawa** — UNHCR protection associate, Adré, Chad. Five years in displacement work. Speaks French, Arabic, English. Processes ~40 individuals on a busy day. Her bottleneck is interpreting a Masalit speaker without a Masalit interpreter present, and the second pass on a dossier she already filed.

**Tobias** — BAMF Sachbearbeiter, Eisenhüttenstadt, Germany. Three years at the Bundesamt. Speaks German, English, conversational Arabic. Two substantive cases per day; the other half of his day is handover letters and explaining Bescheide. His bottleneck is the typing.

---

## Contact moments — where Globis Edge sits

Refugees pass through a sequence of contact moments. **Globis Edge 2.0 ships for moments 1 and 2** — arrival and reception/registration. It serves information into moment 3 (the explainer helps the refugee understand what the upcoming interview is about and what the resulting decision letter says) but does not sit at the interview table.

---

## System architecture

### Two-device stack

```
+--------------------------------------+        +-----------------------------------+
|  ANDROID SCOUT (mid-tier handset)    |        |  RASPBERRY PI 5 ANALYST (8 GB)    |
|  Role: UI, fast turns, audio capture |        |  Role: heavy reasoning, vision    |
|                                      |  LAN   |                                   |
|  - Gemma 4 E2B (Q4_K_M / INT4)       |<------>|  - Gemma 4 E4B (Q4_K_M)           |
|  - LiteRT / MediaPipe (audio)        |  REST  |  - llama.cpp / llama-cpp-python   |
|  - Piper TTS (fr, ar, en, de)        |        |  - HF transformers + ONNX (audio) |
|  - SQLCipher (glossary cache)        |        |  - Surya OCR                      |
|  - Retrofit REST client              |        |  - SQLCipher (canonical store)    |
|                                      |        |  - FastAPI (local REST server)    |
+--------------------------------------+        +-----------------------------------+
```

No internet path. The runtime refuses to start with a default route outside `192.168.0.0/16`. All egress is a deferred, consent-gated, caseworker-authorised action via the `commit_record` tool only.

For the hackathon demo, both processes run on the Pi 5 (Scout-on-Pi mode) so the notebook is reproducible without an Android device.

### Scout (Gemma 4 E2B)

Handles: UI prompts, rapid translation drafts, dialect triage, Constitutional Auditor read pass, back-translation check, glossary building, Dignity Loop playback. ~12–20 tok/s on Snapdragon 8 Gen 3; ~5–8 tok/s on Pi 5 fallback.

### Analyst (Gemma 4 E4B)

Handles: multimodal dossier reconstruction, Cross-Modal Consistency Check, Plain-Language Explainer, Dignity Loop record reading, Constitutional Auditor write pass. ~2–4 tok/s on Pi 5; 4K runtime KV-cache window.

### Native function calling

All structured outputs use Gemma 4's `<|tool|>` token lifecycle with JSON-Schema-typed arguments and guided decoding. The tool call trace is visible in Notebook Section 4 (Schema Translator demo).

---

## Five hero capabilities

### 1. Tiered Inference ("Scout & Analyst")

E2B handles fast turns; E4B handles heavy reasoning. A latency comparison (2B vs 4B for an equivalent translation task) is in Notebook Section 2. The p95 benchmark for the full multimodal turn is in Notebook Section 19.

### 2. Cross-Modal Conflict Resolver

Given an ID image, audio testimony, and typed caseworker notes, the Analyst:
- Extracts attributes per modality (name, DOB, origin, case ID)
- Detects mismatches across modalities
- Produces a one-to-three-sentence reasoning trace
- Surfaces a UI "conflict chip" for the caseworker

No auto-resolution. No refugee scoring.

### 3. Dual-Pass Constitutional Auditor

Two sequential passes. Rule first; prompt second. Never reversed.

**Pass 1 — Rule Pass (deterministic, ≤50 ms):**

```python
PROHIBITED_FIELDS = {
    "political_affiliation", "religion", "sexual_orientation", "ethnicity",
}
SCORE_FIELDS = {
    "eligibility_score", "credibility_score", "fraud_risk", "status_prediction",
}
```

Any field in these sets is rejected before the LLM sees the record. The field's **name** (not value) is appended to `AuditResult.blocked_field_names`. `value_logged = False` is an explicit contract field on the dataclass — always False, machine-readable by downstream log auditors.

When the Rule Pass blocks a field, it emits via structlog:

```python
log.warning(
    "rule_auditor_block",
    blocked_field_names=["political_affiliation"],  # field name only, never value
    value_logged=False,
    requires_caseworker_review_chip=True,
    session_id=session_id,
    prompt_hash=prompt_hash,
)
```

This log is forwarded to the caseworker review chip. The chip displays: *"A sensitive field category was blocked from this record."* The submitted value is never exposed.

**Pass 2 — Prompt Pass (Gemma 4 E2B, ≤4 s):**

Reviews the post-sanitised record against Article 31 (1951 Refugee Convention — non-penalisation for irregular entry) and ExCom Conclusion No. 8 (XXVIII, 1977 — right to a competent interpreter). Emits `{verdict: PASS | BLOCK, reason: string}`. A BLOCK triggers `quarantine_outbox` + protection-concern chip.

### 4. Dynamic Schema Mapping (Schema Translator)

Gemma 4 native function calling maps unstructured intake text to a PRIMES-shaped JSON schema:

```
map_to_schema(field_name, value, reasoning)
```

Output: structured JSON + human-readable mapping explanation per field.

### 5. Dignity Loop

The Analyst reads the unified committed record back to the refugee in their language via Piper TTS. The refugee can correct one field per loop. The caseworker taps Commit — this is the only egress path. `commit_record` is the sole authorised write tool.

---

## Data layer

### Person + Claim schema

Every extracted attribute carries: `person_id`, `attribute`, `value`, `confidence`, `confidence_band`, `evidence` (artifact ID + bounding box or char span + quote), `extractor` (model version), `prompt_hash`, `timestamp`.

The evidence quote must round-trip to the OCR text (Levenshtein ≤ 5). Gemma extractions that don't ground in Surya OCR text are rejected.

### IER record schema (proGres-shaped, not proGres)

The seven core IER elements: `name`, `date_of_birth`, `sex`, `nationality`, `place_of_origin`, `date_of_arrival`, `group_id`. Every committed record also carries: auditor stamp, Dignity Loop confirmation, explainer reference, provenance pointer.

No `political_affiliation`, `credibility_score`, `fraud_risk`, or any field outside the IER allowlist without explicit `caseworker_justification`.

### Outbox schema (Lamport clock, compound key)

```sql
CREATE TABLE outbox (
    uuid            TEXT PRIMARY KEY,
    household_id    TEXT NOT NULL,
    entity_type     TEXT NOT NULL,
    op_type         TEXT NOT NULL CHECK (op_type IN ('INSERT','UPDATE','DELETE')),
    payload_hash    TEXT NOT NULL,         -- encrypted blob ref; no raw PII in row
    logical_seq     INTEGER NOT NULL,      -- Lamport counter, per device per household
    device_id       TEXT NOT NULL,
    created_at_iso  TEXT NOT NULL,
    sync_status     TEXT NOT NULL DEFAULT 'PENDING_SYNC'
                    CHECK (sync_status IN ('PENDING_SYNC','SYNCED','CONFLICTED')),
    attempts        INTEGER NOT NULL DEFAULT 0,
    UNIQUE (household_id, logical_seq, device_id)   -- compound key; prevents race condition
);
```

**Collision detection uses the compound key `(household_id, logical_seq, device_id)` — not `logical_seq` alone.** This resolves the race condition where two offline devices each increment to `logical_seq = 1` for the same household. The query:

```sql
SELECT 1 FROM outbox
WHERE household_id = ?
  AND logical_seq  = ?
  AND device_id   != ?
LIMIT 1
```

Collision resolution routing:

| Field type | Resolution |
|---|---|
| Identity-critical: `name`, `date_of_birth`, `nationality`, `case_id` | `ASK_USER` (always) |
| Numeric assistance allocation fields | `SERVER_WINS` |
| Last-write-wins (LWW) | **Removed** |

### Quarantine outbox schema

```sql
CREATE TABLE quarantine_outbox (
    uuid                    TEXT PRIMARY KEY,
    household_id            TEXT NOT NULL,
    payload_hash            TEXT NOT NULL,
    logical_seq             INTEGER NOT NULL DEFAULT 0,
    device_id               TEXT NOT NULL DEFAULT '',
    quarantine_at_iso       TEXT NOT NULL,
    failure_reason          TEXT NOT NULL,
    blocked_field_attempted TEXT,           -- field NAME only, never value
    attempts                INTEGER NOT NULL DEFAULT 0,
    reviewed_at_iso         TEXT            -- NULL = pending caseworker review
);
```

### Quarantine counter badge

A `GET /quarantine/count` endpoint returns `{"total_count": int, "unreviewed_count": int, "oldest_quarantine_iso": str | null}`, polled every 30 seconds. `unreviewed_count > 0` drives a red badge counter in the caseworker UI — visible at all times, not only when the caseworker navigates to a specific record. Without this badge, schema-validation failures accumulate silently across a shift.

Three endpoints on `/quarantine`:

- `GET /quarantine/count` — badge counter poll
- `GET /quarantine/summary` — triage list (field names only, no payload values)
- `POST /quarantine/{uuid}/review-complete` — caseworker marks reviewed; record retained for audit trail

### Audit log

Append-only. Field names only. Never values.

```yaml
log_entry:
  timestamp: 2026-05-16T14:33:01.234Z
  session_id: S-2026-05-16-001
  actor: "auditor"
  action: "rule_auditor_block"
  blocked_field_names: ["political_affiliation"]   # name only, never value
  value_logged: false                               # explicit machine-readable contract
  requires_caseworker_review_chip: true
  prompt_hash: "sha256:abcd…"
```

---

## Security and governance

### ASR → LLM injection boundary

Two controls before any ASR output reaches the Gemma prompt:

1. **Truncation:** 2,048 characters maximum.
2. **Character-class filter:** `[A-Za-z0-9\x20-\x7E؀-ۿÀ-ž]` — Latin, Arabic script, Latin Extended.

The JSON Schema validation gate serves double duty as the output enforcement boundary: if Gemma output doesn't validate against the IER schema, it never reaches the Outbox.

### Storage

SQLCipher 4.x (AES-256-CBC) everywhere. Passphrase derived from caseworker PIN via PBKDF2-SHA512 (310,000 iterations, device-scoped salt). Never written to disk. One-tap "delete everything" overwrites the database file once.

CVE-2025-6965 (SQLite heap overflow, ≤3.50.1) is fully mitigated by the SQLCipher migration. SQLCipher is built on a hardened SQLite fork; the vulnerable surface is removed entirely. The Outbox loop uses parameterised queries only — no dynamic SQL.

### OS hardening

- **Pi 5:** seccomp profile limiting syscalls to `{read, write, open, close, mmap}`. No network syscalls during inference.
- **Android:** `FLAG_SECURE` on all PII-rendering views; sandboxed inference process.

### Governance runtime

```
startup:
  1. load dpia.yaml  →  validate hash
  2. load dsa.yaml   →  check expiry_date > today
  3. IF either fails →  sys.exit("Governance file missing or expired")
  4. SQLCipher passphrase derivation (PBKDF2)
  5. seccomp / sandbox bind
  6. model load
  7. Ready
```

`dpia.yaml` and `dsa.yaml` ship in the repo. The runtime refuses to start an integration whose governance files are missing or expired.

---

## Performance and resource budgets

### Latency budgets (p95, Pi 5 canonical hardware)

| Operation | Budget |
|---|---|
| Translation turn (text-only) | 3 s |
| Translation turn (30 s audio clip) | 12 s |
| Ingest one image (Surya OCR) | 4 s |
| Dossier synthesis (10 artifacts) | 45 s |
| Plain-language explainer (4-stage) | 25 s |
| Auditor (rule pass + prompt pass) | 4 s |
| Dignity Loop TTS (one sentence) | 0.6 s |
| **Full multimodal turn (p95 SLA)** | **≤ 15 s** |

The p95 SLA is substantiated by the benchmark cell in Notebook Section 19 (`eval/runners/run_latency.py`). The cell runs the full pipeline 20 times, computes p95, and renders a histogram. It exits with code 1 if p95 exceeds 15 s.

### RAM budget (Pi 5, 8 GB)

| Component | Reserved |
|---|---|
| E4B Q4_K_M loaded | 3.0 GB |
| KV cache @ 4K context | 0.5 GB |
| Surya OCR models | 1.5 GB |
| HF transformers audio | 1.5 GB |
| FastAPI + SQLCipher + misc | 0.5 GB |
| OS headroom | 1.0 GB |
| **Total** | **≤ 8.0 GB** |

Surya and HF audio are lazy-loaded and never in RAM simultaneously. Each is loaded on demand and unloaded before the other is needed.

---

## Synthetic demo scenarios

### Scenario A — Hawa and the Reconstructed Dossier

Synthetic Sudanese family. Six fragmentary artifacts: torn passport, UNHCR registration token, WhatsApp screenshot, school certificate, voice note, caseworker note. All four capabilities run end-to-end. Dignity Loop plays in French. Refugee corrects one field. Total wall time on Pi 5: ~75 s. Files: `synthetic_cases/aisha/`.

### Scenario B — Tobias and the Blocked Field

Synthetic Chadian-Arabic speaker, alone. Testimony mentions political persecution. Constitutional Auditor Rule Pass detects and blocks `political_affiliation`. `blocked_field_names = ["political_affiliation"]` is logged; value is not logged. Caseworker sees protection-concern chip. Quarantine badge increments to 1. Files: `synthetic_cases/yusuf/`.

Both scenarios are watermarked "SYNTHETIC SCENARIO" on every artifact file. The runtime refuses to ingest unwatermarked files in v1.

---

## Evaluation plan

Seven reproducible evaluation cells in the Kaggle Notebook, each with a published target:

| Eval | Target |
|---|---|
| Dialect-triage recall (→ human interpreter) | ≥ 0.95 |
| Dossier reconstruction precision (7 IER attributes) | ≥ 0.90 |
| Provenance integrity (evidence quote in OCR) | ≥ 0.98 |
| Constitutional Auditor adversarial test (25 prompts, 0 leaks) | 0 leaks |
| Comprehension-proxy round-trip F1 | ≥ 0.90 |
| Plain-language style-guide adherence | ≥ 0.95 |
| Edge latency p95 (Pi 5, full multimodal turn) | ≤ 15 s |

---

## Logic Lock audit — resolved findings

A full architectural audit was completed before submission. All critical findings are resolved. The table below is the complete verdict; full documentation is in `archive/FINAL_AUDIT.md`.

| Finding | Severity | Resolution |
|---|---|---|
| CVE-2025-6965 (SQLite heap overflow) | Critical | SQLCipher migration; parameterised Outbox loop |
| Constitutional Auditor legal grounding | Critical | Article 31 + ExCom No. 8 citations (both citable) |
| Lamport Clock race condition | Critical | Compound key `(household_id, logical_seq, device_id)` in collision detection |
| Quarantine silent accumulation | High | `/quarantine/count` badge endpoint; 30 s poll |
| Auditor blocked-field logging | High | `blocked_field_names` (names only); `value_logged = False` contract field |
| ASR prompt injection boundary | Critical | 2,048-char truncation + character-class filter + schema gate |
| Burst sync math (M[X]/M/1) | Medium | Documented; Lamport counter enables clean v1.1 upgrade |
| p95 latency claim unsubstantiated | High | Benchmark cell in Notebook Section 19 |

**Residual risks (documented, not defects):**

- Piper `ar_JO-kareem-low` is MSA, not Sudanese/Chadian dialect. Caseworker confirms Dignity Loop comprehension.
- Surya + HF audio cannot be loaded simultaneously on Pi 5 8 GB. Lazy-load pattern mitigates this.
- M[X]/M/1 burst sync model not implemented in v1. Lamport counter is the upgrade path.

---

## What I will not claim

- No MTP acceleration on ARM. Gains documented only for Apple Silicon and GPU.
- No "single forward pass" replacing Whisper. llama.cpp audio path is not yet production-stable on Pi 5.
- No fraud detection or fraud scoring on refugees.
- No mathematical safety certification for the Constitutional Auditor. It is a hybrid rule + prompt system with logs.
- No Masalit, Fur, or Zaghawa translation. Human-interpreter routing is the answer.
- No UNHCR endorsement, no live PRIMES integration, no real refugee data at any point.

---

## Hackathon judging strategy

| Axis | Hero moment | Evidence |
|---|---|---|
| Impact & Vision | Dignity Loop | Synthetic refugee hears her record in French, corrects one field |
| Technical Depth — multimodal | Dossier Reconstruction | 6 artifacts → unified dossier on Pi 5 in ~38 s, on camera |
| Technical Depth — agentic | Schema Translator | Live `<|tool|>` call trace in notebook |
| Responsible AI | Constitutional Auditor | Blocked-field log + caseworker chip in Scenario B |
| Edge feasibility | Benchmark cell | p95 histogram from real Pi 5 hardware, airplane mode |
| Defensibility | Logic Lock audit | Race condition identified, fixed, documented transparently |

---

## Implementation status

| Artifact | Status |
|---|---|
| `src/globis_edge/store/outbox.py` — Lamport compound key fix | ✅ Written |
| `src/globis_edge/auditor/rules.py` — blocked-field logging fix | ✅ Written |
| `src/globis_edge/api/quarantine_badge.py` — badge router | ✅ Written |
| `eval/runners/run_latency.py` — p95 benchmark runner | ✅ Written |
| `notebook.ipynb` — Kaggle Notebook (21 sections) | To build |
| `synthetic_cases/aisha/`, `synthetic_cases/yusuf/` | To build |
| `src/` — remaining capabilities | To build |
| `video/globis-edge-90s.mp4` | To record |

---

## Data and ethics commitment

Synthetic data only. No real refugee, asylum-seeker, or stateless person's data is used at any point. No affiliation with or endorsement by UNHCR, IOM, ICRC, or any host or origin state. PRIMES referenced as architectural inspiration only — never as an integration target. No eligibility, credibility, fraud, or status determinations. No participation in substantive asylum interviews, biometric matching, or document authentication. Full statement in `DATA_ETHICS_STATEMENT.md`.

---

*Nadu, May 16, 2026.*
