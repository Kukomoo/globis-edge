# Globis Edge 2.0

I built Globis Edge 2.0 as my Gemma 4 Good Hackathon project: an offline, on-device caseworker companion for refugee reception at the edge (prototype scenario: Adre, Chad).

## How I worked

I personally led the full project workflow end to end:

- I conducted the initial research on humanitarian intake workflows, PRIMES-aligned data structures, and protection constraints.
- I wrote and locked the PRD, then translated it into a sprint-by-sprint implementation roadmap.
- I used **Gemma 4 Cloud running locally via Ollama** as my main model environment for research support, implementation planning, build iteration, and testing oversight.
- I authored the Kaggle write-up and directed each sprint closeout, verification pass, and audit update.

Claude and Cursor were used only briefly at the beginning as lightweight scaffolding frameworks to help structure the initial skeleton and stress-test database/security feasibility.

## What the system does

Globis Edge coordinates a secure, offline intake pipeline:

1. ASR transcription from field audio.
2. Sanitisation boundary before any model prompt.
3. Translation with strict low-resource dialect triage (Masalit/Fur/Zaghawa -> human interpreter).
4. OCR extraction with grounding verification (Levenshtein threshold).
5. Constitutional dual-pass auditing (Rule Pass first, Prompt Pass fail-closed).
6. API-gated outbox egress via `/commit` only, with quarantine telemetry for blocked records.

## Security and governance posture

- SQLCipher-backed encrypted persistence.
- No `sqlite3` imports in `src/`.
- No `0.0.0.0` service bind exposure.
- Field names are logged, field values are never logged (`value_logged=False`).
- Quarantine is append-only by convention.
- Synthetic data only.

## Verification status

All sprint suites are green in the current repository state, including adversarial and integration checks, with Sprint 8 adding SLA profiling and stress hardening.

For full architecture, invariants, and sprint closure logs:

- [PRD.md](PRD.md)
- [INVARIANTS.md](INVARIANTS.md)
- [FINAL_AUDIT.md](FINAL_AUDIT.md)
- [docs/blueprint/judge_fast_path.md](docs/blueprint/judge_fast_path.md)

## Why this entry is positioned to win

I intentionally positioned the project around a single high-stakes frontline moment: intake at first contact, where language access, trust, and speed determine whether registration is safe and usable.

The submission strategy is:

- A concrete user story with named personas and realistic synthetic artifacts.
- A visible safety stack (sanitisation, grounding, constitutional audit, quarantine).
- A measurable edge-feasibility claim (p95 latency SLA + memory isolation checks).
- Transparent scope boundaries (what Globis Edge does not do).

Everything is locked to the core scope in [PRD.md](PRD.md), with no expansion beyond the declared v1 boundaries.

## Judge evidence map

| Judging axis | What Globis Edge shows | Where to verify |
|---|---|---|
| Impact & vision | Dignity Loop + documented human-interpreter triage for low-resource dialects | [PRD.md](PRD.md), [INVARIANTS.md](INVARIANTS.md) |
| Technical execution | End-to-end multimodal coordinator and API egress locks | [src/globis_edge/capabilities/coordinator.py](src/globis_edge/capabilities/coordinator.py), [src/globis_edge/api/routes.py](src/globis_edge/api/routes.py) |
| Responsible AI | Rule-first constitutional audit, value-masked logs, quarantine telemetry | [src/globis_edge/auditor/constitution.py](src/globis_edge/auditor/constitution.py), [src/globis_edge/store/audit_log.py](src/globis_edge/store/audit_log.py) |
| Edge feasibility | p95 latency profiler + adversarial stress suite | [eval/runners/run_latency.py](eval/runners/run_latency.py), [tests/integration/test_adversarial_stress.py](tests/integration/test_adversarial_stress.py) |
| Reproducibility | Sprint-by-sprint closure + full verification trail | [FINAL_AUDIT.md](FINAL_AUDIT.md), [docs/blueprint/verification_plan.md](docs/blueprint/verification_plan.md) |

## Submission packet checklist

- Kaggle write-up aligned with the five hero capabilities in [PRD.md](PRD.md).
- Public repo with passing tests and traceable architecture documents.
- Demo video: one full reception turn (audio + document + audit + commit/quarantine outcome).
- Media gallery: UI screenshots, latency output, and audit-safe telemetry views.

I keep the narrative and claims synchronized via [docs/blueprint/hackathon_positioning.md](docs/blueprint/hackathon_positioning.md), so the technical implementation and storytelling stay tightly coupled.

## Communication blueprint references

To keep the submission concise, credible, and aligned with judging criteria:

- [docs/blueprint/hackathon_positioning.md](docs/blueprint/hackathon_positioning.md)
- [docs/blueprint/judge_fast_path.md](docs/blueprint/judge_fast_path.md)
