import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ChemistryBackdrop } from "../components/ChemistryBackdrop";
import { colors } from "../config";

export const IntroScene: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <ChemistryBackdrop reducedMotion={reducedMotion} />
      <div
        style={{
          position: "absolute",
          left: 128,
          top: 210,
          width: 1120,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 34,
        }}
      >
        <div
          style={{
            padding: "12px 22px",
            borderRadius: 999,
            color: colors.primaryDark,
            backgroundColor: "rgba(255, 255, 255, 0.86)",
            border: `2px solid ${colors.border}`,
            fontSize: 28,
            fontWeight: 750,
            opacity: reducedMotion
              ? 1
              : interpolate(frame, [0, 14], [0, 1], {
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
          }}
        >
          高中结构化学 · 3D 学习工具
        </div>
        <h1
          style={{
            margin: 0,
            maxWidth: 1080,
            color: colors.textPrimary,
            fontSize: 126,
            lineHeight: 1.05,
            fontWeight: 850,
            letterSpacing: "-0.055em",
            opacity: reducedMotion
              ? 1
              : interpolate(frame, [8, 28], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
            translate: reducedMotion
              ? "0 0"
              : `${interpolate(frame, [8, 30], [-48, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                })}px 0`,
          }}
        >
          把抽象的空间结构，
          <span style={{ color: colors.primary }}>真正转起来</span>
        </h1>
        <div
          style={{
            width: reducedMotion
              ? 690
              : interpolate(frame, [30, 58], [0, 690], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.accent,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 124,
          bottom: 120,
          color: colors.primaryDark,
          fontSize: 42,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          opacity: reducedMotion ? 1 : interpolate(frame, [52, 74], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Chem3D Learn
      </div>
    </AbsoluteFill>
  );
};
