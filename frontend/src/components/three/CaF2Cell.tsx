import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import { StickCylinder } from "@/components/three/StickCylinder";
import { SceneLighting } from "@/components/three/SceneLighting";
import {
  htmlOverlayAmberCompactLabelClass,
  htmlOverlayCompactLabelClass,
} from "@/components/three/htmlOverlayStyles";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import type {
  Atom,
  CrystalModelStyle,
  CrystalSiteType,
  CrystalViewMode,
  CrystalVoidStage,
  MoleculeRecord,
} from "@/types/molecule";

type CaF2CellProps = {
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

// Ca²⁺ 8 配位焦点：面心 ca-face-z-pos，本晶胞内 4 个 F⁻ + 相邻晶胞 4 个虚影 F⁻
const caCoordinationFocusAtomIds = new Set(["ca-face-z-pos", "f-1", "f-3", "f-5", "f-7"]);

const ghostFluoridePositions: Array<[number, number, number]> = [
  [0.25, 0.25, 0.75],
  [0.25, -0.25, 0.75],
  [-0.25, 0.25, 0.75],
  [-0.25, -0.25, 0.75],
];

// F⁻ 4 配位焦点：f-1 (0.25, 0.25, 0.25)，4 个 Ca²⁺ 邻居恰好全在晶胞内
const fCoordinationFocusAtomIds = new Set([
  "f-1",
  "ca-corner-8",
  "ca-face-x-pos",
  "ca-face-y-pos",
  "ca-face-z-pos",
]);

// Ca 焦点周围 8 个 F⁻ 构成的小立方体轮廓（z=0.25 与 z=0.75 两层）
const coordinationCubeEdges: Array<[[number, number, number], [number, number, number]]> = [
  [[-0.25, -0.25, 0.25], [0.25, -0.25, 0.25]],
  [[0.25, -0.25, 0.25], [0.25, 0.25, 0.25]],
  [[0.25, 0.25, 0.25], [-0.25, 0.25, 0.25]],
  [[-0.25, 0.25, 0.25], [-0.25, -0.25, 0.25]],
  [[-0.25, -0.25, 0.75], [0.25, -0.25, 0.75]],
  [[0.25, -0.25, 0.75], [0.25, 0.25, 0.75]],
  [[0.25, 0.25, 0.75], [-0.25, 0.25, 0.75]],
  [[-0.25, 0.25, 0.75], [-0.25, -0.25, 0.75]],
  [[-0.25, -0.25, 0.25], [-0.25, -0.25, 0.75]],
  [[0.25, -0.25, 0.25], [0.25, -0.25, 0.75]],
  [[0.25, 0.25, 0.25], [0.25, 0.25, 0.75]],
  [[-0.25, 0.25, 0.25], [-0.25, 0.25, 0.75]],
];

// f-1 周围 4 个 Ca²⁺ 构成的正四面体轮廓
const anionTetrahedronEdges: Array<[[number, number, number], [number, number, number]]> = [
  [[0.5, 0.5, 0.5], [0.5, 0, 0]],
  [[0.5, 0.5, 0.5], [0, 0.5, 0]],
  [[0.5, 0.5, 0.5], [0, 0, 0.5]],
  [[0.5, 0, 0], [0, 0.5, 0]],
  [[0.5, 0, 0], [0, 0, 0.5]],
  [[0, 0.5, 0], [0, 0, 0.5]],
];

// 反萤石对比：同一套坐标，阴阳离子角色互换（FCC 位 → O²⁻，空隙位 → Li⁺）
const antifluoriteDisplay = {
  framework: { label: "O²⁻", color: "#DC2626", scale: 1.18 },
  interstitial: { label: "Li⁺", color: "#A78BFA", scale: 0.72 },
};

const CA_F_CONTACT_DISTANCE_SQ = 3 / 16; // 最近邻 Ca-F 距离 √3/4（分数坐标）

export function CaF2Cell({
  molecule,
  viewMode,
  modelStyle: _modelStyle,
  voidStage,
  showLabels,
  loading = false,
}: CaF2CellProps) {
  const cameraPosition = molecule.rendering?.cameraPosition ?? [2.95, 2.35, 3.45];
  const cameraFov = molecule.rendering?.cameraFov ?? 42;
  const activeMode = molecule.crystalTeaching?.viewModes.find((mode) => mode.id === viewMode);
  const activeStage = molecule.crystalTeaching?.voidStages?.find((stage) => stage.id === voidStage);
  const useCompactLabels = useCompactCrystalLabels();
  const isVoidMode = viewMode === "voids";

  // 离子晶体不写 bonds，Ca-F 最近邻接触线按距离程序化生成（32 条，端点全在晶胞内）
  const contactLinks = useMemo(() => {
    const calcium = molecule.atoms.filter((atom) => atom.element === "Ca");
    const fluoride = molecule.atoms.filter((atom) => atom.element === "F");
    const links: Array<{ id: string; from: Atom; to: Atom }> = [];
    for (const f of fluoride) {
      for (const ca of calcium) {
        const dx = f.position[0] - ca.position[0];
        const dy = f.position[1] - ca.position[1];
        const dz = f.position[2] - ca.position[2];
        if (Math.abs(dx * dx + dy * dy + dz * dz - CA_F_CONTACT_DISTANCE_SQ) < 1e-3) {
          links.push({ id: `${f.id}-${ca.id}`, from: f, to: ca });
        }
      }
    }
    return links;
  }, [molecule.atoms]);

  const displayTitle = isVoidMode && activeStage ? activeStage.titleZh : activeMode?.titleZh ?? "完整萤石晶胞";
  const displaySummary = isVoidMode && activeStage
    ? activeStage.bodyZh
    : activeMode?.bodyZh ?? molecule.summaryZh;

  const showContactLinks = !isVoidMode || voidStage === "filled";

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
        <SceneLighting ambient={0.72} mainIntensity={1.35} mainPosition={[4, 5, 4]} secondaryIntensity={0.42} secondaryPosition={[-3, 2, -4]} />
        <group position={[0, -0.04, 0]} rotation={[0.2, -0.5, 0]} scale={1.78}>
          <CellFrame isMuted={viewMode === "counting" || viewMode === "comparison" || isVoidMode} />
          {showContactLinks
            ? contactLinks.map((link) => (
                <ContactLink key={link.id} link={link} viewMode={viewMode} voidStage={voidStage} />
              ))
            : null}
          {viewMode === "coordination" ? (
            <>
              {coordinationCubeEdges.map(([start, end], index) => (
                <StaticCylinder color="#F4A261" end={end} key={`cube-${index}`} opacity={0.5} radius={0.0035} start={start} />
              ))}
              {ghostFluoridePositions.map((position, index) => (
                <GhostFluoride key={`ghost-${index}`} position={position} showLabel={showLabels && index === 0} />
              ))}
            </>
          ) : null}
          {viewMode === "coordinationAnion"
            ? anionTetrahedronEdges.map(([start, end], index) => (
                <StaticCylinder color="#2A9D8F" end={end} key={`tetra-${index}`} opacity={0.42} radius={0.0035} start={start} />
              ))
            : null}
          {isVoidMode && voidStage !== "framework"
            ? molecule.atoms
                .filter((atom) => atom.element === "F")
                .map((atom) => (
                  <TetrahedralVoidMarker
                    key={`void-${atom.id}`}
                    position={atom.position}
                    showLabel={showLabels && atom.id === "f-1"}
                    stage={voidStage}
                  />
                ))
            : null}
          {molecule.atoms.map((atom) => (
            <IonSphere
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

type IonSphereProps = {
  atom: Atom;
  viewMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
  showLabel: boolean;
  useCompactLabelSet: boolean;
};

function IonSphere({ atom, viewMode, voidStage, showLabel, useCompactLabelSet }: IonSphereProps) {
  const isFluoride = atom.element === "F";
  const isCaCoordinationMode = viewMode === "coordination";
  const isFCoordinationMode = viewMode === "coordinationAnion";
  const isCountingMode = viewMode === "counting";
  const isComparisonMode = viewMode === "comparison";
  const isVoidMode = viewMode === "voids";

  if (isVoidMode && isFluoride && voidStage !== "filled") {
    return null;
  }

  const isFocus = isCaCoordinationMode
    ? caCoordinationFocusAtomIds.has(atom.id)
    : isFCoordinationMode
      ? fCoordinationFocusAtomIds.has(atom.id)
      : false;
  const isFocusCenter =
    (isCaCoordinationMode && atom.id === "ca-face-z-pos") ||
    (isFCoordinationMode && atom.id === "f-1");

  const display = isComparisonMode
    ? isFluoride
      ? antifluoriteDisplay.interstitial
      : antifluoriteDisplay.framework
    : null;

  const radius = atom.radius ?? 0.08;
  const scale = isFocusCenter
    ? 1.28
    : isFocus
      ? 1.14
      : isCaCoordinationMode || isFCoordinationMode
        ? 0.86
        : isCountingMode
          ? isFluoride
            ? 1.16
            : 1.06
          : isVoidMode
            ? isFluoride
              ? 1.14
              : 1.02
            : display
              ? display.scale
              : 1;
  const opacity = (isCaCoordinationMode || isFCoordinationMode) && !isFocus
    ? 0.3
    : isVoidMode && !isFluoride
      ? 0.68
      : 1;
  const emissive = isFocus
    ? "#2A9D8F"
    : isCountingMode
      ? getCountingColor(atom)
      : isVoidMode && isFluoride
        ? "#F4A261"
        : "#000000";
  const emissiveIntensity = isFocusCenter ? 0.3 : isFocus ? 0.2 : isCountingMode ? 0.14 : isVoidMode && isFluoride ? 0.22 : 0;

  const shouldShowLabel = getIonLabelVisibility({
    atom,
    isFocus,
    showLabel,
    useCompactLabelSet,
    viewMode,
    voidStage,
  });
  const labelText = display
    ? isFluoride
      ? `${display.label} · 四面体空隙位`
      : `${display.label} · 面心立方位`
    : isFluoride
      ? isVoidMode
        ? "F⁻ · 填入空隙"
        : "F⁻ · 内部"
      : atom.siteType && siteLabels[atom.siteType]
        ? `${atom.label ?? atom.element} · ${siteLabels[atom.siteType]}`
        : atom.label ?? atom.element;

  return (
    <group position={atom.position}>
      <mesh scale={scale}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={display ? display.color : atom.color}
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
          <meshBasicMaterial color={getCountingColor(atom)} opacity={isFluoride ? 0.22 : 0.16} transparent />
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

function getIonLabelVisibility({
  atom,
  isFocus,
  showLabel,
  useCompactLabelSet,
  viewMode,
  voidStage,
}: {
  atom: Atom;
  isFocus: boolean;
  showLabel: boolean;
  useCompactLabelSet: boolean;
  viewMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
}) {
  if (!showLabel) {
    return false;
  }

  if (viewMode === "coordination" || viewMode === "coordinationAnion") {
    return isFocus;
  }

  if (viewMode === "voids") {
    return (
      atom.id === "ca-corner-8" ||
      atom.id === "ca-face-z-pos" ||
      (voidStage === "filled" && atom.id === "f-1")
    );
  }

  const representativeIds = useCompactLabelSet
    ? ["ca-corner-8", "f-1"]
    : ["ca-corner-8", "ca-face-z-pos", "f-1"];
  return representativeIds.includes(atom.id);
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
  if (atom.element === "F") return "#F4A261";
  if (atom.siteType === "face-center") return "#2A9D8F";
  return "#64748B";
}

type ContactLinkProps = {
  link: { id: string; from: Atom; to: Atom };
  viewMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
};

function ContactLink({ link, viewMode, voidStage }: ContactLinkProps) {
  const isCaCoordinationMode = viewMode === "coordination";
  const isFCoordinationMode = viewMode === "coordinationAnion";
  const isFocused = isCaCoordinationMode
    ? link.to.id === "ca-face-z-pos"
    : isFCoordinationMode
      ? link.from.id === "f-1"
      : false;

  if ((isCaCoordinationMode || isFCoordinationMode) && !isFocused) {
    return null;
  }

  const isFilledVoidMode = viewMode === "voids" && voidStage === "filled";
  // 比共价晶体的键更细更淡：这里只是最近邻接触示意，不是共价键
  const color = isFocused ? "#2A9D8F" : isFilledVoidMode ? "#8FA6A1" : "#94A3B8";
  const opacity = isFocused ? 0.75 : viewMode === "counting" ? 0.14 : isFilledVoidMode ? 0.34 : 0.22;
  const radius = isFocused ? 0.0055 : 0.0035;

  return (
    <StaticCylinder
      color={color}
      end={link.to.position}
      opacity={opacity}
      radius={radius}
      start={link.from.position}
    />
  );
}

function GhostFluoride({ position, showLabel }: { position: [number, number, number]; showLabel: boolean }) {
  // group 内为相对坐标：连线从虚影 F⁻ 指向焦点 Ca²⁺ (0, 0, 0.5)
  const linkToFocusCa: [number, number, number] = [-position[0], -position[1], 0.5 - position[2]];

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.088, 28, 28]} />
        <meshStandardMaterial color="#F4A261" opacity={0.35} roughness={0.3} transparent />
      </mesh>
      <StaticCylinder color="#2A9D8F" end={linkToFocusCa} opacity={0.55} radius={0.0045} start={[0, 0, 0]} />
      {showLabel ? (
        <Html center distanceFactor={7.2} pointerEvents="none" position={[0, 0.17, 0]}>
          <span className={htmlOverlayAmberCompactLabelClass}>相邻晶胞 F⁻</span>
        </Html>
      ) : null}
    </group>
  );
}

type TetrahedralVoidMarkerProps = {
  position: [number, number, number];
  stage: CrystalVoidStage;
  showLabel: boolean;
};

function TetrahedralVoidMarker({ position, stage, showLabel }: TetrahedralVoidMarkerProps) {
  const isFilledStage = stage === "filled";
  // 与金刚石不同：8 个空隙全部被 F⁻ 占据，标记统一同色同语义
  const radius = 0.052;
  const color = "#F59E0B";
  const opacity = isFilledStage ? 0.2 : 0.42;

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial color={color} opacity={opacity} transparent />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.7, 0.006, 10, 34]} />
        <meshBasicMaterial color={color} opacity={isFilledStage ? 0.28 : 0.5} transparent />
      </mesh>
      {showLabel ? (
        <Html center distanceFactor={7.2} pointerEvents="none" position={[0, radius + 0.08, 0]}>
          <span className={htmlOverlayAmberCompactLabelClass}>
            {isFilledStage ? "F⁻ 已填入" : "四面体空隙 ×8"}
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
  return (
    <StickCylinder color={color} end={end} material="standard" opacity={opacity} radius={radius} start={start} />
  );
}
