import { Info } from "lucide-react";
import type {
  CrystalCellFrameMode,
  CrystalSupercellSize,
} from "@/hooks/useCrystalWorkspaceControls";

// ---------------------------------------------------------------------------
// NaCl 周期探索状态面板（T-028B）。
//
// 不是步骤式教学面板，而是当前模型状态摘要。周期模式下用它替代 CrystalKnowledgePanel。
// 返回教学模式后由 ModuleDetailPage 恢复原 CrystalKnowledgePanel。
// ---------------------------------------------------------------------------

type NaClPeriodicPanelProps = {
  supercellSize: CrystalSupercellSize;
  cellFrameMode: CrystalCellFrameMode;
};

export function NaClPeriodicPanel({ supercellSize, cellFrameMode }: NaClPeriodicPanelProps) {
  const N = supercellSize;
  const cellCount = N ** 3; // 常规晶胞数
  const formulaUnits = 4 * N ** 3; // NaCl 化学式单位
  const independentSites = 8 * N ** 3; // 周期独立位点
  const ionPerType = 4 * N ** 3; // Na⁺ 或 Cl⁻ 各自
  const displayInstances = (2 * N + 1) ** 3; // 显示实例

  const frameModeLabel: Record<CrystalCellFrameMode, string> = {
    outer: "外边框",
    all: "全部晶胞",
    hidden: "隐藏边框",
  };

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="border-b border-white/40 bg-white/40 px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wider text-primary">周期探索模式</p>
          <span className="rounded bg-primary-light/50 px-2 py-0.5 text-xs text-primary-dark">
            {N}×{N}×{N}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-tight text-text-primary">
          NaCl 周期超晶胞
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          从单晶胞扩展为有限周期结构，观察 NaCl 的离子在三维空间的周期排布。当前边框：{frameModeLabel[cellFrameMode]}。
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <section className="rounded-2xl border border-primary/20 bg-primary-light/30 p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-primary-dark">
            当前模型状态
          </h2>
          <dl className="mt-3 grid gap-2 text-sm">
            <FactRow label="当前范围" testid="periodic-fact-range" value={`${N}×${N}×${N} 超晶胞`} />
            <FactRow label="常规晶胞数" testid="periodic-fact-cells" value={`${cellCount}`} />
            <FactRow label="NaCl 化学式单位" testid="periodic-fact-formula-units" value={`${formulaUnits}`} strong />
            <FactRow label="周期独立位点" testid="periodic-fact-independent" value={`${independentSites}`} strong />
            <FactRow label="Na⁺ 独立位点" testid="periodic-fact-na" value={`${ionPerType}`} />
            <FactRow label="Cl⁻ 独立位点" testid="periodic-fact-cl" value={`${ionPerType}`} />
            <FactRow label="当前显示实例" testid="periodic-fact-display" value={`${displayInstances}`} />
          </dl>
        </section>

        <section className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold text-text-primary">
            <Info className="h-4 w-4 text-primary" aria-hidden="true" />
            显示副本说明
          </h3>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            外边界上的显示副本用于闭合周期模型，不代表额外的独立离子，也不重复计入化学组成。
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {independentSites} 个周期独立位点才是真实的离子数量（Na⁺ 与 Cl⁻ 各 {ionPerType} 个）；
            {displayInstances} 个显示实例中多出的部分，是为了让正侧边界视觉闭合而绘制的周期镜像副本。
          </p>
        </section>
      </div>
    </aside>
  );
}

type FactRowProps = {
  label: string;
  value: string;
  strong?: boolean;
  testid?: string;
};

function FactRow({ label, value, strong = false, testid }: FactRowProps) {
  return (
    <div className="flex items-start justify-between gap-3" data-testid={testid}>
      <span className="shrink-0 text-text-secondary">{label}</span>
      <span className={`text-right ${strong ? "font-semibold text-primary-dark" : "text-text-primary"}`}>
        {value}
      </span>
    </div>
  );
}
