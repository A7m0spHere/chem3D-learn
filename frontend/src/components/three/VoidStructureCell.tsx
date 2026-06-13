import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import type {
  Atom,
  Bond,
  CoordinationLink,
  CrystalViewMode,
  CrystalVoidStage,
  MoleculeRecord,
} from "@/types/molecule";

type VoidStructureCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
  showLabels: boolean;
  loading?: boolean;
};

export function VoidStructureCell({
  molecule,
  viewMode,
  voidStage,
  showLabels,
  loading = false,
}: VoidStructureCellProps) {
  const atomsById = useMemo(
    () => new Map(molecule.atoms.map((atom) => [atom.id, atom])),
    [molecule.atoms],
  );
  const cameraPosition = molecule.rendering?.cameraPosition ?? [2.8, 2.4, 3.2];
  const cameraFov = molecule.rendering?.cameraFov ?? 42;
  const activeMode = molecule.crystalTeaching?.viewModes.find((mode) => mode.id === viewMode);
  const isVoidMode = viewMode === "voids";
  const showCenterMarker = isVoidMode
    ? voidStage !== "framework"
    : viewMode === "counting";
  const showFilledMarker = isVoidMode && voidStage === "filled";

  return (
    <section className="flex h-full min-h-[500px] flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-white/80 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">3D 空隙 Viewer</h2>
          <p className="text-sm text-text-secondary">拖拽旋转，滚轮或触控板缩放</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-primary-dark">
          {activeMode?.labelZh ?? "骨架"} · {molecule.nameZh}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-[radial-gradient(circle_at_center,#ffffff_0%,#f7faf9_58%,#e8f3f0_100%)]">
        {loading ? (
          <div className="motion-skeleton absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-white/60" />
        ) : null}
        <Canvas camera={{ position: cameraPosition, fov: cameraFov }} shadows>
          <ambientLight intensity={0.72} />
          <directionalLight position={[4, 5, 4]} intensity={1.35} castShadow />
          <directionalLight position={[-3, 2, -4]} intensity={0.42} />
          <group position={[0, -0.03, 0]} rotation={[0.24, -0.48, 0]} scale={1.55}>
            {molecule.bonds.map((bond) => (
              <OutlineEdge
                atomsById={atomsById}
                bond={bond}
                key={bond.id}
                viewMode={viewMode}
              />
            ))}
            {(isVoidMode || viewMode === "counting")
              ? (molecule.coordinationLinks ?? []).map((link) => (
                  <VoidGuide
                    atomsById={atomsById}
                    key={link.id}
                    link={link}
                    viewMode={viewMode}
                  />
                ))
              : null}
            {molecule.atoms.map((atom) => {
              if (atom.id === "void-center") {
                return showCenterMarker ? (
                  <VoidMarker
                    atom={atom}
                    filled={showFilledMarker || viewMode === "counting"}
                    key={atom.id}
                    showLabel={showLabels}
                  />
                ) : null;
              }

              return (
                <HostSphere
                  atom={atom}
                  key={atom.id}
                  showLabel={showLabels}
                  viewMode={viewMode}
                />
              );
            })}
            {viewMode === "counting" ? (
              <CountBadge
                label={molecule.id === "tetrahedral-voids" ? "四面体空隙：2N" : "八面体空隙：N"}
                position={[0, 1.28, 0]}
              />
            ) : null}
          </group>
          <OrbitControls
            enableDamping
            enablePan={false}
            maxDistance={6}
            minDistance={1.7}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
    </section>
  );
}

type HostSphereProps = {
  atom: Atom;
  viewMode: CrystalViewMode;
  showLabel: boolean;
};

function HostSphere({ atom, viewMode, showLabel }: HostSphereProps) {
  const radius = atom.radius ?? 0.16;
  const isCounting = viewMode === "counting";
  const isVoidMode = viewMode === "voids";
  const opacity = isVoidMode ? 0.78 : 1;
  const scale = isCounting ? 1.08 : 1;

  return (
    <group position={atom.position}>
      <mesh castShadow>
        <sphereGeometry args={[radius * scale, 32, 32]} />
        <meshStandardMaterial
          color={atom.color}
          emissive={isCounting ? "#2A9D8F" : "#000000"}
          emissiveIntensity={isCounting ? 0.1 : 0}
          metalness={0.02}
          opacity={opacity}
          roughness={0.36}
          transparent={opacity < 1}
        />
      </mesh>
      {showLabel ? (
        <Html center distanceFactor={6.8} position={[0, radius + 0.1, 0]}>
          <span className="whitespace-nowrap rounded-md border border-border bg-white/90 px-1.5 py-0.5 text-xs font-semibold text-text-primary shadow-sm">
            {atom.label}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

type VoidMarkerProps = {
  atom: Atom;
  filled: boolean;
  showLabel: boolean;
};

function VoidMarker({ atom, filled, showLabel }: VoidMarkerProps) {
  const radius = atom.radius ?? 0.08;

  return (
    <group position={atom.position}>
      <mesh>
        <sphereGeometry args={[radius * (filled ? 1.7 : 1.25), 32, 32]} />
        <meshStandardMaterial
          color={atom.color}
          emissive="#F4A261"
          emissiveIntensity={0.34}
          opacity={filled ? 0.9 : 0.38}
          roughness={0.24}
          transparent
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 2.45, 32, 32]} />
        <meshBasicMaterial color="#F4A261" opacity={filled ? 0.15 : 0.1} transparent />
      </mesh>
      {showLabel ? (
        <Html center distanceFactor={7.2} position={[0, radius + 0.16, 0]}>
          <span className="whitespace-nowrap rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-xs font-bold text-amber-900 shadow-sm">
            {filled ? "填入小球" : "空隙中心"}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

function CountBadge({
  label,
  position,
}: {
  label: string;
  position: [number, number, number];
}) {
  return (
    <Html center distanceFactor={7.4} position={position}>
      <span className="whitespace-nowrap rounded-full border border-primary/30 bg-primary/90 px-3 py-1 text-xs font-bold text-white shadow-sm">
        {label}
      </span>
    </Html>
  );
}

type VoidGuideProps = {
  atomsById: Map<string, Atom>;
  link: CoordinationLink;
  viewMode: CrystalViewMode;
};

function VoidGuide({ atomsById, link, viewMode }: VoidGuideProps) {
  const startAtom = atomsById.get(link.atomIds[0]);
  const endAtom = atomsById.get(link.atomIds[1]);

  if (!startAtom || !endAtom) return null;

  return (
    <StaticCylinder
      color={viewMode === "counting" ? "#F4A261" : "#2A9D8F"}
      end={endAtom.position}
      opacity={viewMode === "counting" ? 0.28 : 0.22}
      radius={0.0045}
      start={startAtom.position}
    />
  );
}

type OutlineEdgeProps = {
  atomsById: Map<string, Atom>;
  bond: Bond;
  viewMode: CrystalViewMode;
};

function OutlineEdge({ atomsById, bond, viewMode }: OutlineEdgeProps) {
  const startAtom = atomsById.get(bond.atomIds[0]);
  const endAtom = atomsById.get(bond.atomIds[1]);

  if (!startAtom || !endAtom) return null;

  return (
    <StaticCylinder
      color={viewMode === "cell" ? "#7A8F8A" : "#2A9D8F"}
      end={endAtom.position}
      opacity={viewMode === "cell" ? 0.34 : 0.58}
      radius={viewMode === "cell" ? 0.0045 : 0.006}
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
      <meshBasicMaterial color={color} opacity={opacity} transparent />
    </mesh>
  );
}
