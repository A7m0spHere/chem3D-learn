import type { Caption } from "@remotion/captions";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import captionsJson from "../data/captions.json";
import { colors } from "../config";

const captions = captionsJson satisfies Caption[];

export const CaptionTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000;
  const caption = captions.find((item) => currentTimeMs >= item.startMs && currentTimeMs < item.endMs);

  if (!caption) {
    return null;
  }

  const captionFrame = frame - Math.round((caption.startMs / 1000) * fps);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 150px 44px",
      }}
    >
      <div
        style={{
          maxWidth: 1560,
          borderRadius: 24,
          padding: "18px 34px 20px",
          color: colors.surface,
          backgroundColor: "rgba(31, 41, 51, 0.88)",
          boxShadow: "0 16px 48px rgba(31, 41, 51, 0.18)",
          fontSize: 38,
          fontWeight: 650,
          lineHeight: 1.38,
          letterSpacing: "0.01em",
          textAlign: "center",
          opacity: interpolate(captionFrame, [0, 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: `0 ${interpolate(captionFrame, [0, 10], [18, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          })}px`,
        }}
      >
        {caption.text}
      </div>
    </AbsoluteFill>
  );
};
