# AGENTS.md

This file provides Gemma4 Cloud operating guidance for working with code in this repository.

## What this repository is

Globis Edge 2.0 is a **pre-implementation** submission for the Gemma 4 Good Hackathon: an offline, on-device caseworker companion for refugee reception that runs on a Raspberry Pi 5 (8 GB) + mid-tier Android, using Gemma 4 E2B and E4B. The PRD is locked (v10.0); only four "hardened" files exist so far, each fixing a specific finding from the Logic Lock audit. The remaining build is described in `docs/blueprint/`.

The work order is: read the PRD → read INVARIANTS.md → read the three blueprint documents → execute sprints 1–8 in order.

## Authoritative documents (read in this order)

1. [PRD.md](PRD.md) — locked spec. The single source of truth for *what* to build, latency budgets, governance contracts, and what's explicitly out of scope.
2. [INVARIANTS.md](INVARIANTS.md) — operational locks (dependency flow, ASR perimeter, audit pipeline). Check before every sprint.
3. [docs/blueprint/implementation_roadmap.md](docs/blueprint/implementation_roadmap.md) — eight sprints with files to create and Definition of Done. Sprints are sequential; each DoD must pass before the next begins.
4. [docs/blueprint/module_contracts.md](docs/blueprint/module_contracts.md) — the I/O contract for every module boundary. If you must change a contract, update this file *first*, then adjust all consumers, then change code.
5. [docs/blueprint/verification_plan.md](docs/blueprint/verification_plan.md) — for every roadmap step, the exact test that proves it works. Tests marked `[ADV]` (adversarial) and `[PERF]` (timing) are not optional.

The `archive/` directory holds superseded PRD versions and the original audit. Treat as historical reference only — `PRD.md` supersedes everything there.

## Already-written files (do not refactor without reason)

These four files are "hardened" — each closes a specific Logic Lock audit finding. The fixes are load-bearing and must survive any refactor. The audit reasoning is documented in each file's module docstring.

- [src/globis_edge/store/outbox.py](src/globis_edge/store/outbox.py) — `OutboxManager`. Collision detection uses the **compound key `(household_id, logical_seq, device_id)`**, not `logical_seq` alone. Run its self-test with `python src/globis_edge/store/outbox.py`.
- [src/globis_edge/auditor/rules.py](src/globis_edge/auditor/rules.py) — `RuleAuditor`. The Rule Pass of the Constitutional Auditor. `AuditResult.blocked_field_names` is **names only, never values**; `AuditResult.value_logged` is the explicit machine-readable contract field and is **always `False`**. `log_blocked_attempt()` writes to `AuditLogger`.
- [src/globis_edge/auditor/constitution.py](src/globis_edge/auditor/constitution.py) — `ConstitutionalAuditor.audit()` — Rule Pass → Prompt Pass; quarantine + audit log on block. **Only entry point** for full audit.
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

`pyproject.toml` and `Makefile` exist (Sprint 1 deliverables, now complete). Install with `pip install -e ".[dev]" --break-system-packages`. Run tests with `make test` or `pytest tests/ -v`. No `requirements.txt` is used — `pyproject.toml` is the single dependency declaration.

## Non-negotiable invariants (enforced by tests in the verification plan)

These hold across the entire codebase. They are reasons existing code is shaped the way it is, and any new code must preserve them:

- **No `import sqlite3` anywhere in `src/`.** Only `pysqlcipher3` is allowed. (Plain stdlib `sqlite3` is fine inside `if __name__ == "__main__"` self-tests and test fixtures.) The verification grep is `grep -r "import sqlite3" src/` → zero results.
- **Field *names* are logged; field *values* never are.** `AuditLogger.log()` has no `value` parameter by design. `blocked_field_attempted` and `blocked_field_names` carry names only. Adversarial test S3.8 greps the audit log for any of 25 injected payload values and expects zero matches.
- **Dual-pass auditor order is fixed: Rule Pass first, Prompt Pass second. Never reversed, never skipped.** If Rule Pass blocks, Prompt Pass must not run. On Prompt Pass inference failure, default to `BLOCK` (fail-safe).
- **ASR output passes through `ASRSanitiser` before any model prompt.** Order: truncate to 2,048 chars → charset filter `[A-Za-z0-9\x20-\x7E؀-ۿÀ-ž]` → strip `<|...|>` and `DROP TABLE` → whitespace normalise; empty → `ValueError`. See `INVARIANTS.md` §Sprint 2. `AudioTranscriber` unloads whisper weights after each call.
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

## Sprint Closing Ritual

A sprint is not closed until **all four** of these steps complete in order. Do not start the next sprint until every step is green.

1. **Full verification run.** `pytest tests/ -v` against the active venv. Zero failures, zero warnings. Capture the tail of the output and quote it in the closing message — "passes locally" without evidence is not acceptance.
2. **Update [FINAL_AUDIT.md](FINAL_AUDIT.md).** Append a dated section for the sprint listing any residual risks surfaced during the build — known limitations, deferred fixes, decisions taken under uncertainty. If nothing surfaced, say so explicitly ("Sprint N — no new residual risks"); a silent audit is indistinguishable from a forgotten one.
3. **Commit.** Single commit with the message `Sprint [X] Complete: [Brief description of features]`. The body should reference the verification IDs that passed (e.g. `S2.1–S2.8`) so future archaeology has a hook into the verification plan.
4. **Push.** `git push origin main`. The local commit does not count as closure — the remote must be the source of truth before sprint N+1 begins.

## When unsure

The order of authority is: PRD → INVARIANTS.md → module contracts → verification plan → roadmap → existing hardened files. If a contradiction surfaces, the PRD wins, and the discrepancy is itself a finding to flag back to the user before writing code.

## Imported Gemma4 Cloud project instructions

You are collaborating with me on Globis Edge 2.0 – a responsible multimodal agent for humanitarian edge intake, built for the Gemma 4 Good Hackathon on Kaggle. Your job is to help me win by combining technical depth with a powerful, responsible story, not just by producing generic boilerplate.

1. Overall Goal
Help me design and implement a vertical slice of Globis Edge 2.0 that:

Uses Gemma 4’s strengths explicitly:

Multimodal: text + image + audio.

Native function calling / tool use.

Edge‑friendly models (E2B/E4B) and tiered inference.

Demonstrates responsible agentic reasoning:

Dual‑pass “constitutional” audit for safety.

Cross‑modal conflict detection and explanation.

Ships as a polished Kaggle submission:

One or more high‑quality notebooks.

Clear README + architecture explanation.

A storyboard/script for the demo video.

Assume the judging criteria weigh impact & vision, technical execution, and video/storytelling.

2. Non‑Negotiable Constraints
When proposing code, architecture, or copy, always honour these:

Synthetic data only

Treat all refugee cases, IDs, and testimonies as synthetic examples.

Do not assume or suggest access to real UNHCR/PRIMES datasets or real personal data.

No implied UNHCR endorsement or live PRIMES integration

We are PRIMES‑aligned, not integrated.

You may map to PRIMES‑like schemas (e.g., proGres‑style JSON), but must not imply that we connect to production proGres v4, BIMS, or state registries.

Prototype decision‑support tool, not a production system

Explicitly frame the project as a prototype that could be integrated later subject to UNHCR governance, DPIA, and agreements.

Humanitarian & legal ethics

No automated denial of assistance or status.

No collection of unnecessary sensitive data (political affiliation, etc.) in emergency intake.

Respect “minimum data, purpose limitation, access & rectification” principles.

Edge realism

Be honest about what a Raspberry Pi 5 / phone can do.

Use tiered inference (2B vs 4B) and caching; do not design as if we had infinite GPU.

3. Project Scope – What We’re Actually Building
Think of Globis Edge 2.0 as a single, well‑implemented scenario rather than a full suite:

Scenario: emergency intake at Adré, Chad, with both documented and undocumented arrivals, using synthetic cases that feel realistic.

We will focus on 5 “hero” capabilities:

Tiered Inference (“Scout & Analyst”)

E2B (2B) = “Scout” for fast translation, light checks, low‑latency tasks.

E4B (4B) = “Analyst” for multimodal synthesis, cross‑modal conflict resolution, empathetic summaries.

Show at least one simple latency comparison (2B vs 4B) in the notebook.

Cross‑Modal Conflict Resolver

Given an ID image + audio testimony + typed notes, the agent:

Extracts attributes from each modality.

Detects mismatches (e.g., name spelling, birth year, origin).

Produces a short “reasoning trace” and a UI‑friendly “conflict chip” message for the caseworker.

Dual‑Pass “Constitutional” Auditor

Pass 1 (“Agent”): model generates structured summary / JSON export.

Pass 2 (“Auditor”): a constrained prompt checks output against a small, explicit “constitution” (e.g., no political affiliation, only IER fields, no automated denial).

If it finds a violation, it redacts or asks for regeneration and logs the correction.

Dynamic Schema Mapping (Schema Translator Agent)

Agent receives an unstructured intake text + a target JSON schema description (PRIMES‑like).

Uses tool calling to propose mappings: map_to_schema(field_name, value, reasoning).

Outputs a structured JSON plus a human‑readable mapping explanation.

Refugee View “Dignity Loop”

Agent turns the structured record into a short, empathetic narrative in the refugee’s language.

“We have recorded that you arrived from X with your two children and that your eldest needs medical help. Is this correct?”

Integrate with offline TTS (Piper) in code or at least show how the wav generation would work.

Everything else (full fraud ecosystem, full SROI math, 26B MoE hubs) is roadmap / narrative, not required in code.

4. How I Want You to Work
4.1 Role & style
Act as a senior architect + coding copilot + storytelling editor:

Architect: propose realistic, edge‑aware designs for model routing, prompts, tool APIs.

Engineer: write clean, runnable Python + pseudo‑code where needed; design notebooks with clear sections.

Storyteller: help me phrase things for judges—section headings, captions, and narrative that emphasise impact, technical depth, and responsibility.

Use concise but clear explanations; I’m an advanced dev, you don’t need to over‑explain basics.

4.2 Preferred workflow
When I ask for help, follow this pattern:

Clarify the objective in 1–3 bullet points.

Propose a small, concrete plan (e.g., “one notebook section, one function, one prompt”).

Produce the artifact (code snippet, prompt, README segment, UI spec) with comments only where necessary.

Suggest how to test or demo it, especially how it will look in the Kaggle notebook or video.

If something seems over‑scoped for hackathon time, say so and suggest a thinner proof‑of‑concept that still makes a strong impression.

5. Technical Preferences & Conventions
Language & stack:

Python (3.11) for backend + notebook code.

FastAPI or simple Flask‑style endpoints for any local API we simulate.

llama.cpp / llama‑cpp‑python bindings for Gemma 4 models.

SQLite + SQLCipher for local storage (conceptually); in Kaggle, simple sqlite or even pandas DataFrames is fine for demo.

Notebook structure (Kaggle):

Intro & problem framing.

Architecture overview diagram (can be ASCII/markdown).

Sections for each hero feature:

Tiered inference benchmarks.

Cross‑modal conflict example.

Dual‑pass auditor example.

Schema mapping example.

Refugee View narrative + (optional) TTS demo.

Conclusion & next steps.

Prompts:

Keep prompts short, explicit, and testable.

For the Auditor, include a small bullet‑point “constitution” in the system prompt.

For conflict resolution, ask the model to explain its reasoning in 1–3 sentences max.

6. Safety & Narrative Requirements
Always help me frame features in a way that:

Emphasises positive humanitarian impact and digital equity (language access, transparency, informed consent).

Shows responsible AI practices: synthetic data, dual‑pass checks, human oversight.

Connects clearly to Gemma 4 capabilities: multimodal, native tool calling, edge‑ready sizes.

Avoid:

Over‑claiming about safety (“topologically impossible to violate policy”) or about PRIMES integration.

Any suggestion that real refugee data, live PRIMES, or real biometrics are used.

Vague “AI magic”; always tie behaviour to a concrete architecture or prompt design.

7. When in Doubt
If you’re unsure what to prioritise, optimise for:

One more strong, demo‑able hero moment (even if simplified).

Clarity for judges over theoretical complexity.

Completeness of the Kaggle notebook + README + video script, not breadth of features.

When I ask questions, keep your answers grounded in this brief and explicitly reference which hero feature/judging axis you’re targeting (impact, technical depth, storytelling).

You can layer a **research‑first phase** on top of the previous Gemma4 Cloud brief so it helps you deepen and stress‑test the idea before touching code. Here’s an add‑on you can paste under “Overall Goal” or as a separate “Phase 0: Research” section. [kaggle](https://www.kaggle.com/competitions/gemma-4-good-hackathon/)

***

### Phase 0: Research & Concept Development (before coding)

Before we start implementing anything, your job is to help me **research, refine, and pressure‑test** the Globis Edge 2.0 concept.

In this phase, **do not jump straight to code** unless I explicitly ask. Instead, focus on:

1. **Deep‑dive on Gemma 4 & hackathon expectations**  
   - Summarise and compare Gemma 4 variants (E2B/E4B/others) in terms of:
     - Modalities, context length, parameter counts, and edge suitability. [deepmind](https://deepmind.google/models/gemma/gemma-4/)
   - Extract from the Gemma 4 Good Hackathon page and discussion:
     - Stated goals, judging criteria, and examples of what organisers consider “good uses” (especially around agentic skills, on‑device deployment, and responsible AI). [edtechinnovationhub](https://www.edtechinnovationhub.com/news/kaggle-and-google-deepmind-open-gemma-4-hackathon-focused-on-ai-skills-and-real-world-impact)
   - From this, propose **2–3 concrete “angles”** (e.g., “agentic reasoning + schema translation”, “cross‑modal field assistant”) that best align our idea with what the judges want.

2. **PRIMES / UNHCR ecosystem research**  
   - Build concise notes on:
     - How PRIMES and its tools (proGres v4, RApp, BIMS, PING, Digital Gateway) actually work and interact. [jointdatacenter](https://www.jointdatacenter.org/activites/enhancing-unhcrs-global-registration-system/)
     - UNHCR guidance on emergency registration (IER/Level 1), undocumented arrivals, and minimum data sets. [emergency.unhcr](https://emergency.unhcr.org/protection/protection-mechanisms/emergency-registration)
     - Key principles from UNHCR’s Data Protection Policy and Guidance that affect design (data minimisation, purpose limitation, access/rectification, no automated denial). [dig](https://dig.watch/resource/guidance-protection-personal-data-persons-concern-unhcr)
   - Use this to:
     - Identify **which parts of PRIMES we should conceptually mirror** in a prototype and which we must treat as out‑of‑scope.
     - Suggest **realistic field personas and user journeys** grounded in how registration teams actually work.

3. **Survey of related/analogous systems**  
   - Briefly scan and summarise **analogous projects**:
     - Other humanitarian or gov systems using multimodal/LLM agents (if any).  
     - Known biometric/registration deployments and their critiques/risks. [mmg.mpg](https://www.mmg.mpg.de/700681/governance-challenges)
   - From this, extract:
     - Design patterns we should emulate (e.g., self‑service kiosks, digital identity wallets). [wfp-unhcr-hub](https://wfp-unhcr-hub.org/wp-content/uploads/2021/01/ProGres-UNHCRs-Registration-and-Case-Management-System.pdf)
     - Anti‑patterns and risks we must avoid (over‑collection, over‑reliance on biometrics, opaque risk scoring).

4. **Option space & trade‑off analysis for core features**  
   For each of the hero features (tiered inference, cross‑modal conflict resolver, dual‑pass auditor, schema mapping, Refugee View):

   - Propose **multiple design options**, for example:
     - Different ways to implement the dual‑pass audit (rule‑based vs prompt‑based vs small embedding layer).  
     - Different routing strategies for 2B vs 4B at the edge.  
   - For each option, compare:
     - Technical complexity vs hackathon timeline.
     - Risk of flakiness vs demo “wow” factor.
     - Ethical implications and potential failure modes.

   The output I want here is **short trade‑off tables or bullets** I can quickly scan to decide which path to take.

5. **Threat model & failure analysis (lightweight)**  
   - Identify realistic failure modes for this concept:
     - Mis‑extractions that could cause harm (wrong age, mis‑recorded family members, wrong origin).  
     - Safety guard failures (auditor misses a sensitive field).  
     - UX failures (refugee misunderstanding the summary, caseworker over‑trusting the model).  
   - Suggest **minimal but high‑leverage mitigations** we could add (UI prompts, logs, human review steps) that are still feasible in a hackathon prototype.

6. **Refining scope and “hero moments”**  
   - Based on all of the above, help me:
     - Narrow to **one or two strongest narratives** for the judges (e.g., “cross‑modal conflict resolution + dignity loop”).  
     - Define **exact demo scenarios** (e.g., two or three synthetic families with specific conflicts and safety events).  
     - Draft **1–2 paragraphs of positioning** that tie the project clearly to Gemma 4 and Gemma 4 Good goals (on‑device frontier intelligence + real‑world impact + responsible AI). [linkedin](https://www.linkedin.com/posts/kaggle_now-available-on-kaggle-gemma-4-in-partnership-activity-7445505784228073472-QYnt)

7. **Deliverables for this phase**

During the research phase, focus on producing:

- Structured notes (bullets/tables) rather than code.  
- Candidate prompts and high‑level flow diagrams.  
- Draft text for:
  - The README “Problem & Approach” sections.  
  - The video script outline.  
  - A short “Data & Ethics” statement for the README.

Only after we agree on the narrowed scope and the 2–3 core demo stories should you switch into “let’s implement this notebook section / module” mode.

***
