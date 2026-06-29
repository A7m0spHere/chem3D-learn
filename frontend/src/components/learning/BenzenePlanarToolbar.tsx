import { Eye, Hexagon, Layers, Move3d, Ruler, Sigma } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { benzenePlanarModes, type BenzenePlaneView } from "@/data/benzenePlanar";
import { ModeToolbar } from "@/components/learning/ModeToolbar";
import type { BenzenePlanarMode } from "@/types/molecule";

type BenzenePlanarToolbarProps = {
  activeMode: BenzenePlanarMode;
  planeView: BenzenePlaneView;
  onModeChange: (mode: BenzenePlanarMode) => void;
  onPlaneViewChange: (view: BenzenePlaneView) => void;
};

const modeIcons: Record<BenzenePlanarMode, LucideIcon> = {
  overview: Hexagon,
  plane: Layers,
  angle: Move3d,
  diagonal: Ruler,
  piBond: Sigma,
};

export function BenzenePlanarToolbar({
  activeMode,
  planeView,
  onModeChange,
  onPlaneViewChange,
}: BenzenePlanarToolbarProps) {
  return (
    <ModeToolbar
      modes={benzenePlanarModes}
      modeIcons={modeIcons}
      activeMode={activeMode}
      onModeChange={onModeChange}
      viewToggle={{
        showWhenMode: "plane",
        options: [
          { id: "top", label: "俯视", title: "从上方观察苯环正六边形平面", icon: Eye },
          { id: "side", label: "侧视", title: "从侧面验证苯环 12 原子共面", icon: Layers },
        ],
        activeView: planeView,
        onViewChange: onPlaneViewChange,
      }}
    />
  );
}
