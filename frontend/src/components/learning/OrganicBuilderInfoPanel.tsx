import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FlaskConical,
  Info,
  Network,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { formatFormulaSubscripts } from "@/lib/organicBuilderChemistry";
import type { OrganicSystematicNameResult } from "@/lib/organicBuilderNomenclature";
import type {
  BuilderBondAngleMatch,
  KnownMolecule,
  ValidationResult,
} from "@/types/organicBuilder";

type OrganicBuilderInfoPanelProps = {
  bondAngles: BuilderBondAngleMatch[];
  formula: string;
  functionalGroups: string[];
  knownMolecule?: KnownMolecule;
  relativeMass: number;
  seedNoteZh?: string;
  systematicName?: OrganicSystematicNameResult;
  validation: ValidationResult;
};

export function OrganicBuilderInfoPanel({
  bondAngles,
  formula,
  functionalGroups,
  knownMolecule,
  relativeMass,
  seedNoteZh,
  systematicName,
  validation,
}: OrganicBuilderInfoPanelProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const progress = validation.totalAtomCount === 0
    ? 0
    : Math.round((validation.completeAtomCount / validation.totalAtomCount) * 100);
  const issuePriority = { "over-valence": 0, disconnected: 1, empty: 2, "under-valence": 3 } as const;
  const primaryIssues = [...validation.issues]
    .sort((first, second) => issuePriority[first.kind] - issuePriority[second.kind])
    .slice(0, 4);
  const generatedName = systematicName?.status === "generated" ? systematicName : undefined;
  const pendingNameReason = systematicName?.status === "not-ready"
    ? systematicName.reasonZh
    : "完成价态并连接为一个整体后生成名称。";
  const angleGroups = groupBondAngleMatches(bondAngles);
  const nameState = getNameState(knownMolecule, generatedName, systematicName, pendingNameReason);

  return (
    <aside data-testid="organic-builder-info">
      <section className="rounded-2xl border border-white/80 bg-white/92 p-4 shadow-overlay backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3 pr-9">
          <div className="flex min-w-0 items-center gap-2 text-primary-dark">
            <FlaskConical className="h-5 w-5 shrink-0" />
            <h2 className="font-bold">结构信息</h2>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${validation.isComplete ? "bg-primary/10 text-primary-dark" : "bg-accent/15 text-accent-dark"}`}>
            {validation.isComplete ? "结构完整" : "仍在拼装"}
          </span>
        </div>

        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.04] p-3">
          <div className="flex items-start gap-3">
            {knownMolecule ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            ) : generatedName ? (
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            ) : (
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-text-secondary" />
            )}
            <div className="min-w-0">
              <div className="text-xs font-semibold text-text-secondary">{nameState.label}</div>
              <h3
                className="mt-0.5 break-words text-lg font-black leading-snug text-text-primary"
                data-testid={knownMolecule ? "builder-known-name" : generatedName ? "builder-systematic-name" : nameState.testId}
              >
                {nameState.title}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-text-secondary">{nameState.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <InfoCell label="分子式" value={formula ? formatFormulaSubscripts(formula) : "—"} testId="builder-formula" />
          <InfoCell label="相对分子质量" value={relativeMass > 0 ? relativeMass.toFixed(3) : "—"} />
          <InfoCell label="独立片段" value={String(validation.fragmentCount)} />
          <InfoCell label="价态完成度" value={`${progress}%`} />
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-border/60">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className={`mt-2 text-xs leading-5 ${validation.isComplete ? "text-primary-dark" : "text-text-secondary"}`}>
          {validation.isComplete
            ? "所有原子满足当前中性价态规则。"
            : primaryIssues[0]?.messageZh ?? "继续添加或连接原子。"}
          {validation.issues.length > 1 ? `（另有 ${validation.issues.length - 1} 项）` : ""}
        </p>

        <button
          aria-controls="builder-diagnostics"
          aria-expanded={detailsOpen}
          className="mt-3 flex min-h-11 w-full items-center justify-between rounded-xl border border-border bg-background px-3 text-sm font-bold text-text-primary transition-colors hover:border-primary/40 hover:bg-primary/[0.03] focus:outline-none focus:ring-2 focus:ring-primary/30"
          data-testid="builder-diagnostics-toggle"
          onClick={() => setDetailsOpen((open) => !open)}
          type="button"
        >
          <span>诊断详情</span>
          <span className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
            {validation.issues.length} 项提示
            <ChevronDown className={`h-4 w-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
          </span>
        </button>

        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out-soft ${detailsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          id="builder-diagnostics"
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-4 border-t border-border pt-4 mt-4" data-testid="builder-diagnostics-content">
              {angleGroups.length > 0 ? (
                <section data-testid="builder-bond-angle-matches">
                  <DetailHeading icon={<Network className="h-4 w-4" />} title="自动键角匹配" />
                  <div className="mt-2 space-y-2">
                    {angleGroups.map((group) => (
                      <div className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2" key={group.key}>
                        <div className="min-w-0 text-sm font-bold text-text-primary">
                          {group.geometryZh} · {group.hybridization}
                          <span className="ml-1 text-xs font-normal text-text-secondary">{group.centerElements.join("/")} 中心 · {group.count} 处</span>
                        </div>
                        <div className="shrink-0 text-sm font-black text-accent">{group.label}</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-text-secondary">典型教学值，不是当前坐标的量化实测键角。</p>
                </section>
              ) : null}

              {generatedName ? (
                <section>
                  <DetailHeading icon={<Sparkles className="h-4 w-4" />} title="命名说明" />
                  {generatedName.teachingAlias ? (
                    <div className="mt-2 rounded-lg bg-primary/[0.04] px-3 py-2" data-testid="builder-position-alias">
                      <div className="text-xs font-semibold text-primary-dark">位次教学别名</div>
                      <p className="mt-1 text-sm font-bold text-text-primary">
                        {generatedName.teachingAlias.descriptorZh} · {generatedName.teachingAlias.descriptorEn}
                      </p>
                      {generatedName.teachingAlias.nameZh ? <p className="mt-1 text-sm text-text-primary">{generatedName.teachingAlias.nameZh}</p> : null}
                      {generatedName.teachingAlias.nameEn ? <p className="break-words text-xs text-text-secondary">{generatedName.teachingAlias.nameEn}</p> : null}
                    </div>
                  ) : null}
                  <p className="mt-2 text-xs leading-5 text-text-secondary">{generatedName.noteZh}</p>
                </section>
              ) : null}

              <section data-testid="builder-validation-issues">
                <DetailHeading icon={<AlertCircle className="h-4 w-4" />} title="价态与连接" />
                <div className="mt-2 space-y-2">
                  {primaryIssues.length > 0 ? primaryIssues.map((issue, index) => (
                    <div className="flex items-start gap-2 text-xs leading-5 text-text-secondary" key={`${issue.kind}-${issue.atomId ?? index}`}>
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                      <span>{issue.messageZh}</span>
                    </div>
                  )) : (
                    <div className="flex items-center gap-2 text-xs text-primary-dark">
                      <CheckCircle2 className="h-3.5 w-3.5" />所有原子均满足当前中性价态规则。
                    </div>
                  )}
                  {validation.issues.length > primaryIssues.length ? (
                    <p className="pl-5 text-xs text-text-secondary">另有 {validation.issues.length - primaryIssues.length} 条同类提示。</p>
                  ) : null}
                </div>
              </section>

              {functionalGroups.length > 0 ? (
                <section>
                  <h3 className="text-xs font-bold text-text-primary">识别到的结构片段</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {functionalGroups.map((group) => (
                      <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary-dark" key={group}>
                        {group}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="flex items-start gap-2 text-xs leading-5 text-text-secondary">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>{seedNoteZh ?? "键长、键角和自动排布用于建立空间直觉，不代表量化计算得到的最低能量构象。"}</p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}

function getNameState(
  knownMolecule: KnownMolecule | undefined,
  generatedName: Extract<OrganicSystematicNameResult, { status: "generated" }> | undefined,
  systematicName: OrganicSystematicNameResult | undefined,
  pendingNameReason: string,
) {
  if (knownMolecule) {
    return {
      label: "精确结构识别",
      subtitle: `${knownMolecule.nameEn} · ${knownMolecule.categoryZh}`,
      testId: undefined,
      title: knownMolecule.nameZh,
    };
  }
  if (generatedName) {
    return {
      label: "系统命名（本地基础规则）",
      subtitle: `${generatedName.nameEn} · ${generatedName.categoryZh}`,
      testId: undefined,
      title: generatedName.nameZh,
    };
  }
  if (systematicName?.status === "unsupported") {
    return {
      label: "系统命名",
      subtitle: systematicName.reasonZh,
      testId: "builder-name-unsupported",
      title: "超出当前命名范围",
    };
  }
  return {
    label: "结构名称",
    subtitle: pendingNameReason,
    testId: undefined,
    title: "完成结构后生成名称",
  };
}

function groupBondAngleMatches(matches: BuilderBondAngleMatch[]) {
  const grouped = new Map<string, {
    key: string;
    label: string;
    geometryZh: string;
    hybridization: BuilderBondAngleMatch["hybridization"];
    centerElements: Set<string>;
    count: number;
  }>();
  for (const match of matches) {
    const key = `${match.geometryZh}-${match.hybridization}-${match.label}`;
    const current = grouped.get(key) ?? {
      key,
      label: match.label,
      geometryZh: match.geometryZh,
      hybridization: match.hybridization,
      centerElements: new Set<string>(),
      count: 0,
    };
    current.centerElements.add(match.centerElement);
    current.count += 1;
    grouped.set(key, current);
  }
  return [...grouped.values()].map((group) => ({
    ...group,
    centerElements: [...group.centerElements].sort(),
  }));
}

function DetailHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold text-primary-dark">
      {icon}
      <h3>{title}</h3>
    </div>
  );
}

function InfoCell({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2">
      <div className="text-[11px] text-text-secondary">{label}</div>
      <div className="mt-0.5 font-bold text-text-primary" data-testid={testId}>{value}</div>
    </div>
  );
}
