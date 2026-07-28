import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Plane, Quaternion, Vector3, type Group } from "three";
import { AngleArc } from "@/components/three/AngleArc";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { builderElementConfig, canSetBond, detachBuilderAtom } from "@/lib/organicBuilderChemistry";
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

// 删除退场残影：原子缩没、键并拢变细，约 200ms 后从场景卸载。
type GhostAtomSnapshot = {
  key: string;
  atomId: string;
  position: BuilderVec3;
  radius: number;
  color: string;
};

type GhostBondSnapshot = {
  key: string;
  bondId: string;
  start: BuilderVec3;
  end: BuilderVec3;
  order: BuilderBondOrder;
};

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
    // 预检与松手时 reducer 的实际校验保持一致：将拔下时按拔下后的键状态检查价键，
    // 避免出现"绿色吸附预览承诺能连、松手却被拒绝"的矛盾。
    const previewMolecule = shouldDetach ? detachBuilderAtom(molecule, drag.atomId) : molecule;
    return displayAtoms
      .filter((candidate) => candidate.id !== drag.atomId)
      .map((candidate) => ({ atom: candidate, distance: distance(candidate.position, drag.current) }))
      .filter((candidate) => candidate.distance < SNAP_DISTANCE)
      .filter((candidate) => canSetBond(previewMolecule, drag.atomId, candidate.atom.id, selectedBondOrder).ok)
      .sort((a, b) => a.distance - b.distance)[0]?.atom;
  }, [displayAtoms, drag, molecule, selectedBondOrder, shouldDetach]);
  const movingAtom = drag ? atomsById.get(drag.atomId) : undefined;
  // 沉浸模式下 ThreeViewerFrame 不渲染 footer，拖拽状态提示改为画布内浮签展示。
  const dragHint = drag
    ? shouldDetach
      ? "松开后整体拔下"
      : snapTarget
        ? `松开与 ${snapTarget.element} 形成${bondOrderName(selectedBondOrder)}`
        : undefined
    : undefined;
  const lastDragHintRef = useRef<string>();
  useEffect(() => {
    if (dragHint) lastDragHintRef.current = dragHint;
  }, [dragHint]);
  // 拖转视角（pointerdown → move → up）在浏览器里同样产生 click，会触发 onPointerMissed；
  // 记录按下位置，位移超过阈值时视为旋转视角，不清空当前选中。
  const pointerMissGuard = useRef<{ x: number; y: number }>();
  const prefersReducedMotion = useReducedMotion();
  // 各原子当前"实际显示位置"（补间途中的位置）。原子每帧写入，键每帧读取端点，
  // 保证键跟着补间中的原子一起动，而不是先一步跳到目标几何。条目不主动清理：
  // 按 id 覆盖写、体量极小，删除后的残值还可作为退场残影的位置来源。
  const animatedPositionsRef = useRef(new Map<string, Vector3>());
  const [ghostAtoms, setGhostAtoms] = useState<GhostAtomSnapshot[]>([]);
  const [ghostBonds, setGhostBonds] = useState<GhostBondSnapshot[]>([]);
  const ghostKeyRef = useRef(0);
  const prevMoleculeRef = useRef(molecule);
  // 对比前后分子，为被删除的原子/键生成退场残影；撤销把同 id 部件加回来时，
  // 先清掉对应残影，避免实体和残影短暂同屏。
  useEffect(() => {
    const previous = prevMoleculeRef.current;
    prevMoleculeRef.current = molecule;
    if (previous === molecule) return;
    const currentAtomIds = new Set(molecule.atoms.map((candidate) => candidate.id));
    const currentBondIds = new Set(molecule.bonds.map((candidate) => candidate.id));
    const removedAtoms = prefersReducedMotion
      ? []
      : previous.atoms.filter((candidate) => !currentAtomIds.has(candidate.id));
    const removedBonds = prefersReducedMotion
      ? []
      : previous.bonds.filter((candidate) => !currentBondIds.has(candidate.id));
    const prevAtomsById = new Map(previous.atoms.map((candidate) => [candidate.id, candidate]));
    const displayedPosition = (atomId: string): BuilderVec3 | undefined => {
      const animated = animatedPositionsRef.current.get(atomId);
      if (animated) return [animated.x, animated.y, animated.z];
      return prevAtomsById.get(atomId)?.position;
    };
    const nextGhostKey = () => {
      ghostKeyRef.current += 1;
      return `ghost-${ghostKeyRef.current}`;
    };
    setGhostAtoms((current) => {
      const kept = current.filter((ghost) => !currentAtomIds.has(ghost.atomId));
      const additions = removedAtoms.map((atom) => {
        const config = builderElementConfig[atom.element];
        return {
          key: nextGhostKey(),
          atomId: atom.id,
          position: displayedPosition(atom.id) ?? atom.position,
          radius: atom.radius ?? config.radius,
          color: atom.color ?? config.color,
        };
      });
      if (kept.length === current.length && additions.length === 0) return current;
      return [...kept, ...additions];
    });
    setGhostBonds((current) => {
      const kept = current.filter((ghost) => !currentBondIds.has(ghost.bondId));
      const additions = removedBonds.flatMap((candidate) => {
        const start = displayedPosition(candidate.atomIds[0]);
        const end = displayedPosition(candidate.atomIds[1]);
        if (!start || !end) return [];
        return [{
          key: nextGhostKey(),
          bondId: candidate.id,
          start,
          end,
          order: candidate.order,
        }];
      });
      if (kept.length === current.length && additions.length === 0) return current;
      return [...kept, ...additions];
    });
  }, [molecule, prefersReducedMotion]);
  const handleGhostAtomDone = useCallback((key: string) => {
    setGhostAtoms((current) => current.filter((ghost) => ghost.key !== key));
  }, []);
  const handleGhostBondDone = useCallback((key: string) => {
    setGhostBonds((current) => current.filter((ghost) => ghost.key !== key));
  }, []);

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
      footerMeta={dragHint
        ?? (bondAngles.length > 0 ? `已自动匹配 ${bondAngles.length} 个中心键角` : undefined)}
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
      <div
        className="h-full w-full"
        onPointerDownCapture={(event) => {
          pointerMissGuard.current = { x: event.clientX, y: event.clientY };
        }}
      >
      <Canvas
        camera={{ position: [center[0] + 4.4, center[1] + 3.4, center[2] + 6.2], fov: 43 }}
        frameloop="demand"
        gl={{ alpha: false }}
        onCreated={() => {
          setSceneReady(true);
          onReady?.();
        }}
        onPointerMissed={(event) => {
          const guard = pointerMissGuard.current;
          if (guard && Math.hypot(event.clientX - guard.x, event.clientY - guard.y) > 6) return;
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
            animatedPositions={animatedPositionsRef.current}
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

        {ghostBonds.map((ghost) => (
          <GhostBondMesh ghost={ghost} key={ghost.key} onDone={handleGhostBondDone} />
        ))}

        {displayAtoms.map((candidate) => (
          <BuilderAtomMesh
            animatedPositions={animatedPositionsRef.current}
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
            reducedMotion={prefersReducedMotion}
          />
        ))}

        {ghostAtoms.map((ghost) => (
          <GhostAtomMesh ghost={ghost} key={ghost.key} onDone={handleGhostAtomDone} />
        ))}

        <BuilderAngleArcs
          angles={visibleBondAngles}
          atomsById={angleAtomsById}
          hidden={Boolean(drag)}
          reducedMotion={prefersReducedMotion}
        />

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
              <div className="mt-1 text-sm text-text-secondary">打开模型盒，选择一个原子或常用片段开始拼装。</div>
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
      {immersive ? (
        <div
          aria-live="polite"
          className={`pointer-events-none absolute bottom-20 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/80 bg-white/90 px-4 py-1.5 text-sm font-semibold text-primary-dark shadow-overlay backdrop-blur-xl transition-all duration-200 ease-out-soft ${dragHint ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
          data-testid="builder-drag-hint"
        >
          {dragHint ?? lastDragHintRef.current ?? ""}
        </div>
      ) : null}
      </div>
    </ThreeViewerFrame>
  );
}

// useFrame 内复用的临时向量，避免每帧新建对象。
const atomPositionTarget = new Vector3();
const bondAxisTemp = new Vector3();
const bondStartTemp = new Vector3();
const bondEndTemp = new Vector3();
const toCameraTemp = new Vector3();
const offsetDesiredTemp = new Vector3();
const bondLocalXTemp = new Vector3();
const bondLocalZTemp = new Vector3();
// 圆柱几何的本体轴向；只作 setFromUnitVectors 的只读输入，禁止原地修改。
const BOND_UP = new Vector3(0, 1, 0);

// 退场残影与键角弧淡入淡出的速度（单位：progress/秒），对应约 190~210ms。
const GHOST_FADE_SPEED = 5.2;
const ARC_FADE_SPEED = 6.5;
const NO_ANGLES: BuilderBondAngleMatch[] = [];

// 残影只是视觉余韵，不参与拾取，避免短暂挡住背后的可点部件。
const disableRaycast = () => undefined;

function writeAnimatedPosition(map: Map<string, Vector3>, atomId: string, position: Vector3) {
  const existing = map.get(atomId);
  if (existing) {
    existing.copy(position);
    return;
  }
  map.set(atomId, position.clone());
}

// 返回值可能直接引用共享表里的向量，调用方只读、不得原地修改。
function readDisplayedPosition(map: Map<string, Vector3>, atom: BuilderAtom, fallback: Vector3): Vector3 {
  const animated = map.get(atom.id);
  if (animated) return animated;
  return fallback.set(atom.position[0], atom.position[1], atom.position[2]);
}

function BuilderAtomMesh({
  animatedPositions,
  atom,
  isDragging,
  isSelected,
  reducedMotion,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onDomDragEnd,
  onDomDragMove,
  onDomDragStart,
}: {
  animatedPositions: Map<string, Vector3>;
  atom: BuilderAtom;
  isDragging: boolean;
  isSelected: boolean;
  reducedMotion: boolean;
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (event: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (event: ThreeEvent<PointerEvent>) => void;
  onDomDragEnd: () => void;
  onDomDragMove: (position: BuilderVec3) => void;
  onDomDragStart: () => void;
}) {
  const config = builderElementConfig[atom.element];
  const radius = atom.radius ?? config.radius;
  const groupRef = useRef<Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const entranceInitialized = useRef(false);

  // 轻量补间（frameloop="demand" 下通过 invalidate 续帧）：
  // 新增原子从 0.45 缩放弹入；吸附/建议摆位的位置变化平滑过渡而不是瞬移；
  // 拖拽中的原子跳过位置补间，保持与指针 1:1 跟手。
  // prefers-reduced-motion 下全部退化为直接落位，不做任何 3D 补间。
  // 优先级 -1：先于键网格（默认 0）执行，保证键在同一帧读到的端点不滞后。
  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const target = atomPositionTarget.set(atom.position[0], atom.position[1], atom.position[2]);
    let animating = false;
    if (reducedMotion) {
      entranceInitialized.current = true;
      group.position.copy(target);
      group.scale.setScalar(1);
    } else {
      if (!entranceInitialized.current) {
        entranceInitialized.current = true;
        group.position.copy(target);
        group.scale.setScalar(0.45);
      }
      if (isDragging || group.position.distanceTo(target) < 0.003) {
        group.position.copy(target);
      } else {
        group.position.lerp(target, Math.min(1, delta * 11));
        animating = true;
      }
      if (Math.abs(group.scale.x - 1) > 0.005) {
        group.scale.setScalar(group.scale.x + (1 - group.scale.x) * Math.min(1, delta * 9));
        animating = true;
      } else if (group.scale.x !== 1) {
        group.scale.setScalar(1);
      }
    }
    // 把实际显示位置同步给共享表，键网格据此每帧对齐端点。
    writeAnimatedPosition(animatedPositions, atom.id, group.position);
    if (animating) invalidate();
  }, -1);

  return (
    <group ref={groupRef}>
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
        className="block h-8 w-8 cursor-grab rounded-full bg-transparent opacity-0 outline-none focus:opacity-100 focus:ring-2 focus:ring-primary/60 active:cursor-grabbing"
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
  animatedPositions,
  atomsById,
  bond,
  isDragging,
  isSelected,
  onSelect,
}: {
  animatedPositions: Map<string, Vector3>;
  atomsById: Map<string, BuilderAtom>;
  bond: BuilderBond;
  isDragging: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const groupRef = useRef<Group>(null);
  const offsetGroupRef = useRef<Group>(null);
  const startAtom = atomsById.get(bond.atomIds[0]);
  const endAtom = atomsById.get(bond.atomIds[1]);
  // 端点每帧取原子的"实际显示位置"（补间途中的位置），键跟着原子一起动，
  // 不再先一步跳到最终几何；圆柱用单位长度 + scale.y 表达键长。
  // 双/三键的并排偏移面始终旋向相机（绕键轴转动内层 group），
  // 避免某些视角下多根圆柱重叠成一条线、被学生误读为单键。
  useFrame(({ camera }) => {
    const group = groupRef.current;
    if (!group || !startAtom || !endAtom) return;
    const start = readDisplayedPosition(animatedPositions, startAtom, bondStartTemp);
    const end = readDisplayedPosition(animatedPositions, endAtom, bondEndTemp);
    bondAxisTemp.subVectors(end, start);
    const length = bondAxisTemp.length();
    if (length < 1e-5) return;
    group.position.addVectors(start, end).multiplyScalar(0.5);
    group.quaternion.setFromUnitVectors(BOND_UP, bondAxisTemp.normalize());
    group.scale.set(1, length, 1);
    if (bond.order === 1 || !offsetGroupRef.current) return;
    toCameraTemp.copy(camera.position).sub(group.position);
    offsetDesiredTemp.crossVectors(bondAxisTemp, toCameraTemp);
    if (offsetDesiredTemp.lengthSq() < 1e-6) return;
    offsetDesiredTemp.normalize();
    bondLocalXTemp.set(1, 0, 0).applyQuaternion(group.quaternion);
    bondLocalZTemp.set(0, 0, 1).applyQuaternion(group.quaternion);
    offsetGroupRef.current.rotation.y = -Math.atan2(
      offsetDesiredTemp.dot(bondLocalZTemp),
      offsetDesiredTemp.dot(bondLocalXTemp),
    );
  });
  if (!startAtom || !endAtom) return null;
  const radius = 0.04;
  const offset = 0.1;
  const offsets = bond.order === 1 ? [0] : bond.order === 2 ? [-offset, offset] : [-offset, 0, offset];
  return (
    <group ref={groupRef}>
      <group ref={offsetGroupRef}>
        {offsets.map((position) => (
          <mesh key={position} onClick={(event) => { event.stopPropagation(); onSelect(); }} position={[position, 0, 0]}>
            <cylinderGeometry args={[radius, radius, 1, 20]} />
            <meshStandardMaterial
              color={isDragging ? "#F4A261" : isSelected ? "#2A9D8F" : "#AFC2BD"}
              emissive={isSelected ? "#2A9D8F" : "#000000"}
              emissiveIntensity={isSelected ? 0.18 : 0}
              roughness={0.44}
            />
          </mesh>
        ))}
      </group>
      <mesh onClick={(event) => { event.stopPropagation(); onSelect(); }}>
        <cylinderGeometry args={[0.14, 0.14, 1, 12]} />
        <meshBasicMaterial opacity={0} transparent />
      </mesh>
    </group>
  );
}

// 被删除原子的退场残影：原样渲染一颗同色球并缩没，结束后自我上报卸载。
function GhostAtomMesh({ ghost, onDone }: { ghost: GhostAtomSnapshot; onDone: (key: string) => void }) {
  const groupRef = useRef<Group>(null);
  const progressRef = useRef(1);
  const doneRef = useRef(false);
  const invalidate = useThree((state) => state.invalidate);
  useFrame((_, delta) => {
    if (doneRef.current) return;
    const next = Math.max(0, progressRef.current - delta * GHOST_FADE_SPEED);
    progressRef.current = next;
    groupRef.current?.scale.setScalar(Math.max(0.001, next));
    if (next <= 0) {
      doneRef.current = true;
      onDone(ghost.key);
      return;
    }
    invalidate();
  });
  return (
    <group position={ghost.position} ref={groupRef}>
      <mesh raycast={disableRaycast}>
        <sphereGeometry args={[ghost.radius, 24, 24]} />
        <meshStandardMaterial color={ghost.color} metalness={0.04} roughness={0.34} />
      </mesh>
    </group>
  );
}

// 被删除键的退场残影：圆柱向键轴并拢变细直至消失（缩 x/z，同时并拢多键偏移）。
function GhostBondMesh({ ghost, onDone }: { ghost: GhostBondSnapshot; onDone: (key: string) => void }) {
  const thinningRef = useRef<Group>(null);
  const progressRef = useRef(1);
  const doneRef = useRef(false);
  const invalidate = useThree((state) => state.invalidate);
  const transform = useMemo(() => {
    const start = new Vector3(...ghost.start);
    const end = new Vector3(...ghost.end);
    const direction = new Vector3().subVectors(end, start);
    const length = direction.length();
    if (length < 1e-5) return undefined;
    return {
      length,
      midpoint: new Vector3().addVectors(start, end).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(BOND_UP, direction.normalize()),
    };
  }, [ghost]);
  useFrame((_, delta) => {
    if (doneRef.current) return;
    const next = Math.max(0, progressRef.current - delta * GHOST_FADE_SPEED);
    progressRef.current = next;
    thinningRef.current?.scale.set(Math.max(0.001, next), 1, Math.max(0.001, next));
    if (next <= 0) {
      doneRef.current = true;
      onDone(ghost.key);
      return;
    }
    invalidate();
  });
  if (!transform) return null;
  const offsets = ghost.order === 1 ? [0] : ghost.order === 2 ? [-0.1, 0.1] : [-0.1, 0, 0.1];
  return (
    <group position={transform.midpoint} quaternion={transform.quaternion}>
      <group ref={thinningRef}>
        {offsets.map((position) => (
          <mesh key={position} position={[position, 0, 0]} raycast={disableRaycast}>
            <cylinderGeometry args={[0.04, 0.04, transform.length, 12]} />
            <meshStandardMaterial color="#AFC2BD" roughness={0.44} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// 键角弧的进出场管理：新出现的弧淡入、消失（含拖拽隐藏）的弧淡出后再卸载；
// prefers-reduced-motion 下保持旧行为（直接挂载/卸载，不做淡入淡出）。
function BuilderAngleArcs({
  angles,
  atomsById,
  hidden,
  reducedMotion,
}: {
  angles: BuilderBondAngleMatch[];
  atomsById: Map<string, Atom>;
  hidden: boolean;
  reducedMotion: boolean;
}) {
  const [entries, setEntries] = useState<{ angle: BuilderBondAngleMatch; visible: boolean }[]>([]);
  useEffect(() => {
    if (reducedMotion) {
      setEntries((current) => current.length === 0 ? current : []);
      return;
    }
    const targetAngles = hidden ? NO_ANGLES : angles;
    setEntries((current) => {
      const targetIds = new Set(targetAngles.map((angle) => angle.id));
      const currentIds = new Set(current.map((entry) => entry.angle.id));
      const next = current.map((entry) => {
        const latest = targetAngles.find((angle) => angle.id === entry.angle.id);
        return { angle: latest ?? entry.angle, visible: targetIds.has(entry.angle.id) };
      });
      targetAngles.forEach((angle) => {
        if (!currentIds.has(angle.id)) next.push({ angle, visible: true });
      });
      const unchanged = next.length === current.length && next.every((entry, index) =>
        entry.angle === current[index].angle && entry.visible === current[index].visible);
      return unchanged ? current : next;
    });
  }, [angles, hidden, reducedMotion]);
  const handleExited = useCallback((angleId: string) => {
    setEntries((current) => current.filter((entry) => entry.angle.id !== angleId));
  }, []);
  if (reducedMotion) {
    return (
      <>
        {(hidden ? NO_ANGLES : angles).map((angle) => (
          <AngleArc
            angle={angle}
            atomsById={atomsById}
            htmlPointerEvents="none"
            key={angle.id}
            labelVariant="minimal"
            radius={0.48}
            showGuideLine={false}
          />
        ))}
      </>
    );
  }
  return (
    <>
      {entries.map((entry) => (
        <FadingAngleArc
          angle={entry.angle}
          atomsById={atomsById}
          key={entry.angle.id}
          onExited={handleExited}
          visible={entry.visible}
        />
      ))}
    </>
  );
}

function FadingAngleArc({
  angle,
  atomsById,
  onExited,
  visible,
}: {
  angle: BuilderBondAngleMatch;
  atomsById: Map<string, Atom>;
  onExited: (angleId: string) => void;
  visible: boolean;
}) {
  const invalidate = useThree((state) => state.invalidate);
  // 挂载即从 0 淡入；退场淡到 0 后向父级上报，由父级真正卸载。
  const opacityRef = useRef(0);
  const exitNotifiedRef = useRef(false);
  const [renderedOpacity, setRenderedOpacity] = useState(0);
  useFrame((_, delta) => {
    if (visible) exitNotifiedRef.current = false;
    const target = visible ? 1 : 0;
    const current = opacityRef.current;
    if (current === target) {
      if (!visible && !exitNotifiedRef.current) {
        exitNotifiedRef.current = true;
        onExited(angle.id);
      }
      return;
    }
    const step = delta * ARC_FADE_SPEED;
    const next = current < target ? Math.min(target, current + step) : Math.max(target, current - step);
    opacityRef.current = next;
    setRenderedOpacity(next);
    invalidate();
  });
  return (
    <AngleArc
      angle={angle}
      atomsById={atomsById}
      htmlPointerEvents="none"
      labelVariant="minimal"
      opacity={renderedOpacity}
      radius={0.48}
      showGuideLine={false}
    />
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
