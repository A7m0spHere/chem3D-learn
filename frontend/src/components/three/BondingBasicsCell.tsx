import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Quaternion, Vector3 } from "three";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { getBondingBasicsModeInfo } from "@/data/bondingBasics";
import type { BondingBasicsMode, BondingBasicsModuleId } from "@/data/bondingBasics";

type Vec3 = [number, number, number];

type BondingBasicsCellProps = {
  moduleId: BondingBasicsModuleId;
  mode: BondingBasicsMode;
  loading?: boolean;
};

const primary = "#2A9D8F";
const primaryDark = "#1F6F68";
const accent = "#F4A261";
const textPrimary = "#1F2933";

export function BondingBasicsCell({ moduleId, mode, loading = false }: BondingBasicsCellProps) {
  const modeInfo = getBondingBasicsModeInfo(moduleId, mode);
  const sceneScale = moduleId === "hybrid-orbitals-sp" ? 1.14 : 1.2;

  return (
    <ThreeViewerFrame
      loading={loading}
      meta="拖拽旋转 · 滚轮或触控板缩放"
      stageTestId={`${moduleId}-canvas`}
      summary={modeInfo.viewerSummary}
      title={modeInfo.viewerTitle}
      viewerTestId={`${moduleId}-viewer`}
    >
      <Canvas
        camera={{ position: [2.8, -3.7, 2.65], fov: 38 }}
        key={`${moduleId}-${mode}`}
        shadows
        frameloop="demand"
        style={{ height: "100%", width: "100%" }}
      >
        <ambientLight intensity={0.74} />
        <directionalLight position={[3.5, 4.6, 4.2]} intensity={1.3} castShadow />
        <directionalLight position={[-3.2, -2.4, 2.6]} intensity={0.34} />
        <group position={[0, 0.08, 0]} rotation={[-0.16, 0.12, 0]} scale={sceneScale}>
          <ReferencePlane />
          {moduleId === "hybrid-orbitals-sp" ? <HybridScene mode={mode} /> : null}
          {moduleId === "ionic-bond-formation" ? <IonicScene mode={mode} /> : null}
          {moduleId === "coordinate-bond-formation" ? <CoordinateScene mode={mode} /> : null}
        </group>
        <OrbitControls enableDamping enablePan={false} maxDistance={8} minDistance={1.85} target={[0, 0.04, 0]} />
      </Canvas>
    </ThreeViewerFrame>
  );
}

function HybridScene({ mode }: { mode: BondingBasicsMode }) {
  const directions = getHybridDirections(mode);

  return (
    <>
      <AtomCore label="中心原子" position={[0, 0, 0]} />
      {directions.map((direction, index) => (
        <HybridLobe direction={direction} index={index} key={`${direction.join("-")}-${index}`} />
      ))}
      <SceneLabel color={primaryDark} position={[0, -1.04, 0.2]} text={`${mode} 杂化轨道方向`} />
    </>
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
          <StaticCylinder color={primaryDark} opacity={0.55} radius={0.014} start={[-0.58, 0, 0]} end={[0.58, 0, 0]} />
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
      <StaticCylinder color={primaryDark} opacity={bondOpacity} radius={0.026} start={[-0.64, 0, 0]} end={[0.64, 0, 0]} />
      <SceneLabel
        color={primaryDark}
        position={[0.52, -1.12, 0.2]}
        text={mode === "formed" ? "形成配位键" : "指向空轨道"}
      />
    </>
  );
}

function HybridLobe({ direction, index }: { direction: Vec3; index: number }) {
  const end: Vec3 = [direction[0] * 1.12, direction[1] * 1.12, direction[2] * 1.12];
  const center: Vec3 = [direction[0] * 0.58, direction[1] * 0.58, direction[2] * 0.58];
  const warm = index % 2 === 0;

  return (
    <>
      <StaticCylinder color={warm ? accent : primary} opacity={0.34} radius={0.012} start={[0, 0, 0]} end={end} />
      <mesh position={center} quaternion={getQuaternionForDirection(direction)} scale={[0.18, 0.18, 0.56]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={warm ? accent : primary}
          depthWrite={false}
          emissive={warm ? "#FFF0D8" : "#DFF8F4"}
          emissiveIntensity={0.08}
          opacity={0.34}
          roughness={0.3}
          transparent
        />
      </mesh>
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
      <mesh castShadow>
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
      <mesh castShadow>
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
      <Electron position={[-0.08, 0, 0]} />
      <Electron position={[0.08, 0, 0]} />
      <SceneLabel color={primaryDark} position={[0, 0.24, 0]} text="孤对电子" />
    </group>
  );
}

function EmptyOrbital({ position }: { position: Vec3 }) {
  return (
    <mesh position={position} scale={[0.34, 0.22, 0.22]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#E2E8F0" depthWrite={false} opacity={0.38} roughness={0.28} transparent />
    </mesh>
  );
}

function Arrow({ start, end, color }: { start: Vec3; end: Vec3; color: string }) {
  const direction = new Vector3(...end).sub(new Vector3(...start)).normalize();
  const conePosition = new Vector3(...end).sub(direction.multiplyScalar(0.08));

  return (
    <>
      <StaticCylinder color={color} opacity={0.72} radius={0.012} start={start} end={end} />
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
        className="whitespace-nowrap rounded-full bg-white/90 px-2 py-1 text-center text-[10px] font-semibold leading-tight shadow-sm drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)] sm:px-3 sm:py-1.5 sm:text-xs"
        style={{ color }}
      >
        {text}
      </span>
    </Html>
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

function getQuaternionForDirection(direction: Vec3) {
  return new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    new Vector3(...direction).normalize(),
  );
}

function getHybridDirections(mode: BondingBasicsMode): Vec3[] {
  if (mode === "sp") return [[-1, 0, 0], [1, 0, 0]];
  if (mode === "sp2") {
    return [
      [1, 0, 0],
      [-0.5, 0, 0.866],
      [-0.5, 0, -0.866],
    ];
  }
  return [
    [0.94, 0, -0.33],
    [-0.47, 0.82, -0.33],
    [-0.47, -0.82, -0.33],
    [0, 0, 1],
  ];
}
