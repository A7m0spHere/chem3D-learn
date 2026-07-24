import { BrowserFrame } from "../components/BrowserFrame";
import { SceneChrome } from "../components/SceneChrome";
import { mediaAssets, sceneTimings } from "../config";

export const Ch4Scene: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  return (
    <SceneChrome
      kicker="03 · 核心体验"
      title="旋转、缩放，从不同方向建立空间直觉"
      duration={sceneTimings.ch4.duration}
      reducedMotion={reducedMotion}
    >
      <BrowserFrame asset={mediaAssets.ch4} kind="video" playbackRate={0.98} />
    </SceneChrome>
  );
};
