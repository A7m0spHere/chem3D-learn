import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import {
  htmlOverlayAmberStrongLabelClass,
  htmlOverlayLabelClass,
} from "@/components/three/htmlOverlayStyles";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import type {
  Atom,
  Bond,
  CoordinationLink,
  CrystalModelStyle,
  CrystalViewMode,
  CrystalVoidStage,
  MoleculeRecord,
} from "@/types/molecule";

type VoidStructureCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  modelStyle: CrystalModelStyle;
  voidStage: CrystalVoidStage;
  showLabels: boolean;
  loading?: boolean;
};

export function VoidStructureCell({
  molecule,
  viewMode,
  modelStyle: _modelStyle,
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
  const groupScale = molecule.id === "tetrahedral-voids" ? 1.25 : 1.48;
  const countLabel =
    viewMode === "counting"
      ? molecule.id === "tetrahedral-voids"
        ? "四面体空隙：2N"
        : "八面体空隙：N"
      : null;

  return (
    <ThreeViewerFrame
      footerMeta={
        countLabel ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary-dark">
            {countLabel}
          </span>
        ) : null
      }
      loading={loading}
      meta="拖拽旋转 · 标签可按需开启"
      stageTestId={`${molecule.id}-canvas`}
      summary={activeMode?.bodyZh ?? molecule.summaryZh}
      title={`${molecule.nameZh}｜${activeMode?.titleZh ?? "空间骨架"}`}
      viewerTestId={`${molecule.id}-viewer`}
    >
        <Canvas camera={{ position: cameraPosition, fov: cameraFov }} frameloop="demand" style={{ height: "100%", width: "100%" }}>
          <ambientLight intensity={0.72} />
          <directionalLight position={[4, 5, 4]} intensity={1.35} />
          <directionalLight position={[-3, 2, -4]} intensity={0.42} />
          <group position={[0, -0.03, 0]} rotation={[0.24, -0.48, 0]} scale={groupScale}>
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
          </group>
          <OrbitControls
            enableDamping
            enablePan={false}
            maxDistance={6}
            minDistance={1.7}
            target={[0, 0, 0]}
          />
        </Canvas>
    </ThreeViewerFrame>
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
      <mesh scale={scale}>
        <sphereGeometry args={[radius, 32, 32]} />
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
        <Html center distanceFactor={6.8} pointerEvents="none" position={[0, radius + 0.1, 0]}>
          <span className={htmlOverlayLabelClass}>
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
        <Html center distanceFactor={7.2} pointerEvents="none" position={[0, radius + 0.16, 0]}>
          <span className={htmlOverlayAmberStrongLabelClass}>
            {filled ? "填入小球" : "空隙中心"}
          </span>
        </Html>
      ) : null}
    </group>
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
