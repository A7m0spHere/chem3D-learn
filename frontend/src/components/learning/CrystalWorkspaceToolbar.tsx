import { ArrowLeft, Eye, Grid3x3, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  CrystalCellFrameMode,
  CrystalSupercellSize,
} from "@/hooks/useCrystalWorkspaceControls";

// ---------------------------------------------------------------------------
// NaCl 周期探索工作台控件条（T-028B）。
//
// 与教材教学模式共享的 CrystalModeToolbar 分离：本控件条只在「周期探索模式」下出现，
// 提供返回教学视图、切换超晶胞尺寸、切换晶胞边框三态。沿用现有 chem-control-console /
// chem-touch-button 样式，不引入新视觉系统。
// ---------------------------------------------------------------------------

type CrystalWorkspaceToolbarProps = {
  supercellSize: CrystalSupercellSize;
  cellFrameMode: CrystalCellFrameMode;
  onExitPeriodic: () => void;
  onSupercellSizeChange: (size: CrystalSupercellSize) => void;
  onCellFrameModeChange: (mode: CrystalCellFrameMode) => void;
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
  onExitPeriodic,
  onSupercellSizeChange,
  onCellFrameModeChange,
}: CrystalWorkspaceToolbarProps) {
  return (
    <div className="chem-control-console">
      <div className="chem-control-grid">
        <Button
          className="chem-touch-button"
          onClick={onExitPeriodic}
          size="sm"
          title="返回 NaCl 教学视图"
          type="button"
          variant="ghost"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          返回教学
        </Button>
        {SIZES.map((size) => {
          const isActive = size === supercellSize;
          return (
            <Button
              aria-pressed={isActive}
              className="chem-touch-button"
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
        {FRAME_MODES.map(({ id, label, icon: Icon }) => {
          const isActive = id === cellFrameMode;
          return (
            <Button
              aria-pressed={isActive}
              className="chem-touch-button"
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
    </div>
  );
}
