# Globis Edge 2.0 — Final Product Requirements Document

**Author:** Nadu
**Version:** Final (1.0)
**Date:** May 16, 2026
**Status:** Locked. Ready to build.

---

## Why I am building this

I am building Globis Edge because the frontline of refugee reception in 2026 is still mostly paper, phones held up to faces, and caseworkers translating bureaucracy into something a frightened person can actually use — and the AI tools that exist either pretend to be more than they are or refuse to leave the cloud. I want to put a genuinely useful, genuinely offline tool in the hands of the people doing the work, on hardware they can afford, with safety constraints baked into the model loop, not added as a disclaimer.

This is my submission to the Gemma 4 Good Hackathon. It is also the first version of a tool I intend to keep building after the hackathon ends.

---

## What Globis Edge is

Globis Edge 2.0 is an offline, on-device caseworker companion that runs on a Raspberry Pi 5 (8 GB) and a mid-tier Android phone. It uses **Gemma 4 E2B and E4B** under Apache 2.0 to give frontline workers — the first or second point of contact for refugees arriving at reception centers in any host country — four capabilities they do not currently have in any integrated form:

1. **Context-Aware Translation** — real-time, culturally sensitive interpretation with dialect-aware triage that routes Masalit/Fur/Zaghawa speakers to a human interpreter rather than pretending the model speaks their language.
2. **Document Fragment Reconstruction** — ingests scattered, partial, damaged refugee documents and synthesises them into one unified, provenance-grounded dossier where every field hyperlinks to its source.
3. **Jargon-Free Explanation Engine** — turns asylum decisions, housing notices, medical referrals into a plain-language one-page explainer in the refugee's preferred language, signed by the caseworker.
4. **Dynamic Glossary Ledger** — when jargon is unavoidable, auto-compiles a glossary that defines each term in accessible language and places it where comprehension research says it works.

These are the four user-facing capabilities. Behind them, three pieces of infrastructure I have built in from v8 work onward make the whole thing safe to ship: a **Constitutional Auditor** (a dual-pass review against UNHCR's 2022 General Policy on Personal Data and Privacy), a **Cross-Modal Consistency Check** that surfaces conflicts to the caseworker without ever scoring the refugee, and a **Dignity Loop** that reads every committed record back to the refugee in their own language before any export happens.

The system **does not** participate in substantive asylum interviews, biometric matching or document authentication, or outcome prediction. These three are out of scope by design, enforced in the Constitutional Auditor, visible in every screen. I am explicit about this because the history of humanitarian AI is the history of tools that drifted from intake into adjudication, and I am not going to let that happen to mine.

---

## Who Globis Edge is for

The user is the **frontliner**. Not the refugee. The refugee is the beneficiary of the Dignity Loop and the explainer; the frontliner is the person who taps Commit.

I have written this PRD against two named personas:

- **Hawa** — UNHCR protection associate, Adré, Chad. Five years in displacement work. Speaks French, Arabic, English. Processes ~40 individuals on a busy day. Her bottleneck is interpretation of a Masalit speaker without a Masalit interpreter present, and the second pass on a dossier she already filed.
- **Tobias** — BAMF Sachbearbeiter, Eisenhüttenstadt, Germany. Three years at the Bundesamt. Speaks German, English, conversational Arabic. Two substantive cases per day. The other half of his day is handover letters and explaining Bescheide. His bottleneck is the typing.

I designed the product by walking through Hawa's and Tobias's days. Anything that doesn't make their day shorter or their decisions cleaner is out.

---

## The four contact moments — where Globis Edge sits

Refugees do not arrive at a host country in one step. They pass through a sequence of contact moments, each with a different frontliner, a different time pressure, a different paperwork shape:

1. **Arrival** (hours to days) — border post, transit center, coast guard intake. Frontliner: border police, IOM mobile medic, UNHCR protection associate, IFRC volunteer, MSF nurse.
2. **Reception & registration** (days to weeks) — host-country reception center, registration appointment. Frontliner: BAMF case officer, EUAA case officer, OPM clerk + interpreter.
3. **Substantive process** (weeks to months) — asylum interview, legal-aid pickup, school enrollment, medical screening, housing placement.
4. **Renewal & integration** (months to years) — Ausländerbehörde, Jobcenter, integration course, family reunification.

**Globis Edge 2.0 ships for moments 1 and 2.** It serves information *into* moment 3 (the explainer helps the refugee understand what the upcoming interview is about and what the resulting decision letter says), but it does not sit at the interview table. The Council of Europe and EUAA guidance both forbid that, and I agree with them.

---

## PRIMES as my design playbook

UNHCR's PRIMES ecosystem — proGres, BIMS, RApp, PING, Digital Gateway — is not my integration target. I am explicit about that in every public document and on every UI screen. But PRIMES is my design playbook. Five principles from PRIMES shape Globis Edge:

1. **Offline-first is the default, not graceful degradation.** Like RApp, the field unit captures and reasons offline. Sync to a synthetic registry is an explicit deferred action.
2. **One canonical record per person, identity decoupled from biography.** Like BIMS-plus-proGres, an `IndividualID` is separate from the biographic record. It is locally minted, locally scoped, never shared without explicit consent.
3. **Partner exchange through one gateway with explicit consent.** Like PING, the only egress path is the `commit_record` tool. No shadow CSV export. Every egress is logged with timestamp, purpose, authoriser.
4. **Role-based access and full audit logging at every layer.** Every tool call, every Auditor decision, every Dignity Loop confirmation lands in an append-only audit log scoped to the device.
5. **DPIAs and Data Sharing Agreements as code, not PDFs.** `dpia.yaml` and `dsa.yaml` ship in the repo. The runtime refuses to start an integration whose `dsa.yaml` is missing or expired.

Where Globis Edge goes beyond PRIMES: it is agent-mediated, not record-mediated; it serves the *moment* a caseworker and a refugee are in the room together; and refugee comprehension is a first-class artifact — every committed record produces an explainer the refugee can actually understand.

---

## The decisions I have made (was Open Decisions in v9)

These are locked. The build proceeds on these assumptions.

**Languages in v1.** **English, French, German, Sudanese Arabic, Chadian Arabic** are the five core languages. The model produces full plain-language explainers in all five. Greek is added in v1.1 if time allows. Masalit, Fur, and Zaghawa are handled by **human-interpreter routing** with explicit consent capture — the model never pretends to translate them.

**Hardware shoot.** Raspberry Pi 5 (8 GB) with active cooler and NVMe HAT. I will record the demo on the actual Pi. Active-cooler fan noise will be edited out in post.

**Video actor.** Stock footage with a watermarked "SYNTHETIC SCENARIO" super, lowest legal and ethical risk. No AI-generated faces, no team members on camera as refugees.

**Plain-language style guide.** One universal in the system prompt, country-specific glossaries layered on top. Tobias's Bescheid glossary is different from Hawa's IER glossary, but both run through the same five-rule style guide.

**Unsloth side prize.** Out of the fast-lane (T-3 days), in the deep-lane (T+10 days). Drop without regret if the core notebook is borderline by Sunday.

**Notebook structure.** One long, sectioned Kaggle notebook with navigable headers and modular executable cells, per the user's spec. Twenty-one sections, matching this PRD section-by-section so a judge can read the writeup and the notebook side-by-side.

**Track.** Digital Equity primary; Safety secondary.

---

## Hackathon strategy

The Gemma 4 Good Hackathon has three published judging axes: Impact & Vision, Technical Depth & Execution, Video Pitch & Storytelling. The prior-art winners of the Gemma 3n Impact Challenge converged on a clear pattern: named beneficiary, hybrid stack (Gemma + one specialist), offline-first demo, measurable closing claim. I am building to that pattern.

| Axis | My hero moment | What I will show |
|---|---|---|
| Impact & Vision | The Dignity Loop | A synthetic refugee hears her own record read back in her language and corrects one field. |
| Technical Depth — multimodal & long context | Document Fragment Reconstruction | Six artifacts (passport scan, UNHCR token photo, WhatsApp screenshot, school certificate, voice note, caseworker note) become one provenance-grounded dossier on a Pi 5, in 38 seconds. |
| Technical Depth — agentic function calling | The Schema Translator | Live tool-call trace with native Gemma 4 `<\|tool\|>` tokens visible on screen. |
| Responsible AI | The Constitutional Auditor | Failed-case log: the agent tries to write `political_affiliation`; the Auditor blocks, redacts, regenerates. |
| Edge feasibility | The Pi 5 Closing Shot | My hardware, on camera, airplane mode, benchmark card. |

The Unsloth side-prize attempt is the sixth narrative beat (deep-lane), with open weights and a published synthetic procedural-glossary corpus.

The deadline policy is locked: I adhere strictly to all Kaggle rules and eligibility requirements. The May 18, 2026 timeline is a soft target. If the artifact is genuinely strong by Sunday EOD I submit on May 18 with 12 hours of buffer; if it is borderline, I continue refining in the deep-lane and submit once the notebook runs end-to-end on a fresh kernel.

---

## What I will NOT claim

Because a sharp judge will look for it:

- No MTP acceleration on ARM. MTP drafters shipped May 5, 2026 but only gains documented are Apple Silicon and GPU; llama.cpp drafter loader is still missing.
- No "single forward pass" replacing Whisper. Gemma 4 audio is great; llama.cpp's audio path is not yet production-stable. I run Pi audio via HF transformers + ONNX, Android audio via LiteRT/MediaPipe.
- No fraud detection, fraud scoring, Sybil detection on refugees. That framing is the single biggest reputational hazard in humanitarian AI; I will not import it.
- No Riemannian manifold / SROI mathematical certification. The Constitutional Auditor is a hybrid rule + prompt system with logs. That is what it is. I will not dress it up.
- No claim that Masalit, Fur, or Zaghawa are supported by Gemma 4 at production quality. They are not. Human-interpreter routing is the answer.

---

## Architecture summary

The full architecture is in `TECHNICAL_SPECIFICATION.md`. The shape:

- **Scout (Gemma 4 E2B, Q4_K_M / INT4) on Android** — UI prompts, rapid translation drafts, Constitutional Auditor read pass, back-translation check, glossary building. ~12–20 tok/s on Snapdragon 8 Gen 3.
- **Analyst (Gemma 4 E4B, Q4_K_M) on Raspberry Pi 5** — multimodal synthesis, dossier reconstruction, cross-modal consistency, plain-language explainer, empathetic summary. ~2–4 tok/s; 4K runtime KV-cache window.
- **Native function calling** via Gemma 4's `<|tool|>` token lifecycle, JSON-Schema-typed arguments, guided decoding.
- **Storage** in SQLCipher AES-256, device-scoped passphrase, no raw artifact retention after caseworker signs.
- **Audit log** append-only, field-name-only, replayable.
- **Egress** only via the `commit_record` tool with an explicit caseworker tap.

---

## Synthetic demo scenarios

Two scenarios, both watermarked, both runnable end-to-end on the Pi 5.

**Scenario A — Hawa and the Reconstructed Dossier.** Eisenhüttenstadt reception center, Day 7. A synthetic Sudanese family arrives for second contact. Six fragmentary artifacts. The four capabilities run end-to-end. The Dignity Loop plays in French (per the consent step). The refugee corrects one field. Total wall time on the Pi 5: ~75 seconds.

**Scenario B — Tobias and the Blocked Field.** Same reception center, different room. A synthetic Chadian-Arabic speaker arrives alone. His testimony mentions political persecution. The Constitutional Auditor blocks the `political_affiliation` write and logs a protection-concern referral. The refugee never sees the attempted write. The caseworker sees a non-data-bearing referral chip.

Both scenarios live in `synthetic_cases/aisha/` and `synthetic_cases/yusuf/` as JSON + WAV + JPG bundles. Every file watermarked.

---

## Evaluation plan

Seven reproducible evaluation cells, each with a published target. Full details in `eval/PLAN.md`. Headline targets:

| Eval | Target |
|---|---|
| Dialect-Triage Recall (to human interpreter) | ≥0.95 |
| Dossier Reconstruction Precision (seven IER attributes) | ≥0.90 |
| Provenance Integrity (evidence-quote in OCR) | ≥0.98 |
| Constitutional Auditor Adversarial Test (25 prompts, 0 leaks) | 0 leaks |
| Comprehension-Proxy Round-Trip F1 | ≥0.90 |
| Plain-Language Style-Guide Adherence | ≥0.95 |
| Edge Latency p95 (Pi 5, multimodal turn) | ≤15 s |

---

## Data and ethics commitment

Synthetic data only. No real refugee, asylum-seeker, or stateless person's data is used at any point. No affiliation with or endorsement by UNHCR, IOM, ICRC, or any host or origin state. PRIMES referenced as architectural inspiration, never as integration target. No eligibility, credibility, fraud, or status determinations. No participation in substantive asylum interviews, biometric matching, or document authentication. Full statement in `DATA_ETHICS_STATEMENT.md`, verbatim in the README.

---

## Deliverables

| Artifact | Path | Target |
|---|---|---|
| Final PRD | `/PRD_FINAL.md` | this file |
| Technical Specification | `/TECHNICAL_SPECIFICATION.md` | locked |
| UI/UX Specification | `/UIUX_SPECIFICATION.md` | locked |
| README (public-facing) | `/README.md` | locked |
| The Constitution v1.0 | `/CONSTITUTION.md` | locked |
| Data & Ethics Statement | `/DATA_ETHICS_STATEMENT.md` | locked |
| Project structure | `/PROJECT_STRUCTURE.md` | locked |
| Reproduction guide | `/REPRODUCE.md` | locked |
| System prompts | `/prompts/SYSTEM_PROMPTS.md` | locked |
| DPIA-as-code | `/governance/dpia.yaml` | locked |
| DSA-as-code | `/governance/dsa.yaml` | locked |
| Evaluation plan | `/eval/PLAN.md` | locked |
| Video script | `/video/SCRIPT.md` | locked |
| Synthetic scenarios spec | `/synthetic_cases/SCENARIOS.md` | locked |
| Contribution guide | `/CONTRIBUTING.md` | locked |
| License | `/LICENSE` | Apache 2.0 |
| Git ignore | `/.gitignore` | locked |
| Kaggle Notebook | `/notebook.ipynb` | to build |
| 90-second video | `/video/globis-edge-90s.mp4` | to record |
| Synthetic bundles | `/synthetic_cases/aisha/`, `/synthetic_cases/yusuf/` | to build |
| Source code | `/src/` | to build |
| Tests | `/tests/` | to build |
| Reproducibility script | `/reproduce.sh` | to build |

The locked artifacts are the design layer. The "to build" artifacts are the implementation. The next thing I do after publishing this PRD is start on `src/` and `synthetic_cases/`.

---

## How I will know it is done

I will consider the submission a winning artifact when, on a fresh laptop with a fresh Kaggle notebook kernel:

1. The notebook runs end-to-end without errors and reproduces all seven eval tables.
2. Both synthetic scenarios complete the full agentic flow on the Pi 5.
3. The 90-second video shows airplane mode, the Conflict Chip, the Auditor redaction, and the Dignity Loop.
4. The README's Data & Ethics Statement is the second thing a judge sees, after the title.
5. The license is Apache 2.0 and every synthetic file is watermarked.
6. The Constitution v1.0 is a separate Markdown file, citable.
7. Not a single sentence in any artifact claims real UNHCR integration, real refugee data, or mathematical safety certification.

---

*Nadu, May 16, 2026.*
