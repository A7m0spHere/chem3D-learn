import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { StickCylinder } from "@/components/three/StickCylinder";
import { AngleArc } from "@/components/three/AngleArc";
import { CameraRig } from "@/components/three/CameraRig";
import { AtomMesh } from "@/components/three/AtomMesh";
import { BondMesh } from "@/components/three/BondMesh";
import { htmlOverlaySp2LabelClass } from "@/components/three/htmlOverlayStyles";
import { POrbitalPair, PiCloudBand } from "@/components/three/OrbitalPrimitives";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { getEthylenePlanarModeInfo, type EthylenePlaneView } from "@/data/ethylenePlanar";
import type { AngleSpec, Atom, Bond, EthylenePlanarMode } from "@/types/molecule";

type Vec3 = [number, number, number];

type EthylenePlanarCellProps = {
  mode: EthylenePlanarMode;
  loading?: boolean;
  planeView?: EthylenePlaneView;
};

const ethyleneAtoms: Atom[] = [
  { id: "c1", element: "C", label: "C1", position: [-0.67, 0, 0], color: "#1F2933", radius: 0.22 },
  { id: "c2", element: "C", label: "C2", position: [0.67, 0, 0], color: "#1F2933", radius: 0.22 },
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

const angleSpecs: AngleSpec[] = [
  {
    id: "h1-c1-c2",
    atomIds: ["h1", "c1", "c2"],
    valueDeg: 120,
    label: "≈120°",
    descriptionZh: "sp² 杂化使乙烯中每个碳周围的键角约为 120°。",
  },
  {
    id: "c1-c2-h3",
    atomIds: ["c1", "c2", "h3"],
    valueDeg: 120,
    label: "≈120°",
    descriptionZh: "乙烯两端都是 sp² 碳。",
  },
];

export function EthylenePlanarCell({
  mode,
  loading = false,
  planeView = "top",
}: EthylenePlanarCellProps) {
  const modeInfo = getEthylenePlanarModeInfo(mode);
  const atomsById = useMemo(
    () => new Map(ethyleneAtoms.map((atom) => [atom.id, atom])),
    [],
  );
  const cameraPosition = getCameraPosition(mode, planeView);

  return (
    <ThreeViewerFrame
      loading={loading}
      meta="拖拽旋转 · 滚轮或触控板缩放"
      stageTestId="ethylene-planar-canvas"
      summary={modeInfo.summary}
      title={modeInfo.viewerTitle}
      viewerTestId="ethylene-planar-viewer"
    >
        <Canvas
          camera={{ position: cameraPosition, fov: mode === "plane" && planeView === "side" ? 36 : 42 }}
            frameloop="demand"
          style={{ height: "100%", width: "100%" }}
        >
          <CameraRig
            fov={mode === "plane" && planeView === "side" ? 36 : 42}
            position={cameraPosition}
            resetKey={`${mode}-${planeView}`}
          />
          <ambientLight intensity={0.68} />
          <directionalLight position={[3.4, 4.6, 4.2]} intensity={1.35} />
          <directionalLight position={[-3.2, -2.4, 2.6]} intensity={0.32} />
          <group rotation={getSceneRotation(mode, planeView)} scale={1.02}>
            <ReferenceGeometry mode={mode} planeView={planeView} />
            <MoleculeCore atomsById={atomsById} mode={mode} />
            {mode === "overview" || mode === "angle" ? <Sp2Labels /> : null}
            {mode === "angle" ? <AngleOverlay atomsById={atomsById} /> : null}
            {mode === "piBond" ? <PiBondOverlay /> : null}
            {mode === "rotationLock" ? <RotationLockOverlay /> : null}
          </group>
          <OrbitControls
            enableDamping
            enablePan={false}
            makeDefault
            maxDistance={8}
            minDistance={2.25}
            target={[0, 0, 0]}
          />
        </Canvas>
    </ThreeViewerFrame>
  );
}

function MoleculeCore({
  atomsById,
  mode,
}: {
  atomsById: Map<string, Atom>;
  mode: EthylenePlanarMode;
}) {
  const focusedBondId = mode === "piBond" || mode === "rotationLock" ? "c1-c2" : "";

  return (
    <>
      {ethyleneBonds.map((bond) => (
        <BondMesh
          atomsById={atomsById}
          bond={bond}
          isFocused={bond.id === focusedBondId}
          key={bond.id}
          radius={bond.id === "c1-c2" ? 0.032 : 0.026}
        />
      ))}
      {ethyleneAtoms.map((atom) => (
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

function ReferenceGeometry({
  mode,
  planeView,
}: {
  mode: EthylenePlanarMode;
  planeView: EthylenePlaneView;
}) {
  return (
    <>
      {mode === "plane" ? (
        <>
          <mesh position={[0, 0, -0.018]}>
            <planeGeometry args={[3.3, 2.45]} />
            <meshBasicMaterial color="#2A9D8F" depthWrite={false} opacity={0.12} transparent />
          </mesh>
          <Line
            color="#2A9D8F"
            lineWidth={1.6}
            points={[
              [-1.65, -1.18, 0.006],
              [1.65, -1.18, 0.006],
              [1.65, 1.18, 0.006],
              [-1.65, 1.18, 0.006],
              [-1.65, -1.18, 0.006],
            ]}
          />
          {planeView === "side" ? (
            <StickCylinder
              color="#2A9D8F"
              end={[1.72, 0, 0]}
              opacity={0.7}
              radius={0.008}
              start={[-1.72, 0, 0]}
            />
          ) : null}
        </>
      ) : null}
    </>
  );
}

function Sp2Labels() {
  const labels: Array<{ id: string; position: Vec3 }> = [
    { id: "c1", position: [-0.67, -0.42, -0.28] },
    { id: "c2", position: [0.67, -0.42, -0.28] },
  ];

  return (
    <>
      {labels.map((label) => (
        <Html
          center
          distanceFactor={6.8}
          key={label.id}
          pointerEvents="none"
          position={label.position}
        >
          <span
            className={htmlOverlaySp2LabelClass}
            data-testid="ethylene-sp2-label"
          >
            sp²
          </span>
        </Html>
      ))}
    </>
  );
}

function AngleOverlay({ atomsById }: { atomsById: Map<string, Atom> }) {
  const labelOffsets: Record<string, Vec3> = {
    "h1-c1-c2": [-0.22, 0.28, 0.28],
    "c1-c2-h3": [0.22, 0.28, 0.28],
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
          radius={0.47}
          showGuideLine
        />
      ))}
    </>
  );
}

function PiBondOverlay() {
  return (
    <>
      {[-0.67, 0.67].map((x) => (
        <group key={x}>
          <POrbitalPair
            center={[x, 0, 0]}
            direction={[0, 0, 1]}
            length={0.46}
            opacity={0.16}
            seed={x < 0 ? 241 : 251}
            showAxis={false}
            width={0.09}
          />
          <StickCylinder
            color="#5BAEA5"
            end={[x, 0, 0.68]}
            opacity={0.18}
            radius={0.006}
            start={[x, 0, -0.68]}
          />
        </group>
      ))}
      <PiCloud center={[0, 0, 0.58]} tone="primary" />
      <PiCloud center={[0, 0, -0.58]} tone="warm" />
    </>
  );
}

function PiCloud({ center, tone }: { center: Vec3; tone: "primary" | "warm" }) {
  return (
    <group>
      <PiCloudBand
        cloudStyle="overlap-lobes"
        center={center}
        length={0.84}
        opacity={0.38}
        orientation="xy"
        phaseTone="same"
        seed={center[2] > 0 ? 307 : 317}
        thickness={0.15}
        tone={tone}
        waist={0.34}
        width={0.26}
      />
    </group>
  );
}

function RotationLockOverlay() {
  const ghostAtoms = getTwistedGhostAtoms();

  return (
    <>
      <RotationArrow />
      <TwistedGhost atoms={ghostAtoms} />
      <PiBondOverlay />
    </>
  );
}

function RotationArrow() {
  const points = Array.from({ length: 34 }).map((_, index): Vec3 => {
    const angle = -0.55 * Math.PI + (index / 33) * 1.35 * Math.PI;
    return [0, 0.58 * Math.cos(angle), 0.58 * Math.sin(angle)];
  });

  return (
    <>
      <Line color="#F4A261" lineWidth={2.4} points={points} />
      <mesh position={[0, -0.35, 0.46]} rotation={[0.95, 0, 0]}>
        <coneGeometry args={[0.06, 0.16, 24]} />
        <meshStandardMaterial color="#F4A261" roughness={0.36} />
      </mesh>
      <mesh position={[0, 0, 0.62]}>
        <torusGeometry args={[0.2, 0.013, 12, 64]} />
        <meshBasicMaterial color="#E76F51" opacity={0.72} transparent />
      </mesh>
      <StickCylinder color="#E76F51" end={[0, 0.14, 0.74]} opacity={0.82} radius={0.014} start={[0, -0.14, 0.5]} />
    </>
  );
}

function TwistedGhost({ atoms }: { atoms: Atom[] }) {
  const ghostAtomsById = useMemo(() => new Map(atoms.map((atom) => [atom.id, atom])), [atoms]);
  const ghostBonds: Bond[] = [
    { id: "ghost-c2-h3", atomIds: ["c2", "h3"], kind: "single", order: 1 },
    { id: "ghost-c2-h4", atomIds: ["c2", "h4"], kind: "single", order: 1 },
  ];

  return (
    <group>
      {ghostBonds.map((bond) => (
        <GhostBond atomsById={ghostAtomsById} bond={bond} key={bond.id} />
      ))}
      {atoms
        .filter((atom) => atom.id === "h3" || atom.id === "h4")
        .map((atom) => (
          <mesh key={atom.id} position={atom.position}>
            <sphereGeometry args={[0.14, 24, 24]} />
            <meshStandardMaterial color="#F4A261" opacity={0.22} roughness={0.36} transparent />
          </mesh>
        ))}
      <StickCylinder
        color="#E76F51"
        end={[0.67, 0, 0.74]}
        opacity={0.36}
        radius={0.009}
        start={[0.67, 0, -0.74]}
      />
    </group>
  );
}

function GhostBond({ bond, atomsById }: { bond: Bond; atomsById: Map<string, Atom> }) {
  const startAtom = atomsById.get(bond.atomIds[0]);
  const endAtom = atomsById.get(bond.atomIds[1]);
  if (!startAtom || !endAtom) return null;

  return (
    <StickCylinder
      color="#F4A261"
      end={endAtom.position}
      opacity={0.24}
      radius={0.016}
      start={startAtom.position}
    />
  );
}

function getTwistedGhostAtoms(): Atom[] {
  const angle = (70 * Math.PI) / 180;
  const c2 = ethyleneAtoms.find((atom) => atom.id === "c2")!;

  return ethyleneAtoms.map((atom) => {
    if (atom.id !== "h3" && atom.id !== "h4") return atom;

    const relativeY = atom.position[1] - c2.position[1];
    const relativeZ = atom.position[2] - c2.position[2];

    return {
      ...atom,
      position: [
        atom.position[0],
        c2.position[1] + relativeY * Math.cos(angle) - relativeZ * Math.sin(angle),
        c2.position[2] + relativeY * Math.sin(angle) + relativeZ * Math.cos(angle),
      ],
    };
  });
}

function getCameraPosition(mode: EthylenePlanarMode, planeView: EthylenePlaneView): Vec3 {
  if (mode === "plane" && planeView === "top") return [0, 0, 5.2];
  if (mode === "plane" && planeView === "side") return [0, -5.6, 0.16];
  if (mode === "piBond" || mode === "rotationLock") return [2.2, -4.5, 3.1];
  return [0.15, -4.6, 2.9];
}

function getSceneRotation(mode: EthylenePlanarMode, planeView: EthylenePlaneView): Vec3 {
  if (mode === "plane" && planeView === "top") return [0, 0, 0];
  if (mode === "plane" && planeView === "side") return [0, 0, 0];
  return [-0.12, 0.05, 0];
}
