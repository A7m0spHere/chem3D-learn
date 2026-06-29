import { Atom, Eye, Layers, LockKeyhole, Move3d, Sigma } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ethylenePlanarModes, type EthylenePlaneView } from "@/data/ethylenePlanar";
import { ModeToolbar } from "@/components/learning/ModeToolbar";
import type { EthylenePlanarMode } from "@/types/molecule";

type EthylenePlanarToolbarProps = {
  activeMode: EthylenePlanarMode;
  planeView: EthylenePlaneView;
  onModeChange: (mode: EthylenePlanarMode) => void;
  onPlaneViewChange: (view: EthylenePlaneView) => void;
};

const modeIcons: Record<EthylenePlanarMode, LucideIcon> = {
  overview: Atom,
  plane: Layers,
  angle: Move3d,
  piBond: Sigma,
  rotationLock: LockKeyhole,
};

export function EthylenePlanarToolbar({
  activeMode,
  planeView,
  onModeChange,
  onPlaneViewChange,
}: EthylenePlanarToolbarProps) {
  return (
    <ModeToolbar
      modes={ethylenePlanarModes}
      modeIcons={modeIcons}
      activeMode={activeMode}
      onModeChange={onModeChange}
      viewToggle={{
        showWhenMode: "plane",
        options: [
          { id: "top", label: "俯视", title: "从上方观察分子平面", icon: Eye },
          { id: "side", label: "侧视", title: "从侧面验证所有原子共面", icon: Layers },
        ],
        activeView: planeView,
        onViewChange: onPlaneViewChange,
      }}
    />
  );
}
