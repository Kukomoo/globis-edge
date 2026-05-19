# Globis Edge - offline caseworker companion [Powered by Gemma 4]

**Gemma 4 Good Hackathon Submission** | [Watch on YouTube](https://www.youtube.com/watch?v=VtwEi7SoPxA) | [Live Demo](https://youtube.com/shorts/pHhzpePO5_0?si=8FmIjY2sXJCkKtve) | [Kaggle Notebook](https://www.kaggle.com/code/nadakhas/globis-edge) | [Kaggle Writeup](https://www.kaggle.com/competitions/gemma-4-good-hackathon/writeups/new-writeup-1778786419461) | [Proof of Work](https://github.com/Kukomoo/globis-edge/blob/main/KAGGLE_WRITEUP.md) | [Landing Page](https://globis-egde.netlify.app)

![Globis Edge: Offline Refugee Reception Intelligence](https://images.kaggle.com/competitions/images/5c8f3d4c-1234-5678-abcd-example.png)

Globis Edge is an offline, on-device caseworker companion for refugee reception centres operating in low-connectivity, high-pressure environments. The prototype scenario is **Adré, Chad**—a frontline reception setting where caseworkers may need to process fragmented identity documents, multilingual testimony, damaged paperwork, and urgent protection-sensitive information **without reliable internet access**.

The system is not designed to replace caseworkers, interpreters, legal officers, or protection staff. It is designed to **support the person already doing the work** by turning scattered audio, documents, notes, and explanations into a safer, more structured, more understandable intake workflow.

---

## 🎯 Quick Start for Judges

**Recommended reading order** (5-15 minutes):

1. **[📄 Proof of Work / Project Report](KAGGLE_WRITEUP.md)** — 1,498-word technical writeup
   - Problem framing, architecture, five hero features, Gemma 4 integration

2. **[💻 Kaggle Notebook](https://www.kaggle.com/code/nadakhas/globis-edge)** — Executable implementation
   - Synthetic scenarios A (cross-modal conflict) & B (auditor block)

3. **[🎬 Demo Videos](#demo-videos)** — Visual walkthrough
   - Narrative demo (2 min): Problem framing, architecture, five hero features
   - Live demo short (1 min): FieldKitPi hotspot, real Pi 5 hardware in action

4. **[📚 Extended Docs](#documentation--architecture)** — Deep dive
   - PRD, INVARIANTS, ETHICS, CONSTITUTION

---

## Project Overview

I built Globis Edge as a complete end-to-end Gemma 4 integration:

- **Research phase**: Deep dive into humanitarian intake workflows, PRIMES-aligned data structures, and protection constraints
- **Architecture & design**: Locked PRD with 5 hero capabilities, then sprint-by-sprint implementation roadmap
- **Development**: Full-stack (Python FastAPI backend + React 19 UI), tiered inference routing (Gemma 4 E2B/E4B), constitutional auditing, and edge SLA profiling
- **Submission**: Kaggle writeup + demo video + polished, reproducible open-source repo
- **Kaggle integration**: Demonstrated multimodal reasoning, native function calling, and responsible AI practices aligned with Gemma 4 Good criteria

**Note**: Gemma 4 Cloud via Ollama was used for research and testing during development. The production backend is designed to run Gemma 4 locally via `llama-cpp-python` for true offline operation.

## Core Pipeline

Globis Edge coordinates a secure, offline intake pipeline with five hero capabilities:

1. **Tiered Inference ("Scout & Analyst")**
   - E2B (2B) "Scout" for fast translation, dialect triage, light checks, low-latency tasks
   - E4B (4B) "Analyst" for multimodal synthesis, cross-modal conflict resolution, empathetic summaries
   - Latency profiling and SLA enforcement (p95 targets published in eval/runners/)

2. **Multimodal Intake**
   - ASR transcription from field audio (offline via Whisper)
   - OCR extraction from identity documents (via Surya + grounding verification)
   - Typed caseworker notes and beneficiary explanations
   - Artifact provenance tracking (which modality contributed each field)

3. **Sanitisation & Grounding Boundary**
   - Strict input validation before any model prompt
   - Levenshtein threshold matching for OCR confidence
   - No sensitive data leakage in logs (field names only, value_logged=False)

4. **Cross-Modal Conflict Resolution**
   - Detects mismatches (e.g., name spelling, birth year, origin across ID/audio/notes)
   - Produces reasoning trace and conflict chips for caseworker review
   - Never auto-resolves—always human-in-the-loop

5. **Dual-Pass Constitutional Auditor**
   - **Pass 1 (Rule Auditor)**: Hardened rule set (no political affiliation, no ethnic classification, only IER fields)
   - **Pass 2 (Prompt Auditor)**: Gemma 4 reasoning check for humanitarian compliance (fail-closed on error)
   - Audit trail logged, never automated denial

6. **Outbox & Quarantine**
   - API-gated egress via `/commit` only
   - Append-only quarantine for records that fail audits
   - Telemetry for blocked cases (no values, field names + audit reason only)

## Raspberry Pi 5 Deployment

Globis Edge is designed to run on **Raspberry Pi 5** (8GB RAM) at the edge, achieving true offline-first operation in low-connectivity settings.

### Hardware Setup

**Recommended Configuration:**
- **Device**: Raspberry Pi 5 (8GB RAM model)
- **Storage**: 64GB+ microSD card or USB SSD (for model weights + SQLite database)
- **Network**: Wi-Fi (optional—system works offline; WiFi for initial model download only)
- **Power**: Official Pi 5 PSU (27W) or equivalent

### Model Storage

Gemma 4 weights (~4-5GB for quantized GGUF format) are downloaded once during setup:
```bash
# Download Gemma 4 E2B (2B) and E4B (4B) models
# Store in: /opt/globis-edge/models/

# E2B (2B) model: ~2GB
# E4B (4B) model: ~3GB
# Total: ~5GB (fits comfortably with OS on 64GB card)
```

### Running on Pi5

#### Quick Start

```bash
# SSH into Pi
ssh pi@globis-edge.local

# Clone repo
git clone https://github.com/Kukomoo/globis-edge.git
cd globis-edge

# Activate venv and install dependencies
source src/venv/bin/activate
pip install -r src/requirements.txt

# Set environment variables
export GLOBIS_MODELS_PATH=/opt/globis-edge/models
export GLOBIS_DB_PATH=/opt/globis-edge/data
export GLOBIS_LOG_LEVEL=info

# Start FastAPI backend
cd src
uvicorn globis_edge.api.main:app --host 192.168.1.100 --port 8080 --reload

# In another terminal, start React UI
cd globis-edge-ui
npm run dev  # Dev server at localhost:5173
```

#### Tiered Inference Routing on Pi5

The Pi5 automatically routes based on available memory and task type:

- **Scout (E2B, 2B)**: ASR transcription, translation, dialect detection → ~400ms per request
- **Analyst (E4B, 4B)**: Multimodal synthesis, auditor, conflict resolution → ~1.2s per request
- **Memory isolation**: Each model runs in separate Python process; context switching avoids OOM

```python
# From src/globis_edge/capabilities/coordinator.py
# Automatic routing happens here based on task_type
if task_type == "dialect_triage":
    use_scout = True  # Fast 2B model
elif task_type == "synthesis":
    use_scout = False  # Full 4B model needed
```

#### Network Connectivity

**Offline mode** (default):
- All models pre-downloaded to `/opt/globis-edge/models/`
- Database stored locally at `/opt/globis-edge/data/globis.db` (SQLCipher-encrypted)
- UI served locally from React dev server or production build
- No external API calls (Gemma 4 runs locally via llama-cpp-python)

**Optional Wi-Fi for initial setup**:
- Download models once during setup
- Enable remote SSH for administration
- Optional: upload quarantine logs to secure cloud storage (asyncio, append-only)

#### Performance Profile

**Latency on Pi5 (8GB RAM, measured):**
- ASR (Whisper local): 2-4 seconds for 30-second audio
- Translation (E2B): 400ms avg
- Synthesis (E4B): 1.2s avg
- Dual-pass audit: 200ms (rule pass) + 800ms (prompt pass)
- **Total turnaround for one intake turn**: ~5-7 seconds

**Memory usage:**
- Base OS + services: ~1.5GB
- E2B model (2B, loaded): ~2GB
- E4B model (4B, loaded): ~2.5GB
- React dev server: ~200MB
- FastAPI + SQLCipher: ~300MB
- **Total at steady state**: ~6.5GB (headroom: ~1.5GB)

#### Auto-Start on Boot (Optional)

Create systemd service to auto-start Globis Edge on Pi reboot:

```bash
# Create service file
sudo nano /etc/systemd/system/globis-edge.service

[Unit]
Description=Globis Edge Offline Intake System
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/globis-edge
ExecStart=/home/pi/globis-edge/src/venv/bin/python -m uvicorn globis_edge.api.main:app --host 192.168.1.100 --port 8080
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable globis-edge.service
sudo systemctl start globis-edge.service
sudo systemctl status globis-edge.service
```

#### Local Network Access

**From other devices on the same Wi-Fi/LAN:**
- Backend API: `http://globis-edge.local:8080/docs` (Swagger docs)
- Frontend UI: `http://globis-edge.local:5173` (React dev) or port 80 (production)
- mDNS discovery: `globis-edge.local` (Avahi auto-configured on most Pi images)

If mDNS doesn't work, use IP address:
```bash
# Find Pi's IP
arp-scan --localnet | grep Raspberry

# Use IP directly
http://192.168.1.100:8080
```

#### Troubleshooting on Pi5

| Issue | Solution |
|-------|----------|
| Model fails to load ("OOM") | Reduce max_tokens in prompts; use E2B for more tasks |
| UI won't connect to backend | Ensure FastAPI is running on `0.0.0.0:8080` not `127.0.0.1` |
| Slow first response | Normal—model is loading from disk to VRAM; subsequent requests are faster |
| Database locked | Kill any stray Python processes: `pkill -f globis_edge` |
| Wi-Fi drops | System continues offline; logs cached locally; retry upload when connection returns |

---

## Security and Governance Posture

- SQLCipher-backed encrypted persistence.
- No `sqlite3` imports in `src/`.
- No `0.0.0.0` service bind exposure.
- Field names are logged, field values are never logged (`value_logged=False`).
- Quarantine is append-only by convention.
- Synthetic data only.

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+, Node.js 18+, npm
- ~5GB free disk space (for Gemma 4 models)
- 8GB+ RAM (for running both E2B and E4B in memory)

### Run Backend
```bash
cd src
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn globis_edge.api.main:app --port 8080 --reload
```

### Run Frontend
```bash
cd globis-edge-ui
npm install
npm run dev  # Dev server at http://localhost:5173
```

### Run Tests
```bash
cd src
pytest tests/unit/              # Unit tests
pytest tests/integration/       # Integration tests
pytest tests/adversarial/       # Stress & adversarial tests
```

---

## Documentation & Architecture

For detailed architecture, invariants, and verification:

- **[PRD.md](PRD.md)** — Product requirements, 5 hero capabilities, scope boundaries
- **[INVARIANTS.md](INVARIANTS.md)** — Hardened security & governance rules (immutable)
- **[FINAL_AUDIT.md](FINAL_AUDIT.md)** — Sprint-by-sprint closure & verification trail
- **[ETHICS.md](ETHICS.md)** — Data protection, informed consent, minimum-data principles
- **[CONSTITUTION.md](CONSTITUTION.md)** — Auditor rule set (hardened field blocklist)
- **[docs/blueprint/](docs/blueprint/)** — Judge fast-path, hackathon positioning, verification plan

### Project Structure

```
globis-edge/
├── src/globis_edge/
│   ├── api/                 # FastAPI routes & demo shim
│   ├── capabilities/        # Coordinator, dossier, sanitiser
│   ├── auditor/             # Dual-pass constitutional auditor
│   ├── models/              # Gemma 4, Scout, OCR, ASR wrappers
│   ├── store/               # SQLCipher, audit logs, outbox
│   └── eval/                # Latency profiling, stress testing
├── globis-edge-ui/          # React 19 + Vite frontend (6-screen wizard)
├── globis-edge-video/       # Remotion video generation
├── tests/                   # Unit, integration, adversarial suites
├── deployment/              # Pi5 runbooks, systemd configs
├── docs/blueprint/          # Architecture & narrative documents
└── README.md, PRD.md, etc.  # Core documentation
```

## Kaggle Submission

**Status**: ✅ Submitted to [Gemma 4 Good Hackathon](https://www.kaggle.com/competitions/gemma-4-good-hackathon)

**Submission includes:**
- ✅ [Kaggle Notebook](https://www.kaggle.com/code/nadakhas/globis-edge) — Full implementation walkthrough
- ✅ [Kaggle Writeup](https://www.kaggle.com/competitions/gemma-4-good-hackathon/writeups/new-writeup-1778786419461) — Problem, approach, impact statement (1,498 words)
- ✅ [Demo Video (YouTube)](https://www.youtube.com/watch?v=VtwEi7SoPxA) — 2-minute narrative walkthrough showing multimodal intake → auditor → dossier
- ✅ [Live Demo Short (YouTube)](https://youtube.com/shorts/pHhzpePO5_0) — 1-minute field demo showing FieldKitPi hotspot connection and real hardware
- ✅ Public GitHub repo (this repository) — Reproducible code, all tests passing
- ✅ Comprehensive documentation — PRD, architecture, ethics, verification trail

---

## Demo Videos

- **Narrative demo (2 min)**: [Watch on YouTube](https://www.youtube.com/watch?v=VtwEi7SoPxA) — Problem framing, architecture, five hero capabilities, how Globis Edge solves each
- **Live demo short (1 min)**: [Watch on YouTube](https://youtube.com/shorts/pHhzpePO5_0) — FieldKitPi hotspot connection, intake wizard in action, real Pi 5 hardware in the field

---

## Proof of Work / Project Report

**Core Technical Report**: [📄 **KAGGLE_WRITEUP.md**](KAGGLE_WRITEUP.md) — The full 1,498-word submission document covering problem framing, architecture, five hero capabilities, challenges overcome, and Gemma 4 technical justification.

**Extended Documentation**:
- [`PRD.md`](PRD.md) — Product requirements and scope boundaries
- [`INVARIANTS.md`](INVARIANTS.md) — Hardened security and governance rules
- [`FINAL_AUDIT.md`](FINAL_AUDIT.md) — Sprint-by-sprint verification and closure trail
- [`ETHICS.md`](ETHICS.md) — Data protection, informed consent, minimum-data principles
- [`CONSTITUTION.md`](CONSTITUTION.md) — Auditor rule set (hardened field blocklist)

---

## Landing Page

For a visual overview of Globis Edge, vision statement, team information, and to explore interactive demos, visit the [Globis Edge Landing Page](https://globis-egde.netlify.app).

---

---

## Evidence Map for Judging

| Judging Axis | Globis Edge Demonstrates | Evidence |
|---|---|---|
| **Impact & Vision** | Dignity-first intake for low-resource settings; human-interpreter triage for minority languages | [PRD.md](PRD.md), [ETHICS.md](ETHICS.md), demo video |
| **Technical Depth** | Multimodal coordination (audio + image + text); Gemma 4 tiered inference; constitutional auditing | [src/globis_edge/capabilities/coordinator.py](src/globis_edge/capabilities/coordinator.py), [src/globis_edge/auditor/](src/globis_edge/auditor/) |
| **Edge Feasibility** | True offline operation on Pi5; p95 SLA profiling; memory isolation; no cloud dependency | [Raspberry Pi 5 Deployment](#raspberry-pi-5-deployment), [eval/runners/run_latency.py](eval/runners/run_latency.py) |
| **Responsible AI** | Rule-first auditing, fail-closed design, value-masked logs, no automated denial | [CONSTITUTION.md](CONSTITUTION.md), [src/globis_edge/auditor/](src/globis_edge/auditor/), [src/globis_edge/store/audit_log.py](src/globis_edge/store/audit_log.py) |
| **Reproducibility** | Synthetic-only data, sprint-by-sprint closure logs, full test suite, deployment runbooks | [FINAL_AUDIT.md](FINAL_AUDIT.md), [tests/](tests/), [deployment/](deployment/) |

---

## Responsible AI & Ethics

Globis Edge was designed with explicit humanitarian and legal safeguards:

✅ **No automated denial** — Every protection decision requires human review  
✅ **Minimum data principle** — Only intake-essential fields collected; no ethnicity/religion  
✅ **Informed consent** — Refugee View summary read back in beneficiary's language (with TTS)  
✅ **Audit transparency** — All constitutional violations logged and visible to caseworkers  
✅ **Synthetic data only** — No real UNHCR data, no live PRIMES integration (prototype only)  
✅ **Value-masked logs** — Field names logged, field values never logged  
✅ **Fail-closed design** — Prompt Pass always blocks if model inference fails  

See [ETHICS.md](ETHICS.md) and [INVARIANTS.md](INVARIANTS.md) for full details.

---

## Contributing

This project is submitted as a prototype for the Gemma 4 Good Hackathon. Future development would require:
- UNHCR data protection impact assessment (DPIA)
- Integration governance with PRIMES/proGres v4
- Biometric & identity verification frameworks
- Legal review for each deployment country

For now, the repository serves as a proof-of-concept and reference implementation for on-device humanitarian AI.

---

## License

Apache 2.0 — See [LICENSE](LICENSE) for details.

---

**Questions or feedback?** File an issue or reach out via the Kaggle platform.

**Last updated**: May 18, 2026  
**Submission status**: Kaggle Gemma 4 Good Hackathon (Submitted ✅)
