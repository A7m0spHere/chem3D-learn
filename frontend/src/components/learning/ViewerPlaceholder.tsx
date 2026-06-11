import { Atom, Eye, EyeOff, Pause, Play, Rotate3D, ZoomIn } from "lucide-react";
import type { MockMoleculeRecord } from "@/data/mockMolecules";
import { Button } from "@/components/ui/button";

type ViewerPlaceholderProps = {
  molecule: MockMoleculeRecord;
  autoRotate: boolean;
  showAngles: boolean;
  showLonePairs: boolean;
  onToggleAutoRotate: () => void;
  onToggleAngles: () => void;
  onToggleLonePairs: () => void;
};

export function ViewerPlaceholder({
  molecule,
  autoRotate,
  showAngles,
  showLonePairs,
  onToggleAutoRotate,
  onToggleAngles,
  onToggleLonePairs,
}: ViewerPlaceholderProps) {
  const hasLonePairs = molecule.lonePairs.length > 0;
  const visibleAngle = molecule.keyAngles[0];

  return (
    <section className="flex min-h-[430px] flex-1 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-panel lg:min-h-[640px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">3D Viewer 占位区</h2>
          <p className="text-sm text-text-secondary">正式 3D 模型后续使用 React Three Fiber 接入</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5">
            <Rotate3D className="h-4 w-4" aria-hidden="true" />
            旋转
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5">
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
            缩放
          </span>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_center,#ffffff_0%,#f7faf9_62%,#e8f3f0_100%)] p-5">
        <div className="absolute inset-6 rounded-lg border border-dashed border-border" />
        <div className="absolute left-5 top-5 rounded-md border border-border bg-white/85 px-3 py-2 text-xs text-text-secondary shadow-sm">
          拖拽旋转和滚轮缩放将在正式 Viewer 中启用
        </div>

        <div className="relative flex h-full min-h-[330px] items-center justify-center">
          <div
            className={`relative flex h-64 w-64 items-center justify-center rounded-full border border-primary/30 bg-white/75 shadow-panel sm:h-80 sm:w-80 ${
              autoRotate ? "animate-spin [animation-duration:18s]" : ""
            }`}
          >
            <div className="absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-border" />
            <div className="absolute inset-y-8 left-1/2 w-0.5 -translate-x-1/2 bg-border" />
            <div className="z-10 flex h-20 w-20 items-center justify-center rounded-full border border-primary bg-primary text-lg font-bold text-white shadow-panel">
              {molecule.atoms[0]?.label ?? molecule.formula}
            </div>

            {molecule.atoms.slice(1, 7).map((atom, index) => {
              const positions = [
                "left-1/2 top-4 -translate-x-1/2",
                "right-8 top-20",
                "right-8 bottom-20",
                "left-1/2 bottom-4 -translate-x-1/2",
                "left-8 bottom-20",
                "left-8 top-20",
              ];

              return (
                <div
                  key={atom.id}
                  className={`absolute ${positions[index]} flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white text-sm font-semibold text-text-primary shadow-sm`}
                >
                  {atom.label}
                </div>
              );
            })}

            {showLonePairs && hasLonePairs ? (
              <div className="absolute top-16 z-20 rounded-full border border-accent bg-accent/20 px-3 py-1 text-xs font-semibold text-text-primary">
                孤电子对
              </div>
            ) : null}
          </div>

          {showAngles && visibleAngle ? (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-md border border-accent bg-white px-3 py-2 text-sm font-semibold text-primary-dark shadow-sm">
              关键键角：{visibleAngle.label}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Atom className="h-4 w-4 text-primary" aria-hidden="true" />
          {molecule.formula} · {molecule.geometryZh}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={autoRotate ? "default" : "secondary"} onClick={onToggleAutoRotate}>
            {autoRotate ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {autoRotate ? "暂停旋转" : "自动旋转"}
          </Button>
          <Button size="sm" variant={showAngles ? "default" : "secondary"} onClick={onToggleAngles}>
            {showAngles ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            {showAngles ? "隐藏键角" : "显示键角"}
          </Button>
          <Button
            disabled={!hasLonePairs}
            size="sm"
            variant={showLonePairs ? "default" : "secondary"}
            onClick={onToggleLonePairs}
          >
            {showLonePairs ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            {hasLonePairs ? "孤电子对" : "无孤电子对"}
          </Button>
        </div>
      </div>
    </section>
  );
}
