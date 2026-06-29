import { FlaskConical, Info, Sigma } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getSigmaPiBondModeInfo } from "@/data/sigmaPiBonds";
import type { SigmaPiBondMode } from "@/types/molecule";

type SigmaPiBondPanelProps = {
  activeMode: SigmaPiBondMode;
};

export function SigmaPiBondPanel({ activeMode }: SigmaPiBondPanelProps) {
  const modeInfo = getSigmaPiBondModeInfo(activeMode);

  return (
    <aside className="flex h-full min-h-[400px] flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
      <div className="border-b border-white/40 bg-white/40 px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wider text-primary">当前专题</p>
          <span className="rounded bg-primary-light/50 px-2 py-0.5 text-xs text-primary-dark">
            成键机制
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-text-primary">σ 键与 π 键</h1>
        <p className="mt-2 font-serif text-sm text-text-secondary">C₂H₄ 中的 C=C 双键</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div key={activeMode} className="motion-fade-in space-y-6">
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
                    <FactRow label="模型对象" value="乙烯 C₂H₄" strong />
                    <FactRow label="核心结论" value={modeInfo.viewerLabel} />
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

            <AccordionItem value="exam" className="rounded-2xl border border-primary/15 bg-primary/5 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
              <AccordionTrigger className="hover:no-underline py-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
                  <Sigma className="h-4 w-4" aria-hidden="true" />
                  考试迁移
                </h3>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-6 text-text-secondary">
                  {modeInfo.examNote}
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="limit" className="rounded-2xl border border-accent/30 bg-accent/10 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
              <AccordionTrigger className="hover:no-underline py-5">
                <h3 className="text-sm font-semibold text-text-primary">模型说明</h3>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-6 text-text-secondary">
                  这里的轨道和电子云是高中课堂教学示意，不是真实量子化学电子密度计算图。
                </p>
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
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-text-secondary">{label}</span>
      <span className={`text-right ${strong ? "font-semibold text-primary-dark" : "text-text-primary"}`}>
        {value}
      </span>
    </div>
  );
}
