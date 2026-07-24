import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../config";

type SceneChromeProps = {
  kicker: string;
  title: string;
  duration: number;
  reducedMotion: boolean;
  children: React.ReactNode;
};

export const SceneChrome: React.FC<SceneChromeProps> = ({ kicker, title, duration, reducedMotion, children }) => {
  const frame = useCurrentFrame();
  const fadeOutStart = Math.max(duration - 12, 1);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.background}, #EEF7F4)`,
        opacity: reducedMotion
          ? 1
          : interpolate(frame, [0, 9, fadeOutStart, duration - 1], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
      }}
    >
      <div
        style={{
          height: 154,
          padding: "42px 120px 18px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 36,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
          <span style={{ color: colors.primary, fontSize: 30, fontWeight: 800, letterSpacing: "0.08em" }}>{kicker}</span>
          <h2
            style={{
              margin: 0,
              color: colors.textPrimary,
              fontSize: 58,
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              opacity: reducedMotion
                ? 1
                : interpolate(frame, [2, 14], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                  }),
              translate: reducedMotion
                ? "0 0"
                : `0 ${interpolate(frame, [2, 16], [24, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                  })}px`,
            }}
          >
            {title}
          </h2>
        </div>
        <div style={{ color: colors.primaryDark, fontSize: 24, fontWeight: 700 }}>Chem3D Learn</div>
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>{children}</div>
    </AbsoluteFill>
  );
};
