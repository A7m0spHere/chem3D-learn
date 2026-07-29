import { Canvas, type ThreeEvent, useThree } from "@react-three/fiber";
import { Instances, Instance, Line, OrbitControls, useCursor } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import { StickCylinder } from "@/components/three/StickCylinder";
import { SceneLighting } from "@/components/three/SceneLighting";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { CrystalAtomLegend } from "@/components/three/CrystalAtomLegend";
import {
  generateNaClCellFrameSegments,
  generateNaClDisplayInstances,
  generateNaClPeriodicSites,
  type CrystalCellFrameMode,
  type NaClCoordinationDisplayAtom,
  type NaClCoordinationDisplayCluster,
  type NaClDisplaySelection,
  type NaClPeriodicSite,
} from "@/components/three/naclPeriodicGeometry";
import type { MoleculeRecord } from "@/types/molecule";

// ---------------------------------------------------------------------------
// NaCl 周期探索 Viewer（T-028B 周期扩展 + T-028C 粒子选择与第一配位层隔离）。
//
// 与现有教材教学 Viewer（NaClCell.tsx，使用 nacl.json 的 27 个边界展开位置）
// 并存：本 Viewer 不读 nacl.json 作为周期数据源，几何全部来自 naclPeriodicGeometry
// 纯函数内核。
//
// 关键区分（教学正确性）：
//   - 8·N³（8/64/216）是「周期模型中的独立离子位点」数，不是对称学不等价位点数；
//   - (2N+1)³（27/125/343）是「当前画面中的显示实例」数，含为闭合正侧边界而绘制的
//     显示副本（NaClDisplayInstance）。边界显示副本不重复计入化学组成。
//   - T-028C 的幽灵邻居（isGhost）只是当前配位观察的临时周期镜像，不计入以上任何统计，
//     不写回 canonical sites，也不写回 generateNaClDisplayInstances 的常规显示实例。
//
// 渲染：背景离子用 Drei <Instances>（Na⁺ / Cl⁻ 各一组共享 geometry/material），
// 不为每个粒子创建独立 geometry；聚焦层（中心 + ≤6 邻居 ≤7 个）用少量独立 mesh
// 覆盖渲染，允许精细控制放大 / 发光 / 幽灵透明。虚线仅表示最近邻配位关系，不是共价键。
// ---------------------------------------------------------------------------

type NaClPeriodicCellProps = {
  size: 1 | 2 | 3;
  frameMode: CrystalCellFrameMode;
  molecule: MoleculeRecord;
  /** 当前选择的显示副本身份（siteId + periodicImageShift）；null 表示未选择。 */
  selection: NaClDisplaySelection | null;
  /** 仅看配位层：隐藏背景离子，只显示中心 / 邻居 / 引导线。 */
  isolateCoordination: boolean;
  /** 页面层用纯函数算出的第一配位层；null 表示未选择。避免在多组件重复配位算法。 */
  cluster: NaClCoordinationDisplayCluster | null;
  onSelectInstance: (selection: NaClDisplaySelection) => void;
  onClearSelection: () => void;
  loading?: boolean;
};

// 延续现有 NaCl 教学色彩：Cl⁻ 绿、Na⁺ 蓝（取自 nacl.json 的 color）。
const CL_COLOR = "#10B981";
const NA_COLOR = "#2563EB";
// 背景降权时改用低饱和的浅色（保持不透明，规避透明排序伪影）。
const CL_DIM = "#B9E0D2";
const NA_DIM = "#BBCBEA";
// 配位引导虚线：克制的灰蓝。
const GUIDE_COLOR = "#64748B";

// 周期模式下使用统一元素半径，不按 siteType 决定半径。
const ION_RADIUS = 0.16;
// 中心离子放大倍率与邻居轻度放大。
const CENTER_SCALE = 1.42;
const NEIGHBOR_SCALE = 1.12;

// 每个可点击背景显示实例的完整身份（供点击回传 siteId + periodicImageShift）。
type NaClRenderableInstance = {
  id: string;
  siteId: string;
  element: "Na+" | "Cl-";
  periodicImageShift: [number, number, number];
  cartesian: [number, number, number];
};

/** 把显示实例按子格子分组为完整可点击对象数组（不再用平行数组 + index 对齐）。 */
function groupRenderableInstances(
  sites: NaClPeriodicSite[],
  size: 1 | 2 | 3,
): { chloride: NaClRenderableInstance[]; sodium: NaClRenderableInstance[] } {
  const siteById = new Map(sites.map((s) => [s.id, s]));
  const instances = generateNaClDisplayInstances(sites, size);
  const chloride: NaClRenderableInstance[] = [];
  const sodium: NaClRenderableInstance[] = [];
  for (const inst of instances) {
    const canonical = siteById.get(inst.siteId);
    if (!canonical) continue;
    const renderable: NaClRenderableInstance = {
      id: inst.id,
      siteId: inst.siteId,
      element: canonical.element,
      periodicImageShift: inst.periodicImageShift,
      cartesian: inst.cartesian,
    };
    if (canonical.element === "Cl-") chloride.push(renderable);
    else sodium.push(renderable);
  }
  return { chloride, sodium };
}

/** 按 supercellSize 给出相机距离与 min/max，保证 N=1/2/3 完整结构都在画面内。 */
function getCameraPreset(size: 1 | 2 | 3): {
  position: [number, number, number];
  fov: number;
  maxDistance: number;
  minDistance: number;
} {
  if (size === 1) {
    return { position: [3.2, 2.8, 4.2], fov: 42, maxDistance: 7, minDistance: 2.2 };
  }
  if (size === 2) {
    return { position: [5.4, 4.6, 6.8], fov: 42, maxDistance: 14, minDistance: 3.6 };
  }
  return { position: [7.4, 6.2, 9.0], fov: 42, maxDistance: 20, minDistance: 5.0 };
}

export function NaClPeriodicCell({
  size,
  frameMode,
  molecule,
  selection,
  isolateCoordination,
  cluster,
  onSelectInstance,
  onClearSelection,
  loading = false,
}: NaClPeriodicCellProps) {
  const sites = useMemo(() => generateNaClPeriodicSites(size), [size]);
  const { chloride, sodium } = useMemo(
    () => groupRenderableInstances(sites, size),
    [sites, size],
  );
  const segments = useMemo(
    () => generateNaClCellFrameSegments(size, frameMode),
    [size, frameMode],
  );
  const camera = getCameraPreset(size);

  const independentSites = sites.length; // 8·N³
  const displayInstances = chloride.length + sodium.length; // (2N+1)³
  const hasSelection = selection !== null && cluster !== null;
  // 有选择但未隔离时，背景降权（换低饱和浅色，不用透明度，规避排序伪影）。
  const dimBackground = hasSelection && !isolateCoordination;
  // 隔离模式：完全隐藏背景离子。
  const hideBackground = hasSelection && isolateCoordination;

  const metaSuffix = hasSelection
    ? ` · 已选 ${cluster!.center.element}｜第一配位数 6`
    : " · 点击离子查看第一配位层";

  return (
    <ThreeViewerFrame
      loading={loading}
      meta={`周期探索 · ${size}×${size}×${size} · 拖拽旋转${metaSuffix}`}
      stageTestId={`nacl-periodic-${size}-canvas`}
      summary={(
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="min-w-0" data-testid="nacl-periodic-summary-copy">
            周期模型中的独立离子位点 {independentSites} 个（Na⁺ 与 Cl⁻ 各 {independentSites / 2} 个）；
            显示实例 {displayInstances} 个，含闭合正侧边界的周期镜像副本，不重复计入化学组成。
            点击任一离子可高亮其第一配位层的六个最近邻，虚线是最近邻配位引导线，不是共价键。
          </span>
          <div className="shrink-0">
            <CrystalAtomLegend atoms={molecule.atoms} />
          </div>
        </div>
      )}
      title={`${molecule.formula}｜周期探索 · ${size}×${size}×${size}`}
      viewerTestId={`nacl-periodic-${size}-viewer`}
    >
      {/* 切换尺寸时用 size 作 Canvas key 重新初始化相机，保证完整结构入画。
          取舍：切换尺寸会重置观察角度；当前工作台不持久化相机状态。 */}
      {/* onPointerMissed：点击空白处清除选择。R3F 只在「按下与抬起为同一次点击」
          时触发，拖拽旋转不会误触发；因此不需要不可见大平面遮挡 OrbitControls。
          可靠主路径仍是工具栏「退出选择」按钮。 */}
      <Canvas
        aria-label={`NaCl ${size}×${size}×${size} 周期超晶胞三维视图。拖拽旋转，滚轮缩放，点击离子查看第一配位层。`}
        camera={{ position: camera.position, fov: camera.fov }}
        frameloop="demand"
        key={`nacl-periodic-canvas-${size}`}
        onPointerMissed={() => {
          if (hasSelection) onClearSelection();
        }}
        role="img"
        style={{ height: "100%", width: "100%" }}
      >
        {/* 选择 / 隔离变化时在 demand frameloop 下主动续帧，保证覆盖层正确刷新。 */}
        <InvalidateOnChange
          isolate={isolateCoordination}
          selectionId={cluster?.center.id ?? null}
        />
        <SceneLighting
          ambient={0.68}
          mainIntensity={1.35}
          mainPosition={[4, 5, 4]}
          secondaryIntensity={0.35}
          secondaryPosition={[-3, 2, -4]}
        />
        <group rotation={[0.18, -0.45, 0]}>
          {!hideBackground ? (
            <>
              <IonInstances
                color={dimBackground ? CL_DIM : CL_COLOR}
                idPrefix="cl"
                instances={chloride}
                onSelect={onSelectInstance}
              />
              <IonInstances
                color={dimBackground ? NA_DIM : NA_COLOR}
                idPrefix="na"
                instances={sodium}
                onSelect={onSelectInstance}
              />
            </>
          ) : null}
          <CellFrame dim={isolateCoordination && hasSelection} segments={segments} />
          {hasSelection ? <CoordinationOverlay cluster={cluster!} /> : null}
        </group>
        <OrbitControls
          enableDamping
          enablePan={false}
          maxDistance={camera.maxDistance}
          minDistance={camera.minDistance}
          target={[0, 0, 0]}
        />
      </Canvas>
    </ThreeViewerFrame>
  );
}

// demand frameloop 下，选择 / 隔离切换后主动 invalidate 一帧，避免覆盖层不刷新。
function InvalidateOnChange({
  selectionId,
  isolate,
}: {
  selectionId: string | null;
  isolate: boolean;
}) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
  }, [invalidate, selectionId, isolate]);
  return null;
}

type IonInstancesProps = {
  color: string;
  idPrefix: string;
  instances: NaClRenderableInstance[];
  onSelect: (selection: NaClDisplaySelection) => void;
};

/**
 * 一个子格子的全部背景离子，共享单一 sphereGeometry / material。
 * 每个 <Instance> 用稳定实例 id 作 key，并携带完整身份供点击回传。
 */
function IonInstances({ color, idPrefix, instances, onSelect }: IonInstancesProps) {
  const [hoveredInstanceId, setHoveredInstanceId] = useState<string | null>(null);
  useCursor(hoveredInstanceId !== null);

  if (instances.length === 0) return null;
  return (
    <Instances limit={instances.length} range={instances.length}>
      <sphereGeometry args={[ION_RADIUS, 28, 28]} />
      <meshStandardMaterial color={color} metalness={0.04} roughness={0.36} />
      {instances.map((inst) => (
        <Instance
          key={`${idPrefix}-${inst.id}`}
          onClick={(event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation();
            onSelect({ siteId: inst.siteId, periodicImageShift: inst.periodicImageShift });
          }}
          onPointerOut={(event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            setHoveredInstanceId((current) => (current === inst.id ? null : current));
          }}
          onPointerOver={(event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            setHoveredInstanceId(inst.id);
          }}
          position={inst.cartesian}
          scale={hoveredInstanceId === inst.id ? 1.08 : 1}
        />
      ))}
    </Instances>
  );
}

// 第一配位层覆盖层：中心（放大 + 发光）、六个邻居（轻度高亮，幽灵半透明）、六条虚线。
function CoordinationOverlay({ cluster }: { cluster: NaClCoordinationDisplayCluster }) {
  return (
    <group>
      <FocusIon atom={cluster.center} />
      {cluster.neighbors.map((neighbor) => (
        <FocusIon atom={neighbor} key={neighbor.id} />
      ))}
      {cluster.neighbors.map((neighbor) => (
        <Line
          color={GUIDE_COLOR}
          dashScale={16}
          dashed
          key={`guide-${neighbor.id}`}
          lineWidth={1.8}
          opacity={0.85}
          points={[cluster.center.cartesian, neighbor.cartesian]}
          transparent
        />
      ))}
    </group>
  );
}

/** 单个聚焦离子（独立 mesh，≤7 个）：按 role / isGhost 决定放大、发光、透明。 */
function FocusIon({ atom }: { atom: NaClCoordinationDisplayAtom }) {
  const baseColor = atom.element === "Cl-" ? CL_COLOR : NA_COLOR;
  const isCenter = atom.role === "center";
  const scale = isCenter ? CENTER_SCALE : NEIGHBOR_SCALE;

  if (atom.isGhost) {
    // 周期补齐镜像（幽灵邻居）：半透明本色 + 线框轮廓，区别于常规显示实例。
    return (
      <group position={atom.cartesian}>
        <mesh scale={scale}>
          <sphereGeometry args={[ION_RADIUS, 24, 24]} />
          <meshStandardMaterial
            color={baseColor}
            depthWrite={false}
            opacity={0.32}
            roughness={0.4}
            transparent
          />
        </mesh>
        <mesh scale={scale * 1.04}>
          <sphereGeometry args={[ION_RADIUS, 16, 16]} />
          <meshBasicMaterial color={baseColor} opacity={0.5} transparent wireframe />
        </mesh>
      </group>
    );
  }

  return (
    <mesh position={atom.cartesian} scale={scale}>
      <sphereGeometry args={[ION_RADIUS, 30, 30]} />
      <meshStandardMaterial
        color={baseColor}
        emissive={baseColor}
        emissiveIntensity={isCenter ? 0.55 : 0.16}
        metalness={0.05}
        roughness={0.3}
      />
    </mesh>
  );
}

type CellFrameProps = {
  segments: ReturnType<typeof generateNaClCellFrameSegments>;
  dim?: boolean;
};

function CellFrame({ segments, dim = false }: CellFrameProps) {
  if (segments.length === 0) return null;
  // 隔离模式下把边框整体降权（乘 0.5），但不强制隐藏。
  const opacityScale = dim ? 0.5 : 1;
  return (
    <>
      {segments.map((segment) => (
        <StickCylinder
          color={segment.kind === "outer" ? "#7A8F8A" : "#B7C6C3"}
          end={segment.end}
          key={segment.id}
          material="standard"
          opacity={(segment.kind === "outer" ? 0.62 : 0.4) * opacityScale}
          radius={segment.kind === "outer" ? 0.007 : 0.004}
          start={segment.start}
        />
      ))}
    </>
  );
}
