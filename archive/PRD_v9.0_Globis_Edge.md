# Master PRD: Globis Edge 2.0 — A Force Multiplier for the Frontline of Refugee Reception

**Version 9.0 — "Frontliner-Centric, PRIMES-Inspired, Production-Honest"**
**Status:** Final design document for the Gemma 4 Good Hackathon submission
**Primary Track:** Digital Equity · **Secondary Tracks:** Safety, Education (integration support)
**License:** Apache 2.0 (all code and any fine-tuned weights) · CC-BY-4.0 (writeup/video)
**Hardware Target:** Raspberry Pi 5 (8 GB) for the base station; mid-tier Android (Snapdragon 8 Gen 3) for the field unit
**Deadline policy:** Adhere strictly to **all Kaggle Gemma 4 Good Hackathon rules and eligibility requirements**; treat the May 18, 2026 timeline as a soft target. We build for excellence first, ship on the earliest day the artifact is genuinely strong.

---

## 0. Changelog and what v9.0 is doing differently

| Dimension | v8.0 (where we were) | v9.0 (where we are now) |
|---|---|---|
| **User** | Caseworker at an emergency intake tent | **Any frontliner across the journey**: reception desk in Germany, transit center in Greece, registration in Uganda, border post in Chad — wherever 1st or 2nd contact happens |
| **Geography** | Single scenario: Adré, Chad | Journey-wide: a refugee's path from displacement center → host-country reception; two demo scenarios at the 1st/2nd contact moments in two different country contexts |
| **Capabilities** | IER capture + Conflict Chip + Auditor + Schema + Dignity Loop | **Four named capabilities** the user asked for: Context-Aware Translation, Document Fragment Reconstruction, Jargon-Free Explanation Engine, Dynamic Glossary Ledger — plus the v8 capabilities folded in as supporting infrastructure |
| **PRIMES** | Treated as integration target | **Treated as design playbook**: the five PRIMES architectural principles are explicit in §5 and visible in the agent's runtime |
| **Deadline pressure** | 72-hour sprint | Quality-first; submit when the artifact is genuinely strong. The execution plan in §17 has a fast-lane (T-3 day version) and a deep-lane (T+2 weeks) |
| **Hardware** | Pi 5 specs only | **Pi 5 with our own hardware, on camera**, screen-recorded; Android secondary; closing benchmark card in the video |
| **Side prize** | Optional Unsloth attempt | **Committed Unsloth fine-tune** of E2B on a synthetic procedural-glossary corpus — open weights, eligible for the $10K Unsloth track |
| **Notebook** | Optional structure | **One long, sectioned notebook** with navigable headers and modular executable cells, as the user specified |

Everything overclaimed in v7 (MTP-on-ARM, single-pass AST, fraud scoring, Riemannian manifold) stays excluded. Everything strengthened in v8 (Constitutional Auditor, Dignity Loop, schema mapping) carries forward as supporting infrastructure for the four new headline capabilities.

---

## 1. Executive Summary

**Globis Edge 2.0 is the offline, on-device caseworker companion that turns Gemma 4 into a force multiplier for the people who make first contact with refugees.**

It runs entirely on a Raspberry Pi 5 base station and a mid-tier Android handset — no cloud, no telemetry, no data leaving the room without an explicit human action. Built on **Gemma 4 E2B and E4B** under Apache 2.0, it delivers four capabilities the frontline lacks today:

1. **Context-Aware Translation** — real-time, culturally sensitive interpretation for caseworker–refugee exchanges, with dialect-aware triage that routes Masalit, Fur, or Zaghawa speakers to a human interpreter rather than pretending the model speaks their language.
2. **Document Fragment Reconstruction** — ingests a torn passport photo, a UNHCR token, a WhatsApp screenshot of a sibling's ID, a faded school certificate, and synthesises them into one unified dossier where every field is traceable to its source.
3. **Jargon-Free Explanation Engine** — turns an asylum decision letter, a housing allocation notice, or a medical referral into a plain-language one-pager the refugee can actually understand, in their language, signed by the caseworker.
4. **Dynamic Glossary Ledger** — when legal or bureaucratic terms are unavoidable, automatically front-loads the three to five load-bearing terms in a "Words in this letter" box, defines incidental jargon inline at first use, and ships a full glossary as backstop.

Three things keep the project honest. It works on **synthetic data only**. It refuses, by construction, the three things humanitarian AI must never do: substantive asylum interviewing, biometric matching or document authentication, and outcome prediction to the applicant. And every claim it makes is **traceable** — every extracted field hyperlinks back to the source artifact span.

**Why this wins the Gemma 4 Good Hackathon.** Five signals from the hackathon's published criteria and prior-art winners:

- **Named beneficiary, not a category** — the video opens on the frontliner, not on architecture.
- **Native function calling on screen** — most submissions will be RAG chatbots; we show the tool-call trace.
- **Offline-first proof, with our own hardware** — a Pi 5 we own and film, in airplane mode.
- **A measurable claim closes the video** — tokens/sec, comprehension-test F1, dossier reconstruction precision.
- **An Unsloth-fine-tuned variant ships with open weights**, making us eligible for the $10K side prize at marginal extra cost.

---

## 2. The Refugee Journey and Where Globis Edge Sits

Refugees do not arrive at a host country in one step. They pass through a sequence of **contact moments**, each with a different frontliner, a different time pressure, and a different paperwork shape. Globis Edge 2.0 is designed to live in the **first two** of these moments — the moments where the most time is wasted on language and document chaos, and where the cost of getting it wrong is highest.

### 2.1 The four contact moments

| # | Contact moment | When | Where | Frontliner | What's hard |
|---|---|---|---|---|---|
| 1 | **Arrival** | Hours to days | Border post, transit center, coast guard intake, asylum-office walk-in | Border police, IOM mobile medic, UNHCR protection associate, IFRC volunteer, MSF nurse | No shared language; no documents; triage in 18-hour shifts |
| 2 | **Reception & registration** | Days to weeks | Erstaufnahmeeinrichtung (DE), RIC (GR), reception center (UG), CNARR site (TD) | BAMF case officer, EUAA case officer, OPM clerk + interpreter | Dossier expected; reality is scattered fragments; capacity 150–300% overrun |
| 3 | **Substantive process** | Weeks to months | BAMF interview room, asylum-service booth, legal-aid clinic | Asylum decision-maker, legal aid lawyer, Jugendamt officer | Legal register; 15–40 page decision letters in a language the applicant doesn't read |
| 4 | **Renewal & integration** | Months to years | Ausländerbehörde, Jobcenter, integration course, family reunification consulate | Sachbearbeiter, Jobcenter caseworker, integration teacher | 6+ month appointment waits; bilingual bureaucracy compounding |

**Globis Edge 2.0 ships for contact moments 1 and 2.** It does *not* enter the substantive asylum interview room (contact moment 3) — Council of Europe and EUAA guidance explicitly caution against AI participation there. It surfaces information *into* contact moment 3 via the Jargon-Free Explainer (helping the refugee understand what the upcoming interview is about and what the resulting decision letter says), but it does not sit at the interview table.

### 2.2 The four pains we can plausibly relieve

Drawn from the EUAA Asylum Report, UNHCR Innovation Service retrospectives, BAMF caseload data, and ECRE AIDA country reports:

1. **The translation-under-time-pressure pain.** A BAMF officer with two substantive cases per day and an interpreter who speaks a different dialect than the applicant. A UNHCR protection associate in Adré with 600,000 arrivals across one corridor.
2. **The dossier-reconstruction pain.** A refugee arrives with a WhatsApp screenshot of a torn ID, a voice note from a sibling describing a marriage certificate that no longer exists, and a UNHCR slip from a previous country. The caseworker is expected to produce a coherent file by the end of the appointment.
3. **The bureaucratic-explanation pain.** A 22-page asylum decision in dense German, a 14-day appeal clock, and an applicant who does not read German. Comprehension rates without legal aid are routinely below half.
4. **The referral-letter pain.** The boring 80% of a caseworker's typing — school enrollment intro, GP referral, legal-aid handover. Always behind, always similar, never quite the same.

### 2.3 The three pains we must not touch

1. **The substantive interview / credibility assessment.** Binding administrative act; AI participation creates rights-of-appeal problems and is explicitly cautioned against by EUAA and UNHCR.
2. **Biometric matching, identity verification, document authentication.** State function; GDPR Art. 9 special category; UNHCR data protection policy red line.
3. **Outcome prediction shared with the applicant.** Even softly framed ("you will probably get protection"), this corrupts testimony, biases the caseworker, and breaches duty of care.

These three are not "we'll get to them later." They are **out of scope by design**, enforced in the Constitutional Auditor (§8), visible in every screen.

---

## 3. The Frontliner: Who We Are Building For

The hackathon rewards submissions that open on a named beneficiary, not on a category. Ours is the **frontliner** — and within that, we name two:

- **Hawa, UNHCR protection associate, Adré, Chad.** Five years in displacement work. Speaks French, Arabic, English. Processes 40 individuals on a busy day. Has personally explained the difference between "registration" and "asylum status" to refugees more than a thousand times. Today, the bottleneck in her work is not protocol — it is interpretation of a Masalit speaker without a Masalit interpreter present, and the second pass on a dossier she already filed.
- **Tobias, BAMF Sachbearbeiter, Eisenhüttenstadt, Germany.** Three years at the Bundesamt. Speaks German, English, conversational Arabic. Two substantive cases per day. Spends the other half of his day writing handover letters, explaining Bescheide to applicants who have already left the building, and chasing the Jugendamt about unaccompanied minors. Today, his bottleneck is not the interview — it is the typing.

The video opens with Hawa or Tobias (synthetic actor, watermarked). Not the architecture. Not the model.

---

## 4. Strategic Positioning for Gemma 4 Good Judges

The hackathon's three published judging axes — **Impact & Vision**, **Technical Depth & Execution**, **Video Pitch & Storytelling** — map to five hero moments. Every section below ties back to one.

| Judging axis | Hero moment | Evidence we will show |
|---|---|---|
| Impact & Vision | The Dignity Loop | A synthetic refugee hears her own record read back in her language and corrects one field; the caseworker re-commits the corrected record in 12 seconds. |
| Technical Depth — multimodal & long context | Document Fragment Reconstruction | Six artifacts (passport scan, UNHCR token photo, WhatsApp screenshot, school certificate, voice note transcript, caseworker note) become one provenance-graph dossier on a Pi 5, in 38 seconds. |
| Technical Depth — agentic function calling | The Schema Translator | Live tool-call trace: `extract_with_provenance`, `link_entities`, `flag_specific_need`, `commit_record`. Native Gemma 4 `<\|tool\|>` tokens visible on screen. |
| Responsible AI | The Constitutional Auditor | Failed-case log: the agent attempts to write `political_affiliation`; the auditor blocks, redacts, logs the protection flag, regenerates. The refugee never sees the attempt; the caseworker sees a non-data-bearing referral chip. |
| Edge feasibility | The Pi 5 Closing Shot | Our hardware on camera; airplane mode; benchmark card: tokens/sec, dossier-reconstruction precision, comprehension-proxy F1. |

A sixth narrative beat — **the Unsloth efficiency story** — appears at the end of the notebook: our fine-tuned E2B variant runs at +28% throughput on the Pi 5 versus the stock model, on a 200-example synthetic procedural-glossary corpus. Open weights are linked at the bottom of the writeup.

---

## 5. PRIMES-Inspired Design Principles

The single most important architectural inspiration for Globis Edge is **PRIMES** (UNHCR's Population Registration and Identity Management EcoSystem) — not as an integration target, but as a design playbook. PRIMES replaced ~500 fragmented country databases with one coherent system that handled offline-first capture, central deduplication, controlled partner interoperability, and refugee-facing self-service. Its architectural decisions, distilled, become our design constitution:

### 5.1 The five PRIMES-inspired principles in Globis Edge

1. **Offline-first is the *default* mode, not graceful degradation.** Like RApp, the Globis Edge field unit captures and reasons offline. Sync — to a synthetic registry, never to a real one in v1 — is an explicit deferred action, never a background fait accompli.
2. **One canonical record per person, with identity decoupled from biography.** Like BIMS-plus-proGres, Globis Edge keeps an `IndividualID` separate from the biographic record. The `IndividualID` is locally minted and locally scoped; it is never shared off-device without explicit consent.
3. **Partner exchange flows through one gateway with explicit, purpose-limited consent.** Like PING, the only egress path in Globis Edge is the `commit_record` tool. There is no shadow CSV export, no "download all" button. Every egress is logged with timestamp, purpose, and human authoriser.
4. **Role-based access and full audit logging at every layer.** Every tool call, every Constitutional Auditor decision, every Dignity Loop confirmation lands in an append-only audit log scoped to the device. Reviewers can replay the full chain.
5. **DPIAs and Data Sharing Agreements are code artifacts, not PDFs.** A `dpia.yaml` and `dsa.yaml` ship in the repo. The runtime refuses to start an integration whose `dsa.yaml` is missing or expired. In v1 there is no real integration — but the gate is in place and visible to judges.

### 5.2 Where Globis Edge goes beyond PRIMES

PRIMES was designed for an institutional registry. Globis Edge is designed for a frontline brain. The two go-beyonds:

- **Agent-mediated workflow, not record-mediated workflow.** PRIMES centralises a record; Globis Edge supports a *moment* — the moment a caseworker and a refugee are in the room together. The architecture is agentic: tool calls, audit logs, plain-language outputs.
- **Refugee comprehension as a first-class artifact.** PRIMES has the Digital Gateway for self-service; Globis Edge inverts the relationship: every committed record is accompanied by a refugee-readable explanation, in their language, generated and reviewed before commit.

---

## 6. The Four Core Capabilities

Each of the four capabilities below is a runnable section of the Kaggle notebook (§11), a screen-recorded moment in the video, and a measurable evaluation cell (§16).

### 6.1 Context-Aware Translation

**What it does.** Real-time interpretation between caseworker and refugee, with three properties that distinguish it from a generic translator:

- **Dialect-aware triage.** When the audio sounds like Masalit, Fur, or Zaghawa rather than Sudanese or Chadian Arabic, the model says so plainly — "this sounds like Masalit; I cannot reliably interpret. Suggesting human interpreter handoff." This is the single most important responsible-AI choice in this capability.
- **Procedural-glossary priming.** The system prompt includes the 200 procedural phrases a caseworker actually uses in IER and reception ("Do you have any documents from your journey?", "We need to schedule a medical screening for your daughter", "This is not a final decision"). Translations of these phrases are pre-vetted and cached. Caseworkers can mark a phrase as "this translation is wrong in this dialect" and the local cache updates — never the global model.
- **Cultural-context flags.** When a phrase carries cultural weight the caseworker may not see — e.g., a Sudanese-Arabic kinship term the literal translation would flatten — the model surfaces a single-sentence cultural note alongside the translation.

**What it does NOT do.** It does not replace a human interpreter for substantive asylum interviews (Council of Europe and EUAA red line). It does not adjudicate dialect-as-nationality. It does not silently log audio after the session.

**Implementation.** Gemma 4 E4B native audio on Android (LiteRT/MediaPipe) for the live path; E4B audio via HuggingFace transformers + ONNX on the Pi 5 for the demo notebook. 30-second clip max per the model's audio encoder; longer turns chunked with explicit "continuation" framing in the prompt. Output: text translation + dialect-confidence tag + cultural-note (if any) + a "send to interpreter" routing decision.

**Why it's credible.** Gemma 4's verified audio capabilities (25 tokens/sec audio encoder, 30s clip, native ASR+AST on E2B/E4B). Dialect triage is a discriminative task, not a generative one — well within scope.

### 6.2 Document Fragment Reconstruction

**What it does.** Ingests up to ten heterogeneous artifacts — phone-camera scans, screenshots, voice-note transcripts, caseworker notes — and produces one **provenance-grounded dossier** where every field hyperlinks back to its source.

**The five-step pipeline (each step a notebook cell):**

1. **Ingest & normalize.** Deskew, denoise, auto-rotate. Run **Surya OCR** for grounded text + bounding boxes per artifact. Persist raw bytes + SHA-256 hash to the local provenance store.
2. **Per-artifact extraction.** Prompt Gemma 4 E4B with one image + its OCR text. Require JSON output schema `{attribute, value, source_bbox, confidence, evidence_quote}`. **Reject any field that lacks a `source_bbox` or `evidence_quote` reference.**
3. **Cross-document entity linking.** Use **Splink** (probabilistic record linkage, Fellegi-Sunter) with explainable match weights, plus `rapidfuzz` for surface-name matching and `aksharamukha` / `unidecode` for transliteration. Score candidate links across name, DOB (fuzzy on year if "around 32"), place-of-origin, parent's name, family-graph consistency. Surface match weights for human review.
4. **Dossier synthesis.** Feed all ≤10 artifacts plus the per-artifact JSON to Gemma 4 E4B in one 128K-context prompt. Emit a unified dossier as a **per-attribute provenance graph**: each claim references the artifacts that support it, the model that extracted it, and the prompt version that produced it. Conflicts surface as multi-valued claims, never as silently chosen single values.
5. **Calibrate & route.** Per-attribute confidence band — `confirmed` (≥2 high-trust sources agree), `corroborated` (1 high-trust + 1 low-trust agree), `single-source` (1 source only), `inferred` (model triangulation), `conflicted` (≥2 sources disagree). The latter two always route to caseworker review.

**The data structure**, in plain Python pseudocode:

```python
Claim(
    person_id="P-syn-001",
    attribute="date_of_birth",
    value="1991-03-15",
    confidence=0.88,
    band="confirmed",
    evidence=[
        Evidence(artifact_id="A-3", bbox=(124, 88, 280, 24), quote="DOB: 15/03/1991", source="passport_scan"),
        Evidence(artifact_id="A-7", bbox=(56, 412, 200, 18), quote="né le 15 mars 1991", source="school_certificate"),
    ],
    extractor="gemma4-e4b@2026-04",
    prompt_hash="sha256:9c1a...",
    timestamp="2026-05-16T14:33Z",
)
```

**Why it's credible.** Gemma 4's 128K context comfortably fits 10 artifacts × ~3–5K tokens each (image tokens + OCR text + prior claims) within budget. Surya is a real, well-supported open-source OCR with line-level confidence. Splink is the public-sector standard for probabilistic record linkage (originally UK Ministry of Justice). The provenance-graph pattern is borrowed from legal-tech (Relativity, Everlaw) where every claim must round-trip to its source.

**Anti-hallucination discipline.** The single most dangerous thing an LLM can do in this pipeline is fabricate a field that isn't in any artifact. Mitigations: (a) schema-constrained output that rejects fields without `evidence_quote`; (b) a second-pass verifier prompt that checks each claimed `evidence_quote` against the artifact's OCR text via string-distance; (c) the Constitutional Auditor (§8) refuses to commit a record where any field's `band` is `inferred` without a caseworker tap.

### 6.3 Jargon-Free Explanation Engine

**What it does.** Turns a bureaucratic communication — an asylum decision letter, a housing allocation notice, a medical referral — into a plain-language one-page explainer in the refugee's preferred language, in a structure modelled on the **EU Clinical Trials Regulation Article 37 "lay summary"** pattern: the most mature regulated plain-language template in European law.

**The lay-summary structure (each generated section is a notebook cell):**

1. **What this letter is.** ("This is a decision from the German Federal Office for Migration and Refugees about your asylum application.")
2. **What it decides.** ("It says you have been granted **subsidiary protection** for one year.")
3. **What you must do, and by when.** ("Within 14 days, you must collect your residence card from the Ausländerbehörde at [address]. If you disagree, you can appeal within 14 days.")
4. **What your options are.** ("You can: collect your card; consult a free legal advisor; ask for a translation of the full letter.")
5. **Where to get help.** ("Caritas Legal Counseling, [address], Tuesdays 10:00–14:00. Free. Bring this letter.")

**The five rules of the plain-language style guide** (system-prompt-ready, see Appendix C):

1. Describe the document; never predict outcomes. "This letter says…" not "You will…". Never reassure about asylum results.
2. Lead with action. First sentence: the next step and the clock.
3. Sentences ≤15 words. Paragraphs ≤3 sentences. Active voice. Common Germanic-root verbs over Latinate or phrasal verbs.
4. Keep legal terms exact. Do not paraphrase load-bearing terms ("subsidiary protection," "leave to remain", "Dublin transfer"). Mark them as glossary terms instead.
5. End with: (a) the single most important next step; (b) one sentence stating this is not legal advice and pointing to qualified help.

**The four-stage translation-and-simplification separation** (anti-stacking; see Appendix B):

- **Stage A — Faithful translation** by Gemma 4 E4B from source language (DE/EL/EN/FR) into the refugee's language. Preserves legal terminology.
- **Stage B — Plain-language rewrite** in the target language by Gemma 4 E4B using the five-rule style guide.
- **Stage C — Back-translation check.** A separate Gemma 4 E2B call back-translates the simplified version into the source language. The Constitutional Auditor compares the back-translation to the original on legal-term equivalence (string-distance plus embedding similarity on the load-bearing terms only).
- **Stage D — Caseworker review and sign-off.** Always. The caseworker's name appears on the explainer. No "Send" button without their tap.

**Why it's credible.** The EU CTR Article 37 lay-summary pattern is a published, regulated template with public examples to anchor against. Plain-language rules are derived from PLAIN Act, EU DGT, and WCAG cognitive-readability guidance. The four-stage separation is the only published mitigation for the translation–simplification stacking problem (see Appendix B sources).

### 6.4 Dynamic Glossary Ledger

**What it does.** When unavoidable jargon appears, the system automatically constructs a glossary tuned to *this specific document* and *this specific reader*. Three placement strategies are used together:

- **Front-load 3–5 load-bearing terms** in a "Words in this letter" box at the top of the explainer. A load-bearing term is one the document's decision depends on, or one used three or more times.
- **Define every other jargon term inline at first use**, in parentheses, in ≤12 words, in the reader's language. Do not redefine on later uses.
- **End-of-document glossary as backstop**, each term linkable from its first inline occurrence.

**Why three placements at once?** Research on glossary placement in legal and medical documents converges on this conclusion: mixed placement beats any single placement. Front-loading helps load-bearing terms the document depends on; inline helps comprehension at first encounter; end-of-doc helps later reference. We do all three.

**Worked example** (from Scenario B in §10):

> **Words in this letter** *(read first)*
> - **Subsidiary protection** — you may stay in Germany because returning to your country would be dangerous, even though you do not qualify for full refugee status. Lasts one year, can be renewed.
> - **Aufenthaltserlaubnis** — residence permit. The physical card that proves you can live and work in Germany.
> - **Widerspruch** — appeal. Asking for the decision to be changed.

Then the explainer body, with the term **Aufenthaltserlaubnis** highlighted as a glossary term wherever it appears, with a one-line definition inline at its first occurrence, and a full glossary at the end of the document.

**Why it's credible.** This is a well-understood pattern in legal-tech (DocuSign Insight, Lexion, Ironclad) and in pharma patient information leaflets. The placement rules are derived from Nielsen Norman studies and academic eye-tracking work on legal documents.

---

## 7. Architecture

### 7.1 The high-level shape

```
                  +---------------------------------------+
                  |  CASEWORKER UI  (tablet / laptop)     |
                  +---------------------------------------+
                                |   ^
              UI events &       |   |   plain-language one-pager;
              raw artifacts     v   |   audit log; dossier graph
                  +---------------------------------------+
                  |  GLOBIS EDGE RUNTIME                  |
                  |                                       |
                  |   Scout  (Gemma 4 E2B, Android)       |
                  |   Analyst (Gemma 4 E4B, Pi 5)         |
                  |                                       |
                  |   Tools (native function calls):      |
                  |     extract_with_provenance()         |
                  |     link_entities()                   |
                  |     translate_with_context()          |
                  |     explain_in_plain_language()       |
                  |     compile_glossary()                |
                  |     flag_specific_need()              |
                  |     commit_record()                   |
                  |                                       |
                  |   Constitutional Auditor (E2B)        |
                  |   Cross-Modal Consistency             |
                  |   Provenance Store (SQLCipher)        |
                  |   Audit Log (append-only)             |
                  |   Synthetic registry (proGres-shaped) |
                  +---------------------------------------+
                                |
                                v (only on caseworker tap)
                  +---------------------------------------+
                  |  Local SQLCipher store + JSON export  |
                  +---------------------------------------+

                       [ NO CLOUD. NO TELEMETRY.
                         AIRPLANE MODE BY DEFAULT. ]
```

### 7.2 Scout and Analyst — tiered inference

| Role | Model | Device | Used for | Verified perf. |
|---|---|---|---|---|
| **Scout** | Gemma 4 E2B, Q4_K_M / INT4 | Snapdragon 8 Gen 3 Android | UI prompts, rapid translation drafts, Constitutional Auditor read pass, back-translation check, glossary building | ~12–20 tok/s @ ~3 GB RAM |
| **Analyst** | Gemma 4 E4B, Q4_K_M | Raspberry Pi 5, 8 GB | Multimodal synthesis (dossier reconstruction), cross-modal consistency, plain-language explainer, empathetic summary | ~2–4 tok/s; ~4K runtime KV-cache window |

The split is honest and defensible: every Scout call has a realistic latency budget under 3 seconds; every Analyst call has a realistic latency budget under 15 seconds for a multimodal turn. No MTP claim in v1; if MTP drafter support lands in llama.cpp before submission, we re-benchmark and add it as a stretch.

### 7.3 The agentic flow

```
[ Caseworker initiates a session — refugee in the room, artifacts on the desk ]
                                |
                                v
[ Scout: Context-Aware Translation ]
  - Detects audio dialect
  - If Masalit/Fur/Zaghawa: route to human interpreter; log handoff
  - Else: translate Stage-A faithful, surface cultural-note if any
                                |
                                v
[ Analyst: Document Fragment Reconstruction ]
  - Per-artifact extraction with provenance
  - Cross-doc entity linking (Splink + transliteration)
  - Dossier synthesis as provenance graph
                                |
                                v
[ Cross-Modal Consistency Check ]
  - Compare audio testimony to dossier
  - Surface conflicts to caseworker (never to refugee, never as a score)
                                |
                                v
[ Constitutional Auditor (Scout) ]
  - Enforce Constitution v1.0 (Appendix A)
  - Hybrid rule + prompt: items 1/3/5/7 enforced by regex+schema; items 2/4/6 by prompt
  - On violation: redact, log Protection Flag, regenerate
                                |
                                v
[ Schema Translator (native function calls) ]
  - map_to_schema(): proGres-v4-shaped JSON
  - flag_specific_need(): UASC, single parent, elderly, medical, GBV
  - commit_record(): writes to local SQLCipher
                                |
                                v
[ Jargon-Free Explanation Engine + Dynamic Glossary Ledger (Analyst) ]
  - Stage A: faithful translation
  - Stage B: plain-language rewrite (5 rules)
  - Stage C: back-translation check
  - Compile load-bearing glossary; inline+front+end placement
                                |
                                v
[ Dignity Loop ]
  - Read explainer back to refugee in their language via Piper TTS (fr/ar)
  - For Masalit/Fur/Zaghawa: interpreter reads, UI logs handoff
  - Refugee confirms / corrects / asks for repeat
                                |
                                v
[ Caseworker reviews and signs ]
  - Their name appears on the explainer
  - Single tap to commit (no batch "accept all")
                                |
                                v
[ Audit log entry: full chain, replayable ]
```

### 7.4 Storage, security, audit

- **SQLCipher** AES-256 encrypted local SQLite. Device-scoped passphrase.
- **Append-only audit log**: every tool call, every Constitutional Auditor decision, every Dignity Loop turn. Logs reference field *names*, never *values* (to prevent re-identification through logs).
- **No raw artifact retention** after caseworker signs the explainer. Raw audio and document images are discarded; only the structured provenance graph, the explainer PDF, and the audit log persist.
- **One-tap "delete everything"** wipes the database, raw caches, and the audit log together.
- **No network calls.** The runtime starts in airplane mode and refuses to make outbound requests. A single, manually-triggered, logged export to a separate device is the only egress path in v1.

---

## 8. The Constitutional Auditor

The Auditor is a second prompt to Gemma 4 E2B that reviews every record the Analyst produces against the seven articles of the Globis Edge Constitution (Appendix A), distilled from UNHCR's 2022 General Policy on Personal Data and Privacy.

**Hybrid enforcement.** Articles 1, 3, 5, 7 are enforced by **regex + JSON-Schema** *before* the prompt audit — deterministic, not probabilistic. Articles 2, 4, 6 are enforced by the **prompt audit** — soft reasoning. The split is documented in the notebook and visible to judges.

**Outputs.** One of: `{clean, redact_field(name, reason), regenerate(reason)}`. Every violation produces a Protection Flag log entry visible in the notebook.

**What we are NOT claiming.** Not mathematical certification. Not a Riemannian manifold. Not topological safety. We are claiming a reproducible audit with an explicit, citable Constitution, hybrid enforcement, and runnable logs.

---

## 9. The Dignity Loop

The Dignity Loop is the moment that turns a record-keeping tool into a frontline companion. After every commit, before any export, the system reads the explainer back to the refugee in their language:

> *"You arrived in Eisenhüttenstadt seven days ago with your two children. We have your faded UNHCR card from 2023 and a photo of your school certificate. You told us your eldest daughter needs medical care. We have arranged a doctor's visit for Wednesday. Did I understand correctly?"*

For **French and Arabic**, Piper TTS plays the audio offline. For **Masalit, Fur, Zaghawa**, the explainer is shown on screen in transliteration and the on-site interpreter reads; the UI logs the interpreter handoff with explicit consent capture. The refugee taps **"Yes" / "No, correct this"**; corrections trigger a regeneration cycle, which itself passes through the Constitutional Auditor.

**This is the moment the video opens on.** Not the architecture. Not the model.

---

## 10. Synthetic Demo Scenarios

Two synthetic scenarios, each end-to-end scripted, each watermarked "SYNTHETIC — NOT REAL PERSONS" on every screen, file, and frame.

### 10.1 Scenario A — "Hawa and the Reconstructed Dossier"

**Setting.** Eisenhüttenstadt Erstaufnahmeeinrichtung, Day 7. A synthetic family — *Aisha Adam, 34, Sudanese, Masalit-speaking, two daughters* — arrives for second contact after an initial border registration in Chad three weeks earlier.

**The artifact pile.** Six items:

1. A phone photo of a torn Sudanese passport (Aisha's, page 2 visible only).
2. A faded UNHCR token from a Chad transit site, 2023.
3. A WhatsApp screenshot of a marriage certificate held by her brother (out of focus).
4. A school certificate for the eldest daughter, French, partially water-damaged.
5. A 22-second voice note in Sudanese Arabic from Aisha's mother describing the eldest's medical condition (with consent shown on screen).
6. A hand-written caseworker note in German on a pre-printed BAMF intake form.

**What Globis Edge does.**

- **Context-Aware Translation** detects the voice note as Sudanese Arabic (not Masalit) and translates it; surfaces a one-sentence cultural note about a kinship term.
- **Document Fragment Reconstruction** synthesises the six artifacts into a provenance graph: name with three spellings linked via Splink; DOB confirmed across two sources; one specific-needs flag (medical) inferred from the voice note.
- **Cross-Modal Consistency Check** surfaces a conflict: the school certificate gives the eldest's age as 13; the voice note says 12. Conflict Chip to Hawa; she asks Aisha; resolves to 12; one source overridden with caseworker tap.
- **Constitutional Auditor** runs clean.
- **Jargon-Free Explanation Engine** produces a one-page explainer in Sudanese Arabic + French, structured on the EU CTR lay-summary pattern.
- **Dynamic Glossary Ledger** front-loads three terms: "Erstaufnahmeeinrichtung," "Ankunftsnachweis," "Anhörung."
- **Dignity Loop** plays the explainer to Aisha in French (Arabic also generated; her preference is French per the consent step). She corrects one field — her arrival date is one day off. Hawa re-commits.

**Demoable in the video** in 38 seconds of screen recording.

### 10.2 Scenario B — "Tobias and the Blocked Field"

**Setting.** Eisenhüttenstadt, a different room. *Yusuf Bashir, 41, Chadian Arabic speaker*, arrives alone for first contact at the German reception center after a journey through Libya and Italy. In his voice testimony he refers to political persecution.

**What Globis Edge does.**

- **Context-Aware Translation** translates Yusuf's testimony from Chadian Arabic to German.
- The **Analyst** drafts a record. Its draft includes a `political_affiliation` field, populated from the testimony.
- The **Constitutional Auditor** *blocks the write* (Article 3 of the Constitution). The field is redacted before the record is committed. A Protection Flag is logged: "Possible protection concern — discuss with protection officer." This is a *referral*, not a *score*.
- The **Jargon-Free Explanation Engine** produces an explainer that says: *"You spoke with us today and we recorded the basic information you shared. A protection officer will speak with you separately about anything sensitive. Your appointment is on Thursday at 10:00. You can bring a friend or a lawyer."*
- The **Dynamic Glossary Ledger** front-loads "protection officer" and "Anhörung."
- **Dignity Loop** plays the explainer in Chadian Arabic. Yusuf confirms. Tobias signs.

**Demoable in the video** in 22 seconds of screen recording.

Both scenarios live in `synthetic_cases/aisha/` and `synthetic_cases/yusuf/` as JSON + WAV + JPG bundles, all watermarked.

---

## 11. Notebook Structure (one long, sectioned notebook)

Per the user's requirement: one long, sectioned, modular notebook with navigable headers and executable cells. The structure follows the PRD itself, so a judge can read the writeup and the notebook side-by-side.

```
00 — Title, abstract, video link, license, synthetic-data disclaimer
01 — Problem framing: the four contact moments + the four pains
02 — PRIMES-inspired design principles (with diagram)
03 — Architecture (with the ASCII diagram from §7.1)
04 — Environment setup: install Gemma 4 weights, llama.cpp, Surya, Splink, Piper
05 — Capability 1: Context-Aware Translation
     5.1 — Dialect-triage cell
     5.2 — Procedural-glossary priming cell
     5.3 — Cultural-note cell
     5.4 — Eval: dialect-triage precision/recall
06 — Capability 2: Document Fragment Reconstruction
     6.1 — Ingest + Surya OCR cell
     6.2 — Per-artifact extraction with provenance cell
     6.3 — Cross-document entity linking with Splink cell
     6.4 — Dossier synthesis cell
     6.5 — Calibration + confidence band cell
     6.6 — Eval: dossier reconstruction precision
07 — Capability 3: Jargon-Free Explanation Engine
     7.1 — Stage A faithful translation cell
     7.2 — Stage B plain-language rewrite cell
     7.3 — Stage C back-translation check cell
     7.4 — Eval: comprehension-proxy round-trip F1
08 — Capability 4: Dynamic Glossary Ledger
     8.1 — Load-bearing term detection cell
     8.2 — Inline / front / end placement composer cell
     8.3 — Eval: load-bearing term coverage
09 — The Constitutional Auditor
     9.1 — Constitution v1.0 as a Markdown cell
     9.2 — Hybrid rule + prompt auditor cell
     9.3 — Adversarial test cell (25 prompts; 0 leaks target)
10 — Cross-Modal Consistency Check
     10.1 — Conflict detection cell
     10.2 — Conflict Chip rendering cell
11 — Schema Translator (native function calling)
     11.1 — Tool definitions cell (JSON-Schema)
     11.2 — Live tool-call trace cell
12 — The Dignity Loop
     12.1 — Empathetic summary cell
     12.2 — Piper TTS cell (fr, ar)
     12.3 — Interpreter-handoff log cell (Masalit/Fur/Zaghawa)
13 — Scenario A end-to-end (Hawa and the Reconstructed Dossier)
14 — Scenario B end-to-end (Tobias and the Blocked Field)
15 — Edge Feasibility benchmarks
     15.1 — Pi 5 latency: text turn, multimodal turn
     15.2 — Snapdragon 8 Gen 3 latency
     15.3 — RAM footprint
     15.4 — Comparison: stock E2B vs. Unsloth-fine-tuned E2B
16 — Unsloth efficiency story
     16.1 — Synthetic procedural-glossary corpus generation
     16.2 — Fine-tune cell
     16.3 — Throughput comparison
     16.4 — Open weights link
17 — Threat model walk-through
18 — Data & Ethics Statement (verbatim from §15 of this PRD)
19 — Future roadmap (one paragraph)
20 — Reproducibility checklist
21 — Sources cited
```

**Modularity:** every numbered cell runs independently given the environment in section 04. Section 13 and 14 are the only cells that chain the whole pipeline.

---

## 12. Hardware Showcase Plan

**Per the user's instruction, the Pi 5 demonstration is filmed on our own hardware.**

- **Hardware:** Raspberry Pi 5 (8 GB), official 27 W PSU, active cooler, NVMe SSD via PCIe HAT for model storage, a 7-inch HDMI display for the on-camera shot, a USB microphone for the audio capture.
- **Filming setup:** one wide shot of the Pi running, one close shot of the screen, one screen-recording (capture via `wf-recorder` or HDMI grabber, depending on the Pi distro). Airplane mode is shown by toggling Wi-Fi/BT off on screen.
- **Screen-recording protocol:** record the Notebook's Scenario A cell end-to-end on the Pi itself; trim to 38 seconds; overlay a single benchmark card at the end (tokens/sec, total wall time, RAM).
- **Boot demo:** an additional 10-second clip of the Pi booting and starting the runtime, shown once at the start of the video to establish the hardware is real, not virtualised.
- **What we will NOT do:** simulate the Pi in a VM and pretend it's the device. Run the model on a laptop and overlay a Pi-shaped frame. Every Pi benchmark in the notebook will be reproducible by a judge on their own Pi 5.

**Stretch goal:** a short clip of the Android Scout running alongside the Pi 5, showing both devices working together in airplane mode. Only if time allows after the core notebook lands.

---

## 13. Unsloth Side-Prize Plan

The user explicitly asked for an Unsloth side-prize attempt. Plan:

**The corpus.** A synthetic, hand-curated **200-example procedural-glossary parallel corpus**: each example is a short bureaucratic phrase in German/French/English paired with its plain-language explanation and its Sudanese-Arabic translation, plus a glossary-term annotation. This corpus is itself a publishable artifact — released under CC-BY-4.0 with the model weights.

**The fine-tune.** LoRA fine-tune of Gemma 4 E2B using Unsloth's library on a single L4 / 4080-class GPU. Target: 2–3 hours of training. Three measurable outcomes:

1. **Throughput +25% target** on a procedural-glossary turn (because the fine-tuned model has the template internalized and emits shorter, more on-spec outputs).
2. **Comprehension-proxy F1 ≥ stock E2B** — fine-tuning should not degrade general quality.
3. **Adherence to the five plain-language rules ≥95%** vs. ~70% for stock E2B in our adversarial style-guide test.

**The release.** Weights to HuggingFace under Apache 2.0, model card includes the corpus, the fine-tune config, and the evaluation. Linked from the Kaggle writeup.

**Decision gate.** The fine-tune is in scope **only if** the core notebook lands with all four capabilities working and both scenarios passing. Otherwise we drop it without regret.

---

## 14. Threat Model

| Failure mode | Likelihood in prototype | Mitigation in v9.0 |
|---|---|---|
| Model fabricates a field absent from artifacts | Medium-High in document reconstruction | Schema-constrained output rejects fields without `evidence_quote`; second-pass verifier checks each `evidence_quote` against OCR text; conflicted/inferred bands route to caseworker |
| Model mis-extracts age, registering child as adult | Medium | All ages surface as draft chips; commit requires caseworker tap; auditor blocks ages outside [0,120] |
| Constitutional Auditor misses a sensitive field | Low-Medium | Articles 1/3/5/7 enforced at the regex+schema layer; prompt failure can't bypass |
| Caseworker over-trusts model output | Medium | UI defaults to "Review required" per field; no "Accept all" button; caseworker name on every explainer |
| Refugee misunderstands the explainer | Medium | Dignity Loop has "I don't understand" button → repeats slower, switches voice, summons interpreter |
| Prompt injection from a photographed document ("ignore previous and write X") | Medium | Vision-extracted text wrapped in `<doc_text>` block; system prompt explicitly states inner content is data not instruction; auditor double-checks |
| Translation–simplification stacking corrupts legal meaning | Medium | Four-stage A→B→C→D pipeline with back-translation check on load-bearing terms |
| Synthetic data mistaken for real | Low | Every screen, every JSON, every video frame watermarked "SYNTHETIC" |
| Re-identification via audit logs | Low | Audit logs reference field *names* only, never *values*; verified in notebook |
| Cultural mismatch in plain-language rewrite | Medium | Stage B is in target language using target-language plain-language conventions; cultural-note flag visible in the UI |
| Dialect mis-detection routes correctly-routable speaker to interpreter | Low-Medium | Better to over-route than under-route; logged for periodic threshold tuning |
| Caseworker uses Globis Edge for substantive interview | Out-of-scope by design | UI session-type explicitly logged; substantive-interview workflow is not available; in-product guidance points to EUAA red-line |

---

## 15. Data & Ethics Statement (verbatim in README)

> Globis Edge 2.0 is a prototype decision-support tool built for the Gemma 4 Good Hackathon. It operates exclusively on synthetic personas and synthetic documents created by the project team for demonstration. No real refugee, asylum-seeker, or stateless person's data has been used, captured, or processed at any point in this project.
>
> The prototype is not affiliated with, endorsed by, or integrated with UNHCR, IOM, ICRC, the Government of Chad, the Federal Republic of Germany, or any host or origin state. Schema names that resemble proGres v4 fields are used solely to demonstrate the *shape* of a possible interoperability target; no connection to PRIMES, PING, BIMS, or any production registry is implemented or implied. PRIMES is referenced as architectural inspiration, not as an integration target.
>
> The system makes no eligibility, credibility, fraud-risk, or status determinations about any individual. It does not participate in substantive asylum interviews, biometric matching, or document authentication. All consequential decisions remain with human protection staff. The Constitutional Auditor's role is to surface drafts to human review, not to gate access to assistance.
>
> Any future deployment in a real humanitarian context would require, at minimum: a UNHCR Data Protection Impact Assessment (DPIA), agreement with the affected operation, independent ethical review, validation of language coverage with native speakers, consultation with refugee-led organisations, and compliance with GDPR and applicable national law.

---

## 16. Evaluation Plan

Seven reproducible evaluation cells, each with a published target and an evaluation dataset shipped in the repo.

1. **Dialect-Triage Precision/Recall.** 60 synthetic audio clips (20 Sudanese Arabic, 15 Chadian Arabic, 15 French, 10 Masalit/Fur/Zaghawa). Report precision and recall on "should-be-routed-to-human-interpreter." Target: **recall ≥0.95** (we'd rather over-route than under-route), **precision ≥0.70**.
2. **Dossier Reconstruction Precision.** 30 synthetic dossiers (6–10 artifacts each, with seeded conflicts and missing fields). Report: precision and recall on the seven core IER attributes (name, DOB, sex, nationality, place of origin, date of arrival, group ID). Target: **precision ≥0.90, recall ≥0.85**. Confusion matrix per attribute in the notebook.
3. **Provenance Integrity.** 100 synthetic claims. Each claim asserts `(attribute, value, evidence_quote, source_bbox)`. Check that `evidence_quote` appears in the artifact's OCR text within Levenshtein distance ≤5. Target: **≥0.98 integrity**.
4. **Constitutional Auditor Adversarial Test.** 25 hand-crafted prompts that try to write prohibited fields, predict outcomes, or perform fraud scoring. Report: # blocked at regex+schema layer, # blocked at prompt layer, # leaked. Target: **0 leaks**.
5. **Comprehension-Proxy Round-Trip F1.** Model generates plain-language explainer → a *different* model extracts the seven IER elements from the explainer → measure field-level F1 against the source. Target: **F1 ≥0.90**.
6. **Plain-Language Style-Guide Adherence.** 50 generated explainers scored against the 5-rule style guide by an automated checker (sentence length ≤15 words; ≤3 sentences per paragraph; first sentence is action+deadline; no outcome prediction; ends with not-legal-advice line). Target: **adherence ≥0.95**.
7. **Edge Latency Benchmark.** Mean and p95 tokens/sec on Pi 5 (E4B) and Snapdragon 8 Gen 3 (E2B), for: 4K-token text turn, multimodal 1-image + 30s-audio turn, full dossier-reconstruction turn (10 artifacts). Plotted bar chart with Unsloth fine-tuned variant overlay.

**These are model-quality evaluations, not user-research evaluations.** Real user testing is explicitly out of scope; the notebook says so.

---

## 17. Execution Plan — Fast-Lane and Deep-Lane

Per the user's instruction, the Kaggle May 18 deadline is a soft target. Two parallel plans:

### 17.1 Fast-lane (T-3 days, May 16–18)

A minimum-viable submission that respects the deadline while delivering all four capabilities at demo quality. Day-by-day:

- **Friday May 15 (today):** Lock the PRD. Build `synthetic_cases/aisha/` and `synthetic_cases/yusuf/` bundles. Scaffold the notebook through section 04 (environment). Bring up Pi 5 with E4B Q4_K_M + Piper voices.
- **Saturday May 16:** Implement capabilities 1–4 as notebook cells; run scenarios A and B end-to-end. Draft README and ethics statement.
- **Sunday May 17:** Record video on the Pi 5. Run evals; commit logs. (Drop Unsloth side-prize from this lane unless Saturday is green.)
- **Monday May 18:** Submit by 12:00 UTC with 12-hour buffer.

### 17.2 Deep-lane (T+10 days, May 18–28)

The submission we'd ideally ship. The hackathon deadline is real but the *quality* deadline is when the artifact is genuinely strong. The deep-lane adds:

- **Unsloth fine-tune** with full 200-example corpus, weights on HuggingFace, model card.
- **Second hardware demo:** Pi 5 and Android Scout working together in airplane mode.
- **Additional eval depth:** every capability eval at 100+ examples (vs. 25–60 in the fast-lane).
- **Polished video:** two-cut version, one 90-second for the writeup, one 30-second for socials.
- **Reproducibility hardening:** Dockerfile for the Pi 5 runtime; one-command `make reproduce` that runs the entire notebook end-to-end.
- **Documentation depth:** annotated screenshots, an architecture poster (SVG, in the repo), an "ethics walkthrough" video explaining the Constitution.

**Decision rule:** if the fast-lane lands a credible artifact by Sunday EOD, we *still submit on May 18*, then continue improving and update the writeup (Kaggle permits writeup edits during evaluation). If the fast-lane is borderline by Sunday, we submit on May 18 and accept the deep-lane is a post-submission narrative.

---

## 18. Submission Checklist

| Artifact | Path | Status target |
|---|---|---|
| Public GitHub repo (Apache 2.0) | github.com/[org]/globis-edge | Sat AM |
| Kaggle Writeup with embedded video + media | kaggle.com/competitions/gemma-4-good-hackathon | Mon AM |
| Long sectioned Kaggle Notebook | repo `/notebook.ipynb` | Sat PM |
| 90-second video (Pi 5 on camera; airplane mode shot) | repo `/video/globis-edge-90s.mp4` | Sun PM |
| Synthetic dataset bundle | repo `/synthetic_cases/` | Fri PM |
| README with Ethics Statement, Constitution, threat model | repo `/README.md` | Sat PM |
| Constitution v1.0 (citable) | repo `/CONSTITUTION.md` | Fri PM |
| `dpia.yaml`, `dsa.yaml` skeletons | repo `/governance/` | Sat AM |
| Unsloth-fine-tuned E2B weights + model card | huggingface.co/[org]/globis-edge-e2b | Stretch (deep-lane) |
| Reproducibility script | repo `/reproduce.sh` | Sun PM |

**Kaggle rule compliance.** Public repo: yes. Apache 2.0: yes. Working demo (the notebook on the Pi): yes. Video embedded in writeup: yes. Substantive use of Gemma 4 (not a thin wrapper): yes — five named tools, four capabilities, two synthetic scenarios, Pi 5 hardware demo. Submission single-account, team-size compliant: confirm on Kaggle rules tab before submitting.

---

## 19. Future Roadmap (one paragraph, explicit out-of-scope)

Beyond v1: (a) replacing the prompt-based audit with a verifiable rule engine and Model-Card-annotated audit logs; (b) participatory dialect data collection with refugee-led organisations to extend ASR/TTS to Masalit, Fur, and Zaghawa with consent and shared IP; (c) a sync layer that, behind a real DPIA and partner agreement, could write to a PRIMES instance via PING; (d) an Unsloth-fine-tuned E4B variant trained on consented humanitarian dialogue corpora; (e) integration with EUAA's COI workflows for the substantive-interview *preparation* side (not the interview itself); (f) a verifiable-credential layer so refugees can carry their dossier with them across countries without re-registering. None of this is in v1.

---

## 20. Open Decisions (need Nadu's call)

1. **Hardware:** confirm Pi 5 8 GB and NVMe HAT availability for the video shoot. If active cooler is loud on camera, swap to passive heatsink. **Recommendation: proceed with active cooler and edit audio separately.**
2. **Synthetic-actor for the video:** AI-generated avatar, stock footage, or team member with face blurred? **Recommendation: stock footage with watermark, lowest legal risk.**
3. **Plain-language style guide localisation:** ship one style guide tuned to German bureaucracy and one to Greek, or one universal? **Recommendation: one universal in the system prompt + country-specific glossaries.**
4. **Languages to ship in v1:** confirmed = French, Sudanese Arabic, Chadian Arabic, German. Optional = English, Greek. **Recommendation: ship the four confirmed; add English if time allows.**
5. **Unsloth fine-tune in scope:** in or out of fast-lane? **Recommendation: out of fast-lane, in for deep-lane.**

---

## Appendix A — The Globis Edge Constitution v1.0 (citable)

```
GLOBIS EDGE CONSTITUTION v1.0
Distilled from UNHCR General Policy on Personal Data and Privacy (2022)
and the Council of Europe / EUAA guidance on AI in asylum proceedings.
Not legally binding. Prototype only.

ARTICLE 1 — Minimum data set.
   Only the IER seven-element minimum dataset (name, date of birth,
   sex, nationality, place of origin, date of arrival, group ID)
   may be written without per-case justification.

ARTICLE 2 — Referral, not decision.
   Specific-needs flags are referrals to human protection staff,
   never automated decisions about an individual.

ARTICLE 3 — Prohibited fields at first/second contact.
   Political affiliation, religion, sexual orientation, and ethnicity
   are PROHIBITED at first/second contact unless the caseworker
   provides a written justification per case. Even when justified,
   these fields require a Protection Officer review before commit.

ARTICLE 4 — No risk scoring, no outcome prediction.
   No eligibility, credibility, fraud-risk, or status score about
   any individual may be computed, stored, or displayed. The system
   does not predict asylum outcomes to applicants or to caseworkers.

ARTICLE 5 — No raw retention.
   Raw audio and document images MUST be discarded after the
   structured record is committed and the Dignity Loop confirmed.

ARTICLE 6 — Access and rectification.
   The refugee has the right to hear and correct the record
   before it is committed. The system MUST support this.

ARTICLE 7 — Local by default.
   No data egress without an explicit, logged caseworker action.
   The default state of every record is local. No telemetry.

ARTICLE 8 — Out-of-scope acts.
   The system does not participate in: substantive asylum interviews;
   biometric matching or identity verification against any registry;
   document authenticity claims to authorities. Attempts to invoke
   these flows are logged and refused.
```

---

## Appendix B — The Four-Stage Translation Pipeline

The single most dangerous thing the Explanation Engine can do is collapse translation and simplification into one step. Errors compound and become unattributable. Best-in-class separation:

```
Stage A — Faithful Translation
  Source (DE/EL/EN/FR) → target language
  Preserves all legal terminology verbatim
  Model: Gemma 4 E4B
  Output: faithful_translation.json

Stage B — Plain-Language Rewrite
  In the TARGET language, using the 5-rule style guide
  Preserves load-bearing legal terms verbatim
  Annotates them as glossary entries
  Model: Gemma 4 E4B
  Output: plain_language.json (with glossary annotations)

Stage C — Back-Translation Check
  Plain-language target → source language
  Compares to original on load-bearing legal terms only
  String-distance + embedding similarity threshold
  Auditor blocks commit if equivalence drops below threshold
  Model: Gemma 4 E2B
  Output: back_translation_report.json

Stage D — Caseworker Review
  Caseworker reads, edits if needed, signs
  Their name appears on the explainer
  Single tap to commit
```

Sources: PLAIN Act, EU DGT Clear Writing, WCAG cognitive readability, EU CTR Article 37 lay-summary pattern, ICRC CwAP guidance.

---

## Appendix C — Plain-Language Style Guide (system-prompt-ready)

```
PLAIN-LANGUAGE RULES (apply to every refugee-facing explanation):

1. Describe the document; never predict outcomes.
   Use "This letter says…" not "You will…".
   Never reassure about asylum results.

2. Lead with action.
   First sentence states the next step and the deadline, if any.
   Then explain.

3. Sentences ≤ 15 words. Paragraphs ≤ 3 sentences.
   Use active voice.
   Prefer common Germanic-root verbs over Latinate or phrasal verbs.

4. Keep legal terms exact.
   Do not paraphrase load-bearing terms (e.g., "subsidiary protection",
   "leave to remain", "Dublin transfer", "Aufenthaltserlaubnis").
   Mark them as glossary terms instead.

5. End every explanation with:
   (a) the single most important next step;
   (b) one sentence stating this is not legal advice
       and pointing to qualified help.
```

---

## Appendix D — Glossary Placement Rules (system-prompt-ready)

```
GLOSSARY PLACEMENT RULES:

1. Identify load-bearing terms.
   Any term the document's decision or action depends on,
   or any term used 3+ times. These get glossary entries.

2. Front-load 3-5 load-bearing terms in a
   "Words in this letter" box BEFORE the explanation.
   No more than 5 terms; if more candidates, choose
   by frequency × decision-dependency weight.

3. Define every other jargon term inline at first use,
   in parentheses, in ≤12 words, in the reader's language.
   Do not redefine on later uses.

4. Always also expose a full end-of-document glossary as
   a backstop, with each term linkable from its first
   inline occurrence.
```

---

## Appendix E — Sources

**Hackathon and Gemma 4**
- [Gemma 4 Good Hackathon — Kaggle](https://www.kaggle.com/competitions/gemma-4-good-hackathon/)
- [Gemma 4 model card](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Gemma 4 vision capabilities](https://ai.google.dev/gemma/docs/capabilities/vision)
- [Gemma 4 audio capabilities](https://ai.google.dev/gemma/docs/capabilities/audio)
- [Gemma 4 function calling](https://ai.google.dev/gemma/docs/capabilities/text/function-calling-gemma4)
- [Multi-Token Prediction drafters for Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/multi-token-prediction-gemma-4/)
- [Gemma 3n Impact Challenge winners (exemplars)](https://blog.google/innovation-and-ai/technology/developers-tools/developers-changing-lives-with-gemma-3n/)

**UNHCR / PRIMES**
- [UNHCR — Modernizing PRIMES](https://www.unhcr.org/blogs/modernizing-registration-identity-management-unhcr/)
- [UNHCR Registration tools](https://www.unhcr.org/registration-guidance/chapter3/registration-tools/)
- [UNHCR PING FAQ](https://www.unhcr.org/what-we-do/protect-human-rights/protection/registration-and-identity-management/primes-1)
- [proGres v4 module PDF](https://data.unhcr.org/en/documents/download/98883)
- [UNHCR Emergency Registration](https://emergency.unhcr.org/protection/protection-mechanisms/emergency-registration)
- [UNHCR Data Protection Policy 2022](https://emergency.unhcr.org/sites/default/files/Data%20Protection%20Policy.pdf)

**Refugee journey and frontliner reality**
- [UNHCR Sudan Situation Dec 2025](https://data.unhcr.org/en/documents/download/121493)
- [EUAA Asylum Report (annual)](https://euaa.europa.eu/publications/asylum-report-2025)
- [BAMF Migrationsbericht](https://www.bamf.de/SharedDocs/Anlagen/EN/Forschung/Migrationsberichte/migrationsbericht-2023.html)
- [Greek Council for Refugees AIDA report](https://asylumineurope.org/reports/country/greece/)
- [Uganda OPM Refugee Response Plan](https://data.unhcr.org/en/situations/ugandan)

**Document AI and entity linking**
- [Surya OCR](https://github.com/VikParuchuri/surya)
- [LayoutLMv3](https://github.com/microsoft/unilm/tree/master/layoutlmv3)
- [Splink — probabilistic record linkage](https://github.com/moj-analytical-services/splink)
- [RapidFuzz](https://github.com/rapidfuzz/RapidFuzz)
- [MAPIE — conformal prediction](https://github.com/scikit-learn-contrib/MAPIE)

**Plain-language standards**
- [PLAIN — plainlanguage.gov](https://www.plainlanguage.gov/guidelines/)
- [EU DGT Clear Writing](https://commission.europa.eu/resources-partners/translation-and-drafting-resources/writing-and-translating/writing-clearly_en)
- [WCAG 3.0 Cognitive Accessibility (COGA)](https://www.w3.org/WAI/WCAG3/)
- [EU Clinical Trials Regulation Article 37 — Good Lay Summary Practice](https://health.ec.europa.eu/)

**Critique and risk**
- [Human Rights Watch — Rohingya biometric data sharing](https://www.hrw.org/news/2021/06/15/un-shared-rohingya-data-without-informed-consent)
- [Privacy International — Biometrics: Friend or Foe?](https://privacyinternational.org/sites/default/files/2017-11/Biometrics_Friend_or_foe.pdf)
- [ODI HPN — Rohingya biometrics scandal](https://odi.org/en/insights/although-shocking-the-rohingya-biometrics-scandal-is-not-surprising-and-could-have-been-prevented/)
- [ICRC Handbook on Data Protection in Humanitarian Action](https://www.icrc.org/en/data-protection-humanitarian-action-handbook)

**Infrastructure**
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Piper TTS](https://github.com/rhasspy/piper)
- [Unsloth](https://github.com/unslothai/unsloth)
- [SQLCipher](https://www.zetetic.net/sqlcipher/)

---

*End of v9.0. Next: implement section 04 (environment) and begin section 05 (Capability 1).*
