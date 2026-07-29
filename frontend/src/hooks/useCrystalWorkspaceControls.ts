import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Crystal Workspace 工作台控制状态（T-028B）。
//
// 与 useCrystalControls（教材教学模式的 viewMode/modelStyle/voidStage/labels）
// 分离：本 hook 只管「周期探索模式」专属状态——是否进入周期探索、超晶胞尺寸、
// 晶胞边框模式。教材教学模式的状态不受本 hook 影响。
//
// 模块 ID 变化时（SPA 切换模块）自动重置为默认值 teaching/2/outer。
// 不提前加入粒子选择、配位隔离、自由模式、相机状态、保存状态——这些属于 T-028C/D。
// ---------------------------------------------------------------------------

export type CrystalWorkspaceMode = "teaching" | "periodic";
export type CrystalSupercellSize = 1 | 2 | 3;
export type CrystalCellFrameMode = "outer" | "all" | "hidden";

export type CrystalWorkspaceControls = {
  workspaceMode: CrystalWorkspaceMode;
  supercellSize: CrystalSupercellSize;
  cellFrameMode: CrystalCellFrameMode;
  enterPeriodicMode: () => void;
  exitPeriodicMode: () => void;
  setSupercellSize: (size: CrystalSupercellSize) => void;
  setCellFrameMode: (mode: CrystalCellFrameMode) => void;
};

/**
 * 管理 NaCl 周期探索工作台状态。`moduleId` 变化时重置为默认值。
 *
 * 默认：workspaceMode=teaching；进入周期探索后 supercellSize 默认 2，cellFrameMode 默认 outer。
 */
export function useCrystalWorkspaceControls(moduleId: string | undefined): CrystalWorkspaceControls {
  const [workspaceMode, setWorkspaceMode] = useState<CrystalWorkspaceMode>("teaching");
  const [supercellSize, setSupercellSize] = useState<CrystalSupercellSize>(2);
  const [cellFrameMode, setCellFrameMode] = useState<CrystalCellFrameMode>("outer");

  useEffect(() => {
    setWorkspaceMode("teaching");
    setSupercellSize(2);
    setCellFrameMode("outer");
  }, [moduleId]);

  const enterPeriodicMode = () => {
    setWorkspaceMode("periodic");
    // 进入周期探索时确保用默认周期参数（2/outer）。
    setSupercellSize(2);
    setCellFrameMode("outer");
  };
  const exitPeriodicMode = () => setWorkspaceMode("teaching");

  return {
    workspaceMode,
    supercellSize,
    cellFrameMode,
    enterPeriodicMode,
    exitPeriodicMode,
    setSupercellSize,
    setCellFrameMode,
  };
}
