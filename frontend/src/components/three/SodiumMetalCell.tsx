import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { StickCylinder } from "@/components/three/StickCylinder";
import { SceneLighting } from "@/components/three/SceneLighting";
import { htmlOverlayLabelClass } from "@/components/three/htmlOverlayStyles";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import type {
  Atom,
  CoordinationLink,
  CrystalModelStyle,
  CrystalSiteType,
  CrystalViewMode,
  MoleculeRecord,
} from "@/types/molecule";

type SodiumMetalCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  modelStyle: CrystalModelStyle;
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

const electronPoints: [number, number, number][] = [
  [-0.32, -0.12, -0.18],
  [-0.18, 0.24, 0.16],
  [0.1, -0.28, 0.28],
  [0.28, 0.04, -0.26],
  [-0.38, 0.34, 0.02],
  [0.36, -0.34, 0.08],
  [0.02, 0.34, -0.34],
  [-0.08, -0.36, -0.32],
  [0.24, 0.3, 0.3],
  [-0.28, -0.3, 0.3],
  [0.38, 0.26, -0.02],
  [-0.34, 0.0, -0.34],
];

export function SodiumMetalCell({
  molecule,
  viewMode,
  modelStyle: _modelStyle,
  showLabels,
  loading = false,
}: SodiumMetalCellProps) {
  const atomsById = useMemo(
    () => new Map(molecule.atoms.map((atom) => [atom.id, atom])),
    [molecule.atoms],
  );
  const cameraPosition = molecule.rendering?.cameraPosition ?? [2.9, 2.35, 3.35];
  const cameraFov = molecule.rendering?.cameraFov ?? 42;
  const activeMode = molecule.crystalControls?.viewModes.find((mode) => mode.id === viewMode);
  const showNearestNeighborLinks = viewMode === "coordination";
  const showMutedLinks = viewMode === "metallicBond";
  const showMetallicBondHint = viewMode === "metallicBond";

  return (
    <ThreeViewerFrame
      loading={loading}
      meta="拖拽旋转 · 标签可按需开启"
      stageTestId={`${molecule.id}-canvas`}
      summary={molecule.summaryZh}
      title={`${molecule.formula}｜${activeMode?.labelZh ?? "晶胞结构"}`}
      viewerTestId={`${molecule.id}-viewer`}
    >
        <Canvas camera={{ position: cameraPosition, fov: cameraFov }} frameloop="demand" style={{ height: "100%", width: "100%" }}>
          <SceneLighting ambient={0.7} mainIntensity={1.35} mainPosition={[4, 5, 4]} secondaryIntensity={0.38} secondaryPosition={[-3, 2, -4]} />
          <group position={[0, -0.05, 0]} rotation={[0.18, -0.48, 0]} scale={1.75}>
            <CellFrame isMuted={viewMode === "counting" || showMetallicBondHint} />
            {showMetallicBondHint ? <MetallicBondHint /> : null}
            {(showNearestNeighborLinks || showMutedLinks)
              ? (molecule.coordinationLinks ?? []).map((link) => (
                  <CoordinationGuide
                    atomsById={atomsById}
                    color={showNearestNeighborLinks ? "#8A7A4F" : "#B7AA7D"}
                    key={link.id}
                    link={link}
                    opacity={showNearestNeighborLinks ? 0.42 : 0.18}
                    radius={showNearestNeighborLinks ? 0.005 : 0.0035}
                  />
                ))
              : null}
            {molecule.atoms.map((atom) => (
              <SodiumAtom
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
    </ThreeViewerFrame>
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
          color={isMuted ? "#A8B8B4" : "#7A8F8A"}
          end={end}
          key={`${start.join(",")}-${end.join(",")}-${index}`}
          opacity={isMuted ? 0.38 : 0.66}
          radius={isMuted ? 0.0035 : 0.0045}
          start={start}
        />
      ))}
    </>
  );
}

type SodiumAtomProps = {
  atom: Atom;
  viewMode: CrystalViewMode;
  showLabel: boolean;
};

function SodiumAtom({ atom, viewMode, showLabel }: SodiumAtomProps) {
  const isBodyCenter = atom.siteType === "body-center";
  const isCoordinationMode = viewMode === "coordination";
  const isCountingMode = viewMode === "counting";
  const isMetallicBondMode = viewMode === "metallicBond";
  const radius = atom.radius ?? (isBodyCenter ? 0.16 : 0.12);
  const scale = isCoordinationMode
    ? isBodyCenter
      ? 1.18
      : 1.08
    : isCountingMode
      ? isBodyCenter
        ? 1.14
        : 1.06
      : 1;
  const emissive = isCoordinationMode
    ? "#B6A05C"
    : isCountingMode
      ? "#F4A261"
      : isMetallicBondMode
        ? "#D6D3C6"
        : "#000000";
  const emissiveIntensity = isCoordinationMode ? 0.18 : isCountingMode ? 0.12 : isMetallicBondMode ? 0.08 : 0;
  const shouldShowLabel =
    showLabel &&
    (isBodyCenter ||
      atom.id === "na-corner-8" ||
      atom.id === "na-corner-4" ||
      isCoordinationMode ||
      isCountingMode);
  const labelText = atom.siteType && siteLabels[atom.siteType]
    ? `${atom.element} · ${siteLabels[atom.siteType]}`
    : atom.element;

  return (
    <group position={atom.position}>
      <mesh scale={scale}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={atom.color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          metalness={0.42}
          roughness={0.28}
        />
      </mesh>
      {isCountingMode ? (
        <mesh>
          <sphereGeometry args={[radius * (isBodyCenter ? 1.55 : 1.38), 32, 32]} />
          <meshBasicMaterial
            color={isBodyCenter ? "#F4A261" : "#D6D3C6"}
            opacity={isBodyCenter ? 0.2 : 0.14}
            transparent
          />
        </mesh>
      ) : null}
      {shouldShowLabel ? (
        <Html center distanceFactor={6.8} pointerEvents="none" position={[0, radius + 0.08, 0]}>
          <span className={htmlOverlayLabelClass}>
            {labelText}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

function MetallicBondHint() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[0.64, 48, 48]} />
        <meshBasicMaterial color="#F4DFA6" opacity={0.11} transparent />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.43, 48, 48]} />
        <meshBasicMaterial color="#D6D3C6" opacity={0.1} transparent />
      </mesh>
      {electronPoints.map((position, index) => (
        <mesh key={`${position.join(",")}-${index}`} position={position}>
          <sphereGeometry args={[0.018, 16, 16]} />
          <meshBasicMaterial color={index % 2 === 0 ? "#F4A261" : "#2A9D8F"} opacity={0.52} transparent />
        </mesh>
      ))}
    </>
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
  return (
    <StickCylinder color={color} end={end} material="standard" opacity={opacity} radius={radius} start={start} />
  );
}
