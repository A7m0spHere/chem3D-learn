import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import { AngleArc } from "@/components/three/AngleArc";
import { AtomMesh } from "@/components/three/AtomMesh";
import { BondMesh } from "@/components/three/BondMesh";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { getBenzenePlanarModeInfo, type BenzenePlaneView } from "@/data/benzenePlanar";
import type { AngleSpec, Atom, BenzenePlanarMode, Bond } from "@/types/molecule";

type Vec3 = [number, number, number];

type BenzenePlanarCellProps = {
  mode: BenzenePlanarMode;
  loading?: boolean;
  planeView?: BenzenePlaneView;
};

const carbonRadius = 1.12;
const hydrogenRadius = 1.78;

const ringAngles = [0, 60, 120, 180, 240, 300].map((angle) => (angle * Math.PI) / 180);

const benzeneAtoms: Atom[] = [
  ...ringAngles.map((angle, index): Atom => ({
    id: `c${index + 1}`,
    element: "C",
    label: `C${index + 1}`,
    position: [
      Number((carbonRadius * Math.cos(angle)).toFixed(4)),
      Number((carbonRadius * Math.sin(angle)).toFixed(4)),
      0,
    ],
    color: "#1F2933",
    radius: 0.2,
  })),
  ...ringAngles.map((angle, index): Atom => ({
    id: `h${index + 1}`,
    element: "H",
    label: "H",
    position: [
      Number((hydrogenRadius * Math.cos(angle)).toFixed(4)),
      Number((hydrogenRadius * Math.sin(angle)).toFixed(4)),
      0,
    ],
    color: "#FFFFFF",
    radius: 0.14,
  })),
];

const benzeneBonds: Bond[] = [
  ...[1, 2, 3, 4, 5, 6].map((index): Bond => ({
    id: `c${index}-c${index === 6 ? 1 : index + 1}`,
    atomIds: [`c${index}`, `c${index === 6 ? 1 : index + 1}`],
    kind: "single",
    order: 1,
  })),
  ...[1, 2, 3, 4, 5, 6].map((index): Bond => ({
    id: `c${index}-h${index}`,
    atomIds: [`c${index}`, `h${index}`],
    kind: "single",
    order: 1,
  })),
];

const angleSpecs: AngleSpec[] = [
  {
    id: "h1-c1-c2",
    atomIds: ["h1", "c1", "c2"],
    valueDeg: 120,
    label: "≈120°",
    descriptionZh: "苯环中每个碳近似 sp2 杂化，键角约为 120°。",
  },
  {
    id: "c3-c2-h2",
    atomIds: ["c3", "c2", "h2"],
    valueDeg: 120,
    label: "≈120°",
    descriptionZh: "正六边形结构中相邻键方向形成代表性 120° 键角。",
  },
];

export function BenzenePlanarCell({
  mode,
  loading = false,
  planeView = "top",
}: BenzenePlanarCellProps) {
  const modeInfo = getBenzenePlanarModeInfo(mode);
  const atomsById = useMemo(
    () => new Map(benzeneAtoms.map((atom) => [atom.id, atom])),
    [],
  );
  const canvasKey = `${mode}-${planeView}`;

  return (
    <ThreeViewerFrame
      loading={loading}
      meta="拖拽旋转 · 滚轮或触控板缩放"
      stageTestId="benzene-planar-canvas"
      summary={modeInfo.summary}
      title={modeInfo.viewerTitle}
      viewerTestId="benzene-planar-viewer"
    >
      <Canvas
        camera={{ position: getCameraPosition(mode, planeView), fov: mode === "plane" ? 38 : 42 }}
        key={canvasKey}
        shadows
        frameloop="demand"
        style={{ height: "100%", width: "100%" }}
      >
        <ambientLight intensity={0.68} />
        <directionalLight position={[3.6, 4.4, 4.8]} intensity={1.28} castShadow />
        <directionalLight position={[-3.4, -2.8, 2.6]} intensity={0.36} />
        <group rotation={getSceneRotation(mode, planeView)} scale={1.03}>
          <ReferencePlane mode={mode} planeView={planeView} />
          <BenzeneCore atomsById={atomsById} mode={mode} />
          {mode === "angle" ? <AngleOverlay atomsById={atomsById} /> : null}
          {mode === "diagonal" ? <DiagonalOverlay /> : null}
          {mode === "piBond" ? <PiBondOverlay /> : null}
        </group>
        <OrbitControls
          enableDamping
          enablePan={false}
          maxDistance={8}
          minDistance={2.4}
          target={[0, 0, 0]}
        />
      </Canvas>
    </ThreeViewerFrame>
  );
}

function BenzeneCore({
  atomsById,
  mode,
}: {
  atomsById: Map<string, Atom>;
  mode: BenzenePlanarMode;
}) {
  const focusedAtoms = mode === "diagonal" ? new Set(["h1", "c1", "c4", "h4"]) : new Set<string>();
  const focusedBonds =
    mode === "diagonal"
      ? new Set(["c1-h1", "c4-h4"])
      : mode === "piBond"
        ? new Set(["c1-c2", "c2-c3", "c3-c4", "c4-c5", "c5-c6", "c6-c1"])
        : new Set<string>();

  return (
    <>
      {benzeneBonds.map((bond) => (
        <BondMesh
          atomsById={atomsById}
          bond={bond}
          isFocused={focusedBonds.has(bond.id)}
          key={bond.id}
          radius={bond.id.includes("-h") ? 0.024 : 0.031}
        />
      ))}
      <AromaticRing active={mode === "overview" || mode === "piBond"} />
      {benzeneAtoms.map((atom) => (
        <AtomMesh
          atom={atom}
          atomScale={1}
          isFocused={focusedAtoms.has(atom.id)}
          key={atom.id}
          showLabel={false}
        />
      ))}
    </>
  );
}

function AromaticRing({ active }: { active: boolean }) {
  const points = useMemo(
    () =>
      Array.from({ length: 73 }).map((_, index): Vec3 => {
        const angle = (index / 72) * Math.PI * 2;
        return [0.56 * Math.cos(angle), 0.56 * Math.sin(angle), 0.018];
      }),
    [],
  );

  return (
    <Line
      color={active ? "#2A9D8F" : "#9AB0AC"}
      lineWidth={active ? 2.2 : 1.35}
      opacity={active ? 0.78 : 0.45}
      points={points}
      transparent
    />
  );
}

function ReferencePlane({
  mode,
  planeView,
}: {
  mode: BenzenePlanarMode;
  planeView: BenzenePlaneView;
}) {
  if (mode !== "plane") return null;

  return (
    <>
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[2.12, 96]} />
        <meshBasicMaterial color="#2A9D8F" depthWrite={false} opacity={0.11} transparent />
      </mesh>
      <Line
        color="#2A9D8F"
        lineWidth={1.7}
        points={[
          [-2.15, -1.88, 0.006],
          [2.15, -1.88, 0.006],
          [2.15, 1.88, 0.006],
          [-2.15, 1.88, 0.006],
          [-2.15, -1.88, 0.006],
        ]}
      />
      {planeView === "side" ? (
        <StaticCylinder
          color="#2A9D8F"
          end={[2.16, 0, 0]}
          opacity={0.72}
          radius={0.008}
          start={[-2.16, 0, 0]}
        />
      ) : null}
    </>
  );
}

function AngleOverlay({ atomsById }: { atomsById: Map<string, Atom> }) {
  const labelOffsets: Record<string, Vec3> = {
    "h1-c1-c2": [0.24, 0.18, 0.3],
    "c3-c2-h2": [0.02, 0.3, 0.3],
  };

  return (
    <>
      {angleSpecs.map((angle) => (
        <AngleArc
          angle={angle}
          atomsById={atomsById}
          htmlPointerEvents="none"
          key={angle.id}
          labelOffset={labelOffsets[angle.id]}
          labelVariant="minimal"
          radius={0.42}
          showGuideLine
        />
      ))}
    </>
  );
}

function DiagonalOverlay() {
  return (
    <>
      <StaticCylinder
        color="#F4A261"
        end={benzeneAtoms.find((atom) => atom.id === "h1")!.position}
        opacity={0.86}
        radius={0.014}
        start={benzeneAtoms.find((atom) => atom.id === "h4")!.position}
      />
      <Html center distanceFactor={6.4} pointerEvents="none" position={[0, -0.22, 0.34]}>
        <span
          className="whitespace-nowrap text-[12px] font-bold text-[#B96320] drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]"
          data-testid="benzene-diagonal-label"
        >
          H–C–C–H 共线
        </span>
      </Html>
    </>
  );
}

function PiBondOverlay() {
  return (
    <>
      {benzeneAtoms
        .filter((atom) => atom.element === "C")
        .map((atom) => (
          <group key={atom.id}>
            <POrbital center={[atom.position[0], atom.position[1], 0.38]} sign="top" />
            <POrbital center={[atom.position[0], atom.position[1], -0.38]} sign="bottom" />
            <StaticCylinder
              color="#5BAEA5"
              end={[atom.position[0], atom.position[1], 0.68]}
              opacity={0.42}
              radius={0.008}
              start={[atom.position[0], atom.position[1], -0.68]}
            />
          </group>
        ))}
      <PiCloud center={[0, 0, 0.52]} />
      <PiCloud center={[0, 0, -0.52]} />
      <Html center distanceFactor={6.6} pointerEvents="none" position={[0, 0, 0.86]}>
        <span
          className="whitespace-nowrap text-[11px] font-semibold text-primary-dark/70 drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]"
          data-testid="benzene-pi-label"
        >
          大 π 电子云
        </span>
      </Html>
    </>
  );
}

function POrbital({ center, sign }: { center: Vec3; sign: "top" | "bottom" }) {
  return (
    <mesh position={center} scale={[0.14, 0.14, 0.3]}>
      <sphereGeometry args={[1, 28, 24]} />
      <meshStandardMaterial
        color={sign === "top" ? "#BDEBE5" : "#F7D6A7"}
        depthWrite={false}
        emissive={sign === "top" ? "#DFF8F4" : "#FFF0D8"}
        emissiveIntensity={0.05}
        opacity={0.38}
        roughness={0.28}
        transparent
      />
    </mesh>
  );
}

function PiCloud({ center }: { center: Vec3 }) {
  return (
    <mesh position={center} scale={[1.36, 1.36, 0.13]}>
      <sphereGeometry args={[1, 64, 32]} />
      <meshStandardMaterial
        color="#2A9D8F"
        depthWrite={false}
        emissive="#DFF8F4"
        emissiveIntensity={0.08}
        opacity={0.15}
        roughness={0.3}
        transparent
      />
    </mesh>
  );
}

function StaticCylinder({
  start,
  end,
  color,
  opacity = 1,
  radius = 0.018,
}: {
  start: Vec3;
  end: Vec3;
  color: string;
  opacity?: number;
  radius?: number;
}) {
  const startVector = new Vector3(...start);
  const endVector = new Vector3(...end);
  const direction = new Vector3().subVectors(endVector, startVector);
  const midpoint = new Vector3().addVectors(startVector, endVector).multiplyScalar(0.5);
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize());

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, direction.length(), 16]} />
      <meshBasicMaterial color={color} opacity={opacity} transparent={opacity < 1} />
    </mesh>
  );
}

function getCameraPosition(mode: BenzenePlanarMode, planeView: BenzenePlaneView): Vec3 {
  if (mode === "plane" && planeView === "top") return [0, 0, 5.7];
  if (mode === "plane" && planeView === "side") return [0, -6.0, 0.18];
  if (mode === "piBond") return [0.2, -5.0, 3.5];
  return [0.12, -4.9, 3.35];
}

function getSceneRotation(mode: BenzenePlanarMode, planeView: BenzenePlaneView): Vec3 {
  if (mode === "plane" && planeView === "top") return [0, 0, 0];
  if (mode === "plane" && planeView === "side") return [0, 0, 0];
  return [-0.12, 0.02, 0];
}
