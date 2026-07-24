import { BrowserFrame } from "../components/BrowserFrame";
import { SceneChrome } from "../components/SceneChrome";
import { mediaAssets, sceneTimings } from "../config";

export const LibraryScene: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  return (
    <SceneChrome
      kicker="02 · 结构库"
      title="搜索、筛选，快速找到课本里的结构"
      duration={sceneTimings.library.duration}
      reducedMotion={reducedMotion}
    >
      <BrowserFrame asset={mediaAssets.library} kind="video" playbackRate={0.86} />
    </SceneChrome>
  );
};
