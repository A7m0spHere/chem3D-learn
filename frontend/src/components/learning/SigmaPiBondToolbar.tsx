import { Atom, Layers, Orbit, Sigma, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sigmaPiBondModes } from "@/data/sigmaPiBonds";
import type { SigmaPiBondMode } from "@/types/molecule";

type SigmaPiBondToolbarProps = {
  activeMode: SigmaPiBondMode;
  showLabels: boolean;
  onModeChange: (mode: SigmaPiBondMode) => void;
  onToggleLabels: () => void;
};

const modeIcons: Record<SigmaPiBondMode, typeof Atom> = {
  overview: Atom,
  sigma: Sigma,
  pi: Orbit,
  doubleBond: Layers,
};

export function SigmaPiBondToolbar({
  activeMode,
  showLabels,
  onModeChange,
  onToggleLabels,
}: SigmaPiBondToolbarProps) {
  const buttonClassName = "chem-touch-button w-full sm:w-auto";

  return (
    <div className="chem-control-console">
      <div className="chem-control-grid">
        {sigmaPiBondModes.map((mode) => {
          const Icon = modeIcons[mode.id];
          const isActive = mode.id === activeMode;

          return (
            <Button
              className={buttonClassName}
              data-testid={`sigma-pi-mode-${mode.id}`}
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
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
        <Button
          className={buttonClassName}
          data-testid="sigma-pi-toggle-labels"
          onClick={onToggleLabels}
          size="sm"
          title="显示/隐藏 3D 标注"
          type="button"
          variant={showLabels ? "default" : "ghost"}
        >
          <Tags className="h-4 w-4" aria-hidden="true" />
          标注
        </Button>
      </div>
    </div>
  );
}
