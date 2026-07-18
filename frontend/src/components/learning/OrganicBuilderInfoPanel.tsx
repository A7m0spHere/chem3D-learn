import { AlertCircle, CheckCircle2, FlaskConical, Info, Network } from "lucide-react";
import type { KnownMolecule, ValidationResult } from "@/types/organicBuilder";

type OrganicBuilderInfoPanelProps = {
  formula: string;
  functionalGroups: string[];
  knownMolecule?: KnownMolecule;
  relativeMass: number;
  seedNoteZh?: string;
  validation: ValidationResult;
};

export function OrganicBuilderInfoPanel({
  formula,
  functionalGroups,
  knownMolecule,
  relativeMass,
  seedNoteZh,
  validation,
}: OrganicBuilderInfoPanelProps) {
  const progress = validation.totalAtomCount === 0
    ? 0
    : Math.round((validation.completeAtomCount / validation.totalAtomCount) * 100);
  const issuePriority = { "over-valence": 0, disconnected: 1, empty: 2, "under-valence": 3 } as const;
  const primaryIssues = [...validation.issues]
    .sort((first, second) => issuePriority[first.kind] - issuePriority[second.kind])
    .slice(0, 4);

  return (
    <aside className="space-y-4" data-testid="organic-builder-info">
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-primary-dark">
          <FlaskConical className="h-5 w-5" />
          <h2 className="font-bold">结构信息</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <InfoCell label="分子式" value={formula || "—"} testId="builder-formula" />
          <InfoCell label="相对分子质量" value={relativeMass > 0 ? relativeMass.toFixed(3) : "—"} />
          <InfoCell label="独立片段" value={String(validation.fragmentCount)} />
          <InfoCell label="价态完成度" value={`${progress}%`} />
        </div>
      </section>

      <section className={`rounded-2xl border p-5 shadow-sm ${knownMolecule ? "border-primary/30 bg-primary/5" : "border-border bg-white"}`}>
        <div className="flex items-start gap-3">
          {knownMolecule ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          ) : (
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-text-secondary" />
          )}
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">精确结构识别</div>
            {knownMolecule ? (
              <>
                <h3 className="mt-1 text-xl font-black text-text-primary" data-testid="builder-known-name">
                  {knownMolecule.nameZh}
                </h3>
                <p className="text-sm text-text-secondary">{knownMolecule.nameEn} · {knownMolecule.categoryZh}</p>
                <p className="mt-3 text-sm leading-6 text-text-primary">{knownMolecule.summaryZh}</p>
              </>
            ) : (
              <>
                <h3 className="mt-1 font-bold text-text-primary">暂未收录该结构名称</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  系统不会只按分子式猜名称。完成价态并连接为一个整体后，才会与教学词典进行精确匹配。
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary-dark" />
            <h2 className="font-bold text-text-primary">价态诊断</h2>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${validation.isComplete ? "bg-primary/10 text-primary-dark" : "bg-accent/15 text-amber-800"}`}>
            {validation.isComplete ? "结构完整" : "仍在拼装"}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-border/60">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 space-y-2" data-testid="builder-validation-issues">
          {primaryIssues.length > 0 ? primaryIssues.map((issue, index) => (
            <div className="flex items-start gap-2 text-sm leading-5 text-text-secondary" key={`${issue.kind}-${issue.atomId ?? index}`}>
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{issue.messageZh}</span>
            </div>
          )) : (
            <div className="flex items-center gap-2 text-sm text-primary-dark">
              <CheckCircle2 className="h-4 w-4" />所有原子均满足当前中性价态规则。
            </div>
          )}
          {validation.issues.length > primaryIssues.length ? (
            <p className="pl-6 text-xs text-text-secondary">另有 {validation.issues.length - primaryIssues.length} 条同类提示。</p>
          ) : null}
        </div>
      </section>

      {functionalGroups.length > 0 ? (
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-bold text-text-primary">识别到的结构片段</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {functionalGroups.map((group) => (
              <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary-dark" key={group}>
                {group}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-background p-4 text-sm leading-6 text-text-secondary">
        <div className="flex items-start gap-2">
          <Info className="mt-1 h-4 w-4 shrink-0" />
          <p>{seedNoteZh ?? "这里的键长、键角和自动排布用于建立空间直觉，不代表量化计算得到的最低能量构象。"}</p>
        </div>
      </section>
    </aside>
  );
}

function InfoCell({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2.5">
      <div className="text-xs text-text-secondary">{label}</div>
      <div className="mt-0.5 font-bold text-text-primary" data-testid={testId}>{value}</div>
    </div>
  );
}
