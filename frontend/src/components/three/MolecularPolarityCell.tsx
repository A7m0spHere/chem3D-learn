import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import { CameraRig } from "@/components/three/CameraRig";
import { PiCloudBand } from "@/components/three/OrbitalPrimitives";
import { SceneLighting } from "@/components/three/SceneLighting";
import {
  teachingAccentLabelClass,
  teachingCloudLabelClass,
  teachingCompactLabelClass,
} from "@/components/three/teachingLabelStyles";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import {
  bondDipoleExamples,
  type MolecularPolarityMode,
} from "@/data/molecularPolarity";

type MolecularPolarityCellProps = {
  mode: MolecularPolarityMode;
  loading?: boolean;
};

type Vec3 = [number, number, number];

type TeachingAtom = {
  id: string;
  element: string;
  label: string;
  position: Vec3;
  color: string;
  radius: number;
  charge?: string;
  chargeOffset?: Vec3;
  showLabel?: boolean;
  labelOffset?: Vec3;
};

const atomColors = {
  H: "#FFFFFF",
  Cl: "#22C55E",
  O: "#DC2626",
  B: "#0D9488",
  F: "#10B981",
};

export function MolecularPolarityCell({
  mode,
  loading = false,
}: MolecularPolarityCellProps) {
  const overlayInfo = getSceneOverlayInfo(mode);
  const isBondDipoleMode = mode === "bondDipole";

  const footerSummary = overlayInfo.auxiliary
    ? `${overlayInfo.summary}；${overlayInfo.auxiliary}`
    : overlayInfo.summary;

  return (
    <ThreeViewerFrame
      loading={loading}
      meta="拖拽旋转 · 滚轮或触控板缩放"
      stageTestId="molecular-polarity-canvas"
      summary={footerSummary}
      title={`${overlayInfo.title}｜${overlayInfo.dipoleResult}`}
      viewerTestId="molecular-polarity-viewer"
    >
        {isBondDipoleMode ? (
          <BondDipoleDiagram />
        ) : (
          <Canvas
            camera={{ position: getCameraPosition(mode), fov: 42 }}
            frameloop="demand"
            gl={{ alpha: false }}
            style={{ height: "100%", width: "100%" }}
          >
            <CameraRig fov={42} position={getCameraPosition(mode)} resetKey={mode} />
            <color attach="background" args={["#F7FAF9"]} />
            <SceneLighting ambient={0.72} mainIntensity={1.36} mainPosition={[3.4, 4.6, 4.2]} secondaryIntensity={0.34} secondaryPosition={[-3, -2.5, 2.6]} />
            <group
              position={getScenePosition(mode)}
              rotation={getSceneRotation(mode)}
              scale={getSceneScale(mode)}
            >
              <SceneByMode mode={mode} />
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
        )}
    </ThreeViewerFrame>
  );
}

function SceneByMode({ mode }: { mode: MolecularPolarityMode }) {
  if (mode === "electronegativity") return <ElectronegativityScene />;
  if (mode === "hcl") return <HclScene />;
  if (mode === "water") return <WaterScene />;
  if (mode === "hypochlorousAcid") return <HypochlorousAcidScene />;
  return <Bf3Scene />;
}

function ElectronegativityScene() {
  const bPosition: Vec3 = [-0.8, -1.25, 0];
  const fPosition: Vec3 = [0.8, -1.25, 0];

  return (
    <>
      <ElectronCloud center={[0.22, -1.25, 0]} scale={[1.2, 0.34, 0.34]} />
      <BondCylinder end={fPosition} radius={0.035} start={bPosition} />
      <AtomSphere atom={{ id: "b", element: "B", label: "B", position: bPosition, color: atomColors.B, radius: 0.22, charge: "δ+", showLabel: true, labelOffset: [0, 0.34, 0], chargeOffset: [-0.12, -0.28, 0] }} />
      <AtomSphere atom={{ id: "f", element: "F", label: "F", position: fPosition, color: atomColors.F, radius: 0.26, charge: "δ−", showLabel: true, labelOffset: [0, 0.38, 0], chargeOffset: [0.16, -0.32, 0] }} />
      <DipoleArrow
        color="#1F6F68"
        end={[0.46, -0.92, 0]}
        start={[-0.46, -0.92, 0]}
      />
      <TinyDipoleLabel position={[-1.08, -0.68, 0]} testId="electronegativity-hint-label">
        F 更吸电子
      </TinyDipoleLabel>
    </>
  );
}

function HclScene() {
  const atoms: TeachingAtom[] = [
    { id: "h", element: "H", label: "H", position: [-0.9, 0, 0], color: atomColors.H, radius: 0.18, charge: "δ+", showLabel: true, labelOffset: [0, 0.34, 0], chargeOffset: [-0.14, -0.26, 0] },
    { id: "cl", element: "Cl", label: "Cl", position: [0.92, 0, 0], color: atomColors.Cl, radius: 0.3, charge: "δ−", showLabel: true, labelOffset: [0, 0.44, 0], chargeOffset: [0.18, -0.35, 0] },
  ];

  return (
    <>
      <BondCylinder end={atoms[1].position} radius={0.04} start={atoms[0].position} />
      {atoms.map((atom) => <AtomSphere atom={atom} key={atom.id} />)}
      <DipoleArrow color="#1F6F68" end={[0.56, 0.38, 0]} start={[-0.56, 0.38, 0]} />
      <TinyDipoleLabel position={[0, 0.68, 0]}>H→Cl</TinyDipoleLabel>
      <DipoleArrow color="#F4A261" end={[0.72, -0.46, 0]} start={[-0.72, -0.46, 0]} thick />
    </>
  );
}

function WaterScene() {
  const atoms: TeachingAtom[] = [
    { id: "o", element: "O", label: "O", position: [0, 0.28, 0], color: atomColors.O, radius: 0.26, charge: "δ−", showLabel: true, labelOffset: [0, 0.38, 0], chargeOffset: [0.25, 0.16, 0] },
    { id: "h1", element: "H", label: "H", position: [-0.82, -0.66, 0], color: atomColors.H, radius: 0.16, charge: "δ+", labelOffset: [-0.08, -0.28, 0], chargeOffset: [-0.2, -0.2, 0] },
    { id: "h2", element: "H", label: "H", position: [0.82, -0.66, 0], color: atomColors.H, radius: 0.16, charge: "δ+", labelOffset: [0.08, -0.28, 0], chargeOffset: [0.2, -0.2, 0] },
  ];

  return (
    <>
      <BondCylinder end={atoms[0].position} radius={0.035} start={atoms[1].position} />
      <BondCylinder end={atoms[0].position} radius={0.035} start={atoms[2].position} />
      {atoms.map((atom) => <AtomSphere atom={atom} key={atom.id} />)}
      <DipoleArrow color="#1F6F68" end={[-0.2, 0.04, 0]} start={[-0.58, -0.4, 0]} />
      <DipoleArrow color="#1F6F68" end={[0.2, 0.04, 0]} start={[0.58, -0.4, 0]} />
      <TinyDipoleLabel position={[-0.74, -0.05, 0]}>H→O</TinyDipoleLabel>
      <TinyDipoleLabel position={[0.74, -0.05, 0]}>H→O</TinyDipoleLabel>
      <DipoleArrow color="#F4A261" end={[0, 0.9, 0]} start={[0, -0.18, 0]} thick />
    </>
  );
}

function HypochlorousAcidScene() {
  const atoms: TeachingAtom[] = [
    { id: "o", element: "O", label: "O", position: [0, 0.18, 0], color: atomColors.O, radius: 0.26, charge: "δ−", showLabel: true, labelOffset: [0.03, 0.38, 0], chargeOffset: [0.28, 0.1, 0] },
    { id: "h", element: "H", label: "H", position: [-0.85, -0.58, 0], color: atomColors.H, radius: 0.16, charge: "δ+", chargeOffset: [-0.2, -0.2, 0] },
    { id: "cl", element: "Cl", label: "Cl", position: [0.95, -0.42, 0], color: atomColors.Cl, radius: 0.28, charge: "δ+", chargeOffset: [0.22, -0.28, 0] },
  ];

  return (
    <>
      <BondCylinder end={atoms[0].position} radius={0.035} start={atoms[1].position} />
      <BondCylinder end={atoms[2].position} radius={0.035} start={atoms[0].position} />
      {atoms.map((atom) => <AtomSphere atom={atom} key={atom.id} />)}
      <DipoleArrow color="#1F6F68" end={[-0.26, -0.02, 0]} start={[-0.62, -0.35, 0]} />
      <DipoleArrow color="#1F6F68" end={[0.34, 0.02, 0]} start={[0.7, -0.2, 0]} />
      <TinyDipoleLabel position={[-0.75, 0.02, 0]}>H→O</TinyDipoleLabel>
      <TinyDipoleLabel position={[0.82, 0.13, 0]}>Cl→O</TinyDipoleLabel>
      <DipoleArrow color="#F4A261" end={[0.1, 0.8, 0]} start={[0.1, -0.08, 0]} thick />
    </>
  );
}

function Bf3Scene() {
  const atoms: TeachingAtom[] = [
    { id: "b", element: "B", label: "B", position: [0, 0, 0], color: atomColors.B, radius: 0.22, charge: "δ+", showLabel: true, labelOffset: [0, 0.34, 0], chargeOffset: [0.24, -0.02, 0] },
    { id: "f1", element: "F", label: "F", position: [0, 1.22, 0], color: atomColors.F, radius: 0.25, charge: "δ−", chargeOffset: [0.2, 0.18, 0] },
    { id: "f2", element: "F", label: "F", position: [-1.06, -0.62, 0], color: atomColors.F, radius: 0.25, charge: "δ−", chargeOffset: [-0.28, -0.1, 0] },
    { id: "f3", element: "F", label: "F", position: [1.06, -0.62, 0], color: atomColors.F, radius: 0.25, charge: "δ−", chargeOffset: [0.28, -0.1, 0] },
  ];
  const center = atoms[0].position;
  const fluorines = atoms.slice(1);

  return (
    <>
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[1.48, 96]} />
        <meshBasicMaterial color="#2A9D8F" depthWrite={false} opacity={0.09} transparent />
      </mesh>
      {fluorines.map((atom) => (
        <BondCylinder end={atom.position} key={`bond-${atom.id}`} radius={0.035} start={center} />
      ))}
      {atoms.map((atom) => <AtomSphere atom={atom} key={atom.id} />)}
      {fluorines.map((atom) => (
        <DipoleArrow
          color="#1F6F68"
          end={scale(atom.position, 0.72)}
          key={`arrow-${atom.id}`}
          start={scale(atom.position, 0.24)}
        />
      ))}
      <AngleHint />
    </>
  );
}

function AtomSphere({ atom }: { atom: TeachingAtom }) {
  const labelOffset = atom.labelOffset ?? [0, atom.radius + 0.12, 0];
  const chargeOffset = atom.chargeOffset ?? [0.18, -atom.radius - 0.04, 0];

  return (
    <group position={atom.position}>
      <mesh>
        <sphereGeometry args={[atom.radius, 32, 32]} />
        <meshStandardMaterial color={atom.color} metalness={0.04} roughness={0.36} />
      </mesh>
      {atom.showLabel ? <TinyAtomLabel label={atom.label} position={labelOffset} /> : null}
      {atom.charge ? (
        <ChargeMarker charge={atom.charge} position={chargeOffset} />
      ) : null}
    </group>
  );
}

function BondCylinder({ start, end, radius = 0.035 }: { start: Vec3; end: Vec3; radius?: number }) {
  const geometry = useCylinderGeometry(start, end);

  return (
    <group position={geometry.midpoint} quaternion={geometry.quaternion}>
      <mesh>
        <cylinderGeometry args={[radius, radius, geometry.length, 24]} />
        <meshStandardMaterial color="#B7C7C3" roughness={0.44} />
      </mesh>
    </group>
  );
}

function DipoleArrow({
  start,
  end,
  color,
  thick = false,
}: {
  start: Vec3;
  end: Vec3;
  color: string;
  thick?: boolean;
}) {
  const startVector = new Vector3(...start);
  const endVector = new Vector3(...end);
  const direction = endVector.clone().sub(startVector).normalize();
  const headLength = thick ? 0.18 : 0.14;
  const shaftEnd = endVector.clone().sub(direction.clone().multiplyScalar(headLength));
  const shaftGeometry = useCylinderGeometry(start, [shaftEnd.x, shaftEnd.y, shaftEnd.z]);
  const headGeometry = useCylinderGeometry(
    [shaftEnd.x, shaftEnd.y, shaftEnd.z],
    [endVector.x, endVector.y, endVector.z],
  );

  return (
    <group>
      <group position={shaftGeometry.midpoint} quaternion={shaftGeometry.quaternion}>
        <mesh>
          <cylinderGeometry args={[thick ? 0.026 : 0.018, thick ? 0.026 : 0.018, shaftGeometry.length, 18]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.04} roughness={0.34} />
        </mesh>
      </group>
      <group position={headGeometry.midpoint} quaternion={headGeometry.quaternion}>
        <mesh>
          <coneGeometry args={[thick ? 0.1 : 0.075, headGeometry.length, 24]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.05} roughness={0.34} />
        </mesh>
      </group>
    </group>
  );
}

function ElectronCloud({
  center,
  scale: meshScale,
}: {
  center: Vec3;
  scale: Vec3;
}) {
  return (
    <group>
      <PiCloudBand
        center={center}
        opacity={0.24}
        particleCount={320}
        particleOpacity={0.5}
        particleSize={0.024}
        scale={meshScale}
        seed={701}
        showParticles
        tone="primary"
      />
      <Line
        color="#2A9D8F"
        lineWidth={1.2}
        opacity={0.7}
        points={[
          [center[0] + 0.08, center[1] + 0.2, center[2]],
          [center[0] - 0.06, center[1] + 0.38, center[2]],
        ]}
        transparent
      />
      <TinyDipoleLabel position={[center[0] - 0.1, center[1] + 0.48, center[2]]} testId="electron-cloud-density-label" variant="cloud">
        电子云偏向 F
      </TinyDipoleLabel>
    </group>
  );
}

function AngleHint() {
  const points = useMemo<Vec3[]>(
    () =>
      Array.from({ length: 28 }).map((_, index) => {
        const angle = (-30 + (index / 27) * 120) * (Math.PI / 180);
        return [0.45 * Math.sin(angle), 0.45 * Math.cos(angle), 0.03];
      }),
    [],
  );

  return (
    <>
      <Line color="#F4A261" lineWidth={1.6} points={points} />
      <TinyDipoleLabel tone="accent" position={[0.74, 0.5, 0]}>约120°</TinyDipoleLabel>
    </>
  );
}

type SceneOverlayInfo = {
  title: string;
  dipoleResult: string;
  summary: string;
  auxiliary?: string;
};

function getSceneOverlayInfo(mode: MolecularPolarityMode): SceneOverlayInfo {
  switch (mode) {
    case "electronegativity":
      return {
        title: "电负性：F > O > Cl > B > H",
        dipoleResult: "先判断电子偏移方向",
        summary: "F 的电负性明显大于 B，B–F 键具有明显极性",
      };
    case "bondDipole":
      return {
        title: "键偶极规则示意",
        dipoleResult: "箭头方向：δ+ → δ−",
        summary: "四种键偶极方向将用于后续分子极性判断",
      };
    case "hcl":
      return {
        title: "HCl：极性分子",
        dipoleResult: "合偶极矩 ≠ 0",
        summary: "H–Cl 只有一条极性键，合偶极矩方向为 H→Cl",
      };
    case "water":
      return {
        title: "H₂O：极性分子",
        dipoleResult: "合偶极矩 ≠ 0",
        summary: "V 形结构，两个键偶极不能抵消",
      };
    case "hypochlorousAcid":
      return {
        title: "HClO：极性分子",
        dipoleResult: "合偶极矩 ≠ 0",
        summary: "结构是 H–O–Cl，弯曲且不对称",
        auxiliary: "O–H：H→O · O–Cl：Cl→O",
      };
    case "bf3":
      return {
        title: "BF₃：非极性分子",
        dipoleResult: "合偶极矩 = 0",
        summary: "平面三角形，三个键偶极对称抵消",
        auxiliary: "3 个 B–F 键偶极对称抵消",
      };
  }
}

function TinyAtomLabel({ label, position }: { label: string; position: Vec3 }) {
  return (
    <Html center distanceFactor={7.4} pointerEvents="none" position={position}>
      <span className={teachingCompactLabelClass}>
        {label}
      </span>
    </Html>
  );
}

function ChargeMarker({ charge, position }: { charge: string; position: Vec3 }) {
  return (
    <Html center distanceFactor={7.8} pointerEvents="none" position={position}>
      <span className="inline-flex select-none items-center rounded-full border border-primary/25 bg-white/92 px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-dark shadow-[0_2px_6px_rgba(31,111,104,0.12)] ring-1 ring-white/80">
        {charge}
      </span>
    </Html>
  );
}

function TinyDipoleLabel({
  children,
  position,
  tone = "primary",
  testId,
  variant = "compact",
}: {
  children: string;
  position: Vec3;
  tone?: "primary" | "accent";
  testId?: string;
  variant?: "cloud" | "compact";
}) {
  const className = variant === "cloud"
    ? teachingCloudLabelClass
    : tone === "accent"
      ? teachingAccentLabelClass
      : teachingCompactLabelClass;

  return (
    <Html center distanceFactor={7.3} pointerEvents="none" position={position}>
      <span className={className} data-testid={testId}>
        {children}
      </span>
    </Html>
  );
}

function BondDipoleDiagram() {
  const rows = bondDipoleExamples.map((example) => {
    const [left, right] = example.bond.split("–");
    return { ...example, left, right };
  });

  return (
    <div className="flex h-full w-full items-center justify-center px-4 py-6 sm:px-8 sm:py-8">
      <div className="grid w-full max-w-[520px] gap-2.5 sm:gap-3">
        {rows.map((row) => (
          <div
            className="grid grid-cols-[3.2rem_1fr_3.2rem_5rem] items-center gap-2 rounded-2xl border border-white/60 bg-white/48 px-3 py-2.5 shadow-[0_4px_14px_rgba(31,41,51,0.04)] backdrop-blur-sm sm:grid-cols-[4rem_1fr_4rem_6rem] sm:px-4"
            key={row.bond}
          >
            <BondEndpoint charge="δ+" label={row.left} />
            <div className="relative flex h-8 items-center justify-center">
              <div className="h-px w-full bg-primary-dark/35" />
              <div className="absolute right-0 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-primary-dark/60" />
            </div>
            <BondEndpoint charge="δ−" label={row.right} />
            <div className="text-right text-xs font-semibold text-primary-dark/80 sm:text-sm">
              {row.direction.replace(/\s/g, "")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BondEndpoint({ label, charge }: { label: string; charge: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-base font-bold text-text-primary sm:text-lg">{label}</span>
      <span className="text-[10px] font-semibold text-primary-dark/60 sm:text-xs">{charge}</span>
    </div>
  );
}

function useCylinderGeometry(start: Vec3, end: Vec3) {
  return useMemo(() => {
    const startVector = new Vector3(...start);
    const endVector = new Vector3(...end);
    const direction = endVector.clone().sub(startVector);
    const midpoint = startVector.clone().add(endVector).multiplyScalar(0.5);
    const quaternion = new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      direction.clone().normalize(),
    );

    return {
      length: direction.length(),
      midpoint,
      quaternion,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start[0], start[1], start[2], end[0], end[1], end[2]]);
}

function scale(vector: Vec3, scalar: number): Vec3 {
  return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

function getCameraPosition(mode: MolecularPolarityMode): Vec3 {
  if (mode === "bf3") return [0.15, 0.1, 5.2];
  return [0.2, 0.2, 5.1];
}

function getSceneRotation(mode: MolecularPolarityMode): Vec3 {
  if (mode === "bf3") return [0, 0, 0];
  if (mode === "electronegativity") return [0, 0, 0];
  return [-0.08, 0.1, 0];
}

function getSceneScale(mode: MolecularPolarityMode) {
  if (mode === "bf3") return 0.88;
  if (mode === "electronegativity") return 1.22;
  return 1.08;
}

function getScenePosition(mode: MolecularPolarityMode): Vec3 {
  if (mode === "electronegativity") return [0, 1.15, 0];
  return [0, 0, 0];
}
