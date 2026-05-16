# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

Globis Edge 2.0 is a **pre-implementation** submission for the Gemma 4 Good Hackathon: an offline, on-device caseworker companion for refugee reception that runs on a Raspberry Pi 5 (8 GB) + mid-tier Android, using Gemma 4 E2B and E4B. The PRD is locked (v10.0); only four "hardened" files exist so far, each fixing a specific finding from the Logic Lock audit. The remaining build is described in `docs/blueprint/`.

The work order is: read the PRD → read the three blueprint documents → execute sprints 1–8 in order.

## Authoritative documents (read in this order)

1. [PRD.md](PRD.md) — locked spec. The single source of truth for *what* to build, latency budgets, governance contracts, and what's explicitly out of scope.
2. [docs/blueprint/implementation_roadmap.md](docs/blueprint/implementation_roadmap.md) — eight sprints with files to create and Definition of Done. Sprints are sequential; each DoD must pass before the next begins.
3. [docs/blueprint/module_contracts.md](docs/blueprint/module_contracts.md) — the I/O contract for every module boundary. If you must change a contract, update this file *first*, then adjust all consumers, then change code.
4. [docs/blueprint/verification_plan.md](docs/blueprint/verification_plan.md) — for every roadmap step, the exact test that proves it works. Tests marked `[ADV]` (adversarial) and `[PERF]` (timing) are not optional.

The `archive/` directory holds superseded PRD versions and the original audit. Treat as historical reference only — `PRD.md` supersedes everything there.

## Already-written files (do not refactor without reason)

These four files are "hardened" — each closes a specific Logic Lock audit finding. The fixes are load-bearing and must survive any refactor. The audit reasoning is documented in each file's module docstring.

- [src/globis_edge/store/outbox.py](src/globis_edge/store/outbox.py) — `OutboxManager`. Collision detection uses the **compound key `(household_id, logical_seq, device_id)`**, not `logical_seq` alone. Run its self-test with `python src/globis_edge/store/outbox.py`.
- [src/globis_edge/auditor/rules.py](src/globis_edge/auditor/rules.py) — `RuleAuditor`. The Rule Pass of the Constitutional Auditor. `AuditResult.blocked_field_names` is **names only, never values**; `AuditResult.value_logged` is the explicit machine-readable contract field and is **always `False`**.
- [src/globis_edge/api/quarantine_badge.py](src/globis_edge/api/quarantine_badge.py) — FastAPI router for `/quarantine/count`, `/quarantine/summary`, `/quarantine/{uuid}/review-complete`. Requires `app.state.outbox_manager` to be attached at startup (`server.py`, Sprint 7).
- [eval/runners/run_latency.py](eval/runners/run_latency.py) — p95 benchmark for the multimodal pipeline turn. SLA is 15 s. Exits non-zero on miss. Mock mode uses calibrated `sleep()` so it runs without GPU or model weights.

## Running what exists today

```bash
# Outbox self-test (no dependencies; uses stdlib sqlite3 for the test backend)
python src/globis_edge/store/outbox.py

# Latency benchmark in mock mode (no models required)
python eval/runners/run_latency.py --mock

# Real-hardware run on Pi 5 (requires Gemma GGUF + Whisper + soundfile)
python eval/runners/run_latency.py
```

No `pyproject.toml`, no `requirements.txt`, no `Makefile` exists yet — those are Sprint 1 deliverables. Do not assume a packaging system is present.

## Non-negotiable invariants (enforced by tests in the verification plan)

These hold across the entire codebase. They are reasons existing code is shaped the way it is, and any new code must preserve them:

- **No `import sqlite3` anywhere in `src/`.** Only `pysqlcipher3` is allowed. (Plain stdlib `sqlite3` is fine inside `if __name__ == "__main__"` self-tests and test fixtures.) The verification grep is `grep -r "import sqlite3" src/` → zero results.
- **Field *names* are logged; field *values* never are.** `AuditLogger.log()` has no `value` parameter by design. `blocked_field_attempted` and `blocked_field_names` carry names only. Adversarial test S3.8 greps the audit log for any of 25 injected payload values and expects zero matches.
- **Dual-pass auditor order is fixed: Rule Pass first, Prompt Pass second. Never reversed, never skipped.** If Rule Pass blocks, Prompt Pass must not run. On Prompt Pass inference failure, default to `BLOCK` (fail-safe).
- **ASR output passes through `ASRSanitiser` before any model prompt.** Two controls in this order: truncate to 2,048 chars, then strip to `[A-Za-z0-9\x20-\x7E؀-ۿÀ-ž]`. The sanitiser is pure Python — no ML imports.
- **Evidence quotes round-trip to OCR text** (Levenshtein ≤ 5). Ungrounded extractions raise `GroundingError` and never reach the Outbox.
- **The server binds to the LAN interface, never `0.0.0.0`.** Verification grep: `grep -r "0\.0\.0\.0" src/` → zero results.
- **The Outbox is written by exactly one route**: `POST /commit`, and only when `auditor_status == "clean"` and `dignity_confirmed == true`.
- **The quarantine table is append-only by convention.** No `UPDATE` (except `reviewed_at_iso`) or `DELETE` SQL exists for it.
- **Synthetic data only.** The runtime refuses to ingest artifacts without a "SYNTHETIC SCENARIO" watermark. No real refugee data is used at any point.
- **No internet egress at runtime.** The system refuses to start with a default route outside `192.168.0.0/16`. The only authorised write path is `commit_record`.

## Architectural directional rule

The dependency arrow is strictly upward:

```
config → store → models → capabilities → api
```

The data layer (`store/`, `auditor/rules.py`, `audit_log`) has **no upward imports** — it never imports from `models/` or `capabilities/`. Adding a `models/` import to `outbox.py` or `rules.py` is a structural regression. Capabilities orchestrate models; the API surface orchestrates capabilities and returns Pydantic schemas. Route files contain no business logic.

## Two-device runtime topology

| Device | Role | Model |
|---|---|---|
| Android Scout | UI, fast turns, audio capture, sanitisation, Rule Pass, back-translation, glossary, Dignity Loop playback | Gemma 4 **E2B** (Q4_K_M / INT4) |
| Raspberry Pi 5 Analyst | Heavy reasoning, OCR, multimodal dossier, explainer, Prompt Pass, record reading | Gemma 4 **E4B** (Q4_K_M) |

For the hackathon notebook, both roles run on the Pi 5 ("Scout-on-Pi mode") so reproduction needs no Android device. Surya OCR and HF audio cannot be loaded simultaneously on Pi 5's 8 GB — they are lazy-loaded and unloaded after use.

## What is explicitly out of scope (do not propose)

These appear in the roadmap as v1.1+ or post-submission. They are not part of any sprint and the PRD lists them as things the project will not claim:

- Android Kotlin app (Pi 5 / Python only for sprints 1–7)
- OpenFn / PING / live PRIMES integration
- Biometric deduplication, fraud detection, eligibility/credibility/status scoring
- M[X]/M/1 burst-sync queue (Lamport counter is the upgrade path)
- Masalit / Fur / Zaghawa TTS or translation (routed to human interpreter — enforced by `PiperTTS.UnsupportedLanguageError`)
- Hierarchical Federated Learning, SSI wallet, Unsloth fine-tune
- Greek language support
- Any participation in substantive asylum interviews or document authentication

## When unsure

The order of authority is: PRD → module contracts → verification plan → roadmap → existing hardened files. If a contradiction surfaces, the PRD wins, and the discrepancy is itself a finding to flag back to the user before writing code.
