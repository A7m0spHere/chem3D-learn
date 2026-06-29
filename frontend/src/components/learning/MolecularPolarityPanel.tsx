import { AlertTriangle, CheckCircle2, Compass, Info, Route } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  bondDipoleExamples,
  electronegativityOrder,
  getMolecularPolarityModeInfo,
  polarityCoreSentence,
  polarityJudgmentFlow,
  type MolecularPolarityMode,
} from "@/data/molecularPolarity";

type MolecularPolarityPanelProps = {
  activeMode: MolecularPolarityMode;
};

export function MolecularPolarityPanel({ activeMode }: MolecularPolarityPanelProps) {
  const modeInfo = getMolecularPolarityModeInfo(activeMode);

  return (
    <aside className="flex h-full min-h-[400px] flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
      <div className="border-b border-white/40 bg-white/40 px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wider text-primary">分子极性判断</p>
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary-dark">
            {modeInfo.result ?? "判断流程"}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-text-primary">
          {modeInfo.title}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">{modeInfo.subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div key={activeMode} className="motion-fade-in space-y-6">
          <section className="rounded-2xl border border-primary/15 bg-primary/5 p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
              <Route className="h-4 w-4" aria-hidden="true" />
              判断流程
            </h3>
            <p className="mt-3 text-sm leading-6 text-text-primary">{polarityJudgmentFlow}</p>
            <p className="mt-3 rounded-xl border border-white/70 bg-white/75 px-3 py-2 text-sm font-semibold leading-6 text-primary-dark">
              {polarityCoreSentence}
            </p>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white shadow-[0_0_15px_rgba(42,157,143,0.4)]">
                {modeIndex(activeMode)}
              </span>
              <h2 className="text-lg font-semibold text-text-primary">{modeInfo.label}</h2>
            </div>
            <p className="text-base leading-relaxed text-text-secondary">{modeInfo.description}</p>
          </section>

          <Accordion type="multiple" defaultValue={["points"]} className="w-full space-y-5">
            {activeMode === "electronegativity" ? (
              <AccordionItem value="electronegativity" className="rounded-2xl border border-white/60 bg-white/60 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
                <AccordionTrigger className="hover:no-underline py-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
                    电负性顺序
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-2 text-sm">
                    {electronegativityOrder.map((item) => (
                      <FactRow
                        key={item.element}
                        label={`${item.element}：${item.value}`}
                        value={item.note}
                        strong={item.element === "F" || item.element === "B"}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ) : null}

            {activeMode === "bondDipole" ? (
              <AccordionItem value="bondDipole" className="rounded-2xl border border-white/60 bg-white/60 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
                <AccordionTrigger className="hover:no-underline py-5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
                    本模块涉及的键偶极
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-2 text-sm">
                    {bondDipoleExamples.map((item) => (
                      <FactRow
                        key={item.bond}
                        label={`${item.bond}：${item.direction}`}
                        value={item.note}
                        strong
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ) : null}

            <AccordionItem value="points" className="rounded-2xl border border-white/60 bg-white/60 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
              <AccordionTrigger className="hover:no-underline py-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <Info className="h-4 w-4 text-primary" aria-hidden="true" />
                  本模式观察点
                </h3>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm leading-6 text-text-secondary">
                  {modeInfo.points.map((point) => (
                    <li className="flex gap-2" key={point}>
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tip" className="rounded-2xl border border-accent/25 bg-accent/10 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
              <AccordionTrigger className="hover:no-underline py-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  课堂提醒
                </h3>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-6 text-text-secondary">
                  这里的电子云、键偶极和合偶极矩箭头是高中课堂示意。重点不是计算偶极矩大小，而是把键极性和空间构型一起判断。
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </aside>
  );
}

function modeIndex(mode: MolecularPolarityMode): string {
  const order: MolecularPolarityMode[] = [
    "electronegativity",
    "bondDipole",
    "hcl",
    "water",
    "hypochlorousAcid",
    "bf3",
  ];
  return String(order.indexOf(mode) + 1);
}

type FactRowProps = {
  label: string;
  value: string;
  strong?: boolean;
};

function FactRow({ label, value, strong = false }: FactRowProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className={`shrink-0 ${strong ? "font-semibold text-primary-dark" : "text-text-primary"}`}>
        {label}
      </span>
      <span className="text-right text-text-secondary">{value}</span>
    </div>
  );
}
