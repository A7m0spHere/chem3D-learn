import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import type {
  Atom,
  Bond,
  CrystalSiteType,
  CrystalViewMode,
  CrystalVoidStage,
  MoleculeRecord,
} from "@/types/molecule";

type NaClCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
  showLabels: boolean;
  loading?: boolean;
};

const siteLabels: Record<CrystalSiteType, string> = {
  corner: "顶点",
  "face-center": "面心",
  "edge-center": "棱心",
  "body-center": "体心",
};

const cellEdges: Array<[[number, number, number], [number, number, number]]> = [
  [[-1, -1, -1], [1, -1, -1]],
  [[-1, -1, 1], [1, -1, 1]],
  [[-1, 1, -1], [1, 1, -1]],
  [[-1, 1, 1], [1, 1, 1]],
  [[-1, -1, -1], [-1, 1, -1]],
  [[1, -1, -1], [1, 1, -1]],
  [[-1, -1, 1], [-1, 1, 1]],
  [[1, -1, 1], [1, 1, 1]],
  [[-1, -1, -1], [-1, -1, 1]],
  [[1, -1, -1], [1, -1, 1]],
  [[-1, 1, -1], [-1, 1, 1]],
  [[1, 1, -1], [1, 1, 1]],
];

const bodyOctahedronEdges: Array<[[number, number, number], [number, number, number]]> = [
  [[1, 0, 0], [0, 1, 0]],
  [[1, 0, 0], [0, -1, 0]],
  [[1, 0, 0], [0, 0, 1]],
  [[1, 0, 0], [0, 0, -1]],
  [[-1, 0, 0], [0, 1, 0]],
  [[-1, 0, 0], [0, -1, 0]],
  [[-1, 0, 0], [0, 0, 1]],
  [[-1, 0, 0], [0, 0, -1]],
  [[0, 1, 0], [0, 0, 1]],
  [[0, 1, 0], [0, 0, -1]],
  [[0, -1, 0], [0, 0, 1]],
  [[0, -1, 0], [0, 0, -1]],
];

export function NaClCell({
  molecule,
  viewMode,
  voidStage,
  showLabels,
  loading = false,
}: NaClCellProps) {
  const atomsById = useMemo(
    () => new Map(molecule.atoms.map((atom) => [atom.id, atom])),
    [molecule.atoms],
  );
  const voidAtoms = useMemo(
    () => molecule.atoms.filter((atom) => atom.element === "Na+"),
    [molecule.atoms],
  );
  const cameraPosition = molecule.rendering?.cameraPosition ?? [3.2, 2.8, 4.2];
  const cameraFov = molecule.rendering?.cameraFov ?? 42;
  const activeMode = molecule.crystalTeaching?.viewModes.find((mode) => mode.id === viewMode);
  const isVoidMode = viewMode === "voids";
  const groupScale = isVoidMode ? 0.66 : 0.72;
  const groupPosition: [number, number, number] = isVoidMode ? [0, -0.12, 0] : [0, -0.08, 0];

  return (
    <section className="flex h-full min-h-[500px] flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-white/80 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">3D 晶胞 Viewer</h2>
          <p className="text-sm text-text-secondary">拖拽旋转，滚轮或触控板缩放</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-primary-dark">
          {activeMode?.labelZh ?? "晶胞结构"} · {molecule.formula}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-[radial-gradient(circle_at_center,#ffffff_0%,#f7faf9_58%,#e8f3f0_100%)]">
        {loading ? (
          <div className="motion-skeleton absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-white/60" />
        ) : null}
        <Canvas camera={{ position: cameraPosition, fov: cameraFov }} shadows>
          <ambientLight intensity={0.68} />
          <directionalLight position={[4, 5, 4]} intensity={1.35} castShadow />
          <directionalLight position={[-3, 2, -4]} intensity={0.35} />
          <group position={groupPosition} rotation={[0.18, -0.45, 0]} scale={groupScale}>
            <CellFrame isMuted={isVoidMode} />
            {viewMode === "coordination"
              ? molecule.bonds.map((bond) => (
                  <GuideCylinder
                    atomsById={atomsById}
                    bond={bond}
                    color="#94A3B8"
                    key={bond.id}
                    opacity={0.44}
                    radius={0.012}
                  />
                ))
              : null}
            {isVoidMode && voidStage !== "framework" ? (
              <>
                <BodyOctahedronOutline />
                {voidAtoms.map((atom) => (
                  <VoidMarker
                    atom={atom}
                    key={`void-${atom.id}`}
                    showLabel={showLabels}
                    stage={voidStage}
                  />
                ))}
              </>
            ) : null}
            {molecule.atoms.map((atom) => (
              <IonMesh
                atom={atom}
                key={atom.id}
                showLabel={showLabels}
                voidStage={voidStage}
                viewMode={viewMode}
              />
            ))}
          </group>
          <OrbitControls
            enableDamping
            enablePan={false}
            maxDistance={7}
            minDistance={2.2}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
    </section>
  );
}

function CellFrame({ isMuted = false }: { isMuted?: boolean }) {
  return (
    <>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color="#E8F3F0"
          depthWrite={false}
          opacity={0.16}
          roughness={0.8}
          transparent
        />
      </mesh>
      {cellEdges.map(([start, end], index) => (
        <StaticCylinder
          color={isMuted ? "#9AB4AF" : "#7A8F8A"}
          end={end}
          key={`${start.join(",")}-${end.join(",")}-${index}`}
          opacity={isMuted ? 0.38 : 0.62}
          radius={isMuted ? 0.005 : 0.007}
          start={start}
        />
      ))}
    </>
  );
}

type IonMeshProps = {
  atom: Atom;
  viewMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
  showLabel: boolean;
};

function IonMesh({ atom, viewMode, voidStage, showLabel }: IonMeshProps) {
  const isNa = atom.element === "Na+";
  const isCl = atom.element === "Cl-";
  const isVoidMode = viewMode === "voids";
  const isFilledVoidStage = isVoidMode && voidStage === "filled";

  if (isVoidMode && isNa && !isFilledVoidStage) {
    return null;
  }

  const isCoordinationFocus =
    viewMode === "coordination" &&
    (atom.id === "na-body" || atom.id.startsWith("cl-face"));
  const shouldDimForCoordination = viewMode === "coordination" && !isCoordinationFocus;
  const isCountingFocus = viewMode === "counting";
  const radius = atom.radius ?? 0.18;
  const scale = isVoidMode
    ? isCl
      ? 1.08
      : 1.14
    : isCoordinationFocus
      ? 1.18
      : isCountingFocus
        ? 1.06
        : 1;
  const opacity = isVoidMode && isCl ? 0.72 : shouldDimForCoordination ? 0.2 : 1;
  const emissive = isVoidMode
    ? isNa
      ? "#2563EB"
      : "#10B981"
    : isCoordinationFocus
      ? isNa
        ? "#2563EB"
        : "#10B981"
      : isCountingFocus
        ? "#F4A261"
        : "#000000";
  const emissiveIntensity = isVoidMode
    ? isNa
      ? 0.3
      : 0.06
    : isCoordinationFocus
      ? 0.24
      : isCountingFocus
        ? 0.12
        : 0;
  const isRepresentativeLabel =
    atom.id === "cl-corner-8" ||
    atom.id === "cl-face-x-pos" ||
    atom.id === "na-edge-z-4" ||
    atom.id === "na-body";
  const shouldShowLabel =
    showLabel &&
    (isVoidMode
      ? atom.id === "cl-corner-8" ||
        atom.id === "cl-face-x-pos" ||
        (isFilledVoidStage && (atom.id === "na-body" || atom.id === "na-edge-z-4"))
      : viewMode === "coordination"
      ? atom.id === "na-body" || atom.id.startsWith("cl-face")
      : isRepresentativeLabel);
  const labelText = getIonLabel(atom, isVoidMode);

  return (
    <group position={atom.position}>
      <mesh castShadow>
        <sphereGeometry args={[radius * scale, 32, 32]} />
        <meshStandardMaterial
          color={atom.color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          metalness={0.04}
          opacity={opacity}
          roughness={0.36}
          transparent={opacity < 1}
        />
      </mesh>
      {isCountingFocus && atom.siteType ? (
        <mesh>
          <sphereGeometry args={[radius * 1.38, 32, 32]} />
          <meshBasicMaterial
            color={atom.siteType === "body-center" ? "#F4A261" : atom.color}
            opacity={0.16}
            transparent
          />
        </mesh>
      ) : null}
      {shouldShowLabel ? (
        <Html center distanceFactor={7} position={[0, radius + 0.12, 0]}>
          <span className="whitespace-nowrap rounded-md border border-border bg-white/90 px-1.5 py-0.5 text-xs font-semibold text-text-primary shadow-sm">
            {labelText}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

function getIonLabel(atom: Atom, isVoidMode: boolean) {
  if (!isVoidMode) {
    return atom.siteType ? `${atom.element} · ${siteLabels[atom.siteType]}` : atom.element;
  }

  if (atom.id.startsWith("cl-corner")) return "顶点 Cl-";
  if (atom.id.startsWith("cl-face")) return "面心 Cl-";
  return "Na+";
}

type VoidMarkerProps = {
  atom: Atom;
  stage: CrystalVoidStage;
  showLabel: boolean;
};

function VoidMarker({ atom, stage, showLabel }: VoidMarkerProps) {
  const isBodyVoid = atom.siteType === "body-center";
  const radius = isBodyVoid ? 0.12 : 0.08;
  const label = isBodyVoid ? "体心空隙" : "棱心空隙";
  const shouldShowSphere = stage === "voids";
  const shouldShowLabel =
    showLabel && (isBodyVoid || atom.id === "na-edge-z-4");

  return (
    <group position={atom.position}>
      {shouldShowSphere ? (
        <mesh>
          <sphereGeometry args={[radius, 28, 28]} />
          <meshBasicMaterial color="#FDBA74" opacity={isBodyVoid ? 0.48 : 0.34} transparent />
        </mesh>
      ) : null}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.45, 0.012, 10, 36]} />
        <meshBasicMaterial color="#F59E0B" opacity={stage === "filled" ? 0.28 : 0.42} transparent />
      </mesh>
      {isBodyVoid ? (
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[radius * 1.45, 0.01, 10, 36]} />
          <meshBasicMaterial color="#F59E0B" opacity={stage === "filled" ? 0.22 : 0.34} transparent />
        </mesh>
      ) : null}
      {shouldShowLabel ? (
        <Html center distanceFactor={7} position={[0, radius + 0.12, 0]}>
          <span className="whitespace-nowrap rounded-md border border-amber-200 bg-amber-50/95 px-1.5 py-0.5 text-xs font-semibold text-amber-900 shadow-sm">
            {label}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

function BodyOctahedronOutline() {
  return (
    <>
      {bodyOctahedronEdges.map(([start, end], index) => (
        <StaticCylinder
          color="#F59E0B"
          end={end}
          key={`${start.join(",")}-${end.join(",")}-oct-${index}`}
          opacity={0.34}
          radius={0.006}
          start={start}
        />
      ))}
    </>
  );
}

type GuideCylinderProps = {
  atomsById: Map<string, Atom>;
  bond: Bond;
  color: string;
  opacity: number;
  radius: number;
};

function GuideCylinder({ atomsById, bond, color, opacity, radius }: GuideCylinderProps) {
  const startAtom = atomsById.get(bond.atomIds[0]);
  const endAtom = atomsById.get(bond.atomIds[1]);

  if (!startAtom || !endAtom) {
    return null;
  }

  return (
    <StaticCylinder
      color={color}
      end={endAtom.position}
      opacity={opacity}
      radius={radius}
      start={startAtom.position}
    />
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
      <cylinderGeometry args={[radius, radius, geometry.length, 16]} />
      <meshStandardMaterial color={color} opacity={opacity} roughness={0.45} transparent />
    </mesh>
  );
}
