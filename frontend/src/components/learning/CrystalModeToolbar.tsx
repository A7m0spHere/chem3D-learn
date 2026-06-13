import { Box, Calculator, GitCompare, Layers3, Network, Orbit, Share2, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CrystalTeachingViewMode, CrystalViewMode } from "@/types/molecule";

type CrystalModeToolbarProps = {
  modes: CrystalTeachingViewMode[];
  activeMode: CrystalViewMode;
  showLabels: boolean;
  onModeChange: (mode: CrystalViewMode) => void;
  onToggleLabels: () => void;
};

const modeIcons: Record<CrystalViewMode, typeof Box> = {
  layer: Layers3,
  inPlaneBond: Share2,
  interlayerForce: Orbit,
  piElectron: Network,
  cell: Box,
  coordination: Network,
  counting: Calculator,
  voids: Layers3,
  comparison: GitCompare,
  metallicBond: Orbit,
  covalentNetwork: Share2,
};

export function CrystalModeToolbar({
  modes,
  activeMode,
  showLabels,
  onModeChange,
  onToggleLabels,
}: CrystalModeToolbarProps) {
  return (
    <div className="w-full rounded-2xl border border-border/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {modes.map((mode) => {
          const Icon = modeIcons[mode.id];
          const isActive = mode.id === activeMode;

          return (
            <Button
              className="min-w-[112px] rounded-full px-3 whitespace-nowrap"
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
        <Button
          className="min-w-[112px] rounded-full px-3 whitespace-nowrap"
          onClick={onToggleLabels}
          size="sm"
          title="显示/隐藏晶胞位点标签"
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
