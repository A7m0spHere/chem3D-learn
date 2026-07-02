import { FlaskConical, Info, Lightbulb } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getBondingBasicsLesson, getBondingBasicsModeInfo } from "@/data/bondingBasics";
import type { BondingBasicsMode, BondingBasicsModuleId } from "@/data/bondingBasics";

type BondingBasicsPanelProps = {
  moduleId: BondingBasicsModuleId;
  activeMode: BondingBasicsMode;
};

export function BondingBasicsPanel({ moduleId, activeMode }: BondingBasicsPanelProps) {
  const lesson = getBondingBasicsLesson(moduleId);
  const modeInfo = getBondingBasicsModeInfo(moduleId, activeMode);

  return (
    <aside className="flex h-full min-h-[400px] flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
      <div className="border-b border-white/40 bg-white/40 px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wider text-primary">{lesson.eyebrow}</p>
          <span className="rounded bg-primary-light/50 px-2 py-0.5 text-xs text-primary-dark">
            {lesson.badge}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-text-primary">{lesson.title}</h1>
        <p className="mt-2 font-serif text-sm text-text-secondary">{lesson.subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div key={`${moduleId}-${activeMode}`} className="motion-fade-in space-y-6">
          <Accordion type="multiple" defaultValue={["info", "points"]} className="w-full space-y-5">
            <AccordionItem value="info" className="rounded-2xl border border-white/60 bg-white/60 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
              <AccordionTrigger className="hover:no-underline py-5">
                <h3 className="flex items-center gap-2 font-semibold text-text-primary">
                  <Info className="h-4 w-4 text-primary" aria-hidden="true" />
                  当前模式
                </h3>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-semibold text-text-primary">{modeInfo.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {modeInfo.description}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <FactRow label="模型对象" value={lesson.modelObject} strong />
                    <FactRow label="当前重点" value={modeInfo.label} />
                    {modeInfo.angleLabel ? (
                      <FactRow label="代表夹角" value={modeInfo.angleLabel} />
                    ) : null}
                    {modeInfo.geometryNote ? (
                      <FactRow label="空间方向" value={modeInfo.geometryNote} />
                    ) : null}
                    {modeInfo.unhybridizedNote ? (
                      <FactRow label="未杂化轨道" value={modeInfo.unhybridizedNote} />
                    ) : null}
                    {modeInfo.inputOrbitals ? (
                      <FactRow label="杂化前" value={modeInfo.inputOrbitals} />
                    ) : null}
                    {modeInfo.outputOrbitals ? (
                      <FactRow label="杂化后" value={modeInfo.outputOrbitals} strong />
                    ) : null}
                    {typeof modeInfo.leftoverPCount === "number" ? (
                      <FactRow
                        label="剩余 p 轨道"
                        value={
                          modeInfo.leftoverPCount > 0
                            ? `${modeInfo.leftoverPCount} 组`
                            : "无"
                        }
                      />
                    ) : null}
                    {modeInfo.typicalExample ? (
                      <FactRow label="典型联想" value={modeInfo.typicalExample} />
                    ) : null}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="points" className="rounded-2xl border border-white/60 bg-white/60 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
              <AccordionTrigger className="hover:no-underline py-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <FlaskConical className="h-4 w-4 text-primary" aria-hidden="true" />
                  观察重点
                </h3>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm leading-6 text-text-secondary">
                  {modeInfo.points.map((point) => (
                    <li className="flex gap-2" key={point}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="limit" className="rounded-2xl border border-accent/30 bg-accent/10 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
              <AccordionTrigger className="hover:no-underline py-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <Lightbulb className="h-4 w-4 text-accent" aria-hidden="true" />
                  模型说明
                </h3>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-6 text-text-secondary">{lesson.limitation}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
  const isLong = value.length > 18;

  if (isLong) {
    return (
      <div className="space-y-1 rounded-lg bg-white/60 px-3 py-2">
        <span className="text-text-secondary">{label}</span>
        <div className={`${strong ? "font-semibold text-primary-dark" : "text-text-primary"} leading-6`}>
          {value}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-text-secondary">{label}</span>
      <span className={`text-right ${strong ? "font-semibold text-primary-dark" : "text-text-primary"}`}>
        {value}
      </span>
    </div>
  );
}
