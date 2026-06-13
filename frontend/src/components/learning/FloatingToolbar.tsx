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
      className="w-full rounded-2xl border border-border/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur"
      data-floating-toolbar
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant={autoRotate ? "default" : "ghost"}
          size="sm"
          onClick={onToggleAutoRotate}
          className="min-w-[112px] rounded-full px-3 whitespace-nowrap"
          title="自动旋转"
        >
          <RotateCcw className={`mr-1.5 h-4 w-4 ${autoRotate ? "animate-spin-slow" : ""}`} />
          旋转
        </Button>
        <Button
          variant={showAngles ? "default" : "ghost"}
          size="sm"
          onClick={onToggleAngles}
          className="min-w-[112px] rounded-full px-3 whitespace-nowrap"
          title="显示/隐藏键角"
        >
          <Move3d className="mr-1.5 h-4 w-4" />
          键角
        </Button>
        <Button
          variant={showLonePairs ? "default" : "ghost"}
          size="sm"
          onClick={onToggleLonePairs}
          className="min-w-[112px] rounded-full px-3 whitespace-nowrap"
          title="显示/隐藏孤电子对"
        >
          <Orbit className="mr-1.5 h-4 w-4" />
          孤电子对
        </Button>
        <Button
          variant={showAtomLabels ? "default" : "ghost"}
          size="sm"
          onClick={onToggleAtomLabels}
          className="min-w-[112px] rounded-full px-3 whitespace-nowrap"
          title="显示/隐藏原子标记"
        >
          <CircleDot className="mr-1.5 h-4 w-4" />
          标记
        </Button>
      </div>
    </div>
  );
}
