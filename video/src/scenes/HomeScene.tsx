import { BrowserFrame } from "../components/BrowserFrame";
import { SceneChrome } from "../components/SceneChrome";
import { mediaAssets, sceneTimings } from "../config";

export const HomeScene: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  return (
    <SceneChrome
      kicker="01 · 网站定位"
      title="面向高中结构化学的 3D 学习工具"
      duration={sceneTimings.home.duration}
      reducedMotion={reducedMotion}
    >
      <BrowserFrame asset={mediaAssets.home} kind="video" playbackRate={1} />
    </SceneChrome>
  );
};
