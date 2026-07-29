import { Info, Target } from "lucide-react";
import type {
  CrystalCellFrameMode,
  CrystalSupercellSize,
} from "@/hooks/useCrystalWorkspaceControls";
import type { NaClCoordinationDisplayCluster } from "@/components/three/naclPeriodicGeometry";

// ---------------------------------------------------------------------------
// NaCl 周期探索状态面板（T-028B 基础 + T-028C 动态选择摘要）。
//
// 不是步骤式教学面板，而是当前模型状态摘要。周期模式下用它替代 CrystalKnowledgePanel。
// 返回教学模式后由 ModuleDetailPage 恢复原 CrystalKnowledgePanel。
//
// T-028C：存在选择（cluster 非 null）时增加「当前选择」区域，说明选中离子、显示身份、
// 第一配位数、周期补齐（幽灵）数量等。幽灵数量与配位信息全部来自页面层传入的纯函数
// cluster，不在本组件重复配位算法。T-028D 只播报一条精简状态，避免整个面板反复朗读。
// ---------------------------------------------------------------------------

type NaClPeriodicPanelProps = {
  supercellSize: CrystalSupercellSize;
  cellFrameMode: CrystalCellFrameMode;
  /** 第一配位层显示模型；null 表示当前未选择离子。 */
  cluster: NaClCoordinationDisplayCluster | null;
  /** 是否处于仅看配位层（隔离）模式。 */
  isolateCoordination: boolean;
};

export function NaClPeriodicPanel({
  supercellSize,
  cellFrameMode,
  cluster,
  isolateCoordination,
}: NaClPeriodicPanelProps) {
  const N = supercellSize;
  const cellCount = N ** 3; // 常规晶胞数
  const formulaUnits = 4 * N ** 3; // NaCl 化学式单位
  const independentSites = 8 * N ** 3; // 周期模型中不重复计数的离子位点
  const ionPerType = 4 * N ** 3; // Na⁺ 或 Cl⁻ 各自
  const displayInstances = (2 * N + 1) ** 3; // 显示实例

  const frameModeLabel: Record<CrystalCellFrameMode, string> = {
    outer: "外边框",
    all: "全部晶胞",
    hidden: "隐藏边框",
  };

  // T-028C：从 cluster 派生选择摘要（不重复配位算法）。
  const selection = cluster
    ? (() => {
        const centerShift = cluster.center.periodicImageShift;
        const isBodyCopy = centerShift.every((c) => c === 0);
        const ghostCount = cluster.neighbors.filter((n) => n.isGhost).length;
        const centerElement = cluster.center.element === "Na+" ? "Na⁺" : "Cl⁻";
        const neighborElement = cluster.center.element === "Na+" ? "Cl⁻" : "Na⁺";
        return { centerShift, isBodyCopy, ghostCount, centerElement, neighborElement };
      })()
    : null;

  return (
    <aside
      aria-label="NaCl 周期探索状态"
      className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <p
        aria-atomic="true"
        aria-live="polite"
        className="sr-only"
        data-testid="periodic-selection-announcement"
      >
        {selection
          ? `已选择${selection.centerElement}，第一配位数 6，${selection.ghostCount} 个邻居由相邻周期补齐。`
          : "当前未选择离子。"}
      </p>
      <div className="border-b border-white/40 bg-white/40 px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wider text-primary">周期探索模式</p>
          <span className="rounded bg-primary-light/50 px-2 py-0.5 text-xs text-primary-dark">
            {N}×{N}×{N}
          </span>
        </div>
        <h2 className="mt-2 text-2xl font-bold leading-tight text-text-primary">
          NaCl 周期超晶胞
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          从单晶胞扩展为有限周期结构，观察 NaCl 的离子在三维空间的周期排布。当前边框：{frameModeLabel[cellFrameMode]}。
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        {/* T-028C：当前选择区域（存在选择时显示，置于顶部优先展示）。 */}
        {selection ? (
          <section
            className="rounded-2xl border border-primary/30 bg-white/70 p-5 shadow-sm"
            data-testid="periodic-selection"
          >
            <h2 className="flex items-center gap-2 text-base font-semibold text-primary-dark">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" />
              当前选择
            </h2>
            <dl className="mt-3 grid gap-2 text-sm">
              <FactRow
                label="选中离子"
                testid="selection-element"
                value={selection.centerElement}
                strong
              />
              <FactRow label="第一配位数" testid="selection-coordination" value="6" strong />
              <FactRow
                label="最近邻"
                testid="selection-neighbors"
                value={`6 个 ${selection.neighborElement}`}
              />
              <FactRow
                label="周期补齐镜像（幽灵）"
                testid="selection-ghosts"
                value={`${selection.ghostCount} 个来自相邻周期`}
              />
              <FactRow
                label="最近邻距离"
                testid="selection-distance"
                value="a_model/2 = 1（无量纲显示尺度）"
              />
              <FactRow
                label="仅看配位层"
                testid="selection-isolate-state"
                value={isolateCoordination ? "已开启" : "未开启"}
              />
              <FactRow
                label="显示身份"
                muted
                testid="selection-identity"
                value={selection.isBodyCopy ? "显示本体" : "边界显示副本"}
              />
            </dl>
            <p className="mt-3 text-xs leading-6 text-text-secondary">
              {selection.isBodyCopy
                ? "这是当前超晶胞内的显示本体。"
                : "这是为闭合正侧边界而绘制的显示副本；配位中心保留在你实际点击的位置。"}
              {selection.ghostCount > 0
                ? " 其中部分最近邻位于当前超晶胞外，用半透明周期补齐镜像（幽灵粒子）临时补齐。"
                : " 六个最近邻都已存在于当前显示模型内。"}
            </p>
            <p className="mt-2 text-xs leading-6 text-text-secondary">
              虚线仅表示最近邻配位关系，不是共价键。当前前端模型不进行能量或稳定性计算。
            </p>
          </section>
        ) : (
          <section
            className="rounded-2xl border border-dashed border-primary/30 bg-primary-light/20 p-5"
            data-testid="periodic-selection-hint"
          >
            <h2 className="flex items-center gap-2 text-base font-semibold text-primary-dark">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" />
              点击离子查看第一配位层
            </h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              在左侧点击任意 Na⁺ 或 Cl⁻，会高亮它的六个最近邻异号离子，并用虚线标出最近邻配位关系。
            </p>
          </section>
        )}

        <section className="rounded-2xl border border-primary/20 bg-primary-light/30 p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-primary-dark">
            当前模型状态
          </h2>
          <dl className="mt-3 grid gap-2 text-sm">
            <FactRow label="当前范围" testid="periodic-fact-range" value={`${N}×${N}×${N} 超晶胞`} />
            <FactRow label="常规晶胞数" testid="periodic-fact-cells" value={`${cellCount}`} />
            <FactRow label="NaCl 化学式单位" testid="periodic-fact-formula-units" value={`${formulaUnits}`} strong />
            <FactRow label="周期模型中的独立离子位点" testid="periodic-fact-independent" value={`${independentSites}`} strong />
            <FactRow label="Na⁺ 组成位点" testid="periodic-fact-na" value={`${ionPerType}`} />
            <FactRow label="Cl⁻ 组成位点" testid="periodic-fact-cl" value={`${ionPerType}`} />
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
            {independentSites} 个周期模型位点是当前 {N}×{N}×{N} 超晶胞的不重复组成计数
            （Na⁺ 与 Cl⁻ 各 {ionPerType} 个），不是对称学不等价位点数；
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
  muted?: boolean;
  strong?: boolean;
  testid?: string;
};

function FactRow({ label, value, muted = false, strong = false, testid }: FactRowProps) {
  return (
    <div className="flex items-start justify-between gap-3" data-testid={testid}>
      <span className="shrink-0 text-text-secondary">{label}</span>
      <span
        className={`text-right ${
          strong
            ? "font-semibold text-primary-dark"
            : muted
              ? "text-xs text-text-secondary"
              : "text-text-primary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
