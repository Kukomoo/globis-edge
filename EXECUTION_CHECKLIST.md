# Globis Edge 2.0 Video Submission — Execution Checklist

**Project**: Kaggle Gemma 4 Good Hackathon  
**Submission Date Target**: May 20-22, 2026 (4-6 days from now)  
**Status**: 🎬 **1/3 COMPLETE — REMOTION READY**

---

## ✅ COMPLETED (Phase 0: Planning & Setup)

- [x] Strategic alignment (impact, storytelling, technical depth)
- [x] Visual direction locked (mid-century editorial illustration)
- [x] Color palette finalized (#E8D7A0, #A84C3C, #7FAFCA, #4A8BA0)
- [x] Character design (Hawa, caseworker, consistent across 30 scenes)
- [x] Narrative arc documented (Act 1: problem, Act 2: solution, Act 3: hope)
- [x] All 30 scene prompts generated & optimized for Meta AI
- [x] Chrome-based batch generation guide created (CHROME_BATCH_GENERATION_GUIDE.md)
- [x] Remotion project fully configured (globis-edge-video/)
- [x] React composition logic implemented (GlobisEdgeComposition.tsx)
- [x] npm scripts configured (start, render, build)
- [x] TypeScript configuration complete
- [x] Documentation complete (README.md, QUICKSTART.md)

---

## ⏳ IN PROGRESS (Phase 1: Scene Generation)

### Task: Generate Scenes 3-30 via Meta AI Chrome

**Status**: Ready to execute  
**Estimated Duration**: 1 hour (5-6 min per scene)  
**Reference**: `CHROME_BATCH_GENERATION_GUIDE.md`

**Subtasks**:

**Batch 1 (Scenes 3-10)** — Act 1 Continuation
- [ ] Scene 3: Set Up the Conversation
- [ ] Scene 4: Focus on Hawa
- [ ] Scene 5: Reveal the Device
- [ ] Scene 6: Hand and Device
- [ ] Scene 7: Device and Screen
- [ ] Scene 8: Conflicting Records
- [ ] Scene 9: Low-Angle Tension
- [ ] Scene 10: Human at the Center
- [ ] **Continuity check**: Hawa's scarf, desk, palette consistent ✓

**Batch 2 (Scenes 11-20)** — Act 2 Main
- [ ] Scene 11: Quiet Processing
- [ ] Scene 12: Catching an Issue
- [ ] Scene 13: Desk Settles
- [ ] Scene 14: Look Up to the Mother
- [ ] Scene 15: Conversation Across Desk
- [ ] Scene 16: New Intake Case
- [ ] Scene 17: Lean In on Sensitive Info
- [ ] Scene 18: Protective Stop
- [ ] Scene 19: Decision Handed Back
- [ ] Scene 20: Show the Whole Intake Area
- [ ] **Continuity check**: Tone shift from tension → calm ✓

**Batch 3 (Scenes 21-30)** — Act 3 Closing
- [ ] Scene 21: Papers Click Into Place
- [ ] Scene 22: Shared Understanding
- [ ] Scene 23: The Nod
- [ ] Scene 24: Final Confirmation
- [ ] Scene 25: Quiet, Working Desk
- [ ] Scene 26: Device Hero Shot
- [ ] Scene 27: Edge, Not Cloud
- [ ] Scene 28: Hawa at Dusk
- [ ] Scene 29: Final Group
- [ ] Scene 30: Closing Tableau
- [ ] **Final continuity check**: Sky darkening, stars, infinite hope ✓

**Save all 30 to**: `~/Documents/Claude/Projects/Globis\ Edge/VIDEO_ASSETS/scenes/Scene_[N]_[Title].png`

---

## ⏳ TODO (Phase 2: Image Placement & Preview)

**Estimated Duration**: 10 minutes

### Step 1: Copy Scene Images
```bash
cp ~/Documents/Claude/Projects/Globis\ Edge/VIDEO_ASSETS/scenes/Scene_*.png \
   ~/Documents/Claude/Projects/Globis\ Edge/globis-edge-video/public/scenes/
```

- [ ] All 30 PNGs copied to `globis-edge-video/public/scenes/`
- [ ] Verify count: `ls globis-edge-video/public/scenes/ | wc -l` = 30
- [ ] Verify naming: `Scene_01.png` through `Scene_30.png`

### Step 2: Preview Composition
```bash
cd ~/Documents/Claude/Projects/Globis\ Edge/globis-edge-video
npm start
```

- [ ] Open http://localhost:3000 in browser
- [ ] Play full 3-minute video
- [ ] Verify duration: **180 seconds (4320 frames at 24fps)**
- [ ] Verify transitions: **Smooth cross-fade between scenes**
- [ ] Verify continuity: **Hawa's scarf consistent, colors stable**
- [ ] Verify timing: **Each scene ~5 seconds**
- [ ] Press Ctrl+C to exit preview

---

## ⏳ TODO (Phase 3: Render to Video)

**Estimated Duration**: 30-60 minutes (depending on computer)

### Step 1: Render H.264 MP4
```bash
cd ~/Documents/Claude/Projects/Globis\ Edge/globis-edge-video
npm run render
```

- [ ] Rendering starts (watch terminal for progress)
- [ ] Encoding H.264 at 1920×1080, 24fps, CRF 18
- [ ] **Wait for completion** (~30-60 min)
- [ ] File created: `globis-edge-30-scenes.mp4` (~300-400 MB)

### Step 2: Verify Output
```bash
ls -lh ~/Documents/Claude/Projects/Globis\ Edge/globis-edge-video/globis-edge-30-scenes.mp4
ffprobe globis-edge-30-scenes.mp4  # if ffprobe installed
```

- [ ] File size: ~300-400 MB ✓
- [ ] Duration: 180 seconds (3 minutes) ✓
- [ ] Video codec: H.264 ✓
- [ ] Resolution: 1920×1080 ✓
- [ ] Frame rate: 24 fps ✓

---

## ⏳ TODO (Phase 4: Audio Integration)

**Estimated Duration**: 1-2 hours  
**Software**: DaVinci Resolve (free version)

### Step 1: Prepare Audio Assets

**Ambient desert wind**:
- [ ] Download 3-minute royalty-free ambient wind track (Freesound.org or Pixabay Music)
- [ ] Name: `ambient_desert_wind.wav`
- [ ] Duration: Full 180 seconds
- [ ] Format: WAV or MP3

**Sound effects** (optional but recommended):
- [ ] 2-3 paper rustle clips (1-2 sec each) — Zapsplat or Freesound
- [ ] Device beep/notification sound (1 sec) — Freesound
- [ ] Scatter throughout timeline

**Music** (optional):
- [ ] Light orchestral or ambient background music — Pixabay Music or YouTube Audio Library
- [ ] 180 seconds duration
- [ ] Name: `background_music.wav`

**Voice-over** (optional):
- [ ] Record 45-second intro/closing narration (or use Piper TTS)
- [ ] Name: `voiceover.wav`

### Step 2: Audio Assembly in DaVinci Resolve

1. **Open DaVinci Resolve**
   - [ ] Create new project (1920×1080, 24fps)
   - [ ] Import video: `globis-edge-30-scenes.mp4`

2. **Add Audio Tracks**
   - [ ] Track 1: Ambient wind (full 180 sec, -20dB)
   - [ ] Track 2: Paper rustles + beeps (scattered, -15dB)
   - [ ] Track 3: Background music (full 180 sec, -10dB) — optional
   - [ ] Track 4: Voice-over (-5dB) — optional

3. **Mix Levels**
   - [ ] Listen to full mix
   - [ ] Adjust individual track levels
   - [ ] Peaks should be at -3dB maximum (no clipping)
   - [ ] Balance: Ambient provides texture, SFX punctuates, music supports mood

4. **Export Final Video**
   - [ ] Format: H.264 MP4
   - [ ] Resolution: 1920×1080
   - [ ] Frame rate: 24fps
   - [ ] Video bitrate: 8-12 Mbps
   - [ ] Audio codec: AAC
   - [ ] Audio bitrate: 128 kbps
   - [ ] Output filename: `globis-edge-2.0-final.mp4`

- [ ] Final video exported: `globis-edge-2.0-final.mp4`
- [ ] File verified (correct duration, audio present)

---

## ⏳ TODO (Phase 5: YouTube Upload)

**Estimated Duration**: 15-20 minutes

### Step 1: Prepare Metadata

- [ ] **Title**: "Globis Edge 2.0: Offline AI for Refugee Protection at the Frontier"
- [ ] **Description** (write or use template):
  ```
  Globis Edge 2.0 is an offline, on-device multimodal AI system 
  for refugee protection at the humanitarian frontier.
  
  Problem: Undocumented arrivals with conflicting/missing records
  Solution: Gemma 4 synthesis of text + image + audio with constitutional audit
  Deployment: Raspberry Pi 5 edge device, zero cloud dependency
  
  Features:
  - Multimodal intake (ID photo + voice testimony + handwritten notes)
  - Cross-modal conflict detection & resolution
  - Dual-pass constitutional auditor (rule-based + prompt-based)
  - Dignity-preserving summary in refugee's language
  
  This is a working prototype using synthetic data. 
  Full implementation subject to UNHCR governance, DPIA, and partnerships.
  
  GitHub: [repository link]
  Kaggle: [notebook link]
  
  Tags: #Gemma4 #AIForGood #HumanitarianTech #ResponsibleAI #EdgeAI
  ```

- [ ] **Tags**: gemma, ai-for-good, humanitarian-tech, responsible-ai, edge-ai, refugee-protection, multimodal-ai
- [ ] **Thumbnail**: Design or screenshot showing Hawa + device (or use auto)

### Step 2: Upload to YouTube

1. Go to **youtube.com** → **Create** → **Upload video**
2. Select file: `globis-edge-2.0-final.mp4`
3. Fill in title, description, tags (from above)
4. **Visibility**: Unlisted (or Public if you're comfortable)
5. **Monetization**: None (disable ads)
6. Publish

- [ ] Video uploaded to YouTube
- [ ] Video title correct
- [ ] Description includes GitHub + Kaggle links
- [ ] Tags applied
- [ ] Visibility set correctly
- [ ] **Copy YouTube URL** (you'll need for Kaggle notebook)

**YouTube URL**: `https://youtu.be/[VIDEO_ID]`

---

## ⏳ TODO (Phase 6: Kaggle Notebook)

**Estimated Duration**: 1-2 hours

### Step 1: Create New Kaggle Notebook

1. Go to **kaggle.com** → **Code** → **New Notebook**
2. Title: "Globis Edge 2.0 - Offline AI for Refugee Intake"
3. Start writing sections (see below)

### Step 2: Write Notebook Sections

- [ ] **Section 1**: Title + Video Embed
  ```markdown
  # Globis Edge 2.0: Offline AI for Refugee Protection at the Frontier
  
  [Embed YouTube video here]
  
  **Author**: [Your name]  
  **Submission**: Kaggle Gemma 4 Good Hackathon  
  **Last Updated**: May 2026
  ```

- [ ] **Section 2**: Problem Statement (2-3 min read)
  - Undocumented refugee children with conflicting records
  - Caseworker bottleneck (40-50 minutes per intake)
  - Need: Fast, safe, transparent decision-support tool
  - Context: Adré, Chad; ~50 arrivals/day

- [ ] **Section 3**: Solution Overview (2-3 min read)
  - Gemma 4 multimodal synthesis (text + image OCR + audio ASR)
  - Constitutional audit (dual-pass: rule + prompt)
  - Pi 5 edge deployment (offline, zero cloud)
  - Refugee View dignity loop (auto-generated summary in refugee's language)

- [ ] **Section 4**: Architecture Diagram
  - Text or ASCII diagram showing: Intake → OCR/ASR → Synthesis → Audit → Summary
  - Show Gemma 4 as central component

- [ ] **Section 5**: Live Demo Scenario A (Synthetic)
  - Write code to show: conflicting birth year in ID vs. testimony
  - Model synthesizes conflict
  - Auditor flags & redacts sensitive field
  - Output: corrected, documented record

- [ ] **Section 6**: Live Demo Scenario B (Synthetic)
  - Write code to show: second family with ethnicity field (sensitive)
  - Auditor blocks collection
  - Output: safe, redacted dossier

- [ ] **Section 7**: Benchmarks (Latency, Throughput)
  - E2B (2B scout) vs. E4B (4B analyst) inference time
  - Throughput: ~25 cases/hour on Pi 5
  - Table: Scene # | Inference Time (E2B) | Inference Time (E4B)

- [ ] **Section 8**: Responsible AI & Safety
  - Synthetic data only (all personas fabricated)
  - Dual-pass auditor (fail-closed design)
  - No automated denial of assistance
  - Data minimization (only IER-required fields)
  - Human oversight (caseworker in loop)
  - Transparency (audit logs + reasoning trace)

- [ ] **Section 9**: Next Steps & Roadmap
  - DPIA & UNHCR governance alignment
  - Integration with PRIMES proGres v4
  - Multi-language support expansion
  - On-device TTS for literacy access
  - Evaluation on real cases (with consent)

- [ ] **Section 10**: Conclusion
  - Restate impact: faster intake, preserved dignity, offline deployment
  - Tie to Gemma 4: multimodal, function calling, edge-ready
  - Call to collaborate with UNHCR, humanitarian partners

### Step 3: Test All Code Cells

- [ ] All code cells execute without errors
- [ ] Output is visible and correct
- [ ] No hardcoded credentials or real data
- [ ] Synthetic data clearly labeled

### Step 4: Publish Notebook

- [ ] Notebook is **publicly readable**
- [ ] Copy Kaggle notebook URL: `https://www.kaggle.com/[username]/globis-edge-...`

---

## ⏳ TODO (Phase 7: Final Submission)

**Estimated Duration**: 15-20 minutes

### Step 1: Prepare GitHub Repository

- [ ] GitHub repository created (if not already done)
- [ ] Repository contains:
  - [ ] README.md (problem, solution, quickstart)
  - [ ] CLAUDE.md (project guidelines — already exists)
  - [ ] INVARIANTS.md (design constraints — already exists)
  - [ ] `src/` folder (Python backend code)
  - [ ] `tests/` folder (unit + integration tests)
  - [ ] No hardcoded credentials
  - [ ] No real personal data
  - [ ] `.gitignore` configured
- [ ] README includes links to:
  - [ ] YouTube video
  - [ ] Kaggle notebook
  - [ ] Live demo instructions

- [ ] GitHub URL: `https://github.com/[username]/globis-edge`

### Step 2: Submit to Kaggle

1. Go to **Kaggle competition page**: Gemma 4 Good Hackathon
2. Click **Submit**
3. Fill form:
   - [ ] **Project Title**: "Globis Edge 2.0: Offline AI for Refugee Intake"
   - [ ] **Video Link**: Paste YouTube URL (https://youtu.be/[VIDEO_ID])
   - [ ] **Kaggle Notebook**: Paste notebook URL (https://www.kaggle.com/...)
   - [ ] **GitHub Repository**: Paste repo URL (https://github.com/...)
   - [ ] **Description** (2-3 paragraphs):
     ```
     Globis Edge 2.0 is an offline multimodal AI system for refugee intake protection.
     
     Problem: Undocumented refugees with conflicting records face 40-50 minute intakes
     and risk of data loss. Current systems lack transparency and offline capability.
     
     Solution: We combine Gemma 4's multimodal strengths (text + image OCR + audio ASR)
     with dual-pass constitutional auditing to synthesize conflicting intake records safely.
     The system runs entirely on Raspberry Pi 5 at the frontier (zero cloud dependency).
     
     Technical depth: Real Gemma 4 integration (E2B/E4B tiered inference), cross-modal
     conflict resolution, rule-based + prompt-based dual-pass audit, purpose-limited
     data collection, and dignity-preserving refugee view (auto-generated summary in
     refugee's language).
     
     Impact: 25 cases/hour throughput (vs. 8-12 manual), offline deployment for frontier
     environments, transparent decision-support (audit logs + reasoning traces), and
     preserved dignity through informed consent and language access.
     ```

4. **Submit**

- [ ] Submission form completed
- [ ] **Confirmation received**
- [ ] Submission deadline: May 22, 2026 (5:00 PM UTC)

---

## Summary Statistics

| Phase | Duration | Status |
|-------|----------|--------|
| **0. Planning & Setup** | ~4 hours | ✅ COMPLETE |
| **1. Scene Generation** | ~1 hour | ⏳ IN PROGRESS |
| **2. Image Placement** | ~10 min | ⏳ TODO |
| **3. Render to Video** | ~45 min | ⏳ TODO |
| **4. Audio Integration** | ~1.5 hours | ⏳ TODO |
| **5. YouTube Upload** | ~20 min | ⏳ TODO |
| **6. Kaggle Notebook** | ~1.5 hours | ⏳ TODO |
| **7. Final Submission** | ~20 min | ⏳ TODO |
| **TOTAL** | **~8.5 hours** | **1/3 DONE** |

**Timeline**: Today (May 18) → May 20-22 (submission deadline)  
**Status**: On track for successful submission ✅

---

## Key Links

- **Kaggle Competition**: https://www.kaggle.com/competitions/gemma-4-good-hackathon
- **Local Guides**:
  - `CHROME_BATCH_GENERATION_GUIDE.md` — Scene generation
  - `globis-edge-video/QUICKSTART.md` — Remotion quick start
  - `globis-edge-video/README.md` — Full Remotion documentation
  - `REMOTION_EXECUTION_COMPLETE.md` — Setup summary

---

## Next Immediate Action

**Start Scene Generation NOW**:

1. Open `CHROME_BATCH_GENERATION_GUIDE.md`
2. Follow Batch 1 (Scenes 3-10) workflow
3. Generate all 30 scenes in Chrome (~1 hour)
4. Check off tasks above as you complete them
5. Proceed to image placement & preview

**You've got this. Let's finish the video.** 🎬

