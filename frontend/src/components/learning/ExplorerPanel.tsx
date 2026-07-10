import type { ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, Compass, Move3d, MousePointer2, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MockMoleculeRecord } from "@/data/mockMolecules";
import type { LessonStep } from "@/types/molecule";

type ExplorerPanelProps = {
  molecule: MockMoleculeRecord;
  activeStep: LessonStep;
  lessonSteps: LessonStep[];
  activeStepIndex: number;
  completedStepIndices: Set<number>;
  isGuidedMode: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSelectStep: (index: number) => void;
};

export function ExplorerPanel({
  molecule,
  activeStep,
  lessonSteps,
  activeStepIndex,
  completedStepIndices,
  isGuidedMode,
  onPrevious,
  onNext,
  onSelectStep,
}: ExplorerPanelProps) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-border bg-white shadow-panel">
      <div className="border-b border-border bg-primary/[0.035] px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
            <Compass className="h-4 w-4" aria-hidden="true" />
            自由探索
          </div>
          <span className="rounded-full border border-primary/20 bg-white px-2.5 py-1 text-xs font-medium text-primary-dark">
            {molecule.geometryZh}
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-text-primary">
          <span className="font-serif">{molecule.formula}</span> · {molecule.nameZh}
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          先旋转模型，观察原子在空间中的相对位置；需要提示时再打开下方讲解。
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-3">
          <ExploreHint icon={<MousePointer2 className="h-4 w-4" />} label="拖拽旋转" />
          <ExploreHint icon={<Move3d className="h-4 w-4" />} label="滚轮缩放" />
        </div>

        <section className="rounded-xl border border-border bg-background/70 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Route className="h-4 w-4 text-primary" aria-hidden="true" />
            按需跟随讲解
          </div>
          <p className="mt-1.5 text-sm leading-6 text-text-secondary">
            点击一个问题，让模型高亮对应结构，并查看解释。
          </p>

          <div className="mt-3 space-y-2">
            {lessonSteps.map((step, index) => {
              const selected = isGuidedMode && index === activeStepIndex;
              const completed = completedStepIndices.has(index);

              return (
                <button
                  key={step.id}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    selected
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-text-primary hover:border-primary/40 hover:bg-primary/[0.03]"
                  }`}
                  onClick={() => onSelectStep(index)}
                  type="button"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      selected ? "bg-white/20" : completed ? "bg-primary-light text-primary-dark" : "bg-background text-text-secondary"
                    }`}
                  >
                    {completed && !selected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                  </span>
                  <span className="min-w-0 font-medium leading-5">{step.titleZh}</span>
                </button>
              );
            })}
          </div>
        </section>

        {isGuidedMode ? (
          <section className="rounded-xl border border-accent/30 bg-accent/10 p-4" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-dark">当前观察</p>
            <h3 className="mt-1 text-base font-bold text-text-primary">{activeStep.titleZh}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{activeStep.bodyZh}</p>
          </section>
        ) : null}
      </div>

      {isGuidedMode ? (
        <div className="flex items-center justify-between border-t border-border bg-white px-5 py-4">
          <Button aria-label="上一步" disabled={activeStepIndex === 0} onClick={onPrevious} variant="secondary">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            上一步
          </Button>
          <span className="text-sm font-medium text-text-secondary">{activeStepIndex + 1} / {lessonSteps.length}</span>
          <Button aria-label="下一步" disabled={activeStepIndex === lessonSteps.length - 1} onClick={onNext}>
            下一步
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </aside>
  );
}

function ExploreHint({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-medium text-text-secondary">
      <span className="text-primary">{icon}</span>
      {label}
    </div>
  );
}
