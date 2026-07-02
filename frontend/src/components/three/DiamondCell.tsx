import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import { Quaternion, Vector3 } from "three";
import {
  htmlOverlayAmberCompactLabelClass,
  htmlOverlayCompactLabelClass,
} from "@/components/three/htmlOverlayStyles";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import type {
  Atom,
  Bond,
  CrystalModelStyle,
  CrystalSiteType,
  CrystalViewMode,
  CrystalVoidStage,
  MoleculeRecord,
} from "@/types/molecule";

type DiamondCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  modelStyle: CrystalModelStyle;
  voidStage: CrystalVoidStage;
  showLabels: boolean;
  loading?: boolean;
};

const siteLabels: Partial<Record<CrystalSiteType, string>> = {
  corner: "顶点",
  "face-center": "面心",
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

const coordinationFocusAtomIds = new Set([
  "c-inner-1",
  "c-corner-1",
  "c-face-x-neg",
  "c-face-y-neg",
  "c-face-z-neg",
]);

const coordinationFocusBondIds = new Set([
  "c-inner-1-c-corner-1",
  "c-inner-1-c-face-x-neg",
  "c-inner-1-c-face-y-neg",
  "c-inner-1-c-face-z-neg",
]);

const compactCountingLabelAtomIds = new Set([
  "c-corner-8",
  "c-face-z-pos",
  "c-inner-1",
]);

const compactNetworkLabelAtomIds = new Set(["c-inner-1"]);

type DiamondVoidSite = {
  id: string;
  label: string;
  position: [number, number, number];
  occupied: boolean;
};

const tetrahedralVoidSites: DiamondVoidSite[] = [
  { id: "void-occupied-1", label: "已占据空隙", position: [-0.25, -0.25, -0.25], occupied: true },
  { id: "void-occupied-2", label: "已占据空隙", position: [-0.25, 0.25, 0.25], occupied: true },
  { id: "void-occupied-3", label: "已占据空隙", position: [0.25, -0.25, 0.25], occupied: true },
  { id: "void-occupied-4", label: "已占据空隙", position: [0.25, 0.25, -0.25], occupied: true },
  { id: "void-empty-1", label: "未占据空隙", position: [0.25, 0.25, 0.25], occupied: false },
  { id: "void-empty-2", label: "未占据空隙", position: [0.25, -0.25, -0.25], occupied: false },
  { id: "void-empty-3", label: "未占据空隙", position: [-0.25, 0.25, -0.25], occupied: false },
  { id: "void-empty-4", label: "未占据空隙", position: [-0.25, -0.25, 0.25], occupied: false },
];

export function DiamondCell({
  molecule,
  viewMode,
  modelStyle: _modelStyle,
  voidStage,
  showLabels,
  loading = false,
}: DiamondCellProps) {
  const atomsById = useMemo(
    () => new Map(molecule.atoms.map((atom) => [atom.id, atom])),
    [molecule.atoms],
  );
  const cameraPosition = molecule.rendering?.cameraPosition ?? [2.95, 2.35, 3.45];
  const cameraFov = molecule.rendering?.cameraFov ?? 42;
  const activeMode = molecule.crystalTeaching?.viewModes.find((mode) => mode.id === viewMode);
  const activeStage = molecule.crystalTeaching?.voidStages?.find((stage) => stage.id === voidStage);
  const useCompactLabels = useCompactCrystalLabels();
  const isVoidMode = viewMode === "voids";
  const visibleBonds = isVoidMode && voidStage !== "filled"
    ? []
    : viewMode === "coordination"
      ? molecule.bonds.filter((bond) => coordinationFocusBondIds.has(bond.id))
      : molecule.bonds;

  const displayTitle = isVoidMode && activeStage ? activeStage.titleZh : activeMode?.titleZh ?? "完整金刚石晶胞";
  const displaySummary = isVoidMode && activeStage
    ? activeStage.bodyZh
    : activeMode?.bodyZh ?? molecule.summaryZh;

  return (
    <ThreeViewerFrame
      loading={loading}
      meta="拖拽旋转 · 标签可按需开启"
      stageTestId={`${molecule.id}-canvas`}
      summary={displaySummary}
      title={`${molecule.formula}｜${displayTitle}`}
      viewerTestId={`${molecule.id}-viewer`}
    >
        <Canvas camera={{ position: cameraPosition, fov: cameraFov }} frameloop="demand" style={{ height: "100%", width: "100%" }}>
          <ambientLight intensity={0.72} />
          <directionalLight position={[4, 5, 4]} intensity={1.35} />
          <directionalLight position={[-3, 2, -4]} intensity={0.42} />
          <group position={[0, -0.04, 0]} rotation={[0.2, -0.5, 0]} scale={1.78}>
            <CellFrame isMuted={viewMode === "counting" || viewMode === "comparison" || isVoidMode} />
            {visibleBonds.map((bond) => (
              <CovalentLink
                atomsById={atomsById}
                bond={bond}
                key={bond.id}
                voidStage={voidStage}
                viewMode={viewMode}
              />
            ))}
            {isVoidMode && voidStage !== "framework"
              ? tetrahedralVoidSites.map((site) => (
                  <TetrahedralVoidMarker
                    key={site.id}
                    showLabel={showLabels}
                    site={site}
                    stage={voidStage}
                  />
                ))
              : null}
            {molecule.atoms.map((atom) => (
              <CarbonAtom
                atom={atom}
                key={atom.id}
                showLabel={showLabels}
                useCompactLabelSet={useCompactLabels}
                voidStage={voidStage}
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
          opacity={0.13}
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

type CarbonAtomProps = {
  atom: Atom;
  viewMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
  showLabel: boolean;
  useCompactLabelSet: boolean;
};

function CarbonAtom({ atom, viewMode, voidStage, showLabel, useCompactLabelSet }: CarbonAtomProps) {
  const isInternal = atom.id.startsWith("c-inner");
  const isCoordinationMode = viewMode === "coordination";
  const isCountingMode = viewMode === "counting";
  const isNetworkMode = viewMode === "covalentNetwork";
  const isVoidMode = viewMode === "voids";

  if (isVoidMode && isInternal && voidStage !== "filled") {
    return null;
  }

  const isCoordinationFocus = coordinationFocusAtomIds.has(atom.id);
  const radius = atom.radius ?? 0.08;
  const scale = isCoordinationMode
    ? isCoordinationFocus
      ? atom.id === "c-inner-1"
        ? 1.28
        : 1.16
      : 0.86
      : isCountingMode
        ? isInternal
          ? 1.18
          : 1.08
      : isVoidMode
        ? isInternal
          ? 1.16
          : 1.02
        : isNetworkMode
          ? 1.06
          : 1;
  const opacity = isCoordinationMode && !isCoordinationFocus
    ? 0.34
    : isVoidMode && !isInternal
      ? 0.68
      : 1;
  const emissive = isCoordinationMode && isCoordinationFocus
    ? "#2A9D8F"
    : isCountingMode
      ? getCountingColor(atom)
      : isVoidMode && isInternal
        ? "#F4A261"
        : isNetworkMode
        ? "#4B5563"
        : "#000000";
  const emissiveIntensity = isCoordinationMode && isCoordinationFocus
    ? 0.22
    : isCountingMode
      ? 0.14
      : isVoidMode && isInternal
        ? 0.22
        : isNetworkMode
          ? 0.08
          : 0;
  const shouldShowLabel = shouldShowCarbonLabel({
    atom,
    isCoordinationMode,
    isCountingMode,
    isInternal,
    isVoidMode,
    showLabel,
    useCompactLabelSet,
    voidStage,
    viewMode,
  });
  const labelText = isInternal
    ? isVoidMode
      ? "C · 占据空隙"
      : "C · 内部"
    : atom.siteType && siteLabels[atom.siteType]
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
          metalness={0.08}
          opacity={opacity}
          roughness={0.26}
          transparent={opacity < 1}
        />
      </mesh>
      {isCountingMode ? (
        <mesh>
          <sphereGeometry args={[radius * 1.62, 32, 32]} />
          <meshBasicMaterial color={getCountingColor(atom)} opacity={isInternal ? 0.22 : 0.16} transparent />
        </mesh>
      ) : null}
      {shouldShowLabel ? (
        <Html center distanceFactor={useCompactLabelSet ? 7.4 : 6.8} pointerEvents="none" position={[0, radius + 0.08, 0]}>
          <span className={htmlOverlayCompactLabelClass}>
            {labelText}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

function shouldShowCarbonLabel({
  atom,
  isCoordinationMode,
  isCountingMode,
  isInternal,
  isVoidMode,
  showLabel,
  useCompactLabelSet,
  voidStage,
  viewMode,
}: {
  atom: Atom;
  isCoordinationMode: boolean;
  isCountingMode: boolean;
  isInternal: boolean;
  isVoidMode: boolean;
  showLabel: boolean;
  useCompactLabelSet: boolean;
  voidStage: CrystalVoidStage;
  viewMode: CrystalViewMode;
}) {
  if (!showLabel) {
    return false;
  }

  if (isVoidMode) {
    return (
      atom.id === "c-corner-8" ||
      atom.id === "c-face-z-pos" ||
      (voidStage === "filled" && atom.id === "c-inner-1")
    );
  }

  if (useCompactLabelSet) {
    if (isCoordinationMode) {
      return coordinationFocusAtomIds.has(atom.id);
    }

    if (isCountingMode) {
      return compactCountingLabelAtomIds.has(atom.id);
    }

    if (viewMode === "covalentNetwork") {
      return compactNetworkLabelAtomIds.has(atom.id);
    }
  }

  return (
    isInternal ||
    atom.id === "c-corner-8" ||
    atom.id === "c-face-z-pos" ||
    isCoordinationMode ||
    isCountingMode
  );
}

function useCompactCrystalLabels() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 430px)");
    const update = () => setIsCompact(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isCompact;
}

function getCountingColor(atom: Atom) {
  if (atom.id.startsWith("c-inner")) return "#F4A261";
  if (atom.siteType === "face-center") return "#2A9D8F";
  return "#64748B";
}

type CovalentLinkProps = {
  atomsById: Map<string, Atom>;
  bond: Bond;
  viewMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
};

function CovalentLink({ atomsById, bond, viewMode, voidStage }: CovalentLinkProps) {
  const startAtom = atomsById.get(bond.atomIds[0]);
  const endAtom = atomsById.get(bond.atomIds[1]);

  if (!startAtom || !endAtom) {
    return null;
  }

  const isFocused = coordinationFocusBondIds.has(bond.id);
  const isCoordinationMode = viewMode === "coordination";
  const isFilledVoidMode = viewMode === "voids" && voidStage === "filled";
  const color = isCoordinationMode && isFocused
    ? "#2A9D8F"
    : viewMode === "covalentNetwork" || isFilledVoidMode
      ? "#4B5563"
      : "#64748B";
  const opacity = isCoordinationMode
    ? isFocused
      ? 0.72
      : 0.18
    : viewMode === "counting"
      ? 0.18
      : viewMode === "covalentNetwork" || isFilledVoidMode
        ? 0.58
        : 0.34;
  const radius = isCoordinationMode && isFocused
    ? 0.006
    : viewMode === "covalentNetwork" || isFilledVoidMode
      ? 0.005
      : 0.004;

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

type TetrahedralVoidMarkerProps = {
  site: DiamondVoidSite;
  stage: CrystalVoidStage;
  showLabel: boolean;
};

function TetrahedralVoidMarker({ site, stage, showLabel }: TetrahedralVoidMarkerProps) {
  const isFilledStage = stage === "filled";
  const shouldHighlight = !isFilledStage || site.occupied;
  const radius = site.occupied ? 0.052 : 0.046;
  const color = site.occupied ? "#F59E0B" : "#94A3B8";
  const opacity = shouldHighlight ? (site.occupied ? 0.42 : 0.28) : 0.1;
  const shouldShowLabel =
    showLabel && (site.id === "void-occupied-1" || (!isFilledStage && site.id === "void-empty-1"));

  return (
    <group position={site.position}>
      <mesh>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial color={color} opacity={opacity} transparent />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.7, 0.006, 10, 34]} />
        <meshBasicMaterial color={color} opacity={shouldHighlight ? 0.5 : 0.16} transparent />
      </mesh>
      {site.occupied && isFilledStage ? (
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[radius * 1.9, 0.005, 10, 34]} />
          <meshBasicMaterial color="#F4A261" opacity={0.46} transparent />
        </mesh>
      ) : null}
      {shouldShowLabel ? (
        <Html center distanceFactor={7.2} pointerEvents="none" position={[0, radius + 0.08, 0]}>
          <span className={htmlOverlayAmberCompactLabelClass}>
            {site.label}
          </span>
        </Html>
      ) : null}
    </group>
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
