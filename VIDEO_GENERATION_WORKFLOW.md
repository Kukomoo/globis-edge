# Globis Edge 2.0 Video Generation Workflow
## Step-by-Step Guide to Creating the 3-Minute Visual Sequence

---

## Phase 1: Set Up Your Tools

### Option A: Use Meta AI Directly (Recommended)
1. **Open a web browser** (Chrome, Safari, Firefox, Edge)
2. **Go to meta.ai** (https://www.meta.ai/)
3. **Sign in** with your Meta account (or create one)
4. **Click the image generation button** (usually labeled "Create Image" or similar)
5. **Paste the scene prompt** (from GLOBIS_EDGE_VIDEO_PROMPT.md)
6. **Generate and save** each image

### Option B: Use Claude's Built-in Image Generation
If Claude has access to image generation:
1. **Share the scene prompt** with Claude
2. **Request the image** with the style specifications
3. **Save locally**

### Option C: Use Midjourney, DALL-E, or Stable Diffusion
All of these tools support detailed prompts. The prompts in GLOBIS_EDGE_VIDEO_PROMPT.md are detailed enough to work with any major image generation tool.

---

## Phase 2: Generate 30 Scenes

### Batch Generation Strategy
**Total time estimate**: 2–3 hours (30 scenes × 5 minutes per scene = 150 minutes, plus iteration)

**Per scene, you will**:
1. Copy the scene keyframe and camera move from GLOBIS_EDGE_VIDEO_PROMPT.md
2. Fill in the Meta AI (or your chosen tool's) prompt template:
   ```
   [SCENE N] Globis Edge 2.0 Video — [Scene Title]
   
   Mid-century editorial illustration style, handpainted desert intake scene.
   Warm ochre sand, rust-red ridges, dusty turquoise sky, teal accents.
   Visible grain, stippled texture, soft color blocks, delicate ink outlines.
   
   KEYFRAME: [Scene description]
   
   CHARACTERS:
   - Hawa: calm caseworker, teal headscarf, warm sand-tone clothing
   - [Others as applicable]
   
   PROPS:
   - Wooden desk with scattered papers, teal folder, ID cards
   - Pi 5 device (sand tone, teal indicator light)
   - Simple screen (abstract teal/sand rectangles, no text)
   
   CAMERA: [Camera move from GLOBIS_EDGE_VIDEO_PROMPT.md]
   
   STYLE: Match Scene [N-1] exactly. Same characters, props, palette, lighting. Smooth visual continuity.
   ```
3. **Generate** the image
4. **Review for continuity**:
   - Does Hawa's headscarf match the previous scene?
   - Are props in the same relative positions?
   - Is the color palette consistent?
   - Is the grain/texture visible?
5. **Iterate** if needed (regenerate if Hawa's face or scarf changed)
6. **Save** as `Scene_[N]_[Title].png` in a dedicated folder

### Folder Structure
Create this structure in your Globis Edge project:
```
Globis Edge/
  VIDEO_ASSETS/
    scenes/
      Scene_01_Establish_the_World.png
      Scene_02_Slide_Over_Records.png
      Scene_03_Set_Up_the_Conversation.png
      ... (30 total)
    audio/
      ambient_desert_wind.wav
      paper_rustles.wav
      device_beep.wav
    final_video/
      Globis_Edge_2.0_Demo.mp4
      Globis_Edge_2.0_Demo.webm
```

### Continuity Checklist
For each scene pair (N-1 → N), verify:
- [ ] Hawa's face, expression, headscarf angle identical
- [ ] Desk position and papers arrangement match
- [ ] Device and teal folder placement consistent
- [ ] Family members (mother, children) in same relative positions
- [ ] Sky color and lighting direction smooth transition
- [ ] Grain/stipple texture present
- [ ] No new props or visual elements
- [ ] Camera move is smooth (no jump cuts or teleports)

---

## Phase 3: Prepare Audio

### Ambient Tracks
1. **Desert wind**: Subtle, continuous, ~-20 dB
   - Download from: freesound.org, zapsplat.com, or generate with Foley tools
   - Duration: Full 3 minutes (180 seconds)
   - Loop smoothly

2. **Paper rustles**: Soft, occasional, ~-15 dB
   - ~10–15 instances throughout the 180 seconds
   - Placement: Scenes 2, 5, 7, 9, 10, 14, 15, 21, 25, 27
   - Duration: 0.5–1 second each

3. **Device beep/pulse**: Soft tone, ~-15 dB
   - ~5–6 instances (Scenes 5, 6, 11, 13, 18, 26)
   - Duration: 0.3 seconds each
   - Tone: Warm, subtle, not jarring (think soft bell, not alarm)

4. **Optional music**: Minimal orchestral or ambient
   - Warm, sustained strings or ambient pad
   - ~-10 dB during visual-heavy scenes
   - Consider compositions by Max Richter, Ólafur Arnalds, or Tycho for reference
   - Duration: 2–3 minutes

5. **Optional voice-over** (30–45 seconds total):
   - Intro (10 seconds): "In Adré, Chad, a new caseworker tool is changing how families are protected..."
   - Outro (20–35 seconds): Closing statement about dignity, edge computing, and frontier intelligence

### Audio Editing Software
- **Free**: Audacity (audacity.com)
- **Paid**: Adobe Audition, Logic Pro, Reaper
- **Online**: BeatBox.me, AudioMass, or Waveform

---

## Phase 4: Assemble Video in DaVinci Resolve or Adobe Premiere

### DaVinci Resolve (Free Version, Recommended)
1. **Download & install**: davinciresolve.com
2. **Create new project**: 1920×1080, 24 fps (or 30 fps)
3. **Import media**:
   - Media Pool → Add Clips → Select all Scene_*.png files
   - Add audio tracks (ambient, SFX, music, VO)
4. **Edit** (Cut page):
   - Drag Scene_01 to timeline, set duration to 5 seconds
   - Drag Scene_02, set duration to 5 seconds
   - Repeat for all 30 scenes (30 × 5 = 150 seconds)
   - Drop audio tracks below video track
   - Align audio cues to specific scenes
5. **Color & adjust** (Color page):
   - If needed, add slight vignette or grain to unify scenes
   - Ensure color grading is consistent
6. **Audio mix** (Fusion/Audio page):
   - Adjust levels: Ambient (-20 dB), SFX (-15 dB), Music (-10 dB), VO (-5 dB)
   - Apply crossfades between music sections
7. **Export**:
   - Delivery page → Add to render queue
   - Format: H.264 MP4 (for YouTube upload)
   - Resolution: 1920×1080 or 3840×2160
   - Bitrate: 8–12 Mbps for high quality

### Adobe Premiere Pro (Professional)
1. **Create new sequence**: 1920×1080, 23.976 fps
2. **Import assets** → Project panel
3. **Arrange on timeline**: Drag scenes to video track (5 sec each)
4. **Add audio** to audio tracks below
5. **Adjust levels** using audio mixer
6. **Color grade** using Lumetri or adjustment layers
7. **Export**: File → Export → YouTube 1080p (or custom H.264)

---

## Phase 5: Optimize for YouTube

### Final Export Settings
- **Container**: MP4 (H.264 codec)
- **Resolution**: 1920×1080 (Full HD) or 3840×2160 (4K, if available)
- **Frame rate**: 24 fps (cinema) or 30 fps (broadcast)
- **Bitrate**: 8 Mbps (video) + 128 kbps (audio) for optimal quality/file size
- **Total file size**: ~150–300 MB (typical for 3-minute video at 1080p)
- **Duration**: Exactly 3 minutes or less

### YouTube Metadata
- **Title**: "Globis Edge 2.0: Offline AI for Refugee Protection at the Frontier"
- **Description**: 
  ```
  Globis Edge 2.0 is a prototype decision-support tool for humanitarian frontline workers using Gemma 4's multimodal capabilities.
  
  In this demo, caseworker Hawa uses an offline, on-device system to synthesize conflicting intake records, audio testimony, and ID images—detecting risks and protecting refugee dignity without cloud dependencies.
  
  🎯 Impact: Faster, safer intake processes for undocumented families
  🤖 Technology: Gemma 4 (2B Scout + 4B Analyst), Constitutional Auditor, Pi 5 edge deployment
  🌍 Real-world scenario: Adré reception center, Chad
  
  Built for Kaggle's Gemma 4 Good Hackathon.
  Repository: [GitHub link]
  
  [Technical notes on Gemma 4 usage, tiered inference, dual-pass audit...]
  ```
- **Tags**: gemma, ai-for-good, humanitarian-tech, edge-computing, refugee-protection, responsible-ai
- **Thumbnail**: Frame from Scene 14 or 22 (Hawa's calm face + teal scarf + device)

### Upload Checklist
- [ ] Video is exactly 3 minutes or under
- [ ] No visible text, logos, or subtitles
- [ ] Audio is clear and balanced
- [ ] Video plays smoothly in preview
- [ ] Thumbnail is visually compelling
- [ ] Title clearly states the problem and solution
- [ ] Description includes GitHub link and technical context
- [ ] Video is unlisted or public (judges need access)

---

## Phase 6: Create Supporting Materials

### Accompanying Notebook (Kaggle or Colab)
Title: "Globis Edge 2.0: Multimodal Humanitarian Intake at the Edge"

**Sections**:
1. **Problem framing** (1 minute read)
   - Undocumented refugee arrivals, conflicting records
   - Caseworker decision bottleneck
   - Risks of automated denial vs. dignity-preserving support

2. **Architecture overview** (2 minutes + diagram)
   - Tiered inference: E2B Scout (fast) → E4B Analyst (synthesis)
   - Multimodal integration: text + image (OCR) + audio (ASR)
   - Constitutional Auditor: dual-pass safety check
   - Data flow diagram (ASCII or simple visual)

3. **Demo: Synthetic Scenario A** (5 minutes + code)
   - Hawa Ahmed, undocumented child, birth year conflict
   - Multimodal synthesis output (JSON)
   - Auditor pass-through (no violations)
   - Refugee View narrative (dignity loop)

4. **Demo: Synthetic Scenario B** (5 minutes + code)
   - Yusuf Ahmed Hassan, ethnicity field present in intake
   - Auditor detects and blocks the field (constitutional protection)
   - Regeneration and safe output

5. **Latency & edge benchmarks** (3 minutes + table)
   - E2B (2B) vs E4B (4B) response times
   - Pi 5 inference constraints and caching strategies
   - Real-world intake throughput (cases/hour)

6. **Responsible AI & Ethics** (2 minutes)
   - Synthetic data only
   - No automated denial
   - Data minimization principles
   - Dual-pass audit for harm prevention
   - Clear positioning as prototype, not production system

7. **Next steps & roadmap** (1 minute)
   - Real PRIMES integration (requires DPIA, UNHCR governance)
   - Biometric options and risks
   - Multi-language support
   - Offline TTS (Piper) for refugee View

### README.md
- Project overview
- Quick start (install, run demo)
- Video link
- Architecture diagram
- Key features
- Limitations & caveats
- Contributing & citation

---

## Phase 7: Submit to Kaggle

### Submission Checklist
- [ ] Video uploaded to YouTube (unlisted or public, accessible to judges)
- [ ] Video link included in submission form
- [ ] Notebook published on Kaggle (with video embedded or linked)
- [ ] GitHub repository linked (with CLAUDE.md, INVARIANTS.md, test suite)
- [ ] README clearly states:
  - [ ] Problem & real-world context
  - [ ] Gemma 4 usage (multimodal, function calling, edge-ready)
  - [ ] Technical depth (architecture, prompts, safety)
  - [ ] Responsible AI approach
  - [ ] Synthetic data disclaimer
- [ ] Code runs on standard hardware (or clearly states requirements)
- [ ] Tests pass (unit, integration, adversarial)
- [ ] No hardcoded API keys or credentials

---

## Timeline Estimate

| Phase | Task | Hours | Notes |
|-------|------|-------|-------|
| 1 | Set up tools (Meta AI, DaVinci Resolve, audio editor) | 0.5 | One-time setup |
| 2 | Generate 30 scenes | 2–3 | 5 min/scene + iteration for continuity |
| 3 | Prepare audio (ambient, SFX, music, VO) | 1–2 | Sourcing + light editing |
| 4 | Assemble video in DaVinci/Premiere | 1–2 | Timeline assembly, color grade, export |
| 5 | Optimize & upload to YouTube | 0.5 | Final checks, metadata, upload |
| 6 | Create supporting notebook & README | 2–3 | Documentation + code examples |
| **Total** | | **7–11 hours** | Spread over 2–3 days |

---

## Pro Tips for Success

1. **Batch generate similar scenes**: If Meta AI respects visual context, generate Scenes 1–5 back-to-back, then review continuity before moving to 6–10.

2. **Use a "hero frame" reference**: Save the final frame of each scene and paste it as a reference in the next scene's prompt to ensure continuity.

3. **Color sampling**: Open each generated scene in an image editor and sample the exact RGB values from the reference image (ochre sand, rust red, turquoise sky). Create a color palette file (.aco or .swatch) and reference it in each prompt.

4. **Audio timing**: Use a spreadsheet to map audio cues to specific frames:
   - Frame 0–120 (Scenes 1–4): Ambient wind, no SFX
   - Frame 120–180 (Scenes 5–7): Paper rustles, device beep
   - Frame 180–240 (Scenes 11–13): Quiet processing (minimal audio)
   - etc.

5. **Render multiple times**: Export 2–3 versions (H.264 at different bitrates) and upload the highest quality to YouTube. Judges will notice.

6. **Thumbnail**: Create a custom thumbnail in Figma or Canva showing:
   - Hawa's teal headscarf (recognizable silhouette)
   - The Pi 5 device with glowing teal light
   - Bold text: "Globis Edge 2.0" or "AI for Refugee Dignity"
   - Color: Warm ochre background

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Hawa's headscarf changes between scenes | Regenerate with explicit continuity instruction: "Match Scene [N-1] exactly. Same headscarf angle, same character proportions." |
| Device looks too futuristic | Use more muted colors, emphasize simplicity: "Sand-tone casing, no LEDs or screens visible except a single teal indicator light." |
| Scenes feel disconnected | Review the camera move descriptions; ensure each scene starts from the previous scene's final frame. Use reference images. |
| Audio is too loud or too quiet | Use a normalized loudness standard: -16 LUFS (YouTube target) or -23 LUFS (streaming standard). Adjust in DaVinci/Premiere with audio metering. |
| Video upload fails on YouTube | Check file format (H.264 MP4), duration (≤3 min), and file size (<2 GB). YouTube accepts most common formats. |

---

## Next: Actual Generation

Once you're ready, follow this workflow:

1. **Open your chosen image generation tool** (Meta AI, Midjourney, DALL-E, etc.)
2. **Start with Scenes 1–5** to establish visual consistency
3. **Review continuity**
4. **Generate Scenes 6–10**, using Scene 5 as reference
5. **Continue this batch process** until all 30 are done
6. **Assemble in DaVinci Resolve** (or Premiere)
7. **Add audio**
8. **Export and upload to YouTube**
9. **Submit to Kaggle**

---

**Good luck! The judges will love this story.**

