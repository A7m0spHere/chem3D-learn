import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { CalloutLabel } from "@/components/three/CalloutLabel";
import { CameraRig } from "@/components/three/CameraRig";
import {
  htmlOverlayAmberCompactLabelClass,
  htmlOverlayAmberStrongLabelClass,
  htmlOverlayCompactLabelClass,
  htmlOverlayLabelClass,
  htmlOverlaySubtleWideLabelClass,
} from "@/components/three/htmlOverlayStyles";
import {
  createMxenePatch,
  createTerminationSites,
  OCTAHEDRAL_TI_POSITIONS,
  OCTAHEDRON_EDGES,
  translate,
  type MxeneLayerAtom,
  type MxenePatch,
  type TerminationSite,
} from "@/components/three/mxeneGeometry";
import { SceneLighting } from "@/components/three/SceneLighting";
import { StickCylinder, type Vec3 } from "@/components/three/StickCylinder";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import type { CrystalViewMode, MoleculeRecord } from "@/types/molecule";

type MxeneCellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  showLabels: boolean;
  loading?: boolean;
};

const TI_COLOR = "#2A9D8F";
const TI_INNER_COLOR = "#1F6F68";
const CARBON_COLOR = "#334155";
const ALUMINUM_COLOR = "#F4A261";
const OXYGEN_COLOR = "#DC2626";
const FLUORINE_COLOR = "#6CCFC3";
const HYDROGEN_COLOR = "#F8FAFC";
const GUIDE_COLOR = "#64748B";
const INTERLAYER_COLOR = "#93C5FD";

const fullPatch = createMxenePatch(2, 0.5);
const compactPatch = createMxenePatch(1, 0.48);
const fullTerminations = createTerminationSites(fullPatch, 7);
const compactTerminations = createTerminationSites(compactPatch, 3);

export function MxeneCell({
  molecule,
  viewMode,
  showLabels,
  loading = false,
}: MxeneCellProps) {
  const activeMode = molecule.crystalTeaching?.viewModes.find((mode) => mode.id === viewMode);
  const camera = getCameraPreset(viewMode);

  return (
    <ThreeViewerFrame
      className="min-h-[540px] sm:min-h-[500px]"
      footerMeta={<MxeneLegend />}
      loading={loading}
      meta="拖拽旋转 · 标签只保留当前焦点"
      stageTestId="mxene-canvas"
      summary={activeMode?.bodyZh ?? molecule.summaryZh}
      title={`Ti₃C₂Tₓ｜${activeMode?.titleZh ?? "MXene 二维片层"}`}
      viewerTestId="mxene-viewer"
    >
      <Canvas
        camera={{ position: camera.position, fov: camera.fov }}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ alpha: false }}
        style={{ backgroundColor: "#F7FAF9", height: "100%", width: "100%" }}
      >
        <color attach="background" args={["#F7FAF9"]} />
        <SceneLighting
          ambient={0.72}
          mainIntensity={1.36}
          mainPosition={[4, 6, 5]}
          secondaryIntensity={0.42}
          secondaryPosition={[-4, 2, -3]}
        />
        <CameraRig fov={camera.fov} position={camera.position} resetKey={viewMode} />
        <group
          position={[0, camera.yOffset, 0]}
          rotation={camera.rotation}
          scale={camera.scale}
        >
          <MxeneScene showLabels={showLabels} viewMode={viewMode} />
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

function MxeneScene({ showLabels, viewMode }: { showLabels: boolean; viewMode: CrystalViewMode }) {
  switch (viewMode) {
    case "comparison":
      return <MaxToMxeneScene />;
    case "layer":
      return <FiveLayerScene showLabels={showLabels} />;
    case "coordination":
      return <CarbonCoordinationScene />;
    case "covalentNetwork":
      return <TerminationScene showLabels={showLabels} />;
    case "interlayerForce":
      return <RestackingScene />;
    case "counting":
      return <FormulaScene />;
    default:
      return <FiveLayerScene showLabels={showLabels} />;
  }
}

function MaxToMxeneScene() {
  return (
    <>
      <group position={[-1.2, 0, 0]} scale={0.72}>
        <MaxPrecursorBlock />
      </group>
      <group position={[1.2, 0, 0]} scale={0.82}>
        <MxenePatchModel patch={compactPatch} showBonds showPlanes />
        <TerminationMarkers sites={compactTerminations} />
      </group>

      {/* 锚点落在左侧 MAX 块中心，标签外推到左上留白 */}
      <CalloutLabel anchor={[-1.2, 0.4, 0]} offset={[-0.5, 1.0, 0]}>
        <span className={htmlOverlayAmberStrongLabelClass}>MAX 前驱体｜Ti₃AlC₂</span>
      </CalloutLabel>
      {/* 锚点落在右侧 MXene 片层中心，标签外推到右上留白 */}
      <CalloutLabel anchor={[1.2, 0.3, 0]} offset={[0.5, 1.06, 0]}>
        <span className={htmlOverlayLabelClass}>二维片层｜Ti₃C₂Tₓ</span>
      </CalloutLabel>
      {/* 全局工艺说明，不指向单一结构：保持 <Html> */}
      <Html center distanceFactor={7.2} pointerEvents="none" position={[0, -1.78, 0]}>
        <span className={htmlOverlayAmberCompactLabelClass}>选择性移除 Al + 剥离 →</span>
      </Html>
    </>
  );
}

function MaxPrecursorBlock() {
  return (
    <>
      <group position={[0, 0.72, 0]} scale={0.64}>
        <MxenePatchModel patch={compactPatch} showBonds />
      </group>
      <group position={[0, -0.72, 0]} scale={0.64}>
        <MxenePatchModel patch={compactPatch} showBonds />
      </group>
      <LayerPlane color={ALUMINUM_COLOR} opacity={0.14} radius={0.82} y={0} />
      {compactPatch.layers[0].atoms.map((atom) => (
        <AtomSphere
          color={ALUMINUM_COLOR}
          key={`al-${atom.id}`}
          metal
          position={[atom.position[0], 0, atom.position[2]]}
          radius={0.105}
        />
      ))}
      {/* 锚点落在 Al 插层中心（y=0），标签往左上外推——本块在场景左侧，
          必须朝远离场景中心的方向推，才能真正推到外围留白（本组 scale=0.72，偏移已放大补偿）。 */}
      <CalloutLabel anchor={[0, 0, 0]} offset={[-1.15, 0.4, 0]}>
        <span className={htmlOverlayAmberStrongLabelClass}>Al 层</span>
      </CalloutLabel>
    </>
  );
}

function FiveLayerScene({ showLabels }: { showLabels: boolean }) {
  return (
    <>
      <MxenePatchModel patch={fullPatch} showBonds showPlanes />
      <Html center distanceFactor={7} pointerEvents="none" position={[0, 1.02, 0]}>
        <span className={htmlOverlayLabelClass}>厚度方向：Ti–C–Ti–C–Ti</span>
      </Html>
      {showLabels ? (
        <>
          <LayerLabel label="代表性表面 Ti" position={[-1.56, 0.68, 0.08]} tone="ti" />
          <LayerLabel label="内部 Ti" position={[-1.56, 0, 0.08]} tone="ti" />
          <LayerLabel label="C 层 × 2" position={[1.52, 0.14, 0.08]} tone="c" />
        </>
      ) : null}
    </>
  );
}

function CarbonCoordinationScene() {
  return (
    <>
      <AtomSphere color={CARBON_COLOR} position={[0, 0, 0]} radius={0.13} />
      {OCTAHEDRAL_TI_POSITIONS.map((position, index) => (
        <group key={`coordination-ti-${index}`}>
          <StickCylinder
            color={TI_INNER_COLOR}
            end={position}
            opacity={0.78}
            radius={0.018}
            start={[0, 0, 0]}
          />
          <AtomSphere color={TI_COLOR} metal position={position} radius={0.16} />
        </group>
      ))}
      {OCTAHEDRON_EDGES.map(([first, second], index) => (
        <StickCylinder
          color={TI_COLOR}
          end={OCTAHEDRAL_TI_POSITIONS[second]}
          key={`octahedron-edge-${index}`}
          opacity={0.2}
          radius={0.007}
          start={OCTAHEDRAL_TI_POSITIONS[first]}
        />
      ))}
      {/* 锚点落在中心 C 原子 [0,0,0]，标签外推到上方留白 */}
      <CalloutLabel anchor={[0, 0, 0]} offset={[-0.5, 0.9, 0]}>
        <span className={htmlOverlayLabelClass}>C 中心｜6 个 Ti 最近邻</span>
      </CalloutLabel>
      {/* 锚点引用真实 Ti 顶点（八面体一角），标签外推到右下留白 */}
      <CalloutLabel anchor={OCTAHEDRAL_TI_POSITIONS[5]} offset={[0.72, -0.34, 0]}>
        <span className={htmlOverlayCompactLabelClass}>Ti₆ 八面体轮廓</span>
      </CalloutLabel>
      {/* 全局说明，不指向单一结构，保持 Html */}
      <Html center distanceFactor={6.8} pointerEvents="none" position={[0, -0.84, 0]}>
        <span className={htmlOverlaySubtleWideLabelClass}>辅助线表示局部配位，不增加新的化学键</span>
      </Html>
    </>
  );
}

function TerminationScene({ showLabels }: { showLabels: boolean }) {
  return (
    <>
      <MxenePatchModel patch={fullPatch} showBonds />
      <TerminationMarkers annotate sites={fullTerminations} />
      {/* 锚点落在顶层端基原子（顶层 Ti y=0.56 + 端基偏移 0.27），标签外推到上方留白 */}
      <CalloutLabel anchor={[0, 0.83, 0]} offset={[0.5, 0.5, 0]}>
        <span className={htmlOverlayLabelClass}>O / OH / F 混合端基示意</span>
      </CalloutLabel>
      {/* 全局说明，不指向单一结构，保持 Html */}
      <Html center distanceFactor={7} pointerEvents="none" position={[0, -1.1, 0]}>
        <span className={htmlOverlaySubtleWideLabelClass}>端基位于片层两侧的外层 Ti 表面</span>
      </Html>
      {showLabels ? (
        <Html center distanceFactor={7} pointerEvents="none" position={[0, -1.34, 0]}>
          <span className={htmlOverlayAmberCompactLabelClass}>位置与比例不代表真实样品</span>
        </Html>
      ) : null}
    </>
  );
}

function RestackingScene() {
  const offsets: Vec3[] = [
    [-0.08, 0.86, 0.02],
    [0.08, 0, -0.04],
    [-0.04, -0.86, 0.06],
  ];

  return (
    <>
      {offsets.map((offset, index) => (
        <group key={`restacked-sheet-${index}`} position={offset} scale={[0.84, 0.5, 0.84]}>
          <MxenePatchModel patch={compactPatch} showBonds />
          <TerminationMarkers sites={compactTerminations} />
        </group>
      ))}
      <LayerPlane color={INTERLAYER_COLOR} opacity={0.09} radius={1.1} y={0.43} />
      <LayerPlane color={INTERLAYER_COLOR} opacity={0.09} radius={1.1} y={-0.43} />
      <WaterMolecule position={[0.56, 0.42, 0.2]} />
      <WaterMolecule position={[-0.46, -0.42, -0.18]} />
      <AtomSphere color="#60A5FA" position={[0.02, 0.42, -0.42]} radius={0.075} />
      {/* 描述整场景朝向的标题，不指向单一结构，保持 Html */}
      <Html center distanceFactor={7} pointerEvents="none" position={[0, 1.42, 0]}>
        <span className={htmlOverlayLabelClass}>端基化片层重新堆叠</span>
      </Html>
      {/* 锚点落在层间水分子，标签往右外推更远，真正推到结构外围留白 */}
      <CalloutLabel anchor={[0.56, 0.42, 0.2]} offset={[1.05, 0.5, 0]}>
        <span className={htmlOverlayCompactLabelClass}>层间水 / 离子（示意）</span>
      </CalloutLabel>
      <Html center distanceFactor={7} pointerEvents="none" position={[0, -1.4, 0]}>
        <span className={htmlOverlaySubtleWideLabelClass}>层间距受端基、含水状态和插层物种影响</span>
      </Html>
    </>
  );
}

function FormulaScene() {
  return (
    <>
      <group position={[1.18, 0, 0]} scale={0.7}>
        <MxenePatchModel patch={compactPatch} showBonds showPlanes />
        <TerminationMarkers sites={compactTerminations} />
      </group>
      <Html center distanceFactor={7} pointerEvents="none" position={[-1.22, 0.86, 0]}>
        <span className={htmlOverlayAmberStrongLabelClass}>Ti₃AlC₂</span>
      </Html>
      <Html center distanceFactor={7} pointerEvents="none" position={[-1.22, 0.47, 0]}>
        <span className={htmlOverlayCompactLabelClass}>− Al</span>
      </Html>
      <Html center distanceFactor={7} pointerEvents="none" position={[-1.22, 0.08, 0]}>
        <span className={htmlOverlayLabelClass}>Ti₃C₂</span>
      </Html>
      <Html center distanceFactor={7} pointerEvents="none" position={[-1.22, -0.34, 0]}>
        <span className={htmlOverlayCompactLabelClass}>+ 可变表面端基 Tₓ</span>
      </Html>
      <Html center distanceFactor={7} pointerEvents="none" position={[-1.22, -0.78, 0]}>
        <span className={htmlOverlayLabelClass}>Ti₃C₂Tₓ</span>
      </Html>
      <Html center distanceFactor={7} pointerEvents="none" position={[0, 1.34, 0]}>
        <span className={htmlOverlayAmberCompactLabelClass}>通式：Mₙ₊₁XₙTₓ</span>
      </Html>
      <Html center distanceFactor={7} pointerEvents="none" position={[0, -1.3, 0]}>
        <span className={htmlOverlaySubtleWideLabelClass}>Ti:C = 3:2 固定；Tₓ 的种类与数量可变</span>
      </Html>
    </>
  );
}

function MxenePatchModel({
  patch,
  showBonds = false,
  showPlanes = false,
}: {
  patch: MxenePatch;
  showBonds?: boolean;
  showPlanes?: boolean;
}) {
  const planeRadius = patch.spacing * (patch.radius + 1.05);

  return (
    <>
      {showPlanes
        ? patch.layers.map((layer) => (
            <LayerPlane
              color={layer.element === "Ti" ? TI_COLOR : CARBON_COLOR}
              key={`plane-${layer.id}`}
              opacity={layer.element === "Ti" ? 0.045 : 0.035}
              radius={planeRadius}
              y={layer.y}
            />
          ))
        : null}
      {showBonds
        ? patch.links.map((link) => (
            <StickCylinder
              color={GUIDE_COLOR}
              end={link.end}
              key={link.id}
              opacity={0.34}
              radius={0.009}
              start={link.start}
            />
          ))
        : null}
      {patch.layers.flatMap((layer) =>
        layer.atoms.map((atom) => <LayerAtom atom={atom} key={atom.id} />),
      )}
    </>
  );
}

function LayerAtom({ atom }: { atom: MxeneLayerAtom }) {
  const isTitanium = atom.element === "Ti";
  const isInnerTitanium = atom.layerId === "ti-inner";
  return (
    <AtomSphere
      color={isTitanium ? (isInnerTitanium ? TI_INNER_COLOR : TI_COLOR) : CARBON_COLOR}
      metal={isTitanium}
      position={atom.position}
      radius={isTitanium ? 0.105 : 0.078}
    />
  );
}

function TerminationMarkers({
  annotate = false,
  sites,
}: {
  annotate?: boolean;
  sites: TerminationSite[];
}) {
  const labelledKinds = new Set<string>();

  return (
    <>
      {sites.map((site) => {
        const color = site.kind === "F" ? FLUORINE_COLOR : OXYGEN_COLOR;
        const shouldLabel = annotate && site.side === "top" && !labelledKinds.has(site.kind);
        if (shouldLabel) labelledKinds.add(site.kind);

        return (
          <group key={site.id}>
            <StickCylinder
              color={color}
              end={site.atom}
              opacity={0.7}
              radius={0.013}
              start={site.anchor}
            />
            <AtomSphere color={color} position={site.atom} radius={0.075} />
            {site.hydrogen ? (
              <>
                <StickCylinder
                  color="#CBD5E1"
                  end={site.hydrogen}
                  opacity={0.8}
                  radius={0.009}
                  start={site.atom}
                />
                <AtomSphere color={HYDROGEN_COLOR} position={site.hydrogen} radius={0.045} />
              </>
            ) : null}
            {shouldLabel ? (
              <Html
                center
                distanceFactor={6.8}
                pointerEvents="none"
                position={translate(site.hydrogen ?? site.atom, [0.08, 0.12, 0.04])}
              >
                <span className={htmlOverlayCompactLabelClass}>{site.kind}</span>
              </Html>
            ) : null}
          </group>
        );
      })}
    </>
  );
}

function LayerPlane({
  color,
  opacity,
  radius,
  y,
}: {
  color: string;
  opacity: number;
  radius: number;
  y: number;
}) {
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 6]} />
      <meshBasicMaterial
        color={color}
        depthWrite={false}
        opacity={opacity}
        side={2}
        transparent
      />
    </mesh>
  );
}

function WaterMolecule({ position }: { position: Vec3 }) {
  const oxygen = position;
  const hydrogenA: Vec3 = [position[0] - 0.08, position[1] + 0.05, position[2]];
  const hydrogenB: Vec3 = [position[0] + 0.06, position[1] + 0.06, position[2] + 0.05];
  return (
    <group>
      <AtomSphere color={OXYGEN_COLOR} position={oxygen} radius={0.06} />
      <AtomSphere color={HYDROGEN_COLOR} position={hydrogenA} radius={0.035} />
      <AtomSphere color={HYDROGEN_COLOR} position={hydrogenB} radius={0.035} />
      <StickCylinder color="#CBD5E1" end={hydrogenA} radius={0.007} start={oxygen} />
      <StickCylinder color="#CBD5E1" end={hydrogenB} radius={0.007} start={oxygen} />
    </group>
  );
}

function LayerLabel({
  label,
  position,
  tone,
}: {
  label: string;
  position: Vec3;
  tone: "ti" | "c";
}) {
  return (
    <Html center distanceFactor={7} pointerEvents="none" position={position}>
      <span className={tone === "ti" ? htmlOverlayLabelClass : htmlOverlayCompactLabelClass}>
        {label}
      </span>
    </Html>
  );
}

function AtomSphere({
  color,
  metal = false,
  position,
  radius,
}: {
  color: string;
  metal?: boolean;
  position: Vec3;
  radius: number;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshStandardMaterial
        color={color}
        metalness={metal ? 0.3 : 0.03}
        roughness={metal ? 0.3 : 0.48}
      />
    </mesh>
  );
}

function MxeneLegend() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs">
      <LegendDot color={TI_COLOR} label="Ti" />
      <LegendDot color={CARBON_COLOR} label="C" />
      <LegendDot color={ALUMINUM_COLOR} label="Al" />
      <LegendDot color={OXYGEN_COLOR} label="O / OH" />
      <LegendDot color={FLUORINE_COLOR} label="F" />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: color }} />
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
  switch (viewMode) {
    case "comparison":
      return { fov: 40, position: [4.8, 3.5, 6.1], rotation: [0.12, -0.28, 0], scale: 0.95, yOffset: 0 };
    case "layer":
      return { fov: 38, position: [4.5, 2.6, 5.7], rotation: [0.12, -0.56, 0], scale: 1.12, yOffset: 0 };
    case "coordination":
      return { fov: 36, position: [3.2, 2.5, 4.2], rotation: [0.16, -0.42, 0], scale: 1.45, yOffset: 0 };
    case "covalentNetwork":
      return { fov: 38, position: [4.4, 3.0, 5.5], rotation: [0.18, -0.5, 0], scale: 1.03, yOffset: 0 };
    case "interlayerForce":
      return { fov: 39, position: [4.6, 3.2, 5.9], rotation: [0.1, -0.42, 0], scale: 1.22, yOffset: 0 };
    case "counting":
      return { fov: 39, position: [4.6, 3.2, 5.8], rotation: [0.08, -0.25, 0], scale: 0.96, yOffset: 0 };
    default:
      return { fov: 39, position: [4.4, 3.1, 5.6], rotation: [0.16, -0.5, 0], scale: 1, yOffset: 0 };
  }
}
