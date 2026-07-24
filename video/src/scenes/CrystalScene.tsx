import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { colors, mediaAssets } from "../config";

type CrystalShotProps = {
  asset: string;
  kind: "video" | "image";
  title: string;
  note: string;
  duration: number;
  reducedMotion: boolean;
};

const CrystalShot: React.FC<CrystalShotProps> = ({ asset, kind, title, note, duration, reducedMotion }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.background}, #EEF7F4)`,
        opacity: reducedMotion
          ? 1
          : interpolate(frame, [0, 8, duration - 10, duration - 1], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
      }}
    >
      <div style={{ padding: "42px 120px 18px", display: "flex", alignItems: "baseline", gap: 24 }}>
        <span style={{ color: colors.primary, fontSize: 30, fontWeight: 800 }}>05 · 晶体与考点</span>
        <h2 style={{ margin: 0, color: colors.textPrimary, fontSize: 58, lineHeight: 1.1, fontWeight: 820 }}>{title}</h2>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <BrowserFrame asset={asset} kind={kind} trimBefore={kind === "video" ? 45 : 0} scale={kind === "image" ? 1.02 : 1} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 150,
          top: 194,
          maxWidth: 520,
          padding: "18px 26px",
          borderRadius: 18,
          color: colors.primaryDark,
          backgroundColor: "rgba(255,255,255,0.94)",
          border: `2px solid ${colors.border}`,
          fontSize: 28,
          lineHeight: 1.35,
          fontWeight: 720,
        }}
      >
        {note}
      </div>
    </AbsoluteFill>
  );
};

export const CrystalScene: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={120}>
        <CrystalShot
          asset={mediaAssets.nacl}
          kind="video"
          title="从分子构型，走向晶胞与配位关系"
          note="NaCl 晶胞 · 六配位 · 标签"
          duration={120}
          reducedMotion={reducedMotion}
        />
      </Sequence>
      <Sequence from={120} durationInFrames={60}>
        <CrystalShot
          asset={mediaAssets.paths}
          kind="image"
          title="参考顺序帮助组织观察路线"
          note="按课本递进，随时跳到需要的结构"
          duration={60}
          reducedMotion={reducedMotion}
        />
      </Sequence>
      <Sequence from={180} durationInFrames={60}>
        <CrystalShot
          asset={mediaAssets.exam}
          kind="image"
          title="把空间直觉带回高考题目"
          note="晶胞计数 · 配位数 · 空间判断"
          duration={60}
          reducedMotion={reducedMotion}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
