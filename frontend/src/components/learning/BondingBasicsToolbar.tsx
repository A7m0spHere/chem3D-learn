import { MoveRight, Orbit, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBondingBasicsLesson } from "@/data/bondingBasics";
import type { BondingBasicsMode, BondingBasicsModuleId } from "@/data/bondingBasics";

type BondingBasicsToolbarProps = {
  moduleId: BondingBasicsModuleId;
  activeMode: BondingBasicsMode;
  onModeChange: (mode: BondingBasicsMode) => void;
};

export function BondingBasicsToolbar({
  moduleId,
  activeMode,
  onModeChange,
}: BondingBasicsToolbarProps) {
  const lesson = getBondingBasicsLesson(moduleId);

  return (
    <div className="chem-control-console">
      <div className="chem-control-grid">
        {lesson.modes.map((mode) => {
          const Icon = getModeIcon(mode.id);
          return (
            <Button
              className="chem-touch-button w-full sm:w-auto"
              data-testid={`bonding-basics-mode-${mode.id}`}
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              size="sm"
              title={mode.title}
              type="button"
              variant={mode.id === activeMode ? "default" : "ghost"}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {mode.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function getModeIcon(mode: BondingBasicsMode) {
  if (mode === "transfer" || mode === "overlap") return MoveRight;
  if (mode === "formed" || mode === "lattice") return Share2;
  return Orbit;
}
