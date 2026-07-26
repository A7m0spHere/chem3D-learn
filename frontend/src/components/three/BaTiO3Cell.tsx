import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CameraRig } from "@/components/three/CameraRig";
import { SceneLighting } from "@/components/three/SceneLighting";
import { StickCylinder, type Vec3 } from "@/components/three/StickCylinder";
import {
  htmlOverlayAmberCompactLabelClass,
  htmlOverlayCompactLabelClass,
  htmlOverlayLabelClass,
} from "@/components/three/htmlOverlayStyles";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { CrystalAtomLegend } from "@/components/three/CrystalAtomLegend";
import type { Atom, CrystalViewMode, MoleculeRecord } from "@/types/molecule";

type BaTiO3CellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  showLabels: boolean;
  loading?: boolean;
};

type OriginConvention = "ba-corner" | "ti-corner";

const CELL_MIN = -0.5;
const CELL_MAX = 0.5;

const cellEdges: Array<[Vec3, Vec3]> = [
  [[CELL_MIN, CELL_MIN, CELL_MIN], [CELL_MAX, CELL_MIN, CELL_MIN]],
  [[CELL_MIN, CELL_MIN, CELL_MAX], [CELL_MAX, CELL_MIN, CELL_MAX]],
  [[CELL_MIN, CELL_MAX, CELL_MIN], [CELL_MAX, CELL_MAX, CELL_MIN]],
  [[CELL_MIN, CELL_MAX, CELL_MAX], [CELL_MAX, CELL_MAX, CELL_MAX]],
  [[CELL_MIN, CELL_MIN, CELL_MIN], [CELL_MIN, CELL_MAX, CELL_MIN]],
  [[CELL_MAX, CELL_MIN, CELL_MIN], [CELL_MAX, CELL_MAX, CELL_MIN]],
  [[CELL_MIN, CELL_MIN, CELL_MAX], [CELL_MIN, CELL_MAX, CELL_MAX]],
  [[CELL_MAX, CELL_MIN, CELL_MAX], [CELL_MAX, CELL_MAX, CELL_MAX]],
  [[CELL_MIN, CELL_MIN, CELL_MIN], [CELL_MIN, CELL_MIN, CELL_MAX]],
  [[CELL_MAX, CELL_MIN, CELL_MIN], [CELL_MAX, CELL_MIN, CELL_MAX]],
  [[CELL_MIN, CELL_MAX, CELL_MIN], [CELL_MIN, CELL_MAX, CELL_MAX]],
  [[CELL_MAX, CELL_MAX, CELL_MIN], [CELL_MAX, CELL_MAX, CELL_MAX]],
];

const octahedronVertices: Vec3[] = [
  [CELL_MIN, 0, 0],
  [CELL_MAX, 0, 0],
  [0, CELL_MIN, 0],
  [0, CELL_MAX, 0],
  [0, 0, CELL_MIN],
  [0, 0, CELL_MAX],
];

const octahedronEdges: Array<[number, number]> = [
  [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 4], [2, 5], [3, 4], [3, 5],
];

const baNeighborPositions: Vec3[] = [
  [-0.5, -0.5, 0], [-0.5, 0.5, 0], [0.5, -0.5, 0], [0.5, 0.5, 0],
  [-0.5, 0, -0.5], [-0.5, 0, 0.5], [0.5, 0, -0.5], [0.5, 0, 0.5],
  [0, -0.5, -0.5], [0, -0.5, 0.5], [0, 0.5, -0.5], [0, 0.5, 0.5],
];

export function BaTiO3Cell({
  molecule,
  viewMode,
  showLabels,
  loading = false,
}: BaTiO3CellProps) {
  const [originConvention, setOriginConvention] = useState<OriginConvention>("ba-corner");
  const atomsById = useMemo(
    () => new Map(molecule.atoms.map((atom) => [atom.id, atom])),
    [molecule.atoms],
  );
  const shiftedAtoms = useMemo(() => deriveTiCornerCell(molecule.atoms), [molecule.atoms]);
  const activeMode = molecule.crystalTeaching?.viewModes.find((mode) => mode.id === viewMode);
  const isOriginMode = viewMode === "originShift";
  const usesTiCornerCell = isOriginMode && originConvention === "ti-corner";
  const displayAtoms = usesTiCornerCell ? shiftedAtoms : molecule.atoms;
  const representativeLabelIds = useMemo(
    () => getRepresentativeLabelIds(displayAtoms),
    [displayAtoms],
  );
  const cameraPosition = molecule.rendering?.cameraPosition ?? [2.85, 2.35, 3.2];
  const cameraFov = molecule.rendering?.cameraFov ?? 40;
  const originLabel = originConvention === "ba-corner" ? "Ba 顶点画法" : "Ti 顶点画法";
  const displayTitle = isOriginMode
    ? `${activeMode?.titleZh ?? "两种等价晶胞画法"}｜${originLabel}`
    : activeMode?.titleZh ?? "理想立方钙钛矿晶胞";
  const displaySummary = activeMode?.bodyZh ?? molecule.summaryZh;

  return (
    <ThreeViewerFrame
      footerMeta={<CrystalAtomLegend atoms={molecule.atoms} />}
      loading={loading}
      meta={
        isOriginMode ? (
          <OriginConventionToggle
            active={originConvention}
            onChange={setOriginConvention}
          />
        ) : (
          "拖拽旋转 · 辅助线只表示最近邻"
        )
      }
      stageTestId="batio3-canvas"
      summary={displaySummary}
      title={`BaTiO₃｜${displayTitle}`}
      viewerTestId="batio3-viewer"
    >
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ alpha: false }}
        style={{ height: "100%", width: "100%" }}
      >
        <color attach="background" args={["#F7FAF9"]} />
        <SceneLighting
          ambient={0.72}
          mainIntensity={1.35}
          mainPosition={[4, 5, 4]}
          secondaryIntensity={0.38}
          secondaryPosition={[-3, 2, -4]}
        />
        <CameraRig
          fov={cameraFov}
          position={cameraPosition}
          resetKey={`${viewMode}-${originConvention}`}
        />
        <group
          position={[0, -0.01, 0]}
          rotation={[0.24, -0.52, 0]}
          scale={viewMode === "aSiteCoordination" ? 1.78 : 1.62}
        >
          {viewMode === "aSiteCoordination" ? (
            <BaCoordinationCluster showLabels={showLabels} />
          ) : (
            <>
              <CellFrame muted={viewMode !== "cell" && viewMode !== "counting" && !isOriginMode} />
              {viewMode === "polyhedron" ? <OctahedronGuide /> : null}
              {viewMode === "cell" || viewMode === "polyhedron" || viewMode === "bSiteCoordination"
                ? (molecule.coordinationLinks ?? []).map((link) => {
                    const start = atomsById.get(link.atomIds[0]);
                    const end = atomsById.get(link.atomIds[1]);
                    if (!start || !end) return null;
                    return (
                      <TiOLink
                        end={end.position}
                        key={link.id}
                        mode={viewMode}
                        start={start.position}
                      />
                    );
                  })
                : null}
              {displayAtoms.map((atom) => (
                <CrystalAtom
                  atom={atom}
                  forceLabel={shouldForceFocusLabel(atom, viewMode)}
                  key={atom.id}
                  mode={viewMode}
                  showLabel={(showLabels || viewMode === "counting") && representativeLabelIds.has(atom.id)}
                />
              ))}
              {isOriginMode ? (
                <OriginShiftGuide shifted={usesTiCornerCell} />
              ) : null}
            </>
          )}
        </group>
        <OrbitControls
          enableDamping
          enablePan={false}
          makeDefault
          maxDistance={6}
          minDistance={1.75}
          target={[0, 0, 0]}
        />
      </Canvas>
    </ThreeViewerFrame>
  );
}

function OriginConventionToggle({
  active,
  onChange,
}: {
  active: OriginConvention;
  onChange: (value: OriginConvention) => void;
}) {
  return (
    <div aria-label="等价原点画法" className="flex flex-wrap gap-1.5" role="group">
      <Button
        aria-pressed={active === "ba-corner"}
        className="h-8 rounded-lg px-2.5 text-xs"
        onClick={() => onChange("ba-corner")}
        size="sm"
        type="button"
        variant={active === "ba-corner" ? "default" : "outline"}
      >
        Ba 顶点画法
      </Button>
      <Button
        aria-pressed={active === "ti-corner"}
        className="h-8 rounded-lg px-2.5 text-xs"
        onClick={() => onChange("ti-corner")}
        size="sm"
        type="button"
        variant={active === "ti-corner" ? "default" : "outline"}
      >
        Ti 顶点画法
      </Button>
    </div>
  );
}

function CellFrame({ muted }: { muted: boolean }) {
  return (
    <group>
      {cellEdges.map(([start, end], index) => (
        <StickCylinder
          color="#78908B"
          end={end}
          key={index}
          material="standard"
          opacity={muted ? 0.18 : 0.42}
          radius={muted ? 0.003 : 0.0045}
          start={start}
        />
      ))}
    </group>
  );
}

function TiOLink({ start, end, mode }: { start: Vec3; end: Vec3; mode: CrystalViewMode }) {
  const isFocused = mode === "polyhedron" || mode === "bSiteCoordination";
  return (
    <StickCylinder
      color={isFocused ? "#2A9D8F" : "#8FA6A1"}
      end={end}
      material="standard"
      opacity={isFocused ? 0.78 : 0.28}
      radius={isFocused ? 0.006 : 0.0035}
      start={start}
    />
  );
}

function OctahedronGuide() {
  return (
    <group>
      {octahedronEdges.map(([startIndex, endIndex], index) => (
        <StickCylinder
          color="#F4A261"
          end={octahedronVertices[endIndex]}
          key={index}
          opacity={0.72}
          radius={0.0045}
          start={octahedronVertices[startIndex]}
        />
      ))}
      <Html center distanceFactor={7.2} pointerEvents="none" position={[0.42, -0.46, 0.34]}>
        <span className={htmlOverlayAmberCompactLabelClass}>O—O 轮廓 · 非化学键</span>
      </Html>
    </group>
  );
}

function CrystalAtom({
  atom,
  mode,
  showLabel,
  forceLabel,
}: {
  atom: Atom;
  mode: CrystalViewMode;
  showLabel: boolean;
  forceLabel: boolean;
}) {
  const focusesTiO = mode === "polyhedron" || mode === "bSiteCoordination";
  const isBarium = atom.element === "Ba";
  const isTitanium = atom.element === "Ti";
  const isOxygen = atom.element === "O";
  const isFocus = focusesTiO ? isTitanium || isOxygen : true;
  const opacity = focusesTiO && isBarium ? 0.16 : 1;
  const radius = atom.radius ?? 0.08;
  const scale = focusesTiO && isTitanium ? 1.24 : focusesTiO && isOxygen ? 1.08 : 1;
  const labelText = getAtomLabel(atom, mode);
  const labelPosition = getAtomLabelPosition(atom, mode, radius);

  return (
    <group position={atom.position}>
      <mesh scale={scale}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={atom.color}
          emissive={isFocus && focusesTiO ? atom.color : "#000000"}
          emissiveIntensity={isFocus && focusesTiO ? 0.16 : 0}
          metalness={0.08}
          opacity={opacity}
          roughness={0.26}
          transparent={opacity < 1}
        />
      </mesh>
      {mode === "counting" ? (
        <mesh>
          <sphereGeometry args={[radius * 1.58, 28, 28]} />
          <meshBasicMaterial color={getCountingColor(atom)} opacity={0.18} transparent />
        </mesh>
      ) : null}
      {showLabel || forceLabel ? (
        <Html center distanceFactor={7.1} pointerEvents="none" position={labelPosition}>
          <span className={forceLabel ? htmlOverlayLabelClass : htmlOverlayCompactLabelClass}>
            {labelText}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

function BaCoordinationCluster({ showLabels }: { showLabels: boolean }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.115, 36, 36]} />
        <meshStandardMaterial color="#2A9D8F" emissive="#2A9D8F" emissiveIntensity={0.2} roughness={0.24} />
      </mesh>
      <Html center distanceFactor={7} pointerEvents="none" position={[0, 0.21, 0]}>
        <span className={htmlOverlayLabelClass}>Ba²⁺ · 中心</span>
      </Html>
      {baNeighborPositions.map((position, index) => (
        <group key={position.join("-")}>
          <StickCylinder
            color="#2A9D8F"
            end={position}
            material="standard"
            opacity={0.58}
            radius={0.0045}
            start={[0, 0, 0]}
          />
          <group position={position}>
            <mesh>
              <sphereGeometry args={[0.078, 30, 30]} />
              <meshStandardMaterial color="#DC2626" opacity={0.82} roughness={0.28} transparent />
            </mesh>
            {showLabels && index === 11 ? (
              <Html center distanceFactor={7.2} pointerEvents="none" position={[0, 0.16, 0]}>
                <span className={htmlOverlayAmberCompactLabelClass}>O²⁻ · 周期延展</span>
              </Html>
            ) : null}
          </group>
        </group>
      ))}
      <Html center distanceFactor={7.1} pointerEvents="none" position={[0.42, -0.58, 0.42]}>
        <span className={htmlOverlayAmberCompactLabelClass}>12 个最近邻 O²⁻</span>
      </Html>
    </group>
  );
}

function OriginShiftGuide({ shifted }: { shifted: boolean }) {
  return (
    <group>
      <StickCylinder
        color="#F4A261"
        end={[0, 0, 0]}
        opacity={0.72}
        radius={0.005}
        start={[-0.5, -0.5, -0.5]}
      />
      <mesh position={[-0.5, -0.5, -0.5]}>
        <sphereGeometry args={[0.025, 20, 20]} />
        <meshBasicMaterial color="#F4A261" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.025, 20, 20]} />
        <meshBasicMaterial color="#F4A261" />
      </mesh>
      <Html center distanceFactor={7.2} pointerEvents="none" position={[0.42, -0.56, 0.18]}>
        <span className={htmlOverlayAmberCompactLabelClass}>
          {shifted ? "新原点：Ti⁴⁺ 顶点" : "原点平移 (½, ½, ½)"}
        </span>
      </Html>
    </group>
  );
}

function shouldForceFocusLabel(atom: Atom, mode: CrystalViewMode) {
  if (mode === "polyhedron" || mode === "bSiteCoordination") {
    return atom.id === "ti-body" || atom.id === "o-face-x-pos";
  }
  return false;
}

function getAtomLabel(atom: Atom, mode: CrystalViewMode) {
  if (mode === "counting") {
    if (atom.element === "Ba") return "Ba²⁺ · 顶点贡献 1/8";
    if (atom.element === "Ti") return "Ti⁴⁺ · 体心贡献 1";
    return "O²⁻ · 面心贡献 1/2";
  }
  if (mode === "originShift") {
    const site = atom.siteType === "corner"
      ? "顶点"
      : atom.siteType === "edge-center"
        ? "棱心"
        : atom.siteType === "face-center"
          ? "面心"
          : "体心";
    return `${atom.label} · ${site}`;
  }
  if (mode === "polyhedron" && atom.element === "O") return "O²⁻ · 八面体顶点";
  if (mode === "bSiteCoordination" && atom.element === "O") return "O²⁻ · 最近邻 ×6";
  return atom.label;
}

function getAtomLabelPosition(atom: Atom, mode: CrystalViewMode, radius: number): Vec3 {
  if ((mode === "polyhedron" || mode === "bSiteCoordination") && atom.element === "O") {
    return [0.3, radius + 0.07, 0.04];
  }
  if ((mode === "polyhedron" || mode === "bSiteCoordination") && atom.element === "Ti") {
    return [-0.13, radius + 0.13, 0];
  }
  return [0, radius + 0.085, 0];
}

function getCountingColor(atom: Atom) {
  if (atom.element === "Ba") return "#2A9D8F";
  if (atom.element === "Ti") return "#334155";
  return "#F4A261";
}

function getRepresentativeLabelIds(atoms: Atom[]) {
  const ids = new Set<string>();
  for (const element of ["Ba", "Ti", "O"]) {
    const atom = atoms.find((candidate) => candidate.element === element);
    if (atom) ids.add(atom.id);
  }
  return ids;
}

/**
 * Moves the conventional origin by (1/2, 1/2, 1/2), folds the fractional
 * coordinates back into one unit cell, then expands boundary sites. This
 * derives the Ti-corner drawing from the authored Ba-corner data instead of
 * maintaining a second crystal record.
 */
function deriveTiCornerCell(atoms: Atom[]): Atom[] {
  const uniqueSites = new Map<string, Atom>();

  for (const atom of atoms) {
    const shifted = atom.position.map((value) => wrapUnit(value)) as Vec3;
    const key = `${atom.element}:${shifted.map(formatCoordinate).join(":")}`;
    if (!uniqueSites.has(key)) {
      uniqueSites.set(key, { ...atom, position: shifted });
    }
  }

  const expanded: Atom[] = [];
  for (const atom of uniqueSites.values()) {
    const choices = atom.position.map((value) => nearlyZero(value) ? [0, 1] : [value]);
    for (const x of choices[0]) {
      for (const y of choices[1]) {
        for (const z of choices[2]) {
          const fractional: Vec3 = [x, y, z];
          const position: Vec3 = [x - 0.5, y - 0.5, z - 0.5];
          const siteType = getSiteType(fractional);
          expanded.push({
            ...atom,
            id: `${atom.element.toLowerCase()}-shift-${fractional.map(formatCoordinate).join("-")}`,
            position,
            siteType,
          });
        }
      }
    }
  }

  return expanded;
}

function wrapUnit(value: number) {
  const wrapped = ((value % 1) + 1) % 1;
  return nearlyZero(wrapped) || Math.abs(wrapped - 1) < 1e-8 ? 0 : wrapped;
}

function nearlyZero(value: number) {
  return Math.abs(value) < 1e-8;
}

function formatCoordinate(value: number) {
  return Number(value.toFixed(4)).toString().replace("-", "m").replace(".", "p");
}

function getSiteType(fractional: Vec3): Atom["siteType"] {
  const boundaryCount = fractional.filter((value) => nearlyZero(value) || Math.abs(value - 1) < 1e-8).length;
  if (boundaryCount === 3) return "corner";
  if (boundaryCount === 2) return "edge-center";
  if (boundaryCount === 1) return "face-center";
  return "body-center";
}
