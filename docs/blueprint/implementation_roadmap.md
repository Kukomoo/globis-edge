# Globis Edge 2.0 — Implementation Roadmap

**Author:** Lead Software Architect  
**Date:** May 16, 2026  
**Companion:** `module_contracts.md`, `verification_plan.md`  
**Rule:** Each sprint must reach its Definition of Done before the next sprint begins. No exceptions.

---

## Sprint overview

| Sprint | Theme | Duration (est.) | Depends on |
|---|---|---|---|
| 1 | Core Data Layer & Governance | 1 day | — |
| 2 | ASR Pipeline & Sanitisation | 1 day | Sprint 1 |
| 3 | Constitutional Auditor | 1 day | Sprint 1 |
| 4 | OCR & Dossier Reconstruction | 1–2 days | Sprint 1, 2 |
| 5 | Model Loaders & Inference Shell | 1–2 days | Sprint 1 |
| 6 | Capabilities Layer | 2 days | Sprint 3, 4, 5 |
| 7 | FastAPI Server & Quarantine Badge | 1 day | Sprint 3, 6 |
| 8 | Synthetic Scenarios, Evals & Notebook | 2 days | Sprint 6, 7 |

Total estimated build time: **10–11 focused days.**

---

## Sprint 1 — Core Data Layer & Governance

**Goal:** The encrypted database and governance runtime are the foundation everything else writes to. Nothing else is built until these are provably correct.

### Files to create

```
src/globis_edge/__init__.py
src/globis_edge/config.py
src/globis_edge/store/__init__.py
src/globis_edge/store/schema.sql
src/globis_edge/store/sqlcipher.py
src/globis_edge/store/audit_log.py
governance/dpia.yaml
governance/dsa.yaml
tests/unit/store/test_sqlcipher.py
tests/unit/store/test_audit_log.py
tests/unit/store/test_outbox.py        ← already written; add to test suite
```

### What each file does

`config.py` — Pydantic-Settings model reading from `.env`. Exports: `DB_PATH`, `DEVICE_ID`, `DB_KEY` (derived at runtime, never stored), `GOVERNANCE_DIR`, `LAN_INTERFACE`. Fails fast if any required field is absent.

`store/schema.sql` — Canonical DDL for all six tables: `persons`, `claims`, `evidence`, `artifacts`, `specific_needs`, `audit_log`, `explainers`, `outbox`, `quarantine_outbox`. This is the single source of truth; all other files reference it.

`store/sqlcipher.py` — `SQLCipherDB` context manager. Opens the SQLCipher connection, applies the `PRAGMA key`, runs `schema.sql` if tables don't exist, exposes `execute()` / `fetchone()` / `fetchall()` / `transaction()`. Never exposes the raw connection outside this module.

`store/audit_log.py` — `AuditLogger` class. Single public method: `log(actor, action, field_names, reason, prompt_hash, session_id)`. Writes to `audit_log` table. Field names only — method signature makes it structurally impossible to pass a value.

`store/outbox.py` — Already written. Integrate into the test suite. The `OutboxManager` must use `SQLCipherDB` rather than opening its own connection.

`governance/dpia.yaml` — Synthetic governance file with `version`, `hash`, `purpose_limitation`, `data_minimisation_statement`, `retention_policy`.

`governance/dsa.yaml` — Synthetic DSA with `partner`, `expiry_date` (set 12 months ahead), `permitted_fields` (IER only), `authoriser`.

### Startup sequence (implemented in `config.py`)

```python
def bootstrap() -> Config:
    cfg = Config()                          # fails if env vars missing
    _validate_governance(cfg.GOVERNANCE_DIR)  # fails if dpia/dsa bad
    _derive_db_key(cfg)                     # PBKDF2 from PIN + salt
    return cfg
```

### Definition of Done

- [ ] `pytest tests/unit/store/` passes with zero failures and zero warnings
- [ ] `test_sqlcipher.py`: database is encrypted — opening the `.db` file as plain text returns garbage
- [ ] `test_audit_log.py`: `log()` with a value argument raises `TypeError` (the method does not accept a `value` parameter)
- [ ] `test_outbox.py`: compound-key collision detection test (Device A seq=1 + Device B seq=1 → collision; same device seq=1 → no collision)
- [ ] `python -c "from globis_edge.config import bootstrap; bootstrap()"` succeeds with valid governance files and exits with code 1 when `dsa.yaml` is missing or expired
- [ ] No SQLite stdlib import anywhere in `src/` — only `pysqlcipher3`

---

## Sprint 2 — ASR Pipeline & Sanitisation

**Goal:** Audio goes in; sanitised, injection-safe text comes out. This is the security perimeter for everything that follows.

### Files to create

```
src/globis_edge/models/__init__.py
src/globis_edge/models/audio.py
src/globis_edge/capabilities/__init__.py
src/globis_edge/capabilities/sanitiser.py
tests/unit/models/test_audio.py
tests/unit/capabilities/test_sanitiser.py
tests/adversarial/test_asr_injection.py
```

### What each file does

`models/audio.py` — `AudioTranscriber` class. `transcribe(wav_path: Path) -> str`. On Pi 5: HF transformers + ONNX runtime, `openai/whisper-small`. On Android fallback: LiteRT/MediaPipe path (stub in v1). Lazy-loads model on first call; unloads after use (`del self._model; gc.collect()`). Returns raw transcript string — no cleaning done here.

`capabilities/sanitiser.py` — `ASRSanitiser` class. `sanitise(raw: str) -> str`. Two steps, always in order:
1. Truncate to 2,048 characters.
2. Strip characters outside `[A-Za-z0-9\x20-\x7E؀-ۿÀ-ž]`.

Returns sanitised string. Raises `ValueError` if output is empty after sanitisation. This class has no model dependency — it is pure Python and must be testable without any ML library installed.

### Definition of Done

- [ ] `pytest tests/unit/models/test_audio.py` passes using mock WAV fixture (no GPU required)
- [ ] `pytest tests/unit/capabilities/test_sanitiser.py` passes: 2,048-char truncation verified; disallowed characters stripped; empty-output `ValueError` raised
- [ ] `pytest tests/adversarial/test_asr_injection.py` passes: all 10 injection payloads (prompt-delimiter injection, role-switch attempts, SQL injection strings, null bytes, overlong Unicode sequences) are stripped to harmless output or raise `ValueError`
- [ ] `sanitiser.py` has zero imports from `transformers`, `llama_cpp`, or any ML library
- [ ] Round-trip test: sanitised output re-sanitised → identical result (idempotency)

---

## Sprint 3 — Constitutional Auditor

**Goal:** The safety gate. The rule layer must be provably deterministic; the prompt layer must be wired to a real model call. Both must be independently testable.

### Files to create

```
src/globis_edge/auditor/__init__.py
src/globis_edge/auditor/rules.py          ← already written; integrate
src/globis_edge/auditor/prompt.py
src/globis_edge/auditor/constitution.py
CONSTITUTION.md
prompts/auditor.md
tests/unit/auditor/test_rules.py
tests/unit/auditor/test_prompt.py
tests/adversarial/test_auditor_25.py
```

### What each file does

`auditor/rules.py` — Already written. Wire into `SQLCipherDB` for log writes. Ensure `log_blocked_attempt()` calls `AuditLogger.log()` — not a raw DB write.

`auditor/prompt.py` — `PromptAuditor` class. `check(record: dict, session_id: str) -> PromptAuditResult`. Calls Gemma 4 E2B with the `prompts/auditor.md` system prompt. Returns `PromptAuditResult(verdict: Literal["PASS","BLOCK"], reason: str, prompt_hash: str)`. The prompt hash is `sha256(system_prompt + json.dumps(record, sort_keys=True))` — logged, never the record content.

`auditor/constitution.py` — `audit(draft_record: dict, session_id: str) -> AuditResult`. Orchestrates Rule Pass → Prompt Pass. If Rule Pass returns `violated=True`, Prompt Pass is **skipped** (the record is already quarantined). Returns the combined `AuditResult`. This is the only entry point the rest of the application calls.

`CONSTITUTION.md` — The seven articles in plain English. Citable. Includes Article 31 and ExCom No. 8 references.

`prompts/auditor.md` — System prompt for the Prompt Pass. Seven articles, explicit output format (`{"verdict": "PASS"|"BLOCK", "reason": "...max 40 words"}`), and one worked example each of a PASS and a BLOCK.

### Definition of Done

- [ ] `pytest tests/unit/auditor/test_rules.py` passes: 8 rule tests (clean record, each prohibited field, each score field, missing IER field, egress-without-authoriser)
- [ ] `pytest tests/unit/auditor/test_prompt.py` passes against a mocked LLM response (no real model required in unit tests)
- [ ] `pytest tests/adversarial/test_auditor_25.py` passes: 25 adversarial prompts → 0 leaks of prohibited field values into the audit log (verified by inspecting the `audit_log` table after each run)
- [ ] Rule Pass timing: `assert rule_result_time < 0.05` (50 ms) in all 25 adversarial tests
- [ ] `audit()` called with a record containing `political_affiliation` → `AuditResult.violated = True`, `blocked_field_names = ["political_affiliation"]`, `value_logged = False`, quarantine row created, `audit_log` row created with field name only
- [ ] `audit()` called with a clean 7-field IER record → `AuditResult.violated = False`, no quarantine row, `audit_log` row with `action = "audit_pass"`

---

## Sprint 4 — OCR & Dossier Reconstruction

**Goal:** A pile of six artifact files becomes a provenance-grounded, field-level JSON dossier. Every field must trace to its source quote in the OCR text.

### Files to create

```
src/globis_edge/models/ocr.py
src/globis_edge/models/vision.py
src/globis_edge/capabilities/dossier.py
src/globis_edge/linking/__init__.py
src/globis_edge/linking/splink_setup.py
src/globis_edge/linking/transliteration.py
src/globis_edge/consistency/__init__.py
src/globis_edge/consistency/conflict_chip.py
synthetic_cases/aisha/manifest.json
synthetic_cases/aisha/caseworker_note.txt
synthetic_cases/aisha/voicenote_mother.transcript.txt
tests/unit/models/test_ocr.py
tests/unit/capabilities/test_dossier.py
tests/unit/consistency/test_conflict_chip.py
```

### What each file does

`models/ocr.py` — `SuryaOCR` class. `extract(image_path: Path) -> OCRResult`. Lazy-loads Surya models; unloads after use. `OCRResult` carries: `lines: list[str]`, `bboxes: list[tuple[int,int,int,int]]`, `confidence: float`. Raw text only — no interpretation.

`models/vision.py` — `GemmaVision` wrapper. `extract_field(artifact_id: str, attribute: str, ocr_text: str, image_path: Path) -> Claim`. Calls Gemma 4 E4B with the `dossier_extraction.md` prompt. **Validates that `claim.evidence.quote` appears in `ocr_text` (Levenshtein ≤ 5) before returning.** Raises `GroundingError` if the quote doesn't ground.

`capabilities/dossier.py` — `DossierBuilder` class. `build(artifact_paths: list[Path], session_id: str) -> Person`. Orchestrates: OCR → vision extraction per artifact → `splink_setup` record linkage → merge claims into `Person`. Each claim carries `artifact_source_id`. Returns a `Person` with all claims and their provenance chain.

`linking/splink_setup.py` — `link_entities(claims: list[Claim]) -> list[list[str]]`. Uses Splink (DuckDB backend) to cluster claims into person-records by name + DOB + origin fuzzy matching.

`linking/transliteration.py` — `normalise(text: str) -> str`. Applies `aksharamukha` + `unidecode` for cross-script name matching. Used by `splink_setup` as a preprocessing step.

`consistency/conflict_chip.py` — `detect_conflicts(person: Person) -> list[ConflictChip]`. Compares attribute values across claims from different artifact sources. Returns `ConflictChip(attribute, value_a, source_a, value_b, source_b, reasoning_trace)`. Never modifies the `Person` — purely diagnostic.

### Definition of Done

- [ ] `pytest tests/unit/models/test_ocr.py` passes using a synthetic image fixture (no GPU required — mock Surya output)
- [ ] `pytest tests/unit/capabilities/test_dossier.py`: `build()` with Aisha's 3-artifact subset returns a `Person` where every claim has a non-empty `evidence.quote` that appears in the OCR text
- [ ] `GroundingError` is raised if a mocked vision extraction returns a quote not present in OCR text
- [ ] `pytest tests/unit/consistency/test_conflict_chip.py`: two claims with the same `attribute` but different `value` from different artifact sources → one `ConflictChip` returned; same value → no chip
- [ ] `detect_conflicts()` never modifies the `Person` object (verify with `id()` before/after)

---

## Sprint 5 — Model Loaders & Inference Shell

**Goal:** Both Gemma models load cleanly within the RAM budget and produce structured JSON outputs via guided decoding. This sprint is isolated — it has no dependency on Sprints 2–4 and can run in parallel if needed.

### Files to create

```
src/globis_edge/models/analyst.py
src/globis_edge/models/scout.py
src/globis_edge/models/tts.py
prompts/translation.md
prompts/dossier_extraction.md
prompts/dossier_synthesis.md
prompts/explainer.md
prompts/glossary.md
prompts/dignity_loop.md
tests/unit/models/test_analyst.py
tests/unit/models/test_scout.py
tests/unit/models/test_tts.py
```

### What each file does

`models/analyst.py` — `AnalystModel`. Wraps `llama-cpp-python` loading Gemma 4 E4B Q4_K_M. `generate(prompt: str, max_tokens: int = 512, temperature: float = 0.0) -> str`. Exposes `tool_call(tools: list[dict], prompt: str) -> ToolCallResult` for native function calling. Lazy-loads; measures and logs RAM before/after load.

`models/scout.py` — `ScoutModel`. Same interface as `AnalystModel` but loads Gemma 4 E2B Q4_K_M. On Pi 5 (Scout-on-Pi mode), shares the llama.cpp runtime.

`models/tts.py` — `PiperTTS`. `synthesise(text: str, language: str) -> Path` — writes a WAV file to a temp directory and returns the path. Supported `language` codes: `en`, `fr`, `de`, `ar`. Raises `UnsupportedLanguageError` for anything else (including Masalit/Fur/Zaghawa — handled by routing, not TTS).

Prompt files — Each is a standalone Markdown file with a `## System` section and a `## User template` section. The system section is the literal system prompt. The user template uses `{variable}` placeholders that are filled at call time. The `auditor.md` prompt hash is computed over the system section only.

### Definition of Done

- [ ] `pytest tests/unit/models/test_analyst.py` passes with a mocked llama.cpp call (no real GGUF required in CI)
- [ ] RAM log after `AnalystModel` load: `assert ram_used_gb < 3.5` (verified in integration test on real Pi 5)
- [ ] `tool_call()` with the `map_to_schema` tool definition returns a `ToolCallResult` with `tool_name = "map_to_schema"` and a non-empty `arguments` dict
- [ ] `PiperTTS.synthesise("Hello", "fr")` returns a valid WAV path; file is non-empty
- [ ] `PiperTTS.synthesise("Hello", "ms")` raises `UnsupportedLanguageError`
- [ ] All six prompt files load without error; each has a `## System` section and a `## User template` section with at least one `{variable}` placeholder

---

## Sprint 6 — Capabilities Layer

**Goal:** The four user-facing capabilities are wired end-to-end using the models from Sprint 5 and the data layer from Sprint 1. Each capability is independently callable and independently testable.

### Files to create

```
src/globis_edge/capabilities/translation.py
src/globis_edge/capabilities/explainer.py
src/globis_edge/capabilities/glossary.py
src/globis_edge/capabilities/dignity.py
tests/unit/capabilities/test_translation.py
tests/unit/capabilities/test_explainer.py
tests/unit/capabilities/test_glossary.py
tests/unit/capabilities/test_dignity.py
tests/integration/test_full_translation_turn.py
```

### What each file does

`capabilities/translation.py` — `translate(text_or_audio_ref: str, source_lang_hint: str, target_lang: str, session_id: str) -> TranslationResult`. Calls `ASRSanitiser` if input is an audio ref; calls `ScoutModel.generate()` with `translation.md` prompt. Returns `TranslationResult(translation, detected_language, dialect_confidence, route_to_human_interpreter, cultural_note)`. If `dialect_confidence > 0.7` and language is in `{Masalit, Fur, Zaghawa}`, sets `route_to_human_interpreter = True` and returns immediately — no translation produced.

`capabilities/explainer.py` — `explain(source_document: str, target_language: str, country_context: str, session_id: str) -> ExplainerResult`. Four-stage pipeline: Stage A (faithful summary, AnalystModel), Stage B (plain-language rewrite, AnalystModel), Stage C (back-translation check, ScoutModel), Stage D (glossary terms identified, ScoutModel). Returns `ExplainerResult(stage_a, stage_b, backtranslation_check, load_bearing_terms)`.

`capabilities/glossary.py` — `compile_glossary(explainer_text: str, target_language: str) -> GlossaryResult`. Calls ScoutModel with `glossary.md` prompt. Returns `GlossaryResult(front_loaded, inline_definitions, end_glossary)`. Each glossary term is `GlossaryTerm(term, definition, placement)`.

`capabilities/dignity.py` — `dignity_loop(person: Person, language: str, session_id: str) -> DignityLoopResult`. Calls `AnalystModel.generate()` with `dignity_loop.md` prompt to produce the spoken record summary. Calls `PiperTTS.synthesise()`. Returns `DignityLoopResult(wav_path, summary_text, language)`. Does **not** write to the database — the caller (`commit_record`) does that after caseworker confirmation.

### Definition of Done

- [ ] `pytest tests/unit/capabilities/` — all four capability modules pass with mocked models
- [ ] `translate()` with a Masalit-labelled input → `route_to_human_interpreter = True`, `translation = None`
- [ ] `translate()` with clean French input → `translation` is non-empty, `route_to_human_interpreter = False`
- [ ] `explain()` with a synthetic Bescheid text → `stage_b` text passes style-guide check (Flesch–Kincaid grade ≤ 8, or equivalent)
- [ ] `dignity_loop()` returns a WAV file > 0 bytes; `summary_text` contains at least 3 of the 7 IER field values from the Person
- [ ] `pytest tests/integration/test_full_translation_turn.py` — audio WAV in → sanitised text → Scout translation → `TranslationResult` — end to end with real Scout model on Pi 5

---

## Sprint 7 — FastAPI Server & Quarantine Badge

**Goal:** The REST API is live on the Pi 5 LAN interface. All endpoints are reachable from the Scout. The quarantine badge endpoint drives the UI counter.

### Files to create

```
src/globis_edge/api/__init__.py
src/globis_edge/api/server.py
src/globis_edge/api/schemas.py
src/globis_edge/api/routes/__init__.py
src/globis_edge/api/routes/session.py
src/globis_edge/api/routes/translate.py
src/globis_edge/api/routes/ingest.py
src/globis_edge/api/routes/synthesise.py
src/globis_edge/api/routes/explain.py
src/globis_edge/api/routes/commit.py
src/globis_edge/api/routes/dignity.py
src/globis_edge/api/quarantine_badge.py   ← already written; integrate
src/globis_edge/cli.py
tests/integration/test_api_endpoints.py
```

### What each file does

`api/server.py` — FastAPI `app`. Mounts all routers. Sets CORS to LAN origin only. Binds to the Wi-Fi AP interface (never `0.0.0.0`). Attaches `OutboxManager` and `SQLCipherDB` to `app.state` on startup so routers access them via `Depends`.

`api/schemas.py` — Pydantic v2 models for every request/response body. One model per endpoint. These are the wire format — separate from the internal dataclasses.

Route files — Each route file contains exactly one router with one or two endpoints. Each route calls a capability function and returns a Pydantic schema. No business logic lives in route files.

`cli.py` — Typer CLI. `globis-edge serve` starts Uvicorn. `globis-edge wipe` calls `admin/wipe`. `globis-edge check-governance` runs the startup governance validation without starting the server.

### Definition of Done

- [ ] `pytest tests/integration/test_api_endpoints.py` — all 9 endpoints return expected status codes with synthetic payloads (mocked capability functions, real FastAPI routing)
- [ ] `GET /quarantine/count` returns `{"total_count": 0, "unreviewed_count": 0, "oldest_quarantine_iso": null}` on a fresh database
- [ ] After injecting one quarantine row, `GET /quarantine/count` returns `unreviewed_count: 1`; after `POST /quarantine/{uuid}/review-complete`, `unreviewed_count: 0`
- [ ] Server binds to `192.168.x.x` and refuses a request that arrives on `0.0.0.0` / external interface
- [ ] `globis-edge check-governance` exits 0 with valid files; exits 1 with missing `dsa.yaml`
- [ ] `POST /commit` with `auditor_status != "clean"` returns HTTP 422

---

## Sprint 8 — Synthetic Scenarios, Evals & Notebook

**Goal:** Both demo scenarios run end-to-end on the Pi 5. All seven eval cells produce values that meet their published targets. The Kaggle Notebook runs from top to bottom on a fresh kernel.

### Files to create

```
synthetic_cases/aisha/manifest.json
synthetic_cases/aisha/passport_torn.jpg          ← synthetic watermarked image
synthetic_cases/aisha/unhcr_token.jpg
synthetic_cases/aisha/whatsapp_certificate.png
synthetic_cases/aisha/school_certificate.jpg
synthetic_cases/aisha/voicenote_mother.wav       ← synthetic TTS audio
synthetic_cases/aisha/voicenote_mother.transcript.txt
synthetic_cases/aisha/caseworker_note.txt
synthetic_cases/yusuf/manifest.json
synthetic_cases/yusuf/                           ← analogous structure
eval/PLAN.md
eval/data/                                       ← test fixtures for each eval
eval/runners/run_dialect.py
eval/runners/run_dossier.py
eval/runners/run_provenance.py
eval/runners/run_auditor.py
eval/runners/run_comprehension.py
eval/runners/run_style.py
eval/runners/run_latency.py                      ← already written
notebook.ipynb                                   ← 21-section Kaggle notebook
reproduce.sh
DATA_ETHICS_STATEMENT.md
README.md
```

### Definition of Done

- [ ] Scenario A (Aisha) runs end-to-end on Pi 5: `bash reproduce.sh scenario_a` completes without error; Dignity Loop WAV file is produced; committed record JSON has all 7 IER fields
- [ ] Scenario B (Yusuf) runs end-to-end on Pi 5: `bash reproduce.sh scenario_b` completes; `political_affiliation` field is blocked by Rule Pass; quarantine badge count = 1; audit log contains the blocked field name but not its value
- [ ] All seven eval runners produce output meeting the published targets (see PRD §Evaluation plan)
- [ ] `notebook.ipynb` runs cell-by-cell on a fresh Kaggle kernel without error; Section 19 benchmark produces a histogram PNG
- [ ] Every synthetic artifact file contains a visible "SYNTHETIC SCENARIO" watermark
- [ ] `reproduce.sh` runs on a clean clone of the repo with only model weights pre-downloaded
- [ ] `README.md` and `DATA_ETHICS_STATEMENT.md` are complete and accurate

---

## What we are explicitly not building in this sprint plan

These items appear in the PRD as roadmap/narrative. They are not in any sprint:

- Android Kotlin app (Sprint 1–7 are Pi 5 / Python only)
- OpenFn / PING gateway integration
- Biometric deduplication
- SSI wallet
- Hierarchical Federated Learning
- M[X]/M/1 burst sync (Lamport counter is in place as the upgrade path)
- Unsloth fine-tune (deep-lane, post-submission)
- Greek language support

---

*Awaiting approval before Sprint 1 begins.*
