import { Cloud, Eye, MoveRight, Orbit, Share2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBondingBasicsLesson } from "@/data/bondingBasics";
import type {
  BondingBasicsMode,
  BondingBasicsModuleId,
  HybridOrbitalControls,
  HybridRenderMode,
} from "@/data/bondingBasics";

type BondingBasicsToolbarProps = {
  moduleId: BondingBasicsModuleId;
  activeMode: BondingBasicsMode;
  onModeChange: (mode: BondingBasicsMode) => void;
  hybridControls?: HybridOrbitalControls;
  onHybridProgressChange?: (progress: number) => void;
  onHybridRenderModeChange?: (mode: HybridRenderMode) => void;
  onToggleHybridUnhybridizedP?: () => void;
  onToggleHybridAxes?: () => void;
};

export function BondingBasicsToolbar({
  moduleId,
  activeMode,
  onModeChange,
  hybridControls,
  onHybridProgressChange,
  onHybridRenderModeChange,
  onToggleHybridUnhybridizedP,
  onToggleHybridAxes,
}: BondingBasicsToolbarProps) {
  const lesson = getBondingBasicsLesson(moduleId);
  const showHybridControls = moduleId === "hybrid-orbitals-sp" && hybridControls != null;

  return (
    <div className="chem-control-console">
      <div className="chem-control-grid">
        {lesson.modes.map((mode) => {
          const Icon = getModeIcon(mode.id);
          const isActive = mode.id === activeMode;
          return (
            <Button
              aria-pressed={isActive}
              className="chem-touch-button !h-11 w-full sm:w-auto"
              data-testid={`bonding-basics-mode-${mode.id}`}
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              size="sm"
              title={mode.title}
              type="button"
              variant={isActive ? "default" : "ghost"}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {mode.label}
            </Button>
          );
        })}
      </div>
      {showHybridControls ? (
        <HybridControls
          activeMode={activeMode}
          controls={hybridControls}
          onProgressChange={onHybridProgressChange}
          onRenderModeChange={onHybridRenderModeChange}
          onToggleAxes={onToggleHybridAxes}
          onToggleUnhybridizedP={onToggleHybridUnhybridizedP}
        />
      ) : null}
    </div>
  );
}

function getModeIcon(mode: BondingBasicsMode) {
  if (mode === "transfer" || mode === "overlap") return MoveRight;
  if (mode === "formed" || mode === "lattice") return Share2;
  return Orbit;
}

function HybridControls({
  activeMode,
  controls,
  onProgressChange,
  onRenderModeChange,
  onToggleAxes,
  onToggleUnhybridizedP,
}: {
  activeMode: BondingBasicsMode;
  controls: HybridOrbitalControls;
  onProgressChange?: (progress: number) => void;
  onRenderModeChange?: (mode: HybridRenderMode) => void;
  onToggleAxes?: () => void;
  onToggleUnhybridizedP?: () => void;
}) {
  const canShowUnhybridizedP = activeMode === "sp" || activeMode === "sp2";

  return (
    <div className="chem-hybrid-controls mt-2 grid gap-2 border-t border-border/80 pt-2 sm:grid-cols-[minmax(240px,1fr)_auto] sm:items-center">
      <label
        className="flex min-w-0 flex-col gap-1 rounded-xl bg-background/70 px-3 py-2 text-xs font-semibold text-text-secondary"
        htmlFor="hybrid-progress"
      >
        <span className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />
            杂化进度
          </span>
          <span className="tabular-nums text-primary-dark" data-testid="hybrid-progress-value">
            {controls.progress}%
          </span>
        </span>
        <input
          aria-label="杂化进度"
          className="h-2 w-full cursor-pointer accent-primary"
          data-testid="hybrid-progress-slider"
          id="hybrid-progress"
          max={100}
          min={0}
          onChange={(event) => onProgressChange?.(Number(event.currentTarget.value))}
          step={5}
          type="range"
          value={controls.progress}
        />
      </label>

      <div className="chem-hybrid-actions grid grid-cols-2 gap-2 sm:flex sm:items-center">
        <Button
          aria-pressed={controls.renderMode === "solid"}
          className="chem-touch-button !h-11 min-w-0 px-3"
          data-testid="hybrid-render-solid"
          onClick={() => onRenderModeChange?.("solid")}
          size="sm"
          title="用连续实体面显示杂化轨道"
          type="button"
          variant={controls.renderMode === "solid" ? "default" : "ghost"}
        >
          <Orbit className="h-4 w-4" aria-hidden="true" />
          实体轨道
        </Button>
        <Button
          aria-pressed={controls.renderMode === "cloud"}
          className="chem-touch-button !h-11 min-w-0 px-3"
          data-testid="hybrid-render-cloud"
          onClick={() => onRenderModeChange?.("cloud")}
          size="sm"
          title="用采样点显示电子云分布"
          type="button"
          variant={controls.renderMode === "cloud" ? "default" : "ghost"}
        >
          <Cloud className="h-4 w-4" aria-hidden="true" />
          电子云
        </Button>
        <Button
          aria-pressed={controls.showUnhybridizedP && canShowUnhybridizedP}
          className="chem-touch-button !h-11 min-w-0 px-3"
          data-testid="hybrid-toggle-unhybridized-p"
          disabled={!canShowUnhybridizedP}
          onClick={onToggleUnhybridizedP}
          size="sm"
          title={canShowUnhybridizedP ? "显示或隐藏未杂化 p 轨道" : "sp³ 中没有剩余未杂化 p 轨道"}
          type="button"
          variant={controls.showUnhybridizedP && canShowUnhybridizedP ? "default" : "ghost"}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          {canShowUnhybridizedP ? "未杂化 p" : "无 p 轨道"}
        </Button>
        <Button
          aria-pressed={controls.showAxes}
          className="chem-touch-button !h-11 min-w-0 px-3"
          data-testid="hybrid-toggle-axes"
          onClick={onToggleAxes}
          size="sm"
          title="显示或隐藏 X/Y/Z 坐标轴"
          type="button"
          variant={controls.showAxes ? "default" : "ghost"}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          XYZ
        </Button>
      </div>
    </div>
  );
}
