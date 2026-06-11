import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LessonStep } from "@/types/molecule";

type StepBarProps = {
  lessonSteps: LessonStep[];
  activeStepIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelectStep: (index: number) => void;
};

export function StepBar({
  lessonSteps,
  activeStepIndex,
  onPrevious,
  onNext,
  onSelectStep,
}: StepBarProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between gap-3 xl:justify-start">
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
          <span className="text-sm font-medium text-text-primary">
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

        <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[560px]">
          {lessonSteps.map((step, index) => (
            <button
              key={step.id}
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                index === activeStepIndex
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background text-text-secondary hover:text-text-primary"
              }`}
              onClick={() => onSelectStep(index)}
              type="button"
            >
              {index + 1}. {step.titleZh}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
