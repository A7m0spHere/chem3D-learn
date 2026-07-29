import { useCallback, useEffect, useState } from "react";
import type { NaClDisplaySelection } from "@/components/three/naclPeriodicGeometry";

// ---------------------------------------------------------------------------
// Crystal Workspace 工作台控制状态（T-028B / T-028C）。
//
// 与 useCrystalControls（教材教学模式的 viewMode/modelStyle/voidStage/labels）
// 分离：本 hook 只管「周期探索模式」专属状态——是否进入周期探索、超晶胞尺寸、
// 晶胞边框模式，以及 T-028C 新增的粒子选择与第一配位层隔离。教材教学模式的状态
// 不受本 hook 影响。
//
// T-028C 选择身份（重要）：selectedDisplay 是 `siteId + periodicImageShift`，
// 不是单个 siteId——同一 canonical site 可以同时以 shift=[0,0,0] 本体与非零边界
// 副本出现在画面里，点击哪个显示副本就以哪个为中心。
//
// 重置规则：以下操作必须清除选择并关闭隔离——
//   - 修改 supercellSize（用封装的 setWorkspaceSupercellSize，绝不暴露裸 setter）；
//   - 进入 / 退出周期探索；
//   - 切换模块 ID（SPA 切换模块）。
// 仅修改晶胞边框模式（cellFrameMode）不清除选择。
// 不提前加入自由模式、相机状态、保存状态——这些属于 T-028D。
// ---------------------------------------------------------------------------

export type CrystalWorkspaceMode = "teaching" | "periodic";
export type CrystalSupercellSize = 1 | 2 | 3;
export type CrystalCellFrameMode = "outer" | "all" | "hidden";

export type CrystalWorkspaceControls = {
  workspaceMode: CrystalWorkspaceMode;
  supercellSize: CrystalSupercellSize;
  cellFrameMode: CrystalCellFrameMode;
  // T-028C：粒子选择与第一配位层隔离。
  selectedDisplay: NaClDisplaySelection | null;
  isolateCoordination: boolean;
  enterPeriodicMode: () => void;
  exitPeriodicMode: () => void;
  setSupercellSize: (size: CrystalSupercellSize) => void;
  setCellFrameMode: (mode: CrystalCellFrameMode) => void;
  selectDisplay: (selection: NaClDisplaySelection) => void;
  clearSelection: () => void;
  setIsolateCoordination: (value: boolean) => void;
  toggleIsolateCoordination: () => void;
};

const DEFAULT_SIZE: CrystalSupercellSize = 2;
const DEFAULT_FRAME: CrystalCellFrameMode = "outer";

/**
 * 管理 NaCl 周期探索工作台状态。`moduleId` 变化时重置为默认值。
 *
 * 默认：workspaceMode=teaching；进入周期探索后 supercellSize 默认 2，cellFrameMode 默认 outer；
 * 无选择、不隔离。
 */
export function useCrystalWorkspaceControls(moduleId: string | undefined): CrystalWorkspaceControls {
  const [workspaceMode, setWorkspaceMode] = useState<CrystalWorkspaceMode>("teaching");
  const [supercellSize, setSupercellSizeState] = useState<CrystalSupercellSize>(DEFAULT_SIZE);
  const [cellFrameMode, setCellFrameMode] = useState<CrystalCellFrameMode>(DEFAULT_FRAME);
  const [selectedDisplay, setSelectedDisplay] = useState<NaClDisplaySelection | null>(null);
  const [isolateCoordination, setIsolateCoordinationState] = useState(false);

  // 清除选择 = 取消选中 + 关闭隔离。多个重置路径复用。
  const clearSelection = useCallback(() => {
    setSelectedDisplay(null);
    setIsolateCoordinationState(false);
  }, []);

  // 模块切换：重置全部工作台状态（教学/2/outer + 清空选择）。
  useEffect(() => {
    setWorkspaceMode("teaching");
    setSupercellSizeState(DEFAULT_SIZE);
    setCellFrameMode(DEFAULT_FRAME);
    setSelectedDisplay(null);
    setIsolateCoordinationState(false);
  }, [moduleId]);

  const enterPeriodicMode = useCallback(() => {
    setWorkspaceMode("periodic");
    // 进入周期探索时用默认周期参数（2/outer），并清空任何遗留选择。
    setSupercellSizeState(DEFAULT_SIZE);
    setCellFrameMode(DEFAULT_FRAME);
    clearSelection();
  }, [clearSelection]);

  const exitPeriodicMode = useCallback(() => {
    setWorkspaceMode("teaching");
    clearSelection();
  }, [clearSelection]);

  // 封装的 size setter：改变尺寸时结构整体变化，旧选择失效 → 清空选择与隔离。
  const setSupercellSize = useCallback(
    (size: CrystalSupercellSize) => {
      setSupercellSizeState(size);
      clearSelection();
    },
    [clearSelection],
  );

  const selectDisplay = useCallback((selection: NaClDisplaySelection) => {
    setSelectedDisplay(selection);
  }, []);

  const setIsolateCoordination = useCallback((value: boolean) => {
    setIsolateCoordinationState(value);
  }, []);

  const toggleIsolateCoordination = useCallback(() => {
    setIsolateCoordinationState((value) => !value);
  }, []);

  return {
    workspaceMode,
    supercellSize,
    cellFrameMode,
    selectedDisplay,
    isolateCoordination,
    enterPeriodicMode,
    exitPeriodicMode,
    setSupercellSize,
    setCellFrameMode,
    selectDisplay,
    clearSelection,
    setIsolateCoordination,
    toggleIsolateCoordination,
  };
}
