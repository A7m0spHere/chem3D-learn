import { Video } from "@remotion/media";
import { Img, staticFile } from "remotion";
import { colors } from "../config";

type BrowserFrameProps = {
  asset: string;
  kind: "video" | "image";
  playbackRate?: number;
  trimBefore?: number;
  scale?: number;
};

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  asset,
  kind,
  playbackRate = 1,
  trimBefore = 0,
  scale = 1,
}) => {
  return (
    <div
      style={{
        width: 1720,
        height: 820,
        borderRadius: 26,
        overflow: "hidden",
        backgroundColor: colors.surface,
        border: `2px solid ${colors.border}`,
        boxShadow: "0 26px 70px rgba(31, 111, 104, 0.16)",
      }}
    >
      <div
        style={{
          height: 46,
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "0 22px",
          backgroundColor: "#F3F7F6",
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        {["#F4A261", "#E9C46A", "#2A9D8F"].map((color) => (
          <div key={color} style={{ width: 13, height: 13, borderRadius: "50%", backgroundColor: color }} />
        ))}
        <div
          style={{
            marginLeft: 12,
            height: 26,
            width: 520,
            borderRadius: 13,
            color: colors.textSecondary,
            backgroundColor: colors.surface,
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            fontSize: 15,
          }}
        >
          chem3d-learn.local
        </div>
      </div>
      <div style={{ width: "100%", height: 774, overflow: "hidden" }}>
        {kind === "video" ? (
          <Video
            src={staticFile(asset)}
            muted
            objectFit="cover"
            playbackRate={playbackRate}
            trimBefore={trimBefore}
            style={{
              width: "100%",
              height: "100%",
              objectPosition: "center top",
              scale,
            }}
          />
        ) : (
          <Img
            src={staticFile(asset)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              scale,
            }}
          />
        )}
      </div>
    </div>
  );
};
