import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import { AtomMesh } from "@/components/three/AtomMesh";
import { BondMesh } from "@/components/three/BondMesh";
import { POrbitalPair, PiCloudBand } from "@/components/three/OrbitalPrimitives";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { getAcetyleneLinearModeInfo, type AcetyleneLineView } from "@/data/acetyleneLinear";
import type { AcetyleneLinearMode, Atom, Bond } from "@/types/molecule";

type Vec3 = [number, number, number];

type AcetyleneLinearCellProps = {
  mode: AcetyleneLinearMode;
  loading?: boolean;
  lineView?: AcetyleneLineView;
};

const acetyleneAtoms: Atom[] = [
  { id: "h1", element: "H", label: "H", position: [-1.72, 0, 0], color: "#FFFFFF", radius: 0.15 },
  { id: "c1", element: "C", label: "C1", position: [-0.62, 0, 0], color: "#1F2933", radius: 0.22 },
  { id: "c2", element: "C", label: "C2", position: [0.62, 0, 0], color: "#1F2933", radius: 0.22 },
  { id: "h2", element: "H", label: "H", position: [1.72, 0, 0], color: "#FFFFFF", radius: 0.15 },
];

const acetyleneBonds: Bond[] = [
  { id: "h1-c1", atomIds: ["h1", "c1"], kind: "single", order: 1 },
  { id: "c1-c2", atomIds: ["c1", "c2"], kind: "triple", order: 3 },
  { id: "c2-h2", atomIds: ["c2", "h2"], kind: "single", order: 1 },
];

export function AcetyleneLinearCell({
  mode,
  loading = false,
  lineView = "front",
}: AcetyleneLinearCellProps) {
  const modeInfo = getAcetyleneLinearModeInfo(mode);
  const atomsById = useMemo(
    () => new Map(acetyleneAtoms.map((atom) => [atom.id, atom])),
    [],
  );
  const canvasKey = `${mode}-${lineView}`;

  return (
    <ThreeViewerFrame
      loading={loading}
      meta="拖拽旋转 · 滚轮或触控板缩放"
      stageTestId="acetylene-linear-canvas"
      summary={modeInfo.summary}
      title={modeInfo.viewerTitle}
      viewerTestId="acetylene-linear-viewer"
    >
      <Canvas
        camera={{ position: getCameraPosition(mode, lineView), fov: mode === "line" ? 38 : 42 }}
        key={canvasKey}
        frameloop="demand"
        style={{ height: "100%", width: "100%" }}
      >
        <ambientLight intensity={0.68} />
        <directionalLight position={[3.6, 4.4, 4.8]} intensity={1.3} />
        <directionalLight position={[-3.2, -2.4, 2.4]} intensity={0.34} />
        <group rotation={getSceneRotation(mode, lineView)} scale={1.03}>
          <AcetyleneCore atomsById={atomsById} mode={mode} />
          {mode === "line" ? <LineOverlay lineView={lineView} /> : null}
          {mode === "angle" ? <AngleOverlay /> : null}
          {mode === "piBond" ? <PiBondOverlay /> : null}
          {mode === "tripleBond" ? <TripleBondOverlay /> : null}
        </group>
        <OrbitControls
          enableDamping
          enablePan={false}
          maxDistance={8}
          minDistance={2.2}
          target={[0, 0, 0]}
        />
      </Canvas>
    </ThreeViewerFrame>
  );
}

function AcetyleneCore({
  atomsById,
  mode,
}: {
  atomsById: Map<string, Atom>;
  mode: AcetyleneLinearMode;
}) {
  const focusedBondId = mode === "piBond" || mode === "tripleBond" ? "c1-c2" : "";

  return (
    <>
      {acetyleneBonds.map((bond) => (
        <BondMesh
          atomsById={atomsById}
          bond={bond}
          isFocused={bond.id === focusedBondId}
          key={bond.id}
          radius={bond.id === "c1-c2" ? 0.028 : 0.026}
        />
      ))}
      {acetyleneAtoms.map((atom) => (
        <AtomMesh
          atom={atom}
          atomScale={1}
          isFocused={mode !== "overview" && atom.element === "C"}
          key={atom.id}
          showLabel={false}
        />
      ))}
    </>
  );
}

function LineOverlay({ lineView }: { lineView: AcetyleneLineView }) {
  return (
    <>
      <StaticCylinder
        color="#2A9D8F"
        end={[2.05, 0, 0]}
        opacity={0.78}
        radius={0.01}
        start={[-2.05, 0, 0]}
      />
      {lineView === "side" ? (
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.36, 0.01, 12, 72]} />
          <meshBasicMaterial color="#2A9D8F" opacity={0.42} transparent />
        </mesh>
      ) : null}
      <Html center distanceFactor={6.4} pointerEvents="none" position={[0, -0.34, 0.34]}>
        <span
          className="whitespace-nowrap text-[12px] font-bold text-primary-dark/75 drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]"
          data-testid="acetylene-line-label"
        >
          H–C≡C–H 共线
        </span>
      </Html>
    </>
  );
}

function AngleOverlay() {
  return (
    <>
      <Line
        color="#F4A261"
        lineWidth={2.6}
        points={[
          [-1.24, 0.28, 0],
          [-0.62, 0.28, 0],
          [0.08, 0.28, 0],
        ]}
      />
      <StaticCylinder
        color="#F4A261"
        end={[0.08, 0, 0]}
        opacity={0.5}
        radius={0.006}
        start={[0.08, 0.28, 0]}
      />
      <Html center distanceFactor={6.2} pointerEvents="none" position={[-0.36, 0.56, 0.22]}>
        <span
          className="whitespace-nowrap text-[12px] font-bold text-[#B96320] drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]"
          data-testid="acetylene-angle-label"
        >
          180°
        </span>
      </Html>
    </>
  );
}

function PiBondOverlay() {
  return (
    <>
      {[-0.62, 0.62].map((x) => (
        <group key={x}>
          <POrbitalPair
            center={[x, 0, 0]}
            direction={[0, 0, 1]}
            length={0.5}
            opacity={0.22}
            seed={x < 0 ? 311 : 321}
            showAxis={false}
            width={0.1}
          />
          <POrbitalPair
            center={[x, 0, 0]}
            direction={[0, 1, 0]}
            length={0.5}
            opacity={0.2}
            positiveTone="warm"
            negativeTone="primary"
            seed={x < 0 ? 331 : 341}
            showAxis={false}
            width={0.1}
          />
          <StaticCylinder
            color="#5BAEA5"
            end={[x, 0, 0.72]}
            opacity={0.22}
            radius={0.006}
            start={[x, 0, -0.72]}
          />
          <StaticCylinder
            color="#F4A261"
            end={[x, 0.72, 0]}
            opacity={0.2}
            radius={0.006}
            start={[x, -0.72, 0]}
          />
        </group>
      ))}
      <PiCloud center={[0, 0, 0.55]} axis="z" color="#2A9D8F" />
      <PiCloud center={[0, 0, -0.55]} axis="z" color="#2A9D8F" />
      <PiCloud center={[0, 0.55, 0]} axis="y" color="#F4A261" />
      <PiCloud center={[0, -0.55, 0]} axis="y" color="#F4A261" />
    </>
  );
}

function TripleBondOverlay() {
  return (
    <>
      <PiBondOverlay />
      <StaticCylinder
        color="#1F6F68"
        end={[0.72, 0, 0]}
        opacity={0.72}
        radius={0.016}
        start={[-0.72, 0, 0]}
      />
      <Html center distanceFactor={6.6} pointerEvents="none" position={[0, -0.52, 0.42]}>
        <span
          className="whitespace-nowrap text-[11px] font-semibold text-primary-dark/75 drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]"
          data-testid="acetylene-triple-label"
        >
          1σ + 2π
        </span>
      </Html>
    </>
  );
}

function PiCloud({
  center,
  axis,
  color,
}: {
  center: Vec3;
  axis: "y" | "z";
  color: string;
}) {
  const scale: Vec3 = axis === "z" ? [0.72, 0.18, 0.14] : [0.72, 0.14, 0.18];
  const seed =
    axis === "z"
      ? center[2] > 0
        ? 361
        : 367
      : center[1] > 0
        ? 381
        : 389;

  return (
    <PiCloudBand
      cloudStyle="overlap-lobes"
      center={center}
      length={0.82}
      opacity={axis === "z" ? 0.32 : 0.22}
      orientation={axis === "z" ? "xy" : "xz"}
      scale={scale}
      seed={seed}
      thickness={axis === "z" ? 0.12 : 0.1}
      tone={color === "#F4A261" ? "warm" : "primary"}
      waist={0.28}
      width={axis === "z" ? 0.24 : 0.21}
    />
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

function getCameraPosition(mode: AcetyleneLinearMode, lineView: AcetyleneLineView): Vec3 {
  if (mode === "line" && lineView === "front") return [0, 0, 5.4];
  if (mode === "line" && lineView === "side") return [0, -5.4, 0.18];
  if (mode === "piBond" || mode === "tripleBond") return [0.18, -4.8, 3.15];
  return [0.12, -4.7, 2.95];
}

function getSceneRotation(mode: AcetyleneLinearMode, lineView: AcetyleneLineView): Vec3 {
  if (mode === "line" && lineView === "front") return [0, 0, 0];
  if (mode === "line" && lineView === "side") return [0, 0, 0];
  return [-0.1, 0.04, 0];
}
