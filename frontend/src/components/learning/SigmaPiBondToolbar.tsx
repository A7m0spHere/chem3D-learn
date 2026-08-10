import { Circle, Orbit, Pause, Play, Sigma, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrbitalBondLesson } from "@/data/sigmaPiBonds";
import type { OrbitalBondLessonType, PiBondMode, SigmaBondMode } from "@/data/sigmaPiBonds";

type SigmaPiBondToolbarProps =
  | {
      lessonType: "sigma";
      activeMode: SigmaBondMode;
      showLabels: boolean;
      onModeChange: (mode: SigmaBondMode) => void;
      onToggleLabels: () => void;
    }
  | {
      lessonType: "pi";
      activeMode: PiBondMode;
      isPlaying: boolean;
      showLabels: boolean;
      onModeChange: (mode: PiBondMode) => void;
      onToggleLabels: () => void;
      onTogglePlaying: () => void;
    };

export function SigmaPiBondToolbar(props: SigmaPiBondToolbarProps) {
  const buttonClassName = "chem-touch-button !h-11 w-full sm:w-auto";
  const lesson = getOrbitalBondLesson(props.lessonType);

  return (
    <div className="chem-control-console">
      <div className="chem-control-grid">
        {lesson.modes.map((mode) => {
          const isActive = mode.id === props.activeMode;
          const Icon = getModeIcon(props.lessonType, mode.id);

          return (
            <Button
              className={buttonClassName}
              data-testid={`${props.lessonType}-bond-mode-${mode.id}`}
              key={mode.id}
              onClick={() => {
                if (props.lessonType === "sigma") {
                  props.onModeChange(mode.id as SigmaBondMode);
                } else {
                  props.onModeChange(mode.id as PiBondMode);
                }
              }}
              size="sm"
              title={mode.title}
              type="button"
              variant={isActive ? "default" : "ghost"}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {mode.label}
            </Button>
          );
        })}
        {props.lessonType === "pi" ? (
          <Button
            className={buttonClassName}
            data-testid="pi-bond-toggle-playing"
            onClick={props.onTogglePlaying}
            size="sm"
            title={props.isPlaying ? "暂停 π 键成键动画" : "播放 π 键成键动画"}
            type="button"
            variant={props.isPlaying ? "default" : "ghost"}
          >
            {props.isPlaying ? (
              <Pause className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
            {props.isPlaying ? "暂停" : "播放"}
          </Button>
        ) : null}
        <Button
          className={buttonClassName}
          data-testid={`${props.lessonType}-bond-toggle-labels`}
          onClick={props.onToggleLabels}
          size="sm"
          title="显示/隐藏 3D 标注"
          type="button"
          variant={props.showLabels ? "default" : "ghost"}
        >
          <Tags className="h-4 w-4" aria-hidden="true" />
          标注
        </Button>
      </div>
    </div>
  );
}

function getModeIcon(lessonType: OrbitalBondLessonType, modeId: string) {
  if (lessonType === "sigma") return modeId === "ss" ? Circle : Sigma;
  return Orbit;
}
