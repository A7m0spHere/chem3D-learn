import { ArrowRight, Info, Target } from "lucide-react";
import {
  StructureInfoDisclosure,
  type StructureInfoItem,
} from "@/components/learning/StructureInfoDisclosure";
import type {
  CrystalCellFrameMode,
  CrystalSupercellSize,
} from "@/hooks/useCrystalWorkspaceControls";
import type { NaClCoordinationDisplayCluster } from "@/components/three/naclPeriodicGeometry";

type NaClPeriodicPanelProps = {
  supercellSize: CrystalSupercellSize;
  cellFrameMode: CrystalCellFrameMode;
  cluster: NaClCoordinationDisplayCluster | null;
  isolateCoordination: boolean;
};

const frameModeLabel: Record<CrystalCellFrameMode, string> = {
  outer: "外边框",
  all: "全部晶胞",
  hidden: "隐藏边框",
};

export function NaClPeriodicPanel({
  supercellSize,
  cellFrameMode,
  cluster,
  isolateCoordination,
}: NaClPeriodicPanelProps) {
  const N = supercellSize;
  const cellCount = N ** 3;
  const formulaUnits = 4 * N ** 3;
  const independentSites = 8 * N ** 3;
  const ionPerType = 4 * N ** 3;
  const displayInstances = (2 * N + 1) ** 3;
  const selection = cluster
    ? (() => {
        const centerShift = cluster.center.periodicImageShift;
        const isBodyCopy = centerShift.every((coordinate) => coordinate === 0);
        const ghostCount = cluster.neighbors.filter((neighbor) => neighbor.isGhost).length;
        const centerElement = cluster.center.element === "Na+" ? "Na⁺" : "Cl⁻";
        const neighborElement = cluster.center.element === "Na+" ? "Cl⁻" : "Na⁺";
        return { centerElement, ghostCount, isBodyCopy, neighborElement };
      })()
    : null;

  const facts: StructureInfoItem[] = [
    {
      label: "当前范围",
      testId: "periodic-fact-range",
      value: `${N}×${N}×${N} 超晶胞`,
    },
    {
      label: "常规晶胞数",
      testId: "periodic-fact-cells",
      value: `${cellCount}`,
    },
    {
      label: "NaCl 化学式单位",
      testId: "periodic-fact-formula-units",
      value: `${formulaUnits}`,
    },
    {
      label: "周期模型中的独立离子位点",
      testId: "periodic-fact-independent",
      value: `${independentSites}`,
    },
    {
      label: "Na⁺ / Cl⁻ 组成位点",
      testId: "periodic-fact-ion-counts",
      value: `各 ${ionPerType}`,
    },
    {
      label: "当前显示实例",
      testId: "periodic-fact-display",
      value: `${displayInstances}`,
    },
    {
      label: "显示边界",
      value: `当前为“${frameModeLabel[cellFrameMode]}”；边界镜像只用于闭合画面，不重复计入组成。`,
    },
  ];

  return (
    <section aria-label="NaCl 周期探索状态" className="space-y-3">
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

      {selection ? (
        <section
          className="rounded-2xl border border-primary/25 bg-primary-light/20 px-4 py-3 shadow-sm sm:px-5"
          data-testid="periodic-selection"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-bold text-primary-dark">
              <Target className="h-4 w-4 text-primary" aria-hidden="true" />
              已选 {selection.centerElement} · 第一配位层
            </h2>
            <span className="text-xs font-semibold text-text-secondary">
              {isolateCoordination ? "仅看配位层" : "完整周期背景"}
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
            <CompactFact label="选中离子" testId="selection-element" value={selection.centerElement} />
            <CompactFact label="第一配位数" testId="selection-coordination" value="6" />
            <CompactFact label="最近邻" testId="selection-neighbors" value={`6 个 ${selection.neighborElement}`} />
            <CompactFact label="周期补齐" testId="selection-ghosts" value={`${selection.ghostCount} 个镜像`} />
            <CompactFact label="最近邻距离" testId="selection-distance" value="a_model/2 = 1（无量纲显示尺度）" />
            <CompactFact label="隔离状态" testId="selection-isolate-state" value={isolateCoordination ? "已开启" : "未开启"} />
            <CompactFact
              label="显示身份"
              testId="selection-identity"
              value={selection.isBodyCopy ? "显示本体" : "边界显示副本"}
            />
          </dl>
        </section>
      ) : (
        <div
          className="flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary-light/15 px-4 py-2 text-sm text-text-secondary"
          data-testid="periodic-selection-hint"
        >
          <Target className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          点击任一 Na⁺ 或 Cl⁻，查看它的六个最近邻与跨边界周期补齐。
        </div>
      )}

      <StructureInfoDisclosure
        facts={facts}
        summaryItems={[
          { label: "单胞", value: "1 个单胞" },
          { label: "复制", value: `沿 a、b、c 各复制 ${N} 次` },
          { label: "超晶胞", value: `${cellCount} 个晶胞` },
        ]}
        title="周期结构信息"
      />

      <p className="flex items-start gap-2 px-1 text-xs leading-5 text-text-secondary">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span className="inline-flex flex-wrap items-center gap-x-1">
          单个晶胞 <ArrowRight className="h-3 w-3" aria-hidden="true" /> 三轴周期复制
          <ArrowRight className="h-3 w-3" aria-hidden="true" /> 形成当前超晶胞；虚线只表示最近邻配位，不是共价键。
        </span>
      </p>
    </section>
  );
}

type CompactFactProps = {
  label: string;
  testId: string;
  value: string;
};

function CompactFact({ label, testId, value }: CompactFactProps) {
  return (
    <div className="min-w-0" data-testid={testId}>
      <dt className="text-xs font-semibold text-text-secondary">{label}</dt>
      <dd className="mt-0.5 break-words font-semibold text-text-primary">{value}</dd>
    </div>
  );
}
