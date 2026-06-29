import { CircleDot, Eye, Layers, Move3d, Ruler, Sigma } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { acetyleneLinearModes, type AcetyleneLineView } from "@/data/acetyleneLinear";
import { ModeToolbar } from "@/components/learning/ModeToolbar";
import type { AcetyleneLinearMode } from "@/types/molecule";

type AcetyleneLinearToolbarProps = {
  activeMode: AcetyleneLinearMode;
  lineView: AcetyleneLineView;
  onLineViewChange: (view: AcetyleneLineView) => void;
  onModeChange: (mode: AcetyleneLinearMode) => void;
};

const modeIcons: Record<AcetyleneLinearMode, LucideIcon> = {
  overview: CircleDot,
  line: Ruler,
  angle: Move3d,
  piBond: Sigma,
  tripleBond: Layers,
};

export function AcetyleneLinearToolbar({
  activeMode,
  lineView,
  onLineViewChange,
  onModeChange,
}: AcetyleneLinearToolbarProps) {
  return (
    <ModeToolbar
      modes={acetyleneLinearModes}
      modeIcons={modeIcons}
      activeMode={activeMode}
      onModeChange={onModeChange}
      viewToggle={{
        showWhenMode: "line",
        options: [
          { id: "front", label: "正视", title: "正视观察 H-C≡C-H 直线结构", icon: Eye },
          { id: "side", label: "侧视", title: "侧视验证四个原子没有偏离同一轴线", icon: Layers },
        ],
        activeView: lineView,
        onViewChange: onLineViewChange,
      }}
    />
  );
}
