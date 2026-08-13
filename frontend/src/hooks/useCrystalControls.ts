import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type {
  CrystalModelStyle,
  CrystalViewMode,
  CrystalVoidStage,
} from "@/types/molecule";

// ---------------------------------------------------------------------------
// 晶体系列 viewer 的控制状态组。
//
// 原先这些 state 与其它专题的 state 一起散落在 ModuleDetailPage，并由页面里
// 一个 40 行的 useEffect([id]) 手动逐项重置——每加一个晶体模块都可能漏掉某项。
// 这里把「状态 + setter + 派生 handler + 切模块重置」收进一个 hook，
// 让「晶体控制的默认值」只有这一个真源。
// ---------------------------------------------------------------------------

/**
 * ren3 高压氮化物默认进入压力窗口视图，其它晶体默认进入晶胞视图。
 * 这是原页面 `useEffect([id])` 里唯一一处 id 依赖的晶体初始值。
 */
function getDefaultCrystalViewMode(moduleId: string | undefined): CrystalViewMode {
  return moduleId === "ren3-high-pressure-nitride" ? "pressure" : "cell";
}

export type CrystalControlState = {
  crystalViewMode: CrystalViewMode;
  crystalModelStyle: CrystalModelStyle;
  voidStage: CrystalVoidStage;
  showCrystalLabels: boolean;
  setCrystalModelStyle: (style: CrystalModelStyle) => void;
  setVoidStage: (stage: CrystalVoidStage) => void;
  setShowCrystalLabels: Dispatch<SetStateAction<boolean>>;
  /** 切换晶体视图模式；进入 voids 模式时把空隙阶段重置回 framework（与原页面行为一致）。 */
  handleCrystalModeChange: (mode: CrystalViewMode) => void;
};

/**
 * 管理晶体 viewer 的视图模式、模型风格、空隙阶段与标签开关。
 * `moduleId` 变化时（SPA 切换模块）自动重置回该模块的默认值。
 */
export function useCrystalControls(moduleId: string | undefined): CrystalControlState {
  const [crystalViewMode, setCrystalViewMode] = useState<CrystalViewMode>(() =>
    getDefaultCrystalViewMode(moduleId),
  );
  const [crystalModelStyle, setCrystalModelStyle] = useState<CrystalModelStyle>("ballStick");
  const [voidStage, setVoidStage] = useState<CrystalVoidStage>("framework");
  const [showCrystalLabels, setShowCrystalLabels] = useState(false);

  useEffect(() => {
    setCrystalViewMode(getDefaultCrystalViewMode(moduleId));
    setCrystalModelStyle("ballStick");
    setVoidStage("framework");
    setShowCrystalLabels(false);
  }, [moduleId]);

  const handleCrystalModeChange = (mode: CrystalViewMode) => {
    setCrystalViewMode(mode);
    if (mode === "voids") {
      setVoidStage("framework");
    }
  };

  return {
    crystalViewMode,
    crystalModelStyle,
    voidStage,
    showCrystalLabels,
    setCrystalModelStyle,
    setVoidStage,
    setShowCrystalLabels,
    handleCrystalModeChange,
  };
}
