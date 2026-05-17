# Globis Edge 2.0 — System Invariants

**Purpose:** Machine- and human-readable locks that must hold across all sprints.  
**Authority:** `PRD.md` wins on conflict; this file is the operational checklist for implementers and Cursor.  
**Last updated:** 2026-05-17 (Sprint 2 close)

---

## Dependency flow

Strict downward imports only:

```
config → store → models → capabilities → api
         asr/whisper_wrapper  (internal backend; imported only by models/audio.py)
```

| Rule | Enforcement |
|------|-------------|
| `store/` never imports `models/`, `capabilities/`, or `api/` | Grep / review |
| `models/audio.py` never imports `capabilities/` | No `from globis_edge.capabilities` in `models/` |
| `capabilities/sanitiser.py` is pure Python (`re`, `structlog` only) | S2.7 test + file grep |
| `asr/whisper_wrapper.py` never imports `store/` or above | Grep / review |
| Runtime orchestration calls **models then capabilities** (e.g. future `translation.py`: `AudioTranscriber` → `ASRSanitiser`) | Module contracts |

---

## Storage and network

| Invariant | Detail |
|-----------|--------|
| No stdlib `sqlite3` in `src/` | Use `sqlcipher3.dbapi2`; verify: `grep -r "import sqlite3" src/` → empty |
| Server bind | Never `0.0.0.0`; LAN / `192.168.0.0/16` only |
| No internet egress at runtime | Default route must stay inside `192.168.0.0/16` |
| Outbox writes | Only `POST /commit` when `auditor_status == "clean"` **and** `dignity_confirmed == true` |
| Quarantine table | Append-only; only `reviewed_at_iso` may be updated |
| Synthetic data only | Refuse ingest without `"SYNTHETIC SCENARIO"` watermark |

---

## Audit and safety pipeline

```
Rule Pass → Prompt Pass → Dignity Loop → POST /commit → Outbox
```

| Invariant | Detail |
|-----------|--------|
| Auditor order | Rule Pass **first**; if blocked, Prompt Pass **never runs** |
| Fail-safe | Prompt Pass inference failure → `BLOCK` |
| Value-masked logs | Field **names** only; `value_logged` is always `False` |
| `AuditLogger.log()` | No `value` parameter — by design |

**Hardened files (do not weaken without Logic Lock review):**

- `src/globis_edge/store/outbox.py` — compound key `(household_id, logical_seq, device_id)`
- `src/globis_edge/auditor/rules.py` — `blocked_field_names`, `value_logged=False`
- `src/globis_edge/api/quarantine_badge.py` — summaries without payload values
- `eval/runners/run_latency.py` — p95 ≤ 15 s SLA; non-zero exit on miss

---

## Sprint 2 — ASR security perimeter (locked)

These decisions are closed for Sprint 2. Sprint 3+ code must preserve them.

### Pipeline placement

| Layer | Module | Contract |
|-------|--------|----------|
| Internal backend | `src/globis_edge/asr/whisper_wrapper.py` | `transcribe(Path) → RawTranscript`; lazy `_get_model()` |
| Model wrapper | `src/globis_edge/models/audio.py` | `AudioTranscriber.transcribe(Path) → str`; **no sanitisation** |
| Capability | `src/globis_edge/capabilities/sanitiser.py` | `ASRSanitiser.sanitise(str) → str` |

### Sanitisation order (mandatory)

Applied in this exact sequence inside `ASRSanitiser.sanitise()`:

1. Reject empty / whitespace-only input → `ValueError`
2. **Truncate** to 2,048 characters
3. **Character-class filter** — allow only `[A-Za-z0-9\x20-\x7E؀-ۿÀ-ž]`
4. **Strip** Gemma delimiters matching `<\|.*?\|>` and `DROP TABLE` (case-insensitive)
5. **Normalise** whitespace (`" ".join(text.split()).strip()`)
6. Reject empty result → `ValueError`

Downstream JSON Schema validation on model **output** remains a separate gate (Outbox path).

### ASR performance and memory

| Constraint | Value |
|------------|--------|
| Soft budget (30 s clip, p95) | 12 s |
| Hard wall-clock timeout | 30 s → `RuntimeError` / `TranscriptionError` |
| Model unload | After every `AudioTranscriber.transcribe()`: `_model_cache.clear()` + `gc.collect()` |
| Pi 5 RAM rule | Whisper and Surya OCR **never resident together** |
| Default model size | `tiny` / `int8` on CPU (fits 8 GB budget with E4B + lazy Surya) |

### Logging

- ASR/sanitiser structlog events must set `text_logged=False`
- Never log transcript text content (PII risk)

### Verification IDs (Sprint 2)

| IDs | Suite |
|-----|--------|
| S2.1–S2.7 | `tests/unit/capabilities/test_sanitiser.py` |
| S2.8–S2.11 | `tests/unit/models/test_audio.py` |
| S2.6 + 10 payloads | `tests/adversarial/test_asr_injection.py` |

---

## Sprint 3 — Constitutional Auditor (locked)

| Rule | Detail |
|------|--------|
| Order | Rule Pass → Prompt Pass; Prompt skipped if Rule blocks |
| Fail-safe | `InferenceError` → `violated=True`, `reason="inference_failure"` |
| Logging | `RuleAuditor.log_blocked_attempt()` → `AuditLogger.log()` + structlog |
| Entry point | `ConstitutionalAuditor.audit()` / `constitution.audit()` only |
| Prompt hash | `sha256(system_prompt + json.dumps(record, sort_keys=True))` |
| Tests | S3.1–S3.8; `eval/runners/run_auditor.py` for 25-payload leak check |

## Sprint 4 — OCR & dossier (next)

Preserve all invariants above while implementing dossier reconstruction and Levenshtein grounding.

---

## Evidence and multimodal (Sprint 4+)

| Invariant | Detail |
|-----------|--------|
| OCR grounding | Evidence quote Levenshtein ≤ 5 vs OCR text or `GroundingError` |
| Masalit / Fur / Zaghawa | `HUMAN_TRIAGE_REQUIRED` — no fake ML translation/TTS |

---

## Quick verification commands

```bash
pytest tests/ -v
grep -r "import sqlite3" src/          # must be empty
grep -r "0\.0\.0\.0" src/              # must be empty
python eval/runners/run_latency.py --mock
```
