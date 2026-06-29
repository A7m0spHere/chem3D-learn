import { AlertTriangle, Box, Calculator, Info, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type {
  CrystalTeaching,
  CrystalViewMode,
  CrystalVoidStage,
  MoleculeRecord,
} from "@/types/molecule";

type CrystalKnowledgePanelProps = {
  molecule: MoleculeRecord;
  activeMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
  onVoidStageChange: (stage: CrystalVoidStage) => void;
};

export function CrystalKnowledgePanel({
  molecule,
  activeMode,
  voidStage,
  onVoidStageChange,
}: CrystalKnowledgePanelProps) {
  const teaching = molecule.crystalTeaching;
  const mode = teaching?.viewModes.find((item) => item.id === activeMode);
  const activeVoidStage = teaching?.voidStages?.find((stage) => stage.id === voidStage);
  const isGraphite = molecule.id === "graphite";

  if (!teaching) {
    return (
      <aside className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-text-primary">{molecule.nameZh}</h2>
        <p className="mt-3 leading-7 text-text-secondary">{molecule.summaryZh}</p>
      </aside>
    );
  }

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="border-b border-white/40 bg-white/40 px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wider text-primary">当前晶体模型</p>
          <span className="rounded bg-primary-light/50 px-2 py-0.5 text-xs text-primary-dark">
            {teaching.currentModelZh ?? teaching.modelZh}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-text-primary">
          {molecule.nameZh}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{molecule.summaryZh}</p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        {mode && isGraphite ? (
          <GraphiteModeCard modeBody={mode.bodyZh} modeTitle={mode.titleZh} activeMode={activeMode} />
        ) : mode && activeMode === "voids" ? (
          <VoidModeCard
            modeBody={mode.bodyZh}
            modeTitle={mode.titleZh}
            stages={teaching.voidStages ?? []}
            activeStage={voidStage}
            activeStageBody={activeVoidStage?.bodyZh}
            activeStageTitle={activeVoidStage?.titleZh}
            onStageChange={onVoidStageChange}
          />
        ) : mode ? (
          <section className="rounded-2xl border border-primary/20 bg-primary-light/30 p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-primary-dark">
              <Box className="h-4 w-4" aria-hidden="true" />
              {mode.titleZh}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-primary">{mode.bodyZh}</p>
          </section>
        ) : null}

        {teaching.teachingTipZh ? (
          <section className="rounded-2xl border border-primary/20 bg-primary-light/30 p-5">
            <h3 className="flex items-center gap-2 font-semibold text-primary-dark">
              <Info className="h-4 w-4" aria-hidden="true" />
              教学提示
            </h3>
            <p className="mt-3 text-sm leading-6 text-text-primary">{teaching.teachingTipZh}</p>
          </section>
        ) : null}

        <Accordion type="multiple" defaultValue={["info"]} className="w-full space-y-5">
          <AccordionItem value="info" className="rounded-2xl border border-white/60 bg-white/60 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
            <AccordionTrigger className="hover:no-underline py-5">
              <h3 className="flex items-center gap-2 font-semibold text-text-primary">
                <Info className="h-4 w-4 text-primary" aria-hidden="true" />
                基础信息
              </h3>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-2 text-sm">
                <FactRow label="晶体类型" value={teaching.structureTypeZh} strong />
                <FactRow label="结构模型" value={teaching.modelZh} />
                <FactRow label="配位数" value={teaching.coordinationNumberZh} />
                <FactRow label={teaching.spatialFeatureLabelZh ?? "空间特征"} value={teaching.spatialFeatureZh} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="composition" className="rounded-2xl border border-white/60 bg-white/60 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
            <AccordionTrigger className="hover:no-underline py-5">
              <h3 className="flex items-center gap-2 font-semibold text-text-primary">
                <Box className="h-4 w-4 text-primary" aria-hidden="true" />
                晶胞组成
              </h3>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm leading-6 text-text-secondary">{teaching.unitCellDescriptionZh}</p>
            </AccordionContent>
          </AccordionItem>

          <ParticleCountCard teaching={teaching} />

          <AccordionItem value="coordination" className="rounded-2xl border border-white/60 bg-white/60 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
            <AccordionTrigger className="hover:no-underline py-5">
              <h3 className="flex items-center gap-2 font-semibold text-text-primary">
                <Network className="h-4 w-4 text-primary" aria-hidden="true" />
                配位关系
              </h3>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 text-sm leading-6 text-text-secondary">
                {teaching.coordinationDescriptionZh.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  );
}

type VoidModeCardProps = {
  modeBody: string;
  modeTitle: string;
  stages: NonNullable<CrystalTeaching["voidStages"]>;
  activeStage: CrystalVoidStage;
  activeStageTitle?: string;
  activeStageBody?: string;
  onStageChange: (stage: CrystalVoidStage) => void;
};

function VoidModeCard({
  modeBody,
  modeTitle,
  stages,
  activeStage,
  activeStageTitle,
  activeStageBody,
  onStageChange,
}: VoidModeCardProps) {
  return (
    <section className="rounded-2xl border border-primary/20 bg-primary-light/30 p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-primary-dark">
        <Box className="h-4 w-4" aria-hidden="true" />
        {modeTitle}
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-primary">{modeBody}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {stages.map((stage) => (
          <Button
            className="rounded-full px-3"
            key={stage.id}
            onClick={() => onStageChange(stage.id)}
            size="sm"
            type="button"
            variant={stage.id === activeStage ? "default" : "secondary"}
          >
            {stage.labelZh}
          </Button>
        ))}
      </div>

      {activeStageTitle && activeStageBody ? (
        <div className="mt-4 rounded-xl border border-border/80 bg-white/85 p-4">
          <h3 className="text-sm font-semibold text-text-primary">{activeStageTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{activeStageBody}</p>
        </div>
      ) : null}

      <div className="mt-4 space-y-2 text-sm leading-6 text-text-secondary">
        <p>中心标记用于提示可填入小球的位置。</p>
        <p>辅助线和轮廓只表示空隙或配位关系，不表示共价键。</p>
      </div>
    </section>
  );
}

function ParticleCountCard({ teaching }: { teaching: CrystalTeaching }) {
  const countLines =
    teaching.particleCountZh.lines ??
    [
      teaching.particleCountZh.cl,
      teaching.particleCountZh.na,
      teaching.particleCountZh.cs,
      teaching.particleCountZh.formula,
    ].filter((line): line is string => Boolean(line));

  return (
    <AccordionItem value="count" className="rounded-2xl border border-white/60 bg-white/60 px-5 shadow-sm border-b-0 data-[state=open]:pb-2">
      <AccordionTrigger className="hover:no-underline py-5">
        <h3 className="flex items-center gap-2 font-semibold text-text-primary">
          <Calculator className="h-4 w-4 text-primary" aria-hidden="true" />
          粒子个数计算
        </h3>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2 rounded-xl bg-white p-4 font-mono text-sm text-text-primary">
          {countLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <p className="mt-3 text-sm font-semibold text-primary-dark">{teaching.particleCountZh.ratio}</p>
      </AccordionContent>
    </AccordionItem>
  );
}

function GraphiteModeCard({
  modeBody,
  modeTitle,
  activeMode,
}: {
  modeBody: string;
  modeTitle: string;
  activeMode: CrystalViewMode;
}) {
  return (
    <section className="rounded-2xl border border-primary/20 bg-primary-light/30 p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-primary-dark">
        <Box className="h-4 w-4" aria-hidden="true" />
        {modeTitle}
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-primary">{modeBody}</p>
      <GraphiteModeFocus activeMode={activeMode} />
      {activeMode === "comparison" ? <GraphiteDiamondComparison /> : null}
    </section>
  );
}

function GraphiteModeFocus({ activeMode }: { activeMode: CrystalViewMode }) {
  const focusLines: Partial<Record<CrystalViewMode, string[]>> = {
    layer: ["观察两层是否平行。", "注意下层相对上层有轻微错位。"],
    inPlaneBond: ["高亮中心 C 与 3 个相邻 C。", "这 3 条线表示层内 C-C 共价键。"],
    interlayerForce: ["虚线表示层间范德华力。", "轻微滑动帮助理解石墨质软、易层状剥离。"],
    piElectron: ["半透明云表示层内离域 π 电子。", "离域电子可沿碳层移动，解释导电性。"],
    comparison: ["石墨是层状结构。", "金刚石是三维空间网状结构。"],
  };
  const lines = focusLines[activeMode];

  if (!lines) return null;

  return (
    <ul className="mt-4 space-y-2 rounded-xl border border-white/80 bg-white/72 p-4 text-sm leading-6 text-text-secondary">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

function GraphiteDiamondComparison() {
  const rows = [
    ["杂化方式", "sp²", "sp³"],
    ["每个 C 连接数", "3 个 C", "4 个 C"],
    ["结构", "平面六边形层状结构", "三维空间网状结构"],
    ["导电性", "可导电", "通常不导电"],
    ["硬度", "较软，层间易滑动", "很硬"],
  ];

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-border bg-white text-sm">
      <div className="grid grid-cols-[1fr_1fr_1fr] bg-background px-3 py-2 font-semibold text-text-primary">
        <span>对比项</span>
        <span>石墨</span>
        <span>金刚石</span>
      </div>
      {rows.map(([label, graphite, diamond]) => (
        <div className="grid grid-cols-[1fr_1fr_1fr] border-t border-border px-3 py-2 text-text-secondary" key={label}>
          <span className="font-medium text-text-primary">{label}</span>
          <span>{graphite}</span>
          <span>{diamond}</span>
        </div>
      ))}
    </div>
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
