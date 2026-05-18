import React from "react";
import { Composition } from "remotion";
import { GlobisEdgeComposition } from "./compositions/GlobisEdgeComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="globis-edge-30-scenes"
      component={GlobisEdgeComposition}
      durationInFrames={4320} // 180 seconds × 24 fps = 4320 frames
      fps={24}
      width={1920}
      height={1080}
      defaultProps={{
        totalScenes: 30,
        sceneDurationFrames: 120, // 5 seconds × 24 fps = 120 frames per scene
      }}
    />
  );
};
