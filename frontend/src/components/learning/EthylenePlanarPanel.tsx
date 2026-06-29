import { FlaskConical, Info, LockKeyhole, Orbit } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getEthylenePlanarModeInfo, type EthylenePlaneView } from "@/data/ethylenePlanar";
import type { EthylenePlanarMode } from "@/types/molecule";

type EthylenePlanarPanelProps = {
  activeMode: EthylenePlanarMode;
  planeView: EthylenePlaneView;
};

export function EthylenePlanarPanel({ activeMode, planeView }: EthylenePlanarPanelProps) {
  const modeInfo = getEthylenePlanarModeInfo(activeMode);

  return (
    <aside className="flex h-full min-h-[400px] flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
      <div className="border-b border-white/40 bg-white/40 px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wider text-primary">当前模型</p>
          <span className="rounded bg-primary-light/50 px-2 py-0.5 text-xs text-primary-dark">
            有机基础母体
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-text-primary">乙烯平面结构</h1>
        <p className="mt-2 font-serif text-sm text-text-secondary">C₂H₄</p>
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
                  <FactRow label="分子式" value="C₂H₄" strong />
                  <FactRow label="原子数" value="2 个 C + 4 个 H，共 6 个原子" />
                  <FactRow label="空间特点" value="6 个原子位于同一平面" />
                  {activeMode === "plane" ? (
                    <FactRow label="当前视角" value={planeView === "side" ? "侧视验证共面" : "俯视观察分子平面"} strong />
                  ) : null}
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

            <AccordionItem value="tip" className="rounded-2xl border border-primary/15 bg-primary/5 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
              <AccordionTrigger className="hover:no-underline py-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
                  {activeMode === "rotationLock" ? (
                    <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Orbit className="h-4 w-4" aria-hidden="true" />
                  )}
                  教学提示
                </h3>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-6 text-text-secondary">
                  这不是量子化学精确轨道图，而是高中课堂示意。重点把“共面结构、sp² 构型、π 键、不能自由旋转”连成一条判断逻辑。
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
