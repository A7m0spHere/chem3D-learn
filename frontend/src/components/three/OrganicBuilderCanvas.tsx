import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Plane, Quaternion, Vector3 } from "three";
import { AngleArc } from "@/components/three/AngleArc";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { builderElementConfig } from "@/lib/organicBuilderChemistry";
import type {
  BuilderAtom,
  BuilderBond,
  BuilderBondAngleMatch,
  BuilderBondOrder,
  BuilderMolecule,
  BuilderVec3,
} from "@/types/organicBuilder";
import type { Atom } from "@/types/molecule";

type DropPayload = {
  atomId: string;
  position: BuilderVec3;
  detach: boolean;
  connectToId?: string;
  order: BuilderBondOrder;
};

type OrganicBuilderCanvasProps = {
  bondAngles: BuilderBondAngleMatch[];
  molecule: BuilderMolecule;
  selectedAtomId?: string;
  selectedBondId?: string;
  selectedBondOrder: BuilderBondOrder;
  onDropAtom: (payload: DropPayload) => void;
  onSelectAtom: (atomId?: string) => void;
  onSelectBond: (bondId?: string) => void;
  immersive?: boolean;
  onReady?: () => void;
};

type DragState = {
  atomId: string;
  origin: BuilderVec3;
  current: BuilderVec3;
  plane?: Plane;
  wasConnected: boolean;
};

const DETACH_DISTANCE = 0.56;
const SNAP_DISTANCE = 0.92;

export function OrganicBuilderCanvas({
  bondAngles,
  molecule,
  selectedAtomId,
  selectedBondId,
  selectedBondOrder,
  onDropAtom,
  onSelectAtom,
  onSelectBond,
  immersive = false,
  onReady,
}: OrganicBuilderCanvasProps) {
  const [drag, setDrag] = useState<DragState>();
  const [sceneReady, setSceneReady] = useState(false);
  const displayAtoms = useMemo(
    () => molecule.atoms.map((candidate) =>
      candidate.id === drag?.atomId ? { ...candidate, position: drag.current } : candidate,
    ),
    [drag, molecule.atoms],
  );
  const displayMolecule = useMemo(
    () => ({ ...molecule, atoms: displayAtoms }),
    [displayAtoms, molecule],
  );
  const atomsById = useMemo(
    () => new Map(displayAtoms.map((candidate) => [candidate.id, candidate])),
    [displayAtoms],
  );
  const angleAtomsById = useMemo(
    () => new Map<string, Atom>(displayAtoms.map((candidate) => [candidate.id, {
      ...candidate,
      label: candidate.label ?? candidate.element,
    }])),
    [displayAtoms],
  );
  const visibleBondAngles = useMemo(() => {
    const seen = new Set<string>();
    return bondAngles.filter((angle) => {
      const key = `${angle.geometryZh}-${angle.hybridization}-${angle.label}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 4);
  }, [bondAngles]);
  const center = useMemo(() => getMoleculeCenter(displayAtoms), [displayAtoms]);
  const dragDistance = drag ? distance(drag.origin, drag.current) : 0;
  const shouldDetach = Boolean(drag?.wasConnected && dragDistance > DETACH_DISTANCE);
  const snapTarget = useMemo(() => {
    if (!drag || (drag.wasConnected && !shouldDetach)) return undefined;
    return displayAtoms
      .filter((candidate) => candidate.id !== drag.atomId)
      .map((candidate) => ({ atom: candidate, distance: distance(candidate.position, drag.current) }))
      .filter((candidate) => candidate.distance < SNAP_DISTANCE)
      .sort((a, b) => a.distance - b.distance)[0]?.atom;
  }, [displayAtoms, drag, shouldDetach]);
  const movingAtom = drag ? atomsById.get(drag.atomId) : undefined;

  const handlePointerDown = (atom: BuilderAtom, event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const normal = new Vector3();
    event.camera.getWorldDirection(normal);
    const plane = new Plane().setFromNormalAndCoplanarPoint(normal, new Vector3(...atom.position));
    (event.target as unknown as { setPointerCapture: (pointerId: number) => void }).setPointerCapture(event.pointerId);
    onSelectBond(undefined);
    onSelectAtom(atom.id);
    setDrag({
      atomId: atom.id,
      origin: [...atom.position] as BuilderVec3,
      current: [...atom.position] as BuilderVec3,
      plane,
      wasConnected: molecule.bonds.some((candidate) => candidate.atomIds.includes(atom.id)),
    });
  };

  const handlePointerMove = (atom: BuilderAtom, event: ThreeEvent<PointerEvent>) => {
    if (!drag || drag.atomId !== atom.id || !drag.plane) return;
    event.stopPropagation();
    const point = new Vector3();
    if (!event.ray.intersectPlane(drag.plane, point)) return;
    setDrag((current) => current ? { ...current, current: [point.x, point.y, point.z] } : current);
  };

  const finishDrop = (atomId: string) => {
    if (!drag || drag.atomId !== atomId) return;
    onDropAtom({
      atomId: drag.atomId,
      position: drag.current,
      detach: shouldDetach,
      connectToId: snapTarget?.id,
      order: selectedBondOrder,
    });
    setDrag(undefined);
  };

  const handlePointerUp = (atom: BuilderAtom, event: ThreeEvent<PointerEvent>) => {
    if (!drag || drag.atomId !== atom.id) return;
    event.stopPropagation();
    (event.target as unknown as { releasePointerCapture: (pointerId: number) => void }).releasePointerCapture(event.pointerId);
    finishDrop(atom.id);
  };

  const handleDomDragStart = (atom: BuilderAtom) => {
    onSelectBond(undefined);
    onSelectAtom(atom.id);
    setDrag({
      atomId: atom.id,
      origin: [...atom.position] as BuilderVec3,
      current: [...atom.position] as BuilderVec3,
      wasConnected: molecule.bonds.some((candidate) => candidate.atomIds.includes(atom.id)),
    });
  };

  return (
    <ThreeViewerFrame
      className={immersive ? "" : "min-h-[520px] lg:min-h-[680px]"}
      footerMeta={shouldDetach
        ? "松开后整体拔下"
        : snapTarget
          ? `松开形成${bondOrderName(selectedBondOrder)}`
          : bondAngles.length > 0
            ? `已自动匹配 ${bondAngles.length} 个中心键角`
            : undefined}
      immersive={immersive}
      meta="拖动原子拆装 · 拖动空白旋转 · 滚轮缩放"
      stageTestId="organic-builder-canvas"
      summary={molecule.atoms.length === 0
        ? "从原子盒或官能团盒中添加第一个部件。"
        : bondAngles.length > 0
          ? "结构完整，已按局部成键环境自动标注典型键角。"
          : "把原子拖远可整体拔下；把游离原子拖到另一原子附近会显示吸附预览。"}
      title="3D 拼装区"
      transitionName="organic-builder-stage"
      viewerTestId="organic-builder-viewer"
    >
      <Canvas
        camera={{ position: [center[0] + 4.4, center[1] + 3.4, center[2] + 6.2], fov: 43 }}
        frameloop="demand"
        gl={{ alpha: false }}
        onCreated={() => {
          setSceneReady(true);
          onReady?.();
        }}
        onPointerMissed={() => {
          onSelectAtom(undefined);
          onSelectBond(undefined);
        }}
        style={{ opacity: sceneReady ? 1 : 0, transition: "opacity 180ms var(--ease-out-soft)" }}
      >
        <color attach="background" args={["#F7FAF9"]} />
        <ambientLight intensity={0.74} />
        <directionalLight position={[4, 6, 5]} intensity={1.35} />
        <directionalLight position={[-4, -2, 3]} intensity={0.28} />
        <gridHelper args={[12, 24, "#DDE7E4", "#EDF3F1"]} position={[center[0], center[1] - 2.1, center[2]]} />

        {displayMolecule.bonds.map((candidate) => (
          <BuilderBondMesh
            atomsById={atomsById}
            bond={candidate}
            isDragging={Boolean(drag && candidate.atomIds.includes(drag.atomId))}
            isSelected={candidate.id === selectedBondId}
            key={candidate.id}
            onSelect={() => {
              onSelectAtom(undefined);
              onSelectBond(candidate.id);
            }}
          />
        ))}

        {displayAtoms.map((candidate) => (
          <BuilderAtomMesh
            atom={candidate}
            isDragging={candidate.id === drag?.atomId}
            isSelected={candidate.id === selectedAtomId}
            key={candidate.id}
            onDomDragEnd={() => finishDrop(candidate.id)}
            onDomDragMove={(position) => setDrag((current) =>
              current?.atomId === candidate.id ? { ...current, current: position } : current,
            )}
            onDomDragStart={() => handleDomDragStart(candidate)}
            onPointerDown={(event) => handlePointerDown(candidate, event)}
            onPointerMove={(event) => handlePointerMove(candidate, event)}
            onPointerUp={(event) => handlePointerUp(candidate, event)}
          />
        ))}

        {!drag ? visibleBondAngles.map((angle) => (
          <AngleArc
            angle={angle}
            atomsById={angleAtomsById}
            htmlPointerEvents="none"
            key={angle.id}
            labelVariant="minimal"
            radius={0.48}
            showGuideLine={false}
          />
        )) : null}

        {movingAtom && snapTarget ? (
          <Line
            color="#2A9D8F"
            dashed
            dashScale={12}
            lineWidth={2}
            points={[movingAtom.position, snapTarget.position]}
          />
        ) : null}

        {molecule.atoms.length === 0 ? (
          <Html center pointerEvents="none" position={[0, 0, 0]}>
            <div className="w-64 rounded-2xl border border-border bg-white/90 px-5 py-4 text-center shadow-panel">
              <div className="font-semibold text-text-primary">这里还是空的</div>
              <div className="mt-1 text-sm text-text-secondary">从左侧选择 C、H、O、N 或一个官能团。</div>
            </div>
          </Html>
        ) : null}

        <OrbitControls
          enabled={!drag}
          enableDamping
          enablePan={false}
          makeDefault
          maxDistance={12}
          minDistance={2.4}
          target={center}
        />
      </Canvas>
    </ThreeViewerFrame>
  );
}

function BuilderAtomMesh({
  atom,
  isDragging,
  isSelected,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onDomDragEnd,
  onDomDragMove,
  onDomDragStart,
}: {
  atom: BuilderAtom;
  isDragging: boolean;
  isSelected: boolean;
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (event: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (event: ThreeEvent<PointerEvent>) => void;
  onDomDragEnd: () => void;
  onDomDragMove: (position: BuilderVec3) => void;
  onDomDragStart: () => void;
}) {
  const config = builderElementConfig[atom.element];
  const radius = atom.radius ?? config.radius;
  return (
    <group position={atom.position}>
      {isSelected || isDragging ? (
        <mesh>
          <sphereGeometry args={[radius * 1.34, 24, 24]} />
          <meshBasicMaterial color={isDragging ? "#F4A261" : "#2A9D8F"} opacity={0.2} transparent />
        </mesh>
      ) : null}
      <mesh
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerOver={() => { document.body.style.cursor = "grab"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
        onPointerUp={onPointerUp}
        scale={isDragging ? 1.12 : 1}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={atom.color ?? config.color}
          emissive={isSelected ? "#2A9D8F" : isDragging ? "#F4A261" : "#000000"}
          emissiveIntensity={isSelected || isDragging ? 0.22 : 0}
          metalness={0.04}
          roughness={0.34}
        />
      </mesh>
      <Html center distanceFactor={7} pointerEvents="none" position={[0, radius + 0.22, 0]}>
        <span className="rounded-md border border-border bg-white/90 px-1.5 py-0.5 text-xs font-bold text-text-primary shadow-sm">
          {atom.label ?? atom.element}
        </span>
      </Html>
      <BuilderAtomDragHandle
        atom={atom}
        onDragEnd={onDomDragEnd}
        onDragMove={onDomDragMove}
        onDragStart={onDomDragStart}
      />
    </group>
  );
}

function BuilderAtomDragHandle({
  atom,
  onDragEnd,
  onDragMove,
  onDragStart,
}: {
  atom: BuilderAtom;
  onDragEnd: () => void;
  onDragMove: (position: BuilderVec3) => void;
  onDragStart: () => void;
}) {
  const camera = useThree((state) => state.camera);
  const viewportHeight = useThree((state) => state.size.height);
  const gesture = useRef<{
    pointerId: number;
    x: number;
    y: number;
    origin: BuilderVec3;
  }>();

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      origin: [...atom.position] as BuilderVec3,
    };
    onDragStart();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    event.stopPropagation();
    const distanceToCamera = camera.position.distanceTo(new Vector3(...current.origin));
    const fov = "fov" in camera ? camera.fov : 43;
    const worldPerPixel = (2 * distanceToCamera * Math.tan((fov * Math.PI) / 360)) / Math.max(viewportHeight, 1);
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    const next = new Vector3(...current.origin)
      .addScaledVector(right, (event.clientX - current.x) * worldPerPixel)
      .addScaledVector(up, -(event.clientY - current.y) * worldPerPixel);
    onDragMove([next.x, next.y, next.z]);
  };

  const finishGesture = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (gesture.current?.pointerId !== event.pointerId) return;
    event.stopPropagation();
    event.currentTarget.releasePointerCapture(event.pointerId);
    gesture.current = undefined;
    onDragEnd();
  };

  return (
    <Html center pointerEvents="auto" zIndexRange={[7, 0]}>
      <button
        aria-label={`拖动 ${atom.element} 原子`}
        className="block h-11 w-11 cursor-grab rounded-full bg-transparent opacity-0 outline-none focus:opacity-100 focus:ring-2 focus:ring-primary/60 active:cursor-grabbing"
        data-testid={`builder-atom-handle-${atom.id}`}
        onPointerCancel={finishGesture}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishGesture}
        style={{ touchAction: "none" }}
        type="button"
      />
    </Html>
  );
}

function BuilderBondMesh({
  atomsById,
  bond,
  isDragging,
  isSelected,
  onSelect,
}: {
  atomsById: Map<string, BuilderAtom>;
  bond: BuilderBond;
  isDragging: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const geometry = useMemo(() => {
    const startAtom = atomsById.get(bond.atomIds[0]);
    const endAtom = atomsById.get(bond.atomIds[1]);
    if (!startAtom || !endAtom) return undefined;
    const start = new Vector3(...startAtom.position);
    const end = new Vector3(...endAtom.position);
    const direction = new Vector3().subVectors(end, start);
    return {
      length: direction.length(),
      midpoint: new Vector3().addVectors(start, end).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize()),
    };
  }, [atomsById, bond.atomIds]);
  if (!geometry) return null;
  const radius = 0.04;
  const offset = 0.1;
  const offsets = bond.order === 1 ? [0] : bond.order === 2 ? [-offset, offset] : [-offset, 0, offset];
  return (
    <group position={geometry.midpoint} quaternion={geometry.quaternion}>
      {offsets.map((position) => (
        <mesh key={position} onClick={(event) => { event.stopPropagation(); onSelect(); }} position={[position, 0, 0]}>
          <cylinderGeometry args={[radius, radius, geometry.length, 20]} />
          <meshStandardMaterial
            color={isDragging ? "#F4A261" : isSelected ? "#2A9D8F" : "#AFC2BD"}
            emissive={isSelected ? "#2A9D8F" : "#000000"}
            emissiveIntensity={isSelected ? 0.18 : 0}
            roughness={0.44}
          />
        </mesh>
      ))}
      <mesh onClick={(event) => { event.stopPropagation(); onSelect(); }}>
        <cylinderGeometry args={[0.11, 0.11, geometry.length, 12]} />
        <meshBasicMaterial opacity={0} transparent />
      </mesh>
    </group>
  );
}

function getMoleculeCenter(atoms: BuilderAtom[]): BuilderVec3 {
  if (atoms.length === 0) return [0, 0, 0];
  const total = atoms.reduce<BuilderVec3>(
    (current, candidate) => [
      current[0] + candidate.position[0],
      current[1] + candidate.position[1],
      current[2] + candidate.position[2],
    ],
    [0, 0, 0],
  );
  return [total[0] / atoms.length, total[1] / atoms.length, total[2] / atoms.length];
}

function distance(first: BuilderVec3, second: BuilderVec3): number {
  return Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
}

function bondOrderName(order: BuilderBondOrder): string {
  return order === 1 ? "单键" : order === 2 ? "双键" : "三键";
}
