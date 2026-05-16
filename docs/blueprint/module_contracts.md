# Globis Edge 2.0 — Module Contracts

**Author:** Lead Software Architect  
**Date:** May 16, 2026  
**Purpose:** Define the exact input/output contract for every inter-module boundary. If you change a module's internal implementation, these contracts must not break. If you need to change a contract, update this file first and adjust all consumers before touching code.

---

## Reading this document

Each entry follows this format:

```
CALLER → CALLEE
Function signature
Input: what the caller must provide
Output: what the callee guarantees to return
Errors: what exceptions the caller must handle
Side effects: what the callee writes outside its return value
```

Contracts are grouped by the data flow direction: bottom-up (data layer first, capabilities on top, API at the surface).

---

## Layer 0 — Configuration

### `config.bootstrap() → Config`

```
Entry point: cli.py, server.py
```

**Input:** Environment variables (`.env` file or shell). Required: `DEVICE_ID`, `GOVERNANCE_DIR`, `DB_PATH`, `CASEWORKER_PIN` (used to derive `DB_KEY`, never stored).

**Output:** `Config` — a frozen Pydantic-Settings object with all validated fields.

**Errors:**
- `ValidationError` if any required env var is absent.
- `GovernanceError` if `dpia.yaml` is missing/invalid or `dsa.yaml` is expired.

**Side effects:** Derives `DB_KEY` via PBKDF2 in memory. Writes nothing to disk.

---

## Layer 1 — Data Layer

### `SQLCipherDB.__init__(db_path: str, key: str) → None`

**Input:** Absolute path to the `.db` file; AES key string (derived, never stored).

**Output:** An open, encrypted SQLCipher connection. All six schema tables are guaranteed to exist after construction.

**Errors:** `DatabaseError` if the key is wrong (file exists but decrypts to garbage).

**Side effects:** Creates the `.db` file if it does not exist. Runs `schema.sql` DDL.

---

### `SQLCipherDB.execute(sql: str, params: tuple) → None`

**Input:** Parameterised SQL string; bound parameters tuple. **No f-strings or string concatenation accepted** — the method raises `TypeError` if `params` is not a tuple.

**Output:** None.

**Errors:** `sqlite3.IntegrityError` on constraint violations (e.g., duplicate compound key in outbox).

**Side effects:** Writes to the encrypted database.

---

### `AuditLogger.log(actor, action, field_names, reason, prompt_hash, session_id) → None`

```
Callers: RuleAuditor.log_blocked_attempt(), constitution.audit(),
         DossierBuilder.build(), commit_record()
```

**Input:**
- `actor: Literal["auditor", "scout", "analyst", "caseworker"]`
- `action: str` — e.g., `"rule_auditor_block"`, `"audit_pass"`, `"commit_record"`
- `field_names: list[str]` — field *names* only; the method has no `value` parameter by design
- `reason: str | None`
- `prompt_hash: str | None` — `sha256(system_prompt + serialised_inputs)`
- `session_id: str`

**Output:** None.

**Errors:** `DatabaseError` if the write fails.

**Side effects:** Appends one row to the `audit_log` table. The row is never updated or deleted — the table is append-only by application convention (no `UPDATE`/`DELETE` SQL exists in the codebase for this table).

---

### `OutboxManager.insert(household_id, entity_type, op_type, payload_hash) → str`

```
Callers: commit_record() route
```

**Input:**
- `household_id: str`
- `entity_type: str` — e.g., `"person"`, `"claim"`
- `op_type: Literal["INSERT", "UPDATE", "DELETE"]`
- `payload_hash: str` — SHA-256 of the encrypted payload blob; not the plaintext

**Output:** `uuid: str` — the new outbox row's UUID.

**Errors:** `sqlite3.IntegrityError` if the compound key `(household_id, logical_seq, device_id)` already exists — indicates a Lamport clock collision that was not detected before insert.

**Side effects:** Writes one row to `outbox` with `sync_status = "PENDING_SYNC"`.

---

### `OutboxManager.detect_collision(household_id, logical_seq, incoming_device_id) → bool`

```
Callers: sync gateway handler (Sprint 7 / v1.1)
```

**Input:**
- `household_id: str`
- `logical_seq: int`
- `incoming_device_id: str` — the device that generated the incoming record

**Output:** `True` if a record exists in `outbox` with the same `(household_id, logical_seq)` but a **different** `device_id`; `False` otherwise.

**Errors:** None — read-only query, never raises.

**Side effects:** None.

---

### `OutboxManager.quarantine(household_id, payload_hash, failure_reason, blocked_field_attempted) → str`

```
Callers: schema gate (dossier.py), constitution.audit()
```

**Input:**
- `household_id: str`
- `payload_hash: str`
- `failure_reason: str` — human-readable, e.g. `"schema_validation_error"`, `"constitution_block"`
- `blocked_field_attempted: str | None` — field **name** only, never value

**Output:** `uuid: str` — the new quarantine row's UUID.

**Errors:** `DatabaseError` on write failure.

**Side effects:** Writes one row to `quarantine_outbox` with `reviewed_at_iso = NULL`.

---

## Layer 2 — Models

### `AudioTranscriber.transcribe(wav_path: Path) → str`

```
Callers: capabilities/translation.py
```

**Input:** Absolute path to a WAV file (16 kHz mono preferred; resampled internally if not).

**Output:** Raw transcript string. May contain any Unicode character — the caller is responsible for sanitising.

**Errors:** `FileNotFoundError` if the path doesn't exist. `TranscriptionError` if the model fails.

**Side effects:** Loads the ONNX Whisper model on first call; unloads after return (`del self._model; gc.collect()`). Logs RAM usage before/after via `structlog`.

---

### `ASRSanitiser.sanitise(raw: str) → str`

```
Callers: capabilities/translation.py (immediately after AudioTranscriber.transcribe)
```

**Input:** Raw transcript string (any Unicode).

**Output:** Sanitised string, guaranteed to contain only `[A-Za-z0-9\x20-\x7E؀-ۿÀ-ž]`, maximum 2,048 characters.

**Errors:** `ValueError` if the output after sanitisation is empty (e.g., the input was entirely non-allowed characters — possible with some injection payloads).

**Side effects:** None. Pure function — no I/O, no model calls.

---

### `SuryaOCR.extract(image_path: Path) → OCRResult`

```
Callers: capabilities/dossier.py (per artifact)
```

**Input:** Absolute path to an image file (JPG, PNG, PDF page rendered to image).

**Output:** `OCRResult(lines: list[str], bboxes: list[tuple[int,int,int,int]], confidence: float)`.

**Errors:** `OCRError` if Surya fails to load or the image is unreadable.

**Side effects:** Lazy-loads Surya models; unloads after return. Logs RAM usage.

---

### `GemmaVision.extract_field(artifact_id, attribute, ocr_text, image_path) → Claim`

```
Callers: capabilities/dossier.py
```

**Input:**
- `artifact_id: str`
- `attribute: str` — one of the 7 IER fields
- `ocr_text: str` — the full OCR text for this image (from `SuryaOCR.extract`)
- `image_path: Path`

**Output:** `Claim` with `evidence.quote` guaranteed to appear in `ocr_text` (Levenshtein distance ≤ 5).

**Errors:** `GroundingError` if the model's extracted quote cannot be found in the OCR text. The caller must catch this and log it — it must **not** reach the Outbox.

**Side effects:** Calls `AnalystModel.generate()`. No direct DB writes.

---

### `AnalystModel.generate(prompt, max_tokens, temperature) → str`

```
Callers: GemmaVision, capabilities/dossier.py, capabilities/explainer.py,
         capabilities/dignity.py, auditor/prompt.py
```

**Input:**
- `prompt: str` — fully assembled prompt string (system + user, separated by hard delimiter)
- `max_tokens: int = 512`
- `temperature: float = 0.0` (deterministic by default)

**Output:** Raw model output string. No parsing done here.

**Errors:** `InferenceError` on llama.cpp failure.

**Side effects:** None beyond CPU/RAM use. Does not write to DB. Does not call external services.

---

### `AnalystModel.tool_call(tools, prompt) → ToolCallResult`

```
Callers: capabilities/dossier.py (schema translator), capabilities/translation.py
```

**Input:**
- `tools: list[dict]` — JSON-Schema tool definitions
- `prompt: str`

**Output:** `ToolCallResult(tool_name: str, arguments: dict, raw_output: str)`.

**Errors:** `ToolCallError` if the model output doesn't contain a valid tool call. The caller must handle this and not pass the result to the Outbox.

**Side effects:** None.

---

### `PiperTTS.synthesise(text, language) → Path`

```
Callers: capabilities/dignity.py, capabilities/translation.py (back-TTS check)
```

**Input:**
- `text: str` — plain text to speak (no SSML)
- `language: Literal["en", "fr", "de", "ar"]`

**Output:** `Path` to a WAV file in the system temp directory.

**Errors:** `UnsupportedLanguageError` if `language` is not in the allowed set. This is the enforcement point for the "no Masalit/Fur/Zaghawa TTS" policy.

**Side effects:** Writes a WAV file to `/tmp/globis_tts_{uuid}.wav`. Caller is responsible for cleanup.

---

## Layer 3 — Auditor

### `RuleAuditor.check(record: dict) → AuditResult`

```
Callers: constitution.audit()
```

**Input:** `record: dict` — the draft IER record as a plain Python dict. May contain any keys.

**Output:** `AuditResult(violated, reason, violated_article, blocked_field_names, requires_caseworker_review_chip, value_logged=False)`.

**Guarantee:** `AuditResult.value_logged` is **always** `False`. The method never reads or stores the *value* of any blocked field — only its key name.

**Errors:** None — this is a pure function with no I/O.

**Side effects:** None. The caller (`constitution.audit()`) is responsible for calling `log_blocked_attempt()`.

---

### `RuleAuditor.log_blocked_attempt(audit_result, session_id, prompt_hash) → None`

```
Callers: constitution.audit() — called only when audit_result.violated is True
```

**Input:** `audit_result: AuditResult`, `session_id: str`, `prompt_hash: str`.

**Output:** None.

**Side effects:** Emits a `structlog` WARNING with `blocked_field_names`, `value_logged=False`, `requires_caseworker_review_chip`. Calls `AuditLogger.log()` to persist to DB.

---

### `PromptAuditor.check(record: dict, session_id: str) → PromptAuditResult`

```
Callers: constitution.audit() — called only if RuleAuditor.check() returns violated=False
```

**Input:** `record: dict` — the draft IER record **after** Rule Pass has already stripped any prohibited fields.

**Output:** `PromptAuditResult(verdict: Literal["PASS","BLOCK"], reason: str, prompt_hash: str)`.

**Errors:** `InferenceError` if the LLM call fails. `constitution.audit()` must handle this and default to `BLOCK` (fail-safe).

**Side effects:** Calls `ScoutModel.generate()`. No DB writes — the caller handles logging.

---

### `constitution.audit(draft_record: dict, session_id: str) → AuditResult`

```
Callers: api/routes/synthesise.py (after dossier build)
         api/routes/commit.py (final gate before Outbox)
```

**Input:** `draft_record: dict`, `session_id: str`.

**Output:** `AuditResult`. If `violated = True`, the record must not proceed to the Outbox. If `violated = False`, the record may be passed to `commit_record`.

**Errors:** Any `InferenceError` from `PromptAuditor` is caught internally and converts to `AuditResult(violated=True, reason="inference_failure")` — fail-safe.

**Side effects:**
1. Calls `RuleAuditor.check()`.
2. If violated: calls `RuleAuditor.log_blocked_attempt()`, calls `OutboxManager.quarantine()`, returns immediately.
3. If not violated: calls `PromptAuditor.check()`.
4. If Prompt Pass blocks: calls `AuditLogger.log()`, calls `OutboxManager.quarantine()`.
5. If Prompt Pass passes: calls `AuditLogger.log(action="audit_pass")`.

---

## Layer 4 — Capabilities

### `translate(text_or_audio_ref, source_lang_hint, target_lang, session_id) → TranslationResult`

```
Callers: api/routes/translate.py
```

**Input:**
- `text_or_audio_ref: str` — either raw text or a file path to a WAV artifact
- `source_lang_hint: Literal["en","fr","de","ar-SD","ar-TD","auto"]`
- `target_lang: Literal["en","fr","de","ar-SD","ar-TD"]`
- `session_id: str`

**Output:** `TranslationResult(translation: str | None, detected_language: str, dialect_confidence: float, route_to_human_interpreter: bool, cultural_note: str | None)`.

**Contract:** If `route_to_human_interpreter = True`, then `translation` is **always** `None`. The API must not return a translation alongside a routing flag.

**Errors:** `SanitisationError` if ASR output is empty after sanitisation (caller logs and returns HTTP 422).

**Side effects:** Calls `AuditLogger.log(action="translation_turn")`. Calls `PiperTTS` for back-translation check (silent; result used internally only).

---

### `DossierBuilder.build(artifact_paths, session_id) → Person`

```
Callers: api/routes/synthesise.py
```

**Input:**
- `artifact_paths: list[Path]` — paths to ingested artifacts (already in the `artifacts` table)
- `session_id: str`

**Output:** `Person` with all claims populated and each claim's `evidence.quote` verified against OCR text.

**Contract:** Every `Claim` in the returned `Person` has `evidence` with at least one `Evidence` entry, and that entry's `quote` appears in the source artifact's OCR text (Levenshtein ≤ 5). Claims that fail grounding are logged and excluded — they do not appear in the returned `Person`.

**Errors:** `InsufficientGroundingError` if fewer than 4 of the 7 IER fields can be grounded across all artifacts (the dossier cannot be safely committed).

**Side effects:** Writes `Claim` and `Evidence` rows to the database. Calls `AuditLogger.log(action="dossier_build")`.

---

### `explain(source_document, target_language, country_context, session_id) → ExplainerResult`

```
Callers: api/routes/explain.py
```

**Input:**
- `source_document: str` — the bureaucratic text (Bescheid, decision letter, etc.)
- `target_language: Literal["en","fr","de","ar-SD","ar-TD"]`
- `country_context: Literal["DE","GR","UG","TD","generic"]`
- `session_id: str`

**Output:** `ExplainerResult(stage_a_faithful: str, stage_b_plain: str, backtranslation_check: dict, load_bearing_terms: list[str])`.

**Side effects:** Calls `AuditLogger.log(action="explainer_run")`. Does not write to `persons` or `claims` tables.

---

### `dignity_loop(person, language, session_id) → DignityLoopResult`

```
Callers: api/routes/dignity.py
```

**Input:**
- `person: Person` — the fully built, audited Person record
- `language: Literal["en","fr","de","ar"]`
- `session_id: str`

**Output:** `DignityLoopResult(wav_path: Path, summary_text: str, language: str)`.

**Contract:** Does **not** write to the database. The `commit_record` route is responsible for persisting the Dignity Loop confirmation after the caseworker taps Commit. Separating these two actions means a Dignity Loop play never implies a commit.

**Errors:** `UnsupportedLanguageError` if `language` is not in the Piper-supported set (propagated from `PiperTTS`).

**Side effects:** Writes a WAV file to `/tmp/`. Calls `AuditLogger.log(action="dignity_loop_play")`.

---

## Layer 5 — API surface

### `POST /synthesise` → `Person` (as JSON)

**Input:** `{session_id, artifact_ids: list[str]}`

**Contract:** Calls `DossierBuilder.build()` → `constitution.audit()`. If audit fails, returns HTTP 200 with `{"status": "quarantined", "quarantine_uuid": str}` — not HTTP 4xx, because quarantine is a normal workflow state, not a client error.

---

### `POST /commit`

**Input:** `{session_id, person_id, auditor_status: "clean", dignity_confirmed: true}`

**Contract:** Refuses to proceed if `auditor_status != "clean"` (HTTP 422). Refuses to proceed if `dignity_confirmed != true` (HTTP 422). On success: calls `OutboxManager.insert()`, calls `AuditLogger.log(action="commit_record")`, returns HTTP 201.

**This is the only endpoint that writes to `outbox`.** No other route touches the Outbox.

---

### `GET /quarantine/count`

**Contract:** Returns `{"total_count": int, "unreviewed_count": int, "oldest_quarantine_iso": str | null}` within 100 ms. No model calls. Pure DB read.

---

### `POST /quarantine/{uuid}/review-complete`

**Contract:** Sets `reviewed_at_iso` on the quarantine row. Does **not** delete the row — the quarantine table is append-only by convention. Returns HTTP 404 if the UUID does not exist.

---

## Cross-cutting contracts

### Prompt hash

Every call that invokes a model must compute and log a `prompt_hash`:

```python
prompt_hash = sha256(
    (system_prompt + "|||" + json.dumps(user_inputs, sort_keys=True)).encode()
).hexdigest()
```

The hash is stored in `audit_log.prompt_hash` and in the `AuditResult`. It is never the content of the prompt — only its fingerprint.

### No raw PII in the Outbox row

The `outbox` and `quarantine_outbox` tables store `payload_hash` (a SHA-256 of the encrypted payload blob), not the payload itself. The actual person data lives in the `persons`/`claims` tables, encrypted by SQLCipher. The Outbox row is safe to sync without re-encryption.

### Model calls are never made from within the data layer

`SQLCipherDB`, `AuditLogger`, and `OutboxManager` never import from `models/`. The dependency arrow goes: `models → capabilities → api`. The data layer is at the bottom and has no upward dependencies.

### The auditor is always called before the Outbox

`constitution.audit()` is always called before `OutboxManager.insert()`. The `commit_record` route enforces this by requiring `auditor_status = "clean"` as an input parameter — which can only come from a successful `AuditResult`.

---

*If any contract in this document is violated during implementation, stop and update this file before proceeding.*
