# Quick Reference Card — Globis Edge 2.0 Video

## Status: ✅ REMOTION READY

**Today**: May 18, 2026 | **Deadline**: May 22, 2026 | **Remaining Time**: 4 days

---

## Commands (Copy & Paste Ready)

### Step 1: Generate Scenes
```bash
# Open in Chrome and generate Scenes 3-30 using CHROME_BATCH_GENERATION_GUIDE.md
# Save all 30 PNGs to: ~/Documents/Claude/Projects/Globis\ Edge/VIDEO_ASSETS/scenes/
# Time: ~1 hour
```

### Step 2: Place Images
```bash
cp ~/Documents/Claude/Projects/Globis\ Edge/VIDEO_ASSETS/scenes/Scene_*.png \
   ~/Documents/Claude/Projects/Globis\ Edge/globis-edge-video/public/scenes/
```

### Step 3: Preview
```bash
cd ~/Documents/Claude/Projects/Globis\ Edge/globis-edge-video
npm start
# Opens: http://localhost:3000
# Press: Ctrl+C to exit
```

### Step 4: Render
```bash
cd ~/Documents/Claude/Projects/Globis\ Edge/globis-edge-video
npm run render
# Outputs: globis-edge-30-scenes.mp4 (~300-400 MB)
# Wait: 30-60 minutes
```

### Step 5: Audio + YouTube + Kaggle + Submit
See **EXECUTION_CHECKLIST.md** for detailed instructions

---

## File Locations

**Main project**: `/Users/kukomo/Documents/Claude/Projects/Globis Edge/globis-edge-video/`

**Scene storage**: `~/Documents/Claude/Projects/Globis\ Edge/VIDEO_ASSETS/scenes/`

**Remotion source**:
- `src/Root.tsx` — Root composition
- `src/index.ts` — Entry point
- `src/compositions/GlobisEdgeComposition.tsx` — Animation logic

**Public assets**: `public/scenes/` (place all 30 PNGs here)

---

## Configuration

**Video specs**:
- Resolution: 1920×1080
- Frame rate: 24 fps
- Duration: 180 seconds (3 minutes)
- Codec: H.264
- Bitrate: 8-12 Mbps
- Audio: AAC, 128 kbps

**Transition**: 10-frame cross-fade between scenes (smooth dissolve)

**Scene duration**: 5 seconds each (120 frames at 24fps)

**Zoom**: Subtle 2% push-in effect per scene

---

## Critical Checklist

Before proceeding to each step, verify:

**Before Preview**:
- [ ] All 30 PNGs in `globis-edge-video/public/scenes/`
- [ ] File names: `Scene_01.png` through `Scene_30.png`
- [ ] Files are PNG format
- [ ] Count = 30: `ls public/scenes/ | wc -l`

**Before Render**:
- [ ] Preview plays without errors at localhost:3000
- [ ] Duration shows 180 seconds (4320 frames)
- [ ] Transitions are smooth
- [ ] Colors/continuity verified

**Before Audio Integration**:
- [ ] Output MP4 file created: `globis-edge-30-scenes.mp4`
- [ ] Duration correct (180 sec)
- [ ] File size ~300-400 MB
- [ ] Can open in video player

---

## Documentation Map

| Guide | Purpose | Read Time |
|-------|---------|-----------|
| **CHROME_BATCH_GENERATION_GUIDE.md** | Generate Scenes 3-30 | 5 min |
| **globis-edge-video/QUICKSTART.md** | Remotion quick start | 5 min |
| **globis-edge-video/README.md** | Full Remotion docs | 15 min |
| **EXECUTION_CHECKLIST.md** | End-to-end task list | 10 min |
| **REMOTION_EXECUTION_COMPLETE.md** | Setup summary | 5 min |
| **This file** | Quick reference | 2 min |

---

## Estimated Timeline

| Phase | Time | Start | Finish |
|-------|------|-------|--------|
| Scene generation | 1h | Now | +1h |
| Image placement | 5m | +1h | +1h5m |
| Preview | 5m | +1h5m | +1h10m |
| Rendering | 45m | +1h10m | +1h55m |
| Audio integration | 1.5h | +1h55m | +3h25m |
| YouTube upload | 20m | +3h25m | +3h45m |
| Kaggle notebook | 1.5h | +3h45m | +5h15m |
| Final submission | 20m | +5h15m | +5h35m |

**COMPLETION**: Today evening or tomorrow morning ✅

---

## Success Criteria

✅ **Video**: 3 minutes, smooth transitions, 1920×1080, 24fps, H.264  
✅ **Audio**: Ambient + SFX + music, balanced levels, no clipping  
✅ **YouTube**: Unlisted/public, proper metadata, captions enabled  
✅ **Kaggle**: Notebook with code examples, problem → solution → ethics  
✅ **Submission**: All required fields filled, links correct, submitted by May 22

---

## Support

If stuck:
1. Check **EXECUTION_CHECKLIST.md** — most questions answered there
2. Read **globis-edge-video/README.md** — technical deep dive
3. Try `npm install` to reinstall dependencies
4. Clear cache: `rm -rf node_modules && npm install`

---

## Key Numbers

- **Scenes**: 30
- **Duration per scene**: 5 seconds
- **Total video duration**: 180 seconds (3 minutes)
- **Frame rate**: 24 fps
- **Total frames**: 4,320
- **Resolution**: 1920×1080
- **Render time**: 30–60 minutes
- **File size**: ~300–400 MB
- **Audio bitrate**: 128 kbps
- **Video bitrate**: 8–12 Mbps

---

## You're Ready

✅ Remotion fully configured  
✅ All documentation provided  
✅ npm packages installed  
✅ Source code in place  
✅ Scripts ready  

**Next action**: Generate Scenes 3-30 in Chrome using CHROME_BATCH_GENERATION_GUIDE.md

**Let's finish this.** 🎬

