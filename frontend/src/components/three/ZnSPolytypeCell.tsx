import { Canvas } from "@react-three/fiber";
import { Html, Instance, Instances, OrbitControls } from "@react-three/drei";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CameraRig } from "@/components/three/CameraRig";
import {
  createClosePackingGeometry,
  type ClosePackedLayerId,
  type ClosePackedPatchAtom,
} from "@/components/three/closePackingGeometry";
import {
  crystalOverlayBadgeToneClasses,
  htmlOverlayLabelClass,
} from "@/components/three/htmlOverlayStyles";
import { SceneLighting } from "@/components/three/SceneLighting";
import { StickCylinder, type Vec3 } from "@/components/three/StickCylinder";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import {
  createCubeEdges,
  createWurtziteCellEdges,
  tetrahedronEdgeIndices,
  tetrahedronNeighborPositions,
} from "@/components/three/znsPolytypeGeometry";
import type {
  Atom,
  CrystalViewMode,
  CrystalVoidStage,
  MoleculeRecord,
} from "@/types/molecule";

type ZnSPolytypeCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
  showLabels: boolean;
  loading?: boolean;
};

type Polytype = "zinc-blende" | "wurtzite";
type CoordinationCenter = "Zn" | "S";

const ZN_COLOR = "#2A9D8F";
const ZN_DARK = "#1F6F68";
const S_COLOR = "#D6A33A";
const CELL_COLOR = "#64748B";
const VOID_COLOR = "#94A3B8";

const layerColors: Record<ClosePackedLayerId, string> = {
  A: "#2A9D8F",
  B: "#F4A261",
  C: "#64748B",
};

const nearestDistance = 0.54;
const sphereRadius = nearestDistance / 2;
const { generateHexPatch, layerGap, layerOffsets } = createClosePackingGeometry(nearestDistance);
const layerPatch = generateHexPatch(2);
const interstitialPatch = generateHexPatch(1);

const cubeEdges = createCubeEdges(0.5);
const wurtziteCellEdges = createWurtziteCellEdges();

export function ZnSPolytypeCell({
  molecule,
  viewMode,
  voidStage,
  showLabels,
  loading = false,
}: ZnSPolytypeCellProps) {
  const [voidPolytype, setVoidPolytype] = useState<Polytype>("zinc-blende");
  const [coordinationCenter, setCoordinationCenter] = useState<CoordinationCenter>("Zn");
  const activeMode = molecule.crystalControls?.viewModes.find((mode) => mode.id === viewMode);
  const activeStage = molecule.crystalControls?.voidStages?.find((stage) => stage.id === voidStage);
  const camera = getCameraPreset(viewMode);
  const isVoidMode = viewMode === "voids";
  const isPolyhedronMode = viewMode === "polyhedron";
  const polytypeLabel = voidPolytype === "zinc-blende" ? "闪锌矿" : "纤锌矿";
  const displayTitle = isVoidMode
    ? `${activeMode?.labelZh ?? "半填空隙"}｜${activeStage?.labelZh ?? "S 骨架"}｜${polytypeLabel}`
    : isPolyhedronMode
      ? `${activeMode?.labelZh ?? "4:4 配位"}｜${coordinationCenter} 中心`
      : activeMode?.labelZh ?? "晶型总览";
  const displaySummary = getDisplaySummary(
    viewMode,
    molecule.summaryZh,
  );
  const sceneRotation: Vec3 =
    viewMode === "comparison" || viewMode === "counting"
      ? [0.08, -0.08, 0]
      : viewMode === "polyhedron"
        ? [0.18, -0.42, 0]
        : [0.08, -0.48, 0];

  return (
    <ThreeViewerFrame
      footerMeta={<AtomLegend />}
      loading={loading}
      meta={
        isVoidMode ? (
          <PolytypeToggle active={voidPolytype} onChange={setVoidPolytype} />
        ) : isPolyhedronMode ? (
          <CoordinationCenterToggle
            active={coordinationCenter}
            onChange={setCoordinationCenter}
          />
        ) : (
          "拖拽旋转 · 辅助线表示最近邻"
        )
      }
      stageTestId="zns-canvas"
      summary={displaySummary}
      title={`ZnS｜${displayTitle}`}
      viewerTestId="zns-viewer"
    >
      <Canvas
        camera={{ position: camera.position, fov: camera.fov }}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ alpha: false }}
        style={{ height: "100%", width: "100%" }}
      >
        <color attach="background" args={["#F7FAF9"]} />
        <SceneLighting
          ambient={0.74}
          mainIntensity={1.34}
          mainPosition={[4, 6, 5]}
          secondaryIntensity={0.4}
          secondaryPosition={[-4, 2, -3]}
        />
        <CameraRig
          fov={camera.fov}
          position={camera.position}
          resetKey={`${viewMode}-${voidStage}-${voidPolytype}-${coordinationCenter}`}
        />
        <group position={[0, -0.04, 0]} rotation={sceneRotation} scale={camera.scale}>
          <ZnSScene
            coordinationCenter={coordinationCenter}
            molecule={molecule}
            polytype={voidPolytype}
            showLabels={showLabels}
            viewMode={viewMode}
            voidStage={voidStage}
          />
        </group>
        <OrbitControls
          enableDamping
          enablePan={false}
          makeDefault
          maxDistance={9}
          minDistance={2}
          target={[0, 0, 0]}
        />
      </Canvas>
    </ThreeViewerFrame>
  );
}

function PolytypeToggle({
  active,
  onChange,
}: {
  active: Polytype;
  onChange: (value: Polytype) => void;
}) {
  return (
    <div aria-label="空隙晶型" className="flex flex-wrap gap-1.5" role="group">
      <Button
        aria-pressed={active === "zinc-blende"}
        className="h-8 rounded-lg px-2.5 text-xs"
        onClick={() => onChange("zinc-blende")}
        size="sm"
        type="button"
        variant={active === "zinc-blende" ? "default" : "outline"}
      >
        闪锌矿
      </Button>
      <Button
        aria-pressed={active === "wurtzite"}
        className="h-8 rounded-lg px-2.5 text-xs"
        onClick={() => onChange("wurtzite")}
        size="sm"
        type="button"
        variant={active === "wurtzite" ? "default" : "outline"}
      >
        纤锌矿
      </Button>
    </div>
  );
}

function CoordinationCenterToggle({
  active,
  onChange,
}: {
  active: CoordinationCenter;
  onChange: (value: CoordinationCenter) => void;
}) {
  return (
    <div aria-label="配位中心" className="flex flex-wrap gap-1.5" role="group">
      <Button
        aria-pressed={active === "Zn"}
        className="h-8 rounded-lg px-2.5 text-xs"
        onClick={() => onChange("Zn")}
        size="sm"
        type="button"
        variant={active === "Zn" ? "default" : "outline"}
      >
        Zn 中心
      </Button>
      <Button
        aria-pressed={active === "S"}
        className="h-8 rounded-lg px-2.5 text-xs"
        onClick={() => onChange("S")}
        size="sm"
        type="button"
        variant={active === "S" ? "default" : "outline"}
      >
        S 中心
      </Button>
    </div>
  );
}

function ZnSScene({
  coordinationCenter,
  molecule,
  polytype,
  showLabels,
  viewMode,
  voidStage,
}: {
  coordinationCenter: CoordinationCenter;
  molecule: MoleculeRecord;
  polytype: Polytype;
  showLabels: boolean;
  viewMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
}) {
  switch (viewMode) {
    case "fccStacking":
      return (
        <StackingScene
          sequence={["A", "B", "C", "A"]}
          showLabels={showLabels}
          title="闪锌矿｜ABCABC"
        />
      );
    case "hcpStacking":
      return (
        <StackingScene
          sequence={["A", "B", "A", "B"]}
          showLabels={showLabels}
          title="纤锌矿｜ABAB"
        />
      );
    case "voids":
      return <VoidOccupationScene polytype={polytype} stage={voidStage} />;
    case "polyhedron":
      return <CoordinationScene center={coordinationCenter} showLabels={showLabels} />;
    case "counting":
      return <CellComparisonScene atoms={molecule.atoms} counting showLabels={showLabels} />;
    case "comparison":
    default:
      return <CellComparisonScene atoms={molecule.atoms} showLabels={showLabels} />;
  }
}

function StackingScene({
  sequence,
  showLabels,
  title,
}: {
  sequence: ClosePackedLayerId[];
  showLabels: boolean;
  title: string;
}) {
  const centerIndex = (sequence.length - 1) / 2;

  return (
    <>
      {sequence.map((layer, index) => {
        const y = (index - centerIndex) * layerGap;
        return (
          <group key={`${layer}-${index}`}>
            <LayerPlane color={layerColors[layer]} radius={1.58} y={y - 0.025} />
            <SulfurPackingLayer
              atoms={layerPatch}
              layer={layer}
              offset={layerOffsets[layer]}
              radius={sphereRadius * 0.82}
              y={y}
            />
            <LayerBadge
              label={`${layer} 层`}
              position={[-1.5, y + 0.02, -0.9]}
              tone={layer === "A" ? "lower" : layer === "B" ? "upper" : "note"}
            />
          </group>
        );
      })}
      {sequence.slice(0, -1).flatMap((layer, gapIndex) => {
        const nextLayer = sequence[gapIndex + 1];
        const lowerY = (gapIndex - centerIndex) * layerGap;
        return interstitialPatch.map((atom) => (
          <ZnSSphere
            color={ZN_COLOR}
            key={`zn-${gapIndex}-${atom.id}`}
            position={[
              atom.position[0] + layerOffsets[nextLayer][0],
              lowerY + layerGap * 0.25,
              atom.position[2] + layerOffsets[nextLayer][1],
            ]}
            radius={0.115}
          />
        ));
      })}
      <LayerBadge label={title} position={[0, 1.36, 0]} tone="center" />
      <LayerBadge label="Zn 占一半四面体空隙" position={[0, -1.38, 0.06]} tone="same" />
      {showLabels ? <FocusLabel label="Zn" position={[0.28, 0.04, 0.18]} /> : null}
    </>
  );
}

function VoidOccupationScene({
  polytype,
  stage,
}: {
  polytype: Polytype;
  stage: CrystalVoidStage;
}) {
  const sequence: ClosePackedLayerId[] =
    polytype === "zinc-blende" ? ["A", "B", "C"] : ["A", "B", "A"];
  const centerIndex = 1;

  return (
    <>
      {sequence.map((layer, index) => {
        const y = (index - centerIndex) * layerGap;
        return (
          <group key={`${layer}-${index}`}>
            <LayerPlane color={layerColors[layer]} radius={1.58} y={y - 0.025} />
            <SulfurPackingLayer
              atoms={layerPatch}
              layer={layer}
              muted={stage !== "framework"}
              offset={layerOffsets[layer]}
              radius={sphereRadius * (stage === "framework" ? 0.82 : 0.58)}
              y={y}
            />
          </group>
        );
      })}
      {stage !== "framework"
        ? sequence.slice(0, -1).flatMap((layer, gapIndex) => {
            const nextLayer = sequence[gapIndex + 1];
            const lowerY = (gapIndex - centerIndex) * layerGap;
            return interstitialPatch.flatMap((atom) => {
              const occupiedPosition: Vec3 = [
                atom.position[0] + layerOffsets[nextLayer][0],
                lowerY + layerGap * 0.25,
                atom.position[2] + layerOffsets[nextLayer][1],
              ];
              const emptyPosition: Vec3 = [
                atom.position[0] + layerOffsets[layer][0],
                lowerY + layerGap * 0.75,
                atom.position[2] + layerOffsets[layer][1],
              ];
              return [
                stage === "filled" ? (
                  <ZnSSphere
                    color={ZN_COLOR}
                    key={`filled-${gapIndex}-${atom.id}`}
                    position={occupiedPosition}
                    radius={0.12}
                  />
                ) : (
                  <VoidMarker
                    color={ZN_COLOR}
                    key={`occupied-void-${gapIndex}-${atom.id}`}
                    position={occupiedPosition}
                  />
                ),
                <VoidMarker
                  color={VOID_COLOR}
                  key={`empty-void-${gapIndex}-${atom.id}`}
                  position={emptyPosition}
                />,
              ];
            });
          })
        : null}
      <LayerBadge
        label={polytype === "zinc-blende" ? "闪锌矿｜ABC" : "纤锌矿｜ABA"}
        position={[0, 1.22, 0]}
        tone="center"
      />
      <LayerBadge
        label={getVoidStageBadge(stage)}
        position={[0, -1.26, 0.08]}
        tone={stage === "filled" ? "same" : "note"}
      />
    </>
  );
}

function CoordinationScene({
  center,
  showLabels,
}: {
  center: CoordinationCenter;
  showLabels: boolean;
}) {
  const centerColor = center === "Zn" ? ZN_DARK : S_COLOR;
  const neighborColor = center === "Zn" ? S_COLOR : ZN_COLOR;
  const neighborLabel = center === "Zn" ? "S" : "Zn";

  return (
    <>
      <ZnSSphere color={centerColor} position={[0, 0, 0]} radius={0.27} />
      {tetrahedronNeighborPositions.map((position, index) => (
        <group key={`${center}-neighbor-${index}`}>
          <StickCylinder
            color={center === "Zn" ? "#B7791F" : ZN_DARK}
            end={position}
            opacity={0.56}
            radius={0.014}
            start={[0, 0, 0]}
          />
          <ZnSSphere color={neighborColor} position={position} radius={0.22} />
          {showLabels && index === 0 ? (
            <FocusLabel label={neighborLabel} position={[position[0], position[1] + 0.3, position[2]]} />
          ) : null}
        </group>
      ))}
      {tetrahedronEdgeIndices.map(([startIndex, endIndex], index) => (
        <StickCylinder
          color={CELL_COLOR}
          end={tetrahedronNeighborPositions[endIndex]}
          key={`tetra-edge-${index}`}
          opacity={0.38}
          radius={0.009}
          start={tetrahedronNeighborPositions[startIndex]}
        />
      ))}
      <LayerBadge
        label={center === "Zn" ? "ZnS₄｜Zn 配位数 4" : "SZn₄｜S 配位数 4"}
        position={[0, -1.08, 0]}
        tone="center"
      />
      {showLabels ? <FocusLabel label={`${center} 中心`} position={[0, 0.4, 0]} /> : null}
    </>
  );
}

function CellComparisonScene({
  atoms,
  counting = false,
  showLabels,
}: {
  atoms: Atom[];
  counting?: boolean;
  showLabels: boolean;
}) {
  return (
    <>
      <group position={[-1.25, 0, 0]} scale={1.05}>
        <ZincBlendeUnitCell atoms={atoms} counting={counting} showLabels={showLabels} />
        <LayerBadge
          label={counting ? "闪锌矿｜4 Zn + 4 S" : "闪锌矿｜ABCABC"}
          position={[0, 1.18, 0]}
          tone="lower"
        />
      </group>
      <group position={[1.3, 0, 0]} scale={0.96}>
        <WurtziteUnitCell atoms={atoms} counting={counting} showLabels={showLabels} />
        <LayerBadge
          label={counting ? "纤锌矿｜2 Zn + 2 S" : "纤锌矿｜ABAB"}
          position={[0, 1.3, 0]}
          tone="upper"
        />
      </group>
      <LayerBadge
        label={counting ? "都化简为 ZnS" : "共同：Zn 4 配位｜S 4 配位"}
        position={[0, -1.52, 0.08]}
        tone="center"
      />
    </>
  );
}

function ZincBlendeUnitCell({
  atoms,
  counting,
  showLabels,
}: {
  atoms: Atom[];
  counting: boolean;
  showLabels: boolean;
}) {
  const zincBlendeAtoms = useMemo(
    () => atoms.filter((atom) => atom.id.startsWith("zb-")),
    [atoms],
  );
  const atomById = useMemo(
    () => new Map(zincBlendeAtoms.map((atom) => [atom.id, atom])),
    [zincBlendeAtoms],
  );
  const focusZn = atomById.get("zb-zn-1");
  const focusNeighborIds = [
    "zb-s-corner-1",
    "zb-s-face-x-neg",
    "zb-s-face-y-neg",
    "zb-s-face-z-neg",
  ];

  return (
    <>
      <CellEdges edges={cubeEdges} />
      {!counting && focusZn
        ? focusNeighborIds.map((id) => {
            const neighbor = atomById.get(id);
            return neighbor ? (
              <StickCylinder
                color="#B7791F"
                end={neighbor.position}
                key={`zb-link-${id}`}
                opacity={0.45}
                radius={0.01}
                start={focusZn.position}
              />
            ) : null;
          })
        : null}
      {zincBlendeAtoms.map((atom) => (
        <group key={atom.id}>
          <ZnSSphere
            color={atom.element === "Zn" ? ZN_COLOR : S_COLOR}
            position={atom.position}
            radius={atom.element === "Zn" ? 0.105 : 0.11}
          />
          {showLabels && (atom.id === "zb-zn-1" || atom.id === "zb-s-face-z-pos") ? (
            <FocusLabel
              label={atom.element}
              position={[atom.position[0], atom.position[1] + 0.23, atom.position[2]]}
            />
          ) : null}
        </group>
      ))}
    </>
  );
}

function WurtziteUnitCell({
  atoms,
  counting,
  showLabels,
}: {
  atoms: Atom[];
  counting: boolean;
  showLabels: boolean;
}) {
  const wurtziteAtoms = useMemo(
    () => atoms.filter((atom) => atom.id.startsWith("wz-")),
    [atoms],
  );
  const atomById = useMemo(
    () => new Map(wurtziteAtoms.map((atom) => [atom.id, atom])),
    [wurtziteAtoms],
  );
  const nearestPairs = [
    [atomById.get("wz-s-1"), atomById.get("wz-zn-1")],
    [atomById.get("wz-s-2"), atomById.get("wz-zn-2")],
  ] as const;

  return (
    <>
      <CellEdges edges={wurtziteCellEdges} />
      {!counting
        ? nearestPairs.map(([sulfur, zinc], index) =>
            sulfur && zinc ? (
              <StickCylinder
                color="#B7791F"
                end={sulfur.position}
                key={`wz-link-${index}`}
                opacity={0.45}
                radius={0.01}
                start={zinc.position}
              />
            ) : null,
          )
        : null}
      {wurtziteAtoms.map((atom) => (
        <group key={atom.id}>
          <ZnSSphere
            color={atom.element === "Zn" ? ZN_COLOR : S_COLOR}
            position={atom.position}
            radius={atom.element === "Zn" ? 0.14 : 0.155}
          />
          {showLabels && (atom.id === "wz-zn-1" || atom.id === "wz-s-2") ? (
            <FocusLabel
              label={atom.element}
              position={[atom.position[0], atom.position[1] + 0.25, atom.position[2]]}
            />
          ) : null}
        </group>
      ))}
    </>
  );
}

function SulfurPackingLayer({
  atoms,
  layer,
  muted = false,
  offset,
  radius,
  y,
}: {
  atoms: ClosePackedPatchAtom[];
  layer: ClosePackedLayerId;
  muted?: boolean;
  offset: [number, number];
  radius: number;
  y: number;
}) {
  return (
    <Instances limit={atoms.length} range={atoms.length}>
      <sphereGeometry args={[radius, 26, 26]} />
      <meshStandardMaterial
        depthWrite={!muted}
        metalness={0.06}
        opacity={muted ? 0.62 : 1}
        roughness={0.4}
        transparent={muted}
      />
      {atoms.map((atom) => (
        <Instance
          color={S_COLOR}
          key={`${layer}-${y}-${atom.id}`}
          position={[atom.position[0] + offset[0], y, atom.position[2] + offset[1]]}
        />
      ))}
    </Instances>
  );
}

function ZnSSphere({
  color,
  position,
  radius,
}: {
  color: string;
  position: Vec3;
  radius: number;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 28, 28]} />
      <meshStandardMaterial color={color} metalness={0.08} roughness={0.38} />
    </mesh>
  );
}

function VoidMarker({ color, position }: { color: string; position: Vec3 }) {
  return (
    <mesh position={position} rotation={[0.55, 0.3, 0.15]}>
      <tetrahedronGeometry args={[0.12, 0]} />
      <meshStandardMaterial color={color} opacity={0.58} transparent wireframe />
    </mesh>
  );
}

function CellEdges({ edges }: { edges: Array<[Vec3, Vec3]> }) {
  return (
    <>
      {edges.map(([start, end], index) => (
        <StickCylinder
          color={CELL_COLOR}
          end={end}
          key={`cell-edge-${index}`}
          opacity={0.58}
          radius={0.012}
          start={start}
        />
      ))}
    </>
  );
}

function LayerPlane({ color, radius, y }: { color: string; radius: number; y: number }) {
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 56]} />
      <meshBasicMaterial color={color} depthWrite={false} opacity={0.052} transparent />
    </mesh>
  );
}

function LayerBadge({
  label,
  position,
  tone,
}: {
  label: string;
  position: Vec3;
  tone: keyof typeof crystalOverlayBadgeToneClasses;
}) {
  return (
    <Html center position={position} zIndexRange={[12, 0]}>
      <span
        className={`whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-bold sm:text-xs ${crystalOverlayBadgeToneClasses[tone]}`}
      >
        {label}
      </span>
    </Html>
  );
}

function FocusLabel({ label, position }: { label: string; position: Vec3 }) {
  return (
    <Html center position={position} zIndexRange={[13, 0]}>
      <span className={htmlOverlayLabelClass}>{label}</span>
    </Html>
  );
}

function AtomLegend() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs">
      <LegendItem color={ZN_COLOR} label="Zn" />
      <LegendItem color={S_COLOR} label="S" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span
        className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function getVoidStageBadge(stage: CrystalVoidStage) {
  if (stage === "framework") return "只看 S 骨架";
  if (stage === "voids") return "N 个 S → 2N 个四面体空隙";
  return "Zn 占 N 个｜恰好 1/2";
}

function getCameraPreset(viewMode: CrystalViewMode): {
  position: Vec3;
  fov: number;
  scale: number;
} {
  if (viewMode === "comparison" || viewMode === "counting") {
    return { position: [0, 3.25, 7.3], fov: 38, scale: 1.08 };
  }
  if (viewMode === "polyhedron") {
    return { position: [3.7, 2.8, 4.5], fov: 38, scale: 1.35 };
  }
  return { position: [4.7, 3.45, 5.7], fov: 39, scale: 1.08 };
}

function getDisplaySummary(viewMode: CrystalViewMode, fallback: string) {
  if (viewMode === "comparison") {
    return "不同：闪锌矿为 ABCABC，纤锌矿为 ABAB；共同：Zn 和 S 都是 4 配位。";
  }
  if (viewMode === "counting") {
    return "闪锌矿：S = 8×1/8 + 6×1/2 = 4，Zn = 4；纤锌矿：2 Zn + 2 S。两者均化简为 ZnS。";
  }
  return fallback;
}
