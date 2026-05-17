# Globis Edge 2.0

I built Globis Edge 2.0 as my Gemma 4 Good Hackathon project: an offline, on-device caseworker companion for refugee reception at the edge (prototype scenario: Adre, Chad).

## How I worked

I personally led the full project workflow end to end:

- I conducted the initial research on humanitarian intake workflows, PRIMES-aligned data structures, and protection constraints.
- I wrote and locked the PRD, then translated it into a sprint-by-sprint implementation roadmap.
- I used **Gemma 4 Cloud running locally via Ollama** as my main model environment for research support, implementation planning, build iteration, and testing oversight.
- I authored the Kaggle write-up and directed each sprint closeout, verification pass, and audit update.

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
