import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { colors, mediaAssets, sceneTimings } from "../config";

const shotDuration = 130;

type ComparisonShotProps = {
  asset: string;
  formula: string;
  geometry: string;
  angle: string;
  lonePairs: string;
  reducedMotion: boolean;
};

const ComparisonShot: React.FC<ComparisonShotProps> = ({ asset, formula, geometry, angle, lonePairs, reducedMotion }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.background}, #EEF7F4)`,
        opacity: reducedMotion
          ? 1
          : interpolate(frame, [0, 10, shotDuration - 12, shotDuration - 1], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
      }}
    >
      <div style={{ padding: "44px 120px 18px", display: "flex", alignItems: "flex-end", gap: 26 }}>
        <span style={{ color: colors.primary, fontSize: 30, fontWeight: 800 }}>04 · 对比理解</span>
        <h2 style={{ margin: 0, color: colors.textPrimary, fontSize: 58, lineHeight: 1.1, fontWeight: 820 }}>
          看见孤对电子如何改变键角
        </h2>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <BrowserFrame asset={asset} kind="video" playbackRate={1.08} trimBefore={45} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 190,
          left: 150,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "22px 28px",
          borderRadius: 22,
          color: colors.textPrimary,
          backgroundColor: "rgba(255, 255, 255, 0.94)",
          border: `2px solid ${colors.border}`,
          boxShadow: "0 18px 50px rgba(31, 111, 104, 0.14)",
          opacity: reducedMotion
            ? 1
            : interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: reducedMotion
            ? "0 0"
            : `${interpolate(frame, [8, 24], [-26, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}px 0`,
        }}
      >
        <div style={{ color: colors.primaryDark, fontSize: 68, fontWeight: 860 }}>{formula}</div>
        <div style={{ width: 2, height: 68, backgroundColor: colors.border }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 28, fontWeight: 700 }}>
          <span>{geometry} · {angle}</span>
          <span style={{ color: colors.accent }}>{lonePairs}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ComparisonScene: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={shotDuration}>
        <ComparisonShot
          asset={mediaAssets.ch4}
          formula="CH₄"
          geometry="正四面体"
          angle="109.5°"
          lonePairs="中心原子无孤对电子"
          reducedMotion={reducedMotion}
        />
      </Sequence>
      <Sequence from={shotDuration} durationInFrames={shotDuration}>
        <ComparisonShot
          asset={mediaAssets.nh3}
          formula="NH₃"
          geometry="三角锥形"
          angle="约 107°"
          lonePairs="1 对孤对电子"
          reducedMotion={reducedMotion}
        />
      </Sequence>
      <Sequence from={shotDuration * 2} durationInFrames={sceneTimings.comparison.duration - shotDuration * 2}>
        <ComparisonShot
          asset={mediaAssets.h2o}
          formula="H₂O"
          geometry="V 形"
          angle="104.5°"
          lonePairs="2 对孤对电子"
          reducedMotion={reducedMotion}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
