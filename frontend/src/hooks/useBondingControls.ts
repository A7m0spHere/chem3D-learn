import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  getDefaultBondingBasicsMode,
  isBondingBasicsModuleId,
  type BondingBasicsMode,
  type HybridRenderMode,
} from "@/data/bondingBasics";
import type { PiBondMode, SigmaBondMode } from "@/data/sigmaPiBonds";
import type { MolecularPolarityMode } from "@/data/molecularPolarity";

// ---------------------------------------------------------------------------
// 成键 / 杂化 / 极性专题 viewer 的控制状态组。
//
// 汇集 σ 键、π 键、杂化轨道（sp/sp²/sp³、离子键、配位键）以及分子极性判断的状态。
// 其中只有 bondingBasicsMode 的默认值依赖 moduleId（不同专题的首个模式不同），
// 其余为静态默认。切模块时按此规则统一重置。
// ---------------------------------------------------------------------------

/**
 * 杂化 / 成键专题的默认模式随模块而变：可识别的成键专题取其首个模式，
 * 其余（含 σ/π/极性等不使用该状态的模块）回退到 "sp"。
 * 这是原页面 `useEffect([id])` 里第二处 id 依赖初始值。
 */
function getDefaultBondingMode(moduleId: string | undefined): BondingBasicsMode {
  if (moduleId && isBondingBasicsModuleId(moduleId)) {
    return getDefaultBondingBasicsMode(moduleId);
  }
  return "sp";
}

export type BondingControls = {
  sigmaBondMode: SigmaBondMode;
  piBondMode: PiBondMode;
  piBondPlaying: boolean;
  showSigmaPiBondLabels: boolean;
  bondingBasicsMode: BondingBasicsMode;
  hybridProgress: number;
  hybridRenderMode: HybridRenderMode;
  showHybridUnhybridizedP: boolean;
  showHybridAxes: boolean;
  molecularPolarityMode: MolecularPolarityMode;
  setSigmaBondMode: (mode: SigmaBondMode) => void;
  setPiBondMode: (mode: PiBondMode) => void;
  setPiBondPlaying: Dispatch<SetStateAction<boolean>>;
  setShowSigmaPiBondLabels: Dispatch<SetStateAction<boolean>>;
  setBondingBasicsMode: (mode: BondingBasicsMode) => void;
  setHybridProgress: (progress: number) => void;
  setHybridRenderMode: (mode: HybridRenderMode) => void;
  setShowHybridUnhybridizedP: Dispatch<SetStateAction<boolean>>;
  setShowHybridAxes: Dispatch<SetStateAction<boolean>>;
  setMolecularPolarityMode: (mode: MolecularPolarityMode) => void;
};

/**
 * 管理 σ/π 键、杂化轨道与分子极性专题的控制状态。
 * `moduleId` 变化时（SPA 切换模块）自动重置回该模块的默认值。
 */
export function useBondingControls(moduleId: string | undefined): BondingControls {
  const [sigmaBondMode, setSigmaBondMode] = useState<SigmaBondMode>("ss");
  const [piBondMode, setPiBondMode] = useState<PiBondMode>("before");
  const [piBondPlaying, setPiBondPlaying] = useState(false);
  const [showSigmaPiBondLabels, setShowSigmaPiBondLabels] = useState(false);
  const [bondingBasicsMode, setBondingBasicsMode] = useState<BondingBasicsMode>(() =>
    getDefaultBondingMode(moduleId),
  );
  const [hybridProgress, setHybridProgress] = useState(100);
  const [hybridRenderMode, setHybridRenderMode] = useState<HybridRenderMode>("solid");
  const [showHybridUnhybridizedP, setShowHybridUnhybridizedP] = useState(true);
  const [showHybridAxes, setShowHybridAxes] = useState(true);
  const [molecularPolarityMode, setMolecularPolarityMode] =
    useState<MolecularPolarityMode>("electronegativity");

  useEffect(() => {
    setSigmaBondMode("ss");
    setPiBondMode("before");
    setPiBondPlaying(false);
    setShowSigmaPiBondLabels(false);
    setBondingBasicsMode(getDefaultBondingMode(moduleId));
    setHybridProgress(100);
    setHybridRenderMode("solid");
    setShowHybridUnhybridizedP(true);
    setShowHybridAxes(true);
    setMolecularPolarityMode("electronegativity");
  }, [moduleId]);

  return {
    sigmaBondMode,
    piBondMode,
    piBondPlaying,
    showSigmaPiBondLabels,
    bondingBasicsMode,
    hybridProgress,
    hybridRenderMode,
    showHybridUnhybridizedP,
    showHybridAxes,
    molecularPolarityMode,
    setSigmaBondMode,
    setPiBondMode,
    setPiBondPlaying,
    setShowSigmaPiBondLabels,
    setBondingBasicsMode,
    setHybridProgress,
    setHybridRenderMode,
    setShowHybridUnhybridizedP,
    setShowHybridAxes,
    setMolecularPolarityMode,
  };
}
