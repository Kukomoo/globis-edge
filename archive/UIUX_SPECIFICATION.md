# UI/UX Specification — Globis Edge 2.0

**Author**: Nadu
**Companion to**: `PRD_FINAL.md`, `TECHNICAL_SPECIFICATION.md`
**Status**: v1.0 — locked for the fast-lane build
**Last updated**: 2026-05-16

This document is the design contract for the two surfaces that touch human beings: the **Caseworker Console** (Pi 5 + 7" HDMI display, or any LAN-connected tablet/laptop browser) and the **Scout App** (Android phone, used by the same caseworker on the floor or in the corridor). It is not a brand guide. It is a behavioural and visual specification tight enough that an engineer can build the screens without guessing, and strict enough that nothing on screen accidentally reads like a production deployment.

---

## 0. Design principles (the things every screen must honour)

1. **Caseworker is the user, refugee is the beneficiary.** Every screen serves the caseworker's decision flow. The refugee never sees the console; they only ever hear the Dignity Loop's TTS output and, optionally, see a printed plain-language letter. Designs assume a stressed, multilingual, time-pressured user who has been doing intake for 6+ hours.
2. **Show provenance, not confidence.** We do not display percentage scores next to AI output. We display the source the model used (OCR snippet, audio timestamp, typed-note paragraph) so the caseworker can verify. Confidence numbers create false precision. Source pins create accountability.
3. **The system never speaks in absolutes about the refugee.** No screen contains the words "fraud", "risk", "score", "matched", "denied", "approved". The vocabulary the user sees is "flag for review", "consistency note", "needs caseworker check", "for human review". This is enforced by microcopy lint (see §9).
4. **Synthetic-data discipline is visible.** Every screen that displays a synthetic refugee record carries a persistent diagonal SYNTHETIC watermark and a top-bar badge. The watermark is non-dismissable in demo mode. In a future production build (out of scope), the watermark is replaced by an environment badge (DEV / STAGING / PROD) controlled by a server-side flag.
5. **Offline is the default, not the degraded state.** The connectivity indicator shows OFFLINE as a neutral grey pill, not a red error. ONLINE-LAN is the secondary state for syncing between two caseworker consoles on the same site network. Cloud sync does not exist in this product and is not represented in the UI.
6. **The caseworker can always say "I disagree".** Every AI-produced artifact has a visible **Override** affordance. Overrides are logged, not blocked. The system never gates the caseworker.
7. **Plain language is a first-class UI surface.** The Jargon-Free Explainer's output is not buried in a tooltip — it is a top-level screen with its own glossary panel. Plain-language is a deliverable, not a footnote.
8. **Accessibility is a build acceptance criterion, not a stretch goal.** All screens meet WCAG 2.1 AA contrast and touch-target rules described in §8.

---

## 1. Two surfaces, one mental model

| Surface | Hardware | Role | Audience |
|---|---|---|---|
| **Caseworker Console** | Pi 5 + 7" HDMI display (or any LAN-connected browser at 1280×800+) | Main intake cockpit — ingest, synthesise, audit, commit | Frontline caseworker at their station |
| **Scout App** | Android phone (Snapdragon 8 Gen 3 class) running MediaPipe-LLM Inference + Piper TTS | Floor-mobile companion — quick translate, photo ingest, Dignity Loop playback | Same caseworker, walking around the reception centre |

The Scout App and the Console talk to the **same** local Pi 5 FastAPI server (see TECHNICAL_SPECIFICATION.md §11). The Scout caches a 2B Gemma in-process for the cases the LAN is unreachable. The two surfaces share the same design tokens (§4) and the same microcopy library (§9).

The **refugee** does not see a screen. They see and hear:
- A printed plain-language letter (A5, see §6.5).
- The Dignity Loop audio confirmation played out loud from the Scout phone's speaker, in their preferred language.
- Optionally, a printed glossary card in their language (§6.4).

---

## 2. Information architecture (Console)

The Console is a single-page application with a fixed left rail and a content stage. There is no global navigation menu beyond the rail. There are no tabs, no breadcrumbs, no drawer.

```
┌────────────────────────────────────────────────────────────────────┐
│  Top bar:  [SYNTHETIC DEMO]  Session ID  OFFLINE/LAN  Battery 87% │
├──────────┬─────────────────────────────────────────────────────────┤
│          │                                                         │
│  Rail    │            Content stage (single screen at a time)      │
│          │                                                         │
│  1 New   │                                                         │
│  2 Ingst │                                                         │
│  3 Synth │                                                         │
│  4 Expln │                                                         │
│  5 Dgnty │                                                         │
│  6 Commt │                                                         │
│  ────    │                                                         │
│  ⚙ Admin │                                                         │
│  ⓘ Audit │                                                         │
│          │                                                         │
└──────────┴─────────────────────────────────────────────────────────┘
```

The six numbered rail items are the **six contact moments** mapped in PRD_FINAL.md §3. They are always available in any order — the caseworker can ingest a new artifact partway through synthesis without losing state. The rail items show a small dot when they contain unreviewed AI output.

There is no "save" button. State is persisted to SQLCipher on every transition between rail items and on every blur of a free-text field.

---

## 3. Screen-by-screen specification (Console)

### 3.1 Session Start (rail #1)

**Purpose**: open a new case, declare the site, declare the languages, declare consent context. No biometrics, no name yet. The session ID is generated locally — UUIDv7 — and is the only identifier carried across screens until the caseworker decides to attach a name.

**Layout**:
- Hero card: "Start a new intake" with a single primary button.
- Below the button, three required fields (large tap targets, dropdowns with type-ahead):
  - **Site**: e.g. "Adré reception point — Tent 4" or "BAMF Eisenhüttenstadt — Room 12". Free-text-fallback if not on the list.
  - **Caseworker languages**: multi-select. Pre-populates from the previous session.
  - **Likely beneficiary languages**: multi-select. The caseworker will refine this after ingest.
- Below the fields, a **consent stub** that reads: "I will read the consent script to the person before continuing. The script will print in: [language pills]". The script itself opens in a modal.
- Bottom-right: secondary button "Resume a session" which opens a list of open sessions on this device.

**Empty / error states**:
- If no site is selected, the primary button is disabled and the helper text says "Pick a site so the audit log knows where this happened." (not "Please select a site").
- If the consent script has not been generated, the user is asked to confirm: "I have read the script aloud and the person has agreed to proceed."

**Microcopy guardrails**:
- Never say "create a refugee", "register the person", "open a case file". Say **start a new intake**. The word "intake" matters; it is the term UNHCR's IER documentation uses.

### 3.2 Ingest (rail #2)

**Purpose**: collect artifacts. Each artifact (photo, audio, typed note, paste) becomes an `Artifact` row (see TECHNICAL_SPECIFICATION.md §5). The screen is built around a single **drop zone** with three tabs: **Camera / Mic / Type-or-paste**.

**Layout** (default Camera tab):
- Full-width preview area with a soft dashed border. On hover or drag-over, the border becomes solid teal.
- Below: three pill tabs (Camera / Mic / Type-or-paste).
- Right column: **Artifact list** — a vertical stack of the artifacts already attached to this session, each row showing:
  - Icon (camera / mic / keyboard / clipboard).
  - Caseworker-typed label, e.g. "ID photo — front".
  - Timestamp.
  - Language tag (auto-detected by Gemma 2B; the caseworker can correct it inline).
  - A discreet trash affordance — destructive actions require a typed confirmation ("type DELETE to confirm").
- Bottom bar: primary button "Synthesise" — disabled until at least 1 artifact is attached. The button copy changes to "Synthesise 4 artifacts" once 4 are attached, so the user knows what they are about to do.

**Camera tab specifics**:
- The shutter button captures and immediately runs Surya OCR on-device. The result of the OCR (the raw text) is shown in a collapsible "What we read" panel under the captured thumbnail. The caseworker can edit the OCR output before continuing — this edit is logged.
- If the image is blurry (focal blur metric over a threshold), the UI shows a small amber chip "Image may be hard to read — re-take?" — not a blocking error.
- After capture, the user is asked: "Caseworker label for this artifact" with suggestions: "ID — front", "ID — back", "Letter", "Birth certificate", "Other".

**Mic tab specifics**:
- A single big record button (full circle, 96 dp). Tap to start, tap to stop. There is a 30-second hard cap per recording, visualised by an inset progress ring (matches Gemma 4 audio clip limit, see TECHNICAL_SPECIFICATION.md §10).
- On stop, a waveform preview appears with a small play button. The caseworker can re-record before committing.
- After commit, the recording is sent to /translate?audio=true (see API spec). The transcribed text appears inline with a language tag.
- Microphone permission denial state: "We need your microphone to hear what the person says. Open device settings to allow it."

**Type-or-paste tab specifics**:
- A multi-line input with a language selector above it.
- Paste detection: if the pasted text contains common PII patterns from a hardcoded list (long digit runs, "Passport No." headers), a one-time warning chip appears: "Paste may contain identifiers. The system will keep this in the encrypted database and never send it anywhere. Continue?"

**Hero interaction — Conflict Chip (preview)**:
After two or more artifacts are present, a subtle banner appears under the artifact list: "When you Synthesise, the system will check these artifacts against each other and surface anything that doesn't line up." This is the user's first exposure to the Cross-Modal Consistency idea. It is never called "fraud detection".

### 3.3 Synthesise — the Dossier (rail #3)

This is the hero screen of the product. It is the one the video opens on.

**Purpose**: show the caseworker the structured IER record the system has assembled, with **every field traced back to the artifact that produced it**, and surface any cross-modal consistency notes.

**Layout** — two columns:

Left (60%): the **Dossier**.
- Header: synthetic person handle (e.g., "Person — fa1c3b21"). No name yet unless the caseworker has filled one in.
- Section blocks, in IER order (7 core elements):
  1. Identity (name, alias, date of birth, sex)
  2. Family composition
  3. Nationality / origin / ethnicity (with the explicit note "ethnicity recorded only if the person volunteers it")
  4. Date and place of arrival
  5. Reasons for flight (free text, generated by Gemma summarisation of audio + notes)
  6. Specific needs (chips: "medical", "unaccompanied minor", "GBV survivor", "older person", "person with disability")
  7. Documents declared / presented

Each section has, on its right edge, a small **provenance pin** — a clickable dot. Tapping the pin opens a slide-over panel showing the source artifact (OCR snippet highlighted, audio segment with timecodes, or typed note paragraph). Pins are colour-coded by modality: image (◐), audio (♪), text (¶).

Right (40%): the **Consistency panel**.
- Top: a stack of **Conflict Chips**, one per cross-modal inconsistency the system found. Example chip:

  ```
  ┌─────────────────────────────────────────────────────┐
  │ ⚠  Name on the document and name spoken differ      │
  │                                                     │
  │   Document reads:  "Aïcha Mahamat"                  │
  │   Audio testimony: "Ayesha Mohammed"                │
  │                                                     │
  │   Likely cause from Gemma:                          │
  │   "These look like the same name written in         │
  │    French transliteration and in English            │
  │    transliteration of Sudanese Arabic."             │
  │                                                     │
  │   [ Treat as same person ]  [ Flag for review ]     │
  └─────────────────────────────────────────────────────┘
  ```

  Notes:
  - The chip never uses the word "fraud", "mismatch", or "discrepancy". It uses "differ", "doesn't line up", "needs a check".
  - The action buttons are two options, never three. There is no "decide later" — the caseworker must consciously park it (Flag) or merge it (Treat as same person). Both decisions are logged.
  - The "Likely cause from Gemma" line is the Cross-Modal Consistency Check output, written in plain language. It explains *why* the two strings could be the same thing — script differences, transliteration, common nicknames. It does **not** assess truthfulness.

- Below the chip stack: a small accordion **"Consistency notes the system did not flag"** — soft notes that didn't rise to chip level but the caseworker may still want to see.

- Bottom-right of the screen: primary button "**Send to Auditor**" — when pressed, the dossier is handed to the Constitutional Auditor (see §3.6 below). If the Auditor objects, the user is bounced back to this screen with the offending field framed in amber.

**Empty state**: "No artifacts yet. Go to Ingest." with a button.

**Error state — model failed**: "The Analyst model couldn't read these artifacts. You can retry, or fill the dossier by hand." The "fill by hand" route is always available — the system never blocks intake on a model failure.

### 3.4 Explainer (rail #4)

**Purpose**: turn a complex document (a BAMF Anhörungsbescheid, a UNHCR rejection letter, an attestation in legal French) into plain-language for the caseworker to read aloud to the refugee or hand them as a printed letter.

**Layout** — two columns:

Left (50%): the **Source document**.
- Pinned at the top: the artifact viewer (image with OCR highlights, or the original text).
- Below: technical/legal terms detected, highlighted in soft yellow inside the source text. Hovering shows the term's gloss; tapping pins it to the glossary panel.

Right (50%): the **Plain-language version**.
- Three stacked cards:
  1. **What this letter is** — one sentence.
  2. **What it asks you to do** — bullet list, max 5 items, each ≤15 words.
  3. **Words in this letter** — the glossary panel, 3–5 entries, each with the term, the plain-language gloss, and an example sentence using the term.
- Below: a "Read this to the person" button which routes the entire right column through the TTS engine in the refugee's language. Audio plays from the device speaker (Console) or the phone (Scout).

**Multi-language handling**:
- The right column has a language selector at the top. It defaults to the refugee's preferred language. Switching language re-runs the plain-language pipeline (stage 4 of the translation pipeline — see PRD_FINAL.md §6.1) and re-renders.
- For Arabic, the column flips to RTL automatically. The glossary panel preserves its layout but the term/gloss text is RTL. See §7 for full RTL rules.

**Caseworker review affordance**:
- A subtle "Edit this version" pencil at the top of the right column. The caseworker can rewrite the plain-language before printing. Edits are logged.
- A "Print A5 letter" button at the bottom. Sends to a Brother PT-P900W label printer over Bluetooth, or to any LAN printer in the Pi's discovered list.

**Empty state**: "Pick a document on the left to explain it in plain language."

### 3.5 Dignity Loop (rail #5)

**Purpose**: the refugee's only direct touchpoint with the system. The Console (or Scout) plays a short audio summary of what has been recorded, in the refugee's language, and asks the refugee to confirm or correct.

**Layout** — vertical, centred:

- Top: a single play button (96 dp), with the language pill clearly visible next to it.
- Below the play button: the spoken script rendered in three forms, stacked:
  1. The refugee's preferred language (the words they will hear).
  2. A back-translation into the caseworker's language (so the caseworker sees what is actually being said).
  3. The structured fields the loop is referencing, with provenance pins back to the source.
- Below the script: three large buttons:
  - **They confirmed**
  - **They corrected — let me edit**
  - **Re-read it**

The button order matters. "They confirmed" is leftmost and primary because the most common outcome is confirmation. "Re-read it" is rightmost because the audio may not have played clearly.

**Audio playback specifics**:
- Audio is generated by Piper TTS locally (Pi 5) or by MediaPipe TTS on Android. The generated WAV is cached for the session so re-reads do not regenerate.
- A waveform with a moving playhead is rendered. The caseworker can scrub.
- If the language is one of the "human interpreter routing" languages (Masalit, Fur, Zaghawa — see PRD_FINAL.md §5.1), the play button is **replaced** by a notice: "We don't have a TTS voice for this language. Please use a human interpreter and tick the box below to confirm you read this script in person."

**Microcopy in the script** (template):
> "Hello. A worker has helped to write down a few things you told us. I will read them back to you now, so you can tell us if anything is wrong. — [Reads the structured fields, one by one, in short sentences.] — Is anything wrong? If yes, please tell the worker."

The Dignity Loop never includes outcome predictions, never says "this will help your asylum case", and never names any specific authority.

### 3.6 Auditor review (modal, triggered from §3.3)

**Purpose**: show the caseworker every place the Constitutional Auditor flagged or redacted something, with the article of the Constitution that triggered it.

**Layout** — modal overlay, 720×800 dp:

- Header: "Constitutional Auditor — review before commit"
- Body: a vertical list of audit events. Each row:
  - **Article**: the Constitution article number (e.g., "Article 3 — No automated denial").
  - **Field affected**: e.g., "specific_needs.medical".
  - **What the system did**: e.g., "Removed a free-text comment that read like a clinical diagnosis." (The actual content is **not** shown unless the caseworker clicks "show me what was removed" — and that click is itself logged.)
  - Two actions: "Accept the auditor's edit" / "Restore the original — I take responsibility".
- Footer: "All audit events are logged with field names only. Field values are never written to the audit log."

The Auditor modal is the only place where Constitution text is surfaced to the user. A link "Read the full Constitution (v1.0)" opens CONSTITUTION.md in a read-only viewer.

### 3.7 Commit (rail #6)

**Purpose**: write the dossier to SQLCipher, optionally export a proGres-shaped YAML, and end the session.

**Layout**:
- Summary card: count of artifacts, count of fields, count of consistency notes, count of auditor edits.
- Two-step confirm: "Commit this intake?" → "Type COMMIT to confirm" → "Committed at HH:MM. Session closed."
- Post-commit, an "Export YAML" button appears for the caseworker to share the IER record with a colleague on the same site network. The YAML is never auto-exported.

### 3.8 Audit log viewer (rail ⓘ)

**Purpose**: let the site supervisor inspect what the system did, without exposing the refugee's data.

**Layout**:
- Table view: timestamp, session ID (truncated), action, article, field name. **No field values.**
- Filter: date range, session ID, article number, action type.
- Export: signed JSON-Lines file. Signing key is rotated per device (see TECHNICAL_SPECIFICATION.md §13).

### 3.9 Admin (rail ⚙)

Minimal. Three sections:
- **Device**: device ID, model versions (Gemma 4 E2B / E4B / quant), storage used, battery, temperature.
- **Languages**: which TTS voices are installed, with a one-tap install/remove from local cache.
- **Wipe**: a single destructive button "Wipe all session data on this device" — requires typing the device ID to confirm. This is the only way to clear SQLCipher.

---

## 4. Scout App (Android) — screen specification

The Scout app is intentionally thinner than the Console. Five screens, plus settings.

### 4.1 Home

- Big primary action: **Quick translate** (mic icon).
- Secondary: **Quick photo** (camera icon).
- Tertiary: **Pair with Console** (QR scan).
- Status row at bottom: paired Console ID, LAN connectivity, local model size.

### 4.2 Quick translate

- Full-screen mic affordance. Press-and-hold to record (max 30 s).
- Top: language switch ("from / to") with the same language pills as Console.
- After release: transcription appears above, translation appears below. Both have a small "send to Console" button. If LAN is reachable, the artifact lands in the active Console session's Ingest list (§3.2). If not, the artifact is queued locally and synced when the Console becomes reachable.

### 4.3 Quick photo

- Camera viewfinder. Capture button at bottom.
- After capture, an inline OCR pass runs on the phone (Gemma 2B). Text is shown.
- Same "send to Console" affordance as 4.2.

### 4.4 Dignity Loop (phone)

- Identical content to §3.5 but rendered single-column for the phone.
- The phone's speaker is louder than the Pi 5 HDMI display's built-in audio, so this is the preferred surface for actually playing back to the refugee.

### 4.5 Settings

- Paired Console.
- Local model versions.
- Wipe (same pattern as Console).

---

## 5. The Conflict Chip — interaction spec

The Conflict Chip is the most important new UI primitive in this product. It must be visually identifiable as "a thing the system noticed, not a thing the system decided". Detailed spec:

- **Container**: 1 px border in `warning-amber-300`, 8 dp radius, white fill in light mode / `surface-2` in dark mode. Never red — red would imply danger, which would imply the refugee is dangerous.
- **Icon**: outlined warning triangle. Never filled. Never a face icon, a flag icon, or a magnifying glass.
- **Heading**: one short sentence, present tense, factual. Format: "[what differs] differ" or "[X] doesn't match [Y]". Example: "Name on the document and name spoken differ". Bad examples: "Discrepancy detected", "Possible fraud", "Identity mismatch flagged".
- **Body**: a two-column compare block, max 80 characters per side, monospace for the values to make character-level differences visible.
- **Likely cause** (optional): a single sentence from Gemma. If Gemma cannot produce a confident sentence, the line is hidden — never replaced with placeholder text.
- **Actions**: exactly two buttons. Left = the assimilating choice ("Treat as same person", "Use the document version", "Use the spoken version"). Right = the parking choice ("Flag for review"). No third option.
- **State after action**: the chip collapses into a one-line summary at the bottom of the Consistency panel, with the chosen action and a small Undo. The audit log records the choice (action only, not values).

---

## 6. Glossary panel — layout spec

The "Words in this letter" panel is a first-class part of the Explainer screen (§3.4). It is the visible delivery of the Dynamic Glossary Ledger capability.

### 6.1 Composition rules

- **Three to five entries**, never more on a single screen. If the document contains more load-bearing terms, the panel paginates — never compresses.
- Order: by **first occurrence in the source document**, top-down. Not alphabetical. The caseworker is reading the source text top-down, so the glossary should align.
- Each entry has three rows:
  1. **Term**, in the source language, bold.
  2. **Plain-language gloss**, ≤ 25 words.
  3. **In a sentence**: a short example, e.g., "If a letter says 'subsidiary protection', it means…"

### 6.2 Visual treatment

- Each entry sits in its own card with a 1 dp divider. No bullets, no numbering.
- The term gets a small "highlight pill" in the same colour as the highlight applied in the source document (left column). The colour is `accent-yellow-200` in light mode, `accent-yellow-700-on-dark` in dark mode.
- A small audio icon on each entry plays the term + gloss through TTS.

### 6.3 Multi-language behaviour

- The glossary always shows the term in the **source document's** language (so the refugee can recognise it on the page) and the gloss in the **refugee's preferred language**.
- If the source language equals the refugee's language, the term row is dropped — only the plain-language gloss is shown.

### 6.4 Printed glossary card

When the caseworker prints the plain-language letter, an A5 glossary card is printed as page 2 with exactly the entries shown on screen. This is a deliverable the refugee takes away.

### 6.5 The plain-language letter — print layout

- A5, portrait.
- Page 1: the three cards (What it is / What it asks / Words in this letter).
- Page 2: the glossary card.
- Footer of every page: site name + date + "Synthetic example — not a legal document" (in demo). In a real deployment, the footer would carry the producing caseworker's role and a "this is a plain-language version, not the official letter" note.

---

## 7. RTL (Arabic) handling

Arabic is a first-class language. RTL handling is not a polish item; it is a correctness requirement.

- The entire **right column** of the Explainer (§3.4) flips to RTL when the gloss language is Arabic.
- The Dignity Loop's spoken language pane flips to RTL when the language is Arabic.
- **Numbers, dates, and IDs stay LTR** even inside an RTL block. The structured fields (date of birth, phone) use the `unicode-bidi: isolate` CSS rule.
- The mic recording's waveform does **not** flip — it remains left-to-right because audio time is a physical quantity, not a linguistic one.
- The glossary card's entries flip per-entry: the "Term" row is RTL if the term is Arabic, LTR otherwise; the gloss row is RTL if the refugee's language is Arabic.
- The Conflict Chip's two-column compare block flips so the **document side** is on the side that matches its script's reading direction. The system's "likely cause" line is in the caseworker's language and follows that language's direction.

We support Chadian Arabic (`ar-TD`) and Sudanese Arabic (`ar-SD`) as separate language tags; the script is identical, but the gloss vocabulary differs (see PRD_FINAL.md §5.2). Visually they render identically.

---

## 8. Design tokens

Tokens are the single source of truth. They live in `app/static/tokens.json` and are imported by both the React-Vite Console front-end and the Android (Jetpack Compose) Scout front-end via a generated `Tokens.kt`.

### 8.1 Colour

| Token | Light | Dark | Role |
|---|---|---|---|
| `surface-0` | #FFFFFF | #0B1220 | Page background |
| `surface-1` | #F6F8FB | #131C2E | Card |
| `surface-2` | #ECF1F7 | #1B2740 | Recessed card |
| `ink-1` | #0F1B2D | #F1F5F9 | Primary text |
| `ink-2` | #475569 | #94A3B8 | Secondary text |
| `accent-teal-500` | #0E7C86 | #4FD1C5 | Primary action |
| `accent-teal-700` | #086069 | #2C7A7B | Pressed state |
| `warning-amber-300` | #F6B100 | #FACC15 | Conflict chip border |
| `warning-amber-50-bg` | #FFF6D6 | #44320A | Conflict chip fill |
| `audit-violet-500` | #6D28D9 | #A78BFA | Auditor modal accent |
| `synthetic-watermark` | rgba(15,27,45,0.06) | rgba(241,245,249,0.08) | Diagonal SYNTHETIC overlay |
| `pin-image` | #0EA5E9 | #38BDF8 | Image provenance dot |
| `pin-audio` | #F59E0B | #FBBF24 | Audio provenance dot |
| `pin-text` | #14B8A6 | #5EEAD4 | Text provenance dot |

We avoid **red** as a UI accent anywhere a refugee record is shown. Red appears only in the Admin → Wipe destructive flow.

We **never** use country flags or national-colour palettes to indicate language. Languages are pills with the language name in its native script (e.g., "Français", "العربية (تشاد)", "Deutsch") on a neutral `surface-2` background.

### 8.2 Typography

- **Body**: Inter (English / French / German), Noto Sans Arabic (Arabic). 16 dp base, 1.5 line height.
- **Headings**: Inter (or Noto Sans Arabic) at 22 / 28 / 36 dp.
- **Mono** (provenance values, structured fields): JetBrains Mono 14 dp.
- All fonts ship locally with the app — no Google Fonts CDN. This is enforced by the build's lint rule that fails on any external font URL.

Minimum on-screen text size is **14 dp**. Captions and timestamps can be 13 dp **only** inside the audit log viewer (§3.8), where supervisors are reading dense data.

### 8.3 Spacing

8 dp base unit. Components use multiples: 8 / 16 / 24 / 32 / 48 / 64. No 4 dp or 12 dp values — they erode rhythm.

### 8.4 Elevation

Three levels only.

- `elev-0`: flat, surface-1.
- `elev-1`: 0 1 2 rgba(15,27,45,0.06) — cards.
- `elev-2`: 0 8 24 rgba(15,27,45,0.12) — modals, slide-overs.

### 8.5 Radius

8 dp radius for cards, chips, buttons. 16 dp for modals. 9999 dp (full pill) for language tags and status pills.

### 8.6 The SYNTHETIC watermark

- A repeating diagonal text watermark covering the entire content stage and the rail. Text is "SYNTHETIC — DEMO ONLY" rotated -22°, repeated every 280 dp horizontally and 200 dp vertically.
- Colour: `synthetic-watermark` token.
- The watermark sits **above** content (not below) so a screenshot always carries it. It is non-interactive (`pointer-events: none`).
- The watermark cannot be hidden by any user action. The only way to remove it is to flip the build flag `BUILD_MODE=demo` to `BUILD_MODE=production`, which currently does not exist.

### 8.7 Iconography

- Lucide outline icons only. No filled, no two-tone.
- 24 dp icons inline with body, 32 dp icons for primary actions.
- Custom icon set used **only** for provenance pins (image / audio / text). These are simple geometric shapes (◐, ♪, ¶) to avoid accidentally importing a metaphor.

---

## 9. Microcopy library

The microcopy library is enforced. The build's lint step (see TECHNICAL_SPECIFICATION.md §15.3) fails if any string in the source matches a `BANNED_TERMS` regex.

### 9.1 Banned terms (never appear in UI strings)

- "fraud", "fraudulent", "fake"
- "match", "matched", "mismatch", "no match" (use "differ", "the same", "doesn't line up")
- "risk", "risk score", "score" (in any user-facing context referring to a person)
- "deny", "denied", "rejected", "approved", "accepted" (when referring to outcomes the system itself produced; quoting an external authority's letter is fine inside the Explainer's source pane)
- "confidence: NN%", "probability: NN%"
- "AI says…" (use "The system found…" or "The Analyst suggests…")

### 9.2 Preferred phrasings

| Don't say | Say |
|---|---|
| "Possible identity mismatch detected" | "Name on the document and name spoken differ" |
| "High-confidence translation" | "Translation reviewed by the Analyst model" |
| "Fraud check passed" | "No consistency notes were raised" |
| "Apply automated outcome" | "Send to a human caseworker" |
| "Verify identity" | "Note what the person has told you" |
| "Risk score: 0.7" | (Removed entirely. No score is ever shown.) |

### 9.3 Empty state copy

- Empty Ingest: "No artifacts yet. Take a photo, record a short clip, or paste a note to begin."
- Empty Synthesise: "Add an artifact first, then Synthesise."
- Empty Explainer: "Pick a document on the left to explain it in plain language."
- Empty Dignity Loop: "Synthesise first, then play the Dignity Loop in the person's language."

### 9.4 Error copy

- All error copy starts with what the user can do, not what the system can't do.
- Bad: "Model inference failed."
- Good: "The Analyst couldn't read this audio clip. Try a shorter recording, or type the words instead."

### 9.5 Destructive copy

- Wipe device: "This deletes every intake on this device. You can't undo it. Type the device ID (DEV-PI5-013) to confirm."
- Delete artifact: "Type DELETE to remove this artifact. The audit log will keep a record that you removed it."

### 9.6 Consent script (rendered at session start, printed and read aloud)

Template, localised at runtime:

> "I work for [organisation]. I will write down a few things you tell me, so that we can offer the right help. I'll use a small computer that runs only here in this room. It will not send your information anywhere. I'll read everything back to you at the end so you can correct it. If you don't want to answer a question, you can say so. Do you agree to continue?"

---

## 10. Accessibility (WCAG 2.1 AA, with humanitarian additions)

### 10.1 Hard requirements

- All text/background pairs ≥ 4.5:1. Large text (≥ 24 dp or ≥ 18 dp bold) ≥ 3:1.
- All actionable elements ≥ 44×44 dp tap target on Scout, ≥ 32×32 dp on Console.
- All non-text interactive content has a non-colour state indicator (border / icon / underline).
- Every form input has a `<label>`, not just a placeholder.
- Focus rings: 2 dp outline in `accent-teal-500`, never removed.
- All audio (Dignity Loop) is accompanied by the script as visible text.
- All images uploaded by caseworkers have an alt-text field that defaults to the caseworker's label.

### 10.2 Keyboard navigation

- Tab order follows the rail (1 → 6 → ⓘ → ⚙) then within-stage top-to-bottom.
- Provenance pins are reachable by keyboard (focusable, Enter opens the slide-over).
- Modal traps focus. Escape closes (unless the modal is the destructive Wipe confirmation).

### 10.3 Screen-reader behaviour

- Conflict Chips announce as: "Consistency note: [heading]. Two values: document side [value], audio side [value]. Two actions: Treat as same person, Flag for review."
- The provenance pin announces its modality before opening: "Image provenance for the field date-of-birth, button, opens detail."
- The SYNTHETIC watermark has `aria-hidden=true`. The top-bar SYNTHETIC badge announces "Synthetic demo data. This is not a real refugee record." once per session and is then suppressed.

### 10.4 Humanitarian-context additions (beyond WCAG)

- **Low-light mode**: the Console respects the OS dark-mode setting, and additionally has a "tent mode" (manual override) which lowers brightness and shifts colour temperature to warmer tones. Tent mode is reachable from the Admin screen.
- **Stress-resilient design**: primary actions are always the same colour and the same position across all six screens. No screen has more than one primary button.
- **Latency disclosure**: any operation expected to take >5 s shows a determinate progress indicator with an honest time estimate (read from the model's tokens-per-second meter). We do not pretend things are instant.
- **Audio descriptions**: when the Dignity Loop plays, a transcript of the audio rolls below the play button in real time, in both the spoken language and a back-translation. This is for caseworkers who are not native speakers of the playback language.

---

## 11. State, persistence, and offline behaviour

- Every screen autosaves on field blur and on rail transitions.
- Synthesise is the only non-idempotent client-side operation; the button shows a busy state and the entire screen is locked behind a translucent overlay until the Analyst returns. The overlay has a Cancel that aborts the model call (and logs the cancellation).
- If the Pi 5 server becomes unreachable mid-session (the caseworker moved out of LAN range), the Console shows a passive amber pill "OFFLINE — last sync HH:MM" and continues to function from the in-memory state. Commit is queued and replayed when the LAN comes back.
- The Scout app uses the same offline behaviour. Artifacts captured offline carry a clear "Not yet synced" tag on the Console.

---

## 12. Localisation rules

- All UI strings live in `app/static/locales/{en,fr,de,ar-TD,ar-SD}.json`. The build fails if a key is missing in any locale.
- Pluralisation uses ICU `MessageFormat`.
- Date formats: ISO-8601 internally; localised display (`fr-FR`, `de-DE`, `ar-TD`) on screen.
- Numbers: never localised in the structured-field area (so a date of birth is always `1996-07-10` even on an Arabic screen). Localised in surrounding prose.
- The language pill is always shown in the language's **native** script, never transliterated.

---

## 13. Hand-off bundle

For an engineer to implement this UI without ambiguity, they need:

- `tokens.json` — the design tokens (§8).
- `microcopy/{en,fr,de,ar-TD,ar-SD}.json` — every string, every state.
- `mocks/` — Figma-equivalent static screens for every screen in §3 and §4. (Hand-drawn ASCII wireframes in this file are the canonical layout reference until those mocks are produced; the engineer should treat the ASCII layout as binding for relative positions.)
- `prototypes/conflict-chip.html` — a single-file working prototype of the Conflict Chip with the two action paths wired to console.log.
- `prototypes/dignity-loop.html` — a single-file prototype of the Dignity Loop playback UI with a pre-recorded WAV.

These deliverables are listed in PROJECT_STRUCTURE.md and are part of the fast-lane build acceptance criteria.

---

## 14. What this spec deliberately does not cover

To keep the fast-lane build honest:

- **No marketing / landing page**: this product does not have a public-facing page.
- **No login / account screen**: device-bound. The caseworker is whoever is in front of the device.
- **No notifications / alerts panel**: alerts surface as Conflict Chips inside the active session. There is no global notification centre.
- **No "AI explainability dashboard"**: provenance pins are the entire explainability surface. We don't show attention maps or token-level scores — they create false reassurance.
- **No charts or analytics**: this is not a management dashboard. The Audit Log viewer is the only data table.
- **No multi-user collaboration**: two caseworkers on the same Pi 5 server can see the same session as read-only, but there is no real-time co-editing.

---

## 15. Open design questions (parked for v1.1)

1. **Refugee-facing kiosk mode** — a future possible screen where, after the Dignity Loop confirmation, the refugee can themselves correct fields via a much-simplified RTL/LTR kiosk UI. Out of scope for fast-lane.
2. **Family-grouping visualisation** — the dossier currently shows family composition as a list. A network-diagram view might help in complex blended-family cases. Out of scope until usability testing.
3. **Voice-driven Console** — voice control over the Console for caseworkers wearing gloves or working with shaky hands. Tied to a clean ASR path on the Pi 5; deferred until the llama.cpp audio path stabilises (see TECHNICAL_SPECIFICATION.md §16).
4. **In-Scout glossary edit** — currently glossary edits round-trip to the Console. Allowing the caseworker to edit on the phone may be a quality-of-life win, but increases sync complexity.

---

**End of UIUX_SPECIFICATION.md.** Companion files: `PRD_FINAL.md`, `TECHNICAL_SPECIFICATION.md`, `CONSTITUTION.md`, `microcopy/*.json`, `tokens.json`.
