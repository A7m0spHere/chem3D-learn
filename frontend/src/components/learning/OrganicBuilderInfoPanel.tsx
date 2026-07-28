import { AlertCircle, CheckCircle2, FlaskConical, Info, Network, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const progress = validation.totalAtomCount === 0
    ? 0
    : Math.round((validation.completeAtomCount / validation.totalAtomCount) * 100);
  const issuePriority = { "over-valence": 0, disconnected: 1, empty: 2, "under-valence": 3 } as const;
  const primaryIssues = [...validation.issues]
    .sort((first, second) => issuePriority[first.kind] - issuePriority[second.kind])
    .slice(0, 4);
  const generatedName = systematicName?.status === "generated" ? systematicName : undefined;
  const hasResolvedName = Boolean(knownMolecule || generatedName);
  const pendingNameReason = systematicName?.status === "not-ready"
    ? systematicName.reasonZh
    : "完成价态并连接为一个整体后，系统会先匹配教学词典，再按本地规则生成名称。";
  const angleGroups = groupBondAngleMatches(bondAngles);
  // 折叠退场期间继续渲染最后一份非空内容，让区块"带着内容收拢"而不是先清空再塌陷。
  const lastAngleGroupsRef = useRef(angleGroups);
  const lastFunctionalGroupsRef = useRef(functionalGroups);
  useEffect(() => {
    if (angleGroups.length > 0) lastAngleGroupsRef.current = angleGroups;
    if (functionalGroups.length > 0) lastFunctionalGroupsRef.current = functionalGroups;
  });
  const displayAngleGroups = angleGroups.length > 0 ? angleGroups : lastAngleGroupsRef.current;
  const displayFunctionalGroups = functionalGroups.length > 0 ? functionalGroups : lastFunctionalGroupsRef.current;

  return (
    <aside data-testid="organic-builder-info">
      <section className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-overlay backdrop-blur-xl">
        <div className="flex items-center gap-2 text-primary-dark">
          <FlaskConical className="h-5 w-5" />
          <h2 className="font-bold">结构信息</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <InfoCell label="分子式" value={formula ? formatFormulaSubscripts(formula) : "—"} testId="builder-formula" />
          <InfoCell label="相对分子质量" value={relativeMass > 0 ? relativeMass.toFixed(3) : "—"} />
          <InfoCell label="独立片段" value={String(validation.fragmentCount)} />
          <InfoCell label="价态完成度" value={`${progress}%`} />
        </div>
      </section>

      <CollapsibleSection open={angleGroups.length > 0}>
        <section
          className="rounded-2xl border border-accent/30 bg-white/92 p-5 shadow-overlay backdrop-blur-xl"
          data-testid="builder-bond-angle-matches"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-primary-dark">
              <Network className="h-5 w-5" />
              <h2 className="font-bold">自动键角匹配</h2>
            </div>
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent-dark">结构完整</span>
          </div>
          <div className="mt-4 space-y-2.5">
            {displayAngleGroups.map((group) => (
              <div
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5"
                key={group.key}
              >
                <div className="min-w-0">
                  <div className="font-bold text-text-primary">{group.geometryZh} · {group.hybridization}</div>
                  <div className="mt-0.5 text-xs text-text-secondary">
                    {group.centerElements.join("/")} 中心 · {group.count} 处
                  </div>
                </div>
                <div className="shrink-0 text-base font-black text-accent">{group.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-text-secondary">
            依据局部连接、键级和中性价态匹配典型教学值；不是对当前坐标进行量化计算得到的实测键角。
          </p>
        </section>
      </CollapsibleSection>

      <section className={`mt-4 rounded-2xl border p-5 shadow-overlay backdrop-blur-xl ${hasResolvedName ? "border-primary/30 bg-primary/10" : "border-white/80 bg-white/90"}`}>
        <div className="flex items-start gap-3">
          {knownMolecule ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          ) : generatedName ? (
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          ) : (
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-text-secondary" />
          )}
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
              {knownMolecule
                ? "精确结构识别"
                : generatedName
                  ? "系统命名（本地基础规则）"
                  : systematicName?.status === "unsupported"
                    ? "系统命名"
                    : "结构名称"}
            </div>
            {knownMolecule ? (
              <>
                <h3 className="mt-1 text-xl font-black text-text-primary" data-testid="builder-known-name">
                  {knownMolecule.nameZh}
                </h3>
                <p className="text-sm text-text-secondary">{knownMolecule.nameEn} · {knownMolecule.categoryZh}</p>
                <p className="mt-3 text-sm leading-6 text-text-primary">{knownMolecule.summaryZh}</p>
              </>
            ) : generatedName ? (
              <>
                <h3 className="mt-1 break-words text-xl font-black text-text-primary" data-testid="builder-systematic-name">
                  {generatedName.nameZh}
                </h3>
                <p className="break-words text-sm text-text-secondary">
                  {generatedName.nameEn} · {generatedName.categoryZh}
                </p>
                {generatedName.teachingAlias ? (
                  <div
                    className="mt-3 rounded-xl border border-primary/20 bg-white/70 px-3 py-2.5"
                    data-testid="builder-position-alias"
                  >
                    <div className="text-xs font-semibold text-primary-dark">位次教学别名</div>
                    <p className="mt-1 text-sm font-bold text-text-primary">
                      {generatedName.teachingAlias.descriptorZh} · {generatedName.teachingAlias.descriptorEn}
                    </p>
                    {generatedName.teachingAlias.nameZh ? (
                      <p className="mt-1 text-sm text-text-primary">{generatedName.teachingAlias.nameZh}</p>
                    ) : null}
                    {generatedName.teachingAlias.nameEn ? (
                      <p className="break-words text-xs text-text-secondary">{generatedName.teachingAlias.nameEn}</p>
                    ) : null}
                  </div>
                ) : null}
                <p className="mt-3 text-sm leading-6 text-text-primary">{generatedName.noteZh}</p>
              </>
            ) : systematicName?.status === "unsupported" ? (
              <>
                <h3 className="mt-1 font-bold text-text-primary" data-testid="builder-name-unsupported">
                  超出当前命名范围
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{systematicName.reasonZh}</p>
              </>
            ) : (
              <>
                <h3 className="mt-1 font-bold text-text-primary">完成结构后生成名称</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {pendingNameReason}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/80 bg-white/90 p-5 shadow-overlay backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary-dark" />
            <h2 className="font-bold text-text-primary">价态诊断</h2>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${validation.isComplete ? "bg-primary/10 text-primary-dark" : "bg-accent/15 text-accent-dark"}`}>
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

      <CollapsibleSection open={functionalGroups.length > 0}>
        <section className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-overlay backdrop-blur-xl">
          <h2 className="font-bold text-text-primary">识别到的结构片段</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {displayFunctionalGroups.map((group) => (
              <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary-dark" key={group}>
                {group}
              </span>
            ))}
          </div>
        </section>
      </CollapsibleSection>

      <section className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-4 text-sm leading-6 text-text-secondary shadow-lg backdrop-blur-xl">
        <div className="flex items-start gap-2">
          <Info className="mt-1 h-4 w-4 shrink-0" />
          <p>{seedNoteZh ?? "这里的键长、键角和自动排布用于建立空间直觉，不代表量化计算得到的最低能量构象。"}</p>
        </div>
      </section>
    </aside>
  );
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

function InfoCell({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2.5">
      <div className="text-xs text-text-secondary">{label}</div>
      <div className="mt-0.5 font-bold text-text-primary" data-testid={testId}>{value}</div>
    </div>
  );
}

type CollapsePhase = "closed" | "enter" | "open" | "exit";

// 条件区块的高度过渡（grid-rows 0fr↔1fr + 透明度）：
// 出现时从 0 平滑展开，消失时先收拢、动画结束后才真正卸载——
// 浏览器测试对 `toHaveCount(0)` 的既有断言在自动重试内仍然成立。
// 首次挂载即打开时不播动画，避免与整页浮层入场叠加；
// prefers-reduced-motion 由 motion.css 全局把 transition 压到 0.01ms 兜底。
// 区块间距（pt-4）放在收拢内容内部，折叠后不会留下双倍空隙。
function CollapsibleSection({ children, open }: { children: React.ReactNode; open: boolean }) {
  const [phase, setPhase] = useState<CollapsePhase>(open ? "open" : "closed");
  useEffect(() => {
    setPhase((current) => {
      if (open) {
        if (current === "closed") return "enter";
        if (current === "exit") return "open";
        return current;
      }
      return current === "open" || current === "enter" ? "exit" : current;
    });
  }, [open]);
  useEffect(() => {
    if (phase === "enter") {
      const frame = window.requestAnimationFrame(() => setPhase("open"));
      return () => window.cancelAnimationFrame(frame);
    }
    if (phase === "exit") {
      const timer = window.setTimeout(() => setPhase("closed"), 340);
      return () => window.clearTimeout(timer);
    }
  }, [phase]);
  if (phase === "closed") return null;
  const expanded = phase === "open";
  return (
    <div
      aria-hidden={!open}
      className={`grid transition-[grid-template-rows] duration-300 ease-out-soft ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
    >
      <div className="min-h-0 overflow-hidden">
        <div className={`pt-4 transition-opacity duration-300 ease-out-soft ${expanded ? "opacity-100" : "opacity-0"}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
