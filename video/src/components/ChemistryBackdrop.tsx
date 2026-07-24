import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../config";

export const ChemistryBackdrop: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const frame = useCurrentFrame();
  const rotation = reducedMotion ? 0 : interpolate(frame, [0, 300], [-8, 14]);
  const drift = reducedMotion ? 0 : interpolate(frame, [0, 300], [-18, 24]);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: `linear-gradient(135deg, ${colors.background} 0%, #EDF7F4 56%, ${colors.background} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 820,
          height: 820,
          borderRadius: "50%",
          right: -260,
          top: -290,
          backgroundColor: "rgba(42, 157, 143, 0.08)",
          scale: 1 + (reducedMotion ? 0 : interpolate(frame, [0, 180], [0, 0.08], { extrapolateRight: "clamp" })),
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 440,
          height: 440,
          borderRadius: "50%",
          left: -150,
          bottom: -190,
          backgroundColor: "rgba(244, 162, 97, 0.1)",
          translate: `${drift}px 0`,
        }}
      />
      <svg
        width="760"
        height="560"
        viewBox="0 0 760 560"
        style={{
          position: "absolute",
          right: 70,
          top: 190,
          opacity: 0.22,
          rotate: `${rotation}deg`,
        }}
      >
        <g stroke={colors.primary} strokeWidth="5">
          <line x1="380" y1="278" x2="176" y2="132" />
          <line x1="380" y1="278" x2="596" y2="126" />
          <line x1="380" y1="278" x2="228" y2="452" />
          <line x1="380" y1="278" x2="590" y2="438" />
        </g>
        <circle cx="380" cy="278" r="68" fill={colors.textPrimary} />
        <circle cx="176" cy="132" r="46" fill={colors.surface} stroke={colors.border} strokeWidth="4" />
        <circle cx="596" cy="126" r="46" fill={colors.surface} stroke={colors.border} strokeWidth="4" />
        <circle cx="228" cy="452" r="46" fill={colors.surface} stroke={colors.border} strokeWidth="4" />
        <circle cx="590" cy="438" r="46" fill={colors.surface} stroke={colors.border} strokeWidth="4" />
      </svg>
    </AbsoluteFill>
  );
};
