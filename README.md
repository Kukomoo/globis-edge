# **Globis Edge: Offline Caseworker Companion**

> *117 million people are forcibly displaced. Globis-Edge catches what caseworkers miss—on a less than $320 Raspberry Pi. [8GB RAM + 500 GB external SSD]*

[![Watch the Story](https://img.shields.io/badge/▶️%20Watch-Story%20Demo-red?style=for-the-badge)](https://youtu.be/VtwEi7SoPxA?si=OP2ZIyxGgeaKFgUo)
[![Read the Writeup](https://img.shields.io/badge/📄%20Read-Full%20Submission-blue?style=for-the-badge)](https://github.com/Kukomoo/globis-edge/blob/main/KAGGLE_WRITEUP.md)
[![See the Code](https://img.shields.io/badge/💻%20Code-Kaggle%20Notebook-informational?style=for-the-badge)](https://www.kaggle.com/code/nadakhas/globis-edge)

---

## 🎯 The Problem

**1 in 70 people on Earth is forcibly displaced.**

At intake points like **Adré, Chad**, caseworkers process **40+ refugee cases daily** with:
- Paper forms & fragmented systems
- Audio testimony that doesn't match ID documents  
- Handwritten notes full of typos & conflicts
- **No internet. No time to verify. No way to catch the red flags.**

**Result:** Protection gaps. Duplicate records. Harm through mis-recorded family relationships.

---

## ⚡ The Solution

**Globis Edge captures everything at once:**

```
🎤 Audio Testimony  →  📸 ID Photos  →  🧑‍💻 Caseworker Notes
        ↓                  ↓                    ↓
                  Gemma 4 (Offline)
                        ↓
    "Birth year: 2016 in ID, 2017 in testimony"
                        ↓
         🚩 Flagged for caseworker review
```

**Five hero capabilities:**

| Feature | What It Does | Speed |
|---------|-------------|-------|
| **🎤 Multimodal Intake** | Captures audio, photos, text in one session | Real-time |
| **⚡ Tiered Intelligence** | E2B (2B) for fast tasks, E4B (4B) for synthesis | 800ms–2.3s |
| **🔄 Conflict Detection** | Flags name/age/origin mismatches across documents | ~1.2s |
| **✅ Constitutional Auditor** | Dual-pass safety check (rule-based + AI reasoning) | Fail-closed |
| **🤝 Dignity Loop** | Reads summary back to refugee in their language | Empathetic |

---

## 📊 Proof of Concept

**Real hardware. Real latency. Real safety.**

```
Hardware:         Raspberry Pi 5 (8GB RAM, $500, no GPU)
E2B Latency:      ~800ms (translation + OCR)
E4B Latency:      ~2.3s (multimodal synthesis)
Conflict Rate:    94% detection on intentional mismatches
Safety:           100% violations logged & redacted
Throughput:       1 intake per 4 seconds (40 cases/day in 3 min compute)
```

✅ **All verified in Jupyter notebook with synthetic scenarios**

---

## 🚀 Quick Start

### Watch First (3 min)
👉 **[Watch the Story](https://youtu.be/VtwEi7SoPxA?si=OP2ZIyxGgeaKFgUo)**

### Then Explore (Pick Your Path)

**For Judges (15 min path):**
1. **[Full Submission Writeup](https://github.com/Kukomoo/globis-edge/blob/main/KAGGLE_WRITEUP.md)** (1,498 words)  
   Problem framing, architecture, Gemma 4 justification, test scenarios

2. **[Kaggle Notebook](https://www.kaggle.com/code/nadakhas/globis-edge)** (Executable)  
   Run the synthetic intake scenarios yourself, see latency benchmarks

3. **[Landing Page](https://globis-egde.netlify.app)** (Visual overview)  
   Interactive walkthrough + My story + vision statement

**For Developers (Deep dive):**
- **[GitHub Repo](https://github.com/Kukomoo/globis-edge)** — Full codebase, all prompts, deployment configs
- **[PRD.md](https://github.com/Kukomoo/globis-edge/blob/main/PRD.md)** — Product requirements & scope
- **[ETHICS.md](https://github.com/Kukomoo/globis-edge/blob/main/ETHICS.md)** — Data protection & informed consent

**For Demo (1 min):**
- **[Live Demo: Phone Connection to Pi5](https://youtube.com/shorts/pHhzpePO5_0)**  
  Real hardware in action—intake wizard running on Raspberry Pi 5

---

## 🎬 Why Gemma 4?

✅ **Multimodal** — Handles audio + photos + text together (not just text)  
✅ **Fast** — 11–12 seconds end-to-end, real hardware, offline  
✅ **Responsible** — Native function calling for structured output + constitutional auditing  
✅ **Edge-ready** — Gemma 4 E2B/E4B designed for low-resource settings  

---

## 🛠 Architecture at a Glance

**Backend:** Python FastAPI + Gemma 4 (local via llama-cpp-python)  
**Frontend:** React 19 (6-screen intake wizard)  
**Database:** SQLCipher (encrypted, offline)  
**Deployment:** Raspberry Pi 5 (systemd auto-start, no cloud dependency)  

**Auditor Logic:**
- **Pass 1:** Hardened rule engine (no political affiliation, only IER-compliant fields)
- **Pass 2:** Gemma 4 reasoning check (fail-closed on error)
- **Result:** Value-masked logs, append-only quarantine, human-in-the-loop always

---

## ✨ What Makes This Different

| Traditional Intake | Globis Edge |
|-------------------|-------------|
| Manual cross-checking of documents | Automatic conflict detection |
| Caseworker writes everything down | Structured JSON output from AI |
| Paper forms get lost in the mail | Encrypted, offline database |
| No safety checks until later | Constitutional audit before recording |
| Refugee doesn't see what was written | Dignity loop: read-back in their language |

---

## 📈 Impact by the Numbers

- **117 million** displaced globally (target population)
- **40+ cases/day** per caseworker (current bottleneck)
- **94%** conflict detection rate (verified on synthetic data)
- **3 min compute** to process all daily intakes on one Pi 5
- **Less than $320 USD** total hardware cost (Raspberry Pi 5 + 500 GB external SSD, no GPU)
- **100%** offline operation (no cloud dependency)

---

## 🔒 Responsible AI & Ethics

✅ **No automated denial** — Every protection decision requires human review  
✅ **Minimum data principle** — Only intake-essential fields; no ethnicity/religion  
✅ **Informed consent** — Dignity loop summary read back in refugee's language  
✅ **Audit transparency** — All constitutional violations logged & visible  
✅ **Synthetic data only** — No real UNHCR/PRIMES data (prototype stage)  
✅ **Value-masked logs** — Field names logged, never values  
✅ **Fail-closed design** — Prompt Pass always blocks if inference fails  

See [ETHICS.md](https://github.com/Kukomoo/globis-edge/blob/main/ETHICS.md) & [INVARIANTS.md](https://github.com/Kukomoo/globis-edge/blob/main/INVARIANTS.md) for full details.

---

## 🎥 Video References

| Duration | Content | Link |
|----------|---------|------|
| **3 min** | Story demo: Problem + Refugee Camp Scenario + Hero features | [Watch](https://youtu.be/VtwEi7SoPxA?si=OP2ZIyxGgeaKFgUo) |
| **1 min** | Live demo: Phone connecting to real Pi 5 | [Watch](https://youtube.com/shorts/pHhzpePO5_0) |
| **5+ min** | Technical walkthrough (coming soon) | — |

---

## 📚 Documentation

- **[KAGGLE_WRITEUP.md](https://github.com/Kukomoo/globis-edge/blob/main/KAGGLE_WRITEUP.md)** (1,498 words) — Full technical submission  
- **[PRD.md](https://github.com/Kukomoo/globis-edge/blob/main/PRD.md)** — Product requirements & scope boundaries  
- **[ETHICS.md](https://github.com/Kukomoo/globis-edge/blob/main/ETHICS.md)** — Data protection & minimum-data principles  
- **[CONSTITUTION.md](https://github.com/Kukomoo/globis-edge/blob/main/CONSTITUTION.md)** — Auditor rule set  
- **[INVARIANTS.md](https://github.com/Kukomoo/globis-edge/blob/main/INVARIANTS.md)** — Security & governance rules  

---

## 🚀 Deploy on Raspberry Pi 5

**Quick start:**
```bash
git clone https://github.com/Kukomoo/globis-edge.git
cd globis-edge
source src/venv/bin/activate
pip install -r src/requirements.txt
uvicorn globis_edge.api.main:app --host 0.0.0.0 --port 8080
```

Full deployment guide in [deployment/](https://github.com/Kukomoo/globis-edge/tree/main/deployment).

---

## 🤝 Contributing

This is a prototype for the **Gemma 4 Good Hackathon**. Real deployment would require:
- UNHCR data protection impact assessment (DPIA)
- PRIMES/proGres v4 integration governance
- Biometric & identity verification frameworks
- Legal review per deployment country

The repo serves as a proof-of-concept and reference implementation for on-device humanitarian AI.

---

## 📄 License

Apache 2.0 — See [LICENSE](https://github.com/Kukomoo/globis-edge/blob/main/LICENSE) for details.

---

## 💬 Questions?

Email your questions to me or find me on LinkedIn. For technical deep-dives, file an issue on [GitHub](https://github.com/Kukomoo/globis-edge/issues).

**Let's build frontier intelligence that serves the people who need it most.**

— [Nada Khas](https://globis-egde.netlify.app)

---

**Kaggle Submission Status:** ✅ Submitted to Gemma 4 Good Hackathon (May 2026)
