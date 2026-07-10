import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Quaternion, Vector3 } from "three";
import { StickCylinder } from "@/components/three/StickCylinder";
import { SceneLighting } from "@/components/three/SceneLighting";
import { CameraRig } from "@/components/three/CameraRig";
import {
  LonePairOrbital as SharedLonePairOrbital,
  OrbitalSurface,
} from "@/components/three/OrbitalPrimitives";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { HybridOrbitalScene } from "@/components/three/HybridOrbitalScene";
import { teachingSceneLabelClass } from "@/components/three/teachingLabelStyles";
import { getBondingBasicsModeInfo } from "@/data/bondingBasics";
import type {
  BondingBasicsMode,
  BondingBasicsModuleId,
  HybridOrbitalControls,
} from "@/data/bondingBasics";

type Vec3 = [number, number, number];

type BondingBasicsCellProps = {
  moduleId: BondingBasicsModuleId;
  mode: BondingBasicsMode;
  hybridControls?: HybridOrbitalControls;
  loading?: boolean;
};

const primary = "#2A9D8F";
const primaryDark = "#1F6F68";
const accent = "#F4A261";
const textPrimary = "#1F2933";

export function BondingBasicsCell({
  moduleId,
  mode,
  hybridControls,
  loading = false,
}: BondingBasicsCellProps) {
  const modeInfo = getBondingBasicsModeInfo(moduleId, mode);
  const sceneScale = moduleId === "hybrid-orbitals-sp" ? 1.08 : 1.2;
  const resolvedHybridControls = hybridControls ?? {
    progress: 100,
    renderMode: "solid",
    showUnhybridizedP: true,
    showAxes: true,
  } satisfies HybridOrbitalControls;
  const hybridFooterMeta =
    moduleId === "hybrid-orbitals-sp" ? (
      <span className="hidden font-semibold text-primary-dark sm:inline" data-testid="hybrid-footer-meta">
        {resolvedHybridControls.progress}% ·{" "}
        {resolvedHybridControls.renderMode === "solid" ? "实体轨道" : "电子云"} ·{" "}
        {resolvedHybridControls.showUnhybridizedP ? "显示未杂化 p" : "隐藏未杂化 p"}
      </span>
    ) : undefined;

  return (
    <ThreeViewerFrame
      footerMeta={hybridFooterMeta}
      loading={loading}
      meta="拖拽旋转 · 滚轮或触控板缩放"
      stageTestId={`${moduleId}-canvas`}
      summary={modeInfo.viewerSummary}
      title={modeInfo.viewerTitle}
      viewerTestId={`${moduleId}-viewer`}
    >
      <Canvas
        camera={{ position: [3.15, -3.8, 2.8], fov: 37 }}
        frameloop="demand"
        gl={{ alpha: false }}
        style={{ height: "100%", width: "100%" }}
      >
        <CameraRig fov={37} position={[3.15, -3.8, 2.8]} resetKey={`${moduleId}-${mode}`} />
        <color attach="background" args={["#F7FAF9"]} />
        <SceneLighting ambient={0.74} mainIntensity={1.3} mainPosition={[3.5, 4.6, 4.2]} secondaryIntensity={0.34} secondaryPosition={[-3.2, -2.4, 2.6]} />
        <group position={[0, 0.08, 0]} rotation={[-0.16, 0.12, 0]} scale={sceneScale}>
          {moduleId === "hybrid-orbitals-sp" ? (
            <HybridOrbitalScene controls={resolvedHybridControls} mode={mode} />
          ) : (
            <ReferencePlane />
          )}
          {moduleId === "ionic-bond-formation" ? <IonicScene mode={mode} /> : null}
          {moduleId === "coordinate-bond-formation" ? <CoordinateScene mode={mode} /> : null}
        </group>
        <OrbitControls enableDamping enablePan={false} makeDefault maxDistance={8} minDistance={1.85} target={[0, 0.04, 0]} />
      </Canvas>
    </ThreeViewerFrame>
  );
}

function IonicScene({ mode }: { mode: BondingBasicsMode }) {
  if (mode === "lattice") {
    return (
      <>
        {[-1.2, 0, 1.2].map((x, row) =>
          [-0.72, 0.72].map((z, col) => {
            const positive = (row + col) % 2 === 0;
            return (
              <Ion
                charge={positive ? "+" : "-"}
                color={positive ? primary : accent}
                key={`${x}-${z}`}
                label={positive ? "阳离子" : "阴离子"}
                position={[x, 0, z]}
              />
            );
          }),
        )}
        <SceneLabel color={primaryDark} position={[0, -1.04, 0.18]} text="阴阳离子交替排列" />
      </>
    );
  }

  return (
    <>
      <Ion charge={mode === "transfer" ? "" : "+"} color={primary} label={mode === "transfer" ? "金属原子" : "阳离子"} position={[-0.9, 0, 0]} />
      <Ion charge={mode === "transfer" ? "" : "-"} color={accent} label={mode === "transfer" ? "非金属原子" : "阴离子"} position={[0.9, 0, 0]} />
      <Electron position={mode === "transfer" ? [-0.18, 0.34, 0] : [0.72, 0.34, 0]} />
      <Arrow start={[-0.54, 0.34, 0]} end={[0.54, 0.34, 0]} color={mode === "transfer" ? accent : primaryDark} />
      {mode === "attraction" ? (
        <>
          <StickCylinder color={primaryDark} opacity={0.55} radius={0.014} start={[-0.58, 0, 0]} end={[0.58, 0, 0]} />
          <SceneLabel color={primaryDark} position={[0.42, -1.06, 0.18]} text="异号电荷静电吸引" />
        </>
      ) : (
        <SceneLabel color="#B96320" position={[0.42, -1.06, 0.18]} text="电子转移形成离子" />
      )}
    </>
  );
}

function CoordinateScene({ mode }: { mode: BondingBasicsMode }) {
  const bondOpacity = mode === "formed" ? 0.82 : mode === "overlap" ? 0.42 : 0.16;

  return (
    <>
      <AtomCore color={primary} label="提供体" labelPosition={[-0.32, -0.1, 0]} position={[-0.88, 0, 0]} />
      <AtomCore color={accent} label="接受体" position={[0.88, 0, 0]} />
      <LonePair position={mode === "donor" ? [-0.48, 0.34, 0] : [-0.18, 0.28, 0]} />
      <EmptyOrbital position={[0.58, 0.03, 0]} />
      <Arrow start={[-0.36, 0.28, 0]} end={[0.5, 0.08, 0]} color={primaryDark} />
      <StickCylinder color={primaryDark} opacity={bondOpacity} radius={0.026} start={[-0.64, 0, 0]} end={[0.64, 0, 0]} />
      <SceneLabel
        color={primaryDark}
        position={[0.52, -1.12, 0.2]}
        text={mode === "formed" ? "形成配位键" : "指向空轨道"}
      />
    </>
  );
}

function AtomCore({
  position,
  label,
  color = textPrimary,
  labelPosition = [0, -0.46, 0],
}: {
  position: Vec3;
  label: string;
  color?: string;
  labelPosition?: Vec3;
}) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.34} />
      </mesh>
      <SceneLabel color={textPrimary} position={labelPosition} text={label} />
    </group>
  );
}

function Ion({ position, color, label, charge }: { position: Vec3; color: string; label: string; charge: string }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.32, 48, 32]} />
        <meshStandardMaterial color={color} roughness={0.32} />
      </mesh>
      {charge ? <SceneLabel color="#ffffff" position={[0, 0.02, 0.34]} text={charge} /> : null}
      <SceneLabel color={textPrimary} position={[0, -0.64, 0]} text={label} />
    </group>
  );
}

function Electron({ position }: { position: Vec3 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.07, 24, 16]} />
      <meshStandardMaterial color={primaryDark} emissive="#DFF8F4" emissiveIntensity={0.15} roughness={0.3} />
    </mesh>
  );
}

function LonePair({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <SharedLonePairOrbital
        direction={[1, 0.2, 0]}
        distance={0}
        length={0.42}
        opacity={0.38}
        origin={[0, 0, 0]}
        width={0.18}
      />
      <SceneLabel color={primaryDark} position={[0, 0.24, 0]} text="孤对电子" />
    </group>
  );
}

function EmptyOrbital({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <OrbitalSurface direction={[1, 0, 0]} length={0.46} opacity={0.22} tone="neutral" width={0.2} />
    </group>
  );
}

function Arrow({ start, end, color }: { start: Vec3; end: Vec3; color: string }) {
  const direction = new Vector3(...end).sub(new Vector3(...start)).normalize();
  const conePosition = new Vector3(...end).sub(direction.multiplyScalar(0.08));

  return (
    <>
      <StickCylinder color={color} opacity={0.72} radius={0.012} start={start} end={end} />
      <mesh position={conePosition} quaternion={getQuaternionForDirection([direction.x, direction.y, direction.z])}>
        <coneGeometry args={[0.055, 0.16, 18]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  );
}

function ReferencePlane() {
  return (
    <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4.4, 3.2]} />
      <meshBasicMaterial color="#F7FAF9" opacity={0.58} transparent />
    </mesh>
  );
}

function SceneLabel({ position, text, color }: { position: Vec3; text: string; color: string }) {
  return (
    <Html center distanceFactor={6.5} pointerEvents="none" position={position}>
      <span
        className={teachingSceneLabelClass}
        style={{ color }}
      >
        {text}
      </span>
    </Html>
  );
}

function getQuaternionForDirection(direction: Vec3) {
  return new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    new Vector3(...direction).normalize(),
  );
}
