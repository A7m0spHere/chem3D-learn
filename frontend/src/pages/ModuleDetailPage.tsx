import { Suspense, lazy, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight, Home, LayoutList } from "lucide-react";

// 3D viewers 按需懒加载：使 three.js / R3F 不进入首页、考试页等非 3D 页面的初始包。
const MoleculeViewer = lazy(() =>
  import("@/components/three/MoleculeViewer").then((m) => ({ default: m.MoleculeViewer })),
);
const NaClCell = lazy(() =>
  import("@/components/three/NaClCell").then((m) => ({ default: m.NaClCell })),
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
import { OrganicCoplanarPanel } from "@/components/learning/OrganicCoplanarPanel";
import { OrganicCoplanarToolbar } from "@/components/learning/OrganicCoplanarToolbar";
import { EthylenePlanarPanel } from "@/components/learning/EthylenePlanarPanel";
import { EthylenePlanarToolbar } from "@/components/learning/EthylenePlanarToolbar";
import { BenzenePlanarPanel } from "@/components/learning/BenzenePlanarPanel";
import { BenzenePlanarToolbar } from "@/components/learning/BenzenePlanarToolbar";
import { AcetyleneLinearPanel } from "@/components/learning/AcetyleneLinearPanel";
import { AcetyleneLinearToolbar } from "@/components/learning/AcetyleneLinearToolbar";
import { SigmaPiBondPanel } from "@/components/learning/SigmaPiBondPanel";
import { SigmaPiBondToolbar } from "@/components/learning/SigmaPiBondToolbar";
import { BondingBasicsPanel } from "@/components/learning/BondingBasicsPanel";
import { BondingBasicsToolbar } from "@/components/learning/BondingBasicsToolbar";
import { MolecularPolarityPanel } from "@/components/learning/MolecularPolarityPanel";
import { MolecularPolarityToolbar } from "@/components/learning/MolecularPolarityToolbar";
import { ExplorerPanel } from "@/components/learning/ExplorerPanel";
import { FloatingToolbar } from "@/components/learning/FloatingToolbar";

import { getModuleById } from "@/data/learningModules";
import {
  getMockMolecule,
  getRealMoleculeData,
  mergeMoleculeData,
  type MockMoleculeRecord,
} from "@/data/mockMolecules";
import { ModuleCard } from "@/components/home/ModuleCard";
import { learningModules } from "@/data/learningModules";
import type { MolecularPolarityMode } from "@/data/molecularPolarity";
import type {
  CrystalModelStyle,
  CrystalViewMode,
  CrystalVoidStage,
  AcetyleneLinearMode,
  BenzenePlanarMode,
  EthylenePlanarMode,
  OrganicCoplanarMode,
} from "@/types/molecule";
import type { EthylenePlaneView } from "@/data/ethylenePlanar";
import type { BenzenePlaneView } from "@/data/benzenePlanar";
import type { AcetyleneLineView } from "@/data/acetyleneLinear";
import type { PiBondMode, SigmaBondMode } from "@/data/sigmaPiBonds";
import {
  getDefaultBondingBasicsMode,
  isBondingBasicsModuleId,
  type BondingBasicsMode,
  type HybridOrbitalControls,
  type HybridRenderMode,
} from "@/data/bondingBasics";

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
  | "molecule"
  | "placeholder";

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

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showAngles, setShowAngles] = useState(false);
  const [showLonePairs, setShowLonePairs] = useState(false);
  const [showAtomLabels, setShowAtomLabels] = useState(false);
  const [crystalViewMode, setCrystalViewMode] = useState<CrystalViewMode>("cell");
  const [crystalModelStyle, setCrystalModelStyle] = useState<CrystalModelStyle>("ballStick");
  const [voidStage, setVoidStage] = useState<CrystalVoidStage>("framework");
  const [showCrystalLabels, setShowCrystalLabels] = useState(false);
  const [organicCoplanarMode, setOrganicCoplanarMode] = useState<OrganicCoplanarMode>("overview");
  const [organicVinylAligned, setOrganicVinylAligned] = useState(false);
  const [showOrganicLabels, setShowOrganicLabels] = useState(false);
  const [ethyleneMode, setEthyleneMode] = useState<EthylenePlanarMode>("overview");
  const [ethylenePlaneView, setEthylenePlaneView] = useState<EthylenePlaneView>("top");
  const [benzeneMode, setBenzeneMode] = useState<BenzenePlanarMode>("overview");
  const [benzenePlaneView, setBenzenePlaneView] = useState<BenzenePlaneView>("top");
  const [acetyleneMode, setAcetyleneMode] = useState<AcetyleneLinearMode>("overview");
  const [acetyleneLineView, setAcetyleneLineView] = useState<AcetyleneLineView>("front");
  const [sigmaBondMode, setSigmaBondMode] = useState<SigmaBondMode>("ss");
  const [piBondMode, setPiBondMode] = useState<PiBondMode>("before");
  const [piBondPlaying, setPiBondPlaying] = useState(false);
  const [showSigmaPiBondLabels, setShowSigmaPiBondLabels] = useState(false);
  const [bondingBasicsMode, setBondingBasicsMode] = useState<BondingBasicsMode>("sp");
  const [hybridProgress, setHybridProgress] = useState(100);
  const [hybridRenderMode, setHybridRenderMode] = useState<HybridRenderMode>("solid");
  const [showHybridUnhybridizedP, setShowHybridUnhybridizedP] = useState(true);
  const [showHybridAxes, setShowHybridAxes] = useState(true);
  const [molecularPolarityMode, setMolecularPolarityMode] =
    useState<MolecularPolarityMode>("electronegativity");
  const [viewerLoading, setViewerLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isGuidedMode, setIsGuidedMode] = useState(false);
  const [pullingBuilderAtomId, setPullingBuilderAtomId] = useState<string>();

  useEffect(() => {
    if (!pullingBuilderAtomId || !moduleData?.builderSeedId) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      navigate(`/lab/organic-builder/${moduleData.builderSeedId}`, {
        state: { detachAtomId: pullingBuilderAtomId, sourceModuleId: moduleData.id },
      });
    }, reducedMotion ? 40 : 320);
    return () => window.clearTimeout(timer);
  }, [moduleData, navigate, pullingBuilderAtomId]);

  useEffect(() => {
    setActiveStepIndex(0);
    setShowAngles(false);
    setShowLonePairs(false);
    setShowAtomLabels(false);
    setCrystalViewMode("cell");
    setCrystalModelStyle("ballStick");
    setVoidStage("framework");
    setShowCrystalLabels(false);
    setOrganicCoplanarMode("overview");
    setOrganicVinylAligned(false);
    setShowOrganicLabels(false);
    setEthyleneMode("overview");
    setEthylenePlaneView("top");
    setBenzeneMode("overview");
    setBenzenePlaneView("top");
    setAcetyleneMode("overview");
    setAcetyleneLineView("front");
    setSigmaBondMode("ss");
    setPiBondMode("before");
    setPiBondPlaying(false);
    setShowSigmaPiBondLabels(false);
    if (id && isBondingBasicsModuleId(id)) {
      setBondingBasicsMode(getDefaultBondingBasicsMode(id));
    } else {
      setBondingBasicsMode("sp");
    }
    setHybridProgress(100);
    setHybridRenderMode("solid");
    setShowHybridUnhybridizedP(true);
    setShowHybridAxes(true);
    setMolecularPolarityMode("electronegativity");
    setViewerLoading(true);
    setCompletedSteps(new Set());
    setIsGuidedMode(false);
    setPullingBuilderAtomId(undefined);
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

  const activeStep = molecule?.lessonSteps[activeStepIndex] ?? molecule?.lessonSteps[0];
  const viewerKind = deriveViewerKind(moduleData, molecule, usesRealViewer);
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

  const handleCrystalModeChange = (mode: CrystalViewMode) => {
    setCrystalViewMode(mode);
    if (mode === "voids") {
      setVoidStage("framework");
    }
  };

  const goToStep = (nextIndex: number) => {
    if (!molecule) return;
    const clampedIndex = Math.min(Math.max(nextIndex, 0), molecule.lessonSteps.length - 1);
    const nextStep = molecule.lessonSteps[clampedIndex];

    setActiveStepIndex(clampedIndex);
    setIsGuidedMode(true);
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      for (let i = 0; i < clampedIndex; i++) {
        next.add(i);
      }
      return next;
    });
    if (nextStep.showAngles) setShowAngles(true);
    if (nextStep.showLonePairs) setShowLonePairs(true);
  };

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
      panel: () => (
        <div className="flex-1 min-h-[400px]">
          <MolecularPolarityPanel activeMode={molecularPolarityMode} />
        </div>
      ),
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
      panel: () => (
        <div className="flex-1 min-h-[400px]">
          <SigmaPiBondPanel activeMode={sigmaBondMode} lessonType="sigma" />
        </div>
      ),
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
      panel: () => (
        <div className="flex-1 min-h-[400px]">
          <SigmaPiBondPanel activeMode={piBondMode} lessonType="pi" />
        </div>
      ),
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
      panel: () => (
        <div className="flex-1 min-h-[400px]">
          <BondingBasicsPanel activeMode={bondingBasicsMode} moduleId={bondingBasicsModuleId} />
        </div>
      ),
    },
    ethylene: {
      viewer: () => (
        <EthylenePlanarCell
          loading={viewerLoading}
          mode={ethyleneMode}
          onAtomPull={moduleData.builderSeedId ? setPullingBuilderAtomId : undefined}
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
      panel: () => (
        <div className="flex-1 min-h-[400px]">
          <EthylenePlanarPanel activeMode={ethyleneMode} planeView={ethylenePlaneView} />
        </div>
      ),
    },
    benzene: {
      viewer: () => (
        <BenzenePlanarCell
          loading={viewerLoading}
          mode={benzeneMode}
          onAtomPull={moduleData.builderSeedId ? setPullingBuilderAtomId : undefined}
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
      panel: () => (
        <div className="flex-1 min-h-[400px]">
          <BenzenePlanarPanel activeMode={benzeneMode} planeView={benzenePlaneView} />
        </div>
      ),
    },
    acetylene: {
      viewer: () => (
        <AcetyleneLinearCell
          lineView={acetyleneLineView}
          loading={viewerLoading}
          mode={acetyleneMode}
          onAtomPull={moduleData.builderSeedId ? setPullingBuilderAtomId : undefined}
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
      panel: () => (
        <div className="flex-1 min-h-[400px]">
          <AcetyleneLinearPanel activeMode={acetyleneMode} lineView={acetyleneLineView} />
        </div>
      ),
    },
    "organic-coplanar": {
      viewer: () => (
        <OrganicCoplanarViewer
          activeMode={organicCoplanarMode}
          loading={viewerLoading}
          onAtomPull={moduleData.builderSeedId ? setPullingBuilderAtomId : undefined}
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
      panel: () => (
        <div className="flex-1 min-h-[400px]">
          <OrganicCoplanarPanel
            activeMode={organicCoplanarMode}
            vinylAligned={organicVinylAligned}
          />
        </div>
      ),
    },
    "crystal-nacl": {
      viewer: () =>
        molecule ? (
          <NaClCell
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
    molecule: {
      viewer: () =>
        activeStep && molecule ? (
          <MoleculeViewer
            activeStep={activeStep}
            autoRotate={autoRotate}
            isGuidedMode={isGuidedMode}
            loading={viewerLoading}
            molecule={molecule}
            onToggleAngles={() => setShowAngles((value) => !value)}
            onToggleAtomLabels={() => setShowAtomLabels((value) => !value)}
            onToggleAutoRotate={() => setAutoRotate((value) => !value)}
            onToggleLonePairs={() => setShowLonePairs((value) => !value)}
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
        activeStep && molecule ? (
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
          <div className="flex-1 min-h-[400px]">
            <ExplorerPanel
              activeStep={activeStep!}
              molecule={molecule}
              lessonSteps={molecule.lessonSteps}
              activeStepIndex={activeStepIndex}
              completedStepIndices={completedSteps}
              isGuidedMode={isGuidedMode}
              onPrevious={() => goToStep(activeStepIndex - 1)}
              onNext={() => goToStep(activeStepIndex + 1)}
              onSelectStep={goToStep}
            />
          </div>
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
    <main className={`motion-page-enter min-h-screen bg-background pb-20 transition-opacity duration-300 ${pullingBuilderAtomId ? "opacity-80" : "opacity-100"}`}>
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
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">

          {/* 左侧：3D Viewer */}
          <div className="flex min-w-0 flex-col gap-3">
            <div
              className={`relative flex min-h-[480px] overflow-hidden rounded-2xl border border-border bg-white shadow-panel sm:min-h-[560px] ${
                viewerKind === "sigma-bond" ||
                viewerKind === "pi-bond" ||
                viewerKind === "bonding-basics"
                  ? "xl:h-[calc(100vh-235px)] xl:min-h-[560px]"
                  : "xl:h-[calc(100vh-205px)] xl:min-h-[640px]"
              }`}
            >
              <Suspense fallback={<ViewerChunkFallback />}>{spec.viewer()}</Suspense>
            </div>

            {/* 独立操作台 (Control Console) */}
            <div className="w-full rounded-xl border border-border bg-white px-3 py-2 shadow-sm">
              <div className="max-w-full overflow-x-auto pb-1">{spec.toolbar()}</div>
            </div>
          </div>

          {/* 右侧：知识点与步骤 */}
          <div className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-[76px]">
            {/* 普通分子提供自由探索与按需讲解；专题模块保留各自知识面板。 */}
            {spec.panel()}
          </div>
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
