# Remotion Setup — Quick Start

## Status ✅

The Remotion project is **fully configured and ready to use**.

**Location**: `/Users/kukomo/Documents/Claude/Projects/Globis Edge/globis-edge-video/`

**What's been set up**:
- ✅ Remotion project structure (src/, public/, etc.)
- ✅ React composition for 30-scene animation
- ✅ Package scripts (start, render, build)
- ✅ TypeScript configuration
- ✅ H.264 codec settings
- ✅ Complete documentation (README.md)

---

## Your Next Steps

### Step 1: Place Scene Images

Once you've downloaded all 30 PNG files from Meta AI, move them to:

```bash
~/Documents/Claude/Projects/Globis\ Edge/globis-edge-video/public/scenes/
```

**Expected file names**:
```
Scene_01.png  (Establish the World)
Scene_02.png  (Slide Over Records)
Scene_03.png  (Set Up the Conversation)
...
Scene_30.png  (Closing Tableau)
```

**Verify all 30 exist**:
```bash
ls ~/Documents/Claude/Projects/Globis\ Edge/globis-edge-video/public/scenes/ | wc -l
# Should output: 30
```

### Step 2: Preview the Composition

Before rendering, preview in the interactive player:

```bash
cd ~/Documents/Claude/Projects/Globis\ Edge/globis-edge-video
npm start
```

This opens http://localhost:3000 where you can:
- Play/pause the 3-minute video
- Scrub through timeline
- Verify transitions, colors, and timing
- Check scene continuity

**Duration**: Should show **4320 frames at 24fps = 180 seconds (3 minutes)**

### Step 3: Render Final Video

Once satisfied, render to H.264 MP4:

```bash
npm run render
```

**Output file**: `globis-edge-30-scenes.mp4` (in project root)

**Specifications**:
- Resolution: 1920×1080 (Full HD)
- Frame rate: 24 fps
- Codec: H.264
- Bitrate: ~8-12 Mbps (CRF 18)
- Duration: 180 seconds
- File size: ~300-400 MB

**Time to render**: 30–60 minutes (depending on computer speed)

---

## Current File Structure

```
globis-edge-video/
├── src/
│   ├── index.ts                           # Entry point
│   ├── Root.tsx                           # Composition wrapper
│   └── compositions/
│       └── GlobisEdgeComposition.tsx      # Main animation logic
│
├── public/
│   └── scenes/
│       ├── Scene_01.png                   # ← You'll place 30 PNGs here
│       ├── Scene_02.png
│       └── ... (Scene_03 through Scene_30)
│
├── package.json                           # Scripts & dependencies
├── remotion.config.ts                     # Remotion settings
├── tsconfig.json                          # TypeScript config
├── README.md                              # Full documentation
└── QUICKSTART.md                          # This file
```

---

## What Happens During Rendering

1. **Load each Scene_[N].png** (1–30)
2. **Calculate frame position** (0–4319 frames total)
3. **Determine current scene** and next scene
4. **Apply transitions**:
   - Frames 0–110: Current scene (100% opacity) + subtle zoom
   - Frames 110–120: Cross-fade to next scene (opacity interpolation)
   - Repeat for all 30 scenes
5. **Encode to H.264** at 1920×1080, 24fps, 8-12 Mbps
6. **Output**: `globis-edge-30-scenes.mp4`

---

## After Rendering

### Audio Integration (DaVinci Resolve)

Once you have `globis-edge-30-scenes.mp4`:

1. Open DaVinci Resolve
2. Create new project (1920×1080, 24fps)
3. Import `globis-edge-30-scenes.mp4`
4. Add audio tracks:
   - **Track 1**: Ambient desert wind (3 min loop) → -20dB
   - **Track 2**: Paper rustles, device beeps (scattered) → -15dB
   - **Track 3**: Optional music → -10dB
   - **Track 4**: Optional voice-over → -5dB
5. Mix levels (peaks at -3dB max)
6. Export as H.264 MP4

### Upload to YouTube

- Title: "Globis Edge 2.0: Offline AI for Refugee Protection at the Frontier"
- Description: Problem, solution, GitHub link, Gemma 4 features
- Visibility: Unlisted or public
- Tags: gemma, ai-for-good, humanitarian-tech, responsible-ai, edge-ai

### Create Kaggle Notebook

- Embed YouTube video
- Write sections: Problem → Solution → Architecture → Demos → Benchmarks → Ethics → Next Steps
- Include live code examples
- Publish publicly

### Submit to Hackathon

- Kaggle submission form
- GitHub repository link
- YouTube video link
- Brief description (2–3 paragraphs)

---

## Key Commands

```bash
# Start preview (development)
npm start

# Render to H.264 MP4 (production)
npm run render

# Build individual frames (optional)
npm run build

# Install dependencies (if needed)
npm install
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Scene images not found" | Check: `public/scenes/Scene_[NUM].png` format |
| Preview won't start | Run: `npm install && npm start` |
| Render is very slow | Decrease CRF: `--crf 22` in package.json render script |
| FFmpeg not found | Install: `brew install ffmpeg` (macOS) or `apt-get install ffmpeg` (Linux) |

---

## Timeline

1. **Now**: Generate Scenes 3–30 via Meta AI Chrome (1 hour)
2. **Next**: Place all 30 PNGs in `public/scenes/` (5 min)
3. **Then**: Preview with `npm start` (2–5 min)
4. **Then**: Render with `npm run render` (30–60 min)
5. **Next**: Add audio in DaVinci Resolve (1–2 hours)
6. **Then**: Upload to YouTube (10 min)
7. **Finally**: Create Kaggle notebook + submit (2–3 hours)

**Total time from now**: ~6–8 hours spread over 1–2 days

---

## You're Ready!

The Remotion project is **fully configured**. Just:

1. ✅ Generate remaining scenes in Chrome (CHROME_BATCH_GENERATION_GUIDE.md)
2. ✅ Place 30 PNGs in `globis-edge-video/public/scenes/`
3. ✅ Run `npm start` to preview
4. ✅ Run `npm run render` to produce final video
5. ✅ Audio + YouTube + Kaggle → Submit

**You've got 1/3 done. Let's finish this.** 🎬

