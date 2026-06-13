import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Home, LayoutList, AlertTriangle } from "lucide-react";

import { MoleculeViewer } from "@/components/three/MoleculeViewer";
import { NaClCell } from "@/components/three/NaClCell";
import { CsClCell } from "@/components/three/CsClCell";
import { SodiumMetalCell } from "@/components/three/SodiumMetalCell";
import { DiamondCell } from "@/components/three/DiamondCell";
import { ZincMetalCell } from "@/components/three/ZincMetalCell";
import { VoidStructureCell } from "@/components/three/VoidStructureCell";
import { GraphiteCell } from "@/components/three/GraphiteCell";
import { ModulePlaceholderViewer } from "@/components/three/ModulePlaceholderViewer";
import { CrystalKnowledgePanel } from "@/components/learning/CrystalKnowledgePanel";
import { CrystalModeToolbar } from "@/components/learning/CrystalModeToolbar";
import { LessonPanel } from "@/components/learning/LessonPanel";
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
import type { CrystalViewMode, CrystalVoidStage } from "@/types/molecule";

export function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
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
  const [voidStage, setVoidStage] = useState<CrystalVoidStage>("framework");
  const [showCrystalLabels, setShowCrystalLabels] = useState(false);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    setActiveStepIndex(0);
    setShowAngles(false);
    setShowLonePairs(false);
    setShowAtomLabels(false);
    setCrystalViewMode("cell");
    setVoidStage("framework");
    setShowCrystalLabels(false);
    setViewerLoading(true);
    setCompletedSteps(new Set());
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
  const usesNaClCrystalViewer =
    usesRealViewer && molecule?.id === "nacl" && molecule.kind === "crystal";
  const usesCsClCrystalViewer =
    usesRealViewer && molecule?.id === "cscl" && molecule.kind === "crystal";
  const usesSodiumMetalCrystalViewer =
    usesRealViewer && molecule?.id === "sodium-metal" && molecule.kind === "crystal";
  const usesDiamondCrystalViewer =
    usesRealViewer && molecule?.id === "diamond" && molecule.kind === "crystal";
  const usesZincMetalCrystalViewer =
    usesRealViewer && molecule?.id === "zinc-metal" && molecule.kind === "crystal";
  const usesVoidStructureViewer =
    usesRealViewer &&
    (molecule?.id === "octahedral-voids" || molecule?.id === "tetrahedral-voids") &&
    molecule.kind === "crystal";
  const usesGraphiteCrystalViewer =
    usesRealViewer && molecule?.id === "graphite" && molecule.kind === "crystal";
  const usesCrystalTeachingViewer =
    usesNaClCrystalViewer ||
    usesCsClCrystalViewer ||
    usesSodiumMetalCrystalViewer ||
    usesDiamondCrystalViewer ||
    usesZincMetalCrystalViewer ||
    usesVoidStructureViewer ||
    usesGraphiteCrystalViewer;
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

  return (
    <main className="motion-page-enter bg-background min-h-screen pb-20">
      {/* 1. 顶部信息区 */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav className="flex items-center text-sm font-medium text-text-secondary mb-4">
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
              <div className="text-5xl font-black text-primary/20 select-none">
                {moduleData.formula}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. 主体学习区 */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-[1fr_400px]">
          
          {/* 左侧：3D Viewer */}
          <div className="lg:col-span-2 xl:col-span-1 flex flex-col gap-4">
            <div
              className={`relative flex h-[500px] min-h-0 overflow-hidden rounded-3xl ${
                usesCrystalTeachingViewer ? "lg:h-[600px]" : "lg:h-[620px]"
              }`}
            >
              {usesCrystalTeachingViewer && molecule ? (
                usesNaClCrystalViewer ? (
                  <NaClCell
                    loading={viewerLoading}
                    molecule={molecule}
                    showLabels={showCrystalLabels}
                    voidStage={voidStage}
                    viewMode={activeCrystalViewMode}
                  />
                ) : usesCsClCrystalViewer ? (
                  <CsClCell
                    loading={viewerLoading}
                    molecule={molecule}
                    showLabels={showCrystalLabels}
                    viewMode={activeCrystalViewMode}
                  />
                ) : usesSodiumMetalCrystalViewer ? (
                  <SodiumMetalCell
                    loading={viewerLoading}
                    molecule={molecule}
                    showLabels={showCrystalLabels}
                    viewMode={activeCrystalViewMode}
                  />
                ) : usesDiamondCrystalViewer ? (
                  <DiamondCell
                    loading={viewerLoading}
                    molecule={molecule}
                    showLabels={showCrystalLabels}
                    voidStage={voidStage}
                    viewMode={activeCrystalViewMode}
                  />
                ) : usesZincMetalCrystalViewer ? (
                  <ZincMetalCell
                    loading={viewerLoading}
                    molecule={molecule}
                    showLabels={showCrystalLabels}
                    viewMode={activeCrystalViewMode}
                  />
                ) : usesVoidStructureViewer ? (
                  <VoidStructureCell
                    loading={viewerLoading}
                    molecule={molecule}
                    showLabels={showCrystalLabels}
                    voidStage={voidStage}
                    viewMode={activeCrystalViewMode}
                  />
                ) : (
                  <GraphiteCell
                    loading={viewerLoading}
                    molecule={molecule}
                    showLabels={showCrystalLabels}
                    viewMode={activeCrystalViewMode}
                  />
                )
              ) : usesRealViewer && molecule && activeStep ? (
                <MoleculeViewer
                  activeStep={activeStep}
                  autoRotate={autoRotate}
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
                <ModulePlaceholderViewer category={moduleData.category} visualFocus={moduleData.visualFocus} />
              )}
            </div>

            {usesCrystalTeachingViewer && molecule && crystalModes.length > 0 ? (
              <CrystalModeToolbar
                activeMode={activeCrystalViewMode}
                modes={crystalModes}
                onModeChange={handleCrystalModeChange}
                onToggleLabels={() => setShowCrystalLabels((value) => !value)}
                showLabels={showCrystalLabels}
              />
            ) : null}

            {!usesCrystalTeachingViewer && usesRealViewer && molecule && activeStep ? (
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
            ) : null}
          </div>

          {/* 右侧：知识点与步骤 */}
          <div className="flex flex-col gap-6">
            {/* 如果有互动步骤，展示 LessonPanel，否则展示静态说明 */}
            {usesCrystalTeachingViewer && molecule ? (
              <div className="flex-1 min-h-[400px]">
                <CrystalKnowledgePanel
                  activeMode={activeCrystalViewMode}
                  molecule={molecule}
                  onVoidStageChange={setVoidStage}
                  voidStage={voidStage}
                />
              </div>
            ) : usesRealViewer && molecule ? (
              <div className="flex-1 min-h-[400px]">
                <LessonPanel
                  activeStep={activeStep!}
                  molecule={molecule}
                  lessonSteps={molecule.lessonSteps}
                  activeStepIndex={activeStepIndex}
                  completedStepIndices={completedSteps}
                  onPrevious={() => goToStep(activeStepIndex - 1)}
                  onNext={() => goToStep(activeStepIndex + 1)}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex-1">
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
            )}
          </div>
        </div>

        {/* 3 & 4. 常见误区 & 考试价值 */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {mockMolecule?.commonMistakeZh && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <div className="flex items-center gap-2 text-amber-600 mb-3 font-bold">
                <AlertTriangle className="h-5 w-5" />
                常见误区
              </div>
              <p className="text-sm text-amber-900 leading-relaxed">
                {mockMolecule.commonMistakeZh}
              </p>
            </div>
          )}
          {moduleData.examValue && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <div className="flex items-center gap-2 text-blue-600 mb-3 font-bold">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                高考价值
              </div>
              <p className="text-sm text-blue-900 leading-relaxed">
                {moduleData.examValue}
              </p>
            </div>
          )}
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
