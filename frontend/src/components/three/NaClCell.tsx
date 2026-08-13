import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { StickCylinder } from "@/components/three/StickCylinder";
import { SceneLighting } from "@/components/three/SceneLighting";
import {
  htmlOverlayAmberLabelClass,
  htmlOverlayLabelClass,
} from "@/components/three/htmlOverlayStyles";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { CrystalAtomLegend } from "@/components/three/CrystalAtomLegend";
import type {
  Atom,
  Bond,
  CrystalModelStyle,
  CrystalSiteType,
  CrystalViewMode,
  CrystalVoidStage,
  MoleculeRecord,
} from "@/types/molecule";

type NaClCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  modelStyle: CrystalModelStyle;
  voidStage: CrystalVoidStage;
  showLabels: boolean;
  loading?: boolean;
  onReadyChange?: (ready: boolean) => void;
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
  modelStyle: _modelStyle,
  voidStage,
  showLabels,
  loading = false,
  onReadyChange,
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
  const activeMode = molecule.crystalControls?.viewModes.find((mode) => mode.id === viewMode);
  const activeStage = molecule.crystalControls?.voidStages?.find((stage) => stage.id === voidStage);
  const isVoidMode = viewMode === "voids";
  const groupScale = isVoidMode ? 0.7 : 0.8;
  const groupPosition: [number, number, number] = isVoidMode ? [0, -0.12, 0] : [0, -0.08, 0];

  const displayTitle = isVoidMode && activeStage
    ? `${activeMode?.labelZh ?? "八面体空隙"}｜${activeStage.labelZh}`
    : activeMode?.labelZh ?? "晶胞结构";

  // R3F 的 onCreated 在事件层已经连接后才触发。切走前等待这个信号，可避免旧
  // Canvas 尚在异步创建时被卸载，导致其内部事件目标 ref 变成 null。
  useEffect(
    () => () => onReadyChange?.(false),
    [onReadyChange],
  );

  return (
    <ThreeViewerFrame
      footerMeta={<CrystalAtomLegend atoms={molecule.atoms} />}
      loading={loading}
      meta="拖拽旋转 · 标签可按需开启"
      stageTestId={`${molecule.id}-canvas`}
      summary={molecule.summaryZh}
      title={`${molecule.formula}｜${displayTitle}`}
      viewerTestId={`${molecule.id}-viewer`}
    >
        <Canvas
          camera={{ position: cameraPosition, fov: cameraFov }}
          frameloop="demand"
          onCreated={() => onReadyChange?.(true)}
          style={{ height: "100%", width: "100%" }}
        >
          <SceneLighting ambient={0.68} mainIntensity={1.35} mainPosition={[4, 5, 4]} secondaryIntensity={0.35} secondaryPosition={[-3, 2, -4]} />
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
    </ThreeViewerFrame>
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
      <mesh scale={scale}>
        <sphereGeometry args={[radius, 32, 32]} />
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
        <Html center distanceFactor={7} pointerEvents="none" position={[0, radius + 0.12, 0]}>
          <span className={htmlOverlayLabelClass}>
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
        <Html center distanceFactor={7} pointerEvents="none" position={[0, radius + 0.12, 0]}>
          <span className={htmlOverlayAmberLabelClass}>
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
  return (
    <StickCylinder color={color} end={end} material="standard" opacity={opacity} radius={radius} start={start} />
  );
}
