import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LessonStep } from "@/types/molecule";

type StepBarProps = {
  lessonSteps: LessonStep[];
  activeStepIndex: number;
  completedStepIndices?: Set<number>;
  onPrevious: () => void;
  onNext: () => void;
  onSelectStep: (index: number) => void;
};

function stepState(index: number, activeStepIndex: number, completedIndices: Set<number>) {
  if (index === activeStepIndex) return "current" as const;
  if (completedIndices.has(index)) return "completed" as const;
  return "upcoming" as const;
}

export function StepBar({
  lessonSteps,
  activeStepIndex,
  completedStepIndices = new Set(),
  onPrevious,
  onNext,
  onSelectStep,
}: StepBarProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex shrink-0 items-center justify-between gap-3 xl:justify-start">
          <Button
            aria-label="上一步"
            disabled={activeStepIndex === 0}
            onClick={onPrevious}
            size="sm"
            type="button"
            variant="secondary"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <span className="whitespace-nowrap text-sm font-medium text-text-primary">
            步骤 {activeStepIndex + 1} / {lessonSteps.length}
          </span>
          <Button
            aria-label="下一步"
            disabled={activeStepIndex === lessonSteps.length - 1}
            onClick={onNext}
            size="sm"
            type="button"
            variant="secondary"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 xl:flex-1">
          {lessonSteps.map((step, index) => {
            const state = stepState(index, activeStepIndex, completedStepIndices);
            const base =
              "rounded-md border px-3 py-2 text-sm transition-all duration-base ease-out-soft hover:-translate-y-0.5";
            const stateClasses = {
              current:
                "border-primary bg-primary text-white shadow-md shadow-primary/15",
              completed:
                "border-primary/30 bg-primary/5 text-primary-dark hover:bg-primary/10 hover:border-primary/50",
              upcoming:
                "border-border bg-background text-text-secondary hover:border-primary/40 hover:bg-white hover:text-text-primary hover:shadow-sm",
            };

            return (
              <button
                key={step.id}
                className={`${base} ${stateClasses[state]}`}
                onClick={() => onSelectStep(index)}
                type="button"
              >
                <span className="flex items-center gap-1.5">
                  {state === "completed" ? (
                    <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <span className="w-3.5 text-center text-xs tabular-nums">{index + 1}</span>
                  )}
                  {step.titleZh}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
