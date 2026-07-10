import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { StickCylinder } from "@/components/three/StickCylinder";
import { SceneLighting } from "@/components/three/SceneLighting";
import {
  htmlOverlayAmberLabelClass,
  htmlOverlayLabelClass,
  htmlOverlaySubtleWideLabelClass,
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

type PbaCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  modelStyle: CrystalModelStyle;
  voidStage: CrystalVoidStage;
  showLabels: boolean;
  loading?: boolean;
};

const cellEdges: Array<[[number, number, number], [number, number, number]]> = [
  [[-0.68, -0.68, -0.68], [0.68, -0.68, -0.68]],
  [[-0.68, -0.68, 0.68], [0.68, -0.68, 0.68]],
  [[-0.68, 0.68, -0.68], [0.68, 0.68, -0.68]],
  [[-0.68, 0.68, 0.68], [0.68, 0.68, 0.68]],
  [[-0.68, -0.68, -0.68], [-0.68, 0.68, -0.68]],
  [[0.68, -0.68, -0.68], [0.68, 0.68, -0.68]],
  [[-0.68, -0.68, 0.68], [-0.68, 0.68, 0.68]],
  [[0.68, -0.68, 0.68], [0.68, 0.68, 0.68]],
  [[-0.68, -0.68, -0.68], [-0.68, -0.68, 0.68]],
  [[0.68, -0.68, -0.68], [0.68, -0.68, 0.68]],
  [[-0.68, 0.68, -0.68], [-0.68, 0.68, 0.68]],
  [[0.68, 0.68, -0.68], [0.68, 0.68, 0.68]],
];

const octahedronEdges: Array<[[number, number, number], [number, number, number]]> = [
  [[0.6, 0, 0], [0, 0.6, 0]],
  [[0.6, 0, 0], [0, -0.6, 0]],
  [[0.6, 0, 0], [0, 0, 0.6]],
  [[0.6, 0, 0], [0, 0, -0.6]],
  [[-0.6, 0, 0], [0, 0.6, 0]],
  [[-0.6, 0, 0], [0, -0.6, 0]],
  [[-0.6, 0, 0], [0, 0, 0.6]],
  [[-0.6, 0, 0], [0, 0, -0.6]],
  [[0, 0.6, 0], [0, 0, 0.6]],
  [[0, 0.6, 0], [0, 0, -0.6]],
  [[0, -0.6, 0], [0, 0, 0.6]],
  [[0, -0.6, 0], [0, 0, -0.6]],
];

const vacancyPosition: [number, number, number] = [-0.42, -0.4, 0.42];

export function PbaCell({
  molecule,
  viewMode,
  modelStyle: _modelStyle,
  voidStage,
  showLabels,
  loading = false,
}: PbaCellProps) {
  const atomsById = useMemo(
    () => new Map(molecule.atoms.map((atom) => [atom.id, atom])),
    [molecule.atoms],
  );
  const activeMode = molecule.crystalTeaching?.viewModes.find((mode) => mode.id === viewMode);
  const activeStage = molecule.crystalTeaching?.voidStages?.find((stage) => stage.id === voidStage);
  const cameraPosition = molecule.rendering?.cameraPosition ?? [2.55, 2.15, 2.85];
  const cameraFov = molecule.rendering?.cameraFov ?? 38;
  const isVoidMode = viewMode === "voids";
  const displayTitle = isVoidMode && activeStage ? activeStage.titleZh : activeMode?.titleZh ?? "框架晶胞";
  const displaySummary = isVoidMode && activeStage
    ? activeStage.bodyZh
    : activeMode?.bodyZh ?? molecule.summaryZh;
  const visibleAtoms = molecule.atoms.filter((atom) => shouldRenderAtom(atom, viewMode, voidStage));

  return (
    <ThreeViewerFrame
      loading={loading}
      meta="拖拽旋转 · 标签可按需开启"
      stageTestId={`${molecule.id}-canvas`}
      summary={displaySummary}
      title={`PBA｜${displayTitle}`}
      viewerTestId={`${molecule.id}-viewer`}
    >
      <Canvas camera={{ position: cameraPosition, fov: cameraFov }} frameloop="demand" style={{ height: "100%", width: "100%" }}>
        <SceneLighting ambient={0.7} mainIntensity={1.35} mainPosition={[4, 5, 4]} secondaryIntensity={0.4} secondaryPosition={[-3, 2, -4]} />
        <group position={[0, -0.03, 0]} rotation={[0.18, -0.48, 0]} scale={1.88}>
          <CellFrame isMuted={viewMode === "voids" || viewMode === "comparison"} />
          {viewMode === "coordination" ? <OctahedralGuide /> : null}
          {viewMode === "comparison" ? <FrameworkComparisonGuide /> : null}
          {molecule.bonds.map((bond) => (
            <BridgeCylinder
              atomsById={atomsById}
              bond={bond}
              key={bond.id}
              viewMode={viewMode}
              voidStage={voidStage}
            />
          ))}
          {viewMode === "coordination" || viewMode === "comparison"
            ? (molecule.coordinationLinks ?? []).map((link) => (
                <CoordinationGuide
                  atomsById={atomsById}
                  key={link.id}
                  link={link}
                  viewMode={viewMode}
                />
              ))
            : null}
          {visibleAtoms.map((atom) => (
            <PbaAtom
              atom={atom}
              key={atom.id}
              showLabel={showLabels}
              viewMode={viewMode}
              voidStage={voidStage}
            />
          ))}
          {isVoidMode && voidStage !== "framework" ? <VacancyMarker voidStage={voidStage} /> : null}
          {isVoidMode && voidStage === "filled" ? <WaterHydrationGuides atomsById={atomsById} /> : null}
        </group>
        <OrbitControls
          enableDamping
          enablePan={false}
          maxDistance={6}
          minDistance={1.8}
          target={[0, 0, 0]}
        />
      </Canvas>
    </ThreeViewerFrame>
  );
}

function shouldRenderAtom(atom: Atom, viewMode: CrystalViewMode, voidStage: CrystalVoidStage) {
  if (atom.element === "A+") return viewMode === "comparison" || (viewMode === "voids" && voidStage === "filled");
  if (atom.element === "O") return viewMode === "voids" && voidStage === "filled";
  return true;
}

function CellFrame({ isMuted = false }: { isMuted?: boolean }) {
  return (
    <>
      <mesh>
        <boxGeometry args={[1.36, 1.36, 1.36]} />
        <meshStandardMaterial
          color="#E8F3F0"
          depthWrite={false}
          opacity={isMuted ? 0.09 : 0.14}
          roughness={0.8}
          transparent
        />
      </mesh>
      {cellEdges.map(([start, end], index) => (
        <StaticCylinder
          color={isMuted ? "#A8B8B4" : "#7A8F8A"}
          end={end}
          key={`${start.join(",")}-${end.join(",")}-${index}`}
          opacity={isMuted ? 0.36 : 0.64}
          radius={isMuted ? 0.0035 : 0.0045}
          start={start}
        />
      ))}
    </>
  );
}

type PbaAtomProps = {
  atom: Atom;
  viewMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
  showLabel: boolean;
};

function PbaAtom({ atom, viewMode, voidStage, showLabel }: PbaAtomProps) {
  const isCentralMetal = atom.element === "M′";
  const isOuterMetal = atom.element === "M";
  const isBridgeAtom = atom.element === "C" || atom.element === "N";
  const isGuest = atom.element === "A+";
  const isWater = atom.element === "O";
  const isCoordinationMode = viewMode === "coordination";
  const isVoidMode = viewMode === "voids";
  const radius = atom.radius ?? (isBridgeAtom ? 0.05 : 0.12);
  const scale = isCoordinationMode
    ? isCentralMetal
      ? 1.2
      : isBridgeAtom
        ? 1.12
        : 0.92
    : isGuest
      ? 1.18
      : isWater
        ? 1.08
        : 1;
  const opacity =
    isCoordinationMode && isOuterMetal
      ? 0.48
      : isVoidMode && voidStage !== "framework" && (isOuterMetal || isBridgeAtom)
        ? 0.72
        : 1;
  const emissive = isCentralMetal
    ? "#1D4ED8"
    : isOuterMetal
      ? "#2A9D8F"
      : isGuest
        ? "#F4A261"
        : isWater
          ? "#38BDF8"
          : "#000000";
  const emissiveIntensity =
    isCoordinationMode && (isCentralMetal || isBridgeAtom)
      ? 0.2
      : isGuest || isWater
        ? 0.16
        : viewMode === "comparison" && (isCentralMetal || isOuterMetal)
          ? 0.12
          : 0;
  const metalness = isCentralMetal || isOuterMetal ? 0.36 : 0.04;
  const shouldShowLabel =
    showLabel &&
    (isCentralMetal ||
      isOuterMetal ||
      isGuest ||
      isWater ||
      (isCoordinationMode && (atom.id === "c-x-plus" || atom.id === "n-x-plus")));
  const labelText = isCentralMetal && isCoordinationMode ? "M′(CN)₆" : atom.label;

  return (
    <group position={atom.position}>
      <mesh scale={scale}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={atom.color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          metalness={metalness}
          opacity={opacity}
          roughness={isBridgeAtom ? 0.42 : 0.28}
          transparent={opacity < 1}
        />
      </mesh>
      {isCentralMetal && isCoordinationMode ? (
        <mesh>
          <sphereGeometry args={[radius * 1.55, 32, 32]} />
          <meshBasicMaterial color="#1D4ED8" opacity={0.12} transparent />
        </mesh>
      ) : null}
      {isGuest ? (
        <mesh>
          <sphereGeometry args={[radius * 1.85, 32, 32]} />
          <meshBasicMaterial color="#F4A261" opacity={0.14} transparent />
        </mesh>
      ) : null}
      {shouldShowLabel ? (
        <Html center distanceFactor={6.8} pointerEvents="none" position={[0, radius + 0.08, 0]}>
          <span className={isGuest ? htmlOverlayAmberLabelClass : htmlOverlayLabelClass}>
            {labelText}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

type BridgeCylinderProps = {
  atomsById: Map<string, Atom>;
  bond: Bond;
  viewMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
};

function BridgeCylinder({ atomsById, bond, viewMode, voidStage }: BridgeCylinderProps) {
  const startAtom = atomsById.get(bond.atomIds[0]);
  const endAtom = atomsById.get(bond.atomIds[1]);

  if (!startAtom || !endAtom) return null;

  const isTriple = bond.order === 3;
  const isCoordinationMode = viewMode === "coordination";
  const isVoidDimmed = viewMode === "voids" && voidStage !== "framework";
  const color = isTriple ? "#334155" : isCoordinationMode ? "#2A9D8F" : "#7A8F8A";
  const opacity = isCoordinationMode
    ? isTriple
      ? 0.88
      : 0.72
    : isVoidDimmed
      ? 0.34
      : viewMode === "comparison"
        ? 0.32
        : 0.56;
  const radius = isTriple ? 0.01 : isCoordinationMode ? 0.008 : 0.006;

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

type CoordinationGuideProps = {
  atomsById: Map<string, Atom>;
  link: CoordinationLink;
  viewMode: CrystalViewMode;
};

function CoordinationGuide({ atomsById, link, viewMode }: CoordinationGuideProps) {
  const startAtom = atomsById.get(link.atomIds[0]);
  const endAtom = atomsById.get(link.atomIds[1]);

  if (!startAtom || !endAtom) return null;

  return (
    <StaticCylinder
      color={viewMode === "coordination" ? "#1F6F68" : "#94A3B8"}
      end={endAtom.position}
      opacity={viewMode === "coordination" ? 0.2 : 0.14}
      radius={0.0035}
      start={startAtom.position}
    />
  );
}

function OctahedralGuide() {
  return (
    <>
      {octahedronEdges.map(([start, end], index) => (
        <StaticCylinder
          color="#1D4ED8"
          end={end}
          key={`${start.join(",")}-${end.join(",")}-${index}`}
          opacity={0.16}
          radius={0.0035}
          start={start}
        />
      ))}
      <Html center distanceFactor={7.4} pointerEvents="none" position={[0, 0.74, 0]}>
        <span className={htmlOverlaySubtleWideLabelClass}>六配位方向</span>
      </Html>
    </>
  );
}

function FrameworkComparisonGuide() {
  return (
    <>
      <mesh position={[0.34, 0.34, 0.34]}>
        <sphereGeometry args={[0.17, 32, 32]} />
        <meshBasicMaterial color="#F4A261" opacity={0.08} transparent />
      </mesh>
      <Html center distanceFactor={7.4} pointerEvents="none" position={[0, -0.78, 0]}>
        <span className={htmlOverlaySubtleWideLabelClass}>节点-桥-节点</span>
      </Html>
    </>
  );
}

function VacancyMarker({ voidStage }: { voidStage: CrystalVoidStage }) {
  const label = voidStage === "filled" ? "空位/水合" : "□ 空位";

  return (
    <group position={vacancyPosition}>
      <mesh>
        <octahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial
          color="#94A3B8"
          emissive="#64748B"
          emissiveIntensity={0.05}
          opacity={0.32}
          roughness={0.55}
          transparent
          wireframe
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshBasicMaterial color="#FFFFFF" opacity={0.18} transparent />
      </mesh>
      <Html center distanceFactor={7.2} pointerEvents="none" position={[0, 0.24, 0]}>
        <span className={htmlOverlayAmberLabelClass}>{label}</span>
      </Html>
    </group>
  );
}

function WaterHydrationGuides({ atomsById }: { atomsById: Map<string, Atom> }) {
  const firstWater = atomsById.get("water-o-1");
  const secondWater = atomsById.get("water-o-2");
  const guest = atomsById.get("a-site");

  return (
    <>
      {firstWater ? (
        <StaticCylinder
          color="#38BDF8"
          end={firstWater.position}
          opacity={0.34}
          radius={0.004}
          start={vacancyPosition}
        />
      ) : null}
      {secondWater ? (
        <StaticCylinder
          color="#38BDF8"
          end={secondWater.position}
          opacity={0.28}
          radius={0.004}
          start={vacancyPosition}
        />
      ) : null}
      {guest ? (
        <StaticCylinder
          color="#F4A261"
          end={guest.position}
          opacity={0.2}
          radius={0.0035}
          start={[0, 0, 0]}
        />
      ) : null}
    </>
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
  return (
    <StickCylinder
      color={color}
      depthWrite={opacity >= 0.5}
      end={end}
      material="standard"
      opacity={opacity}
      radius={radius}
      start={start}
    />
  );
}
