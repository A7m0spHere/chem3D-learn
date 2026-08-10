import { Suspense, lazy, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { ChevronRight, Home, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";

// 3D viewers 按需懒加载：使 three.js / R3F 不进入首页、考试页等非 3D 页面的初始包。
const MoleculeViewer = lazy(() =>
  import("@/components/three/MoleculeViewer").then((m) => ({ default: m.MoleculeViewer })),
);
const NaClCell = lazy(() =>
  import("@/components/three/NaClCell").then((m) => ({ default: m.NaClCell })),
);
// T-028B：NaCl 周期探索 Viewer 与教学 Viewer 并存，同样按需懒加载，避免首页下载 3D chunk。
const NaClPeriodicCell = lazy(() =>
  import("@/components/three/NaClPeriodicCell").then((m) => ({ default: m.NaClPeriodicCell })),
);
const CsClCell = lazy(() =>
  import("@/components/three/CsClCell").then((m) => ({ default: m.CsClCell })),
);
const SodiumMetalCell = lazy(() =>
  import("@/components/three/SodiumMetalCell").then((m) => ({ default: m.SodiumMetalCell })),
);
const DiamondCell = lazy(() =>
  import("@/components/three/DiamondCell").then((m) => ({ default: m.DiamondCell })),
);
const ZincMetalCell = lazy(() =>
  import("@/components/three/ZincMetalCell").then((m) => ({ default: m.ZincMetalCell })),
);
const MetalClosePackingCell = lazy(() =>
  import("@/components/three/MetalClosePackingCell").then((m) => ({ default: m.MetalClosePackingCell })),
);
const ZnSPolytypeCell = lazy(() =>
  import("@/components/three/ZnSPolytypeCell").then((m) => ({ default: m.ZnSPolytypeCell })),
);
const Mof5Cell = lazy(() =>
  import("@/components/three/Mof5Cell").then((m) => ({ default: m.Mof5Cell })),
);
const MxeneCell = lazy(() =>
  import("@/components/three/MxeneCell").then((m) => ({ default: m.MxeneCell })),
);
const Ren3Cell = lazy(() =>
  import("@/components/three/Ren3Cell").then((m) => ({ default: m.Ren3Cell })),
);
const VoidStructureCell = lazy(() =>
  import("@/components/three/VoidStructureCell").then((m) => ({ default: m.VoidStructureCell })),
);
const GraphiteCell = lazy(() =>
  import("@/components/three/GraphiteCell").then((m) => ({ default: m.GraphiteCell })),
);
const PbaCell = lazy(() =>
  import("@/components/three/PbaCell").then((m) => ({ default: m.PbaCell })),
);
const CaF2Cell = lazy(() =>
  import("@/components/three/CaF2Cell").then((m) => ({ default: m.CaF2Cell })),
);
const BaTiO3Cell = lazy(() =>
  import("@/components/three/BaTiO3Cell").then((m) => ({ default: m.BaTiO3Cell })),
);
const OrganicCoplanarViewer = lazy(() =>
  import("@/components/three/OrganicCoplanarViewer").then((m) => ({ default: m.OrganicCoplanarViewer })),
);
const EthylenePlanarCell = lazy(() =>
  import("@/components/three/EthylenePlanarCell").then((m) => ({ default: m.EthylenePlanarCell })),
);
const BenzenePlanarCell = lazy(() =>
  import("@/components/three/BenzenePlanarCell").then((m) => ({ default: m.BenzenePlanarCell })),
);
const AcetyleneLinearCell = lazy(() =>
  import("@/components/three/AcetyleneLinearCell").then((m) => ({ default: m.AcetyleneLinearCell })),
);
const SigmaPiBondCell = lazy(() =>
  import("@/components/three/SigmaPiBondCell").then((m) => ({ default: m.SigmaPiBondCell })),
);
const BondingBasicsCell = lazy(() =>
  import("@/components/three/BondingBasicsCell").then((m) => ({ default: m.BondingBasicsCell })),
);
const MolecularPolarityCell = lazy(() =>
  import("@/components/three/MolecularPolarityCell").then((m) => ({ default: m.MolecularPolarityCell })),
);
import { ModulePlaceholderViewer } from "@/components/three/ModulePlaceholderViewer";
import { CrystalKnowledgePanel } from "@/components/learning/CrystalKnowledgePanel";
import { CrystalModeToolbar } from "@/components/learning/CrystalModeToolbar";
// T-028B：NaCl 周期探索 UI 与教学 panel 分离。
import { CrystalWorkspaceToolbar } from "@/components/learning/CrystalWorkspaceToolbar";
import { NaClPeriodicPanel } from "@/components/learning/NaClPeriodicPanel";
import { OrganicCoplanarToolbar } from "@/components/learning/OrganicCoplanarToolbar";
import { EthylenePlanarToolbar } from "@/components/learning/EthylenePlanarToolbar";
import { BenzenePlanarToolbar } from "@/components/learning/BenzenePlanarToolbar";
import { AcetyleneLinearToolbar } from "@/components/learning/AcetyleneLinearToolbar";
import { SigmaPiBondToolbar } from "@/components/learning/SigmaPiBondToolbar";
import { BondingBasicsToolbar } from "@/components/learning/BondingBasicsToolbar";
import { MolecularPolarityToolbar } from "@/components/learning/MolecularPolarityToolbar";
import { FloatingToolbar } from "@/components/learning/FloatingToolbar";
import { SpecialtyInfoDisclosure } from "@/components/learning/SpecialtyInfoDisclosure";
import { StructureInfoDisclosure } from "@/components/learning/StructureInfoDisclosure";
import { ViewerErrorBoundary } from "@/components/common/ViewerErrorBoundary";

import { getModuleById } from "@/data/learningModules";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useCrystalControls } from "@/hooks/useCrystalControls";
// T-028B：周期探索工作台状态，与教材教学控制状态分离。
import { useCrystalWorkspaceControls } from "@/hooks/useCrystalWorkspaceControls";
// T-028C：NaCl 第一配位层纯函数。geometry 模块无 Three.js 依赖，页面层导入不会
// 让首页提前加载 R3F/Three chunk。cluster 在页面层 useMemo 生成，供 Viewer 与 Panel 共用。
import {
  buildNaClCoordinationDisplayCluster,
  generateNaClDisplayInstances,
  generateNaClPeriodicSites,
} from "@/components/three/naclPeriodicGeometry";
import { useOrganicPlanarControls } from "@/hooks/useOrganicPlanarControls";
import { useBondingControls } from "@/hooks/useBondingControls";
import type { OrganicBuilderNavigationState } from "@/types/organicBuilder";
import {
  getMockMolecule,
  getRealMoleculeData,
  mergeMoleculeData,
  type MockMoleculeRecord,
} from "@/data/mockMolecules";
import { ModuleCard } from "@/components/home/ModuleCard";
import { learningModules } from "@/data/learningModules";
import {
  getBondingBasicsLesson,
  getBondingBasicsModeInfo,
  isBondingBasicsModuleId,
  type HybridOrbitalControls,
} from "@/data/bondingBasics";
import { getMolecularPolarityModeInfo } from "@/data/molecularPolarity";
import { getOrbitalBondLesson, getOrbitalBondModeInfo } from "@/data/sigmaPiBonds";
import { getEthylenePlanarModeInfo } from "@/data/ethylenePlanar";
import { getBenzenePlanarModeInfo } from "@/data/benzenePlanar";
import { getAcetyleneLinearModeInfo } from "@/data/acetyleneLinear";
import { getOrganicCoplanarModeInfo } from "@/data/organicCoplanar";

// ---------------------------------------------------------------------------
// Viewer 注册表：用单一 viewerKind 判别取代原先散落在 viewer/toolbar/panel
// 三处 ternary 里的十多个 uses*Viewer 布尔。新增一个 3D 模块只需在这里加一行。
// ---------------------------------------------------------------------------

type ViewerKind =
  | "polarity"
  | "sigma-bond"
  | "pi-bond"
  | "bonding-basics"
  | "ethylene"
  | "benzene"
  | "acetylene"
  | "organic-coplanar"
  | "crystal-nacl"
  | "crystal-cscl"
  | "crystal-sodium"
  | "crystal-diamond"
  | "crystal-zinc"
  | "crystal-void"
  | "crystal-graphite"
  | "crystal-pba"
  | "crystal-caf2"
  | "crystal-batio3"
  | "crystal-close-packing"
  | "crystal-zns"
  | "crystal-mof5"
  | "crystal-mxene"
  | "crystal-ren3"
  | "molecule"
  | "placeholder";

const specialtyViewerKinds = new Set<ViewerKind>([
  "polarity",
  "sigma-bond",
  "pi-bond",
  "bonding-basics",
  "ethylene",
  "benzene",
  "acetylene",
  "organic-coplanar",
]);

// 专题在 xl 以上进入 Inspector rail。杂化 / 成键基础含进度滑杆和四个附加开关，
// 使用更宽的 rail；其余专题保持较紧凑宽度。
const specialtyInspectorKinds = new Set<ViewerKind>([
  "polarity",
  "sigma-bond",
  "pi-bond",
  "bonding-basics",
  "ethylene",
  "benzene",
  "acetylene",
  "organic-coplanar",
]);

type ViewerSpec = {
  viewer: () => ReactNode;
  toolbar: () => ReactNode;
  panel: () => ReactNode;
};

// 单一来源判别当前模块用哪种 3D viewer。保持与原三段 ternary 完全一致的优先级：
// 专题模式（按 moduleData.id）→ 晶体（按 molecule.id + kind）→ 普通分子 → 占位。
function deriveViewerKind(
  moduleData: { id: string },
  molecule: { id: string; kind?: string } | null | undefined,
  usesRealViewer: boolean,
): ViewerKind {
  switch (moduleData.id) {
    case "polarity-judgment":
      return "polarity";
    case "sigma-bond-orbitals":
      return "sigma-bond";
    case "pi-bond-orbitals":
      return "pi-bond";
    case "hybrid-orbitals-sp":
    case "ionic-bond-formation":
    case "coordinate-bond-formation":
      return "bonding-basics";
    case "ethylene-planar":
      return "ethylene";
    case "benzene-planar":
      return "benzene";
    case "acetylene-linear":
      return "acetylene";
    case "organic-coplanar":
      return "organic-coplanar";
    default:
      break;
  }
  if (usesRealViewer && molecule != null && molecule.kind === "crystal") {
    switch (molecule.id) {
      case "nacl":
        return "crystal-nacl";
      case "cscl":
        return "crystal-cscl";
      case "sodium-metal":
        return "crystal-sodium";
      case "diamond":
        return "crystal-diamond";
      case "zinc-metal":
        return "crystal-zinc";
      case "octahedral-voids":
      case "tetrahedral-voids":
        return "crystal-void";
      case "graphite":
      case "hbn":
        return "crystal-graphite";
      case "pba":
        return "crystal-pba";
      case "caf2":
        return "crystal-caf2";
      case "batio3":
        return "crystal-batio3";
      case "metal-close-packing":
        return "crystal-close-packing";
      case "zns":
        return "crystal-zns";
      case "mof5":
        return "crystal-mof5";
      case "ti3c2tx":
        return "crystal-mxene";
      case "ren3":
        return "crystal-ren3";
      default:
        break;
    }
  }
  if (usesRealViewer && molecule) return "molecule";
  return "placeholder";
}

export function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const moduleData = getModuleById(id ?? "");

  // 3D logic
  const representativeModelId = moduleData?.representativeModels[0] ?? "";
  const mockMolecule = useMemo(() => {
    // Attempt to match the old ID if this module uses a real 3D model.
    // e.g. "tetrahedral-ch4" uses "ch4"
    return getMockMolecule(representativeModelId) ?? null;
  }, [representativeModelId]);

  const realMolecule = useMemo(() => {
    if (!representativeModelId) return undefined;
    return getRealMoleculeData(representativeModelId);
  }, [representativeModelId]);

  const usesRealViewer = Boolean(realMolecule);
  const molecule = useMemo(() => {
    if (mockMolecule) return mergeMoleculeData(mockMolecule, realMolecule);
    if (!realMolecule) return null;

    return {
      ...realMolecule,
      geometryZh: realMolecule.crystal?.typeZh ?? realMolecule.crystalTeaching?.modelZh ?? "晶体结构",
      categoryLabelZh: "晶体结构",
      centralAtomZh: realMolecule.crystalTeaching?.coordinationNumberZh ?? "不适用",
      lonePairsTextZh: "不适用",
      commonMistakeZh: realMolecule.crystalTeaching?.commonMistakesZh[0] ?? "",
    } satisfies MockMoleculeRecord;
  }, [mockMolecule, realMolecule]);

  const [autoRotate, setAutoRotate] = useState(false);
  const [showAngles, setShowAngles] = useState(false);
  const [showLonePairs, setShowLonePairs] = useState(false);
  const [showAtomLabels, setShowAtomLabels] = useState(false);

  // 专题控制状态按组拆进各自 hook：状态、setter、切模块重置与派生 handler 都由 hook 自管，
  // 页面不再逐项维护它们的默认值（详见各 use*Controls）。
  const {
    crystalViewMode,
    crystalModelStyle,
    voidStage,
    showCrystalLabels,
    setCrystalModelStyle,
    setVoidStage,
    setShowCrystalLabels,
    handleCrystalModeChange,
  } = useCrystalControls(id);
  // T-028B/C：NaCl 周期探索工作台状态。模块切换时自动重置为教学/2/outer 并清空选择。
  const {
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
    toggleIsolateCoordination,
  } = useCrystalWorkspaceControls(id);
  // T-028C：在页面层用纯函数算出第一配位层 cluster，Viewer 与 Panel 共享同一结果，
  // 避免在多个组件里各自复制配位算法。selectedDisplay 为 null 时不计算。
  // 放在任何 early return 之前，遵守 Hooks 规则。
  const coordinationCluster = useMemo(() => {
    if (!selectedDisplay) return null;
    try {
      const periodicSites = generateNaClPeriodicSites(supercellSize);
      const displayInstances = generateNaClDisplayInstances(periodicSites, supercellSize);
      return buildNaClCoordinationDisplayCluster(
        periodicSites,
        displayInstances,
        supercellSize,
        selectedDisplay,
      );
    } catch {
      // 选择与当前 size 不一致（例如竞态）时安全降级为无选择，不抛给渲染。
      return null;
    }
  }, [selectedDisplay, supercellSize]);
  const {
    organicCoplanarMode,
    organicVinylAligned,
    showOrganicLabels,
    ethyleneMode,
    ethylenePlaneView,
    benzeneMode,
    benzenePlaneView,
    acetyleneMode,
    acetyleneLineView,
    setOrganicCoplanarMode,
    setOrganicVinylAligned,
    setShowOrganicLabels,
    setEthyleneMode,
    setEthylenePlaneView,
    setBenzeneMode,
    setBenzenePlaneView,
    setAcetyleneMode,
    setAcetyleneLineView,
  } = useOrganicPlanarControls(id);
  const {
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
  } = useBondingControls(id);

  const [viewerLoading, setViewerLoading] = useState(false);
  const [naclTeachingReady, setNaClTeachingReady] = useState(false);
  const [pullingBuilderAtomId, setPullingBuilderAtomId] = useState<string>();
  const [builderTransitionPhase, setBuilderTransitionPhase] = useState<"idle" | "pulling" | "expanding">("idle");
  const prefersReducedMotion = useReducedMotion();
  const location = useLocation();
  // 从拼装实验室返回时（返回按钮带 viewTransition），同样给 3D 舞台挂上共享元素名，
  // 让"实验室 → 模块页"的反向过渡与进入动画对称。
  const returnedFromBuilder = Boolean(
    (location.state as { returnedFromBuilder?: boolean } | null)?.returnedFromBuilder,
  );

  const handleBuilderAtomPull = (atomId: string) => {
    if (pullingBuilderAtomId) return;
    setPullingBuilderAtomId(atomId);
    setBuilderTransitionPhase("pulling");
  };

  useEffect(() => {
    if (!moduleData?.builderSeedId) return;
    void import("@/pages/OrganicBuilderPage");
  }, [moduleData?.builderSeedId]);

  useEffect(() => {
    if (!pullingBuilderAtomId || !moduleData?.builderSeedId) return;
    const expandTimer = window.setTimeout(() => {
      setBuilderTransitionPhase("expanding");
    }, prefersReducedMotion ? 0 : 70);
    const navigateTimer = window.setTimeout(() => {
      const navigationState: OrganicBuilderNavigationState = {
        detachAtomId: pullingBuilderAtomId,
        sourceModuleId: moduleData.id,
        entryTransition: "viewer-expand",
      };
      if (!prefersReducedMotion) {
        document.documentElement.dataset.organicBuilderTransition = "viewer-expand";
      }
      navigate(`/lab/organic-builder/${moduleData.builderSeedId}`, {
        state: navigationState,
        viewTransition: !prefersReducedMotion,
      });
    }, prefersReducedMotion ? 100 : 120);
    return () => {
      window.clearTimeout(expandTimer);
      window.clearTimeout(navigateTimer);
    };
  }, [moduleData, navigate, prefersReducedMotion, pullingBuilderAtomId]);

  // 专题控制状态（晶体 / 有机平面 / 成键杂化）的切模块重置已下沉到各自 hook；
  // 这里只重置页面自留的状态：普通分子 VSEPR 开关、有机拼装过渡、viewer 载入。
  useEffect(() => {
    setShowAngles(false);
    setShowLonePairs(false);
    setShowAtomLabels(false);
    setPullingBuilderAtomId(undefined);
    setBuilderTransitionPhase("idle");
    setViewerLoading(true);
    setNaClTeachingReady(false);
    const timer = setTimeout(() => setViewerLoading(false), 300);
    return () => clearTimeout(timer);
  }, [id]);

  if (!moduleData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-60px)]">
        <h2 className="text-2xl font-bold">未找到该模块</h2>
        <Link to="/modules" className="mt-4 text-primary hover:underline">返回模块列表</Link>
      </div>
    );
  }

  const viewerKind = deriveViewerKind(moduleData, molecule, usesRealViewer);
  const usesSpecialtyInfo = specialtyViewerKinds.has(viewerKind);
  const usesSpecialtyInspector = specialtyInspectorKinds.has(viewerKind);
  const usesDenseSpecialtyInspector = viewerKind === "bonding-basics";
  const bondingBasicsModuleId = isBondingBasicsModuleId(moduleData.id)
    ? moduleData.id
    : "hybrid-orbitals-sp";
  const hybridControls = {
    progress: hybridProgress,
    renderMode: hybridRenderMode,
    showUnhybridizedP: showHybridUnhybridizedP,
    showAxes: showHybridAxes,
  } satisfies HybridOrbitalControls;
  const supportsPackingModel = molecule?.id === "zinc-metal";
  const crystalModes = molecule?.crystalTeaching?.viewModes ?? [];
  const defaultCrystalViewMode = crystalModes[0]?.id ?? "cell";
  const activeCrystalViewMode = crystalModes.some((mode) => mode.id === crystalViewMode)
    ? crystalViewMode
    : defaultCrystalViewMode;

  const relatedModules = learningModules
    .filter(
      (m) =>
        m.category === moduleData.category &&
        m.id !== moduleData.id &&
        !(moduleData.id === "sodium-metal-crystal" && m.id === "nacl-crystal") &&
        !(
          ["nacl-crystal", "cscl-crystal", "sodium-metal-crystal"].includes(moduleData.id) &&
          m.id === "diamond-crystal"
        ) &&
        !(
          moduleData.id === "diamond-crystal" &&
          ["nacl-crystal", "cscl-crystal", "sodium-metal-crystal", "octahedral-voids"].includes(m.id)
        ),
    )
    .slice(0, 3);

  // 晶体系列共用同一套 toolbar / panel，预计算后在各 crystal-* 条目复用。
  const crystalToolbar = crystalModes.length > 0 ? (
    <CrystalModeToolbar
      activeMode={activeCrystalViewMode}
      modelStyle={crystalModelStyle}
      modes={crystalModes}
      onModelStyleChange={setCrystalModelStyle}
      onModeChange={handleCrystalModeChange}
      onToggleLabels={() => setShowCrystalLabels((value) => !value)}
      showLabels={showCrystalLabels}
      supportsModelStyle={supportsPackingModel}
    />
  ) : null;
  const crystalPanel = molecule ? (
    <div className="flex-1 min-h-[400px]">
      <CrystalKnowledgePanel
        activeMode={activeCrystalViewMode}
        molecule={molecule}
        onVoidStageChange={setVoidStage}
        voidStage={voidStage}
      />
    </div>
  ) : null;

  // T-028B：NaCl 专属的「教学模式 toolbar（含周期入口）」与「周期模式 toolbar/panel」。
  // 其他晶体继续用 crystalToolbar / crystalPanel，不受影响。
  const isNaClWorkspace = viewerKind === "crystal-nacl" && workspaceMode === "periodic";
  const naclTeachingToolbar = crystalToolbar ? (
    <div className="flex flex-wrap items-center gap-2">
      {crystalToolbar}
      <Button
        className="chem-touch-button"
        data-testid="workspace-enter-periodic"
        disabled={!naclTeachingReady}
        onClick={enterPeriodicMode}
        size="sm"
        title="进入周期探索：1×1×1 / 2×2×2 / 3×3×3 周期结构"
        type="button"
        variant="ghost"
      >
        周期探索
      </Button>
    </div>
  ) : null;
  const naclPeriodicToolbar = (
    <CrystalWorkspaceToolbar
      cellFrameMode={cellFrameMode}
      hasSelection={coordinationCluster !== null}
      isolateCoordination={isolateCoordination}
      onCellFrameModeChange={setCellFrameMode}
      onClearSelection={clearSelection}
      onExitPeriodic={() => {
        setNaClTeachingReady(false);
        exitPeriodicMode();
      }}
      onSupercellSizeChange={setSupercellSize}
      onToggleIsolate={toggleIsolateCoordination}
      supercellSize={supercellSize}
    />
  );
  const naclPeriodicPanel = (
    <div className="flex-1 min-h-[400px]">
      <NaClPeriodicPanel
        cellFrameMode={cellFrameMode}
        cluster={coordinationCluster}
        isolateCoordination={isolateCoordination}
        supercellSize={supercellSize}
      />
    </div>
  );

  // 注册表：每个 kind 对应 viewer / toolbar / panel 三个渲染函数。函数体与重构前
  // 三段 ternary 中的 JSX 逐字一致，仅收敛分发逻辑。
  const viewerRegistry: Record<ViewerKind, ViewerSpec> = {
    polarity: {
      viewer: () => <MolecularPolarityCell loading={viewerLoading} mode={molecularPolarityMode} />,
      toolbar: () => (
        <MolecularPolarityToolbar
          activeMode={molecularPolarityMode}
          onModeChange={setMolecularPolarityMode}
        />
      ),
      panel: () => {
        const modeInfo = getMolecularPolarityModeInfo(molecularPolarityMode);
        return (
          <SpecialtyInfoDisclosure
            identity="分子极性"
            key={moduleData.id}
            mode={modeInfo.label}
            modelBoundary="键偶极箭头和电子云为定性示意，不表示偶极矩大小的定量计算。"
            state={modeInfo.result ? `${modeInfo.result} · ${modeInfo.state}` : modeInfo.state}
            structureType="键偶极与分子空间构型"
          />
        );
      },
    },
    "sigma-bond": {
      viewer: () => (
        <SigmaPiBondCell
          lessonType="sigma"
          loading={viewerLoading}
          mode={sigmaBondMode}
          showLabels={showSigmaPiBondLabels}
        />
      ),
      toolbar: () => (
        <SigmaPiBondToolbar
          activeMode={sigmaBondMode}
          lessonType="sigma"
          onModeChange={setSigmaBondMode}
          onToggleLabels={() => setShowSigmaPiBondLabels((value) => !value)}
          showLabels={showSigmaPiBondLabels}
        />
      ),
      panel: () => {
        const lesson = getOrbitalBondLesson("sigma");
        const modeInfo = getOrbitalBondModeInfo("sigma", sigmaBondMode);
        return (
          <SpecialtyInfoDisclosure
            identity={lesson.title}
            key={moduleData.id}
            mode={modeInfo.label}
            modelBoundary="电子云形状和重叠为定性示意。"
            state={modeInfo.state}
            structureType="轨道沿键轴正面重叠"
          />
        );
      },
    },
    "pi-bond": {
      viewer: () => (
        <SigmaPiBondCell
          lessonType="pi"
          loading={viewerLoading}
          mode={piBondMode}
          playing={piBondPlaying}
          showLabels={showSigmaPiBondLabels}
        />
      ),
      toolbar: () => (
        <SigmaPiBondToolbar
          activeMode={piBondMode}
          isPlaying={piBondPlaying}
          lessonType="pi"
          onModeChange={setPiBondMode}
          onToggleLabels={() => setShowSigmaPiBondLabels((value) => !value)}
          onTogglePlaying={() => setPiBondPlaying((value) => !value)}
          showLabels={showSigmaPiBondLabels}
        />
      ),
      panel: () => {
        const lesson = getOrbitalBondLesson("pi");
        const modeInfo = getOrbitalBondModeInfo("pi", piBondMode);
        return (
          <SpecialtyInfoDisclosure
            identity={lesson.title}
            key={moduleData.id}
            mode={modeInfo.label}
            modelBoundary="电子云形状和重叠为定性示意。"
            state={modeInfo.state}
            structureType="平行 p 轨道侧向重叠"
          />
        );
      },
    },
    "bonding-basics": {
      viewer: () => (
        <BondingBasicsCell
          hybridControls={hybridControls}
          loading={viewerLoading}
          mode={bondingBasicsMode}
          moduleId={bondingBasicsModuleId}
        />
      ),
      toolbar: () => (
        <BondingBasicsToolbar
          activeMode={bondingBasicsMode}
          hybridControls={hybridControls}
          moduleId={bondingBasicsModuleId}
          onHybridProgressChange={setHybridProgress}
          onHybridRenderModeChange={setHybridRenderMode}
          onModeChange={setBondingBasicsMode}
          onToggleHybridAxes={() => setShowHybridAxes((value) => !value)}
          onToggleHybridUnhybridizedP={() => setShowHybridUnhybridizedP((value) => !value)}
        />
      ),
      panel: () => {
        const lesson = getBondingBasicsLesson(bondingBasicsModuleId);
        const modeInfo = getBondingBasicsModeInfo(bondingBasicsModuleId, bondingBasicsMode);
        const modelBoundary = bondingBasicsModuleId === "ionic-bond-formation"
          ? "电子转移与静电吸引为定性示意，不表示能量或真实晶格计算。"
          : "电子云形状和重叠为定性示意。";
        return (
          <SpecialtyInfoDisclosure
            extraFacts={modeInfo.angleLabel
              ? [{ label: "关键几何值", value: modeInfo.angleLabel }]
              : undefined}
            identity={lesson.title}
            key={moduleData.id}
            mode={modeInfo.label}
            modelBoundary={modelBoundary}
            state={modeInfo.state}
            structureType={modeInfo.structure ?? lesson.title}
          />
        );
      },
    },
    ethylene: {
      viewer: () => (
        <EthylenePlanarCell
          loading={viewerLoading}
          mode={ethyleneMode}
          onAtomPull={moduleData.builderSeedId ? handleBuilderAtomPull : undefined}
          planeView={ethylenePlaneView}
          pullingAtomId={pullingBuilderAtomId}
        />
      ),
      toolbar: () => (
        <EthylenePlanarToolbar
          activeMode={ethyleneMode}
          onModeChange={setEthyleneMode}
          onPlaneViewChange={setEthylenePlaneView}
          planeView={ethylenePlaneView}
        />
      ),
      panel: () => {
        const modeInfo = getEthylenePlanarModeInfo(ethyleneMode);
        const state = ethyleneMode === "plane"
          ? `${modeInfo.state} · ${ethylenePlaneView === "side" ? "侧视" : "俯视"}`
          : modeInfo.state;
        return (
          <SpecialtyInfoDisclosure
            identity="乙烯平面结构"
            key={moduleData.id}
            mode={modeInfo.label}
            modelBoundary="几何与键角采用理想化典型值；轨道和 π 键显示为定性示意。"
            state={state}
            structureType="sp² 碳与 C=C 双键"
          />
        );
      },
    },
    benzene: {
      viewer: () => (
        <BenzenePlanarCell
          loading={viewerLoading}
          mode={benzeneMode}
          onAtomPull={moduleData.builderSeedId ? handleBuilderAtomPull : undefined}
          planeView={benzenePlaneView}
          pullingAtomId={pullingBuilderAtomId}
        />
      ),
      toolbar: () => (
        <BenzenePlanarToolbar
          activeMode={benzeneMode}
          onModeChange={setBenzeneMode}
          onPlaneViewChange={setBenzenePlaneView}
          planeView={benzenePlaneView}
        />
      ),
      panel: () => {
        const modeInfo = getBenzenePlanarModeInfo(benzeneMode);
        const state = benzeneMode === "plane"
          ? `${modeInfo.state} · ${benzenePlaneView === "side" ? "侧视" : "俯视"}`
          : modeInfo.state;
        return (
          <SpecialtyInfoDisclosure
            identity="苯环平面结构"
            key={moduleData.id}
            mode={modeInfo.label}
            modelBoundary="苯环几何采用理想化教学模型；π 电子云为定性示意。"
            state={state}
            structureType="sp² 苯环与离域 π 体系"
          />
        );
      },
    },
    acetylene: {
      viewer: () => (
        <AcetyleneLinearCell
          lineView={acetyleneLineView}
          loading={viewerLoading}
          mode={acetyleneMode}
          onAtomPull={moduleData.builderSeedId ? handleBuilderAtomPull : undefined}
          pullingAtomId={pullingBuilderAtomId}
        />
      ),
      toolbar: () => (
        <AcetyleneLinearToolbar
          activeMode={acetyleneMode}
          lineView={acetyleneLineView}
          onLineViewChange={setAcetyleneLineView}
          onModeChange={setAcetyleneMode}
        />
      ),
      panel: () => {
        const modeInfo = getAcetyleneLinearModeInfo(acetyleneMode);
        const state = acetyleneMode === "line"
          ? `${modeInfo.state} · ${acetyleneLineView === "side" ? "侧视" : "正视"}`
          : modeInfo.state;
        return (
          <SpecialtyInfoDisclosure
            identity="乙炔直线结构"
            key={moduleData.id}
            mode={modeInfo.label}
            modelBoundary="直线几何与键角采用理想化典型值；轨道和 π 键显示为定性示意。"
            state={state}
            structureType="sp 碳与 C≡C 三键"
          />
        );
      },
    },
    "organic-coplanar": {
      viewer: () => (
        <OrganicCoplanarViewer
          activeMode={organicCoplanarMode}
          loading={viewerLoading}
          onAtomPull={moduleData.builderSeedId ? handleBuilderAtomPull : undefined}
          pullingAtomId={pullingBuilderAtomId}
          showLabels={showOrganicLabels}
          vinylAligned={organicVinylAligned}
        />
      ),
      toolbar: () => (
        <OrganicCoplanarToolbar
          activeMode={organicCoplanarMode}
          onModeChange={setOrganicCoplanarMode}
          onToggleLabels={() => setShowOrganicLabels((value) => !value)}
          onToggleVinylAligned={() => setOrganicVinylAligned((value) => !value)}
          showLabels={showOrganicLabels}
          vinylAligned={organicVinylAligned}
        />
      ),
      panel: () => {
        const modeInfo = getOrganicCoplanarModeInfo(organicCoplanarMode);
        const state = organicCoplanarMode === "rotation"
          ? organicVinylAligned
            ? "乙烯基已与苯环平面对齐"
            : "乙烯基与苯环约成 45°"
          : modeInfo.state;
        return (
          <SpecialtyInfoDisclosure
            identity="有机共线共面"
            key={moduleData.id}
            mode={modeInfo.labelZh}
            modelBoundary="默认 45° 与“对齐平面”是几何示意，不是最低能构象的量化计算结果。"
            state={state}
            structureType="苯环、sp³、sp² 与 sp 片段"
          />
        );
      },
    },
    "crystal-nacl": {
      viewer: () =>
        molecule
          ? isNaClWorkspace
            ? (
              <NaClPeriodicCell
                cluster={coordinationCluster}
                frameMode={cellFrameMode}
                isolateCoordination={isolateCoordination}
                loading={viewerLoading}
                molecule={molecule}
                onClearSelection={clearSelection}
                onSelectInstance={selectDisplay}
                selection={selectedDisplay}
                size={supercellSize}
              />
            )
            : (
              <NaClCell
                loading={viewerLoading}
                modelStyle={crystalModelStyle}
                molecule={molecule}
                onReadyChange={setNaClTeachingReady}
                showLabels={showCrystalLabels}
                voidStage={voidStage}
                viewMode={activeCrystalViewMode}
              />
            )
          : null,
      toolbar: () => (isNaClWorkspace ? naclPeriodicToolbar : naclTeachingToolbar),
      panel: () => (isNaClWorkspace ? naclPeriodicPanel : crystalPanel),
    },
    "crystal-cscl": {
      viewer: () =>
        molecule ? (
          <CsClCell
            loading={viewerLoading}
            modelStyle={crystalModelStyle}
            molecule={molecule}
            showLabels={showCrystalLabels}
            viewMode={activeCrystalViewMode}
          />
        ) : null,
      toolbar: () => crystalToolbar,
      panel: () => crystalPanel,
    },
    "crystal-sodium": {
      viewer: () =>
        molecule ? (
          <SodiumMetalCell
            loading={viewerLoading}
            modelStyle={crystalModelStyle}
            molecule={molecule}
            showLabels={showCrystalLabels}
            viewMode={activeCrystalViewMode}
          />
        ) : null,
      toolbar: () => crystalToolbar,
      panel: () => crystalPanel,
    },
    "crystal-diamond": {
      viewer: () =>
        molecule ? (
          <DiamondCell
            loading={viewerLoading}
            modelStyle={crystalModelStyle}
            molecule={molecule}
            showLabels={showCrystalLabels}
            voidStage={voidStage}
            viewMode={activeCrystalViewMode}
          />
        ) : null,
      toolbar: () => crystalToolbar,
      panel: () => crystalPanel,
    },
    "crystal-zinc": {
      viewer: () =>
        molecule ? (
          <ZincMetalCell
            loading={viewerLoading}
            modelStyle={crystalModelStyle}
            molecule={molecule}
            showLabels={showCrystalLabels}
            viewMode={activeCrystalViewMode}
          />
        ) : null,
      toolbar: () => crystalToolbar,
      panel: () => crystalPanel,
    },
    "crystal-void": {
      viewer: () =>
        molecule ? (
          <VoidStructureCell
            loading={viewerLoading}
            modelStyle={crystalModelStyle}
            molecule={molecule}
            showLabels={showCrystalLabels}
            voidStage={voidStage}
            viewMode={activeCrystalViewMode}
          />
        ) : null,
      toolbar: () => crystalToolbar,
      panel: () => crystalPanel,
    },
    "crystal-graphite": {
      viewer: () =>
        molecule ? (
          <GraphiteCell
            loading={viewerLoading}
            modelStyle={crystalModelStyle}
            molecule={molecule}
            showLabels={showCrystalLabels}
            viewMode={activeCrystalViewMode}
          />
        ) : null,
      toolbar: () => crystalToolbar,
      panel: () => crystalPanel,
    },
    "crystal-pba": {
      viewer: () =>
        molecule ? (
          <PbaCell
            loading={viewerLoading}
            modelStyle={crystalModelStyle}
            molecule={molecule}
            showLabels={showCrystalLabels}
            voidStage={voidStage}
            viewMode={activeCrystalViewMode}
          />
        ) : null,
      toolbar: () => crystalToolbar,
      panel: () => crystalPanel,
    },
    "crystal-caf2": {
      viewer: () =>
        molecule ? (
          <CaF2Cell
            loading={viewerLoading}
            modelStyle={crystalModelStyle}
            molecule={molecule}
            showLabels={showCrystalLabels}
            voidStage={voidStage}
            viewMode={activeCrystalViewMode}
          />
        ) : null,
      toolbar: () => crystalToolbar,
      panel: () => crystalPanel,
    },
    "crystal-batio3": {
      viewer: () =>
        molecule ? (
          <BaTiO3Cell
            loading={viewerLoading}
            molecule={molecule}
            showLabels={showCrystalLabels}
            viewMode={activeCrystalViewMode}
          />
        ) : null,
      toolbar: () => crystalToolbar,
      panel: () => crystalPanel,
    },
    "crystal-close-packing": {
      viewer: () =>
        molecule ? (
          <MetalClosePackingCell
            loading={viewerLoading}
            molecule={molecule}
            showLabels={showCrystalLabels}
            viewMode={activeCrystalViewMode}
          />
        ) : null,
      toolbar: () => crystalToolbar,
      panel: () => crystalPanel,
    },
    "crystal-zns": {
      viewer: () =>
        molecule ? (
          <ZnSPolytypeCell
            loading={viewerLoading}
            molecule={molecule}
            showLabels={showCrystalLabels}
            voidStage={voidStage}
            viewMode={activeCrystalViewMode}
          />
        ) : null,
      toolbar: () => crystalToolbar,
      panel: () => crystalPanel,
    },
    "crystal-mof5": {
      viewer: () =>
        molecule ? (
          <Mof5Cell
            loading={viewerLoading}
            molecule={molecule}
            showLabels={showCrystalLabels}
            voidStage={voidStage}
            viewMode={activeCrystalViewMode}
          />
        ) : null,
      toolbar: () => crystalToolbar,
      panel: () => crystalPanel,
    },
    "crystal-mxene": {
      viewer: () =>
        molecule ? (
          <MxeneCell
            loading={viewerLoading}
            molecule={molecule}
            showLabels={showCrystalLabels}
            viewMode={activeCrystalViewMode}
          />
        ) : null,
      toolbar: () => crystalToolbar,
      panel: () => crystalPanel,
    },
    "crystal-ren3": {
      viewer: () =>
        molecule ? (
          <Ren3Cell
            loading={viewerLoading}
            molecule={molecule}
            showLabels={showCrystalLabels}
            viewMode={activeCrystalViewMode}
          />
        ) : null,
      toolbar: () => crystalToolbar,
      panel: () => crystalPanel,
    },
    molecule: {
      viewer: () =>
        molecule ? (
          <MoleculeViewer
            autoRotate={autoRotate}
            loading={viewerLoading}
            molecule={molecule}
            showAngles={showAngles}
            showAtomLabels={showAtomLabels}
            showLonePairs={showLonePairs}
          />
        ) : (
          <ModulePlaceholderViewer
            category={moduleData.category}
            visualFocus={moduleData.visualFocus}
          />
        ),
      toolbar: () =>
        molecule ? (
          <FloatingToolbar
            autoRotate={autoRotate}
            showAngles={showAngles}
            showLonePairs={showLonePairs}
            showAtomLabels={showAtomLabels}
            onToggleAutoRotate={() => setAutoRotate((value) => !value)}
            onToggleAngles={() => setShowAngles((value) => !value)}
            onToggleLonePairs={() => setShowLonePairs((value) => !value)}
            onToggleAtomLabels={() => setShowAtomLabels((value) => !value)}
          />
        ) : null,
      panel: () =>
        molecule ? (
          <StructureInfoDisclosure
            facts={[
              { label: "名称 / 分子式", value: `${molecule.nameZh} · ${molecule.formula}` },
              { label: "空间构型", value: molecule.geometryZh },
              { label: "典型键角", value: molecule.keyAngles[0]?.label ?? "未标注" },
            ]}
            key={moduleData.id}
            modelBoundary="键角为典型值，模型用于观察原子、化学键与孤电子对的空间关系。"
            summaryItems={[
              { label: "分子式", value: molecule.formula },
              { label: "名称", value: molecule.nameZh },
              { label: "空间构型", value: molecule.geometryZh },
              { label: "典型键角", value: molecule.keyAngles[0]?.label ?? "未标注" },
            ]}
          />
        ) : null,
    },
    placeholder: {
      viewer: () => (
        <ModulePlaceholderViewer
          category={moduleData.category}
          visualFocus={moduleData.visualFocus}
        />
      ),
      toolbar: () => null,
      panel: () => (
        <div className="rounded-3xl border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-sm flex-1">
          <h3 className="text-lg font-bold text-text-primary mb-4">模块详情</h3>
          <p className="text-text-secondary leading-relaxed mb-6">
            {moduleData.description}
          </p>
          <h4 className="text-sm font-bold text-primary-dark mb-2">核心要点</h4>
          <ul className="list-disc pl-5 space-y-2 text-sm text-text-primary mb-6">
            {moduleData.keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            {moduleData.geometryName && <FactBox label="空间构型" value={moduleData.geometryName} />}
            {moduleData.hybridization && <FactBox label="杂化方式" value={moduleData.hybridization} />}
            {moduleData.bondAngle && <FactBox label="键角" value={moduleData.bondAngle} />}
            {moduleData.polarity && <FactBox label="极性" value={moduleData.polarity} />}
          </div>
        </div>
      ),
    },
  };

  const spec = viewerRegistry[viewerKind];

  return (
    <main
      className="module-builder-transition motion-page-enter relative isolate min-h-screen bg-background pb-20"
      data-builder-transition-phase={builderTransitionPhase}
      data-specialty-viewer={usesSpecialtyInfo ? "true" : undefined}
    >
      {/* 1. 顶部信息区 */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <nav className="flex items-center text-sm font-medium text-text-secondary/80 mb-4">
            <Link to="/" className="hover:text-primary transition-colors"><Home className="h-4 w-4" /></Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to="/modules" className="hover:text-primary transition-colors flex items-center">
              <LayoutList className="h-4 w-4 mr-1" />
              所有模块
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-text-primary">{moduleData.title}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary-dark">
                  {moduleData.difficulty}
                </span>
                {moduleData.tags.map(tag => (
                  <span key={tag} className="text-xs font-medium text-text-secondary border border-border px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight sm:text-4xl">
                {moduleData.title}
              </h1>
              <p className="mt-2 text-lg text-text-secondary">{moduleData.subtitle}</p>
            </div>
            {moduleData.formula && (
              <div className="text-5xl font-black text-primary/15 select-none">
                {moduleData.formula}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. 主体学习区 */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col gap-3">
          {/* 3D Viewer */}
          <div
            className={viewerKind === "molecule"
              ? "grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_272px] xl:items-start"
              : usesSpecialtyInspector
                ? usesDenseSpecialtyInspector
                  ? "grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start"
                  : "grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_304px] xl:items-start"
                : "flex min-w-0 flex-col gap-3"}
          >
            <div
              className={`organic-builder-transition-source relative flex overflow-hidden rounded-2xl border border-border bg-white shadow-panel ${pullingBuilderAtomId ? "pointer-events-none" : ""} ${
                viewerKind === "molecule"
                  ? "min-h-[480px] sm:min-h-[560px] xl:h-[calc(100vh-205px)] xl:min-h-[640px]"
                  : viewerKind === "sigma-bond" ||
                      viewerKind === "pi-bond" ||
                      viewerKind === "bonding-basics"
                    ? "min-h-[480px] sm:min-h-[560px] xl:h-[calc(100vh-235px)] xl:min-h-[560px]"
                    : "min-h-[480px] sm:min-h-[560px] xl:h-[calc(100vh-205px)] xl:min-h-[640px]"
              }`}
              data-testid="module-builder-transition-stage"
              style={(pullingBuilderAtomId || returnedFromBuilder) && !prefersReducedMotion
                ? ({ viewTransitionName: "organic-builder-stage" } as CSSProperties)
                : undefined}
            >
              <ViewerErrorBoundary resetKey={id}>
                <Suspense fallback={<ViewerChunkFallback />}>{spec.viewer()}</Suspense>
              </ViewerErrorBoundary>
            </div>

            <div
              className={viewerKind === "molecule" || usesSpecialtyInspector
                ? "flex min-w-0 flex-col gap-3"
                : "min-w-0"}
              data-testid={viewerKind === "molecule"
                ? "molecule-control-rail"
                : usesSpecialtyInspector
                  ? "specialty-control-rail"
                  : undefined}
            >
              {/* 独立操作台 (Control Console) */}
              <div
                className={`w-full rounded-xl border border-border bg-white px-3 py-2 shadow-sm ${
                  viewerKind === "molecule"
                    ? "xl:[&_.chem-control-console]:w-full xl:[&_.chem-control-grid]:flex-col xl:[&_.chem-control-grid]:items-stretch xl:[&_.chem-touch-button]:w-full"
                    : usesSpecialtyInspector
                      ? `xl:[&_.chem-control-console]:w-full xl:[&_.chem-control-grid]:flex-col xl:[&_.chem-control-grid]:items-stretch xl:[&_.chem-touch-button]:w-full ${
                          usesDenseSpecialtyInspector
                            ? "xl:[&_.chem-hybrid-controls]:grid-cols-1 xl:[&_.chem-hybrid-actions]:!grid xl:[&_.chem-hybrid-actions]:grid-cols-2 xl:[&_.chem-hybrid-actions]:w-full"
                            : ""
                        }`
                      : ""
                }`}
                data-testid="module-toolbar"
              >
                <div className="max-w-full overflow-x-auto pb-1">{spec.toolbar()}</div>
              </div>

              {viewerKind === "molecule" || usesSpecialtyInspector ? spec.panel() : null}
            </div>
          </div>

          {/* 高密度成键控制与尚未收缩的 Viewer 家族继续使用下方信息区。 */}
          {viewerKind !== "molecule" && !usesSpecialtyInspector ? (
            <div className="flex min-w-0 flex-col gap-5">{spec.panel()}</div>
          ) : null}
        </div>



        {/* 5. 相关推荐区 */}
        {relatedModules.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-bold text-text-primary mb-6">相关模块推荐</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedModules.map(mod => (
                <ModuleCard key={mod.id} module={mod} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function FactBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-center">
      <div className="text-xs text-text-secondary mb-1">{label}</div>
      <div className="font-semibold text-text-primary">{value}</div>
    </div>
  );
}

function ViewerChunkFallback() {
  // 3D viewer chunk 首次下载时的占位骨架，复用 ThreeViewerFrame 的 skeleton 样式。
  return (
    <div className="motion-skeleton absolute inset-0 z-10 flex items-center justify-center bg-white/60" />
  );
}
