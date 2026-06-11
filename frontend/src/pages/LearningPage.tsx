import { useEffect, useMemo, useState } from "react";
import { LessonPanel } from "@/components/learning/LessonPanel";
import { MoleculeSidebar } from "@/components/learning/MoleculeSidebar";
import { StepBar } from "@/components/learning/StepBar";
import { ViewerPlaceholder } from "@/components/learning/ViewerPlaceholder";
import { MoleculeViewer } from "@/components/three/MoleculeViewer";
import {
  getMockMolecule,
  getRealMoleculeData,
  mergeMoleculeData,
  mockMolecules,
} from "@/data/mockMolecules";

type LearningPageProps = {
  selectedMoleculeId: string;
  onSelectMolecule: (id: string) => void;
};

export function LearningPage({ selectedMoleculeId, onSelectMolecule }: LearningPageProps) {
  const mockMolecule = useMemo(() => getMockMolecule(selectedMoleculeId), [selectedMoleculeId]);
  const realMolecule = useMemo(() => getRealMoleculeData(mockMolecule.id), [mockMolecule.id]);
  const usesRealViewer = Boolean(realMolecule);
  const molecule = useMemo(
    () => mergeMoleculeData(mockMolecule, realMolecule),
    [mockMolecule, realMolecule],
  );
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showAngles, setShowAngles] = useState(false);
  const [showLonePairs, setShowLonePairs] = useState(false);

  const activeStep = molecule.lessonSteps[activeStepIndex] ?? molecule.lessonSteps[0];

  useEffect(() => {
    setActiveStepIndex(0);
    setShowAngles(false);
    setShowLonePairs(false);
  }, [molecule.id]);

  const goToStep = (nextIndex: number) => {
    const clampedIndex = Math.min(Math.max(nextIndex, 0), molecule.lessonSteps.length - 1);
    const nextStep = molecule.lessonSteps[clampedIndex];

    setActiveStepIndex(clampedIndex);
    if (nextStep.showAngles) {
      setShowAngles(true);
    }
    if (nextStep.showLonePairs) {
      setShowLonePairs(true);
    }
  };

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-panel lg:hidden">
          <label className="text-sm font-medium text-text-primary" htmlFor="mobile-structure">
            选择模型
          </label>
          <select
            className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-text-primary"
            id="mobile-structure"
            onChange={(event) => onSelectMolecule(event.target.value)}
            value={molecule.id}
          >
            {mockMolecules.map((item) => (
              <option key={item.id} value={item.id}>
                {item.formula} · {item.nameZh}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)_320px]">
          <MoleculeSidebar
            molecules={mockMolecules}
            onSelect={onSelectMolecule}
            selectedId={molecule.id}
          />

          <div className="flex min-w-0 flex-col gap-4">
            {usesRealViewer ? (
              <MoleculeViewer
                activeStep={activeStep}
                autoRotate={autoRotate}
                molecule={molecule}
                onToggleAngles={() => setShowAngles((value) => !value)}
                onToggleAutoRotate={() => setAutoRotate((value) => !value)}
                onToggleLonePairs={() => setShowLonePairs((value) => !value)}
                showAngles={showAngles}
                showLonePairs={showLonePairs}
              />
            ) : (
              <ViewerPlaceholder
                autoRotate={autoRotate}
                molecule={molecule}
                onToggleAngles={() => setShowAngles((value) => !value)}
                onToggleAutoRotate={() => setAutoRotate((value) => !value)}
                onToggleLonePairs={() => setShowLonePairs((value) => !value)}
                showAngles={showAngles}
                showLonePairs={showLonePairs}
              />
            )}
            <StepBar
              activeStepIndex={activeStepIndex}
              lessonSteps={molecule.lessonSteps}
              onNext={() => goToStep(activeStepIndex + 1)}
              onPrevious={() => goToStep(activeStepIndex - 1)}
              onSelectStep={goToStep}
            />
          </div>

          <LessonPanel activeStep={activeStep} molecule={molecule} />
        </div>
      </div>
    </main>
  );
}
