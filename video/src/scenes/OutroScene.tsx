import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ChemistryBackdrop } from "../components/ChemistryBackdrop";
import { colors } from "../config";

export const OutroScene: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <ChemistryBackdrop reducedMotion={reducedMotion} />
      <div
        style={{
          position: "absolute",
          inset: "0 260px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 32,
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: colors.primary,
            fontSize: 36,
            fontWeight: 820,
            letterSpacing: "0.08em",
            opacity: reducedMotion
              ? 1
              : interpolate(frame, [0, 16], [0, 1], {
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
          }}
        >
          CHEM3D LEARN
        </div>
        <h2
          style={{
            margin: 0,
            color: colors.textPrimary,
            fontSize: 118,
            lineHeight: 1.08,
            fontWeight: 860,
            letterSpacing: "-0.05em",
            opacity: reducedMotion
              ? 1
              : interpolate(frame, [8, 28], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
            translate: reducedMotion
              ? "0 0"
              : `0 ${interpolate(frame, [8, 30], [34, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                })}px`,
          }}
        >
          让每一个空间结构，
          <span style={{ color: colors.primary }}>都能亲手转一转</span>
        </h2>
        <div style={{ color: colors.textSecondary, fontSize: 46, fontWeight: 650 }}>
          Chem3D Learn · 结构化学 3D 学习站
        </div>
        <div
          style={{
            marginTop: 18,
            padding: "22px 58px",
            borderRadius: 18,
            color: colors.surface,
            backgroundColor: colors.primary,
            boxShadow: "0 18px 42px rgba(42, 157, 143, 0.24)",
            fontSize: 42,
            fontWeight: 820,
            scale: reducedMotion
              ? 1
              : interpolate(frame, [38, 58], [0.92, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
            opacity: reducedMotion
              ? 1
              : interpolate(frame, [36, 54], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
          }}
        >
          开始探索
        </div>
      </div>
    </AbsoluteFill>
  );
};
