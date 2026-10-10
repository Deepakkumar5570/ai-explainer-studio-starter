import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Storyboard } from "@studio/shared";

const font = "'Noto Sans Devanagari', sans-serif";

export function ExplainerComposition({ storyboard }: { storyboard: Storyboard }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = storyboard.scenes.find((s, index) => {
    const start = storyboard.scenes.slice(0, index).reduce((sum, x) => sum + x.durationSeconds, 0) * fps;
    return frame >= start && frame < start + s.durationSeconds * fps;
  }) ?? storyboard.scenes[storyboard.scenes.length - 1];

  const sceneIndex = storyboard.scenes.findIndex((s) => s.id === scene.id);
  const startFrame = storyboard.scenes.slice(0, sceneIndex).reduce((sum, s) => sum + s.durationSeconds, 0) * fps;
  const localFrame = frame - startFrame;
  const opacity = interpolate(localFrame, [0, 10, scene.durationSeconds * fps - 8, scene.durationSeconds * fps], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#111214", color: "#fff", fontFamily: font, padding: "9%", justifyContent: "center" }}>
      <AbsoluteFill style={{ opacity, justifyContent: "center", gap: 34 }}>
        <div style={{ fontSize: 22, color: "#d7ff64", letterSpacing: 3 }}>EXPLAINER STUDIO</div>
        <div style={{ fontSize: 56, lineHeight: 1.35, fontWeight: 700 }}>{scene.caption}</div>
        <div style={{ width: 100, height: 6, borderRadius: 99, backgroundColor: "#d7ff64" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: "5%", left: "9%", right: "9%", fontSize: 20, color: "#c7c8cc" }}>{sceneIndex + 1} / {storyboard.scenes.length}</div>
    </AbsoluteFill>
  );
}
