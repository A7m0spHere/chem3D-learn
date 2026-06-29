import { Atom, CircleDot, Hexagon, Move3d, Orbit, RotateCcw, Sigma, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { organicCoplanarModes } from "@/data/organicCoplanar";
import type { OrganicCoplanarMode } from "@/types/molecule";

type OrganicCoplanarToolbarProps = {
  activeMode: OrganicCoplanarMode;
  showLabels: boolean;
  vinylAligned: boolean;
  onModeChange: (mode: OrganicCoplanarMode) => void;
  onToggleLabels: () => void;
  onToggleVinylAligned: () => void;
};

const modeIcons: Record<OrganicCoplanarMode, typeof Atom> = {
  overview: Atom,
  benzenePlane: Hexagon,
  sp3Carbon: Move3d,
  sp2Fragment: Sigma,
  spFragment: CircleDot,
  amineGroup: Orbit,
  rotation: RotateCcw,
};

export function OrganicCoplanarToolbar({
  activeMode,
  showLabels,
  vinylAligned,
  onModeChange,
  onToggleLabels,
  onToggleVinylAligned,
}: OrganicCoplanarToolbarProps) {
  const buttonClassName = "chem-touch-button w-full sm:w-auto";

  return (
    <div className="chem-control-console">
      <div className="chem-control-grid">
        {organicCoplanarModes.map((mode) => {
          const Icon = modeIcons[mode.id];
          const isActive = mode.id === activeMode;

          return (
            <Button
              className={buttonClassName}
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              size="sm"
              title={mode.titleZh}
              type="button"
              variant={isActive ? "default" : "ghost"}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {mode.labelZh}
            </Button>
          );
        })}

        {activeMode === "rotation" ? (
          <Button
            className={buttonClassName}
            onClick={onToggleVinylAligned}
            size="sm"
            title="切换乙烯基默认夹角与对齐苯环平面"
            type="button"
            variant={vinylAligned ? "default" : "outline"}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {vinylAligned ? "恢复 45°" : "对齐平面"}
          </Button>
        ) : null}

        <Button
          className={buttonClassName}
          onClick={onToggleLabels}
          size="sm"
          title="显示/隐藏结构片段标签"
          type="button"
          variant={showLabels ? "default" : "ghost"}
        >
          <Tags className="h-4 w-4" aria-hidden="true" />
          标签
        </Button>
      </div>
    </div>
  );
}
