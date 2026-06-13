import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { type ReactNode, useMemo, useRef } from "react";
import { Group, Quaternion, Vector3 } from "three";
import type {
  Atom,
  Bond,
  CrystalViewMode,
  InterlayerForce,
  MoleculeRecord,
} from "@/types/molecule";

type GraphiteCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  showLabels: boolean;
  loading?: boolean;
};

const focusAtomIds = new Set(["c-a1-1", "c-a1-2", "c-a1-6", "c-a2-1"]);
const focusBondIds = new Set(["a1-1-2", "a1-6-1", "a-1-a2-1"]);

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
  showLabels,
  loading = false,
}: GraphiteCellProps) {
  const atomsById = useMemo(
    () => new Map(molecule.atoms.map((atom) => [atom.id, atom])),
    [molecule.atoms],
  );
  const upperAtoms = useMemo(
    () => molecule.atoms.filter((atom) => atom.id.startsWith("c-a")),
    [molecule.atoms],
  );
  const lowerAtoms = useMemo(
    () => molecule.atoms.filter((atom) => atom.id.startsWith("c-b")),
    [molecule.atoms],
  );
  const upperBonds = useMemo(
    () => molecule.bonds.filter((bond) => bond.atomIds.every((atomId) => atomId.startsWith("c-a"))),
    [molecule.bonds],
  );
  const lowerBonds = useMemo(
    () => molecule.bonds.filter((bond) => bond.atomIds.every((atomId) => atomId.startsWith("c-b"))),
    [molecule.bonds],
  );
  const interlayerForces =
    molecule.interlayerForces && molecule.interlayerForces.length > 0
      ? molecule.interlayerForces
      : defaultGraphiteInterlayerForces;

  const cameraPosition = molecule.rendering?.cameraPosition ?? [3.2, 2.35, 3.7];
  const cameraFov = molecule.rendering?.cameraFov ?? 39;
  const activeMode = molecule.crystalTeaching?.viewModes.find((mode) => mode.id === viewMode);
  const showLayerPlanes = viewMode === "layer" || viewMode === "comparison" || viewMode === "interlayerForce";
  const showInterlayer = viewMode === "interlayerForce";
  const showPiCloud = viewMode === "piElectron";

  return (
    <section className="flex h-full min-h-[500px] flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-white/80 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">3D 晶体 Viewer</h2>
          <p className="text-sm text-text-secondary">拖拽旋转，滚轮或触控板缩放</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-primary-dark">
          {activeMode?.labelZh ?? "层状结构"} · {molecule.formula}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-[radial-gradient(circle_at_center,#ffffff_0%,#f7faf9_58%,#e8f3f0_100%)]">
        {loading ? (
          <div className="motion-skeleton absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-white/60" />
        ) : null}
        <Canvas camera={{ position: cameraPosition, fov: cameraFov }} shadows>
          <ambientLight intensity={0.74} />
          <directionalLight position={[4, 5, 4]} intensity={1.36} castShadow />
          <directionalLight position={[-3, 2, -4]} intensity={0.42} />
          <group position={[-0.08, 0.05, 0]} rotation={[0.18, -0.46, 0]} scale={1.42}>
            {showLayerPlanes ? <LayerPlane y={0.28} tone="upper" /> : null}
            {showLayerPlanes ? <LayerPlane y={-0.46} tone="lower" /> : null}
            {showPiCloud ? <PiElectronCloud /> : null}
            {showInterlayer ? (
              <InterlayerForceBand
                forces={interlayerForces}
                lowerAtoms={lowerAtoms}
                upperAtoms={upperAtoms}
              />
            ) : null}

            <AnimatedUpperLayer active={viewMode === "interlayerForce"}>
              <CarbonLayer
                atoms={upperAtoms}
                atomsById={atomsById}
                bonds={upperBonds}
                layer="upper"
                showLabels={showLabels}
                viewMode={viewMode}
              />
            </AnimatedUpperLayer>
            <CarbonLayer
              atoms={lowerAtoms}
              atomsById={atomsById}
              bonds={lowerBonds}
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

        <GraphiteLegend />
      </div>
    </section>
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

function CarbonLayer({
  atoms,
  atomsById,
  bonds,
  layer,
  showLabels,
  viewMode,
}: {
  atoms: Atom[];
  atomsById: Map<string, Atom>;
  bonds: Bond[];
  layer: "upper" | "lower";
  showLabels: boolean;
  viewMode: CrystalViewMode;
}) {
  return (
    <>
      {bonds.map((bond) => (
        <CarbonBond
          atomsById={atomsById}
          bond={bond}
          key={bond.id}
          layer={layer}
          viewMode={viewMode}
        />
      ))}
      {atoms.map((atom) => (
        <CarbonAtom
          atom={atom}
          key={atom.id}
          layer={layer}
          showLabel={showLabels}
          viewMode={viewMode}
        />
      ))}
    </>
  );
}

type CarbonAtomProps = {
  atom: Atom;
  layer: "upper" | "lower";
  viewMode: CrystalViewMode;
  showLabel: boolean;
};

function CarbonAtom({ atom, layer, viewMode, showLabel }: CarbonAtomProps) {
  const radius = atom.radius ?? 0.075;
  const isFocusMode = viewMode === "inPlaneBond";
  const isFocusAtom = focusAtomIds.has(atom.id);
  const isCenterAtom = atom.id === "c-a1-1";
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
  const shouldShowLabel =
    showLabel &&
    (isCenterAtom ||
      atom.id === "c-a1-2" ||
      atom.id === "c-a1-6" ||
      atom.id === "c-a2-1" ||
      atom.id === "c-b1-1" ||
      viewMode === "inPlaneBond");
  const labelText = isCenterAtom
    ? "中心 C · sp²"
    : isFocusAtom
      ? "相邻 C"
      : layer === "upper"
        ? "C · 上层"
        : "C · 下层";

  return (
    <group position={atom.position}>
      <mesh castShadow>
        <sphereGeometry args={[radius * scale, 32, 32]} />
        <meshStandardMaterial
          color={atom.color}
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
        <Html center distanceFactor={7.2} position={[0, radius + 0.08, 0]}>
          <span className="whitespace-nowrap rounded-md border border-border bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-text-primary shadow-sm sm:text-xs">
            {labelText}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

type CarbonBondProps = {
  atomsById: Map<string, Atom>;
  bond: Bond;
  layer: "upper" | "lower";
  viewMode: CrystalViewMode;
};

function CarbonBond({ atomsById, bond, layer, viewMode }: CarbonBondProps) {
  const startAtom = atomsById.get(bond.atomIds[0]);
  const endAtom = atomsById.get(bond.atomIds[1]);

  if (!startAtom || !endAtom) return null;

  const isFocusMode = viewMode === "inPlaneBond";
  const isFocusBond = focusBondIds.has(bond.id);
  const isLower = layer === "lower";
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
  const color = isFocusMode && isFocusBond ? "#2A9D8F" : "#4B5563";
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

function LayerPlane({ y, tone }: { y: number; tone: "upper" | "lower" }) {
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
    const averageY = (atoms: Atom[]) =>
      atoms.reduce((sum, atom) => sum + atom.position[1], 0) / Math.max(atoms.length, 1);
    return (averageY(upperAtoms) + averageY(lowerAtoms)) / 2;
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
      <mesh position={[0.12, 0.39, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.35, 1.72]} />
        <meshBasicMaterial color="#2A9D8F" depthWrite={false} opacity={0.11} transparent />
      </mesh>
      <mesh position={[0.12, 0.18, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.15, 1.54]} />
        <meshBasicMaterial color="#F4A261" depthWrite={false} opacity={0.045} transparent />
      </mesh>
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

function GraphiteLegend() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-2xl border border-border/70 bg-white/88 px-3 py-3 text-xs text-text-secondary shadow-sm backdrop-blur-md">
      <p className="mb-2 font-semibold text-text-primary">图例</p>
      <div className="space-y-1.5">
        <LegendItem marker={<span className="h-3 w-3 rounded-full bg-[#374151]" />} label="C 原子" />
        <LegendItem marker={<span className="h-0.5 w-5 rounded-full bg-[#4B5563]" />} label="层内 C-C 共价键" />
        <LegendItem
          marker={<span className="h-0.5 w-5 border-t border-dashed border-[#64748B]" />}
          label="蓝灰虚线带：层间范德华力示意"
        />
        <LegendItem marker={<span className="h-3 w-5 rounded-full bg-primary/20 ring-1 ring-primary/30" />} label="π 电子云" />
      </div>
    </div>
  );
}

function LegendItem({ marker, label }: { marker: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
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
      <meshBasicMaterial color={color} depthWrite={depthWrite} opacity={opacity} transparent />
    </mesh>
  );
}
