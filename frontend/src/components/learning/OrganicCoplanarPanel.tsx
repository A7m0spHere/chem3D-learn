import { AlertTriangle, FlaskConical, Info, RotateCcw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getOrganicCoplanarModeInfo } from "@/data/organicCoplanar";
import type { OrganicCoplanarMode } from "@/types/molecule";

type OrganicCoplanarPanelProps = {
  activeMode: OrganicCoplanarMode;
  vinylAligned: boolean;
};

export function OrganicCoplanarPanel({ activeMode, vinylAligned }: OrganicCoplanarPanelProps) {
  const modeInfo = getOrganicCoplanarModeInfo(activeMode);

  return (
    <aside className="flex h-full min-h-[400px] flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
      <div className="border-b border-white/40 bg-white/40 px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wider text-primary">当前模型</p>
          <span className="rounded bg-primary-light/50 px-2 py-0.5 text-xs text-primary-dark">
            有机结构示例
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-text-primary">
          多取代苯共线共面示例分子
        </h1>
        <p className="mt-2 font-serif text-sm text-text-secondary">
          C6H2(CH3)(CH=CH2)(C≡CH)(NH2)
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div key={activeMode} className="motion-fade-in space-y-6">
          <Accordion type="multiple" defaultValue={["info", "points"]} className="w-full space-y-5">
            <AccordionItem value="info" className="rounded-2xl border border-white/60 bg-white/60 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
              <AccordionTrigger className="hover:no-underline py-5">
                <h3 className="flex items-center gap-2 font-semibold text-text-primary">
                  <Info className="h-4 w-4 text-primary" aria-hidden="true" />
                  基础信息
                </h3>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2 text-sm">
                  <FactRow label="模块定位" value="3D 模型示例 / 概念演示" strong />
                  <FactRow label="苯环平面" value="6 个环 C 与 2 个环上 H 共面" />
                  <FactRow label="判断方法" value="分片段观察，再考虑单键旋转" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="points" className="rounded-2xl border border-white/60 bg-white/60 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
              <AccordionTrigger className="hover:no-underline py-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <FlaskConical className="h-4 w-4 text-primary" aria-hidden="true" />
                  本模式观察点
                </h3>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2 text-sm">
                  {modeInfo.facts.map((fact) => (
                    <FactRow key={fact.label} label={fact.label} value={fact.value} />
                  ))}
                  {activeMode === "rotation" ? (
                    <FactRow
                      label="当前状态"
                      value={vinylAligned ? "乙烯基已与苯环参考平面对齐" : "乙烯基保持默认约 45° 夹角"}
                      strong
                    />
                  ) : null}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tip" className="rounded-2xl border border-primary/15 bg-primary/5 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
              <AccordionTrigger className="hover:no-underline py-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
                  {activeMode === "rotation" ? (
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  )}
                  教学提示
                </h3>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm leading-6 text-text-secondary">
                  {modeInfo.notes.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
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
