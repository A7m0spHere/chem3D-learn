import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { BufferGeometry, DoubleSide, Float32BufferAttribute } from "three";
import { CameraRig } from "@/components/three/CameraRig";
import {
  htmlOverlayAmberCompactLabelClass,
  htmlOverlayAmberStrongLabelClass,
  htmlOverlayCompactLabelClass,
  htmlOverlayLabelClass,
  htmlOverlaySubtleWideLabelClass,
} from "@/components/three/htmlOverlayStyles";
import {
  REN3_CONVENTIONAL_ATOMS,
  REN3_LATTICE,
  cartesianToScene,
  centerOfPoints,
  convexHullEdges,
  convexHullFaces,
  createRen3NetworkModel,
  getRepresentativeRen3Coordination,
  getRepresentativeTriNitrogenUnit,
  relativeCartesianToScene,
  type Ren3Atom,
} from "@/components/three/ren3Geometry";
import { SceneLighting } from "@/components/three/SceneLighting";
import { StickCylinder, type Vec3 } from "@/components/three/StickCylinder";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import type { CrystalViewMode, MoleculeRecord } from "@/types/molecule";

type Ren3CellProps = {
  molecule: MoleculeRecord;
  viewMode: CrystalViewMode;
  showLabels: boolean;
  loading?: boolean;
};

const RE_COLOR = "#64748B";
const RE_DARK_COLOR = "#475569";
const NITROGEN_COLOR = "#2563EB";
const N_N_COLOR = "#F4A261";
const COORDINATION_COLOR = "#2A9D8F";
const CELL_COLOR = "#334155";
const BACKGROUND_COLOR = "#F7FAF9";
const CELL_SCALE = 0.52;

const coordination = getRepresentativeRen3Coordination();
const coordinationPoints = coordination.neighbors.map((neighbor) =>
  relativeCartesianToScene(neighbor.relative),
);
const triNitrogenUnit = getRepresentativeTriNitrogenUnit();
const triNitrogenPoints = triNitrogenUnit.terminals.map((terminal) =>
  relativeCartesianToScene(terminal.relative, 0.92),
);
const networkModel = createRen3NetworkModel();
const networkOrigin = centerOfPoints(networkModel.atoms.map((atom) => atom.cartesian));
const cellDimensions: Vec3 = [
  REN3_LATTICE.a * CELL_SCALE,
  REN3_LATTICE.c * CELL_SCALE,
  REN3_LATTICE.b * CELL_SCALE,
];
const cellEdges = createBoxEdges(cellDimensions);

export function Ren3Cell({
  molecule,
  viewMode,
  showLabels,
  loading = false,
}: Ren3CellProps) {
  const activeMode = molecule.crystalTeaching?.viewModes.find((mode) => mode.id === viewMode);
  const camera = getCameraPreset(viewMode);

  return (
    <ThreeViewerFrame
      className="min-h-[540px] sm:min-h-[500px]"
      footerMeta={<Ren3Legend />}
      loading={loading}
      meta="拖拽旋转 · 理论预测模型"
      stageTestId="ren3-canvas"
      summary={activeMode?.bodyZh ?? molecule.summaryZh}
      title={`ReN₃｜${activeMode?.titleZh ?? "Imm2 高压预测相"}`}
      viewerTestId="ren3-viewer"
    >
      <Canvas
        camera={{ position: camera.position, fov: camera.fov }}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ alpha: false }}
        style={{ backgroundColor: BACKGROUND_COLOR, height: "100%", width: "100%" }}
      >
        <color attach="background" args={[BACKGROUND_COLOR]} />
        <SceneLighting
          ambient={0.74}
          mainIntensity={1.38}
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
          <Ren3Scene showLabels={showLabels} viewMode={viewMode} />
        </group>
        <OrbitControls
          enableDamping={false}
          enablePan={false}
          makeDefault
          maxDistance={10}
          minDistance={2.2}
          target={[0, 0, 0]}
        />
      </Canvas>
    </ThreeViewerFrame>
  );
}

function Ren3Scene({ showLabels, viewMode }: { showLabels: boolean; viewMode: CrystalViewMode }) {
  switch (viewMode) {
    case "pressure":
      return <PressureWindowScene />;
    case "cell":
      return <OrthorhombicCellScene showLabels={showLabels} />;
    case "covalentNetwork":
      return <TriNitrogenScene showLabels={showLabels} />;
    case "coordination":
      return <ReSevenCoordinationScene showLabels={showLabels} />;
    case "polyhedron":
      return <PolyhedralNetworkScene showLabels={showLabels} />;
    case "counting":
      return <CountingAndPropertyScene />;
    default:
      return <PressureWindowScene />;
  }
}

function PressureWindowScene() {
  return (
    <>
      <group position={[0, 0.34, 0]} scale={0.7}>
        <CellModel showFrame />
      </group>
      <Html center distanceFactor={7} pointerEvents="none" position={[0, 1.52, 0]}>
        <span className={htmlOverlayLabelClass}>Imm2-ReN₃｜理论预测相</span>
      </Html>
      <Html center distanceFactor={7} pointerEvents="none" position={[0, -1.28, 0]}>
        <div className="w-[290px] rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-slate-700 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span>0 GPa</span>
            <span className="text-amber-700">38.3 GPa</span>
            <span>100 GPa</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-slate-200">
            <span
              className="absolute inset-y-0 rounded-full bg-[#F4A261]"
              style={{ left: "38.3%", width: "61.7%" }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-[11px] leading-4">
            <span>0 GPa 松弛参考结构</span>
            <span className="font-semibold text-amber-700">计算稳定区</span>
          </div>
        </div>
      </Html>
      <Html center distanceFactor={7} pointerEvents="none" position={[0, -1.88, 0]}>
        <span className={htmlOverlaySubtleWideLabelClass}>预测稳定 ≠ 已实验确认；晶格不按压力条比例形变</span>
      </Html>
    </>
  );
}

function OrthorhombicCellScene({ showLabels }: { showLabels: boolean }) {
  const reAtoms = REN3_CONVENTIONAL_ATOMS.filter((atom) => atom.element === "Re");

  return (
    <>
      <CellModel showFrame />
      <StickCylinder
        color={COORDINATION_COLOR}
        end={cartesianToScene(reAtoms[1].cartesian)}
        opacity={0.28}
        radius={0.008}
        start={cartesianToScene(reAtoms[0].cartesian)}
      />
      <Html center distanceFactor={7} pointerEvents="none" position={[0, 1.66, 0]}>
        <span className={htmlOverlayLabelClass}>Imm2｜I 心正交常规晶胞</span>
      </Html>
      <Html center distanceFactor={7} pointerEvents="none" position={[0, -1.66, 0]}>
        <span className={htmlOverlaySubtleWideLabelClass}>a = 5.25 Å｜b = 2.81 Å｜c = 4.75 Å（0 GPa 松弛参考）</span>
      </Html>
      <CellAxisLabels />
      {showLabels ? <RepresentativeSiteLabels /> : null}
    </>
  );
}

function TriNitrogenScene({ showLabels }: { showLabels: boolean }) {
  return (
    <>
      {triNitrogenPoints.map((position, index) => (
        <group key={`n3-terminal-${index}`}>
          <StickCylinder
            color={N_N_COLOR}
            end={position}
            opacity={0.92}
            radius={0.028}
            start={[0, 0, 0]}
          />
          <AtomSphere color={NITROGEN_COLOR} position={position} radius={0.19} />
        </group>
      ))}
      <AtomSphere color={NITROGEN_COLOR} position={[0, 0, 0]} radius={0.2} />
      <Html center distanceFactor={6.8} pointerEvents="none" position={[0, 1.1, 0]}>
        <span className={htmlOverlayLabelClass}>N₃ 单元｜N1–N2–N1</span>
      </Html>
      <Html center distanceFactor={6.8} pointerEvents="none" position={[0, -1.08, 0]}>
        <span className={htmlOverlayAmberStrongLabelClass}>两条短 N–N 距离 ≈ 1.36 Å</span>
      </Html>
      <Html center distanceFactor={6.8} pointerEvents="none" position={[0, -1.5, 0]}>
        <span className={htmlOverlaySubtleWideLabelClass}>晶体网络中的折线形连接单元，不是自由小分子</span>
      </Html>
      {showLabels ? (
        <>
          <SiteLabel label="N2 2b" position={[0.06, 0.28, 0]} />
          <SiteLabel label="N1 4c" position={add(triNitrogenPoints[0], [-0.08, 0.28, 0])} />
        </>
      ) : null}
    </>
  );
}

function ReSevenCoordinationScene({ showLabels }: { showLabels: boolean }) {
  const faces = convexHullFaces(coordinationPoints);
  const edges = convexHullEdges(faces);

  return (
    <>
      <PolyhedronSurface color={COORDINATION_COLOR} opacity={0.12} vertices={coordinationPoints} />
      {edges.map(([first, second]) => (
        <StickCylinder
          color={COORDINATION_COLOR}
          end={coordinationPoints[second]}
          key={`coordination-edge-${first}-${second}`}
          opacity={0.28}
          radius={0.008}
          start={coordinationPoints[first]}
        />
      ))}
      {coordinationPoints.map((position, index) => (
        <group key={`coordination-n-${index}`}>
          <StickCylinder
            color={RE_DARK_COLOR}
            end={position}
            opacity={0.62}
            radius={0.018}
            start={[0, 0, 0]}
          />
          <AtomSphere color={NITROGEN_COLOR} position={position} radius={0.13} />
        </group>
      ))}
      <AtomSphere color={RE_COLOR} metal position={[0, 0, 0]} radius={0.2} />
      <Html center distanceFactor={6.8} pointerEvents="none" position={[0, 1.42, 0]}>
        <span className={htmlOverlayLabelClass}>Re 中心｜7 个 N 最近邻</span>
      </Html>
      <Html center distanceFactor={6.8} pointerEvents="none" position={[0, -1.38, 0]}>
        <span className={htmlOverlayAmberCompactLabelClass}>ReN₇ 是局部七配位，不是化学式</span>
      </Html>
      {showLabels ? (
        <Html center distanceFactor={6.8} pointerEvents="none" position={[1.05, 0.18, 0]}>
          <span className={htmlOverlayCompactLabelClass}>N1 × 6｜N2 × 1</span>
        </Html>
      ) : null}
    </>
  );
}

function PolyhedralNetworkScene({ showLabels }: { showLabels: boolean }) {
  return (
    <>
      {networkModel.polyhedra.map((polyhedron) => {
        const vertices = polyhedron.vertices.map((position) =>
          cartesianToScene(position, networkOrigin, 0.34),
        );
        return (
          <PolyhedronSurface
            color={COORDINATION_COLOR}
            key={polyhedron.id}
            opacity={0.07}
            vertices={vertices}
          />
        );
      })}
      {networkModel.links.map((link) => (
        <StickCylinder
          color={link.kind === "N-N" ? N_N_COLOR : RE_DARK_COLOR}
          end={cartesianToScene(link.end, networkOrigin, 0.34)}
          key={link.id}
          opacity={link.kind === "N-N" ? 0.86 : 0.5}
          radius={link.kind === "N-N" ? 0.022 : 0.014}
          start={cartesianToScene(link.start, networkOrigin, 0.34)}
        />
      ))}
      {networkModel.atoms.map((atom) => (
        <AtomSphere
          color={atom.element === "Re" ? RE_COLOR : NITROGEN_COLOR}
          key={atom.imageId}
          metal={atom.element === "Re"}
          position={cartesianToScene(atom.cartesian, networkOrigin, 0.34)}
          radius={atom.element === "Re" ? 0.14 : 0.085}
        />
      ))}
      <Html center distanceFactor={7} pointerEvents="none" position={[0, 2.02, 0]}>
        <span className={htmlOverlayLabelClass}>ReN₇ 多面体｜三维周期延展</span>
      </Html>
      <Html center distanceFactor={7} pointerEvents="none" position={[-1.36, -1.7, 0]}>
        <span className={htmlOverlaySubtleWideLabelClass}>共享 N 位点 + N₃ 连接单元 → 延展晶体网络</span>
      </Html>
      {showLabels ? (
        <Html center distanceFactor={7} pointerEvents="none" position={[1.28, 0.12, 0.2]}>
          <span className={htmlOverlayAmberCompactLabelClass}>暖橙：短 N–N 连接</span>
        </Html>
      ) : null}
    </>
  );
}

function CountingAndPropertyScene() {
  return (
    <>
      <group position={[1.05, 0.1, 0]} scale={0.62}>
        <CellModel showFrame />
      </group>
      <Html center distanceFactor={7} pointerEvents="none" position={[-1.22, 0.45, 0]}>
        <div className="w-[210px] space-y-2 rounded-xl border border-slate-200 bg-white/95 p-3 text-sm font-semibold text-slate-700 shadow-sm">
          <div className="rounded-md bg-slate-50 px-3 py-2">Re 2b → 2</div>
          <div className="rounded-md bg-slate-50 px-3 py-2">N 4c + 2b → 4 + 2 = 6</div>
          <div className="rounded-md bg-teal-50 px-3 py-2 text-teal-800">2 Re + 6 N = 2 ReN₃</div>
        </div>
      </Html>
      <Html center distanceFactor={7} pointerEvents="none" position={[0, 1.52, 0]}>
        <span className={htmlOverlayLabelClass}>常规晶胞含 2 个化学式单位</span>
      </Html>
      <Html center distanceFactor={7} pointerEvents="none" position={[0, -1.48, 0]}>
        <span className={htmlOverlaySubtleWideLabelClass}>氮富集 + Re–N / N–N 方向性网络 → 预测力学增强</span>
      </Html>
      <Html center distanceFactor={7} pointerEvents="none" position={[0, -1.9, 0]}>
        <span className={htmlOverlayAmberCompactLabelClass}>按 Wyckoff multiplicity 计数，不数补画的周期球</span>
      </Html>
    </>
  );
}

function CellModel({ showFrame = false }: { showFrame?: boolean }) {
  return (
    <>
      {showFrame ? <CellFrame /> : null}
      {REN3_CONVENTIONAL_ATOMS.map((atom) => (
        <Ren3AtomSphere atom={atom} key={atom.id} />
      ))}
    </>
  );
}

function Ren3AtomSphere({ atom }: { atom: Ren3Atom }) {
  return (
    <AtomSphere
      color={atom.element === "Re" ? RE_COLOR : NITROGEN_COLOR}
      metal={atom.element === "Re"}
      position={cartesianToScene(atom.cartesian)}
      radius={atom.element === "Re" ? 0.14 : 0.095}
    />
  );
}

function CellFrame() {
  return (
    <>
      {cellEdges.map(([start, end], index) => (
        <StickCylinder
          color={CELL_COLOR}
          end={end}
          key={`ren3-cell-edge-${index}`}
          opacity={0.64}
          radius={0.008}
          start={start}
        />
      ))}
    </>
  );
}

function CellAxisLabels() {
  const [width, height, depth] = cellDimensions;
  return (
    <>
      <SiteLabel label="a｜5.25 Å" position={[width / 2 + 0.32, -height / 2, -depth / 2]} />
      <SiteLabel label="c｜4.75 Å" position={[-width / 2, height / 2 + 0.25, -depth / 2]} />
      <SiteLabel label="b｜2.81 Å" position={[-width / 2, -height / 2, depth / 2 + 0.28]} />
    </>
  );
}

function RepresentativeSiteLabels() {
  const representativeRe = REN3_CONVENTIONAL_ATOMS.find((atom) => atom.site === "Re-2b");
  const representativeN1 = REN3_CONVENTIONAL_ATOMS.find((atom) => atom.site === "N1-4c");
  const representativeN2 = REN3_CONVENTIONAL_ATOMS.find((atom) => atom.site === "N2-2b");
  if (!representativeRe || !representativeN1 || !representativeN2) return null;

  return (
    <>
      <SiteLabel label="Re 2b" position={add(cartesianToScene(representativeRe.cartesian), [0.18, 0.2, 0])} />
      <SiteLabel label="N1 4c" position={add(cartesianToScene(representativeN1.cartesian), [-0.2, 0.2, 0])} />
      <SiteLabel label="N2 2b" position={add(cartesianToScene(representativeN2.cartesian), [0.2, 0.2, 0])} />
    </>
  );
}

function PolyhedronSurface({
  color,
  opacity,
  vertices,
}: {
  color: string;
  opacity: number;
  vertices: Vec3[];
}) {
  const geometry = useMemo(() => {
    const faces = convexHullFaces(vertices);
    const positions = faces.flatMap(([first, second, third]) => [
      ...vertices[first],
      ...vertices[second],
      ...vertices[third],
    ]);
    const nextGeometry = new BufferGeometry();
    nextGeometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    nextGeometry.computeVertexNormals();
    return nextGeometry;
  }, [vertices]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        depthWrite={false}
        opacity={opacity}
        roughness={0.42}
        side={DoubleSide}
        transparent
      />
    </mesh>
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
        metalness={metal ? 0.42 : 0.04}
        roughness={metal ? 0.28 : 0.46}
      />
    </mesh>
  );
}

function SiteLabel({ label, position }: { label: string; position: Vec3 }) {
  return (
    <Html center distanceFactor={7} pointerEvents="none" position={position}>
      <span className={htmlOverlayCompactLabelClass}>{label}</span>
    </Html>
  );
}

function Ren3Legend() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs">
      <LegendDot color={RE_COLOR} label="Re" />
      <LegendDot color={NITROGEN_COLOR} label="N" />
      <LegendDot color={N_N_COLOR} label="N–N 焦点" />
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

function createBoxEdges([width, height, depth]: Vec3): Array<[Vec3, Vec3]> {
  const x = width / 2;
  const y = height / 2;
  const z = depth / 2;
  const corners: Vec3[] = [
    [-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z],
    [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z],
  ];
  const pairs: Array<[number, number]> = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  return pairs.map(([start, end]) => [corners[start], corners[end]]);
}

function add(first: Vec3, second: Vec3): Vec3 {
  return [first[0] + second[0], first[1] + second[1], first[2] + second[2]];
}

function getCameraPreset(viewMode: CrystalViewMode): {
  fov: number;
  position: Vec3;
  rotation: Vec3;
  scale: number;
  yOffset: number;
} {
  switch (viewMode) {
    case "pressure":
      return { fov: 39, position: [4.8, 3.6, 6.2], rotation: [0.1, -0.38, 0], scale: 0.94, yOffset: 0 };
    case "cell":
      return { fov: 38, position: [4.8, 3.7, 6.1], rotation: [0.13, -0.48, 0], scale: 1.02, yOffset: 0 };
    case "covalentNetwork":
      return { fov: 36, position: [3.6, 2.7, 4.8], rotation: [0.08, -0.34, 0], scale: 1.18, yOffset: 0 };
    case "coordination":
      return { fov: 36, position: [3.8, 2.9, 5.0], rotation: [0.16, -0.44, 0], scale: 0.98, yOffset: 0 };
    case "polyhedron":
      return { fov: 40, position: [5.3, 3.9, 6.6], rotation: [0.12, -0.5, 0], scale: 0.86, yOffset: 0 };
    case "counting":
      return { fov: 39, position: [4.8, 3.5, 6.0], rotation: [0.08, -0.28, 0], scale: 0.96, yOffset: 0 };
    default:
      return { fov: 39, position: [4.8, 3.6, 6.1], rotation: [0.12, -0.44, 0], scale: 1, yOffset: 0 };
  }
}
