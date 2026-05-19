# Globis Edge 2.0 — Technical Specification

**Author:** Nada Khas
**Version:** Final (1.0)
**Date:** May 16, 2026
**Companion to:** `PRD_FINAL.md`, `UIUX_SPECIFICATION.md`

This document is the implementation contract. Anything in the PRD that contradicts this spec is wrong; this spec is canonical.

---

## 1. System overview

Globis Edge 2.0 runs as two cooperating processes on two devices, in airplane mode, against an encrypted local store:

```
+--------------------------------------+        +-----------------------------------+
|  ANDROID SCOUT (mid-tier handset)    |        |  RASPBERRY PI 5 ANALYST (8 GB)    |
|  Role: UI, fast turns, audio capture |        |  Role: heavy reasoning, vision    |
|                                      |  LAN   |                                   |
|  - Gemma 4 E2B (Q4_K_M / INT4)       |<------>|  - Gemma 4 E4B (Q4_K_M)           |
|  - LiteRT / MediaPipe (native audio) |  REST  |  - llama.cpp / llama-cpp-python   |
|  - Piper TTS (fr, ar, en, de)        |        |  - HF transformers (audio fallback)|
|  - SQLite (cached glossaries)        |        |  - Surya OCR                      |
|  - Reqwest/Retrofit (REST client)    |        |  - Splink (record linkage)        |
|                                      |        |  - SQLCipher (canonical store)    |
|                                      |        |  - FastAPI (local REST server)    |
+--------------------------------------+        +-----------------------------------+
```

- The Scout owns the **caseworker UI**, **audio capture**, and **fast translation turns**.
- The Analyst owns the **canonical store**, **dossier reconstruction**, **plain-language explainer**, and the **Constitutional Auditor**.
- Communication between them is HTTP over a local Wi-Fi link (the Pi 5 hosts a private AP) or USB tethering. **There is no internet path. The runtime refuses to start with a default route that points outside 192.168.0.0/16.**

For the hackathon demo, both processes can also run on the Pi 5 (Scout-on-Pi mode) so the notebook is reproducible without an Android device. The Android path is the production target.

---

## 2. Hardware specification

### 2.1 Raspberry Pi 5 Analyst (canonical hardware for hackathon)

| Component | Choice | Rationale |
|---|---|---|
| SBC | Raspberry Pi 5, 8 GB | Cortex-A76 quad-core, 2.4 GHz; enough RAM for E4B Q4_K_M |
| Storage | NVMe SSD via PCIe HAT (256 GB) | Model weights are ~5 GB; raw SD card is too slow for cold load |
| Cooling | Official active cooler | Sustained inference will hit thermal throttling without it |
| PSU | Official 27 W USB-C | Anything less throttles under load |
| Display | 7-inch HDMI display | For the on-camera shot of the demo |
| Audio in | USB cardioid microphone | For voice-note capture in the demo |
| Network | Wi-Fi disabled at boot; Ethernet only when explicitly enabled | Default state is offline |

### 2.2 Android Scout (production target)

| Component | Minimum | Target |
|---|---|---|
| SoC | Snapdragon 7 Gen 2 or equivalent | Snapdragon 8 Gen 3 |
| RAM | 6 GB (E2B INT4 fits) | 8 GB |
| Storage | 8 GB free | 16 GB free |
| OS | Android 13+ | Android 14+ |
| NPU | Optional | Required for native LiteRT audio path |

---

## 3. Software stack

### 3.1 Pi 5 Analyst stack

```
Layer                  Choice                          Pin
------------------------------------------------------------------
OS                     Raspberry Pi OS Lite (64-bit)   bookworm
Python                 CPython 3.11                    3.11.x
Runtime container      systemd unit + venv             —

LLM runtime            llama.cpp                       latest stable
LLM bindings           llama-cpp-python                ≥0.2.90
Model (Analyst)        Gemma 4 E4B Q4_K_M GGUF         official mmproj
Model (audio fallback) Gemma 4 E4B safetensors         via HF transformers
Audio (Pi)             HF transformers + ONNX runtime  ≥4.43 / 1.18

OCR                    Surya                           ≥0.5
Doc preprocessing      OpenCV-Python                   ≥4.9
Image utilities        Pillow                          ≥10.3

Record linkage         Splink (DuckDB backend)         ≥4.0
Fuzzy matching         rapidfuzz                       ≥3.6
Transliteration        aksharamukha, unidecode         ≥2.2, ≥1.3

TTS                    Piper                           ≥1.2
TTS voices             fr_FR-siwis-medium,             —
                       ar_JO-kareem-low (Arabic MSA),
                       en_GB-alan-medium,
                       de_DE-thorsten-medium

API server             FastAPI + Uvicorn               ≥0.111 / ≥0.30
Validation             Pydantic v2                     ≥2.7
Encrypted DB           SQLCipher + pysqlcipher3        ≥3.4
Plain SQLite           sqlite3 stdlib                  —

Logging                structlog                       ≥24.1
Config                 pydantic-settings + .env        ≥2.3
Test                   pytest + pytest-asyncio         ≥8 / ≥0.23

Notebook               Jupyter Lab                     ≥4.2
```

### 3.2 Android Scout stack

```
Layer                  Choice                          Pin
------------------------------------------------------------------
Language               Kotlin                          1.9.x
Build                  Gradle 8 + Android Studio       Hedgehog+
Min SDK                26 (Android 8.0)                —
Target SDK             34 (Android 14)                 —

LLM runtime            MediaPipe LLM Inference         ≥0.10.18
Model (Scout)          Gemma 4 E2B INT4 .task          official
Audio path             LiteRT (MediaPipe Audio)        ≥0.10.18
TTS                    Piper Android port              ≥1.2

Network                Retrofit + OkHttp               2.11 / 4.12
Serialization          kotlinx.serialization           1.6
UI                     Jetpack Compose                 1.6+
Material                Material 3                     —

Local storage          Room + SQLCipher Android        2.6 / 4.5
Permissions            ActivityResult API              —

Test                   JUnit5 + Robolectric            —
```

### 3.3 Optional Unsloth fine-tune stack (deep-lane)

```
Compute                Single L4 / 4080-class GPU      ≥20 GB VRAM
Trainer                Unsloth                         latest
Adapter                LoRA                            r=16, alpha=32
Corpus                 200-example procedural-glossary corpus
Eval                   built-in style-guide adherence  —
Output                 HF safetensors + GGUF Q4_K_M    —
```

---

## 4. Project structure

```
globis-edge/
├── PRD_FINAL.md
├── TECHNICAL_SPECIFICATION.md
├── UIUX_SPECIFICATION.md
├── README.md
├── CONSTITUTION.md
├── DATA_ETHICS_STATEMENT.md
├── PROJECT_STRUCTURE.md
├── CONTRIBUTING.md
├── REPRODUCE.md
├── LICENSE
├── .gitignore
├── reproduce.sh
├── pyproject.toml
├── requirements.txt
├── Makefile
│
├── governance/
│   ├── dpia.yaml
│   └── dsa.yaml
│
├── prompts/
│   ├── SYSTEM_PROMPTS.md
│   ├── translation.md
│   ├── dossier_extraction.md
│   ├── dossier_synthesis.md
│   ├── explainer.md
│   ├── glossary.md
│   ├── auditor.md
│   └── dignity_loop.md
│
├── src/globis_edge/
│   ├── __init__.py
│   ├── config.py
│   ├── models/                # Gemma loaders, Piper, Surya wrappers
│   │   ├── analyst.py         # E4B via llama-cpp-python
│   │   ├── scout.py           # E2B via llama-cpp-python
│   │   ├── audio.py           # HF transformers audio path
│   │   ├── ocr.py             # Surya wrapper
│   │   └── tts.py             # Piper wrapper
│   ├── capabilities/
│   │   ├── translation.py
│   │   ├── dossier.py
│   │   ├── explainer.py
│   │   └── glossary.py
│   ├── auditor/
│   │   ├── constitution.py    # parses CONSTITUTION.md, enforces articles
│   │   ├── rules.py           # regex + JSON-Schema layer
│   │   └── prompt.py          # prompt-based layer
│   ├── linking/
│   │   ├── splink_setup.py
│   │   └── transliteration.py
│   ├── consistency/
│   │   └── conflict_chip.py
│   ├── store/
│   │   ├── schema.sql         # proGres-shaped JSON schema
│   │   ├── sqlcipher.py
│   │   └── audit_log.py
│   ├── api/
│   │   ├── server.py          # FastAPI app
│   │   └── routes/
│   │       ├── session.py
│   │       ├── translate.py
│   │       ├── ingest.py
│   │       ├── synthesise.py
│   │       ├── explain.py
│   │       ├── commit.py
│   │       └── dignity.py
│   └── cli.py
│
├── android/                   # Android Scout app (Kotlin)
│   └── (standard Android Studio layout)
│
├── notebook.ipynb             # the one long sectioned Kaggle notebook
│
├── synthetic_cases/
│   ├── SCENARIOS.md
│   ├── aisha/
│   │   ├── manifest.json
│   │   ├── passport_torn.jpg
│   │   ├── unhcr_token.jpg
│   │   ├── whatsapp_certificate.png
│   │   ├── school_certificate.jpg
│   │   ├── voicenote_mother.wav
│   │   ├── voicenote_mother.transcript.txt
│   │   └── caseworker_note.txt
│   └── yusuf/
│       └── (analogous structure)
│
├── eval/
│   ├── PLAN.md
│   ├── data/
│   │   ├── dialect_triage/
│   │   ├── dossier_recon/
│   │   ├── provenance/
│   │   ├── auditor_adversarial/
│   │   ├── comprehension/
│   │   └── style_guide/
│   ├── runners/
│   │   ├── run_dialect.py
│   │   ├── run_dossier.py
│   │   ├── run_provenance.py
│   │   ├── run_auditor.py
│   │   ├── run_comprehension.py
│   │   ├── run_style.py
│   │   └── run_latency.py
│   └── reports/               # generated outputs, gitignored
│
├── video/
│   ├── SCRIPT.md
│   ├── shot_list.md
│   └── (generated mp4, gitignored)
│
└── tests/
    ├── unit/
    ├── integration/
    └── adversarial/
```

---

## 5. Data contracts

### 5.1 Person + Claim schema (provenance graph)

The canonical in-memory and on-disk data structure.

```python
from typing import Literal, Optional
from pydantic import BaseModel, Field
from datetime import datetime

ConfidenceBand = Literal["confirmed", "corroborated", "single-source", "inferred", "conflicted"]
ArtifactKind = Literal["passport", "unhcr_token", "screenshot", "certificate", "voicenote",
                       "caseworker_note", "id_card", "medical_card", "other"]

class Artifact(BaseModel):
    artifact_id: str        # "A-<scenario>-<n>"
    kind: ArtifactKind
    file_path: str          # local path; never URL
    sha256: str
    ocr_text: Optional[str] = None
    captured_at: datetime
    discarded: bool = False  # True after caseworker signs explainer

class Evidence(BaseModel):
    artifact_id: str
    bbox: Optional[tuple[int, int, int, int]] = None  # for image artifacts
    char_span: Optional[tuple[int, int]] = None       # for text artifacts
    quote: str              # must round-trip to OCR text (Levenshtein ≤ 5)
    source_kind: ArtifactKind

class Claim(BaseModel):
    person_id: str          # "P-syn-<n>"; locally minted
    attribute: str          # e.g., "date_of_birth", "place_of_origin"
    value: str
    confidence: float = Field(ge=0.0, le=1.0)
    band: ConfidenceBand
    evidence: list[Evidence]
    extractor: str          # "gemma4-e4b@2026-04"
    prompt_hash: str        # sha256 of the prompt template + inputs
    timestamp: datetime

class Person(BaseModel):
    person_id: str
    group_id: Optional[str] = None    # family group
    claims: list[Claim]
    specific_needs: list[str] = []    # e.g., ["UASC", "medical"]; tags only, no narrative
```

### 5.2 IER record schema (proGres-shaped output)

The structured JSON the `commit_record` tool writes. The shape resembles proGres v4 enough for a humanitarian reader to recognise it; it is not proGres v4.

```yaml
record:
  individual_id: P-syn-001          # locally minted, never global
  group_id: G-syn-001               # family group
  recorded_at: 2026-05-16T14:33Z
  recorded_by: tobias@eisenhuettenstadt
  session_id: S-2026-05-16-001

  # The seven core IER elements.
  name:
    given: "Aisha"
    family: "Adam"
    transliterations: ["Aisha Adem", "عائشة آدم"]
  date_of_birth: "1991-03-15"
  sex: "F"
  nationality: "SDN"                # ISO 3166-1
  place_of_origin: "El Geneina"
  date_of_arrival: "2026-05-09"

  # Specific-needs flags. Tags only. No narrative. Always referrals.
  specific_needs:
    - tag: "medical"
      referral_to: "site_doctor"
      caseworker_note_ref: null   # never refers to free-text from refugee

  # Auditor stamp
  auditor:
    status: "clean"                 # one of: clean, redacted, regenerated
    constitution_version: "1.0"
    redactions: []
    audited_at: 2026-05-16T14:33Z

  # Dignity Loop confirmation
  dignity_loop:
    played: true
    language: "fr_FR"
    refugee_confirmed: true
    corrections_applied: 1
    confirmed_at: 2026-05-16T14:34Z

  # Explainer reference
  explainer:
    explainer_id: E-syn-001
    target_language: "fr_FR"
    glossary_term_count: 4

  # Provenance pointer
  provenance:
    person_record_uri: "sqlcipher://local/persons/P-syn-001"
    artifacts_retained: false       # after commit, raw artifacts are discarded
```

### 5.3 Audit log entry schema

Append-only. Field-names only. Never values.

```yaml
log_entry:
  timestamp: 2026-05-16T14:33:01.234Z
  session_id: S-2026-05-16-001
  actor: "auditor"                       # or "scout", "analyst", "caseworker"
  action: "redact_field"
  field_name: "political_affiliation"    # field name, never the value
  reason: "constitution_article_3"
  resulting_state: "regenerate_requested"
  prompt_hash: "sha256:abcd…"
```

---

## 6. Native function-calling tool definitions

These are the JSON-Schema-typed tools the Analyst can call. They use Gemma 4's `<|tool|>` lifecycle.

```yaml
tools:

  - name: translate_with_context
    description: >
      Translate an utterance between caseworker and refugee, with dialect-aware
      triage. Returns translation, dialect confidence, and routing decision.
    parameters:
      type: object
      required: [text_or_audio_ref, source_lang_hint, target_lang]
      properties:
        text_or_audio_ref: {type: string}
        source_lang_hint: {type: string, enum: ["en", "fr", "de", "ar-SD", "ar-TD", "auto"]}
        target_lang: {type: string, enum: ["en", "fr", "de", "ar-SD", "ar-TD"]}
        cultural_note: {type: boolean, default: true}
    returns:
      translation: {type: string}
      detected_language: {type: string}
      dialect_confidence: {type: number}
      route_to_human_interpreter: {type: boolean}
      cultural_note: {type: string, nullable: true}

  - name: extract_with_provenance
    description: >
      Extract a single attribute from a single artifact, with a required
      evidence quote and bounding box.
    parameters:
      required: [artifact_id, attribute]
      properties:
        artifact_id: {type: string}
        attribute: {type: string}
    returns:
      value: {type: string, nullable: true}
      evidence_quote: {type: string, nullable: true}
      bbox: {type: array, items: {type: integer}, minItems: 4, maxItems: 4, nullable: true}
      confidence: {type: number}

  - name: link_entities
    description: >
      Run probabilistic record linkage across already-extracted claims to
      cluster them into person-records.
    parameters:
      required: [claim_ids]
      properties:
        claim_ids: {type: array, items: {type: string}}
    returns:
      clusters: {type: array, items: {type: array, items: {type: string}}}
      match_weights: {type: array, items: {type: number}}

  - name: explain_in_plain_language
    description: >
      Generate a plain-language explainer of a bureaucratic document using
      the 5-rule style guide and the EU CTR Article 37 lay-summary structure.
    parameters:
      required: [source_document, target_language]
      properties:
        source_document: {type: string}
        target_language: {type: string, enum: ["en", "fr", "de", "ar-SD", "ar-TD"]}
        country_context: {type: string, enum: ["DE", "GR", "UG", "TD", "generic"]}
    returns:
      stage_a_faithful: {type: string}
      stage_b_plain: {type: string}
      stage_c_backtranslation_check: {type: object}
      load_bearing_terms: {type: array, items: {type: string}}

  - name: compile_glossary
    description: >
      Build a glossary of load-bearing terms for the explainer using the
      4-rule placement guide.
    parameters:
      required: [explainer_text, target_language]
      properties:
        explainer_text: {type: string}
        target_language: {type: string}
    returns:
      front_loaded: {type: array, items: {type: object}}    # 3-5 terms
      inline_definitions: {type: array, items: {type: object}}
      end_glossary: {type: array, items: {type: object}}

  - name: flag_specific_need
    description: >
      Add a specific-needs flag to a person record. Tags only. No narrative.
      Always a referral, never a decision.
    parameters:
      required: [person_id, tag, referral_to]
      properties:
        person_id: {type: string}
        tag: {type: string, enum: ["UASC", "single_parent", "elderly", "medical", "GBV", "other"]}
        referral_to: {type: string}

  - name: commit_record
    description: >
      Write a record to the local store. Requires Auditor status "clean" and
      Dignity Loop confirmation. The only egress path.
    parameters:
      required: [person_id, auditor_status, dignity_confirmed]
      properties:
        person_id: {type: string}
        auditor_status: {type: string, enum: ["clean"]}    # ONLY clean commits
        dignity_confirmed: {type: boolean, const: true}
```

---

## 7. Model loading and quantization

### 7.1 Gemma 4 E4B on Pi 5

```python
# src/globis_edge/models/analyst.py
from llama_cpp import Llama

MODEL_PATH = "/opt/globis/models/gemma-4-e4b-Q4_K_M.gguf"
MMPROJ_PATH = "/opt/globis/models/gemma-4-e4b-mmproj.gguf"

analyst = Llama(
    model_path=MODEL_PATH,
    chat_handler=None,                    # set per-call for multimodal
    n_ctx=4096,                           # honest about the KV-cache budget
    n_threads=4,                          # Cortex-A76 quad-core
    n_gpu_layers=0,
    use_mmap=True,
    verbose=False,
)
```

KV-cache constraint: the 128K context advertised by Gemma 4 does not fit in 8 GB RAM at Q4_K_M; ~4K runtime context is the honest budget on the Pi 5. The plain-language explainer and dossier synthesis fit comfortably in 4K; if a single dossier ever needs more, chunk it.

### 7.2 Gemma 4 E2B on Android

```kotlin
// android/.../ScoutModel.kt
val scoutOptions = LlmInference.LlmInferenceOptions.builder()
    .setModelPath("/data/local/tmp/gemma-4-e2b-int4.task")
    .setMaxTokens(512)
    .setMaxTopK(40)
    .build()

val scout = LlmInference.createFromOptions(context, scoutOptions)
```

### 7.3 Audio path

| Device | Path | Latency target (30s clip) |
|---|---|---|
| Android (Snapdragon 8 Gen 3) | LiteRT / MediaPipe native | 1–2 s |
| Pi 5 fallback | HF transformers + ONNX runtime, E4B audio adapter | 6–10 s |

Note: llama.cpp audio path is **not** used in v1. Track GitHub `ggml-org/llama.cpp#22735` and related issues for stability before adopting.

### 7.4 OCR

Surya OCR is the grounded layer. Every artifact in document reconstruction goes through Surya first; only then does Gemma 4 vision get to see it. This is the anti-hallucination floor: Gemma extractions that don't ground in Surya text are rejected.

```python
from surya.ocr import run_ocr
from surya.model.detection.segformer import load_model as load_det_model
from PIL import Image

det_model = load_det_model()
# rec_model loaded similarly

result = run_ocr(
    images=[Image.open(artifact_path)],
    langs=[["en", "fr", "de", "ar"]],  # multilingual run for refugee docs
    det_model=det_model,
    # ... rec_model, processors
)
# result -> per-line text + bbox + confidence
```

---

## 8. The Constitutional Auditor implementation

### 8.1 Two layers

```python
# src/globis_edge/auditor/__init__.py
from .rules import RuleAuditor         # regex + JSON-Schema, articles 1/3/5/7
from .prompt import PromptAuditor      # Gemma E2B, articles 2/4/6

def audit(draft_record: dict) -> AuditResult:
    rule_result = RuleAuditor().check(draft_record)
    if rule_result.violated:
        return AuditResult.regenerate(reason=rule_result.reason)

    prompt_result = PromptAuditor().check(draft_record)
    if prompt_result.violated:
        return prompt_result.redact_or_regenerate()

    return AuditResult.clean()
```

### 8.2 The rule layer (deterministic, must-pass)

```python
PROHIBITED_FIELDS = {
    "political_affiliation", "religion", "sexual_orientation", "ethnicity",
}
SCORE_FIELDS = {
    "eligibility_score", "credibility_score", "fraud_risk", "status_prediction",
}
ALLOWED_IER_FIELDS = {
    "name", "date_of_birth", "sex", "nationality",
    "place_of_origin", "date_of_arrival", "group_id",
}

def check_article_1_minimum_dataset(record):
    extras = set(record.keys()) - ALLOWED_IER_FIELDS - {"specific_needs", "auditor",
                                                         "dignity_loop", "explainer",
                                                         "provenance", "session_id"}
    if extras and not record.get("caseworker_justification"):
        return Violation("article_1", f"Extra fields without justification: {extras}")

def check_article_3_prohibited_fields(record):
    bad = set(record.keys()) & PROHIBITED_FIELDS
    if bad:
        return Violation("article_3", f"Prohibited fields: {bad}")

def check_article_4_no_risk_scoring(record):
    bad = set(record.keys()) & SCORE_FIELDS
    if bad:
        return Violation("article_4", f"Score field present: {bad}")

# Article 5: enforced by the storage layer — raw artifacts marked discarded=True
# after commit; check that no raw artifact path remains in the record itself.

def check_article_7_local_by_default(record):
    if record.get("egress_destination") and not record.get("egress_authoriser"):
        return Violation("article_7", "Egress without authoriser")
```

### 8.3 The prompt layer

A short system prompt with the seven articles, the draft record as JSON, and a request to return one of `{clean, redact_field, regenerate}` with a reason. The prompt template lives in `prompts/auditor.md` and is hashed; the hash is logged with each audit.

---

## 9. Storage and crypto

### 9.1 SQLCipher schema (canonical store)

```sql
-- src/globis_edge/store/schema.sql
PRAGMA key = '...';  -- supplied at runtime, never logged

CREATE TABLE persons (
    person_id TEXT PRIMARY KEY,
    group_id  TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE claims (
    claim_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id   TEXT NOT NULL REFERENCES persons(person_id),
    attribute   TEXT NOT NULL,
    value       TEXT,
    confidence  REAL NOT NULL,
    band        TEXT NOT NULL CHECK (band IN
                 ('confirmed','corroborated','single-source','inferred','conflicted')),
    extractor   TEXT NOT NULL,
    prompt_hash TEXT NOT NULL,
    timestamp   TEXT NOT NULL
);

CREATE TABLE evidence (
    evidence_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id     INTEGER NOT NULL REFERENCES claims(claim_id),
    artifact_id  TEXT NOT NULL,
    bbox         TEXT,      -- JSON
    char_span    TEXT,      -- JSON
    quote        TEXT NOT NULL,
    source_kind  TEXT NOT NULL
);

CREATE TABLE artifacts (
    artifact_id  TEXT PRIMARY KEY,
    kind         TEXT NOT NULL,
    sha256       TEXT NOT NULL,
    ocr_text     TEXT,
    captured_at  TEXT NOT NULL,
    discarded    INTEGER NOT NULL DEFAULT 0  -- 1 after commit + sign
);

CREATE TABLE specific_needs (
    need_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id   TEXT NOT NULL REFERENCES persons(person_id),
    tag         TEXT NOT NULL,
    referral_to TEXT NOT NULL,
    flagged_at  TEXT NOT NULL
);

CREATE TABLE audit_log (
    entry_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp    TEXT NOT NULL,
    session_id   TEXT NOT NULL,
    actor        TEXT NOT NULL,
    action       TEXT NOT NULL,
    field_name   TEXT,            -- field NAME, never value
    reason       TEXT,
    prompt_hash  TEXT
);

CREATE TABLE explainers (
    explainer_id     TEXT PRIMARY KEY,
    person_id        TEXT NOT NULL REFERENCES persons(person_id),
    target_language  TEXT NOT NULL,
    stage_a_text     TEXT NOT NULL,
    stage_b_text     TEXT NOT NULL,
    backtrans_check  TEXT NOT NULL,    -- JSON
    glossary         TEXT NOT NULL,    -- JSON
    caseworker       TEXT NOT NULL,
    signed_at        TEXT NOT NULL
);

CREATE INDEX idx_claims_person ON claims(person_id);
CREATE INDEX idx_evidence_claim ON evidence(claim_id);
CREATE INDEX idx_audit_session ON audit_log(session_id);
```

### 9.2 Crypto choices

- SQLCipher AES-256, page-level encryption.
- Device passphrase derived from a caseworker-set PIN via PBKDF2 (200K iterations) — never written to disk.
- One-tap "delete everything": drops the SQLCipher database file and overwrites the bytes once.

---

## 10. REST API contract (Pi 5 Analyst, exposed to Scout)

All endpoints are local-LAN-only. The server binds to the Wi-Fi-AP interface and refuses to listen on `0.0.0.0`. CORS is restricted to the Scout's known origin.

```yaml
openapi: 3.1.0
info:
  title: Globis Edge Analyst API
  version: 1.0.0
  description: |
    Local-only API for the Pi 5 Analyst. No internet egress.

paths:
  /session:
    post:
      summary: Open a new caseworker session
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [caseworker_id, country_context, language_preferences]
              properties:
                caseworker_id: {type: string}
                country_context: {type: string, enum: [DE, GR, UG, TD, generic]}
                language_preferences:
                  type: array
                  items: {type: string}
      responses:
        '201':
          description: Session created
          content:
            application/json:
              schema:
                type: object
                properties:
                  session_id: {type: string}

  /translate:
    post:
      summary: Context-aware translation turn
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TranslateRequest'
      responses:
        '200':
          description: Translation result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TranslateResponse'

  /ingest:
    post:
      summary: Ingest one artifact (image, audio, text, screenshot)
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              required: [session_id, kind, file]
              properties:
                session_id: {type: string}
                kind: {type: string}
                file: {type: string, format: binary}
      responses:
        '201':
          description: Artifact stored, OCR done
          content:
            application/json:
              schema:
                type: object
                properties:
                  artifact_id: {type: string}
                  ocr_preview: {type: string}

  /synthesise:
    post:
      summary: Build dossier from ingested artifacts
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [session_id, artifact_ids]
              properties:
                session_id: {type: string}
                artifact_ids: {type: array, items: {type: string}}
      responses:
        '200':
          description: Provenance graph
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Person'

  /explain:
    post:
      summary: Plain-language explainer + glossary
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [session_id, source_document, target_language]
              properties:
                session_id: {type: string}
                source_document: {type: string}
                target_language: {type: string}
      responses:
        '200':
          description: Explainer with glossary
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Explainer'

  /audit:
    post:
      summary: Run the Constitutional Auditor against a draft record
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [draft_record]
      responses:
        '200':
          description: Audit result
          content:
            application/json:
              schema:
                type: object
                properties:
                  status: {type: string, enum: [clean, redact, regenerate]}
                  redactions: {type: array, items: {type: string}}
                  reason: {type: string, nullable: true}

  /commit:
    post:
      summary: Commit a record after auditor + dignity loop
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [session_id, person_id, auditor_status, dignity_confirmed]

  /dignity-loop/tts:
    post:
      summary: Generate TTS audio for the explainer
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [explainer_id, language]
      responses:
        '200':
          description: WAV file
          content:
            audio/wav: {}

  /export:
    post:
      summary: Export a record (logged egress)
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [person_id, format, authoriser, purpose]
      responses:
        '200':
          description: JSON or PDF export

  /admin/wipe:
    post:
      summary: Delete everything on the device
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [confirm_phrase]
              properties:
                confirm_phrase:
                  type: string
                  const: "I confirm I want to delete everything"
```

Schemas (`TranslateRequest`, `TranslateResponse`, `Person`, `Explainer`) are defined in `src/globis_edge/api/schemas.py` as Pydantic models matching §5.

---

## 11. Language coverage matrix

| Capability | English | French | German | Sudanese Arabic | Chadian Arabic | Greek (v1.1) | Masalit / Fur / Zaghawa |
|---|---|---|---|---|---|---|---|
| Context-aware translation | full | full | full | full | full | v1.1 | **route to interpreter** |
| Dialect triage detection | full | full | full | full | full | v1.1 | **detected, never translated** |
| Plain-language explainer | full | full | full | full | full | v1.1 | **show transliteration to interpreter** |
| Glossary (front, inline, end) | full | full | full | full | full | v1.1 | **interpreter-mediated** |
| TTS (Piper) | en_GB-alan-medium | fr_FR-siwis-medium | de_DE-thorsten-medium | ar_JO-kareem-low (MSA) | ar_JO-kareem-low (MSA) | v1.1 | **interpreter reads** |
| OCR (Surya) | full | full | full | full | full | full | best-effort, never authoritative |

English is treated as a first-class core language alongside the four others. Many caseworkers in Greece, Uganda, and Chad work in English; many refugees acquire English en route. It is also the default fallback for the UI.

---

## 12. Performance and resource budgets

### 12.1 Latency budgets (p95, on the canonical Pi 5)

| Operation | Budget | Notes |
|---|---|---|
| `/translate` (text-only) | 3 s | Scout handles it; Pi-only fallback hits 5 s |
| `/translate` (audio 30 s) | 12 s | HF transformers audio path on Pi |
| `/ingest` (one image, Surya) | 4 s | NVMe SSD-backed |
| `/synthesise` (10 artifacts) | 45 s | E4B multimodal, ~3K tokens out |
| `/explain` (4-stage pipeline) | 25 s | Two E4B passes + one E2B pass |
| `/audit` (rule + prompt) | 4 s | Rule layer ≤50 ms; prompt layer ≤4 s |
| `/dignity-loop/tts` (1 sentence) | 0.6 s | Piper streaming |

### 12.2 RAM budget on Pi 5

| Component | Reserved |
|---|---|
| E4B Q4_K_M loaded | 3.0 GB |
| KV cache @ 4K context | 0.5 GB |
| Surya OCR (loaded models) | 1.5 GB |
| HF transformers audio (loaded) | 1.5 GB |
| FastAPI + SQLCipher + misc | 0.5 GB |
| OS headroom | 1.0 GB |
| **Total target** | **≤8.0 GB** |

If both Surya and HF audio are loaded simultaneously, we exceed budget. Mitigation: lazy-load Surya only during `/ingest`, unload after; lazy-load audio only during audio turns.

---

## 13. Build, test, deploy

### 13.1 Local dev (any machine)

```bash
git clone https://github.com/[org]/globis-edge.git
cd globis-edge
python3.11 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
make download-models       # pulls GGUFs to ./models/ (gitignored)
make test                   # pytest -q
make notebook               # opens Jupyter Lab
```

### 13.2 Pi 5 deployment

```bash
# On the Pi
curl -sSL https://github.com/[org]/globis-edge/releases/latest/download/install.sh | bash
sudo systemctl enable --now globis-edge.service
# Visit http://<pi-ip>:8000/docs in the Scout for OpenAPI UI
```

### 13.3 Reproducibility

Every notebook cell logs its prompt-hash, model-hash, and seed. The end-to-end run is wrapped in `reproduce.sh`. A judge with a Pi 5 8 GB can run `bash reproduce.sh` and reproduce every eval table.

### 13.4 CI

Single GitHub Actions workflow:

- `lint`: ruff + mypy
- `unit`: pytest unit + integration (no GPU, mocked LLM)
- `adversarial-auditor`: the 25 prompts in `tests/adversarial/auditor.json` against a stubbed Auditor — verifies the rule layer alone catches articles 1/3/5/7 regardless of prompt behaviour
- `model-smoke`: a lightweight smoke test that loads the GGUF metadata only (no full inference) — verifies model paths and tooling

Heavy evals do not run in CI; they run on the Pi 5 via `reproduce.sh`.

---

## 14. Security checklist

- [ ] No outbound network calls from runtime
- [ ] SQLCipher passphrase derived from caseworker PIN, never persisted
- [ ] Audit logs reference field names only, never values
- [ ] Raw audio and image bytes purged after commit + sign
- [ ] One-tap "delete everything" overwrites SQLCipher bytes
- [ ] Prompt-injection mitigation: vision-extracted text wrapped in `<doc_text>` block; system prompt explicitly declares inner content is data, not instruction
- [ ] Every artifact watermarked "SYNTHETIC" — runtime refuses to ingest unwatermarked files in v1
- [ ] `dpia.yaml` and `dsa.yaml` parsed at startup; integrations refuse to start without valid governance files
- [ ] Apache 2.0 license headers in every source file

---

## 15. Known limitations and what we don't pretend

- The 128K context window advertised by Gemma 4 is not the runtime context window on the Pi 5 — KV cache is the bottleneck. Real budget is ~4K. We chunk for anything larger.
- Gemma 4's native audio path is excellent on Android (LiteRT). On the Pi 5, llama.cpp's audio path is not yet production-stable, so we use HF transformers + ONNX with a measurable latency tax (6–10 s for a 30 s clip).
- Masalit, Fur, and Zaghawa are not supported. The system says so to the caseworker, routes to a human interpreter, and logs the handoff.
- The Constitutional Auditor is a hybrid rule + prompt system, not a mathematical safety proof. Rule-layer articles are deterministic; prompt-layer articles are best-effort and depend on the model.
- We do not authenticate documents. We do not match biometrics. We do not predict outcomes. By design.

---

*End of TECHNICAL_SPECIFICATION.md. See `UIUX_SPECIFICATION.md` for screens, components, and microcopy.*
