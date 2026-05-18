# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

Globis Edge 2.0 is an offline, on-device humanitarian intake tool for refugee reception (prototype scenario: Adré, Chad). It consists of two independent parts that run concurrently in development:

- **`globis-edge-ui/`** — React 19 + Vite 8 + Tailwind v4 frontend (the caseworker 6-screen wizard)
- **`src/globis_edge/`** — Python 3.11 FastAPI backend (demo shim + real inference pipeline)

---

## Commands

### Frontend (globis-edge-ui/)

```bash
cd globis-edge-ui
npm install          # first time only
npm run dev          # dev server at localhost:5173
npm run build        # tsc -b && vite build
npm run lint         # eslint
npx tsc --noEmit     # type-check only (no emit)
```

### Backend

```bash
# Activate venv (located at src/venv)
source src/venv/bin/activate

# Run the demo API (required for UI to function)
cd src && uvicorn globis_edge.api.main:app --port 8080 --reload

# Run the real production routes (requires SQLCipher + GGUF model)
cd src && uvicorn globis_edge.api.routes:app --port 8080 --reload

# Tests
pytest tests/unit/          # unit tests
pytest tests/integration/   # integration tests
pytest tests/adversarial/   # adversarial/stress tests
pytest tests/               # all tests
```

---

## Architecture

### Frontend — 6-screen state machine

Navigation is **not** React Router — it's a `current_screen: 1|2|3|4|5|6` integer in a single `useReducer` context (`src/store/SessionContext.tsx`). `App.tsx` switches on this value to render the correct screen.

**Screen flow:** New Intake → Documents → Case Summary → Explanation → Confirm with Person → Save Record

**Session state** (`SessionState` in `SessionContext.tsx`) is the single source of truth for:
- `id`, `site`, `caseworker_languages`, `beneficiary_languages` — session identity
- `artifacts[]` — uploaded documents/audio/notes
- `dossier` — the synthesised Gemma output (set on Screen 3)
- `demo_loaded`, `demo_scenario` (`"A"|"B"|null`) — which synthetic scenario is active
- `ui_language` — drives Screen 5 TTS language

**Key actions:** `LOAD_DEMO`, `RESET_SESSION`, `SET_SCREEN`, `SET_DOSSIER`, `ADD_ARTIFACT`, `SET_LANGUAGE`

**Screens use `_Enhanced` suffix** — `Screen1_NewIntake_Enhanced.tsx`, `Topbar_Enhanced.tsx`, `MainLayout_Enhanced.tsx`. The non-`_Enhanced` originals (`Screen1_NewIntake.tsx`, `Topbar.tsx`, `MainLayout.tsx`, `Screen3_Synthesise.tsx`, `Screen4_Explainer.tsx`) are legacy scaffolding; they are **not imported** by `App.tsx` and can be ignored.

**API calls** are all in `src/services/api.ts` via axios to `localhost:8080`. The UI degrades gracefully if the backend is offline (demo scenarios load locally via `src/data/demoScenario.ts`).

### Frontend — Design system

- **Font:** Gantari (Google Fonts), loaded in `src/styles/globals.css`
- **Palette:** `#424242` charcoal (sidebar), `#D5DEE3` slate canvas (page bg), `#93B1C2` steel blue (accent/active), `#FFFFFF` white cards
- **Border token:** `rgba(147,177,194,0.35)` used throughout — do not substitute with Tailwind `border-slate-*` or `border-gray-*`
- **Text tokens:** `#1a2028` primary, `#3d4d58` secondary, `#6b7f8c` muted, `#9bafba` faint
- CSS variables are defined in `globals.css` and referenced via inline `style={}` props in layout components (Sidebar, Topbar) and via Tailwind arbitrary values (`text-[#1a2028]`) in screens

**Tailwind v4** is used via `@tailwindcss/vite` plugin — there is no `tailwind.config.js`. Arbitrary value syntax like `border-[rgba(147,177,194,0.35)]` is the correct pattern.

**Vite 6 / oxc parser** — JSX is strict. Unbalanced `<div>` tags cause hard build failures. Always balance divs before saving.

### Backend — Pipeline and module structure

Strict downward import dependency: `config → store → models → capabilities → api`

```
src/globis_edge/
  api/main.py         — Demo FastAPI shim (use for UI dev; no SQLCipher needed)
  api/routes.py       — Production routes (requires SQLCipher + GGUF)
  capabilities/
    coordinator.py    — Orchestrates the full multimodal turn
    dossier.py        — Dossier assembly and conflict resolution
    sanitiser.py      — Pure Python sanitisation boundary (re + structlog only)
    translation.py    — Translation wrapper
  auditor/
    constitution.py   — Dual-pass auditor entry point
    rules.py          — Rule Pass (field blocklist, hardened — see INVARIANTS.md)
    prompt.py         — Prompt Pass (Gemma 4 inference, fail-closed on error)
  models/
    gemma_wrapper.py  — Gemma 4 GGUF inference via llama-cpp-python
    scout.py          — E2B (2B) Scout model for fast pre-processing
    ocr.py            — Surya OCR wrapper
    audio.py          — ASR via whisper_wrapper
  store/
    sqlcipher.py      — Encrypted SQLite (sqlcipher3, never stdlib sqlite3)
    audit_log.py      — Value-masked audit logger (no value parameter by design)
    outbox.py         — Append-only commit outbox
```

**Hardened files** — do not weaken without explicit review: `store/outbox.py`, `auditor/rules.py`, `api/quarantine_badge.py`, `eval/runners/run_latency.py`

### Demo scenarios

Two synthetic scenarios in `globis-edge-ui/src/data/demoScenario.ts`:

- **Scenario A** (`DEMO_SCENARIO_A`) — Hawa Adam, Adré, Chad: cross-modal conflict on child birth year
- **Scenario B** (`DEMO_SCENARIO_B`) — Yusuf Ahmed Hassan, Eisenhüttenstadt: auditor block on ethnicity field

`DEMO_SCENARIO` (default export) is always Scenario A. The active scenario is tracked in `state.demo_scenario` so all screens can display the correct persona.

---

## Key Invariants

- **No `sqlite3` imports** in `src/` — use `sqlcipher3.dbapi2`
- **No `0.0.0.0` bind** — LAN / `192.168.0.0/16` only
- **Value-masked logs** — `AuditLogger.log()` has no `value` parameter; field names only, `value_logged` always `False`
- **Auditor order** — Rule Pass runs first; if blocked, Prompt Pass never runs
- **Prompt Pass failure** → always `BLOCK` (fail-closed)
- **Synthetic data only** in the demo shim — all personas are fabricated

See `INVARIANTS.md` for the full checklist.
