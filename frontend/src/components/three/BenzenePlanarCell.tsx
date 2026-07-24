import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { StickCylinder } from "@/components/three/StickCylinder";
import { SceneLighting } from "@/components/three/SceneLighting";
import { AngleArc } from "@/components/three/AngleArc";
import { CameraRig } from "@/components/three/CameraRig";
import { AtomMesh } from "@/components/three/AtomMesh";
import { BondMesh } from "@/components/three/BondMesh";
import { POrbitalPair, PiCloudBand } from "@/components/three/OrbitalPrimitives";
import {
  teachingAccentLabelClass,
  teachingCloudLabelClass,
} from "@/components/three/teachingLabelStyles";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { getBenzenePlanarModeInfo, type BenzenePlaneView } from "@/data/benzenePlanar";
import { benzeneBuilderSeed } from "@/data/organicBuilderSeeds";
import { usePullTransitionProgress } from "@/hooks/usePullTransitionProgress";
import { applyAtomPullOffset } from "@/lib/atomPullTransition";
import type { AngleSpec, Atom, BenzenePlanarMode, Bond } from "@/types/molecule";

type Vec3 = [number, number, number];

type BenzenePlanarCellProps = {
  mode: BenzenePlanarMode;
  loading?: boolean;
  planeView?: BenzenePlaneView;
  onAtomPull?: (atomId: string) => void;
  pullingAtomId?: string;
};

const benzeneAtoms: Atom[] = benzeneBuilderSeed.atoms.map((candidate) => ({
  ...candidate,
  label: candidate.id.startsWith("c") ? candidate.id.toUpperCase() : candidate.element,
}));

const benzeneBonds: Bond[] = [
  ...benzeneBuilderSeed.bonds.map((candidate): Bond => ({
    ...candidate,
    // 观察态配合芳香环圆圈使用等价单棒；拼装态保留交替单双键用于计价。
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
    descriptionZh: "苯环中每个碳近似 sp² 杂化，键角约为 120°。",
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
  onAtomPull,
  pullingAtomId,
}: BenzenePlanarCellProps) {
  const modeInfo = getBenzenePlanarModeInfo(mode);
  const pullProgress = usePullTransitionProgress(pullingAtomId);
  const displayAtoms = useMemo(
    () => applyAtomPullOffset(benzeneAtoms, pullingAtomId, pullProgress),
    [pullProgress, pullingAtomId],
  );
  const atomsById = useMemo(
    () => new Map(displayAtoms.map((atom) => [atom.id, atom])),
    [displayAtoms],
  );

  return (
    <ThreeViewerFrame
      loading={loading}
      meta={onAtomPull ? "拖动空白旋转 · 抓住原子进入拼装" : "拖拽旋转 · 滚轮或触控板缩放"}
      stageTestId="benzene-planar-canvas"
      summary={modeInfo.summary}
      title={modeInfo.viewerTitle}
      viewerTestId="benzene-planar-viewer"
    >
      <Canvas
        camera={{ position: getCameraPosition(mode, planeView), fov: mode === "plane" ? 38 : 42 }}
        frameloop="demand"
        gl={{ alpha: false }}
        style={{ height: "100%", width: "100%" }}
      >
        <CameraRig
          fov={mode === "plane" ? 38 : 42}
          position={getCameraPosition(mode, planeView)}
          resetKey={`${mode}-${planeView}`}
        />
        <color attach="background" args={["#F7FAF9"]} />
        <SceneLighting ambient={0.68} mainIntensity={1.28} mainPosition={[3.6, 4.4, 4.8]} secondaryIntensity={0.36} secondaryPosition={[-3.4, -2.8, 2.6]} />
        <group rotation={getSceneRotation(mode, planeView)} scale={1.03}>
          <ReferencePlane mode={mode} planeView={planeView} />
          <BenzeneCore
            atoms={displayAtoms}
            atomsById={atomsById}
            mode={mode}
            onAtomPull={onAtomPull}
            pullingAtomId={pullingAtomId}
          />
          {mode === "angle" ? <AngleOverlay atomsById={atomsById} /> : null}
          {mode === "diagonal" ? <DiagonalOverlay /> : null}
          {mode === "piBond" ? <PiBondOverlay /> : null}
        </group>
        <OrbitControls
          enabled={!pullingAtomId}
          enableDamping
          enablePan={false}
          makeDefault
          maxDistance={8}
          minDistance={2.4}
          target={[0, 0, 0]}
        />
      </Canvas>
    </ThreeViewerFrame>
  );
}

function BenzeneCore({
  atoms,
  atomsById,
  mode,
  onAtomPull,
  pullingAtomId,
}: {
  atoms: Atom[];
  atomsById: Map<string, Atom>;
  mode: BenzenePlanarMode;
  onAtomPull?: (atomId: string) => void;
  pullingAtomId?: string;
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
          isFocused={focusedBonds.has(bond.id) || Boolean(pullingAtomId && bond.atomIds.includes(pullingAtomId))}
          key={bond.id}
          radius={bond.id.includes("-h") ? 0.024 : 0.031}
        />
      ))}
      <AromaticRing active={mode === "overview" || mode === "piBond"} />
      {atoms.map((atom) => (
        <AtomMesh
          atom={atom}
          atomScale={1}
          isFocused={focusedAtoms.has(atom.id)}
          isPulling={pullingAtomId === atom.id}
          key={atom.id}
          onPullIntent={onAtomPull}
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
        <StickCylinder
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
      <StickCylinder
        color="#F4A261"
        end={benzeneAtoms.find((atom) => atom.id === "h1")!.position}
        opacity={0.86}
        radius={0.014}
        start={benzeneAtoms.find((atom) => atom.id === "h4")!.position}
      />
      <Html center distanceFactor={6.4} pointerEvents="none" position={[0, -0.22, 0.34]}>
        <span
          className={teachingAccentLabelClass}
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
            <POrbitalPair
              center={[atom.position[0], atom.position[1], 0]}
              direction={[0, 0, 1]}
              length={0.46}
              opacity={0.2}
              seed={400 + Number(atom.id.replace("c", "")) * 17}
              showAxis={false}
              width={0.085}
            />
            <StickCylinder
              color="#5BAEA5"
              end={[atom.position[0], atom.position[1], 0.68]}
              opacity={0.22}
              radius={0.006}
              start={[atom.position[0], atom.position[1], -0.68]}
            />
          </group>
        ))}
      <PiCloud center={[0, 0, 0.52]} />
      <PiCloud center={[0, 0, -0.52]} />
      <Html center distanceFactor={7.8} pointerEvents="none" position={[0.92, 0.72, 0.78]}>
        <span
          className={teachingCloudLabelClass}
          data-testid="benzene-pi-label"
        >
          大 π 电子云
        </span>
      </Html>
    </>
  );
}

function PiCloud({ center }: { center: Vec3 }) {
  return (
    <PiCloudBand
      cloudStyle="delocalized-ring"
      center={center}
      length={1.18}
      opacity={0.24}
      orientation="xy"
      seed={center[2] > 0 ? 509 : 523}
      thickness={0.09}
      tone="warm"
      waist={0.04}
      width={0.94}
    />
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
