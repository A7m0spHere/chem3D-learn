import { Box, Calculator, ClipboardList, Info, Network } from "lucide-react";
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
  const isHbn = molecule.id === "hbn";
  const isLayeredHex = isGraphite || isHbn;

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
        {mode && isLayeredHex ? (
          <LayeredHexModeCard
            activeMode={activeMode}
            modeBody={mode.bodyZh}
            modeTitle={mode.titleZh}
            moleculeId={isHbn ? "hbn" : "graphite"}
          />
        ) : mode && activeMode === "voids" ? (
          <VoidModeCard
            modeBody={mode.bodyZh}
            modeTitle={mode.titleZh}
            stages={teaching.voidStages ?? []}
            activeStage={voidStage}
            activeStageBody={activeVoidStage?.bodyZh}
            activeStageTitle={activeVoidStage?.titleZh}
            guidanceLines={teaching.voidGuidanceZh}
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

        {teaching.observationGuide ? (
          <ObservationGuideCard guide={teaching.observationGuide} teaching={teaching} />
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

function ObservationGuideCard({
  guide,
  teaching,
}: {
  guide: NonNullable<CrystalTeaching["observationGuide"]>;
  teaching: CrystalTeaching;
}) {
  const modeLabelById = new Map(teaching.viewModes.map((mode) => [mode.id, mode.labelZh]));
  const stageLabelById = new Map((teaching.voidStages ?? []).map((stage) => [stage.id, stage.labelZh]));

  return (
    <section
      className="rounded-2xl border border-accent/30 bg-gradient-to-br from-white via-accent/10 to-primary-light/30 p-5 shadow-sm"
      data-testid="observation-guide-card"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent ring-1 ring-accent/30">
          <ClipboardList className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-text-primary">{guide.titleZh}</h3>
          <p className="mt-1 text-sm leading-6 text-text-secondary">{guide.subtitleZh}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {guide.steps.map((step, index) => {
          const modeLabel = step.modeId ? modeLabelById.get(step.modeId) : undefined;
          const stageLabel = step.stageId ? stageLabelById.get(step.stageId) : undefined;
          const switchLabel = [modeLabel, stageLabel ? normalizeGuideLabel(stageLabel) : undefined]
            .filter((label): label is string => Boolean(label))
            .join(" / ");

          return (
            <article
              className="rounded-xl border border-white/80 bg-white/80 p-4"
              key={`${step.labelZh}-${step.titleZh}`}
            >
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      {step.labelZh}
                    </span>
                    {switchLabel ? (
                      <span className="rounded-full border border-primary/20 bg-white px-2.5 py-1 text-xs font-semibold text-primary-dark">
                        建议切换到：{switchLabel}
                      </span>
                    ) : null}
                  </div>
                  <h4 className="mt-2 text-sm font-bold leading-6 text-text-primary">
                    {step.titleZh}
                  </h4>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">{step.bodyZh}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-primary/20 bg-white/75 p-4">
        <p className="text-xs font-semibold tracking-wider text-primary-dark">教师追问</p>
        <p className="mt-2 text-sm leading-6 text-text-primary">{guide.teacherPromptZh}</p>
      </div>
    </section>
  );
}

function normalizeGuideLabel(label: string) {
  return label.replace("/", "-");
}

type VoidModeCardProps = {
  modeBody: string;
  modeTitle: string;
  stages: NonNullable<CrystalTeaching["voidStages"]>;
  activeStage: CrystalVoidStage;
  activeStageTitle?: string;
  activeStageBody?: string;
  guidanceLines?: string[];
  onStageChange: (stage: CrystalVoidStage) => void;
};

function VoidModeCard({
  modeBody,
  modeTitle,
  stages,
  activeStage,
  activeStageTitle,
  activeStageBody,
  guidanceLines,
  onStageChange,
}: VoidModeCardProps) {
  const resolvedGuidanceLines = guidanceLines ?? [
    "中心标记用于提示可填入小球的位置。",
    "辅助线和轮廓只表示空隙或配位关系，不表示共价键。",
  ];

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
            aria-pressed={stage.id === activeStage}
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
        {resolvedGuidanceLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
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

function LayeredHexModeCard({
  modeBody,
  modeTitle,
  activeMode,
  moleculeId,
}: {
  modeBody: string;
  modeTitle: string;
  activeMode: CrystalViewMode;
  moleculeId: "graphite" | "hbn";
}) {
  return (
    <section className="rounded-2xl border border-primary/20 bg-primary-light/30 p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-primary-dark">
        <Box className="h-4 w-4" aria-hidden="true" />
        {modeTitle}
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-primary">{modeBody}</p>
      <LayeredHexModeFocus activeMode={activeMode} moleculeId={moleculeId} />
      {activeMode === "comparison" && moleculeId === "graphite" ? <GraphiteDiamondComparison /> : null}
      {activeMode === "comparison" && moleculeId === "hbn" ? <HbnGraphiteComparison /> : null}
    </section>
  );
}

function LayeredHexModeFocus({
  activeMode,
  moleculeId,
}: {
  activeMode: CrystalViewMode;
  moleculeId: "graphite" | "hbn";
}) {
  const focusLinesByMolecule: Record<"graphite" | "hbn", Partial<Record<CrystalViewMode, string[]>>> = {
    graphite: {
      layer: ["观察两层是否平行。", "注意下层相对上层有轻微错位。"],
      inPlaneBond: ["高亮中心 C 与 3 个相邻 C。", "这 3 条线表示层内 C-C 共价键。"],
      interlayerForce: ["虚线表示层间范德华力。", "轻微滑动帮助理解石墨质软、易层状剥离。"],
      piElectron: ["半透明云表示层内离域 π 电子。", "离域电子可沿碳层移动，解释导电性。"],
      comparison: ["石墨是层状结构。", "金刚石是三维空间网状结构。"],
    },
    hbn: {
      layer: ["观察每个六元环中 B 和 N 是否交替。", "注意上下层是 B/N 对调的教学堆叠。"],
      inPlaneBond: ["高亮中心 B 与 3 个相邻 N。", "这 3 条线表示层内 B-N 共价键。"],
      interlayerForce: ["虚线表示层间弱相互作用。", "层间不是普通 B-N 共价键。"],
      comparison: ["h-BN 与石墨都呈层状六方骨架。", "h-BN 通常绝缘，石墨可导电。"],
    },
  };
  const lines = focusLinesByMolecule[moleculeId][activeMode];

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

function HbnGraphiteComparison() {
  const rows = [
    ["层内粒子", "B 与 N 交替", "全为 C 原子"],
    ["层内键", "B-N 共价键，有极性", "C-C 共价键，近似非极性"],
    ["结构共同点", "六方层状骨架", "六方层状骨架"],
    ["导电性", "通常为绝缘材料", "可沿层内导电"],
    ["层间特点", "弱相互作用，B/N 上下对应不同", "弱相互作用，层间易滑动"],
  ];

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-border bg-white text-sm">
      <div className="grid grid-cols-[1fr_1fr_1fr] bg-background px-3 py-2 font-semibold text-text-primary">
        <span>对比项</span>
        <span>h-BN</span>
        <span>石墨</span>
      </div>
      {rows.map(([label, hbn, graphite]) => (
        <div className="grid grid-cols-[1fr_1fr_1fr] border-t border-border px-3 py-2 text-text-secondary" key={label}>
          <span className="font-medium text-text-primary">{label}</span>
          <span>{hbn}</span>
          <span>{graphite}</span>
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
