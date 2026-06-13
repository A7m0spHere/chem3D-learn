import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import type { Atom, CoordinationLink, CrystalSiteType, CrystalViewMode, MoleculeRecord } from "@/types/molecule";

type CsClCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  showLabels: boolean;
  loading?: boolean;
};

const siteLabels: Partial<Record<CrystalSiteType, string>> = {
  corner: "顶点",
  "body-center": "体心",
};

const cellEdges: Array<[[number, number, number], [number, number, number]]> = [
  [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5]],
  [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5]],
  [[-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]],
  [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5]],
  [[-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5]],
  [[0.5, -0.5, -0.5], [0.5, 0.5, -0.5]],
  [[-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5]],
  [[0.5, -0.5, 0.5], [0.5, 0.5, 0.5]],
  [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5]],
  [[0.5, -0.5, -0.5], [0.5, -0.5, 0.5]],
  [[-0.5, 0.5, -0.5], [-0.5, 0.5, 0.5]],
  [[0.5, 0.5, -0.5], [0.5, 0.5, 0.5]],
];

export function CsClCell({
  molecule,
  viewMode,
  showLabels,
  loading = false,
}: CsClCellProps) {
  const atomsById = useMemo(
    () => new Map(molecule.atoms.map((atom) => [atom.id, atom])),
    [molecule.atoms],
  );
  const cameraPosition = molecule.rendering?.cameraPosition ?? [2.9, 2.35, 3.35];
  const cameraFov = molecule.rendering?.cameraFov ?? 42;
  const activeMode = molecule.crystalTeaching?.viewModes.find((mode) => mode.id === viewMode);
  const showStrongCoordination = viewMode === "coordination";
  const showMutedCoordination = viewMode === "comparison";

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
          <directionalLight position={[-3, 2, -4]} intensity={0.38} />
          <group position={[0, -0.05, 0]} rotation={[0.18, -0.48, 0]} scale={2.05}>
            <CellFrame isMuted={viewMode === "counting"} />
            {(showStrongCoordination || showMutedCoordination)
              ? (molecule.coordinationLinks ?? []).map((link) => (
                  <CoordinationGuide
                    atomsById={atomsById}
                    color={showStrongCoordination ? "#64748B" : "#94A3B8"}
                    key={link.id}
                    link={link}
                    opacity={showStrongCoordination ? 0.48 : 0.22}
                    radius={showStrongCoordination ? 0.006 : 0.004}
                  />
                ))
              : null}
            {molecule.atoms.map((atom) => (
              <IonMesh
                atom={atom}
                key={atom.id}
                showLabel={showLabels}
                viewMode={viewMode}
              />
            ))}
          </group>
          <OrbitControls
            enableDamping
            enablePan={false}
            maxDistance={6}
            minDistance={1.8}
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
        <boxGeometry args={[1, 1, 1]} />
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
          opacity={isMuted ? 0.42 : 0.66}
          radius={isMuted ? 0.0035 : 0.0045}
          start={start}
        />
      ))}
    </>
  );
}

type IonMeshProps = {
  atom: Atom;
  viewMode: CrystalViewMode;
  showLabel: boolean;
};

function IonMesh({ atom, viewMode, showLabel }: IonMeshProps) {
  const isCs = atom.element === "Cs+";
  const isCl = atom.element === "Cl-";
  const isCoordinationFocus = viewMode === "coordination";
  const isCountingMode = viewMode === "counting";
  const radius = atom.radius ?? (isCs ? 0.16 : 0.12);
  const scale = isCoordinationFocus
    ? isCs
      ? 1.18
      : 1.08
    : isCountingMode
      ? isCs
        ? 1.14
        : 1.05
      : 1;
  const opacity = viewMode === "comparison" && isCl ? 0.84 : 1;
  const emissive = isCoordinationFocus
    ? isCs
      ? "#A16207"
      : "#10B981"
    : isCountingMode
      ? "#F4A261"
      : "#000000";
  const emissiveIntensity = isCoordinationFocus ? 0.22 : isCountingMode ? 0.12 : 0;
  const shouldShowLabel =
    showLabel &&
    (isCs ||
      atom.id === "cl-corner-8" ||
      atom.id === "cl-corner-4" ||
      viewMode === "coordination" ||
      viewMode === "counting");
  const labelText = atom.siteType && siteLabels[atom.siteType]
    ? `${atom.element} · ${siteLabels[atom.siteType]}`
    : atom.element;

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
          roughness={0.34}
          transparent={opacity < 1}
        />
      </mesh>
      {isCountingMode ? (
        <mesh>
          <sphereGeometry args={[radius * (isCs ? 1.55 : 1.38), 32, 32]} />
          <meshBasicMaterial
            color={isCs ? "#F4A261" : atom.color}
            opacity={isCs ? 0.2 : 0.13}
            transparent
          />
        </mesh>
      ) : null}
      {shouldShowLabel ? (
        <Html center distanceFactor={6.8} position={[0, radius + 0.08, 0]}>
          <span className="whitespace-nowrap rounded-md border border-border bg-white/90 px-1.5 py-0.5 text-xs font-semibold text-text-primary shadow-sm">
            {labelText}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

type CoordinationGuideProps = {
  atomsById: Map<string, Atom>;
  link: CoordinationLink;
  color: string;
  opacity: number;
  radius: number;
};

function CoordinationGuide({ atomsById, link, color, opacity, radius }: CoordinationGuideProps) {
  const startAtom = atomsById.get(link.atomIds[0]);
  const endAtom = atomsById.get(link.atomIds[1]);

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
