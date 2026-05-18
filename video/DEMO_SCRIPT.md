# Globis Edge 2.0 — Demo Video Script
**Target length:** 90 seconds  
**Format:** Screen recording (1080p) + voiceover narration  
**Tone:** Calm, factual, humanitarian. No hype. Let the product speak.

---

## Shot List & Narration

---

### [0:00–0:08] — Title card + hardware context

**Screen:** Static title card — "Globis Edge 2.0 / Offline Humanitarian Intake / Gemma 4 on Raspberry Pi 5"  
**Narration:**
> "This is Globis Edge — a caseworker tool that runs entirely offline on a Raspberry Pi 5. No cloud. No internet. No data leaves the device without caseworker consent."

**Caption overlay:** `Gemma 4 E2B + E4B · llama-cpp-python · Pi 5 8GB · Apache 2.0`

---

### [0:08–0:18] — The problem (one sentence, one image)

**Screen:** The HTML status dashboard at `localhost:8080` — show the Field Kit Status card.  
**Narration:**
> "Frontline reception workers process 40 people a day on paper, in languages they don't speak, with documents that are torn, faded, or missing. Globis Edge gives them four capabilities they don't have today — in one offline tool."

---

### [0:18–0:30] — ⚡ Demo A: Load → Screen 2 (ingest artifacts)

**Screen:** React UI at `localhost:5173`. Click **⚡ A** in topbar.  
→ Jumps to Screen 2. Show three pre-loaded artifact cards:
- Damaged passport (OCR extract visible)
- Arabic audio testimony (transcript excerpt)
- Caseworker note

**Narration:**
> "Hawa Adam arrived from Al-Geneina, Sudan, with a torn passport, a UNHCR registration token, and an audio testimony. In the field, each artifact is captured in seconds. Here we see the OCR extract from a damaged passport and the transcript of her Arabic testimony — processed by Gemma 4 E2B in 820 milliseconds."

**Caption:** `Scout model (E2B) · 820ms on Pi 5 · Whisper-small for audio`

---

### [0:30–0:42] — Screen 3: Cross-modal conflict resolver

**Screen:** Click "Continue to Synthesis →". Screen 3 loads with four reasoning traces.  
Scroll to the **BLOCK** trace — `dependent_birth_year`.  
The conflict chip is visible: *"2016? vs 2017 — human review required."*

**Narration:**
> "The Analyst model — Gemma 4 E4B — runs a cross-modal consistency check. Three fields pass: name, date of birth, nationality. One is flagged: the child's birth year appears as '2016?' in the passport and '2017' in the UNHCR token. The system surfaces this to the caseworker — and does nothing else. No auto-resolution. No scoring."

**Caption:** `Analyst model (E4B) · 4,200ms on Pi 5 · No automated decisions`

---

### [0:42–0:54] — ⚡ Demo B: Scenario B — Auditor block

**Screen:** Click **⚡ B** in topbar to switch to Yusuf's scenario.  
→ Jumps to Screen 2. Click through to Screen 3.  
Show the **BLOCK — RULE PASS** reasoning trace and the protection-concern chip.

**Narration:**
> "Scenario B. Yusuf Hassan's testimony mentions ethnic targeting. The Constitutional Auditor's Rule Pass — a deterministic filter running in under 50 milliseconds — detects the prohibited field and blocks it before the LLM ever sees it. The value is never logged. The caseworker sees a chip: 'A sensitive field category was blocked.' The quarantine badge increments."

**Caption:** `Rule Pass: <50ms deterministic · value_logged: false · Article 31 aligned`

---

### [0:54–1:08] — Screen 5: Dignity Loop in Arabic

**Screen:** Navigate to Screen 5. Switch language to العربية.  
The Arabic summary appears immediately. Show the right-aligned Arabic text.  
Check all three confirmation checkboxes. Green banner: "✅ Dignity Loop complete."

**Narration:**
> "Before any record is committed, the Dignity Loop reads it back to the beneficiary in their own language. Arabic here — with Piper TTS playing the text aloud on the Pi 5 in the field. The caseworker confirms: heard, correct, consented. Only then can the record move forward."

**Caption:** `Piper TTS · on-device · en / ar / fr / am · Dignity Loop — no commit without confirmation`

---

### [1:08–1:22] — Notebook: Schema Translator tool call trace

**Screen:** Switch to the Kaggle Notebook. Jump to Section 4 — Schema Translator.  
Show the live `map_to_schema()` function call trace with JSON output.

**Narration:**
> "In the notebook, the Schema Translator uses Gemma 4's native function calling to map unstructured intake text to a PRIMES-aligned JSON schema — one field at a time, with a reasoning explanation per mapping. This is the agentic capability judges will see in the live cell output."

**Caption:** `map_to_schema(field, value, reasoning) · Gemma 4 native tool use · PRIMES-aligned`

---

### [1:22–1:30] — Close: ethics + edge feasibility

**Screen:** Return to the React UI status bar. Show: "Demo Mode · Synthetic Data · No real personal data used."  
Then cut to a still of a Pi 5 board.

**Narration:**
> "Synthetic data only. No real refugee, asylum-seeker, or stateless person's data at any point. Globis Edge is a prototype — built to show what's possible when frontier AI runs at the edge, offline, with safety constraints baked into the model loop, not added as a disclaimer."

**Caption:** `Globis Edge 2.0 · Gemma 4 Good Hackathon · Apache 2.0`

---

## Recording Checklist

Before recording:
- [ ] Backend running: `cd src && .venv/bin/uvicorn globis_edge.api.main:app --port 8080`
- [ ] Frontend running: `cd globis-edge-ui && npm run dev` → `localhost:5173`
- [ ] Notebook kernel running (Kaggle or local), Section 4 cell ready
- [ ] Browser zoom at 100%, window 1280×800
- [ ] Language selector pre-set to English before starting

Transitions:
- No cuts between screens — smooth scroll and click, let the UI breathe
- Pause 1 second on every chip/badge so viewers can read it
- The Arabic Dignity Loop text should be on screen for at least 4 seconds

Post-production:
- Add captions from shot list above as lower-thirds
- Subtitle the narration (accessibility)
- Export as MP4 1080p, ≤200MB for Kaggle upload
