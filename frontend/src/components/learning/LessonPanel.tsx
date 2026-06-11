import { AlertTriangle, FlaskConical, Info } from "lucide-react";
import type { LessonStep } from "@/types/molecule";
import type { MockMoleculeRecord } from "@/data/mockMolecules";

type LessonPanelProps = {
  molecule: MockMoleculeRecord;
  activeStep: LessonStep;
};

export function LessonPanel({ molecule, activeStep }: LessonPanelProps) {
  const activeAngle = molecule.keyAngles.find((angle) => activeStep.focusAngleIds?.includes(angle.id));

  return (
    <aside className="rounded-lg border border-border bg-surface shadow-panel">
      <div className="border-b border-border bg-background px-5 py-4">
        <p className="text-sm font-semibold text-primary">当前模型</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-text-primary">
          {molecule.formula} · {molecule.nameZh}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">{molecule.categoryLabelZh}</p>
      </div>

      <div className="space-y-5 p-5">
        <section className="grid gap-3 rounded-md border border-border bg-background p-4 text-sm">
          <Info className="h-4 w-4 text-primary" aria-hidden="true" />
          <div className="grid gap-2">
            <FactRow label="空间构型" value={molecule.geometryZh} strong />
            <FactRow label="中心信息" value={molecule.centralAtomZh} />
            <FactRow label="孤电子对" value={molecule.lonePairsTextZh} />
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
            <FlaskConical className="h-4 w-4 text-primary" aria-hidden="true" />
            {activeStep.titleZh}
          </h2>
          <p className="mt-2 text-sm leading-7 text-text-secondary">{activeStep.bodyZh}</p>
        </section>

        <section className="rounded-md border border-border bg-background p-4">
          <h3 className="text-sm font-semibold text-text-primary">
            {activeAngle ? "键角说明" : "观察提示"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {activeAngle
              ? `${activeAngle.label}：${activeAngle.descriptionZh}`
              : molecule.summaryZh}
          </p>
        </section>

        <section className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            易错提醒
          </h3>
          <p className="mt-2 text-sm leading-6 text-amber-900">{molecule.commonMistakeZh}</p>
        </section>
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
