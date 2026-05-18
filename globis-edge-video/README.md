# Globis Edge 2.0 — Video Composition (Remotion)

## Overview

This is a Remotion-based React project that assembles 30 scene PNG keyframes into a smooth, 3-minute (180-second) video with cross-fade transitions. It's designed to accept Meta AI-generated scene images and produce a broadcast-quality H.264 MP4 output.

**Target Output**: `globis-edge-30-scenes.mp4` (1920×1080, 24fps, ~300-400 MB)

---

## Project Structure

```
globis-edge-video/
├── src/
│   ├── index.ts                      # Entry point (registers Remotion root)
│   ├── Root.tsx                      # Root composition wrapper
│   └── compositions/
│       └── GlobisEdgeComposition.tsx # Main video composition logic
│
├── public/
│   └── scenes/
│       ├── Scene_01.png
│       ├── Scene_02.png
│       └── ... (Scene_03 through Scene_30)
│
├── package.json                      # Dependencies and scripts
├── remotion.config.ts               # Remotion configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # This file
```

---

## Prerequisites

- **Node.js 16+** (you have v22.22.0 ✅)
- **npm 8+** (you have 10.9.4 ✅)
- **30 scene PNG images** in `public/scenes/` (named `Scene_01.png` through `Scene_30.png`)
- **FFmpeg** (required for final rendering; Remotion will prompt if missing)

---

## Getting Started

### 1. Verify Scene Images

All 30 scene PNG files must be in the `public/scenes/` directory:

```bash
ls -la public/scenes/ | wc -l
# Should output: 30 (files) + 2 (. and ..) = 32
```

Expected naming format:
- `Scene_01.png`
- `Scene_02.png`
- ...
- `Scene_30.png`

### 2. Install Dependencies (Already Done ✅)

```bash
npm install
```

Dependencies:
- `remotion` (v4.0.462+) — Video composition framework
- `react` (v19.2.6+) — UI library
- `react-dom` (v19.2.6+) — DOM rendering

### 3. Preview the Composition

Launch the interactive Remotion player to see your video with full timeline control:

```bash
npm start
# or
npm run dev
```

This opens a local server at `http://localhost:3000` where you can:
- Play/pause the entire 3-minute video
- Scrub through timeline
- Adjust playback speed
- Export individual frames

**Tip**: Use the preview to verify scene transitions, colors, and timing before rendering.

---

## How It Works

### Composition Logic (`GlobisEdgeComposition.tsx`)

Each frame is calculated as follows:

1. **Current frame number** (0–4319 for 180 seconds at 24fps)
2. **Scene index** = frame ÷ 120 (each scene = 120 frames = 5 seconds)
3. **Frame within scene** = frame % 120 (position within current scene, 0–119)
4. **Fade-out trigger** = frame 110–119 (last 10 frames of each scene)
5. **Transition** = cross-fade from current scene to next scene

**Animation profile**:
- Scenes 1–120 frames: Current scene at full opacity + subtle 2% zoom
- Frames 110–120: Fade from current → next scene (smooth cross-dissolve)
- Next scene appears at full opacity while current fades out

### Colors & Style

- **Background fallback**: `#E8D7A0` (warm ochre) — used if image fails to load
- **Blend mode**: Cross-fade (opacity interpolation)
- **Scale**: Linear interpolation from 1.0 to 1.02 (subtle push-in effect)
- **Object-fit**: `cover` (images fill 1920×1080 without distortion)

---

## Build & Render Scripts

### Preview (Development)
```bash
npm start
# Interactive player at localhost:3000
# Use this to verify scenes, timing, colors before rendering
```

### Render (Production)
```bash
npm run render
# Outputs: globis-edge-30-scenes.mp4 (H.264, 1920×1080, 24fps)
# Duration: ~30-60 minutes depending on computer
# Quality: CRF 18 (high quality, ~8-12 Mbps bitrate)
```

### Build (Optional)
```bash
npm run build
# Outputs individual frames to dist/ folder (for manual assembly in DaVinci)
# Useful if you want to edit in post-production
```

---

## Video Output Specifications

**File**: `globis-edge-30-scenes.mp4`

| Property | Value |
|----------|-------|
| **Codec** | H.264 (MPEG-4 AVC) |
| **Resolution** | 1920×1080 (Full HD) |
| **Frame rate** | 24 fps |
| **Bitrate** | ~8-12 Mbps (CRF 18) |
| **Duration** | 180 seconds (3 minutes) |
| **Audio codec** | AAC |
| **Audio bitrate** | 128 kbps (mono) |
| **File size** | ~300-400 MB |
| **Color space** | Rec. 709 (video standard) |

---

## Next Steps (After Rendering)

Once `globis-edge-30-scenes.mp4` is ready:

1. **Audio Integration** (DaVinci Resolve)
   - Import the MP4 into a new DaVinci project
   - Add audio tracks:
     - Ambient desert wind (full 180 sec, -20dB)
     - Paper rustles / device beeps (scattered, -15dB)
     - Optional background music (-10dB)
     - Optional voice-over (-5dB)
   - Mix levels so peaks are at -3dB (no clipping)
   - Export final H.264 MP4

2. **Upload to YouTube**
   - Unlisted or public visibility
   - Title: "Globis Edge 2.0: Offline AI for Refugee Protection at the Frontier"
   - Tags: gemma, ai-for-good, humanitarian-tech, responsible-ai
   - Custom thumbnail (Hawa's scarf + device light)
   - Auto-generated captions (CC)

3. **Create Kaggle Notebook**
   - Embed YouTube video link
   - Write problem → solution → architecture → demos → benchmarks → ethics → next steps
   - Include live code examples (synthetic scenarios)
   - Publish to Kaggle

4. **Submit to Hackathon**
   - Kaggle submission form
   - GitHub link
   - Problem description (2-3 paragraphs)
   - Team info

---

## Troubleshooting

### "Scene images not found" Error

**Problem**: Remotion can't find `Scene_01.png`, `Scene_02.png`, etc.

**Solution**:
1. Verify folder exists: `public/scenes/`
2. Check file names match exactly: `Scene_[NUM].png` (not `Scene_[NUM]_title.png`)
3. Verify images are PNG format (not JPG, not WebP)
4. Run: `ls public/scenes/` to list files

### Rendering is Very Slow

**Problem**: `npm run render` is taking > 2 hours

**Causes**:
- Computer CPU is bottleneck (FFmpeg encoding is CPU-heavy)
- Scenes have high resolution or special effects

**Solutions**:
- Decrease CRF from 18 to 22 (faster, lower quality): `--crf 22`
- Reduce output bitrate: `--audio-bitrate 96k`
- Run on a faster computer if available

### FFmpeg Not Found

**Problem**: "ffmpeg not found" error during render

**Solution**:
```bash
# macOS (using Homebrew)
brew install ffmpeg

# Linux (using apt)
sudo apt-get install ffmpeg

# Windows (using Chocolatey)
choco install ffmpeg
```

Then retry `npm run render`.

### Preview Won't Start

**Problem**: `npm start` gives error or localhost:3000 won't load

**Solution**:
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm start
```

### Video Has Wrong Duration or Frame Rate

**Problem**: Output MP4 doesn't match 180 seconds or 24fps

**Solution**: Check `remotion.config.ts` and verify:
```ts
Config.setFrameRate(24);     // Should be 24
// Duration calculated from: durationInFrames (4320) ÷ fps (24) = 180 sec ✅
```

---

## Advanced: Customizing Transitions

To adjust how scenes transition, edit `src/compositions/GlobisEdgeComposition.tsx`:

### Fade Duration
```tsx
// Change from 10 frames to 20 frames (for slower fade)
const fadeOutStart = sceneDurationFrames - 20; // 5 frames slower
```

### Zoom Amount
```tsx
// Change from 2% to 5% zoom
const scale = 1 + interpolate(frameInScene, [0, sceneDurationFrames], [0, 0.05]);
```

### Pan Effect (Optional)
```tsx
// Add horizontal pan (left to right)
const panX = interpolate(frameInScene, [0, sceneDurationFrames], [-50, 50]);
const panY = 0;
// In Img style: transform: `scale(${scale}) translate(${panX}px, ${panY}px)`
```

---

## Performance Notes

- **Preview mode**: Renders in real-time (may stutter on slow machines)
- **Render mode**: Single-threaded H.264 encoding (~3–5 min per 30 seconds on modern CPU)
- **Memory**: ~500MB RAM required
- **Disk space**: ~600MB for output file + temp space

---

## Questions?

Refer to:
- **Remotion docs**: https://www.remotion.dev/docs
- **Video production guide**: `../VIDEO_GENERATION_WORKFLOW.md`
- **Scene generation guide**: `../CHROME_BATCH_GENERATION_GUIDE.md`

---

## License

Apache 2.0 (same as Globis Edge project)

---

**Ready to render?** Make sure all 30 PNG files are in `public/scenes/`, then run:

```bash
npm run render
```

This will create `globis-edge-30-scenes.mp4` ready for audio mixing in DaVinci Resolve.

🎬
