import { CircleDot, Move3d, Orbit, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type FloatingToolbarProps = {
  autoRotate: boolean;
  showAngles: boolean;
  showLonePairs: boolean;
  showAtomLabels: boolean;
  onToggleAutoRotate: () => void;
  onToggleAngles: () => void;
  onToggleLonePairs: () => void;
  onToggleAtomLabels: () => void;
};

export function FloatingToolbar({
  autoRotate,
  showAngles,
  showLonePairs,
  showAtomLabels,
  onToggleAutoRotate,
  onToggleAngles,
  onToggleLonePairs,
  onToggleAtomLabels,
}: FloatingToolbarProps) {
  return (
    <div
      className="chem-control-console"
      data-floating-toolbar
    >
      <div className="chem-control-grid">
        <Button
          variant={autoRotate ? "default" : "ghost"}
          size="sm"
          onClick={onToggleAutoRotate}
          className="chem-touch-button"
          title="自动旋转"
        >
          <RotateCcw className={`mr-1.5 h-4 w-4 ${autoRotate ? "animate-spin-slow" : ""}`} />
          旋转
        </Button>
        <Button
          variant={showAngles ? "default" : "ghost"}
          size="sm"
          onClick={onToggleAngles}
          className="chem-touch-button"
          title="显示/隐藏键角"
        >
          <Move3d className="mr-1.5 h-4 w-4" />
          键角
        </Button>
        <Button
          variant={showLonePairs ? "default" : "ghost"}
          size="sm"
          onClick={onToggleLonePairs}
          className="chem-touch-button"
          title="显示/隐藏孤电子对"
        >
          <Orbit className="mr-1.5 h-4 w-4" />
          孤电子对
        </Button>
        <Button
          variant={showAtomLabels ? "default" : "ghost"}
          size="sm"
          onClick={onToggleAtomLabels}
          className="chem-touch-button"
          title="显示/隐藏原子标记"
        >
          <CircleDot className="mr-1.5 h-4 w-4" />
          标记
        </Button>
      </div>
    </div>
  );
}
