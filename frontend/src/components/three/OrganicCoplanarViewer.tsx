import { Canvas } from "@react-three/fiber";
import { Html, Instance, Instances, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import { SceneLighting } from "@/components/three/SceneLighting";
import {
  htmlOverlaySubtleLabelClass,
  htmlOverlaySubtleWideLabelClass,
} from "@/components/three/htmlOverlayStyles";
import { LonePairOrbital as SharedLonePairOrbital } from "@/components/three/OrbitalPrimitives";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { AtomPullHandle } from "@/components/three/AtomPullHandle";
import { getOrganicCoplanarModeInfo } from "@/data/organicCoplanar";
import { usePullTransitionProgress } from "@/hooks/usePullTransitionProgress";
import { applyAtomPullOffset } from "@/lib/atomPullTransition";
import type { OrganicCoplanarMode } from "@/types/molecule";

type OrganicCoplanarViewerProps = {
  activeMode: OrganicCoplanarMode;
  loading?: boolean;
  showLabels: boolean;
  vinylAligned: boolean;
  onAtomPull?: (atomId: string) => void;
  pullingAtomId?: string;
};

type Vec3 = [number, number, number];
type FragmentKey = "ring" | "sp3" | "sp2" | "sp" | "amine" | "ringHydrogen";

type OrganicAtom = {
  id: string;
  element: "C" | "H" | "N";
  label: string;
  position: Vec3;
  radius: number;
  fragment: FragmentKey;
};

type OrganicBond = {
  id: string;
  atomIds: [string, string];
  order: 1 | 2 | 3;
  fragment: FragmentKey;
};

type SceneData = {
  atoms: OrganicAtom[];
  bonds: OrganicBond[];
  ringPositions: Vec3[];
  vinylAxisStart: Vec3;
  vinylAxisEnd: Vec3;
  vinylPlaneNormal: Vec3;
  vinylPlaneCenter: Vec3;
  ethynylLineStart: Vec3;
  ethynylLineEnd: Vec3;
  amineNPosition: Vec3;
  lonePairPosition: Vec3;
  lonePairDirection: Vec3;
  fragmentLabels: Array<{ label: string; position: Vec3; fragment: FragmentKey }>;
};

const ringRadius = 1.16;
const ringAngles = [0, 60, 120, 180, 240, 300].map((degree) => (degree * Math.PI) / 180);
const zAxis: Vec3 = [0, 0, 1];
const elementColors: Record<OrganicAtom["element"], string> = {
  C: "#1F2933",
  H: "#FFFFFF",
  N: "#2563EB",
};
const fragmentColors: Record<FragmentKey, string> = {
  ring: "#2A9D8F",
  ringHydrogen: "#2A9D8F",
  sp3: "#F4A261",
  sp2: "#3B82F6",
  sp: "#8B5CF6",
  amine: "#2563EB",
};

export function OrganicCoplanarViewer({
  activeMode,
  loading = false,
  showLabels,
  vinylAligned,
  onAtomPull,
  pullingAtomId,
}: OrganicCoplanarViewerProps) {
  const scene = useMemo(() => buildOrganicCoplanarScene(vinylAligned), [vinylAligned]);
  const pullProgress = usePullTransitionProgress(pullingAtomId);
  const displayAtoms = useMemo(
    () => applyAtomPullOffset(scene.atoms, pullingAtomId, pullProgress),
    [pullProgress, pullingAtomId, scene.atoms],
  );
  const atomsById = useMemo(
    () => new Map(displayAtoms.map((candidate) => [candidate.id, candidate])),
    [displayAtoms],
  );
  const modeInfo = getOrganicCoplanarModeInfo(activeMode);
  const alignmentMeta =
    activeMode === "rotation"
      ? vinylAligned
        ? "乙烯基已对齐"
        : "乙烯基保持默认夹角"
      : onAtomPull
        ? "拖动空白旋转 · 抓住原子进入拼装"
        : "拖拽旋转 · 滚轮或触控板缩放";

  return (
    <ThreeViewerFrame
      loading={loading}
      meta={alignmentMeta}
      stageTestId="organic-coplanar-canvas"
      summary={modeInfo.viewerSummary}
      title={modeInfo.viewerTitle}
      viewerTestId="organic-coplanar-viewer"
    >
        <Canvas
          camera={{ position: [0.2, 0.2, 5.8], fov: 42 }}
          frameloop="demand"
          gl={{ alpha: false }}
          style={{ height: "100%", width: "100%" }}
        >
          <color attach="background" args={["#F7FAF9"]} />
          <SceneLighting ambient={0.68} mainIntensity={1.32} mainPosition={[3.4, 4.5, 4.2]} secondaryIntensity={0.36} secondaryPosition={[-3, -2, 3]} />
          <group rotation={[-0.62, 0.06, -0.24]} scale={0.67}>
            <ReferenceGeometry
              activeMode={activeMode}
              scene={scene}
              vinylAligned={vinylAligned}
            />
            {scene.bonds.map((bond) => (
              <OrganicBondMesh
                atomsById={atomsById}
                bond={bond}
                isDimmed={shouldDimFragment(activeMode, bond.fragment, vinylAligned)}
                isFocused={isFocusedFragment(activeMode, bond.fragment, vinylAligned)}
                isPulling={Boolean(pullingAtomId && bond.atomIds.includes(pullingAtomId))}
                key={bond.id}
              />
            ))}
            {displayAtoms.map((atom) => (
              <OrganicAtomMesh
                atom={atom}
                isDimmed={shouldDimAtom(activeMode, atom, vinylAligned)}
                isFocused={isFocusedAtom(activeMode, atom, vinylAligned)}
                isPulling={pullingAtomId === atom.id}
                key={atom.id}
                onPullIntent={onAtomPull}
                showLabel={showLabels}
              />
            ))}
            {shouldShowLonePair(activeMode) ? (
              <LonePairOrbital
                direction={scene.lonePairDirection}
                nPosition={scene.amineNPosition}
              />
            ) : null}
            <ModeLabels activeMode={activeMode} scene={scene} showLabels={showLabels} />
          </group>
          <OrbitControls
            enabled={!pullingAtomId}
            enableDamping
            enablePan={false}
            maxDistance={8}
            minDistance={2.4}
            target={[0, 0, 0]}
          />
        </Canvas>
    </ThreeViewerFrame>
  );
}

function buildOrganicCoplanarScene(vinylAligned: boolean): SceneData {
  const ringPositions = ringAngles.map((angle): Vec3 => [
    ringRadius * Math.cos(angle),
    ringRadius * Math.sin(angle),
    0,
  ]);

  const atoms: OrganicAtom[] = ringPositions.map((position, index) => ({
    id: `ringC${index + 1}`,
    element: "C",
    label: `C${index + 1}`,
    position,
    radius: 0.17,
    fragment: "ring",
  }));

  const bonds: OrganicBond[] = ringPositions.map((_, index) => ({
    id: `ring-${index + 1}`,
    atomIds: [`ringC${index + 1}`, `ringC${((index + 1) % ringPositions.length) + 1}`],
    order: index % 2 === 0 ? 2 : 1,
    fragment: "ring",
  }));

  const addAtom = (atom: OrganicAtom) => atoms.push(atom);
  const addBond = (id: string, firstAtomId: string, secondAtomId: string, order: 1 | 2 | 3, fragment: FragmentKey) =>
    bonds.push({ id, atomIds: [firstAtomId, secondAtomId], order, fragment });
  const radial = (ringIndex: number): Vec3 => normalize(ringPositions[ringIndex]);
  const tangent = (direction: Vec3): Vec3 => normalize([-direction[1], direction[0], 0]);

  // ringC3 and ringC6 retain the two hydrogens in this four-substituted benzene.
  [2, 5].forEach((ringIndex) => {
    const direction = radial(ringIndex);
    const hPosition = add(ringPositions[ringIndex], scale(direction, 0.45));
    addAtom({
      id: `ringH${ringIndex + 1}`,
      element: "H",
      label: "H",
      position: hPosition,
      radius: 0.105,
      fragment: "ringHydrogen",
    });
    addBond(`ringC${ringIndex + 1}-H`, `ringC${ringIndex + 1}`, `ringH${ringIndex + 1}`, 1, "ringHydrogen");
  });

  // ringC1 -> -CH3, with tetrahedral H placement.
  const methylDirection = radial(0);
  const methylTangent = tangent(methylDirection);
  const methylC = add(ringPositions[0], scale(methylDirection, 0.92));
  addAtom({ id: "methylC", element: "C", label: "CH3", position: methylC, radius: 0.16, fragment: "sp3" });
  addBond("ringC1-methylC", "ringC1", "methylC", 1, "sp3");
  const methylHs: Vec3[] = [
    add(add(methylC, scale(methylDirection, 0.34)), scale(zAxis, 0.48)),
    add(add(add(methylC, scale(methylDirection, 0.34)), scale(methylTangent, 0.42)), scale(zAxis, -0.24)),
    add(add(add(methylC, scale(methylDirection, 0.34)), scale(methylTangent, -0.42)), scale(zAxis, -0.24)),
  ];
  methylHs.forEach((position, index) => {
    addAtom({ id: `methylH${index + 1}`, element: "H", label: "H", position, radius: 0.1, fragment: "sp3" });
    addBond(`methylC-H${index + 1}`, "methylC", `methylH${index + 1}`, 1, "sp3");
  });

  // ringC2 -> -CH=CH2. Its own plane is rotated around ringC2 -> vinylC1.
  const vinylDirection = radial(1);
  const vinylTangent = tangent(vinylDirection);
  const vinylPlaneTilt = vinylAligned ? 0 : Math.PI / 4;
  const vinylPlaneVector = normalize(
    add(scale(vinylTangent, Math.cos(vinylPlaneTilt)), scale(zAxis, Math.sin(vinylPlaneTilt))),
  );
  const vinylC1 = add(ringPositions[1], scale(vinylDirection, 0.86));
  const vinylC2 = add(vinylC1, scale(vinylDirection, 0.78));
  const vinylH1 = add(vinylC1, scale(vinylPlaneVector, 0.46));
  const vinylH2 = add(add(vinylC2, scale(vinylDirection, 0.16)), scale(vinylPlaneVector, 0.42));
  const vinylH3 = add(add(vinylC2, scale(vinylDirection, 0.16)), scale(vinylPlaneVector, -0.42));
  [
    ["vinylC1", "CH", vinylC1, 0.155],
    ["vinylC2", "CH2", vinylC2, 0.155],
  ].forEach(([id, label, position, radius]) => {
    addAtom({
      id: id as string,
      element: "C",
      label: label as string,
      position: position as Vec3,
      radius: radius as number,
      fragment: "sp2",
    });
  });
  [vinylH1, vinylH2, vinylH3].forEach((position, index) => {
    addAtom({ id: `vinylH${index + 1}`, element: "H", label: "H", position, radius: 0.1, fragment: "sp2" });
  });
  addBond("ringC2-vinylC1", "ringC2", "vinylC1", 1, "sp2");
  addBond("vinylC1-vinylC2", "vinylC1", "vinylC2", 2, "sp2");
  addBond("vinylC1-H", "vinylC1", "vinylH1", 1, "sp2");
  addBond("vinylC2-H1", "vinylC2", "vinylH2", 1, "sp2");
  addBond("vinylC2-H2", "vinylC2", "vinylH3", 1, "sp2");

  // ringC4 -> -C≡CH, exactly collinear along the radial direction.
  const ethynylDirection = radial(3);
  const ethynylC1 = add(ringPositions[3], scale(ethynylDirection, 0.82));
  const ethynylC2 = add(ethynylC1, scale(ethynylDirection, 0.72));
  const ethynylH = add(ethynylC2, scale(ethynylDirection, 0.44));
  [
    ["ethynylC1", "C", ethynylC1, 0.148],
    ["ethynylC2", "CH", ethynylC2, 0.148],
    ["ethynylH", "H", ethynylH, 0.1],
  ].forEach(([id, label, position, radius]) => {
    addAtom({
      id: id as string,
      element: id === "ethynylH" ? "H" : "C",
      label: label as string,
      position: position as Vec3,
      radius: radius as number,
      fragment: "sp",
    });
  });
  addBond("ringC4-ethynylC1", "ringC4", "ethynylC1", 1, "sp");
  addBond("ethynylC1-ethynylC2", "ethynylC1", "ethynylC2", 3, "sp");
  addBond("ethynylC2-H", "ethynylC2", "ethynylH", 1, "sp");

  // ringC5 -> -NH2. H atoms and lone pair are slightly out of the benzene plane.
  const amineDirection = radial(4);
  const amineTangent = tangent(amineDirection);
  const amineN = add(add(ringPositions[4], scale(amineDirection, 0.78)), [0, 0, 0.05]);
  const amineH1 = add(add(add(amineN, scale(amineDirection, 0.3)), scale(amineTangent, 0.34)), [0, 0, 0.16]);
  const amineH2 = add(add(add(amineN, scale(amineDirection, 0.3)), scale(amineTangent, -0.34)), [0, 0, -0.16]);
  const lonePairPosition = add(add(amineN, scale(amineDirection, 0.1)), [0, 0, 0.48]);
  addAtom({ id: "amineN", element: "N", label: "N", position: amineN, radius: 0.15, fragment: "amine" });
  addAtom({ id: "amineH1", element: "H", label: "H", position: amineH1, radius: 0.1, fragment: "amine" });
  addAtom({ id: "amineH2", element: "H", label: "H", position: amineH2, radius: 0.1, fragment: "amine" });
  addBond("ringC5-amineN", "ringC5", "amineN", 1, "amine");
  addBond("amineN-H1", "amineN", "amineH1", 1, "amine");
  addBond("amineN-H2", "amineN", "amineH2", 1, "amine");

  const vinylPlaneNormal = normalize(cross(vinylDirection, vinylPlaneVector));

  return {
    atoms,
    bonds,
    ringPositions,
    vinylAxisStart: ringPositions[1],
    vinylAxisEnd: vinylC1,
    vinylPlaneCenter: add(vinylC1, scale(vinylDirection, 0.48)),
    vinylPlaneNormal,
    ethynylLineStart: add(ringPositions[3], scale(ethynylDirection, -0.18)),
    ethynylLineEnd: add(ethynylH, scale(ethynylDirection, 0.28)),
    amineNPosition: amineN,
    lonePairPosition,
    lonePairDirection: normalize(sub(lonePairPosition, amineN)),
    fragmentLabels: [
      { label: "苯环平面", position: [0, 0, 0.18], fragment: "ring" },
      {
        label: "sp³ · CH3",
        position: add(methylC, [0.18, -0.18, 0.62]),
        fragment: "sp3",
      },
      {
        label: vinylAligned ? "sp² · 已对齐" : "sp² · 约 45°",
        position: add(vinylC1, [0.12, 0.18, 0.58]),
        fragment: "sp2",
      },
      { label: "sp · 直线", position: add(ethynylC1, [0, -0.34, 0.36]), fragment: "sp" },
      { label: "NH2 · 空间示意", position: add(amineN, [-0.72, 0.52, 0.16]), fragment: "amine" },
    ],
  };
}

function ReferenceGeometry({
  activeMode,
  scene,
  vinylAligned,
}: {
  activeMode: OrganicCoplanarMode;
  scene: SceneData;
  vinylAligned: boolean;
}) {
  const showRingPlane =
    activeMode === "benzenePlane" || activeMode === "rotation" || activeMode === "overview";
  const showVinylPlane =
    activeMode === "sp2Fragment" || activeMode === "rotation" || (activeMode === "overview" && !vinylAligned);
  const showEthynylLine = activeMode === "spFragment" || activeMode === "overview";

  return (
    <>
      {showRingPlane ? (
        <mesh position={[0, 0, -0.018]}>
          <circleGeometry args={[1.48, 96]} />
          <meshBasicMaterial
            color="#2A9D8F"
            depthWrite={false}
            opacity={activeMode === "overview" ? 0.055 : 0.13}
            transparent
          />
        </mesh>
      ) : null}

      {showVinylPlane ? (
        <PlanePatch
          center={scene.vinylPlaneCenter}
          color={vinylAligned ? "#2A9D8F" : "#3B82F6"}
          height={0.86}
          normal={scene.vinylPlaneNormal}
          opacity={activeMode === "overview" ? 0.07 : 0.16}
          width={1.7}
        />
      ) : null}

      {activeMode === "rotation" ? (
        <DashedReferenceLine
          color="#F4A261"
          end={scene.vinylAxisEnd}
          start={scene.vinylAxisStart}
        />
      ) : null}

      {showEthynylLine ? (
        <DashedReferenceLine
          color="#8B5CF6"
          end={scene.ethynylLineEnd}
          start={scene.ethynylLineStart}
        />
      ) : null}
    </>
  );
}

function OrganicAtomMesh({
  atom,
  isFocused,
  isDimmed,
  isPulling,
  onPullIntent,
  showLabel,
}: {
  atom: OrganicAtom;
  isFocused: boolean;
  isDimmed: boolean;
  isPulling: boolean;
  onPullIntent?: (atomId: string) => void;
  showLabel: boolean;
}) {
  const color = elementColors[atom.element];
  const focusScale = isFocused || isPulling ? 1.14 : 1;
  const radius = atom.radius * focusScale;
  const opacity = isDimmed ? 0.34 : 1;
  const labelShouldShow =
    showLabel ||
    (isFocused &&
      ["methylC", "vinylC1", "vinylC2", "ethynylC1", "ethynylC2", "amineN"].includes(atom.id));

  return (
    <group position={atom.position}>
      {onPullIntent && isPulling ? (
        <mesh scale={1.42}>
          <sphereGeometry args={[atom.radius, 24, 24]} />
          <meshBasicMaterial
            color="#F4A261"
            depthWrite={false}
            opacity={0.2}
            transparent
          />
        </mesh>
      ) : null}
      <mesh scale={focusScale}>
        <sphereGeometry args={[atom.radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={isPulling ? "#F4A261" : isFocused ? fragmentColors[atom.fragment] : "#000000"}
          emissiveIntensity={isPulling ? 0.28 : isFocused ? 0.18 : 0}
          key={isDimmed ? "dimmed" : "solid"}
          metalness={0.04}
          opacity={opacity}
          roughness={0.36}
          transparent={opacity < 1}
        />
      </mesh>
      {labelShouldShow ? (
        <Html center distanceFactor={7} pointerEvents="none" position={[0, radius + 0.14, 0]}>
          <span className={htmlOverlaySubtleLabelClass}>
            {atom.label}
          </span>
        </Html>
      ) : null}
      {onPullIntent && !isPulling ? (
        <AtomPullHandle atomId={atom.id} label={atom.label} onPullIntent={onPullIntent} />
      ) : null}
    </group>
  );
}

function OrganicBondMesh({
  atomsById,
  bond,
  isFocused,
  isDimmed,
  isPulling,
}: {
  atomsById: Map<string, OrganicAtom>;
  bond: OrganicBond;
  isFocused: boolean;
  isDimmed: boolean;
  isPulling: boolean;
}) {
  const order = bond.order;
  const focusScale = isFocused ? 0.024 / 0.018 : 1;
  const offsetDistance = order === 1 ? 0 : order === 2 ? 0.048 : 0.06;
  const offsets = order === 1 ? [0] : order === 2 ? [-offsetDistance, offsetDistance] : [-offsetDistance, 0, offsetDistance];
  const startAtom = atomsById.get(bond.atomIds[0]);
  const endAtom = atomsById.get(bond.atomIds[1]);
  if (!startAtom || !endAtom) return null;
  const start = new Vector3(...startAtom.position);
  const end = new Vector3(...endAtom.position);
  const direction = new Vector3().subVectors(end, start);
  const midpoint = new Vector3().addVectors(start, end).multiplyScalar(0.5);
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize());
  const offsetVector = getOffsetVector(startAtom.position, endAtom.position);
  const color = isPulling ? "#F4A261" : isFocused ? fragmentColors[bond.fragment] : "#B7C7C3";

  return (
    <group>
      {offsets.map((offset) => (
        <mesh
          key={`${bond.id}-${offset}`}
          position={add(vectorToTuple(midpoint), scale(offsetVector, offset))}
          quaternion={quaternion}
          scale={[focusScale, 1, focusScale]}
        >
          <cylinderGeometry args={[0.018, 0.018, direction.length(), 24]} />
          <meshStandardMaterial
            color={color}
            key={isDimmed ? "dimmed" : "solid"}
            opacity={isDimmed ? 0.22 : 0.88}
            roughness={0.45}
            transparent={isDimmed}
          />
        </mesh>
      ))}
    </group>
  );
}

function PlanePatch({
  center,
  normal,
  color,
  opacity,
  width,
  height,
}: {
  center: Vec3;
  normal: Vec3;
  color: string;
  opacity: number;
  width: number;
  height: number;
}) {
  const quaternion = new Quaternion().setFromUnitVectors(
    new Vector3(0, 0, 1),
    new Vector3(...normal).normalize(),
  );

  return (
    <mesh position={center} quaternion={quaternion}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial color={color} depthWrite={false} opacity={opacity} transparent />
    </mesh>
  );
}

function DashedReferenceLine({ start, end, color }: { start: Vec3; end: Vec3; color: string }) {
  const segments = useMemo(() => {
    const startVector = new Vector3(...start);
    const endVector = new Vector3(...end);
    const direction = new Vector3().subVectors(endVector, startVector);
    const length = direction.length();
    const unit = direction.clone().normalize();
    const up = new Vector3(0, 1, 0);
    const quaternion = new Quaternion().setFromUnitVectors(up, unit);
    const segmentCount = 9;

    return Array.from({ length: segmentCount }, (_, index) => {
      const t0 = index / segmentCount;
      const t1 = t0 + 0.055;
      const segmentStart = startVector.clone().add(unit.clone().multiplyScalar(length * t0));
      const segmentEnd = startVector.clone().add(unit.clone().multiplyScalar(length * Math.min(t1, 1)));
      const segLength = segmentEnd.clone().sub(segmentStart).length();
      const midpoint = segmentStart.clone().add(segmentEnd).multiplyScalar(0.5);
      return { midpoint, quaternion, length: segLength };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start[0], start[1], start[2], end[0], end[1], end[2]]);

  return (
    <Instances limit={9}>
      <cylinderGeometry args={[1, 1, 1, 16]} />
      <meshBasicMaterial color={color} opacity={0.66} transparent />
      {segments.map((segment, index) => (
        <Instance
          key={index}
          position={segment.midpoint}
          quaternion={segment.quaternion}
          scale={[0.01, segment.length, 0.01]}
        />
      ))}
    </Instances>
  );
}

function LonePairOrbital({
  nPosition,
  direction,
}: {
  nPosition: Vec3;
  direction: Vec3;
}) {
  return (
    <SharedLonePairOrbital
      direction={direction}
      distance={0.42}
      length={0.48}
      opacity={0.36}
      origin={nPosition}
      width={0.18}
    />
  );
}

function ModeLabels({
  activeMode,
  scene,
  showLabels,
}: {
  activeMode: OrganicCoplanarMode;
  scene: SceneData;
  showLabels: boolean;
}) {
  const activeFragments = new Set<FragmentKey>(
    activeMode === "overview"
      ? []
      : activeMode === "benzenePlane"
        ? ["ring"]
        : activeMode === "sp3Carbon"
          ? ["sp3"]
          : activeMode === "sp2Fragment" || activeMode === "rotation"
            ? ["sp2", "ring"]
            : activeMode === "spFragment"
              ? ["sp"]
              : ["amine"],
  );

  const visibleLabels = scene.fragmentLabels.filter(
    (label) => showLabels || activeFragments.has(label.fragment),
  );
  const renderedLabels = showLabels ? visibleLabels : visibleLabels.slice(0, 1);

  return (
    <>
      {renderedLabels.map((label) => (
          <Html
            center
            distanceFactor={6.6}
            key={label.label}
            pointerEvents="none"
            position={label.position}
          >
            <span className={htmlOverlaySubtleWideLabelClass}>
              {label.label}
            </span>
          </Html>
        ))}
    </>
  );
}

function isFocusedFragment(mode: OrganicCoplanarMode, fragment: FragmentKey, vinylAligned: boolean) {
  if (mode === "overview") return false;
  if (mode === "benzenePlane") return fragment === "ring" || fragment === "ringHydrogen";
  if (mode === "sp3Carbon") return fragment === "sp3";
  if (mode === "sp2Fragment") return fragment === "sp2";
  if (mode === "spFragment") return fragment === "sp";
  if (mode === "amineGroup") return fragment === "amine";
  if (mode === "rotation") return fragment === "sp2" || (vinylAligned && (fragment === "ring" || fragment === "ringHydrogen"));
  return false;
}

function shouldDimFragment(mode: OrganicCoplanarMode, fragment: FragmentKey, vinylAligned: boolean) {
  if (mode === "overview") return false;
  if (mode === "benzenePlane") return !(fragment === "ring" || fragment === "ringHydrogen");
  return !isFocusedFragment(mode, fragment, vinylAligned);
}

function isFocusedAtom(mode: OrganicCoplanarMode, atom: OrganicAtom, vinylAligned: boolean) {
  if (mode === "benzenePlane") {
    return (
      atom.fragment === "ring" ||
      atom.fragment === "ringHydrogen" ||
      ["methylC", "vinylC1", "ethynylC1", "amineN"].includes(atom.id)
    );
  }
  return isFocusedFragment(mode, atom.fragment, vinylAligned);
}

function shouldDimAtom(mode: OrganicCoplanarMode, atom: OrganicAtom, vinylAligned: boolean) {
  if (mode === "overview") return false;
  if (mode === "benzenePlane") return !isFocusedAtom(mode, atom, vinylAligned);
  return !isFocusedAtom(mode, atom, vinylAligned);
}

function shouldShowLonePair(mode: OrganicCoplanarMode) {
  return mode === "amineGroup" || mode === "overview";
}

function getOffsetVector(start: Vec3, end: Vec3): Vec3 {
  const direction = normalize(sub(end, start));
  const candidate = cross(direction, zAxis);
  const offset = length(candidate) < 0.001 ? cross(direction, [0, 1, 0]) : candidate;
  return normalize(offset);
}

function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function scale(a: Vec3, factor: number): Vec3 {
  return [a[0] * factor, a[1] * factor, a[2] * factor];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function length(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2]);
}

function normalize(a: Vec3): Vec3 {
  const value = length(a);
  if (value < 0.0001) return [0, 0, 0];
  return [a[0] / value, a[1] / value, a[2] / value];
}

function vectorToTuple(vector: Vector3): Vec3 {
  return [vector.x, vector.y, vector.z];
}
