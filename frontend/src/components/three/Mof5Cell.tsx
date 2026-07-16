import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { CameraRig } from "@/components/three/CameraRig";
import {
  htmlOverlayAmberCompactLabelClass,
  htmlOverlayAmberStrongLabelClass,
  htmlOverlayCompactLabelClass,
  htmlOverlayLabelClass,
  htmlOverlaySubtleWideLabelClass,
} from "@/components/three/htmlOverlayStyles";
import {
  add,
  createPcuGeometry,
  lerp,
  midpoint,
  normalize,
  scale,
  TETRAHEDRAL_DIRECTIONS,
  TETRAHEDRON_EDGES,
  type PcuLinker,
  type PcuPeriodicStub,
} from "@/components/three/mof5Geometry";
import { SceneLighting } from "@/components/three/SceneLighting";
import { StickCylinder, type Vec3 } from "@/components/three/StickCylinder";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import type {
  CrystalViewMode,
  CrystalVoidStage,
  MoleculeRecord,
} from "@/types/molecule";

type Mof5CellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
  showLabels: boolean;
  loading?: boolean;
};

const ZN_COLOR = "#2A9D8F";
const ZN_DARK = "#1F6F68";
const CARBON_COLOR = "#334155";
const OXYGEN_COLOR = "#DC2626";
const PORE_COLOR = "#F4A261";
const FRAME_COLOR = "#64748B";

const pcuGeometry = createPcuGeometry();
const znPositions = TETRAHEDRAL_DIRECTIONS.map((direction) => scale(direction, 0.34));
const nodeCarboxylates = TETRAHEDRON_EDGES.map(([firstIndex, secondIndex], index) => {
  const firstZn = znPositions[firstIndex];
  const secondZn = znPositions[secondIndex];
  const direction = normalize(midpoint(firstZn, secondZn));
  const carbon = scale(direction, 0.59);
  return {
    carbon,
    direction,
    firstIndex,
    firstOxygen: lerp(firstZn, carbon, 0.56),
    id: `node-carboxylate-${index}`,
    secondIndex,
    secondOxygen: lerp(secondZn, carbon, 0.56),
  };
});

const bdcRing: Vec3[] = [
  [-0.42, 0, 0],
  [-0.21, 0.36, 0],
  [0.21, 0.36, 0],
  [0.42, 0, 0],
  [0.21, -0.36, 0],
  [-0.21, -0.36, 0],
];

const bdcCarboxylates = [
  {
    carbon: [-0.63, 0, 0] as Vec3,
    node: [-1.04, 0, 0] as Vec3,
    oxygens: [[-0.79, 0.12, 0], [-0.79, -0.12, 0]] as Vec3[],
    ringCarbon: bdcRing[0],
  },
  {
    carbon: [0.63, 0, 0] as Vec3,
    node: [1.04, 0, 0] as Vec3,
    oxygens: [[0.79, 0.12, 0], [0.79, -0.12, 0]] as Vec3[],
    ringCarbon: bdcRing[3],
  },
];

export function Mof5Cell({
  molecule,
  viewMode,
  voidStage,
  showLabels,
  loading = false,
}: Mof5CellProps) {
  const activeMode = molecule.crystalTeaching?.viewModes.find((mode) => mode.id === viewMode);
  const activeStage = molecule.crystalTeaching?.voidStages?.find((stage) => stage.id === voidStage);
  const isVoidMode = viewMode === "voids";
  const camera = getCameraPreset(viewMode);
  const displayTitle = isVoidMode
    ? activeStage?.titleZh ?? activeMode?.titleZh ?? "孔隙与客体"
    : activeMode?.titleZh ?? "立方 pcu 拓扑框架";
  const displaySummary = isVoidMode && activeStage
    ? activeStage.bodyZh
    : activeMode?.bodyZh ?? molecule.summaryZh;

  return (
    <ThreeViewerFrame
      className="min-h-[540px] sm:min-h-[500px]"
      footerMeta={<AtomLegend />}
      loading={loading}
      meta="拖拽旋转 · 标签只显示当前焦点"
      stageTestId="mof5-canvas"
      summary={displaySummary}
      title={`MOF-5｜${displayTitle}`}
      viewerTestId="mof5-viewer"
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
          ambient={0.72}
          mainIntensity={1.34}
          mainPosition={[4, 6, 5]}
          secondaryIntensity={0.42}
          secondaryPosition={[-4, 2, -3]}
        />
        <CameraRig
          fov={camera.fov}
          position={camera.position}
          resetKey={`${viewMode}-${voidStage}`}
        />
        <group
          position={[0, camera.yOffset, 0]}
          rotation={camera.rotation}
          scale={camera.scale}
        >
          <Mof5Scene
            showLabels={showLabels}
            viewMode={viewMode}
            voidStage={voidStage}
          />
        </group>
        <OrbitControls
          enableDamping={false}
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

function Mof5Scene({
  showLabels,
  viewMode,
  voidStage,
}: {
  showLabels: boolean;
  viewMode: CrystalViewMode;
  voidStage: CrystalVoidStage;
}) {
  switch (viewMode) {
    case "comparison":
      return <BuildingUnitOverview />;
    case "coordination":
      return <DetailedNode showAnnotations />;
    case "covalentNetwork":
      return <DetailedBdc showAnnotations />;
    case "voids":
      return (
        <TopologyFramework
          counting={false}
          showGuests={voidStage === "filled"}
          showLabels={false}
          showPore={voidStage !== "framework"}
        />
      );
    case "counting":
      return <TopologyFramework counting showGuests={false} showLabels showPore={false} />;
    case "cell":
    default:
      return <TopologyFramework counting={false} showGuests={false} showLabels={showLabels} showPore={false} />;
  }
}

function BuildingUnitOverview() {
  return (
    <>
      <group position={[-0.92, 0.02, 0]} scale={0.82}>
        <DetailedNode showAnnotations={false} />
      </group>
      <group position={[0.92, 0.01, 0]} scale={0.62}>
        <DetailedBdc showAnnotations={false} />
      </group>
      <Html center distanceFactor={7.2} pointerEvents="none" position={[-0.92, 0.84, 0]}>
        <span className={htmlOverlayLabelClass}>金属簇节点｜Zn₄O SBU</span>
      </Html>
      <Html center distanceFactor={7.2} pointerEvents="none" position={[0.92, 0.84, 0]}>
        <span className={htmlOverlayAmberStrongLabelClass}>有机连接体｜BDC</span>
      </Html>
      <Html center distanceFactor={7.2} pointerEvents="none" position={[0, -0.82, 0]}>
        <span className={htmlOverlaySubtleWideLabelClass}>两类构筑单元周期连接 → 开放框架</span>
      </Html>
    </>
  );
}

function DetailedNode({ showAnnotations }: { showAnnotations: boolean }) {
  return (
    <group>
      <AtomSphere color={OXYGEN_COLOR} position={[0, 0, 0]} radius={0.105} />
      {znPositions.map((position, index) => (
        <group key={`zn-${index}`}>
          <StickCylinder
            color={ZN_DARK}
            end={position}
            opacity={0.7}
            radius={0.018}
            start={[0, 0, 0]}
          />
          <AtomSphere color={ZN_COLOR} metal position={position} radius={0.135} />
        </group>
      ))}

      {TETRAHEDRON_EDGES.map(([first, second], index) => (
        <StickCylinder
          color={ZN_COLOR}
          end={znPositions[second]}
          key={`tetrahedron-edge-${index}`}
          opacity={0.16}
          radius={0.006}
          start={znPositions[first]}
        />
      ))}

      {nodeCarboxylates.map((group) => {
        const firstZn = znPositions[group.firstIndex];
        const secondZn = znPositions[group.secondIndex];
        const connectorEnd = scale(group.direction, 0.76);
        return (
          <group key={group.id}>
            <StickCylinder color={OXYGEN_COLOR} end={group.firstOxygen} radius={0.01} start={firstZn} />
            <StickCylinder color={CARBON_COLOR} end={group.carbon} radius={0.009} start={group.firstOxygen} />
            <StickCylinder color={CARBON_COLOR} end={group.secondOxygen} radius={0.009} start={group.carbon} />
            <StickCylinder color={OXYGEN_COLOR} end={secondZn} radius={0.01} start={group.secondOxygen} />
            <StickCylinder
              color={FRAME_COLOR}
              end={connectorEnd}
              opacity={0.42}
              radius={0.006}
              start={group.carbon}
            />
            <AtomSphere color={OXYGEN_COLOR} position={group.firstOxygen} radius={0.052} />
            <AtomSphere color={OXYGEN_COLOR} position={group.secondOxygen} radius={0.052} />
            <AtomSphere color={CARBON_COLOR} position={group.carbon} radius={0.047} />
            <AtomSphere color={PORE_COLOR} opacity={0.68} position={connectorEnd} radius={0.024} />
          </group>
        );
      })}

      {showAnnotations ? (
        <>
          <Html center distanceFactor={7} pointerEvents="none" position={[0, 0.76, 0]}>
            <span className={htmlOverlayLabelClass}>Zn₄O 核心｜4 个 Zn</span>
          </Html>
          <Html center distanceFactor={4.2} pointerEvents="none" position={[1.2, 0.08, 0]}>
            <span className={htmlOverlaySubtleWideLabelClass}>单个 Zn：O 四配位</span>
          </Html>
          <Html center distanceFactor={7} pointerEvents="none" position={[0, -0.76, 0]}>
            <span className={htmlOverlayAmberCompactLabelClass}>整个 SBU：六连接方向</span>
          </Html>
        </>
      ) : null}
    </group>
  );
}

function DetailedBdc({ showAnnotations }: { showAnnotations: boolean }) {
  return (
    <group>
      {bdcRing.map((position, index) => (
        <group key={`bdc-ring-${index}`}>
          <AtomSphere color={CARBON_COLOR} position={position} radius={0.075} />
          <StickCylinder
            color={CARBON_COLOR}
            end={bdcRing[(index + 1) % bdcRing.length]}
            radius={0.014}
            start={position}
          />
        </group>
      ))}

      {bdcCarboxylates.map((group, groupIndex) => (
        <group key={`bdc-carboxylate-${groupIndex}`}>
          <StickCylinder color={CARBON_COLOR} end={group.carbon} radius={0.014} start={group.ringCarbon} />
          <AtomSphere color={CARBON_COLOR} position={group.carbon} radius={0.068} />
          {group.oxygens.map((oxygen, oxygenIndex) => (
            <group key={`bdc-oxygen-${groupIndex}-${oxygenIndex}`}>
              <StickCylinder color={OXYGEN_COLOR} end={oxygen} radius={0.012} start={group.carbon} />
              <StickCylinder
                color={ZN_DARK}
                end={group.node}
                opacity={0.52}
                radius={0.008}
                start={oxygen}
              />
              <AtomSphere color={OXYGEN_COLOR} position={oxygen} radius={0.058} />
            </group>
          ))}
          <TopologyNode position={group.node} />
        </group>
      ))}

      {showAnnotations ? (
        <>
          <Html center distanceFactor={7} pointerEvents="none" position={[0, 0.62, 0]}>
            <span className={htmlOverlayLabelClass}>BDC²⁻｜线性二连接体</span>
          </Html>
          <Html center distanceFactor={7} pointerEvents="none" position={[0, -0.58, 0]}>
            <span className={htmlOverlayCompactLabelClass}>苯环提供刚性间隔</span>
          </Html>
          <Html center distanceFactor={8.5} pointerEvents="none" position={[-0.92, -0.36, 0]}>
            <span className={htmlOverlayAmberCompactLabelClass}>羧酸根接入节点</span>
          </Html>
        </>
      ) : null}
    </group>
  );
}

function TopologyFramework({
  counting,
  showGuests,
  showLabels,
  showPore,
}: {
  counting: boolean;
  showGuests: boolean;
  showLabels: boolean;
  showPore: boolean;
}) {
  const labelNodeId = "node-p-p-p";
  const showPeriodicExtension = !counting && !showPore && !showGuests;

  return (
    <group>
      {showPore ? <PoreVolume /> : null}
      {showGuests ? <GuestMolecules /> : null}

      {pcuGeometry.linkers.map((linker) => (
        <TopologyLinker
          key={linker.id}
          linker={linker}
          showLabel={false}
        />
      ))}
      {pcuGeometry.nodes.map((node) => (
        <TopologyNode
          key={node.id}
          position={node.position}
          showLabel={showLabels && node.id === labelNodeId && !counting}
        />
      ))}

      {showPeriodicExtension
        ? pcuGeometry.periodicStubs.map((stub) => (
            <TopologyPeriodicStub key={stub.id} stub={stub} />
          ))
        : null}

      {showPeriodicExtension ? (
        <>
          <Html center distanceFactor={7.5} pointerEvents="none" position={[0, -1.12, 0]}>
            <span className={htmlOverlaySubtleWideLabelClass}>pcu｜每个节点沿 ±x、±y、±z 六方向连接</span>
          </Html>
          <Html center distanceFactor={8.2} pointerEvents="none" position={[0, 1.18, 0]}>
            <span className={htmlOverlayCompactLabelClass}>虚线末端｜跨晶胞继续连接</span>
          </Html>
        </>
      ) : null}

      {counting ? <CountingLabels /> : null}
    </group>
  );
}

function TopologyPeriodicStub({ stub }: { stub: PcuPeriodicStub }) {
  const firstEnd = lerp(stub.start, stub.end, 0.4);
  const secondStart = lerp(stub.start, stub.end, 0.62);

  return (
    <group>
      <StickCylinder
        color={FRAME_COLOR}
        end={firstEnd}
        opacity={0.38}
        radius={0.008}
        start={stub.start}
      />
      <StickCylinder
        color={FRAME_COLOR}
        end={stub.end}
        opacity={0.38}
        radius={0.008}
        start={secondStart}
      />
      <AtomSphere color={FRAME_COLOR} opacity={0.3} position={stub.end} radius={0.025} />
    </group>
  );
}

function TopologyLinker({ linker, showLabel }: { linker: PcuLinker; showLabel: boolean }) {
  const startRing = linker.ring[3];
  const endRing = linker.ring[0];
  const startOxygen = lerp(linker.start, startRing, 0.34);
  const endOxygen = lerp(linker.end, endRing, 0.34);

  return (
    <group>
      <StickCylinder color={CARBON_COLOR} end={startRing} opacity={0.72} radius={0.012} start={linker.start} />
      <StickCylinder color={CARBON_COLOR} end={linker.end} opacity={0.72} radius={0.012} start={endRing} />
      <AtomSphere color={OXYGEN_COLOR} position={startOxygen} radius={0.035} />
      <AtomSphere color={OXYGEN_COLOR} position={endOxygen} radius={0.035} />
      {linker.ring.map((position, index) => (
        <group key={`${linker.id}-ring-${index}`}>
          <AtomSphere color={CARBON_COLOR} position={position} radius={0.042} />
          <StickCylinder
            color={CARBON_COLOR}
            end={linker.ring[(index + 1) % linker.ring.length]}
            opacity={0.82}
            radius={0.009}
            start={position}
          />
        </group>
      ))}
      {showLabel ? (
        <Html center distanceFactor={7.8} pointerEvents="none" position={add(midpoint(linker.start, linker.end), [0, 0.24, 0])}>
          <span className={htmlOverlayAmberCompactLabelClass}>BDC 拓扑边</span>
        </Html>
      ) : null}
    </group>
  );
}

function TopologyNode({ position, showLabel = false }: { position: Vec3; showLabel?: boolean }) {
  return (
    <group position={position}>
      <mesh>
        <octahedronGeometry args={[0.135, 1]} />
        <meshStandardMaterial color={ZN_COLOR} metalness={0.3} roughness={0.28} />
      </mesh>
      <mesh scale={0.45}>
        <sphereGeometry args={[0.135, 20, 20]} />
        <meshStandardMaterial color={OXYGEN_COLOR} roughness={0.38} />
      </mesh>
      {showLabel ? (
        <Html center distanceFactor={7.8} pointerEvents="none" position={[0, 0.25, 0]}>
          <span className={htmlOverlayLabelClass}>Zn₄O SBU 节点</span>
        </Html>
      ) : null}
    </group>
  );
}

function PoreVolume() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.34, 1.34, 1.34]} />
        <meshPhysicalMaterial
          color={PORE_COLOR}
          depthWrite={false}
          opacity={0.1}
          roughness={0.78}
          transparent
        />
      </mesh>
      <mesh>
        <boxGeometry args={[1.36, 1.36, 1.36]} />
        <meshBasicMaterial color={PORE_COLOR} opacity={0.18} transparent wireframe />
      </mesh>
      <Html center distanceFactor={7.4} pointerEvents="none" position={[0, 0.9, 0]}>
        <span className={htmlOverlayAmberStrongLabelClass}>孔隙体积（教学示意）</span>
      </Html>
    </group>
  );
}

function GuestMolecules() {
  const guests: Vec3[] = [
    [-0.26, 0.18, 0.2],
    [0.24, -0.22, -0.16],
    [0.08, 0.3, -0.3],
  ];

  return (
    <group>
      {guests.map((position, index) => (
        <group key={`guest-${index}`} position={position}>
          <mesh>
            <sphereGeometry args={[0.078, 24, 24]} />
            <meshStandardMaterial
              color={PORE_COLOR}
              emissive={PORE_COLOR}
              emissiveIntensity={0.14}
              roughness={0.32}
            />
          </mesh>
          <mesh scale={1.65}>
            <sphereGeometry args={[0.078, 20, 20]} />
            <meshBasicMaterial color={PORE_COLOR} opacity={0.12} transparent />
          </mesh>
        </group>
      ))}
      <Html center distanceFactor={7.4} pointerEvents="none" position={[0, -0.72, 0]}>
        <span className={htmlOverlayAmberStrongLabelClass}>客体分子（示意）</span>
      </Html>
    </group>
  );
}

function CountingLabels() {
  return (
    <>
      <Html center distanceFactor={5.5} pointerEvents="none" position={[-1.5, 0.08, 0]}>
        <span className={htmlOverlayLabelClass}>8×1/8 = 1 SBU</span>
      </Html>
      <Html center distanceFactor={6} pointerEvents="none" position={[1.3, -0.08, 0]}>
        <span className={htmlOverlayAmberStrongLabelClass}>12×1/4 = 3 BDC</span>
      </Html>
      <Html center distanceFactor={6} pointerEvents="none" position={[-1.02, -1.22, 0]}>
        <span className={htmlOverlayLabelClass}>Zn₄O(BDC)₃</span>
      </Html>
      <Html center distanceFactor={5.8} pointerEvents="none" position={[0, 1.28, 0]}>
        <span className={htmlOverlayCompactLabelClass}>Fm-3m 常规晶胞：Z = 8</span>
      </Html>
    </>
  );
}

function AtomSphere({
  color,
  metal = false,
  opacity = 1,
  position,
  radius,
}: {
  color: string;
  metal?: boolean;
  opacity?: number;
  position: Vec3;
  radius: number;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 28, 28]} />
      <meshStandardMaterial
        color={color}
        metalness={metal ? 0.32 : 0.03}
        opacity={opacity}
        roughness={metal ? 0.28 : 0.4}
        transparent={opacity < 1}
      />
    </mesh>
  );
}

function AtomLegend() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs">
      <LegendItem color={ZN_COLOR} label="Zn / SBU" />
      <LegendItem color={CARBON_COLOR} label="C / BDC" />
      <LegendItem color={OXYGEN_COLOR} label="O" />
      <LegendItem color={PORE_COLOR} label="孔隙 / 客体" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function getCameraPreset(viewMode: CrystalViewMode): {
  fov: number;
  position: Vec3;
  rotation: Vec3;
  scale: number;
  yOffset: number;
} {
  if (viewMode === "coordination") {
    return { fov: 38, position: [3.3, 2.5, 4.2], rotation: [0.2, -0.5, 0], scale: 1.55, yOffset: -0.02 };
  }
  if (viewMode === "covalentNetwork") {
    return { fov: 38, position: [3.9, 2.35, 5.1], rotation: [0.18, -0.24, -0.04], scale: 1.4, yOffset: -0.03 };
  }
  if (viewMode === "comparison") {
    return { fov: 39, position: [4.7, 3.1, 6.1], rotation: [0.12, -0.18, 0], scale: 1.36, yOffset: -0.04 };
  }
  if (viewMode === "counting") {
    return { fov: 40, position: [4.8, 3.7, 5.9], rotation: [0.18, -0.5, 0], scale: 1.2, yOffset: -0.02 };
  }
  return { fov: 39, position: [4.6, 3.5, 5.7], rotation: [0.18, -0.54, 0], scale: 1.34, yOffset: -0.03 };
}
