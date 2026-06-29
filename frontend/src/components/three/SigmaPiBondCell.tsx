import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import { AtomMesh } from "@/components/three/AtomMesh";
import { BondMesh } from "@/components/three/BondMesh";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { getSigmaPiBondModeInfo } from "@/data/sigmaPiBonds";
import type { Atom, Bond, SigmaPiBondMode } from "@/types/molecule";

type Vec3 = [number, number, number];

type SigmaPiBondCellProps = {
  mode: SigmaPiBondMode;
  loading?: boolean;
  showLabels?: boolean;
};

const ethyleneAtoms: Atom[] = [
  { id: "c1", element: "C", label: "C", position: [-0.67, 0, 0], color: "#1F2933", radius: 0.22 },
  { id: "c2", element: "C", label: "C", position: [0.67, 0, 0], color: "#1F2933", radius: 0.22 },
  { id: "h1", element: "H", label: "H", position: [-1.215, 0.944, 0], color: "#FFFFFF", radius: 0.15 },
  { id: "h2", element: "H", label: "H", position: [-1.215, -0.944, 0], color: "#FFFFFF", radius: 0.15 },
  { id: "h3", element: "H", label: "H", position: [1.215, 0.944, 0], color: "#FFFFFF", radius: 0.15 },
  { id: "h4", element: "H", label: "H", position: [1.215, -0.944, 0], color: "#FFFFFF", radius: 0.15 },
];

const ethyleneBonds: Bond[] = [
  { id: "c1-c2", atomIds: ["c1", "c2"], kind: "double", order: 2 },
  { id: "c1-h1", atomIds: ["c1", "h1"], kind: "single", order: 1 },
  { id: "c1-h2", atomIds: ["c1", "h2"], kind: "single", order: 1 },
  { id: "c2-h3", atomIds: ["c2", "h3"], kind: "single", order: 1 },
  { id: "c2-h4", atomIds: ["c2", "h4"], kind: "single", order: 1 },
];

export function SigmaPiBondCell({ mode, loading = false, showLabels = false }: SigmaPiBondCellProps) {
  const modeInfo = getSigmaPiBondModeInfo(mode);
  const atomsById = useMemo(
    () => new Map(ethyleneAtoms.map((atom) => [atom.id, atom])),
    [],
  );
  const canvasKey = `sigma-pi-${mode}`;

  return (
    <ThreeViewerFrame
      loading={loading}
      meta="拖拽旋转 · 滚轮或触控板缩放"
      stageTestId="sigma-pi-bonds-canvas"
      summary={modeInfo.viewerSummary}
      title={modeInfo.viewerTitle}
      viewerTestId="sigma-pi-bonds-viewer"
    >
        <Canvas
          camera={{ position: getCameraPosition(mode), fov: 42 }}
          key={canvasKey}
          shadows
          frameloop="demand"
          style={{ height: "100%", width: "100%" }}
        >
          <ambientLight intensity={0.68} />
          <directionalLight position={[3.4, 4.6, 4.2]} intensity={1.35} castShadow />
          <directionalLight position={[-3.2, -2.4, 2.6]} intensity={0.34} />
          <group rotation={getSceneRotation(mode)} scale={1.1}>
            <MoleculeCore atomsById={atomsById} mode={mode} showLabels={showLabels} />
            <ModeOverlay mode={mode} showLabels={showLabels} />
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

function MoleculeCore({
  atomsById,
  mode,
  showLabels,
}: {
  atomsById: Map<string, Atom>;
  mode: SigmaPiBondMode;
  showLabels: boolean;
}) {
  const bonds = ethyleneBonds.map((bond) =>
    bond.id === "c1-c2" && mode === "sigma"
      ? { ...bond, kind: "single" as const, order: 1 as const }
      : bond,
  );
  const showAtomLabels = showLabels && (mode === "overview" || mode === "doubleBond");
  const focusCarbon = mode !== "overview";
  const focusBond = mode === "sigma" || mode === "pi" || mode === "doubleBond";

  return (
    <>
      {bonds.map((bond) => (
        <BondMesh
          atomsById={atomsById}
          bond={bond}
          isFocused={bond.id === "c1-c2" && focusBond}
          key={bond.id}
          radius={bond.id === "c1-c2" ? 0.032 : 0.025}
        />
      ))}
      {ethyleneAtoms.map((atom) => (
        <AtomMesh
          atom={atom}
          atomScale={1}
          isFocused={focusCarbon && atom.element === "C"}
          key={atom.id}
          showLabel={showAtomLabels}
        />
      ))}
    </>
  );
}

function ModeOverlay({ mode, showLabels }: { mode: SigmaPiBondMode; showLabels: boolean }) {
  if (mode === "sigma") {
    return (
      <>
        <SigmaCloud />
        <SigmaAxis showLabel={showLabels} />
      </>
    );
  }

  if (mode === "pi") {
    return (
      <>
        <PiOrbitalSet />
        <PiClouds showLabels={showLabels} />
      </>
    );
  }

  if (mode === "doubleBond") {
    return (
      <>
        <SigmaCloud />
        <PiOrbitalSet />
        <PiClouds compact showLabels={showLabels} />
        {showLabels ? <BondCompositionLabels /> : null}
      </>
    );
  }

  return (
    <>
      <SigmaCloud subtle />
      <PiOrbitalSet />
      <PiClouds compact showLabels={showLabels} />
      {showLabels ? <BondCompositionLabels /> : null}
    </>
  );
}

function SigmaCloud({ subtle = false }: { subtle?: boolean }) {
  return (
    <mesh position={[0, 0, 0]} scale={[0.92, 0.18, 0.18]}>
      <sphereGeometry args={[1, 48, 32]} />
      <meshStandardMaterial
        color="#F4A261"
        depthWrite={false}
        emissive="#FFF0D8"
        emissiveIntensity={0.06}
        opacity={subtle ? 0.12 : 0.24}
        roughness={0.28}
        transparent
      />
    </mesh>
  );
}

function SigmaAxis({ showLabel }: { showLabel: boolean }) {
  return (
    <>
      <StaticCylinder
        color="#F4A261"
        end={[0.92, 0, 0]}
        opacity={0.76}
        radius={0.014}
        start={[-0.92, 0, 0]}
      />
      {showLabel ? (
        <Html center distanceFactor={6.5} pointerEvents="none" position={[0, 0.34, 0.22]}>
          <span className="whitespace-nowrap text-[11px] font-semibold text-[#B96320] drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]">
            键轴
          </span>
        </Html>
      ) : null}
    </>
  );
}

function PiOrbitalSet() {
  return (
    <>
      <group>
        <POrbital center={[-0.67, 0, 0.48]} tone="top" />
        <POrbital center={[-0.67, 0, -0.48]} tone="bottom" />
        <OrbitalSpine x={-0.67} />
      </group>
      <group>
        <POrbital center={[0.67, 0, 0.48]} tone="top" />
        <POrbital center={[0.67, 0, -0.48]} tone="bottom" />
        <OrbitalSpine x={0.67} />
      </group>
    </>
  );
}

function POrbital({ center, tone }: { center: Vec3; tone: "top" | "bottom" }) {
  return (
    <mesh position={center} scale={[0.18, 0.2, 0.42]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={tone === "top" ? "#BDEBE5" : "#F7D6A7"}
        depthWrite={false}
        emissive={tone === "top" ? "#DFF8F4" : "#FFF0D8"}
        emissiveIntensity={0.06}
        opacity={0.36}
        roughness={0.3}
        transparent
      />
    </mesh>
  );
}

function OrbitalSpine({ x }: { x: number }) {
  return (
    <StaticCylinder
      color="#5BAEA5"
      end={[x, 0, 0.84]}
      opacity={0.34}
      radius={0.009}
      start={[x, 0, -0.84]}
    />
  );
}

function PiClouds({ compact = false, showLabels = false }: { compact?: boolean; showLabels?: boolean }) {
  const scale: Vec3 = compact ? [0.92, 0.2, 0.15] : [1.1, 0.25, 0.18];

  return (
    <>
      <PiCloud center={[0, 0, 0.62]} label="π 电子云" scale={scale} showLabel={showLabels} />
      <PiCloud center={[0, 0, -0.62]} label="" scale={scale} showLabel={false} />
    </>
  );
}

function PiCloud({
  center,
  label,
  scale,
  showLabel,
}: {
  center: Vec3;
  label: string;
  scale: Vec3;
  showLabel: boolean;
}) {
  return (
    <group>
      <mesh position={center} scale={scale}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial
          color="#2A9D8F"
          depthWrite={false}
          emissive="#DFF8F4"
          emissiveIntensity={0.08}
          opacity={0.1}
          roughness={0.3}
          transparent
        />
      </mesh>
      {showLabel ? (
        <Html center distanceFactor={6.9} pointerEvents="none" position={[center[0], center[1] + 0.34, center[2]]}>
          <span className="whitespace-nowrap text-[11px] font-semibold text-primary-dark/70 drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]">
            {label}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

function BondCompositionLabels() {
  return (
    <>
      <Html center distanceFactor={6.1} pointerEvents="none" position={[0, 0.66, 0.58]}>
        <span className="whitespace-nowrap text-[11px] font-bold text-primary-dark/75 drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]">
          π
        </span>
      </Html>
      <Html center distanceFactor={6.4} pointerEvents="none" position={[0, 0.28, 0.05]}>
        <span className="whitespace-nowrap text-[11px] font-bold text-[#B96320] drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]">
          σ
        </span>
      </Html>
    </>
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

function getCameraPosition(mode: SigmaPiBondMode): Vec3 {
  if (mode === "sigma") return [0.12, -4.5, 2.3];
  return [0.18, -4.8, 3.05];
}

function getSceneRotation(mode: SigmaPiBondMode): Vec3 {
  if (mode === "sigma") return [-0.05, 0.04, 0];
  return [-0.12, 0.05, 0];
}
