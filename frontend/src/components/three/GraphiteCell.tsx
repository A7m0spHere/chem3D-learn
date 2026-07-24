import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { type ReactNode, useMemo, useRef } from "react";
import { Group, Vector3 } from "three";
import { StickCylinder } from "@/components/three/StickCylinder";
import { SceneLighting } from "@/components/three/SceneLighting";
import { htmlOverlayCompactLabelClass } from "@/components/three/htmlOverlayStyles";
import { PiCloudBand } from "@/components/three/OrbitalPrimitives";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import type {
  Atom,
  Bond,
  CrystalModelStyle,
  CrystalViewMode,
  InterlayerForce,
  MoleculeRecord,
} from "@/types/molecule";

type GraphiteCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  modelStyle: CrystalModelStyle;
  showLabels: boolean;
  loading?: boolean;
};

type Layer = "upper" | "lower";

type FocusState = {
  atomIds: Set<string>;
  bondIds: Set<string>;
  centerAtomId?: string;
};

const defaultGraphiteInterlayerForces: InterlayerForce[] = [
  {
    id: "default-vdw-1",
    start: [-1.18, 0, -0.48],
    end: [1.16, 0, -0.36],
    kind: "vanDerWaals",
    labelZh: "层间范德华力",
  },
  {
    id: "default-vdw-2",
    start: [-1.0, 0, 0.02],
    end: [1.32, 0, 0.14],
    kind: "vanDerWaals",
    labelZh: "层间范德华力",
  },
  {
    id: "default-vdw-3",
    start: [-0.82, 0, 0.52],
    end: [1.0, 0, 0.62],
    kind: "vanDerWaals",
    labelZh: "层间范德华力",
  },
];

export function GraphiteCell({
  molecule,
  viewMode,
  modelStyle: _modelStyle,
  showLabels,
  loading = false,
}: GraphiteCellProps) {
  const atomsById = useMemo(
    () => new Map(molecule.atoms.map((atom) => [atom.id, atom])),
    [molecule.atoms],
  );
  const upperAtoms = useMemo(
    () => molecule.atoms.filter((atom) => getAtomLayer(atom.id) === "upper"),
    [molecule.atoms],
  );
  const lowerAtoms = useMemo(
    () => molecule.atoms.filter((atom) => getAtomLayer(atom.id) === "lower"),
    [molecule.atoms],
  );
  const upperBonds = useMemo(
    () => molecule.bonds.filter((bond) => bond.atomIds.every((atomId) => getAtomLayer(atomId) === "upper")),
    [molecule.bonds],
  );
  const lowerBonds = useMemo(
    () => molecule.bonds.filter((bond) => bond.atomIds.every((atomId) => getAtomLayer(atomId) === "lower")),
    [molecule.bonds],
  );
  const focusState = useMemo(
    () => createFocusState(upperAtoms, upperBonds),
    [upperAtoms, upperBonds],
  );
  const interlayerForces =
    molecule.interlayerForces && molecule.interlayerForces.length > 0
      ? molecule.interlayerForces
      : defaultGraphiteInterlayerForces;

  const cameraPosition = molecule.rendering?.cameraPosition ?? [3.2, 2.35, 3.7];
  const cameraFov = molecule.rendering?.cameraFov ?? 39;
  const activeMode = molecule.crystalTeaching?.viewModes.find((mode) => mode.id === viewMode);
  const hasPiElectronMode = Boolean(molecule.crystalTeaching?.viewModes.some((mode) => mode.id === "piElectron"));
  const showLayerPlanes = viewMode === "layer" || viewMode === "comparison" || viewMode === "interlayerForce";
  const showInterlayer = viewMode === "interlayerForce";
  const showPiCloud = viewMode === "piElectron";
  const upperLayerY = averageAtomY(upperAtoms, 0.28);
  const lowerLayerY = averageAtomY(lowerAtoms, -0.46);

  return (
    <ThreeViewerFrame
      footerMeta={<LayeredHexLegend molecule={molecule} showPiCloudLegend={hasPiElectronMode} />}
      loading={loading}
      meta="拖拽旋转 · 标签可按需开启"
      stageTestId={`${molecule.id}-canvas`}
      summary={activeMode?.bodyZh ?? molecule.summaryZh}
      title={`${molecule.formula}｜${activeMode?.titleZh ?? "平行层状结构"}`}
      viewerTestId={`${molecule.id}-viewer`}
    >
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
        frameloop={showInterlayer || showPiCloud ? "always" : "demand"}
        gl={{ alpha: false }}
        style={{ height: "100%", width: "100%" }}
      >
        <color attach="background" args={["#F7FAF9"]} />
        <SceneLighting ambient={0.74} mainIntensity={1.36} mainPosition={[4, 5, 4]} secondaryIntensity={0.42} secondaryPosition={[-3, 2, -4]} />
        <group position={[-0.08, 0.28, 0]} rotation={[0.18, -0.46, 0]} scale={1.15}>
          {showLayerPlanes ? <LayerPlane y={upperLayerY} tone="upper" /> : null}
          {showLayerPlanes ? <LayerPlane y={lowerLayerY} tone="lower" /> : null}
          {showPiCloud ? <PiElectronCloud /> : null}
          {showInterlayer ? (
            <InterlayerForceBand
              forces={interlayerForces}
              lowerAtoms={lowerAtoms}
              upperAtoms={upperAtoms}
            />
          ) : null}

          <AnimatedUpperLayer active={viewMode === "interlayerForce"}>
            <LayeredHexLayer
              atoms={upperAtoms}
              atomsById={atomsById}
              bonds={upperBonds}
              focusState={focusState}
              layer="upper"
              showLabels={showLabels}
              viewMode={viewMode}
            />
          </AnimatedUpperLayer>
          <LayeredHexLayer
            atoms={lowerAtoms}
            atomsById={atomsById}
            bonds={lowerBonds}
            focusState={focusState}
            layer="lower"
            showLabels={showLabels}
            viewMode={viewMode}
          />
        </group>
        <OrbitControls
          enableDamping
          enablePan={false}
          maxDistance={6.2}
          minDistance={1.9}
          target={[0, -0.02, 0]}
        />
      </Canvas>
    </ThreeViewerFrame>
  );
}

function AnimatedUpperLayer({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    groupRef.current.position.x = active ? Math.sin(clock.elapsedTime * 1.35) * 0.045 : 0;
    groupRef.current.position.z = active ? Math.sin(clock.elapsedTime * 1.1) * 0.016 : 0;
  });

  return <group ref={groupRef}>{children}</group>;
}

function LayeredHexLayer({
  atoms,
  atomsById,
  bonds,
  focusState,
  layer,
  showLabels,
  viewMode,
}: {
  atoms: Atom[];
  atomsById: Map<string, Atom>;
  bonds: Bond[];
  focusState: FocusState;
  layer: Layer;
  showLabels: boolean;
  viewMode: CrystalViewMode;
}) {
  return (
    <>
      {bonds.map((bond) => (
        <LayeredHexBond
          atomsById={atomsById}
          bond={bond}
          focusState={focusState}
          key={bond.id}
          layer={layer}
          viewMode={viewMode}
        />
      ))}
      {atoms.map((atom) => (
        <LayeredHexAtom
          atom={atom}
          focusState={focusState}
          key={atom.id}
          layer={layer}
          showLabel={showLabels}
          viewMode={viewMode}
        />
      ))}
    </>
  );
}

type LayeredHexAtomProps = {
  atom: Atom;
  focusState: FocusState;
  layer: Layer;
  viewMode: CrystalViewMode;
  showLabel: boolean;
};

function LayeredHexAtom({ atom, focusState, layer, viewMode, showLabel }: LayeredHexAtomProps) {
  const radius = atom.radius ?? 0.075;
  const atomColor = atom.color ?? getFallbackAtomColor(atom.element);
  const elementText = getElementText(atom);
  const isFocusMode = viewMode === "inPlaneBond";
  const isFocusAtom = focusState.atomIds.has(atom.id);
  const isCenterAtom = focusState.centerAtomId === atom.id;
  const isLower = layer === "lower";
  const scale = isFocusMode
    ? isCenterAtom
      ? 1.38
      : isFocusAtom
        ? 1.2
        : isLower
          ? 0.86
          : 0.94
    : viewMode === "piElectron" && layer === "upper"
      ? 1.04
      : 1;
  const opacity = isFocusMode
    ? isLower
      ? 0.16
      : isFocusAtom
        ? 1
        : 0.38
    : viewMode === "interlayerForce"
      ? isLower
        ? 0.72
        : 0.86
      : 1;
  const emissive = isFocusMode && isFocusAtom
    ? isCenterAtom
      ? "#F4A261"
      : "#2A9D8F"
    : viewMode === "piElectron" && layer === "upper"
      ? "#2A9D8F"
      : "#000000";
  const emissiveIntensity = isFocusMode && isFocusAtom ? 0.24 : viewMode === "piElectron" && layer === "upper" ? 0.1 : 0;
  const shouldShowLabel = showLabel && (isCenterAtom || isFocusAtom || viewMode === "inPlaneBond");
  const labelText = isCenterAtom
    ? `中心 ${elementText} · sp²`
    : isFocusAtom
      ? `相邻 ${elementText}`
      : `${elementText} · ${layer === "upper" ? "上层" : "下层"}`;

  return (
    <group position={atom.position}>
      <mesh scale={scale}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={atomColor}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          metalness={0.08}
          opacity={opacity}
          roughness={0.28}
          transparent={opacity < 1}
        />
      </mesh>
      {isFocusMode && isFocusAtom ? (
        <mesh>
          <sphereGeometry args={[radius * (isCenterAtom ? 1.9 : 1.55), 32, 32]} />
          <meshBasicMaterial color={isCenterAtom ? "#F4A261" : "#2A9D8F"} opacity={0.16} transparent />
        </mesh>
      ) : null}
      {shouldShowLabel ? (
        <Html center distanceFactor={7.2} pointerEvents="none" position={[0, radius + 0.08, 0]}>
          <span className={htmlOverlayCompactLabelClass}>
            {labelText}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

type LayeredHexBondProps = {
  atomsById: Map<string, Atom>;
  bond: Bond;
  focusState: FocusState;
  layer: Layer;
  viewMode: CrystalViewMode;
};

function LayeredHexBond({ atomsById, bond, focusState, layer, viewMode }: LayeredHexBondProps) {
  const startAtom = atomsById.get(bond.atomIds[0]);
  const endAtom = atomsById.get(bond.atomIds[1]);

  if (!startAtom || !endAtom) return null;

  const isFocusMode = viewMode === "inPlaneBond";
  const isFocusBond = focusState.bondIds.has(bond.id);
  const isLower = layer === "lower";
  const baseColor = startAtom.element === endAtom.element ? "#4B5563" : "#64748B";
  const opacity = isFocusMode
    ? isFocusBond
      ? 0.96
      : isLower
        ? 0.12
        : 0.32
    : viewMode === "interlayerForce"
      ? 0.26
      : viewMode === "comparison" && isLower
        ? 0.5
        : 0.72;
  const color = isFocusMode && isFocusBond ? "#2A9D8F" : baseColor;
  const radius = isFocusMode && isFocusBond ? 0.013 : viewMode === "interlayerForce" ? 0.0045 : 0.007;

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

function LayerPlane({ y, tone }: { y: number; tone: Layer }) {
  return (
    <mesh position={[0.12, y - 0.012, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[3.35, 1.72]} />
      <meshBasicMaterial
        color={tone === "upper" ? "#2A9D8F" : "#64748B"}
        depthWrite={false}
        opacity={tone === "upper" ? 0.055 : 0.045}
        transparent
      />
    </mesh>
  );
}

function InterlayerForceBand({
  forces,
  lowerAtoms,
  upperAtoms,
}: {
  forces: InterlayerForce[];
  lowerAtoms: Atom[];
  upperAtoms: Atom[];
}) {
  const interlayerY = useMemo(() => {
    return (averageAtomY(upperAtoms, 0.28) + averageAtomY(lowerAtoms, -0.46)) / 2;
  }, [lowerAtoms, upperAtoms]);

  return (
    <>
      {forces.map((force) => (
        <DashedCylinder
          color="#64748B"
          dashLength={0.22}
          depthWrite={false}
          end={[force.end[0], interlayerY, force.end[2]]}
          gap={0.14}
          key={force.id}
          opacity={0.34}
          radius={0.014}
          start={[force.start[0], interlayerY, force.start[2]]}
        />
      ))}
    </>
  );
}

function PiElectronCloud() {
  return (
    <>
      <PiCloudBand
        cloudStyle="layer"
        center={[0.12, 0.39, 0.04]}
        length={1.66}
        opacity={0.13}
        orientation="xz"
        seed={601}
        thickness={0.08}
        tone="warm"
        waist={0.04}
        width={0.86}
      />
      <PiCloudBand
        cloudStyle="layer"
        center={[0.12, 0.2, 0.04]}
        length={1.48}
        opacity={0.06}
        orientation="xz"
        seed={607}
        thickness={0.06}
        tone="warm"
        waist={0.02}
        width={0.76}
      />
      <PiElectronParticle offset={0} />
      <PiElectronParticle offset={1.7} />
      <PiElectronParticle offset={3.4} />
      <PiElectronParticle offset={5.1} />
    </>
  );
}

function PiElectronParticle({ offset }: { offset: number }) {
  const particleRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!particleRef.current) return;

    const t = clock.elapsedTime * 0.7 + offset;
    particleRef.current.position.x = Math.cos(t) * 1.25 + 0.12;
    particleRef.current.position.y = 0.44 + Math.sin(t * 1.6) * 0.025;
    particleRef.current.position.z = Math.sin(t) * 0.58 + 0.04;
  });

  return (
    <group ref={particleRef}>
      <mesh>
        <sphereGeometry args={[0.027, 18, 18]} />
        <meshBasicMaterial color="#F4A261" opacity={0.76} transparent />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.06, 18, 18]} />
        <meshBasicMaterial color="#2A9D8F" opacity={0.12} transparent />
      </mesh>
    </group>
  );
}

function LayeredHexLegend({
  molecule,
  showPiCloudLegend,
}: {
  molecule: MoleculeRecord;
  showPiCloudLegend: boolean;
}) {
  const atomLegendItems = getDistinctLegendAtoms(molecule.atoms);
  const bondLabel = buildBondLegendLabel(atomLegendItems);

  return (
    <div className="pointer-events-none hidden items-center gap-3 text-[11px] text-text-secondary xl:flex">
      <span className="font-semibold text-text-primary">图例</span>
      <div className="flex items-center gap-3">
        {atomLegendItems.map((atom) => (
          <LegendItem
            key={atom.element}
            marker={
              <span
                className="h-3 w-3 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: atom.color ?? getFallbackAtomColor(atom.element) }}
              />
            }
            label={`${getElementText(atom)} 原子`}
          />
        ))}
        <LegendItem marker={<span className="h-0.5 w-5 rounded-full bg-[#4B5563]" />} label={bondLabel} />
        <LegendItem
          marker={<span className="h-0.5 w-5 border-t border-dashed border-[#64748B]" />}
          label="蓝灰虚线带：层间弱相互作用示意"
        />
        {showPiCloudLegend ? (
          <LegendItem marker={<span className="h-3 w-5 rounded-full bg-primary/20 ring-1 ring-primary/30" />} label="π 电子云" />
        ) : null}
      </div>
    </div>
  );
}

function LegendItem({ marker, label }: { marker: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex h-4 w-6 items-center justify-center">{marker}</span>
      <span>{label}</span>
    </div>
  );
}

function DashedCylinder({
  start,
  end,
  color,
  dashLength = 0.16,
  depthWrite = true,
  gap = 0.1,
  opacity,
  radius,
}: StaticCylinderProps) {
  const dashes = useMemo(() => {
    const startVector = new Vector3(...start);
    const endVector = new Vector3(...end);
    const direction = new Vector3().subVectors(endVector, startVector);
    const totalLength = direction.length();
    const unitDirection = direction.clone().normalize();
    const points: Array<[[number, number, number], [number, number, number]]> = [];

    for (let distance = 0; distance < totalLength; distance += dashLength + gap) {
      const dashStart = startVector.clone().addScaledVector(unitDirection, distance);
      const dashEnd = startVector
        .clone()
        .addScaledVector(unitDirection, Math.min(distance + dashLength, totalLength));
      points.push([dashStart.toArray(), dashEnd.toArray()]);
    }

    return points;
  }, [dashLength, end, gap, start]);

  return (
    <>
      {dashes.map(([dashStart, dashEnd], index) => (
        <StaticCylinder
          color={color}
          depthWrite={depthWrite}
          end={dashEnd}
          key={`${dashStart.join(",")}-${index}`}
          opacity={opacity}
          radius={radius}
          start={dashStart}
        />
      ))}
    </>
  );
}

type StaticCylinderProps = {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  dashLength?: number;
  depthWrite?: boolean;
  gap?: number;
  opacity: number;
  radius: number;
};

function StaticCylinder({
  start,
  end,
  color,
  depthWrite = true,
  opacity,
  radius,
}: StaticCylinderProps) {
  return (
    <StickCylinder color={color} depthWrite={depthWrite} end={end} opacity={opacity} radius={radius} start={start} />
  );
}

function getAtomLayer(atomId: string): Layer | null {
  if (/-a\d+-/.test(atomId)) return "upper";
  if (/-b\d+-/.test(atomId)) return "lower";
  return null;
}

function createFocusState(upperAtoms: Atom[], upperBonds: Bond[]): FocusState {
  const centerAtom = upperAtoms.find((atom) => atom.id.endsWith("-a1-1")) ?? upperAtoms[0];
  const atomIds = new Set<string>();
  const bondIds = new Set<string>();

  if (!centerAtom) {
    return { atomIds, bondIds };
  }

  atomIds.add(centerAtom.id);
  upperBonds
    .filter((bond) => bond.atomIds.includes(centerAtom.id))
    .slice(0, 3)
    .forEach((bond) => {
      bondIds.add(bond.id);
      bond.atomIds.forEach((atomId) => atomIds.add(atomId));
    });

  return {
    atomIds,
    bondIds,
    centerAtomId: centerAtom.id,
  };
}

function averageAtomY(atoms: Atom[], fallback: number) {
  if (atoms.length === 0) return fallback;
  return atoms.reduce((sum, atom) => sum + atom.position[1], 0) / atoms.length;
}

function getElementText(atom: Atom) {
  return atom.label || atom.element;
}

function getFallbackAtomColor(element: string) {
  if (element === "B") return "#F4A261";
  if (element === "N") return "#2563EB";
  if (element === "C") return "#374151";
  return "#64748B";
}

function getDistinctLegendAtoms(atoms: Atom[]) {
  const seen = new Set<string>();
  const legendAtoms: Atom[] = [];

  atoms.forEach((atom) => {
    if (seen.has(atom.element)) return;
    seen.add(atom.element);
    legendAtoms.push(atom);
  });

  return legendAtoms;
}

function buildBondLegendLabel(atoms: Atom[]) {
  const elementTexts = atoms.map(getElementText);

  if (elementTexts.length === 0) return "层内共价键";
  if (elementTexts.length === 1) return `层内 ${elementTexts[0]}-${elementTexts[0]} 共价键`;
  return `层内 ${elementTexts.join("-")} 共价键`;
}
