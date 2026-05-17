# Judge Fast Path (5-7 Minutes)

## Goal

Give judges a fast, evidence-backed walkthrough without requiring deep code exploration.

## Step 1: Problem and Scope (60-90s)

- Read [PRD.md](../../PRD.md): mission, user personas, and explicit out-of-scope boundaries.
- Confirm this is an offline edge-intake prototype, not an asylum decision engine.

## Step 2: Safety and Governance Locks (90s)

- Review [INVARIANTS.md](../../INVARIANTS.md).
- Verify core locks:
  - no `sqlite3` in `src/`
  - no `0.0.0.0` bind
  - names-only audit logging (`value_logged=False`)
  - rule-first constitutional audit order

## Step 3: End-to-End Pipeline (90s)

- Open [src/globis_edge/capabilities/coordinator.py](../../src/globis_edge/capabilities/coordinator.py).
- Trace one turn:
  - ASR
  - sanitisation
  - translation triage
  - OCR + grounding
  - constitutional audit
  - commit/quarantine routing

## Step 4: API Security Gate (60s)

- Open [src/globis_edge/api/routes.py](../../src/globis_edge/api/routes.py).
- Verify `/commit` is the sole egress path and requires:
  - `auditor_status == "clean"`
  - `dignity_confirmed == true`

## Step 5: Evidence of Verification (60-120s)

- Open [FINAL_AUDIT.md](../../FINAL_AUDIT.md) for sprint closeout records.
- Review [docs/blueprint/verification_plan.md](./verification_plan.md) for test intent mapping.
- Run latency benchmark if needed:
  - `python eval/runners/run_latency.py --mock`

## Optional Demo Sequence

If presenting live, show:
1. Safe commit path (`201`).
2. Blocked payload path (`403`) into quarantine.
3. Quarantine badge and summary endpoints exposing metadata only.
