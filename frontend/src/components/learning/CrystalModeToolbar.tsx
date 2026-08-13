import type { ReactNode } from "react";
import { Box, Calculator, Gauge, GitCompare, Layers3, Network, Orbit, Pyramid, Share2, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  CrystalControlViewMode,
  CrystalControlVoidStage,
  CrystalModelStyle,
  CrystalViewMode,
  CrystalVoidStage,
} from "@/types/molecule";

type CrystalModeToolbarProps = {
  modes: CrystalControlViewMode[];
  activeMode: CrystalViewMode;
  activeVoidStage: CrystalVoidStage;
  extraAction?: ReactNode;
  showLabels: boolean;
  onModeChange: (mode: CrystalViewMode) => void;
  onToggleLabels: () => void;
  onVoidStageChange: (stage: CrystalVoidStage) => void;
  modelStyle?: CrystalModelStyle;
  onModelStyleChange?: (style: CrystalModelStyle) => void;
  supportsModelStyle?: boolean;
  voidStages?: CrystalControlVoidStage[];
};

const modeIcons: Record<CrystalViewMode, typeof Box> = {
  pressure: Gauge,
  layer: Layers3,
  inPlaneBond: Share2,
  interlayerForce: Orbit,
  piElectron: Network,
  cell: Box,
  coordination: Network,
  coordinationAnion: Pyramid,
  counting: Calculator,
  voids: Layers3,
  comparison: GitCompare,
  metallicBond: Orbit,
  covalentNetwork: Share2,
  polyhedron: Pyramid,
  aSiteCoordination: Network,
  bSiteCoordination: Network,
  originShift: GitCompare,
  hcpStacking: Layers3,
  fccStacking: Layers3,
};

export function CrystalModeToolbar({
  modes,
  activeMode,
  activeVoidStage,
  extraAction,
  showLabels,
  onModeChange,
  onToggleLabels,
  onVoidStageChange,
  modelStyle = "ballStick",
  onModelStyleChange,
  supportsModelStyle = false,
  voidStages = [],
}: CrystalModeToolbarProps) {
  return (
    <div className="chem-control-console w-full">
      <div className="chem-control-grid">
        {modes.map((mode) => {
          const Icon = modeIcons[mode.id];
          const isActive = mode.id === activeMode;

          return (
            <Button
              aria-pressed={isActive}
              className="chem-touch-button !h-11 w-full sm:w-auto"
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              size="sm"
              title={mode.labelZh}
              type="button"
              variant={isActive ? "default" : "ghost"}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {mode.labelZh}
            </Button>
          );
        })}
        {extraAction}
        {supportsModelStyle && onModelStyleChange ? (
          <>
            <Button
              aria-pressed={modelStyle === "ballStick"}
              className="chem-touch-button !h-11 w-full sm:w-auto"
              onClick={() => onModelStyleChange("ballStick")}
              size="sm"
              title="切换为球棍模型"
              type="button"
              variant={modelStyle === "ballStick" ? "default" : "ghost"}
            >
              <Network className="h-4 w-4" aria-hidden="true" />
              球棍模型
            </Button>
            <Button
              aria-pressed={modelStyle === "packing"}
              className="chem-touch-button !h-11 w-full sm:w-auto"
              onClick={() => onModelStyleChange("packing")}
              size="sm"
              title="切换为堆积模型"
              type="button"
              variant={modelStyle === "packing" ? "default" : "ghost"}
            >
              <Layers3 className="h-4 w-4" aria-hidden="true" />
              堆积模型
            </Button>
          </>
        ) : null}
        <Button
          aria-pressed={showLabels}
          className="chem-touch-button !h-11 w-full sm:w-auto"
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
      {activeMode === "voids" && voidStages.length > 0 ? (
        <fieldset className="mt-3 min-w-0 border-0 border-t border-border/60 p-0 pt-2">
          <legend className="px-1 text-xs font-semibold text-text-secondary">空隙观察</legend>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {voidStages.map((stage) => {
              const isActive = stage.id === activeVoidStage;

              return (
                <Button
                  aria-pressed={isActive}
                  className="chem-touch-button !h-11 min-w-0 w-full px-2"
                  data-testid={`crystal-void-stage-${stage.id}`}
                  key={stage.id}
                  onClick={() => onVoidStageChange(stage.id)}
                  size="sm"
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                >
                  {stage.labelZh}
                </Button>
              );
            })}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}
