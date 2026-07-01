import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { Group, Quaternion, Vector3 } from "three";
import {
  crystalOverlayBadgeToneClasses,
  htmlOverlayLabelClass,
} from "@/components/three/htmlOverlayStyles";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import type { CrystalModelStyle, CrystalViewMode, MoleculeRecord } from "@/types/molecule";

type ZincMetalCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  modelStyle: CrystalModelStyle;
  showLabels: boolean;
  loading?: boolean;
};

type ZnSiteKind =
  | "corner"
  | "face"
  | "internal"
  | "center"
  | "same-neighbor"
  | "upper-neighbor"
  | "lower-neighbor";

type ZnVisualAtom = {
  id: string;
  label: string;
  position: [number, number, number];
  radius: number;
  kind: ZnSiteKind;
  layer?: "A-top" | "B" | "A-bottom";
};

type HcpLayer = "A" | "B";

type HcpPackingAtom = {
  id: string;
  position: [number, number, number];
  layer: HcpLayer;
};

const zincBaseColor = "#94A3B8";
const zincHighlight = "#2A9D8F";
const sameLayerHighlight = "#F4A261";
const upperLayerHighlight = "#D6A33A";
const lowerLayerHighlight = "#3E9C91";

const hexRadius = 0.95;
const cellHalfHeight = 0.75;
const hexAngles = [0, 60, 120, 180, 240, 300].map((degree) => (degree * Math.PI) / 180);
const packingNearest = 0.52;
const packingRadius = 0.24;
const packingLayerGap = 0.62;
const packingBasisA: [number, number] = [packingNearest, 0];
const packingBasisB: [number, number] = [packingNearest / 2, (Math.sqrt(3) * packingNearest) / 2];
const packingBOffset: [number, number] = [
  (packingBasisA[0] + packingBasisB[0]) / 3,
  (packingBasisA[1] + packingBasisB[1]) / 3,
];

const bottomCorners = hexAngles.map((angle, index): ZnVisualAtom => ({
  id: `unit-bottom-corner-${index + 1}`,
  label: "顶角 Zn",
  position: [hexRadius * Math.cos(angle), -cellHalfHeight, hexRadius * Math.sin(angle)],
  radius: 0.105,
  kind: "corner",
  layer: "A-bottom",
}));

const topCorners = hexAngles.map((angle, index): ZnVisualAtom => ({
  id: `unit-top-corner-${index + 1}`,
  label: "顶角 Zn",
  position: [hexRadius * Math.cos(angle), cellHalfHeight, hexRadius * Math.sin(angle)],
  radius: 0.105,
  kind: "corner",
  layer: "A-top",
}));

const unitCellAtoms: ZnVisualAtom[] = [
  ...bottomCorners,
  ...topCorners,
  {
    id: "unit-bottom-face",
    label: "面心 Zn",
    position: [0, -cellHalfHeight, 0],
    radius: 0.12,
    kind: "face",
    layer: "A-bottom",
  },
  {
    id: "unit-top-face",
    label: "面心 Zn",
    position: [0, cellHalfHeight, 0],
    radius: 0.12,
    kind: "face",
    layer: "A-top",
  },
  {
    id: "unit-inner-1",
    label: "内部 Zn",
    position: [0.475, 0, 0.274],
    radius: 0.12,
    kind: "internal",
    layer: "B",
  },
  {
    id: "unit-inner-2",
    label: "内部 Zn",
    position: [-0.475, 0, 0.274],
    radius: 0.12,
    kind: "internal",
    layer: "B",
  },
  {
    id: "unit-inner-3",
    label: "内部 Zn",
    position: [0, 0, -0.548],
    radius: 0.12,
    kind: "internal",
    layer: "B",
  },
];

const sameLayerNeighbors = hexAngles.map((angle, index): ZnVisualAtom => ({
  id: `cluster-same-${index + 1}`,
  label: "同层最近邻",
  position: [0.82 * Math.cos(angle), 0, 0.82 * Math.sin(angle)],
  radius: 0.115,
  kind: "same-neighbor",
}));

const coordinationCluster: ZnVisualAtom[] = [
  {
    id: "cluster-center",
    label: "中心 Zn",
    position: [0, 0, 0],
    radius: 0.13,
    kind: "center",
  },
  ...sameLayerNeighbors,
  {
    id: "cluster-upper-1",
    label: "上层最近邻",
    position: [0.41, 0.67, 0.237],
    radius: 0.115,
    kind: "upper-neighbor",
  },
  {
    id: "cluster-upper-2",
    label: "上层最近邻",
    position: [-0.41, 0.67, 0.237],
    radius: 0.115,
    kind: "upper-neighbor",
  },
  {
    id: "cluster-upper-3",
    label: "上层最近邻",
    position: [0, 0.67, -0.474],
    radius: 0.115,
    kind: "upper-neighbor",
  },
  {
    id: "cluster-lower-1",
    label: "下层最近邻",
    position: [0.41, -0.67, -0.237],
    radius: 0.115,
    kind: "lower-neighbor",
  },
  {
    id: "cluster-lower-2",
    label: "下层最近邻",
    position: [-0.41, -0.67, -0.237],
    radius: 0.115,
    kind: "lower-neighbor",
  },
  {
    id: "cluster-lower-3",
    label: "下层最近邻",
    position: [0, -0.67, 0.474],
    radius: 0.115,
    kind: "lower-neighbor",
  },
];

const cellEdges: Array<[[number, number, number], [number, number, number]]> = [
  ...hexAngles.map((_, index): [[number, number, number], [number, number, number]] => {
    const nextIndex = (index + 1) % hexAngles.length;
    return [bottomCorners[index].position, bottomCorners[nextIndex].position];
  }),
  ...hexAngles.map((_, index): [[number, number, number], [number, number, number]] => {
    const nextIndex = (index + 1) % hexAngles.length;
    return [topCorners[index].position, topCorners[nextIndex].position];
  }),
  ...hexAngles.map((_, index): [[number, number, number], [number, number, number]] => [
    bottomCorners[index].position,
    topCorners[index].position,
  ]),
];

const electronPoints: [number, number, number][] = [
  [-0.6, -0.42, -0.26],
  [-0.34, 0.24, 0.36],
  [0.1, -0.24, 0.58],
  [0.52, 0.18, -0.34],
  [-0.66, 0.46, 0.02],
  [0.62, -0.5, 0.12],
  [0.0, 0.5, -0.58],
  [-0.18, -0.54, -0.5],
  [0.34, 0.38, 0.48],
  [-0.44, -0.28, 0.46],
  [0.68, 0.42, -0.04],
  [-0.52, 0.04, -0.52],
];

function generateHexLayer(
  radius: number,
  y: number,
  offset: [number, number] = [0, 0],
  layer: HcpLayer,
): HcpPackingAtom[] {
  const atoms: HcpPackingAtom[] = [];

  for (let q = -radius; q <= radius; q += 1) {
    const rMin = Math.max(-radius, -q - radius);
    const rMax = Math.min(radius, -q + radius);

    for (let r = rMin; r <= rMax; r += 1) {
      const x = q * packingBasisA[0] + r * packingBasisB[0] + offset[0];
      const z = q * packingBasisA[1] + r * packingBasisB[1] + offset[1];

      atoms.push({
        id: `packing-${layer}-${y}-${q}-${r}`,
        layer,
        position: [x, y, z],
      });
    }
  }

  return atoms;
}

const hcpLayerPatch: HcpPackingAtom[] = [
  ...generateHexLayer(2, -packingLayerGap, [0, 0], "A"),
  ...generateHexLayer(2, 0, packingBOffset, "B"),
  ...generateHexLayer(2, packingLayerGap, [0, 0], "A"),
];

export function ZincMetalCell({
  molecule,
  viewMode,
  modelStyle,
  showLabels,
  loading = false,
}: ZincMetalCellProps) {
  const cameraPosition = molecule.rendering?.cameraPosition ?? [3.1, 2.45, 3.7];
  const cameraFov = molecule.rendering?.cameraFov ?? 42;
  const activeMode = molecule.crystalTeaching?.viewModes.find((mode) => mode.id === viewMode);
  const isCoordinationMode = viewMode === "coordination";
  const isLayerMode = viewMode === "layer";
  const isCountingMode = viewMode === "counting";
  const isMetallicBondMode = viewMode === "metallicBond";
  const isPackingModel = modelStyle === "packing";
  const usePackingPatch = isPackingModel && !isCoordinationMode && !isCountingMode;
  const groupScale = usePackingPatch ? 0.9 : 1.45;
  const viewerCameraPosition: [number, number, number] = usePackingPatch
    ? [5.2, 3.8, 6.2]
    : cameraPosition;

  return (
    <ThreeViewerFrame
      loading={loading}
      meta={`${modelStyle === "packing" ? "堆积模型" : "球棍模型"} · 拖拽旋转`}
      stageTestId={`${molecule.id}-canvas`}
      summary={activeMode?.bodyZh ?? molecule.summaryZh}
      title={`${molecule.formula}｜${activeMode?.titleZh ?? "六方晶胞"}`}
      viewerTestId={`${molecule.id}-viewer`}
    >
        <Canvas camera={{ position: viewerCameraPosition, fov: cameraFov }} shadows style={{ height: "100%", width: "100%" }}>
          <ambientLight intensity={0.72} />
          <directionalLight position={[4, 5, 4]} intensity={1.35} castShadow />
          <directionalLight position={[-3, 2, -4]} intensity={0.42} />
          <group position={[0, -0.05, 0]} rotation={[0.16, -0.48, 0]} scale={groupScale}>
            {isCoordinationMode ? (
              <CoordinationCluster modelStyle={modelStyle} showLabels={showLabels} />
            ) : usePackingPatch ? (
              <>
                <HexagonalCellFrame isMuted />
                {isLayerMode ? <PackingLayerPlanes /> : null}
                {isMetallicBondMode ? <MetallicBondHint /> : null}
                <HcpPackingPatch showLayerLabels={false} />
              </>
            ) : (
              <>
                <HexagonalCellFrame isMuted={isMetallicBondMode} />
                {isLayerMode ? <LayerPlanes isMuted={isPackingModel} /> : null}
                {isMetallicBondMode ? <MetallicBondHint /> : null}
                {unitCellAtoms.map((atom) => (
                  <ZincAtom
                    atom={atom}
                    key={atom.id}
                    modelStyle={modelStyle}
                    showLabel={showLabels}
                    viewMode={viewMode}
                  />
                ))}
                {isCountingMode ? (
                  <>
                    <CountingLabels />
                    {isPackingModel ? (
                      <LayerBadge
                        label="计数视图使用单晶胞模型"
                        position={[0, -1.28, 0.28]}
                        tone="note"
                      />
                    ) : null}
                  </>
                ) : null}
              </>
            )}
          </group>
          <OrbitControls
            enableDamping
            enablePan={false}
            maxDistance={6}
            minDistance={1.8}
            target={[0, 0, 0]}
          />
        </Canvas>
    </ThreeViewerFrame>
  );
}

function CoordinationCluster({
  modelStyle,
  showLabels,
}: {
  modelStyle: CrystalModelStyle;
  showLabels: boolean;
}) {
  const center = coordinationCluster[0];
  const neighbors = coordinationCluster.slice(1);
  const isPackingModel = modelStyle === "packing";

  return (
    <>
      <LayerPlane isMuted={isPackingModel} y={0} label="同层 6" tone="same" radius={0.9} />
      <LayerPlane isMuted={isPackingModel} y={0.67} label="上层 3" tone="upper" radius={0.58} />
      <LayerPlane isMuted={isPackingModel} y={-0.67} label="下层 3" tone="lower" radius={0.58} />
      {neighbors.map((atom) => (
        <DashedGuide
          color={getHighlightColor(atom.kind)}
          end={atom.position}
          key={`guide-${atom.id}`}
          start={center.position}
        />
      ))}
      {coordinationCluster.map((atom) => (
        <ZincAtom
          atom={atom}
          key={atom.id}
          modelStyle={modelStyle}
          showLabel={showLabels}
          viewMode="coordination"
        />
      ))}
      <LayerBadge label="配位数 12" position={[0, 0.24, 0]} tone="center" />
      <LayerBadge label="虚线=最近邻示意" position={[0.05, -1.02, 0.72]} tone="note" />
    </>
  );
}

function HexagonalCellFrame({ isMuted = false }: { isMuted?: boolean }) {
  return (
    <>
      <mesh position={[0, 0, 0]} scale={[1, cellHalfHeight, 1]}>
        <cylinderGeometry args={[hexRadius, hexRadius, 2, 6, 1, false, Math.PI / 6]} />
        <meshStandardMaterial
          color="#E8F3F0"
          depthWrite={false}
          opacity={isMuted ? 0.06 : 0.13}
          roughness={0.8}
          transparent
        />
      </mesh>
      {cellEdges.map(([start, end], index) => (
        <StaticCylinder
          color={isMuted ? "#A8B8B4" : "#6F8681"}
          end={end}
          key={`${start.join(",")}-${end.join(",")}-${index}`}
          opacity={isMuted ? 0.18 : 0.68}
          radius={isMuted ? 0.003 : 0.0055}
          start={start}
        />
      ))}
    </>
  );
}

function HcpPackingPatch({ showLayerLabels }: { showLayerLabels: boolean }) {
  return (
    <>
      {hcpLayerPatch.map((atom) => (
        <PackingAtom atom={atom} key={atom.id} />
      ))}
      {showLayerLabels ? (
        <>
          <LayerBadge label="A 层" position={[1.38, packingLayerGap + 0.04, 0]} tone="same" />
          <LayerBadge label="B 层" position={[1.18, 0.04, 0.36]} tone="upper" />
          <LayerBadge label="A 层" position={[1.38, -packingLayerGap + 0.04, 0]} tone="same" />
        </>
      ) : null}
    </>
  );
}

function PackingLayerPlanes() {
  return (
    <>
      <LayerPlane isMuted={false} y={packingLayerGap} label="A 层" tone="top" radius={1.38} />
      <LayerPlane isMuted={false} y={0} label="B 层" tone="middle" radius={1.38} />
      <LayerPlane isMuted={false} y={-packingLayerGap} label="A 层" tone="bottom" radius={1.38} />
    </>
  );
}

function PackingAtom({ atom }: { atom: HcpPackingAtom }) {
  return (
    <group position={atom.position}>
      <mesh castShadow>
        <sphereGeometry args={[packingRadius, 32, 32]} />
        <meshStandardMaterial
          color={zincBaseColor}
          metalness={0.52}
          roughness={0.22}
        />
      </mesh>
    </group>
  );
}

function LayerPlanes({ isMuted = false }: { isMuted?: boolean }) {
  return (
    <>
      <LayerPlane isMuted={isMuted} y={cellHalfHeight} label="A 层" tone="top" radius={1.02} />
      <LayerPlane isMuted={isMuted} y={0} label="B 层" tone="middle" radius={0.74} />
      <LayerPlane isMuted={isMuted} y={-cellHalfHeight} label="A 层" tone="bottom" radius={1.02} />
    </>
  );
}

function LayerPlane({
  y,
  label,
  radius,
  isMuted = false,
  tone,
}: {
  y: number;
  label: string;
  radius: number;
  isMuted?: boolean;
  tone: "top" | "middle" | "bottom" | "same" | "upper" | "lower";
}) {
  const color =
    tone === "middle"
      ? "#F4A261"
      : tone === "upper"
        ? upperLayerHighlight
        : tone === "lower"
          ? lowerLayerHighlight
          : "#2A9D8F";

  return (
    <>
      <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, Math.PI / 6]}>
        <circleGeometry args={[radius, 6]} />
        <meshBasicMaterial
          color={color}
          opacity={isMuted ? 0.045 : tone === "middle" ? 0.13 : 0.1}
          transparent
        />
      </mesh>
      <LayerBadge
        label={label}
        position={[radius + 0.12, y + 0.03, 0]}
        tone={tone === "middle" ? "upper" : tone === "lower" ? "lower" : "same"}
      />
    </>
  );
}

type ZincAtomProps = {
  atom: ZnVisualAtom;
  viewMode: CrystalViewMode;
  modelStyle: CrystalModelStyle;
  showLabel: boolean;
};

function ZincAtom({ atom, viewMode, modelStyle, showLabel }: ZincAtomProps) {
  const isLayerMode = viewMode === "layer";
  const isCountingMode = viewMode === "counting";
  const isCoordinationMode = viewMode === "coordination";
  const isMetallicBondMode = viewMode === "metallicBond";
  const isPackingModel = modelStyle === "packing";
  const highlightColor = getHighlightColor(atom.kind);
  const shouldHighlight =
    isCoordinationMode ||
    (isCountingMode && (atom.kind === "corner" || atom.kind === "face" || atom.kind === "internal")) ||
    (isLayerMode && atom.layer === "B");
  const baseScale = atom.kind === "center"
    ? 1.24
    : shouldHighlight
      ? 1.08
      : 1;
  const coordinationPackingScale = isPackingModel && isCoordinationMode ? 1.42 : 1;
  const scale = baseScale * coordinationPackingScale;
  const opacity = isMetallicBondMode ? (isPackingModel ? 0.82 : 0.76) : 1;
  const emissive = shouldHighlight && !isPackingModel
    ? highlightColor
    : isMetallicBondMode
      ? "#CBD5E1"
      : "#000000";
  const emissiveIntensity = shouldHighlight && !isPackingModel
    ? 0.2
    : isMetallicBondMode
      ? 0.07
      : 0;
  const shouldShowLabel =
    showLabel &&
    (atom.kind === "center" ||
      atom.id === "unit-top-corner-1" ||
      atom.id === "unit-top-face" ||
      atom.id === "unit-inner-1" ||
      atom.id === "cluster-same-1" ||
      atom.id === "cluster-upper-1" ||
      atom.id === "cluster-lower-1" ||
      isCountingMode);

  return (
    <group position={atom.position}>
      <mesh castShadow>
        <sphereGeometry args={[atom.radius * scale, 32, 32]} />
        <meshStandardMaterial
          color={zincBaseColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          metalness={0.48}
          opacity={opacity}
          roughness={0.24}
          transparent={opacity < 1}
        />
      </mesh>
      {isCountingMode ? (
        <mesh>
          <sphereGeometry args={[atom.radius * 1.44, 32, 32]} />
          <meshBasicMaterial color={highlightColor} opacity={0.14} transparent />
        </mesh>
      ) : null}
      {shouldShowLabel ? (
        <Html center distanceFactor={6.8} pointerEvents="none" position={[0, atom.radius + 0.1, 0]}>
          <span className={htmlOverlayLabelClass}>
            {getAtomLabel(atom, viewMode)}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

function getAtomLabel(atom: ZnVisualAtom, viewMode: CrystalViewMode) {
  if (viewMode === "counting") {
    if (atom.kind === "corner") return "顶角 Zn · 1/6";
    if (atom.kind === "face") return "面心 Zn · 1/2";
    if (atom.kind === "internal") return "内部 Zn · 1";
  }

  return atom.label;
}

function getHighlightColor(kind: ZnSiteKind) {
  if (kind === "center") return zincHighlight;
  if (kind === "same-neighbor" || kind === "corner") return sameLayerHighlight;
  if (kind === "upper-neighbor" || kind === "face") return upperLayerHighlight;
  if (kind === "lower-neighbor" || kind === "internal") return lowerLayerHighlight;
  return zincBaseColor;
}

function CountingLabels() {
  return (
    <>
      <LayerBadge label="顶角：12 × 1/6 = 2" position={[1.18, 0.78, 0]} tone="same" />
      <LayerBadge label="面心：2 × 1/2 = 1" position={[0.2, 1.02, 0.42]} tone="upper" />
      <LayerBadge label="内部：3 × 1 = 3" position={[0.12, 0.2, -0.82]} tone="lower" />
      <LayerBadge label="合计：6" position={[0, -1.05, 0]} tone="center" />
    </>
  );
}

function LayerBadge({
  label,
  position,
  tone,
}: {
  label: string;
  position: [number, number, number];
  tone: "same" | "upper" | "lower" | "center" | "note";
}) {
  return (
    <Html center distanceFactor={7.2} pointerEvents="none" position={position}>
      <span className={`whitespace-nowrap rounded-full border px-2 py-1 text-xs font-bold ${crystalOverlayBadgeToneClasses[tone]}`}>
        {label}
      </span>
    </Html>
  );
}

function MetallicBondHint() {
  return (
    <>
      <mesh position={[0, 0, 0]} scale={[1.05, 0.76, 1.05]}>
        <sphereGeometry args={[1.03, 48, 48]} />
        <meshBasicMaterial color="#D6E4F0" opacity={0.14} transparent />
      </mesh>
      <mesh position={[0, 0, 0]} scale={[0.78, 0.58, 0.78]}>
        <sphereGeometry args={[1.03, 48, 48]} />
        <meshBasicMaterial color="#F4DFA6" opacity={0.09} transparent />
      </mesh>
      <FloatingElectrons />
    </>
  );
}

function FloatingElectrons() {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    group.rotation.y = clock.elapsedTime * 0.08;
    group.children.forEach((child, index) => {
      child.position.y = electronPoints[index][1] + Math.sin(clock.elapsedTime * 0.7 + index) * 0.035;
    });
  });

  return (
    <group ref={groupRef}>
      {electronPoints.map((position, index) => (
        <mesh key={`${position.join(",")}-${index}`} position={position}>
          <sphereGeometry args={[0.018, 16, 16]} />
          <meshBasicMaterial color={index % 2 === 0 ? "#F4A261" : "#2A9D8F"} opacity={0.5} transparent />
        </mesh>
      ))}
    </group>
  );
}

function DashedGuide({
  start,
  end,
  color,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
}) {
  const segments = useMemo(() => {
    const startVector = new Vector3(...start);
    const endVector = new Vector3(...end);
    const segmentCount = 9;
    const segmentLengthRatio = 0.52;

    return Array.from({ length: segmentCount }, (_, index) => {
      const segmentStartRatio = index / segmentCount;
      const segmentEndRatio = segmentStartRatio + segmentLengthRatio / segmentCount;

      return {
        start: startVector.clone().lerp(endVector, segmentStartRatio).toArray() as [number, number, number],
        end: startVector.clone().lerp(endVector, Math.min(segmentEndRatio, 1)).toArray() as [number, number, number],
      };
    });
  }, [end, start]);

  return (
    <>
      {segments.map((segment, index) => (
        <StaticCylinder
          color={color}
          end={segment.end}
          key={`${end.join(",")}-${index}`}
          opacity={0.5}
          radius={0.004}
          start={segment.start}
        />
      ))}
    </>
  );
}

type StaticCylinderProps = {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  opacity: number;
  radius: number;
};

function StaticCylinder({ start, end, color, opacity, radius }: StaticCylinderProps) {
  const geometry = useMemo(() => {
    const startVector = new Vector3(...start);
    const endVector = new Vector3(...end);
    const direction = new Vector3().subVectors(endVector, startVector);
    const midpoint = new Vector3().addVectors(startVector, endVector).multiplyScalar(0.5);
    const quaternion = new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      direction.clone().normalize(),
    );

    return {
      length: direction.length(),
      midpoint,
      quaternion,
    };
  }, [end, start]);

  return (
    <mesh position={geometry.midpoint} quaternion={geometry.quaternion}>
      <cylinderGeometry args={[radius, radius, geometry.length, 12]} />
      <meshBasicMaterial color={color} opacity={opacity} transparent />
    </mesh>
  );
}
