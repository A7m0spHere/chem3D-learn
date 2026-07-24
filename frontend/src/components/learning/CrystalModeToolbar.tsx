import { Box, Calculator, Gauge, GitCompare, Layers3, Network, Orbit, Pyramid, Share2, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  CrystalModelStyle,
  CrystalTeachingViewMode,
  CrystalViewMode,
} from "@/types/molecule";

type CrystalModeToolbarProps = {
  modes: CrystalTeachingViewMode[];
  activeMode: CrystalViewMode;
  showLabels: boolean;
  onModeChange: (mode: CrystalViewMode) => void;
  onToggleLabels: () => void;
  modelStyle?: CrystalModelStyle;
  onModelStyleChange?: (style: CrystalModelStyle) => void;
  supportsModelStyle?: boolean;
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
  showLabels,
  onModeChange,
  onToggleLabels,
  modelStyle = "ballStick",
  onModelStyleChange,
  supportsModelStyle = false,
}: CrystalModeToolbarProps) {
  return (
    <div className="chem-control-console">
      <div className="chem-control-grid">
        {modes.map((mode) => {
          const Icon = modeIcons[mode.id];
          const isActive = mode.id === activeMode;

          return (
            <Button
              aria-pressed={isActive}
              className="chem-touch-button"
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
        {supportsModelStyle && onModelStyleChange ? (
          <>
            <Button
              aria-pressed={modelStyle === "ballStick"}
              className="chem-touch-button"
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
              className="chem-touch-button"
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
          className="chem-touch-button"
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
