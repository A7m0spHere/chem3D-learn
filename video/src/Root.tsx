import "./index.css";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import { CaptionTrack } from "./components/CaptionTrack";
import { sceneTimings, VIDEO_DURATION, VIDEO_FPS } from "./config";
import { Ch4Scene } from "./scenes/Ch4Scene";
import { ComparisonScene } from "./scenes/ComparisonScene";
import { CrystalScene } from "./scenes/CrystalScene";
import { HomeScene } from "./scenes/HomeScene";
import { IntroScene } from "./scenes/IntroScene";
import { LibraryScene } from "./scenes/LibraryScene";
import { OutroScene } from "./scenes/OutroScene";

export type DemoProps = {
  reducedMotion: boolean;
};

export const Chem3DLearnDemo: React.FC<DemoProps> = ({ reducedMotion }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#F7FAF9" }}>
      <Sequence from={sceneTimings.intro.from} durationInFrames={sceneTimings.intro.duration}>
        <IntroScene reducedMotion={reducedMotion} />
      </Sequence>
      <Sequence from={sceneTimings.home.from} durationInFrames={sceneTimings.home.duration}>
        <HomeScene reducedMotion={reducedMotion} />
      </Sequence>
      <Sequence from={sceneTimings.library.from} durationInFrames={sceneTimings.library.duration}>
        <LibraryScene reducedMotion={reducedMotion} />
      </Sequence>
      <Sequence from={sceneTimings.ch4.from} durationInFrames={sceneTimings.ch4.duration}>
        <Ch4Scene reducedMotion={reducedMotion} />
      </Sequence>
      <Sequence from={sceneTimings.comparison.from} durationInFrames={sceneTimings.comparison.duration}>
        <ComparisonScene reducedMotion={reducedMotion} />
      </Sequence>
      <Sequence from={sceneTimings.crystal.from} durationInFrames={sceneTimings.crystal.duration}>
        <CrystalScene reducedMotion={reducedMotion} />
      </Sequence>
      <Sequence from={sceneTimings.outro.from} durationInFrames={sceneTimings.outro.duration}>
        <OutroScene reducedMotion={reducedMotion} />
      </Sequence>
      <CaptionTrack />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Chem3DLearnDemo"
      component={Chem3DLearnDemo}
      durationInFrames={VIDEO_DURATION}
      fps={VIDEO_FPS}
      width={1920}
      height={1080}
      defaultProps={{ reducedMotion: false }}
    />
  );
};
