import { Canvas } from "@react-three/fiber";
import { Instances, Instance, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { StickCylinder } from "@/components/three/StickCylinder";
import { SceneLighting } from "@/components/three/SceneLighting";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { CrystalAtomLegend } from "@/components/three/CrystalAtomLegend";
import {
  generateNaClCellFrameSegments,
  generateNaClDisplayInstances,
  generateNaClPeriodicSites,
  type CrystalCellFrameMode,
  type NaClPeriodicSite,
} from "@/components/three/naclPeriodicGeometry";
import type { MoleculeRecord } from "@/types/molecule";

// ---------------------------------------------------------------------------
// NaCl 周期探索 Viewer（T-028B）。
//
// 与现有教材教学 Viewer（NaClCell.tsx，使用 nacl.json 的 27 个边界展开位置）
// 并存：本 Viewer 不读 nacl.json 作为周期数据源，几何全部来自 naclPeriodicGeometry
// 纯函数内核（generateNaClPeriodicSites / generateNaClDisplayInstances /
// generateNaClCellFrameSegments）。
//
// 关键区分（教学正确性）：
//   - 8·N³（8/64/216）是「周期独立离子位点」数；
//   - (2N+1)³（27/125/343）是「当前画面中的显示实例」数，含为闭合正侧边界而绘制的
//     显示副本（NaClDisplayInstance）。边界显示副本不重复计入化学组成。
//
// 渲染用 Drei <Instances>：Na⁺ 与 Cl⁻ 各一组共享 sphereGeometry/material，
// 不为每个粒子创建独立 geometry，避免 343 个粒子重复分配几何资源。
// 本轮不实现粒子点击选择（T-028C 任务）；但 display 实例已保留 siteId 与
// periodicImageShift 映射，供 T-028C 做粒子选择时使用。
// ---------------------------------------------------------------------------

type NaClPeriodicCellProps = {
  size: 1 | 2 | 3;
  frameMode: CrystalCellFrameMode;
  molecule: MoleculeRecord;
  loading?: boolean;
};

// 延续现有 NaCl 教学色彩：Cl⁻ 绿、Na⁺ 蓝（取自 nacl.json 的 color）。
const CL_COLOR = "#10B981";
const NA_COLOR = "#2563EB";

// 周期模式下使用统一元素半径，不按 siteType 决定半径。
const ION_RADIUS = 0.16;

type DisplayGroup = {
  positions: [number, number, number][];
  // 保留每个显示实例到 siteId + periodicImageShift 的映射，供 T-028C 粒子选择。
  mapping: { siteId: string; periodicImageShift: [number, number, number] }[];
};

/** 把显示实例按子格子分组，供两组 <Instances> 渲染。 */
function groupDisplayInstances(
  sites: NaClPeriodicSite[],
  size: 1 | 2 | 3,
): { chloride: DisplayGroup; sodium: DisplayGroup } {
  const siteById = new Map(sites.map((s) => [s.id, s]));
  const instances = generateNaClDisplayInstances(sites, size);
  const chloride: DisplayGroup = { positions: [], mapping: [] };
  const sodium: DisplayGroup = { positions: [], mapping: [] };
  for (const inst of instances) {
    const canonical = siteById.get(inst.siteId);
    if (!canonical) continue;
    const group = canonical.element === "Cl-" ? chloride : sodium;
    group.positions.push(inst.cartesian);
    group.mapping.push({
      siteId: inst.siteId,
      periodicImageShift: inst.periodicImageShift,
    });
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
  loading = false,
}: NaClPeriodicCellProps) {
  const sites = useMemo(() => generateNaClPeriodicSites(size), [size]);
  const { chloride, sodium } = useMemo(
    () => groupDisplayInstances(sites, size),
    [sites, size],
  );
  const segments = useMemo(
    () => generateNaClCellFrameSegments(size, frameMode),
    [size, frameMode],
  );
  const camera = getCameraPreset(size);

  const independentSites = sites.length; // 8·N³
  const displayInstances = chloride.positions.length + sodium.positions.length; // (2N+1)³

  return (
    <ThreeViewerFrame
      footerMeta={<CrystalAtomLegend atoms={molecule.atoms} />}
      loading={loading}
      meta={`周期探索 · ${size}×${size}×${size} · 拖拽旋转 · ${displayInstances} 个显示实例`}
      stageTestId={`nacl-periodic-${size}-canvas`}
      summary={`周期独立位点 ${independentSites} 个（Na⁺ 与 Cl⁻ 各 ${(independentSites / 2)} 个）；显示实例 ${displayInstances} 个，含闭合正侧边界的周期镜像副本，不重复计入化学组成。`}
      title={`${molecule.formula}｜周期探索 · ${size}×${size}×${size}`}
      viewerTestId={`nacl-periodic-${size}-viewer`}
    >
      {/* 切换尺寸时用 size 作 Canvas key 重新初始化相机，保证完整结构入画。
          取舍：切换尺寸会重置观察角度；保存相机状态留待后续 T-028C/D 改进。 */}
      <Canvas
        camera={{ position: camera.position, fov: camera.fov }}
        frameloop="demand"
        key={`nacl-periodic-canvas-${size}`}
        style={{ height: "100%", width: "100%" }}
      >
        <SceneLighting
          ambient={0.68}
          mainIntensity={1.35}
          mainPosition={[4, 5, 4]}
          secondaryIntensity={0.35}
          secondaryPosition={[-3, 2, -4]}
        />
        <group rotation={[0.18, -0.45, 0]}>
          <ClInstances color={CL_COLOR} positions={chloride.positions} />
          <NaInstances color={NA_COLOR} positions={sodium.positions} />
          <CellFrame segments={segments} />
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

type IonInstancesProps = {
  color: string;
  positions: [number, number, number][];
};

function ClInstances({ color, positions }: IonInstancesProps) {
  return (
    <Instances limit={positions.length} range={positions.length}>
      <sphereGeometry args={[ION_RADIUS, 28, 28]} />
      <meshStandardMaterial color={color} metalness={0.04} roughness={0.36} />
      {positions.map((position, index) => (
        <Instance key={`cl-${index}`} position={position} />
      ))}
    </Instances>
  );
}

function NaInstances({ color, positions }: IonInstancesProps) {
  return (
    <Instances limit={positions.length} range={positions.length}>
      <sphereGeometry args={[ION_RADIUS, 28, 28]} />
      <meshStandardMaterial color={color} metalness={0.04} roughness={0.36} />
      {positions.map((position, index) => (
        <Instance key={`na-${index}`} position={position} />
      ))}
    </Instances>
  );
}

type CellFrameProps = {
  segments: ReturnType<typeof generateNaClCellFrameSegments>;
};

function CellFrame({ segments }: CellFrameProps) {
  if (segments.length === 0) return null;
  return (
    <>
      {segments.map((segment, index) => (
        <StickCylinder
          color={segment.kind === "outer" ? "#7A8F8A" : "#B7C6C3"}
          end={segment.end}
          key={`frame-${index}`}
          material="standard"
          opacity={segment.kind === "outer" ? 0.62 : 0.4}
          radius={segment.kind === "outer" ? 0.007 : 0.004}
          start={segment.start}
        />
      ))}
    </>
  );
}
