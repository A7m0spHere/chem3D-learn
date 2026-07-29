import { ArrowLeft, Eye, Grid3x3, Layers3, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  CrystalCellFrameMode,
  CrystalSupercellSize,
} from "@/hooks/useCrystalWorkspaceControls";

// ---------------------------------------------------------------------------
// NaCl 周期探索工作台控件条（T-028B 基础 + T-028C 选择控件）。
//
// 与教材教学模式共享的 CrystalModeToolbar 分离：本控件条只在「周期探索模式」下出现，
// 提供返回教学视图、切换超晶胞尺寸、切换晶胞边框三态。沿用现有 chem-control-console /
// chem-touch-button 样式，不引入新视觉系统。
//
// T-028C：存在选择（hasSelection）时额外显示「仅看配位层」开关与「退出选择」按钮。
// T-028D：三个控制域使用 fieldset / legend 明确分组；窄屏下各组独立换行，
// 每组按钮保持至少 44px 的触控高度。
// ---------------------------------------------------------------------------

type CrystalWorkspaceToolbarProps = {
  supercellSize: CrystalSupercellSize;
  cellFrameMode: CrystalCellFrameMode;
  /** 是否存在选择：为 true 时显示配位层控件。 */
  hasSelection: boolean;
  isolateCoordination: boolean;
  onExitPeriodic: () => void;
  onSupercellSizeChange: (size: CrystalSupercellSize) => void;
  onCellFrameModeChange: (mode: CrystalCellFrameMode) => void;
  onToggleIsolate: () => void;
  onClearSelection: () => void;
};

const SIZES: CrystalSupercellSize[] = [1, 2, 3];
const FRAME_MODES: { id: CrystalCellFrameMode; label: string; icon: typeof Eye }[] = [
  { id: "outer", label: "外边框", icon: Layers3 },
  { id: "all", label: "全部晶胞", icon: Grid3x3 },
  { id: "hidden", label: "隐藏边框", icon: Eye },
];

export function CrystalWorkspaceToolbar({
  supercellSize,
  cellFrameMode,
  hasSelection,
  isolateCoordination,
  onExitPeriodic,
  onSupercellSizeChange,
  onCellFrameModeChange,
  onToggleIsolate,
  onClearSelection,
}: CrystalWorkspaceToolbarProps) {
  return (
    <div className="chem-control-console w-full">
      <div className="flex flex-wrap items-end gap-3">
        <Button
          className="chem-touch-button !h-11 shrink-0"
          onClick={onExitPeriodic}
          size="sm"
          title="返回 NaCl 教学视图"
          type="button"
          variant="ghost"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          返回教学
        </Button>
        <fieldset
          className="min-w-0 flex-[1_1_280px] border-0 p-0"
          data-testid="workspace-size-group"
        >
          <legend className="mb-1.5 text-xs font-semibold text-text-secondary">观察范围</legend>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((size) => {
              const isActive = size === supercellSize;
              return (
                <Button
                  aria-pressed={isActive}
                  className="chem-touch-button !h-11 min-w-0 w-full px-2"
                  data-testid={`workspace-size-${size}`}
                  key={`size-${size}`}
                  onClick={() => onSupercellSizeChange(size)}
                  size="sm"
                  title={`${size}×${size}×${size} 周期超晶胞`}
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                >
                  {size}×{size}×{size}
                </Button>
              );
            })}
          </div>
        </fieldset>
        <fieldset
          className="min-w-0 flex-[1_1_300px] border-0 p-0"
          data-testid="workspace-frame-group"
        >
          <legend className="mb-1.5 text-xs font-semibold text-text-secondary">晶胞边框</legend>
          <div className="grid grid-cols-3 gap-2">
            {FRAME_MODES.map(({ id, label, icon: Icon }) => {
              const isActive = id === cellFrameMode;
              return (
                <Button
                  aria-pressed={isActive}
                  className="chem-touch-button !h-11 min-w-0 w-full px-2"
                  data-testid={`workspace-frame-${id}`}
                  key={`frame-${id}`}
                  onClick={() => onCellFrameModeChange(id)}
                  size="sm"
                  title={label}
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Button>
              );
            })}
          </div>
        </fieldset>
      </div>
      {/* 选择存在时的配位层控件，作为独立分组换行显示。 */}
      {hasSelection ? (
        <fieldset
          className="mt-3 min-w-0 border-0 border-t border-border/60 p-0 pt-2"
          data-testid="workspace-selection-group"
        >
          <legend className="px-1 text-xs font-semibold text-text-secondary">当前选择</legend>
          <div className="mt-1 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Button
              aria-pressed={isolateCoordination}
              className="chem-touch-button !h-11 min-w-0 w-full sm:w-auto"
              data-testid="workspace-isolate"
              onClick={onToggleIsolate}
              size="sm"
              title="仅显示中心离子及其第一配位层"
              type="button"
              variant={isolateCoordination ? "default" : "ghost"}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              仅看配位层
            </Button>
            <Button
              aria-label="退出当前离子选择"
              className="chem-touch-button !h-11 min-w-0 w-full sm:w-auto"
              data-testid="workspace-clear-selection"
              onClick={onClearSelection}
              size="sm"
              title="退出选择，恢复完整周期结构"
              type="button"
              variant="ghost"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              退出选择
            </Button>
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}
