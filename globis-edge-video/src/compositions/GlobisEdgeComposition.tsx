import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface GlobisEdgeCompositionProps {
  totalScenes: number;
  sceneDurationFrames: number; // 120 = 5 sec at 24fps
}

export const GlobisEdgeComposition: React.FC<GlobisEdgeCompositionProps> = ({
  totalScenes,
  sceneDurationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate which scene we're on
  const sceneIndex = Math.floor(frame / sceneDurationFrames);
  const frameInScene = frame % sceneDurationFrames;

  // Clamp scene index to valid range
  const currentSceneIndex = Math.min(sceneIndex, totalScenes - 1);
  const nextSceneIndex = Math.min(currentSceneIndex + 1, totalScenes - 1);

  // Scene numbering: Scene_01.png, Scene_02.png, etc.
  const currentSceneNum = String(currentSceneIndex + 1).padStart(2, "0");
  const nextSceneNum = String(nextSceneIndex + 1).padStart(2, "0");

  const currentScenePath = `/scenes/Scene_${currentSceneNum}.png`;
  const nextScenePath = `/scenes/Scene_${nextSceneNum}.png`;

  // Smooth cross-fade between scenes (last 10 frames of each scene)
  const fadeOutStart = sceneDurationFrames - 10;
  const progress =
    frameInScene >= fadeOutStart
      ? interpolate(frameInScene, [fadeOutStart, sceneDurationFrames], [0, 1])
      : 0;

  // Optional: subtle zoom for motion (customize per scene)
  const scale = 1 + interpolate(frameInScene, [0, sceneDurationFrames], [0, 0.02]);
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
        src={currentScenePath}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: opacity,
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      />

      {/* Next scene fading in (during last 10 frames) */}
      {progress > 0 && currentSceneIndex < totalScenes - 1 && (
        <Img
          src={nextScenePath}
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
