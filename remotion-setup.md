# Remotion Project Setup for Globis Edge 2.0
## Programmatic 5-Second Scene Animations

**Status**: Ready to configure  
**Framework**: Remotion v4.x (React-based video composition)  
**Target**: 30 scenes × 5 seconds each = 180 second (3 min) video  
**Output**: H.264 MP4 at 1920×1080, 24fps, 8-12 Mbps

---

## Quick Setup (5 minutes)

### 1. Install Remotion (if not already installed)
```bash
cd ~/Documents/Claude/Projects/Globis\ Edge
npx create-remotion-app@latest globis-edge-video --blank
cd globis-edge-video
npm install
```

### 2. Create Scene Composition
Create `src/compositions/Globis30Scenes.tsx`:

```tsx
import { Composition, Player } from "remotion";
import { GlobisScene } from "./GlobisScene";

export const Globis30Scenes = () => {
  return (
    <Composition
      id="globis-edge-30-scenes"
      component={GlobisScene}
      durationInFrames={4320} // 180 seconds × 24 fps = 4320 frames
      fps={24}
      width={1920}
      height={1080}
      defaultProps={{
        totalScenes: 30,
        sceneDuration: 120, // 5 seconds × 24 fps = 120 frames per scene
      }}
    />
  );
};
```

### 3. Create Scene Component
Create `src/compositions/GlobisScene.tsx`:

```tsx
import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import path from "path";

export interface GlobisSceneProps {
  totalScenes: number;
  sceneDuration: number; // frames per scene (120 = 5 sec at 24fps)
}

export const GlobisScene: React.FC<GlobisSceneProps> = ({
  totalScenes,
  sceneDuration,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Calculate which scene we're on
  const sceneIndex = Math.floor(frame / sceneDuration);
  const frameInScene = frame % sceneDuration;

  // Clamp scene index to valid range
  const currentSceneIndex = Math.min(sceneIndex, totalScenes - 1);
  const nextSceneIndex = Math.min(currentSceneIndex + 1, totalScenes - 1);

  // Load current and next scene images
  const currentScene = `Scene_${String(currentSceneIndex + 1).padStart(2, "0")}.png`;
  const nextScene = `Scene_${String(nextSceneIndex + 1).padStart(2, "0")}.png`;

  // Smooth cross-fade between scenes (last 10 frames of each scene)
  const fadeOutStart = sceneDuration - 10;
  const progress =
    frameInScene >= fadeOutStart
      ? interpolate(frameInScene, [fadeOutStart, sceneDuration], [0, 1])
      : 0;

  // Optional: Add subtle zoom or pan for motion (customize per scene)
  const scale = 1 + interpolate(frameInScene, [0, sceneDuration], [0, 0.02]);
  const opacity = 1 - progress;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#E8D7A0", // warm ochre fallback
        overflow: "hidden",
      }}
    >
      {/* Current scene with fade-out */}
      <Img
        src={`/scenes/${currentScene}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: opacity,
          transform: `scale(${scale})`,
          transition: "all 0.1s ease-out",
        }}
      />

      {/* Next scene fading in (during last 10 frames) */}
      {progress > 0 && (
        <Img
          src={`/scenes/${nextScene}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: progress,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
```

### 4. Place Scene Images
Copy all 30 scene PNG files to:
```
globis-edge-video/public/scenes/
└── Scene_01.png
└── Scene_02.png
└── ...
└── Scene_30.png
```

### 5. Update Root Composition
Edit `src/Root.tsx`:

```tsx
import { Composition } from "remotion";
import { Globis30Scenes } from "./compositions/Globis30Scenes";

export const RemotionRoot: React.FC = () => {
  return <Globis30Scenes />;
};
```

---

## Image Naming Convention

After downloading from Meta AI, rename to:
```
Scene_01_Establish_the_World.png         → Scene_01.png
Scene_02_Slide_Over_Records.png          → Scene_02.png
Scene_03_Set_Up_the_Conversation.png     → Scene_03.png
...
Scene_30_Closing_Tableau.png             → Scene_30.png
```

Place all 30 in: `globis-edge-video/public/scenes/`

---

## Run Preview (during development)

```bash
npm start
# Opens interactive player at localhost:3000
# Use player controls to preview entire 3-minute video
# Adjust timing, fade-out duration, zoom amounts as needed
```

---

## Export Final Video

```bash
npx remotion render src/Root.tsx globis-edge-video \
  --codec h264 \
  --crf 18 \
  --audio-codec aac \
  --audio-bitrate 128k
```

This creates `globis-edge-video.mp4` (1920×1080, 24fps, H.264 codec).

---

## Audio Integration

Once video frames are rendered, add audio in DaVinci Resolve:

1. **Open DaVinci Resolve** → New project
2. **Import**: `globis-edge-video.mp4` to timeline
3. **Audio tracks**:
   - Track 1: Ambient desert wind (3 min loop) — -20dB
   - Track 2: Paper rustles, device beeps (scatter throughout) — -15dB
   - Track 3: Optional music — -10dB
   - Track 4: Optional voice-over — -5dB
4. **Mix levels** so peaks are at -3dB (no clipping)
5. **Export**: Final H.264 MP4 (1920×1080, 24fps, 8-12 Mbps bitrate)

---

## Advanced: Per-Scene Customization

If you want different motion profiles for different scenes (e.g., slow pan for Scenes 1–5, zoom for Scenes 26–30):

Create `src/sceneAnimations.ts`:

```ts
export const sceneAnimations: Record<number, {
  scale?: [number, number];
  pan?: [number, number];
  fadeOut?: number;
}> = {
  1: { scale: [1, 1.02], pan: [0, 0] }, // Establish: slow zoom
  5: { scale: [1, 1], pan: [0, -10] }, // Reveal device: subtle pan left
  26: { scale: [1, 1.05], pan: [0, 0] }, // Device hero: larger zoom
  30: { scale: [1, 1.02], pan: [-20, 0] }, // Closing: pan to family
};
```

Then in `GlobisScene.tsx`:

```tsx
const animation = sceneAnimations[currentSceneIndex + 1] || { scale: [1, 1] };
const scale = interpolate(frameInScene, [0, sceneDuration], animation.scale);
```

---

## File Structure

```
globis-edge-video/
├── public/
│   └── scenes/
│       ├── Scene_01.png
│       ├── Scene_02.png
│       └── ... (Scene_03 through Scene_30)
│
├── src/
│   ├── compositions/
│   │   ├── Globis30Scenes.tsx
│   │   └── GlobisScene.tsx
│   ├── Root.tsx
│   └── index.ts
│
├── package.json
└── remotion.config.ts
```

---

## Timeline Estimate

- **Setup Remotion project**: 5 min
- **Create composition + component**: 10 min
- **Place 30 scene images**: 5 min
- **Preview and adjust animations**: 20 min
- **Render final video**: 30–60 min (depends on computer)
- **Audio integration in DaVinci**: 30–60 min
- **Final export**: 10–30 min

**Total**: 1.5–3 hours for video assembly (once all 30 scenes are downloaded)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Image not found" error | Verify PNG files are in `public/scenes/` and named `Scene_01.png`–`Scene_30.png` (exact format) |
| Video won't render | Update Remotion to latest: `npm install remotion@latest` |
| Audio sync issues | Check audio sample rate (should be 48 kHz for video) in DaVinci |
| Slow cross-fade | Reduce fadeOutStart from 10 to 5 frames for snappier transitions |
| Output file too large | Decrease `--crf` to 22–24 (quality ↓, size ↓) |

---

## Next: Audio Collection

Once Remotion renders the video, proceed to:
1. Download ambient desert wind (Freesound.org, 3 min loop)
2. Download 3–5 SFX clips (paper rustles, device beeps)
3. Optional: license royalty-free music (Pixabay, YouTube Audio Library)
4. Optional: record 45-second voice-over in English (Piper TTS or phone voice memo)

Then assemble everything in DaVinci Resolve.

---

## Ready?

1. ✅ Generate all 30 scenes via Meta AI (SCENE_GENERATION_WORKFLOW.md)
2. ✅ Place PNG files in `globis-edge-video/public/scenes/`
3. ✅ Run `npm start` to preview Remotion composition
4. ✅ Render to H.264 MP4
5. ✅ Add audio in DaVinci Resolve
6. ✅ Upload to YouTube
7. ✅ Embed in Kaggle notebook + submit

You're 1/4 of the way there. Let's finish this. 🎬

