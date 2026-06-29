import { AlertTriangle, FlaskConical, Info, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { LessonStep } from "@/types/molecule";
import type { MockMoleculeRecord } from "@/data/mockMolecules";
import { Button } from "@/components/ui/button";

type LessonPanelProps = {
  molecule: MockMoleculeRecord;
  activeStep: LessonStep;
  lessonSteps: LessonStep[];
  activeStepIndex: number;
  completedStepIndices: Set<number>;
  onPrevious: () => void;
  onNext: () => void;
};

export function LessonPanel({
  molecule,
  activeStep,
  lessonSteps,
  activeStepIndex,
  completedStepIndices,
  onPrevious,
  onNext,
}: LessonPanelProps) {
  const activeAngle = molecule.keyAngles.find((angle) => activeStep.focusAngleIds?.includes(angle.id));

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="border-b border-white/40 bg-white/40 px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wider text-primary">当前模型</p>
          <span className="rounded bg-primary-light/50 px-2 py-0.5 text-xs text-primary-dark">
            {molecule.categoryLabelZh}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-text-primary">
          <span className="font-serif">{molecule.formula}</span> · {molecule.nameZh}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div key={activeStep.id} className="motion-fade-in space-y-6">
          <Accordion type="multiple" defaultValue={["info"]} className="w-full space-y-5">
            <AccordionItem value="info" className="rounded-2xl border border-white/60 bg-white/60 px-5 shadow-sm transition-colors duration-300 hover:border-primary/30 border-b-0 data-[state=open]:pb-2">
              <AccordionTrigger className="hover:no-underline py-5">
                <h3 className="flex items-center gap-2 font-semibold text-text-primary">
                  <Info className="h-4 w-4 text-primary" aria-hidden="true" />
                  基础信息
                </h3>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  <FactRow label="空间构型" value={molecule.geometryZh} strong />
                  <FactRow label="中心信息" value={molecule.centralAtomZh} />
                  <FactRow label="孤电子对" value={molecule.lonePairsTextZh} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white shadow-[0_0_15px_rgba(42,157,143,0.4)]">
                {activeStepIndex + 1}
              </span>
              <h2 className="text-lg font-semibold text-text-primary">
                {activeStep.titleZh}
              </h2>
            </div>
            <p className="text-base leading-relaxed text-text-secondary">{activeStep.bodyZh}</p>
          </section>

          {activeAngle && (
            <Accordion type="multiple" defaultValue={["angle"]} className="w-full space-y-5">
              <AccordionItem value="angle" className="rounded-2xl border border-white/60 bg-white/60 px-5 transition-colors duration-300 hover:border-primary/30 shadow-sm border-b-0 data-[state=open]:pb-2">
                <AccordionTrigger className="hover:no-underline py-5">
                  <h3 className="text-sm font-semibold text-text-primary">键角说明</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm leading-6 text-text-secondary">
                    <span className="font-medium text-primary-dark mr-1">{activeAngle.label}</span>：
                    {activeAngle.descriptionZh}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {!activeAngle && molecule.summaryZh && activeStepIndex === 0 && (
            <Accordion type="multiple" defaultValue={["summary"]} className="w-full space-y-5">
              <AccordionItem value="summary" className="rounded-2xl border border-white/60 bg-white/60 px-5 transition-colors duration-300 hover:border-primary/30 shadow-sm border-b-0 data-[state=open]:pb-2">
                <AccordionTrigger className="hover:no-underline py-5">
                  <h3 className="text-sm font-semibold text-text-primary">观察提示</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm leading-6 text-text-secondary">{molecule.summaryZh}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}


        </div>
      </div>

      <div className="border-t border-white/40 bg-white/40 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <Button
            aria-label="上一步"
            disabled={activeStepIndex === 0}
            onClick={onPrevious}
            variant="outline"
            className="rounded-full bg-white px-4"
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
            上一步
          </Button>
          
          <div className="flex gap-1.5">
            {lessonSteps.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeStepIndex 
                    ? "bg-primary w-4" 
                    : completedStepIndices.has(i) 
                      ? "bg-primary/40 w-2" 
                      : "bg-border w-2"
                }`}
              />
            ))}
          </div>

          <Button
            aria-label="下一步"
            disabled={activeStepIndex === lessonSteps.length - 1}
            onClick={onNext}
            className="rounded-full px-4"
          >
            下一步
            <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

type FactRowProps = {
  label: string;
  value: string;
  strong?: boolean;
};

function FactRow({ label, value, strong = false }: FactRowProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-text-secondary">{label}</span>
      <span className={`text-right ${strong ? "font-semibold text-primary-dark" : "text-text-primary"}`}>
        {value}
      </span>
    </div>
  );
}
