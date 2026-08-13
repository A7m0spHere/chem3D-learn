import { Canvas } from "@react-three/fiber";
import { Html, Instance, Instances, OrbitControls } from "@react-three/drei";
import { CalloutLabel } from "@/components/three/CalloutLabel";
import { CameraRig } from "@/components/three/CameraRig";
import { SceneLighting } from "@/components/three/SceneLighting";
import { StickCylinder } from "@/components/three/StickCylinder";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import {
  crystalOverlayBadgeToneClasses,
  htmlOverlayLabelClass,
} from "@/components/three/htmlOverlayStyles";
import {
  createClosePackingGeometry,
  getAxialHexDistance,
  type ClosePackedLayerId,
  type ClosePackedPatchAtom,
} from "@/components/three/closePackingGeometry";
import type { CrystalViewMode, MoleculeRecord } from "@/types/molecule";

type MetalClosePackingCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  showLabels: boolean;
  loading?: boolean;
};

type Vec3 = [number, number, number];
type LayerId = ClosePackedLayerId;
type PackingAtom = ClosePackedPatchAtom;

const layerColors: Record<LayerId, string> = {
  A: "#2A9D8F",
  B: "#F4A261",
  C: "#64748B",
};

const metalColor = "#94A3B8";
const metalDark = "#1F6F68";
const nearestDistance = 0.54;
const sphereRadius = nearestDistance / 2;
const { generateHexPatch, layerGap, layerOffsets } = createClosePackingGeometry(nearestDistance);

const layerPatch = generateHexPatch(2);
const miniLayerPatch = generateHexPatch(1);

export function MetalClosePackingCell({
  molecule,
  viewMode,
  showLabels,
  loading = false,
}: MetalClosePackingCellProps) {
  const activeMode = molecule.crystalControls?.viewModes.find((mode) => mode.id === viewMode);
  const camera = getCameraPreset(viewMode);
  const summary = getSummary(viewMode, molecule.summaryZh);
  const sceneRotation: Vec3 =
    viewMode === "counting" || viewMode === "comparison"
      ? [0.08, 0, 0]
      : [0.08, -0.42, 0];

  return (
    <ThreeViewerFrame
      footerMeta="理想等径硬球模型"
      loading={loading}
      meta="拖拽旋转 · 滚轮缩放"
      stageTestId="metal-close-packing-canvas"
      summary={summary}
      title={`${molecule.formula}｜${activeMode?.labelZh ?? "金属晶体密堆积"}`}
      viewerTestId="metal-close-packing-viewer"
    >
      <Canvas
        camera={{ position: camera.position, fov: camera.fov }}
        frameloop="demand"
        gl={{ alpha: false }}
        style={{ height: "100%", width: "100%" }}
      >
        <color attach="background" args={["#F7FAF9"]} />
        <SceneLighting
          ambient={0.76}
          mainIntensity={1.3}
          mainPosition={[4, 6, 5]}
          secondaryIntensity={0.4}
          secondaryPosition={[-4, 2, -3]}
        />
        <CameraRig fov={camera.fov} position={camera.position} resetKey={viewMode} />
        <group position={[0, -0.05, 0]} rotation={sceneRotation} scale={camera.scale}>
          <PackingScene showLabels={showLabels} viewMode={viewMode} />
        </group>
        <OrbitControls
          enableDamping
          enablePan={false}
          makeDefault
          maxDistance={9}
          minDistance={2.2}
          target={[0, 0, 0]}
        />
      </Canvas>
    </ThreeViewerFrame>
  );
}

function PackingScene({
  showLabels,
  viewMode,
}: {
  showLabels: boolean;
  viewMode: CrystalViewMode;
}) {
  switch (viewMode) {
    case "hcpStacking":
      return <StackingScene sequence={["A", "B", "A", "B"]} showLabels={showLabels} />;
    case "fccStacking":
      return <StackingScene sequence={["A", "B", "C", "A"]} showLabels={showLabels} />;
    case "coordination":
      return <CoordinationScene showLabels={showLabels} />;
    case "counting":
      return <CountingScene showLabels={showLabels} />;
    case "comparison":
      return <ComparisonScene showLabels={showLabels} />;
    case "layer":
    default:
      return <SingleLayerScene showLabels={showLabels} />;
  }
}

function SingleLayerScene({ showLabels }: { showLabels: boolean }) {
  return (
    <>
      <LayerPlane color={layerColors.A} radius={1.62} y={-0.04} />
      <PackingLayer
        atoms={layerPatch}
        highlightCenterAndRing
        layer="A"
        offset={layerOffsets.A}
        radius={sphereRadius}
        y={0}
      />
      {/* 锚点落在 A 层中心原子（六邻环的中心，y=0 层面），标签外推到后上方留白 */}
      <CalloutLabel anchor={[0, 0, 0]} offset={[0, 0.9, -1.3]}>
        <BadgeSpan label="A 层｜同层 6 个最近邻" tone="same" />
      </CalloutLabel>
      {showLabels ? (
        <FocusLabel label="中心 M" position={[0, 0.38, 0]} />
      ) : null}
    </>
  );
}

function StackingScene({
  sequence,
  showLabels,
}: {
  sequence: LayerId[];
  showLabels: boolean;
}) {
  const centerIndex = (sequence.length - 1) / 2;

  return (
    <>
      {sequence.map((layer, index) => {
        const y = (index - centerIndex) * layerGap;
        return (
          <group key={`${layer}-${index}`}>
            <LayerPlane color={layerColors[layer]} radius={1.58} y={y - 0.025} />
            <PackingLayer
              atoms={layerPatch}
              layer={layer}
              offset={layerOffsets[layer]}
              radius={sphereRadius * 0.9}
              y={y}
            />
            <LayerBadge
              label={`${layer} 层`}
              position={[-1.55, y + 0.02, -0.88]}
              tone={layer === "A" ? "lower" : layer === "B" ? "upper" : "note"}
            />
          </group>
        );
      })}
      {showLabels ? (
        <FocusLabel
          label={sequence.includes("C") ? "第三层进入 C 位" : "第三层回到 A 位"}
          position={[0.25, layerGap + 0.38, -0.2]}
        />
      ) : null}
    </>
  );
}

function CoordinationScene({ showLabels }: { showLabels: boolean }) {
  const distance = 0.82;
  const verticalGap = Math.sqrt(2 / 3) * distance;
  const ringRadius = distance / Math.sqrt(3);
  const sameLayer = Array.from({ length: 6 }, (_, index): Vec3 => {
    const angle = (index * Math.PI) / 3;
    return [distance * Math.cos(angle), 0, distance * Math.sin(angle)];
  });
  const upperLayer = Array.from({ length: 3 }, (_, index): Vec3 => {
    const angle = Math.PI / 6 + (index * 2 * Math.PI) / 3;
    return [ringRadius * Math.cos(angle), verticalGap, ringRadius * Math.sin(angle)];
  });
  const lowerLayer = Array.from({ length: 3 }, (_, index): Vec3 => {
    const angle = -Math.PI / 6 + (index * 2 * Math.PI) / 3;
    return [ringRadius * Math.cos(angle), -verticalGap, ringRadius * Math.sin(angle)];
  });
  const groups = [
    { atoms: sameLayer, color: "#F4A261" },
    { atoms: upperLayer, color: "#D6A33A" },
    { atoms: lowerLayer, color: "#2A9D8F" },
  ];

  return (
    <>
      <LayerPlane color="#F4A261" radius={0.96} y={-0.025} />
      <LayerPlane color="#D6A33A" radius={0.62} y={verticalGap - 0.025} />
      <LayerPlane color="#2A9D8F" radius={0.62} y={-verticalGap - 0.025} />
      <MetalSphere color={metalDark} position={[0, 0, 0]} radius={0.31} />
      {groups.flatMap((group, groupIndex) =>
        group.atoms.map((position, index) => (
          <group key={`${groupIndex}-${index}`}>
            <StickCylinder
              color={group.color}
              end={position}
              opacity={0.48}
              radius={0.012}
              start={[0, 0, 0]}
            />
            <MetalSphere color={group.color} position={position} radius={0.26} />
          </group>
        )),
      )}
      {/* 三组配位原子各自的引线标签：锚点取该组一个代表原子，标签外推到簇外围留白 */}
      <CalloutLabel anchor={sameLayer[0]} offset={[0.5, 0.3, 0.5]}>
        <BadgeSpan label="同层 6" tone="same" />
      </CalloutLabel>
      <CalloutLabel anchor={upperLayer[0]} offset={[0.4, 0.45, -0.5]}>
        <BadgeSpan label="上层 3" tone="upper" />
      </CalloutLabel>
      <CalloutLabel anchor={lowerLayer[0]} offset={[-0.6, -0.4, 0.5]}>
        <BadgeSpan label="下层 3" tone="lower" />
      </CalloutLabel>
      {/* 总结，不指向单一结构，保持徽章 */}
      <LayerBadge label="合计配位数 12" position={[0, -1.2, -0.1]} tone="center" />
      {showLabels ? <FocusLabel label="中心 M" position={[0, 0.42, 0]} /> : null}
    </>
  );
}

function CountingScene({ showLabels }: { showLabels: boolean }) {
  return (
    <>
      <group position={[-1.25, 0, 0]}>
        <FccUnitCell />
        <LayerBadge label="FCC｜4 个 M" position={[0, 1.22, 0]} tone="lower" />
        {showLabels ? <FocusLabel label="8 顶点 + 6 面心" position={[0, -1.04, 0]} /> : null}
      </group>
      <group position={[1.32, 0, 0]}>
        <HcpUnitCell />
        <LayerBadge label="HCP｜6 个 M" position={[0, 1.22, 0]} tone="upper" />
        {showLabels ? <FocusLabel label="12 顶角 + 2 面心 + 3 内部" position={[0, -1.04, 0]} /> : null}
      </group>
    </>
  );
}

function ComparisonScene({ showLabels }: { showLabels: boolean }) {
  return (
    <>
      <group position={[-1.32, 0, 0]}>
        <MiniStack sequence={["A", "B", "A"]} />
        <LayerBadge label="HCP｜ABAB" position={[0, 1.1, 0]} tone="lower" />
        {showLabels ? <FocusLabel label="第三层与第一层重合" position={[0, -1.12, 0]} /> : null}
      </group>
      <group position={[1.32, 0, 0]}>
        <MiniStack sequence={["A", "B", "C"]} />
        <LayerBadge label="FCC｜ABCABC" position={[0, 1.1, 0]} tone="note" />
        {showLabels ? <FocusLabel label="第三层进入新位置" position={[0, -1.12, 0]} /> : null}
      </group>
      <LayerBadge label="共同：配位数 12｜η ≈ 74%" position={[0, -1.85, 0.15]} tone="center" />
    </>
  );
}

function MiniStack({ sequence }: { sequence: LayerId[] }) {
  return (
    <>
      {sequence.map((layer, index) => {
        const y = (index - 1) * layerGap;
        return (
          <PackingLayer
            atoms={miniLayerPatch}
            key={`${layer}-${index}`}
            layer={layer}
            offset={layerOffsets[layer]}
            radius={sphereRadius * 0.9}
            y={y}
          />
        );
      })}
    </>
  );
}

function PackingLayer({
  atoms,
  highlightCenterAndRing = false,
  layer,
  offset,
  radius,
  y,
}: {
  atoms: PackingAtom[];
  highlightCenterAndRing?: boolean;
  layer: LayerId;
  offset: [number, number];
  radius: number;
  y: number;
}) {
  return (
    <Instances limit={atoms.length} range={atoms.length}>
      <sphereGeometry args={[radius, 28, 28]} />
      <meshStandardMaterial metalness={0.14} roughness={0.34} />
      {atoms.map((atom) => {
        const hexDistance = getAxialHexDistance(atom.q, atom.r);
        const color = highlightCenterAndRing
          ? hexDistance === 0
            ? metalDark
            : hexDistance === 1
              ? "#F4A261"
              : "#B7C6C3"
          : layerColors[layer];
        return (
          <Instance
            color={color}
            key={`${layer}-${y}-${atom.id}`}
            position={[atom.position[0] + offset[0], y, atom.position[2] + offset[1]]}
          />
        );
      })}
    </Instances>
  );
}

function FccUnitCell() {
  const half = 0.72;
  const corners: Vec3[] = [-half, half].flatMap((x) =>
    [-half, half].flatMap((y) => [-half, half].map((z): Vec3 => [x, y, z])),
  );
  const faces: Vec3[] = [
    [half, 0, 0],
    [-half, 0, 0],
    [0, half, 0],
    [0, -half, 0],
    [0, 0, half],
    [0, 0, -half],
  ];

  return (
    <>
      <CubeFrame half={half} />
      {corners.map((position, index) => (
        <MetalSphere color={metalColor} key={`fcc-corner-${index}`} position={position} radius={0.12} />
      ))}
      {faces.map((position, index) => (
        <MetalSphere color={layerColors.A} key={`fcc-face-${index}`} position={position} radius={0.145} />
      ))}
    </>
  );
}

function HcpUnitCell() {
  const radius = 0.7;
  const halfHeight = 0.68;
  const angles = Array.from({ length: 6 }, (_, index) => (index * Math.PI) / 3);
  const bottom: Vec3[] = angles.map((angle) => [radius * Math.cos(angle), -halfHeight, radius * Math.sin(angle)]);
  const top: Vec3[] = angles.map((angle) => [radius * Math.cos(angle), halfHeight, radius * Math.sin(angle)]);
  const internals: Vec3[] = [
    [0.36, 0, 0.2],
    [-0.36, 0, 0.2],
    [0, 0, -0.42],
  ];

  return (
    <>
      <HexFrame bottom={bottom} top={top} />
      {[...bottom, ...top].map((position, index) => (
        <MetalSphere color={metalColor} key={`hcp-corner-${index}`} position={position} radius={0.105} />
      ))}
      <MetalSphere color={layerColors.A} position={[0, -halfHeight, 0]} radius={0.13} />
      <MetalSphere color={layerColors.A} position={[0, halfHeight, 0]} radius={0.13} />
      {internals.map((position, index) => (
        <MetalSphere color={layerColors.B} key={`hcp-inner-${index}`} position={position} radius={0.13} />
      ))}
    </>
  );
}

function CubeFrame({ half }: { half: number }) {
  const edges: Array<[Vec3, Vec3]> = [];
  const signs = [-half, half];
  for (const y of signs) {
    for (const z of signs) edges.push([[-half, y, z], [half, y, z]]);
  }
  for (const x of signs) {
    for (const z of signs) edges.push([[x, -half, z], [x, half, z]]);
  }
  for (const x of signs) {
    for (const y of signs) edges.push([[x, y, -half], [x, y, half]]);
  }

  return <CellEdges edges={edges} />;
}

function HexFrame({ bottom, top }: { bottom: Vec3[]; top: Vec3[] }) {
  const edges: Array<[Vec3, Vec3]> = [];
  for (let index = 0; index < 6; index += 1) {
    const next = (index + 1) % 6;
    edges.push([bottom[index], bottom[next]], [top[index], top[next]], [bottom[index], top[index]]);
  }
  return <CellEdges edges={edges} />;
}

function CellEdges({ edges }: { edges: Array<[Vec3, Vec3]> }) {
  return (
    <>
      {edges.map(([start, end], index) => (
        <StickCylinder
          color="#64748B"
          end={end}
          key={`cell-edge-${index}`}
          opacity={0.56}
          radius={0.014}
          start={start}
        />
      ))}
    </>
  );
}

function MetalSphere({ color, position, radius }: { color: string; position: Vec3; radius: number }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 28, 28]} />
      <meshStandardMaterial color={color} metalness={0.16} roughness={0.34} />
    </mesh>
  );
}

function LayerPlane({ color, radius, y }: { color: string; radius: number; y: number }) {
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 56]} />
      <meshBasicMaterial color={color} depthWrite={false} opacity={0.055} transparent />
    </mesh>
  );
}

function LayerBadge({
  label,
  position,
  tone,
}: {
  label: string;
  position: Vec3;
  tone: keyof typeof crystalOverlayBadgeToneClasses;
}) {
  return (
    <Html center position={position} zIndexRange={[12, 0]}>
      <BadgeSpan label={label} tone={tone} />
    </Html>
  );
}

// 徽章文本 span，供恒显 <Html> 徽章与 CalloutLabel 引线标签共用，保留 tone 配色。
function BadgeSpan({
  label,
  tone,
}: {
  label: string;
  tone: keyof typeof crystalOverlayBadgeToneClasses;
}) {
  return (
    <span
      className={`whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-bold sm:text-xs ${crystalOverlayBadgeToneClasses[tone]}`}
    >
      {label}
    </span>
  );
}

function FocusLabel({ label, position }: { label: string; position: Vec3 }) {
  return (
    <Html center position={position} zIndexRange={[13, 0]}>
      <span className={htmlOverlayLabelClass}>{label}</span>
    </Html>
  );
}

function getCameraPreset(viewMode: CrystalViewMode): {
  position: Vec3;
  fov: number;
  scale: number;
} {
  if (viewMode === "counting" || viewMode === "comparison") {
    return { position: [0, 3.3, 7], fov: 38, scale: 1.12 };
  }
  if (viewMode === "coordination") {
    return { position: [3.6, 2.8, 4.4], fov: 38, scale: 1.3 };
  }
  if (viewMode === "layer") {
    return { position: [3.8, 4.4, 4.8], fov: 39, scale: 1.18 };
  }
  return { position: [4.5, 3.2, 5.5], fov: 39, scale: 1.08 };
}

function getSummary(viewMode: CrystalViewMode, fallback: string) {
  if (viewMode === "counting") {
    return "FCC：8×1/8 + 6×1/2 = 4；HCP：12×1/6 + 2×1/2 + 3×1 = 6。";
  }
  if (viewMode === "comparison") {
    return "相同：配位数 12、理想空间利用率约 74%；不同：HCP 为 ABAB，FCC 为 ABCABC。";
  }
  return fallback;
}
