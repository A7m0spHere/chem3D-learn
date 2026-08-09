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
          aria-pressed={autoRotate}
          variant={autoRotate ? "default" : "ghost"}
          size="sm"
          className="chem-touch-button !h-11"
          data-testid="molecule-toggle-auto-rotate"
          onClick={onToggleAutoRotate}
          title={`自动旋转（${autoRotate ? "已开启" : "已关闭"}）`}
          type="button"
        >
          <RotateCcw className={`mr-1.5 h-4 w-4 ${autoRotate ? "animate-spin-slow" : ""}`} />
          旋转
          <span aria-hidden="true" className="ml-auto text-xs font-medium">{autoRotate ? "已开" : "已关"}</span>
        </Button>
        <Button
          aria-pressed={showAngles}
          variant={showAngles ? "default" : "ghost"}
          size="sm"
          className="chem-touch-button !h-11"
          data-testid="molecule-toggle-angles"
          onClick={onToggleAngles}
          title={`显示/隐藏键角（${showAngles ? "已开启" : "已关闭"}）`}
          type="button"
        >
          <Move3d className="mr-1.5 h-4 w-4" />
          键角
          <span aria-hidden="true" className="ml-auto text-xs font-medium">{showAngles ? "已开" : "已关"}</span>
        </Button>
        <Button
          aria-pressed={showLonePairs}
          variant={showLonePairs ? "default" : "ghost"}
          size="sm"
          className="chem-touch-button !h-11"
          data-testid="molecule-toggle-lone-pairs"
          onClick={onToggleLonePairs}
          title={`显示/隐藏孤电子对（${showLonePairs ? "已开启" : "已关闭"}）`}
          type="button"
        >
          <Orbit className="mr-1.5 h-4 w-4" />
          孤电子对
          <span aria-hidden="true" className="ml-auto text-xs font-medium">{showLonePairs ? "已开" : "已关"}</span>
        </Button>
        <Button
          aria-pressed={showAtomLabels}
          variant={showAtomLabels ? "default" : "ghost"}
          size="sm"
          className="chem-touch-button !h-11"
          data-testid="molecule-toggle-atom-labels"
          onClick={onToggleAtomLabels}
          title={`显示/隐藏原子标记（${showAtomLabels ? "已开启" : "已关闭"}）`}
          type="button"
        >
          <CircleDot className="mr-1.5 h-4 w-4" />
          标记
          <span aria-hidden="true" className="ml-auto text-xs font-medium">{showAtomLabels ? "已开" : "已关"}</span>
        </Button>
      </div>
    </div>
  );
}
