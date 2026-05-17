# Hackathon Positioning Blueprint (PRD-Locked)

## Purpose

This document aligns repository communication with high-performing Gemma challenge submission patterns while staying fully inside the locked scope of [PRD.md](../../PRD.md).

It is a communication blueprint, not a feature roadmap.

## Benchmark Observations from Gemma Vision (Winner Reference)

Winner reference provided:
- [Gemma Vision write-up (Kaggle)](https://www.kaggle.com/competitions/google-gemma-3n-hackathon/writeups/gemma-vision)
- [Google winner announcement with Gemma Vision details](https://blog.google/innovation-and-ai/technology/developers-tools/developers-changing-lives-with-gemma-3n/)

Communication patterns that likely helped it:
- Clear lived-user grounding (the problem was tied to a real accessibility workflow constraint).
- A plain-language one-sentence problem/solution statement at the top.
- Immediate "why this matters" framing before technical depth.
- Practical edge interaction design details (how users trigger actions in real conditions).
- Explicit on-device execution story, not cloud-dependent framing.
- Demo/video-first orientation so judges can see the "hero moment" quickly.

## How Globis Edge Adapts These Patterns

Globis Edge keeps those communication strengths and maps them to our PRD-defined humanitarian intake scenario:

- Lead with one frontline moment:
  - First-contact registration where speed, trust, and language access decide outcome quality.
- Show the complete safety path:
  - ASR -> sanitiser -> translation triage -> OCR grounding -> constitutional auditor -> commit/quarantine.
- Keep a visible evidence spine:
  - PRD, invariants, implementation files, verification plan, and audit log are linked directly from README.
- Keep reproducibility explicit:
  - Test and benchmark entry points are documented, with hard SLA language.

## Judge-Ready Story Structure

Use this order consistently across README, Kaggle write-up, and demo script:

1. Human stakes and user persona (impact).
2. One-turn multimodal workflow (technical execution).
3. Guardrails and fail-closed behavior (responsible AI).
4. Edge performance and memory isolation evidence (feasibility).
5. Boundaries of what the system does not do (credibility).

## PRD Scope Lock (Do Not Drift)

All messaging must remain consistent with [PRD.md](../../PRD.md) and [INVARIANTS.md](../../INVARIANTS.md):

- Prototype decision-support only.
- Synthetic data only.
- No live PRIMES integration claims.
- No automated eligibility/credibility/fraud scoring.
- No substantive asylum interview participation.
- No internet-dependent runtime claims.

If a new communication idea conflicts with those constraints, PRD wins.
