# Globis Edge 2.0: 3-Minute Video Brief
## Narrative, Art Direction, and Judging Alignment

---

## The Story (3 Minutes)

### Opening (0:00–0:30) — The Problem
**Scenes 1–6**

A quiet moment at Adré, Chad. Hawa, a calm and capable caseworker in her mid-30s, stands behind a simple wooden desk scattered with papers, ID cards, and a small teal folder. A refugee mother and two children wait nearby—undocumented, exhausted, hopeful.

Hawa leans over two conflicting records. The child's birth year differs between documents. No audio testimony has been recorded. No photo ID exists. Hawa must decide: Is this the same child? What is her age? What are her rights?

This is where many systems fail. An automated system might deny assistance to the undocumented child. A human caseworker, under pressure, might miss the conflict altogether. But Hawa has help.

### Middle (0:30–2:30) — The Solution (Scenes 7–24)
Hawa places her hand near a small device on her desk. It glows softly with a teal light. The device is a **Pi 5**, about the size of a paperback book. No wires to the internet. No cloud. Just local, frontier intelligence.

**Multimodal Synthesis (Scenes 7–13)**
- Hawa takes a photo of the conflicting ID with a simple camera module on the device.
- The mother speaks a few words in her language, recorded via the device's microphone.
- The system synthesizes: text (the conflicting records) + image (the ID photo) + audio (the mother's voice).
- Using Gemma 4's multimodal capabilities, the device extracts the child's likely birth year, checks for consistency, and flags the conflict.

**Constitutional Audit (Scenes 14–19)**
- The system doesn't make a decision for Hawa. It asks her to decide.
- But first, it audits itself: "Is there any field that shouldn't be recorded? Any automated block I should apply?"
- The system finds that a sensitive field (ethnicity, political affiliation) is present in the intake form.
- It redacts the field and alerts Hawa: *"I've protected this data. You may proceed with confidence."*

**The Conversation (Scenes 20–24)**
- Hawa and the mother review the system's output together on a simple screen.
- No jargon. Just: "We have recorded that your daughter was born in [year]. Is this correct?"
- The mother nods. The child is safe, documented, protected from the very system that was meant to help her.
- Hawa confirms the intake. Papers click into place. Desk is ready for the next family.

### Closing (2:30–3:00) — Scale & Dignity (Scenes 25–30)
The camera pulls back. It's dusk in Adré. One caseworker at one desk. But in the mid-ground, other families are arriving, being processed, walking away with dignity restored.

Hawa's teal headscarf glows in the fading light. The device's teal indicator light pulses softly, ready for the next case. A new family approaches. The work continues.

The final frame: Hawa at the desk. The previous family walking away together, documented, safe. The horizon vast and patient. No sensationalism. Just dignity, every day, one case at a time.

---

## Art Direction & Visual Language

### Why This Aesthetic?
The video uses a **mid-century editorial illustration style**—warm, hand-painted, deeply textured. This is deliberate.

**Why NOT photorealism?**
- Photorealism can feel exploitative when depicting refugee families.
- It can inadvertently sensationalize suffering.
- It feels "corporate" or "startup-y"—wrong for humanitarian work.

**Why mid-century illustration?**
- It evokes **dignity and timelessness**. The scenes could be from any era, any frontier.
- **Warmth and humanity**: hand-painted illustration carries human touch, not algorithmic coldness.
- **Focus on structure, not sensation**: simplified shapes and bold colors let the *story* shine, not the visuals.
- **Aesthetic maturity**: judges will recognize this as intentional design, not a default.

### Color Palette (LOCKED)

| Element | Hex | RGB | Purpose |
|---------|-----|-----|---------|
| Sand/Base | #E8D7A0 | (232, 215, 160) | Warm, inviting desert floor |
| Parchment | #F5F1E8 | (245, 241, 232) | Papers, desk, forms |
| Rust Red | #A84C3C | (168, 76, 60) | Rocky ridges, earth tones |
| Terracotta | #C67C4A | (198, 124, 74) | Rock shadows, weathering |
| Turquoise Sky | #7FAFCA | (127, 175, 202) | Endless horizon, hope |
| Teal Accent | #4A8BA0 | (74, 139, 160) | Hawa's headscarf, device light, folder spine |
| Charcoal | #2C2C2C | (44, 44, 44) | Outlines, shadows |

### Rendering Technique
Every scene carries **visible grain and stipple texture** (like old printing or pastel paper). No smooth, computer-generated perfection. This texture reinforces:
- **Age and authenticity**: "This is real work, timeless and enduring."
- **Tactile humanity**: you can almost *feel* the heat, the sand, the worn desk.
- **Anti-AI aesthetic irony**: a tool powered by Gemma 4 rendered in a way that feels pre-digital, human-made, crafted.

### Character Design
**Hawa Ahmed** is the visual anchor for all 30 scenes.
- **Headscarf**: Teal, consistent fold and drape (even if partially visible, always recognizable)
- **Face**: Warm brown skin, calm expression, eyes that convey competence and kindness
- **Posture**: Always composed, hands decisive, never frantic
- **Clothing**: Warm sand and khaki tones; modest, practical, field-worn

By making Hawa **instantly recognizable**, judges subconsciously recognize her as the *decision-maker*, not the system. The device is her tool. She remains the agent.

### Continuity Across All 30 Scenes
Every scene picks up from the previous one:
- Hawa's headscarf angle, face, and body proportions never change.
- The desk, papers, and device are always in consistent positions (even if partially cropped).
- The sky and horizon lightness/color shift smoothly over 30 scenes (dusk progression).
- Camera moves are slow and simple: push-ins, lateral pans, pull-backs—never jarring cuts.
- Paper edges flutter in the breeze; fabric folds shift subtly; light and shadow change with the sun.

**Result**: watching all 30 scenes feels like watching one long, continuous moment—a 3-minute breath, not a 30-scene collage.

---

## Alignment with Judging Criteria

### Impact & Vision (40 points)
**Problem**: Undocumented refugee children with conflicting intake records. Caseworkers make life-altering decisions under pressure. Risks: automated denial, data exploitation, missed conflicts.

**Solution**: Offline, on-device multimodal tool (Gemma 4 E2B + E4B) that synthesizes text + image + audio, detects conflicts, and audits for harm.

**Outcome**:
- **Speed**: Fast intake processing (minutes instead of hours per family)
- **Safety**: Dual-pass auditor prevents automated harm
- **Dignity**: Refugees see their own data, understand the decision, maintain agency
- **Scale**: 1 Pi 5, 1 caseworker, many families per day. Realistic frontier deployment.

**Why judges care**: 
- This solves a *real* bottleneck (caseworker bandwidth) with *real* technology (Gemma 4 on edge).
- It respects refugee dignity; it's not exploitative.
- It's deployable, sustainable, and accountable.

### Video Pitch & Storytelling (30 points)
**Hook**: Cold open with undocumented child and conflicting records—emotional, immediate, human.

**Middle**: Show the tool working *silently*. Emphasize Hawa's expertise and the system's *support*, not automation. Show the dual-pass audit as a protective boundary.

**Climax**: Hawa and the mother review the output together. The child is documented, safe.

**Closing**: Family walks away with dignity. Next family arrives. Infinite hope, infinite need, infinite work.

**Visual language**: Every frame is intentional. No sensationalism. Warm mid-century illustration style signals "this was designed with care."

**Pacing**: Slow. 5-second scenes allow for contemplation. No quick cuts or hype. Judges will respect the maturity of the pacing.

**Why judges care**: 
- This is a *story*, not a tech demo. Judges remember stories. They share stories.
- The video is visually distinctive—it won't be forgotten among other submissions.
- Pacing + aesthetic + narrative = professional, thoughtful execution.

### Technical Depth (30 points)
**Gemma 4 Features**:
1. **Multimodal**: text (intake form) + image (ID photo via OCR) + audio (mother's voice via ASR)
2. **Native function calling**: conflict detection, field validation, redaction
3. **Tiered inference**: E2B (2B Scout) for fast pre-processing, E4B (4B Analyst) for synthesis
4. **Edge-ready**: runs on Pi 5, no cloud, fully offline
5. **Constitutional audit**: dual-pass system (rule-based + prompt-based) prevents automated harm

**Code evidence**:
- FastAPI backend in `src/globis_edge/`
- Modular architecture: `capabilities/`, `auditor/`, `models/`
- Integration tests, adversarial tests, unit tests
- Clear CLAUDE.md and INVARIANTS.md documenting design decisions

**Supporting notebook**:
- Live demos of multimodal synthesis (with synthetic data)
- Latency benchmarks (E2B vs E4B)
- Auditor pass-through and redaction examples
- Refugee View narrative loop
- Responsible AI & ethics section

**Why judges care**: 
- Video alone is not enough. Code must back it up.
- Judges want to see that Gemma 4's features are *actually used*, not faked.
- They want evidence of real engineering: architecture, tests, documentation.

---

## The Pi 5 as Silent Co-Star

The device appears in only 2–3 hero shots (Scenes 5, 6, 26), but it's always present in the background of the desk scenes. Why this restraint?

**The temptation**: "Show off the hardware! Camera module, microphone, compact form factor, hotspot connectivity!"

**The better choice**: The device is *unremarkable*. It's a tool, like a pen or a folder. Judges understand that frontier tools are simple, robust, and humble. Showing it too much makes it seem like the *protagonist*, when Hawa and the refugee family are.

**Hero shots of the Pi 5 do three things**:
1. **Scene 5–6**: Introduce it. Teal indicator light glows. "This is the tool."
2. **Scene 26**: Close-up on the device in late afternoon light. Emphasize durability and quiet power.
3. **(Implicit throughout)**: Visible on the desk, reminding judges that this is *edge intelligence*, not cloud automation.

**The story the device tells**:
- Compact, unobtrusive, always ready
- Simple indicator light (no screens, no AI hype)
- Works offline, reliably
- Enables human decision-making, doesn't replace it

---

## Narrative Arc (By the Numbers)

| Scenes | Duration | Focus | Mood |
|--------|----------|-------|------|
| 1–4 | 0:00–0:20 | Establish world, introduce Hawa | Calm, observational |
| 5–10 | 0:20–0:50 | Problem emerges (conflicting records) | Methodical, tense |
| 11–13 | 0:50–1:05 | System processes quietly | Contemplative |
| 14–19 | 1:05–1:45 | Constitutional audit, human decision | Protective, dignified |
| 20–24 | 1:45–2:00 | Conversation & resolution | Connected, warm |
| 25–27 | 2:00–2:35 | Scale & continuity (other cases, other caseworkers implied) | Sustainable, hopeful |
| 28–30 | 2:35–3:00 | Dusk, family walks away, next family arrives | Infinite hope, quiet power |

---

## Why This Approach Wins Judges

1. **Impact first**: Opens with a real problem, closes with a human solution.
2. **Storytelling over hype**: Slow, intentional pacing. No jump cuts or dramatic music.
3. **Visual distinctiveness**: Mid-century illustration style is unique and memorable.
4. **Humility in tech**: Device is small, quiet, supporting—not controlling.
5. **Responsible AI baked in**: Constitutional auditor, data redaction, and human oversight are visible in the narrative.
6. **Realistic deployment**: One caseworker, one device, many families. Not a fantasy scenario.
7. **Judges see themselves**: Legal/ethical reviewers recognize responsible AI. Engineers see solid architecture. Humanitarians see dignity. All three audiences are served.

---

## Next Steps

1. **Generate all 30 scenes** using the detailed prompts in GLOBIS_EDGE_VIDEO_PROMPT.md
2. **Assemble in DaVinci Resolve** (or Premiere) with 5-second duration per scene
3. **Add audio**: ambient wind, subtle SFX, optional minimal music, optional VO
4. **Export to YouTube** in high quality (1080p or 4K)
5. **Create supporting notebook** with live demos and technical explanation
6. **Submit to Kaggle** with GitHub link and clear documentation

**Estimated timeline**: 7–11 hours spread over 2–3 days

---

**Remember**: The video is 40% of your score. Make it exceptional.

