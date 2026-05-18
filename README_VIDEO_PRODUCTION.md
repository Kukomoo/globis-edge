# Globis Edge 2.0 — Video Production Complete Briefing
## Your Roadmap to a Winning Kaggle Submission

---

## TL;DR

You're creating a **3-minute visual narrative** about a frontline caseworker named Hawa using an offline AI tool to protect undocumented refugee children in Adré, Chad. The video is your **40-point lead** in a 100-point competition.

**What you have now** (in this folder):
1. **GLOBIS_EDGE_VIDEO_PROMPT.md** — Full 30-scene breakdown with detailed keyframes, camera moves, and mood
2. **SCENE_GENERATION_QUICK_REF.md** — Copy-paste prompts for each scene (save hours of prompt engineering)
3. **VIDEO_BRIEF_FOR_JUDGES.md** — Narrative, art direction, and judging alignment strategy
4. **VIDEO_GENERATION_WORKFLOW.md** — Step-by-step guide to assembling the final video
5. **This file** — Executive summary and decision tree

**Timeline**: 7–11 hours over 2–3 days
- 2–3 hours: Generate 30 scenes (5 min/scene + iteration)
- 1–2 hours: Prepare audio (ambient, SFX, music, optional VO)
- 1–2 hours: Assemble in DaVinci Resolve or Adobe Premiere
- 0.5 hours: Upload to YouTube and Kaggle
- 2–3 hours: Write supporting notebook and README

**Your competitive advantage**:
- **Story-first approach** (not tech-first)
- **Distinctive visual language** (mid-century illustration, not photorealism or generic CG)
- **Slow, respectful pacing** (5-second scenes, not jump cuts)
- **Genuine Gemma 4 integration** (multimodal, function calling, edge deployment)
- **Responsible AI baked into the narrative** (constitutional audit, data redaction, human oversight)

---

## What the Judges Are Looking For

### Impact & Vision (40 pts) — The Human Story
**The problem**: Undocumented refugee children with conflicting intake records. Caseworkers make life-or-death decisions under pressure.

**Your solution**: 
- Offline, on-device multimodal tool (Gemma 4)
- Synthesizes text + image + audio
- Detects conflicts and audits for harm
- Supports (not replaces) human decision-making

**Why judges care**: This is a *real bottleneck* (caseworker bandwidth). It's *resolvable* (edge AI works). It's *humane* (respects refugee dignity).

### Video Pitch & Storytelling (30 pts) — The Execution
**Your approach**:
- **Hook**: Cold open with undocumented child and conflicting records
- **Middle**: Show the tool working silently, emphasize Hawa's agency
- **Climax**: Hawa and mother review output together; child is safe
- **Closing**: Family walks away documented. Next family arrives. Infinite hope.

**Why judges care**: This is memorable, emotionally resonant, visually distinctive. They'll remember your video over generic "AI solves problem" demos.

### Technical Depth (30 pts) — The Code
**What judges verify**:
- Gemma 4 features are *actually used* (multimodal, function calling, tiered inference)
- Code is real, functional, well-engineered (FastAPI, SQLCipher, tests)
- Safety is built-in (dual-pass auditor, data redaction)
- Deployment is realistic (Pi 5, offline, ~25 cases/hour throughput)

**Why judges care**: Video is not enough. Code must back it up. Judges will read your repository and notebook.

---

## The 30-Scene Breakdown (Visual Story)

### Act 1: Problem (Scenes 1–10, ~50 seconds)
- **Scene 1**: Wide intake area. Hawa at desk, refugee family waiting.
- **Scenes 2–4**: Close-up on desk. Conflicting records revealed (child birth year differs).
- **Scenes 5–6**: Device introduced. Teal indicator light glows. "This is the tool."
- **Scenes 7–10**: Device and screen visible. System begins processing. Tension builds.

**Mood**: Calm observation → methodical problem-solving → quiet anticipation

### Act 2: Solution (Scenes 11–24, ~70 seconds)
- **Scenes 11–13**: System processes quietly. Screen shows abstract motion (comparing modalities).
- **Scenes 14–19**: Constitutional Auditor at work. System flags sensitive fields and redacts them.
- **Scenes 20–24**: Hawa and mother review output together. Child is safe, documented, protected.

**Mood**: Contemplation → protective vigilance → human connection → completion

### Act 3: Scale & Hope (Scenes 25–30, ~30 seconds)
- **Scenes 25–27**: Pull back. Show the intake area. Multiple caseworkers, multiple families.
- **Scenes 28–30**: Dusk. Previous family walks away with dignity. Next family arrives. Work continues.

**Mood**: Sustainability → infinite hope → quiet power

---

## Visual Language (Why It Matters)

### Why Mid-Century Illustration?
You could shoot real footage (would be dramatic, but potentially exploitative of refugee families).
You could use 3D graphics (would feel corporate or dystopian).
You could use modern illustration (would feel trendy, date quickly).

Instead: **Hand-painted, mid-century editorial style**
- Warm, inviting, human
- Emphasizes *dignity* over *sensation*
- Timeless (not trendy)
- Signals intentional design to judges

### Color Palette (LOCKED)
Every scene uses the same colors:
- **Sand yellow** (#E8D7A0) — warmth, earth
- **Rust red** (#A84C3C) — ridges, endurance
- **Turquoise sky** (#7FAFCA) — hope, vastness
- **Teal accents** (#4A8BA0) — Hawa's headscarf, device light, folder spine (the tool is part of the landscape, not separate from it)

### Continuity = Credibility
Every scene picks up from the previous one. Hawa's headscarf angle never changes. Papers are in consistent positions. This seamlessness tells judges: *"This was designed with intention and care."*

---

## The Pi 5 as Silent Co-Star

**Temptation**: "Show off the hardware! Camera module, microphone, hotspot!"

**Better choice**: The device is *unremarkable*. It's a tool, like a pen.

**Screen time**:
- **Scenes 5–6**: Hero shots. Teal light glows. Device is introduced.
- **Scene 26**: Close-up. Device in afternoon light. Durability and quiet power.
- **Implicit throughout**: Visible on the desk, reminding judges this is *edge intelligence*.

**The story it tells**:
- Small and humble (not futuristic)
- Always ready (teal light steady)
- Offline and reliable (no cloud dependency)
- Enables human decision-making (not automated denial)

---

## Your Decision Tree

### Q: Should I generate all 30 scenes at once or in batches?
**A: Batches of 5–7 scenes.** Generate Scenes 1–5, review continuity, then move to 6–10. This prevents generating 20 scenes before realizing Hawa's headscarf changed in Scene 6.

### Q: What if a scene doesn't match the previous one?
**A: Regenerate.** Use the continuity checklist in SCENE_GENERATION_QUICK_REF.md. Reference the previous scene's final frame explicitly in your prompt.

### Q: Which tool should I use for image generation?
**A: Whatever you have access to.** Meta AI, Midjourney, DALL-E, Stable Diffusion all work. The prompts in GLOBIS_EDGE_VIDEO_PROMPT.md are detailed enough for any tool.

### Q: How long will each scene take?
**A: 3–5 minutes.** Generate → review → save. If it needs iteration, add 5–10 more minutes. Total: 2–3 hours for 30 scenes.

### Q: Should I add voice-over?
**A: Optional.** The visuals alone tell the story. If you add VO, keep it under 45 seconds (10 sec intro + 35 sec outro). Focus on "frontier dignity" and "local power," not technical jargon.

### Q: What audio should I use?
**A: Minimal.** Ambient desert wind (always present, ~-20 dB). Subtle SFX (paper rustles, device beep, ~-15 dB). Optional light music or ambient pad (~-10 dB). Silence in 1–2 key moments (Scenes 12, 18) to emphasize weight.

### Q: Should I aim for 1080p or 4K?
**A: 1080p is sufficient.** 4K is overkill for this budget and doesn't meaningfully improve judge perception. 1920×1080 at 24 fps looks professional and renders faster.

### Q: How do I ensure color consistency?
**A: Use a color picker in your image editor.** After generating each scene, sample the sand color, sky color, and teal accent. Compare against the hex values in this brief. If a color is off, regenerate with explicit hex codes in the prompt.

### Q: What if I can't generate all 30 scenes perfectly?
**A: You don't need perfect.** You need *consistent and intentional*. Judges value coherence over perfection. As long as Hawa's headscarf and the desk are recognizable across all 30 scenes, continuity is established.

### Q: How do I assemble the final video?
**A: Use DaVinci Resolve (free) or Adobe Premiere.** Timeline assembly is straightforward: drag Scene_01.png to timeline, set duration to 5 sec, repeat for all 30. Add audio tracks below. Export as H.264 MP4 at 1080p, 24 fps, 8 Mbps bitrate.

---

## File Organization (What to Create)

```
Globis Edge/
  📄 GLOBIS_EDGE_VIDEO_PROMPT.md (you have this)
  📄 SCENE_GENERATION_QUICK_REF.md (you have this)
  📄 VIDEO_BRIEF_FOR_JUDGES.md (you have this)
  📄 VIDEO_GENERATION_WORKFLOW.md (you have this)
  📁 VIDEO_ASSETS/
    📁 scenes/
      🖼️ Scene_01_Establish_the_World.png
      🖼️ Scene_02_Slide_Over_Records.png
      🖼️ Scene_03_Set_Up_the_Conversation.png
      ... (Scene_04 through Scene_30)
    📁 audio/
      🔊 ambient_desert_wind.wav (full 180 sec)
      🔊 paper_rustles_1.wav
      🔊 paper_rustles_2.wav
      🔊 device_beep.wav
      🔊 optional_music.wav
      🔊 optional_voiceover.wav
    📁 final_video/
      🎬 Globis_Edge_2.0_Demo.mp4 (1080p, ~300 MB)
      🎬 Globis_Edge_2.0_Demo.webm (optional backup)
  📄 VIDEO_THUMBNAIL.png (or .psd for Figma refinement)
  📄 KAGGLE_SUBMISSION_CHECKLIST.md (create this before uploading)
```

---

## The Submission Checklist

Before uploading to Kaggle:

### Video File
- [ ] Duration: exactly 3 minutes or under (180 sec max)
- [ ] Format: H.264 MP4
- [ ] Resolution: 1920×1080 or higher
- [ ] Frame rate: 24 fps or 30 fps
- [ ] Bitrate: 8–12 Mbps (video) + 128 kbps (audio)
- [ ] File size: <2 GB
- [ ] Plays smoothly in YouTube preview

### YouTube Upload
- [ ] Video posted to YouTube (unlisted or public)
- [ ] Title: "Globis Edge 2.0: Offline AI for Refugee Protection at the Frontier"
- [ ] Description: Clear problem statement, solution, and GitHub link
- [ ] Thumbnail: Custom, visually compelling (Hawa's teal scarf + device light)
- [ ] Accessibility: captions (auto-generated YouTube CC is sufficient)

### Kaggle Notebook
- [ ] Title: "Globis Edge 2.0: Multimodal Humanitarian Intake at the Edge"
- [ ] Video embedded or linked prominently at top
- [ ] Sections: Problem → Architecture → Demo Scenarios A & B → Benchmarks → Ethics → Next Steps
- [ ] Live code examples (synthetic scenarios, not real data)
- [ ] Outputs: JSON dossier, auditor reports, refugee view narratives
- [ ] Clear disclaimers: synthetic data, prototype, not production system

### GitHub Repository
- [ ] CLAUDE.md (project guidelines for Claude)
- [ ] INVARIANTS.md (key design constraints)
- [ ] README.md (overview, quick start, video link)
- [ ] `src/` directory with functional code
- [ ] `tests/` directory with unit, integration, adversarial tests
- [ ] `notebooks/` or `examples/` with demo scenarios
- [ ] No hardcoded API keys or credentials
- [ ] Clear installation instructions

### Responsible AI & Ethics
- [ ] README clearly states: synthetic data only
- [ ] No automated denial of assistance
- [ ] Data minimization principle stated
- [ ] Dual-pass audit explained
- [ ] Prototype disclaimer (not production system)
- [ ] UNHCR alignment noted (but not integration)
- [ ] PRIMES-like schema mentioned (but not actual PRIMES connection)

---

## Timeline & Milestones

### Day 1: Scene Generation (2–3 hours)
- [ ] Open image gen tool (Meta AI, Midjourney, etc.)
- [ ] Generate Scenes 1–5 (25 min)
- [ ] Review continuity (10 min)
- [ ] Generate Scenes 6–10 (25 min)
- [ ] Review continuity (10 min)
- [ ] Continue in batches through Scene 30
- [ ] By end of Day 1: all 30 scenes saved to `VIDEO_ASSETS/scenes/`

### Day 2: Audio & Assembly (2–3 hours)
- [ ] Gather/create audio assets (30 min)
  - Ambient wind (freesound.org)
  - SFX (paper rustles, device beep)
  - Optional music (royalty-free)
  - Optional VO (if desired)
- [ ] Open DaVinci Resolve (or Premiere) (5 min)
- [ ] Create new project: 1920×1080, 24 fps (5 min)
- [ ] Import all 30 scene images (5 min)
- [ ] Arrange on timeline: each scene 5 sec (15 min)
- [ ] Add audio tracks and align (30 min)
- [ ] Color grade and finalize (30 min)
- [ ] Export to H.264 MP4 (30 min)
- [ ] By end of Day 2: final video ready

### Day 3: Upload & Documentation (2–3 hours)
- [ ] Upload to YouTube (unlisted or public) (10 min)
- [ ] Create custom thumbnail (15 min)
- [ ] Write YouTube metadata (15 min)
- [ ] Create Kaggle notebook with video embedded (1 hour)
- [ ] Write README.md and supporting docs (45 min)
- [ ] Final review and submission checklist (15 min)
- [ ] Submit to Kaggle (5 min)

**Total**: 7–11 hours over 3 days

---

## Why This Approach Wins

1. **Impact first**: Judges see a human problem and a human solution.
2. **Storytelling over hype**: Slow, intentional pacing. No sensationalism.
3. **Visual distinctiveness**: Mid-century illustration stands out.
4. **Genuine tech**: Gemma 4 features are *actually used*, not faked.
5. **Responsible AI**: Safety and dignity are woven into the narrative, not added as afterthought.
6. **Realistic deployment**: One caseworker, one device, many families. Judges believe it.
7. **Judges see themselves**: Legal reviewers see responsible AI. Engineers see solid architecture. Humanitarians see dignity.

---

## Your Competitive Positioning

### You Are NOT Saying:
❌ "AI solves refugee crisis"
❌ "Fully autonomous system"
❌ "Cloud-based real-time processing"
❌ "Biometric identification"

### You ARE Saying:
✅ "Offline tool supports caseworker decision-making"
✅ "Multimodal synthesis detects conflicts"
✅ "Constitutional audit prevents automated harm"
✅ "Runs on Raspberry Pi 5 at the frontier"
✅ "Preserves refugee dignity through transparency"

**This positioning wins on authenticity.** Judges have seen a hundred "AI saves humanity" pitches. You're offering something rarer: *realistic, responsible, human-centered technology*.

---

## Next Step

1. **Review GLOBIS_EDGE_VIDEO_PROMPT.md** to understand the full 30-scene structure
2. **Open your image gen tool** (Meta AI, Midjourney, DALL-E, Stable Diffusion)
3. **Start generating Scenes 1–5** using the copy-paste prompts in SCENE_GENERATION_QUICK_REF.md
4. **Check continuity** against the checklist
5. **Continue in batches** until all 30 scenes are done
6. **Assemble in DaVinci Resolve** following VIDEO_GENERATION_WORKFLOW.md
7. **Upload to YouTube and Kaggle** following the submission checklist

---

## Final Note

**You have everything you need.** The prompts are detailed. The visual language is locked. The narrative is clear. The judging criteria are aligned. All that's left is execution.

The judges will remember your video. Make it exceptional.

---

**Let's go win this. 🎬**

