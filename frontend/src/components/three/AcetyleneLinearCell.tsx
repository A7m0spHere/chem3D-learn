import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { StickCylinder } from "@/components/three/StickCylinder";
import { SceneLighting } from "@/components/three/SceneLighting";
import { AtomMesh } from "@/components/three/AtomMesh";
import { BondMesh } from "@/components/three/BondMesh";
import { CameraRig } from "@/components/three/CameraRig";
import { POrbitalPair, PiCloudBand } from "@/components/three/OrbitalPrimitives";
import {
  teachingAccentLabelClass,
  teachingSceneLabelClass,
} from "@/components/three/teachingLabelStyles";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { getAcetyleneLinearModeInfo, type AcetyleneLineView } from "@/data/acetyleneLinear";
import { acetyleneBuilderSeed } from "@/data/organicBuilderSeeds";
import { usePullTransitionProgress } from "@/hooks/usePullTransitionProgress";
import { applyAtomPullOffset } from "@/lib/atomPullTransition";
import type { AcetyleneLinearMode, Atom, Bond } from "@/types/molecule";

type Vec3 = [number, number, number];

type AcetyleneLinearCellProps = {
  mode: AcetyleneLinearMode;
  loading?: boolean;
  lineView?: AcetyleneLineView;
  onAtomPull?: (atomId: string) => void;
  pullingAtomId?: string;
};

const acetyleneAtoms: Atom[] = acetyleneBuilderSeed.atoms.map((candidate) => ({
  ...candidate,
  label: candidate.id.startsWith("c") ? candidate.id.toUpperCase() : candidate.element,
}));

const acetyleneBonds: Bond[] = acetyleneBuilderSeed.bonds.map((candidate) => ({
  ...candidate,
  kind: candidate.order === 3 ? "triple" : "single",
}));

export function AcetyleneLinearCell({
  mode,
  loading = false,
  lineView = "front",
  onAtomPull,
  pullingAtomId,
}: AcetyleneLinearCellProps) {
  const modeInfo = getAcetyleneLinearModeInfo(mode);
  const pullProgress = usePullTransitionProgress(pullingAtomId);
  const displayAtoms = useMemo(
    () => applyAtomPullOffset(acetyleneAtoms, pullingAtomId, pullProgress),
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
      stageTestId="acetylene-linear-canvas"
      summary={modeInfo.summary}
      title={modeInfo.viewerTitle}
      viewerTestId="acetylene-linear-viewer"
    >
      <Canvas
        camera={{ position: getCameraPosition(mode, lineView), fov: mode === "line" ? 38 : 42 }}
        frameloop="demand"
        gl={{ alpha: false }}
        style={{ height: "100%", width: "100%" }}
      >
        <CameraRig
          fov={mode === "line" ? 38 : 42}
          position={getCameraPosition(mode, lineView)}
          resetKey={`${mode}-${lineView}`}
        />
        <color attach="background" args={["#F7FAF9"]} />
        <SceneLighting ambient={0.68} mainIntensity={1.3} mainPosition={[3.6, 4.4, 4.8]} secondaryIntensity={0.34} secondaryPosition={[-3.2, -2.4, 2.4]} />
        <group rotation={getSceneRotation(mode, lineView)} scale={1.03}>
          <AcetyleneCore
            atoms={displayAtoms}
            atomsById={atomsById}
            mode={mode}
            onAtomPull={onAtomPull}
            pullingAtomId={pullingAtomId}
          />
          {mode === "line" ? <LineOverlay lineView={lineView} /> : null}
          {mode === "angle" ? <AngleOverlay /> : null}
          {mode === "piBond" ? <PiBondOverlay /> : null}
          {mode === "tripleBond" ? <TripleBondOverlay /> : null}
        </group>
        <OrbitControls
          enabled={!pullingAtomId}
          enableDamping
          enablePan={false}
          makeDefault
          maxDistance={8}
          minDistance={2.2}
          target={[0, 0, 0]}
        />
      </Canvas>
    </ThreeViewerFrame>
  );
}

function AcetyleneCore({
  atoms,
  atomsById,
  mode,
  onAtomPull,
  pullingAtomId,
}: {
  atoms: Atom[];
  atomsById: Map<string, Atom>;
  mode: AcetyleneLinearMode;
  onAtomPull?: (atomId: string) => void;
  pullingAtomId?: string;
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
      {atoms.map((atom) => (
        <AtomMesh
          atom={atom}
          atomScale={1}
          isFocused={mode !== "overview" && atom.element === "C"}
          isPulling={pullingAtomId === atom.id}
          key={atom.id}
          onPullIntent={onAtomPull}
          showLabel={false}
        />
      ))}
    </>
  );
}

function LineOverlay({ lineView }: { lineView: AcetyleneLineView }) {
  return (
    <>
      <StickCylinder
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
          className={teachingSceneLabelClass}
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
      <StickCylinder
        color="#F4A261"
        end={[0.08, 0, 0]}
        opacity={0.5}
        radius={0.006}
        start={[0.08, 0.28, 0]}
      />
      <Html center distanceFactor={6.2} pointerEvents="none" position={[-0.36, 0.56, 0.22]}>
        <span
          className={teachingAccentLabelClass}
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
          <StickCylinder
            color="#5BAEA5"
            end={[x, 0, 0.72]}
            opacity={0.22}
            radius={0.006}
            start={[x, 0, -0.72]}
          />
          <StickCylinder
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
      <StickCylinder
        color="#1F6F68"
        end={[0.72, 0, 0]}
        opacity={0.72}
        radius={0.016}
        start={[-0.72, 0, 0]}
      />
      <Html center distanceFactor={6.6} pointerEvents="none" position={[0, -0.52, 0.42]}>
        <span
          className={teachingSceneLabelClass}
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
      particleCount={axis === "z" ? 230 : 180}
      particleOpacity={axis === "z" ? 0.44 : 0.36}
      particleSize={0.02}
      scale={scale}
      seed={seed}
      showParticles
      thickness={axis === "z" ? 0.12 : 0.1}
      tone={color === "#F4A261" ? "warm" : "primary"}
      waist={0.28}
      width={axis === "z" ? 0.24 : 0.21}
    />
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
