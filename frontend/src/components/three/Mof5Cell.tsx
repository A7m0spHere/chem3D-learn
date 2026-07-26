import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { CameraRig } from "@/components/three/CameraRig";
import { CalloutLabel } from "@/components/three/CalloutLabel";
import {
  htmlOverlayAmberCompactLabelClass,
  htmlOverlayAmberStrongLabelClass,
  htmlOverlayCompactLabelClass,
  htmlOverlayLabelClass,
  htmlOverlaySubtleWideLabelClass,
} from "@/components/three/htmlOverlayStyles";
import {
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
      {/* 左侧金属簇：锚点落在簇上沿，标签外推到左上留白。 */}
      <CalloutLabel anchor={[-0.92, 0.34, 0]} offset={[-0.52, 0.72, 0]}>
        <span className={htmlOverlayLabelClass}>金属簇节点｜Zn₄O SBU</span>
      </CalloutLabel>
      {/* 右侧连接体：锚点落在苯环上沿，标签外推到右上留白。 */}
      <CalloutLabel anchor={[0.92, 0.24, 0]} offset={[0.52, 0.78, 0]}>
        <span className={htmlOverlayAmberStrongLabelClass}>有机连接体｜BDC</span>
      </CalloutLabel>
      {/* 这条是整幅对比图的总结，不指向单一结构，保持底部留白处的普通标签。 */}
      <Html center pointerEvents="none" position={[0, -0.92, 0]}>
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
          {/* 锚点落在中心 μ₄-O 上，标签外推到左上；原位置 [0,0.76,0] 正好压在 +y 连接点上。 */}
          <CalloutLabel anchor={[0, 0, 0]} offset={[-0.58, 0.98, 0]}>
            <span className={htmlOverlayLabelClass}>Zn₄O 核心｜4 个 Zn</span>
          </CalloutLabel>
          {/* 锚点落在其中一个 Zn 上，标签外推到右上；coordination 视图放大明显，需要更大偏移才能真正推到外围。 */}
          <CalloutLabel anchor={znPositions[0]} offset={[1.45, 0.72, 0]}>
            <span className={htmlOverlaySubtleWideLabelClass}>单个 Zn：O 四配位</span>
          </CalloutLabel>
          {/* 锚点落在近核的 −y 连接臂上（而非最外单一末端），引线从辐射源附近沿连接臂
              延伸，暗示 SBU 向 ±x/±y/±z 六方向辐射；标签外推到左下，不与核心标签重叠。 */}
          <CalloutLabel anchor={[0, -0.3, 0]} offset={[-0.62, -0.5, 0]}>
            <span className={htmlOverlayAmberCompactLabelClass}>整个 SBU：六连接方向</span>
          </CalloutLabel>
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
          {/* 锚点落在整条连接体的几何中心（两端 node 连线的对称轴上），
              引线沿主轴向上外推，才表达"线性二连接体"的整体跨度，而非只指苯环。 */}
          <CalloutLabel anchor={[0, 0, 0]} offset={[0.5, 0.92, 0]}>
            <span className={htmlOverlayLabelClass}>BDC²⁻｜线性二连接体</span>
          </CalloutLabel>
          {/* 锚点落在苯环下沿键上，明确指向中央苯环，标签外推到右下。 */}
          <CalloutLabel anchor={[0, -0.36, 0]} offset={[0.7, -0.6, 0]}>
            <span className={htmlOverlayCompactLabelClass}>苯环提供刚性间隔</span>
          </CalloutLabel>
          {/* 锚点落在左侧羧酸氧 [-0.79] 与节点 [-1.04] 连线中点，正压在 O→node
              的半透明衔接键上，既贴节点又体现"羧酸根接入节点"。 */}
          <CalloutLabel anchor={[-0.91, 0, 0]} offset={[-0.4, -0.66, 0]}>
            <span className={htmlOverlayAmberCompactLabelClass}>羧酸根接入节点</span>
          </CalloutLabel>
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
          {/* 锚点落在左侧角节点 [-0.88,0.88,0.88]——六条连接臂正是从这个 pcu 节点沿
              ±x/±y/±z 辐射；文案是"每个节点"，锚任意真实节点都成立。锚到左侧节点并推向
              左上，与右上的"虚线末端"标签分居两端，避免二者投影后重叠。 */}
          <CalloutLabel anchor={[-0.88, 0.88, 0.88]} offset={[-0.9, 0.72, 0]}>
            <span className={htmlOverlaySubtleWideLabelClass}>pcu｜每个节点沿 ±x、±y、±z 六方向连接</span>
          </CalloutLabel>
          {/* 锚点落在右侧角节点 [0.88,0.88,0.88] 的 +y 周期虚线真实末端 [0.88,1.20,0.88]，
              引线指向那根往晶胞外延伸的虚线端。推向右上，与左侧的 pcu 标签分居两端。 */}
          <CalloutLabel anchor={[0.88, 1.2, 0.88]} offset={[0.7, 0.42, 0]}>
            <span className={htmlOverlayCompactLabelClass}>虚线末端｜跨晶胞继续连接</span>
          </CalloutLabel>
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
        <CalloutLabel
          anchor={midpoint(linker.start, linker.end)}
          offset={[0, 0.42, 0]}
        >
          <span className={htmlOverlayAmberCompactLabelClass}>BDC 拓扑边</span>
        </CalloutLabel>
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
        <Html center pointerEvents="none" position={[0, 0.25, 0]}>
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
      {/* 锚点在孔隙立方体顶面中心，标签外推到右上方，避免压在孔隙与框架上。 */}
      <CalloutLabel anchor={[0, 0.68, 0]} offset={[1.02, 0.62, 0]}>
        <span className={htmlOverlayAmberStrongLabelClass}>孔隙体积（教学示意）</span>
      </CalloutLabel>
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
      {/* 锚点落在中间那个客体小球上，标签外推到左下方。 */}
      <CalloutLabel anchor={[0.24, -0.22, -0.16]} offset={[-0.86, -0.84, 0]}>
        <span className={htmlOverlayAmberStrongLabelClass}>客体分子（示意）</span>
      </CalloutLabel>
    </group>
  );
}

function CountingLabels() {
  return (
    <>
      {/* 顶点计数：锚点指向左上前顶角节点本身，标签外推到左侧空白。 */}
      <CalloutLabel anchor={[-0.88, 0.88, 0.88]} offset={[-0.62, -0.5, 0]}>
        <span className={htmlOverlayLabelClass}>8×1/8 = 1 SBU</span>
      </CalloutLabel>
      {/* 棱计数：锚点指向右前竖棱（y 向连接体）中点，标签外推到右侧空白。 */}
      <CalloutLabel anchor={[0.88, 0, 0.88]} offset={[0.5, -0.12, 0]}>
        <span className={htmlOverlayAmberStrongLabelClass}>12×1/4 = 3 BDC</span>
      </CalloutLabel>
      <Html center pointerEvents="none" position={[-1.02, -1.22, 0]}>
        <span className={htmlOverlayLabelClass}>Zn₄O(BDC)₃</span>
      </Html>
      <Html center pointerEvents="none" position={[0, 1.28, 0]}>
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
