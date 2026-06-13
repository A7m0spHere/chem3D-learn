import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import type { Atom, CoordinationLink, CrystalViewMode, MoleculeRecord } from "@/types/molecule";

type ZincMetalCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  showLabels: boolean;
  loading?: boolean;
};

const sameLayerOrder = [
  "zn-same-1",
  "zn-same-2",
  "zn-same-3",
  "zn-same-4",
  "zn-same-5",
  "zn-same-6",
];

const electronPoints: [number, number, number][] = [
  [-0.44, -0.18, -0.16],
  [-0.18, 0.3, 0.1],
  [0.2, -0.24, 0.28],
  [0.42, 0.08, -0.2],
  [-0.5, 0.36, 0.0],
  [0.5, -0.36, 0.06],
  [0.02, 0.4, -0.38],
  [-0.08, -0.42, -0.32],
  [0.24, 0.3, 0.34],
  [-0.3, -0.32, 0.32],
  [0.46, 0.28, -0.02],
  [-0.38, 0.02, -0.34],
];

export function ZincMetalCell({
  molecule,
  viewMode,
  showLabels,
  loading = false,
}: ZincMetalCellProps) {
  const atomsById = useMemo(
    () => new Map(molecule.atoms.map((atom) => [atom.id, atom])),
    [molecule.atoms],
  );
  const cameraPosition = molecule.rendering?.cameraPosition ?? [3.1, 2.35, 3.6];
  const cameraFov = molecule.rendering?.cameraFov ?? 42;
  const activeMode = molecule.crystalTeaching?.viewModes.find((mode) => mode.id === viewMode);
  const showCoordinationLinks = viewMode === "coordination" || viewMode === "counting";
  const showMetallicBondHint = viewMode === "metallicBond";

  return (
    <section className="flex h-full min-h-[500px] flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-white/80 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">3D 晶体 Viewer</h2>
          <p className="text-sm text-text-secondary">拖拽旋转，滚轮或触控板缩放</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-primary-dark">
          {activeMode?.labelZh ?? "堆积"} · {molecule.formula}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-[radial-gradient(circle_at_center,#ffffff_0%,#f7faf9_58%,#e8f3f0_100%)]">
        {loading ? (
          <div className="motion-skeleton absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-white/60" />
        ) : null}
        <Canvas camera={{ position: cameraPosition, fov: cameraFov }} shadows>
          <ambientLight intensity={0.72} />
          <directionalLight position={[4, 5, 4]} intensity={1.35} castShadow />
          <directionalLight position={[-3, 2, -4]} intensity={0.42} />
          <group position={[0, -0.04, 0]} rotation={[0.16, -0.48, 0]} scale={1.78}>
            <LayerGuides atomsById={atomsById} muted={viewMode === "metallicBond"} />
            {showMetallicBondHint ? <MetallicBondHint /> : null}
            {showCoordinationLinks
              ? (molecule.coordinationLinks ?? []).map((link) => (
                  <CoordinationGuide
                    atomsById={atomsById}
                    key={link.id}
                    link={link}
                    viewMode={viewMode}
                  />
                ))
              : null}
            {molecule.atoms.map((atom) => (
              <ZincAtom
                atom={atom}
                key={atom.id}
                showLabel={showLabels}
                viewMode={viewMode}
              />
            ))}
            {viewMode === "counting" ? <CountingLabels /> : null}
          </group>
          <OrbitControls
            enableDamping
            enablePan={false}
            maxDistance={6}
            minDistance={1.8}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
    </section>
  );
}

function LayerGuides({
  atomsById,
  muted = false,
}: {
  atomsById: Map<string, Atom>;
  muted?: boolean;
}) {
  return (
    <>
      {sameLayerOrder.map((atomId, index) => {
        const startAtom = atomsById.get(atomId);
        const endAtom = atomsById.get(sameLayerOrder[(index + 1) % sameLayerOrder.length]);

        if (!startAtom || !endAtom) return null;

        return (
          <StaticCylinder
            color={muted ? "#A8B8B4" : "#7A8F8A"}
            end={endAtom.position}
            key={`${atomId}-ring`}
            opacity={muted ? 0.28 : 0.48}
            radius={0.005}
            start={startAtom.position}
          />
        );
      })}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 72]} />
        <meshBasicMaterial color="#2A9D8F" opacity={muted ? 0.04 : 0.07} transparent />
      </mesh>
    </>
  );
}

type ZincAtomProps = {
  atom: Atom;
  viewMode: CrystalViewMode;
  showLabel: boolean;
};

function ZincAtom({ atom, viewMode, showLabel }: ZincAtomProps) {
  const isCenter = atom.id === "zn-center";
  const isSameLayer = atom.id.startsWith("zn-same");
  const isUpper = atom.id.startsWith("zn-upper");
  const isLower = atom.id.startsWith("zn-lower");
  const isCountingMode = viewMode === "counting";
  const isCoordinationMode = viewMode === "coordination";
  const radius = atom.radius ?? 0.12;
  const scale = isCenter ? 1.22 : isCoordinationMode || isCountingMode ? 1.07 : 1;
  const emissive = isCenter
    ? "#2A9D8F"
    : isCountingMode && isSameLayer
      ? "#F4A261"
      : isCountingMode && isUpper
        ? "#B45309"
        : isCountingMode && isLower
          ? "#0F766E"
          : "#000000";
  const emissiveIntensity = isCenter ? 0.22 : isCountingMode ? 0.16 : 0;
  const opacity = viewMode === "metallicBond" && !isCenter ? 0.74 : 1;
  const shouldShowLabel =
    showLabel &&
    (isCenter ||
      atom.id === "zn-same-1" ||
      atom.id === "zn-upper-1" ||
      atom.id === "zn-lower-1" ||
      isCoordinationMode);
  const labelText = isCenter
    ? "Zn · 中心"
    : isSameLayer
      ? "同层 Zn"
      : isUpper
        ? "上层 Zn"
        : isLower
          ? "下层 Zn"
          : "Zn";

  return (
    <group position={atom.position}>
      <mesh castShadow>
        <sphereGeometry args={[radius * scale, 32, 32]} />
        <meshStandardMaterial
          color={atom.color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          metalness={0.46}
          opacity={opacity}
          roughness={0.26}
          transparent={opacity < 1}
        />
      </mesh>
      {isCountingMode ? (
        <mesh>
          <sphereGeometry args={[radius * (isCenter ? 1.62 : 1.38), 32, 32]} />
          <meshBasicMaterial color={emissive} opacity={isCenter ? 0.22 : 0.12} transparent />
        </mesh>
      ) : null}
      {shouldShowLabel ? (
        <Html center distanceFactor={6.8} position={[0, radius + 0.1, 0]}>
          <span className="whitespace-nowrap rounded-md border border-border bg-white/90 px-1.5 py-0.5 text-xs font-semibold text-text-primary shadow-sm">
            {labelText}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

function CountingLabels() {
  return (
    <>
      <LayerBadge label="同层 6" position={[1.04, 0.08, 0]} tone="same" />
      <LayerBadge label="上层 3" position={[0.16, 0.92, 0.24]} tone="upper" />
      <LayerBadge label="下层 3" position={[0.16, -0.92, -0.24]} tone="lower" />
      <LayerBadge label="配位数 12" position={[0, 0.24, 0]} tone="center" />
    </>
  );
}

function LayerBadge({
  label,
  position,
  tone,
}: {
  label: string;
  position: [number, number, number];
  tone: "same" | "upper" | "lower" | "center";
}) {
  const toneClass =
    tone === "center"
      ? "border-primary/40 bg-primary/90 text-white"
      : tone === "upper"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : tone === "lower"
          ? "border-teal-200 bg-teal-50 text-teal-900"
          : "border-orange-200 bg-orange-50 text-orange-900";

  return (
    <Html center distanceFactor={7.2} position={position}>
      <span className={`whitespace-nowrap rounded-full border px-2 py-1 text-xs font-bold shadow-sm ${toneClass}`}>
        {label}
      </span>
    </Html>
  );
}

function MetallicBondHint() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[1.05, 48, 48]} />
        <meshBasicMaterial color="#F4DFA6" opacity={0.1} transparent />
      </mesh>
      {electronPoints.map((position, index) => (
        <mesh key={`${position.join(",")}-${index}`} position={position}>
          <sphereGeometry args={[0.018, 16, 16]} />
          <meshBasicMaterial color={index % 2 === 0 ? "#F4A261" : "#2A9D8F"} opacity={0.55} transparent />
        </mesh>
      ))}
    </>
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

  const isCounting = viewMode === "counting";
  const endId = link.atomIds[1];
  const color = endId.includes("upper")
    ? "#B45309"
    : endId.includes("lower")
      ? "#0F766E"
      : "#F4A261";

  return (
    <StaticCylinder
      color={isCounting ? color : "#8A7A4F"}
      end={endAtom.position}
      opacity={isCounting ? 0.42 : 0.34}
      radius={isCounting ? 0.005 : 0.004}
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
