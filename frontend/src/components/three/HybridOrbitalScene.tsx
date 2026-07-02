import { useMemo } from "react";
import { Html, Line } from "@react-three/drei";
import {
  BufferGeometry,
  Float32BufferAttribute,
  QuadraticBezierCurve3,
  Quaternion,
  Vector3,
} from "three";
import {
  AxisTriad as SharedAxisTriad,
  POrbitalPair,
  SOrbitalCloud,
} from "@/components/three/OrbitalPrimitives";
import type {
  BondingBasicsMode,
  HybridOrbitalControls,
  HybridRenderMode,
} from "@/data/bondingBasics";

type Vec3 = [number, number, number];
type HybridMode = "sp" | "sp2" | "sp3";

type HybridSceneConfig = {
  mode: HybridMode;
  displayLabel: string;
  inputLabel: string;
  outputLabel: string;
  directions: Vec3[];
  inputPAxes: Vec3[];
  unhybridizedAxes: Vec3[];
  angleLabel: string;
  geometryLabel: string;
  unhybridizedLabel: string;
  atomHint: string;
};

const primary = "#2A9D8F";
const primaryDark = "#1F6F68";
const accent = "#F4A261";
const accentDark = "#B96320";
const textPrimary = "#1F2933";
const textSecondary = "#64748B";
const guide = "#94A3B8";
const axisColors = {
  x: "#E45D4F",
  y: "#2E9E73",
  z: "#4277C7",
};

export function HybridOrbitalScene({
  mode,
  controls,
}: {
  mode: BondingBasicsMode;
  controls: HybridOrbitalControls;
}) {
  const config = getHybridSceneConfig(mode);
  const progress = clamp(controls.progress / 100, 0, 1);
  const sourceOpacity = Math.max(0, 0.82 * (1 - progress / 0.78));
  const hybridOpacity = 0.18 + progress * 0.58;
  const showSourceOrbitals = sourceOpacity > 0.03;
  const showHybridOrbitals = progress > 0.04;
  const showUnhybridizedP =
    controls.showUnhybridizedP && config.unhybridizedAxes.length > 0 && progress > 0.34;

  return (
    <>
      <SceneOverlay config={config} controls={controls} />
      <ReferenceFloor />
      {controls.showAxes ? <SharedAxisTriad length={1.52} opacity={0.54} /> : null}
      {config.mode === "sp2" && progress > 0.18 ? <Sp2Plane opacity={0.08 + progress * 0.12} /> : null}
      {config.mode === "sp3" && progress > 0.26 ? (
        <TetrahedralGuide directions={config.directions} opacity={0.18 + progress * 0.24} />
      ) : null}

      {showSourceOrbitals ? (
        <SourceOrbitals
          axes={config.inputPAxes}
          opacity={sourceOpacity}
          renderMode={controls.renderMode}
        />
      ) : null}

      {showHybridOrbitals
        ? config.directions.map((direction, index) => (
            <HybridOrbital
              direction={direction}
              index={index}
              key={`${config.mode}-hybrid-${index}`}
              opacity={hybridOpacity}
              progress={progress}
              renderMode={controls.renderMode}
            />
          ))
        : null}

      {showUnhybridizedP
        ? config.unhybridizedAxes.map((axis, index) => (
            <UnhybridizedPOrbital
              axis={axis}
              index={index}
              key={`${config.mode}-leftover-p-${index}`}
              opacity={0.18 + progress * 0.3}
              renderMode={controls.renderMode}
            />
          ))
        : null}

      <AtomCore />
      {progress > 0.55 ? (
        <HybridAngleGuide
          directions={config.directions}
          label={config.angleLabel}
          mode={config.mode}
        />
      ) : null}
    </>
  );
}

function SceneOverlay({
  config,
  controls,
}: {
  config: HybridSceneConfig;
  controls: HybridOrbitalControls;
}) {
  return (
    <Html fullscreen pointerEvents="none">
      <div className="absolute left-3 top-3 max-w-[min(330px,calc(100%-24px))] rounded-xl border border-white/70 bg-white/85 px-3 py-2.5 text-left shadow-sm backdrop-blur-sm sm:left-4 sm:top-4 sm:px-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xs font-semibold tracking-wide text-primary-dark">
            {config.displayLabel} 杂化模拟
          </span>
          <span className="rounded bg-primary-light/60 px-1.5 py-0.5 text-[10px] font-semibold text-primary-dark">
            {controls.progress}% 杂化
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-text-secondary sm:text-sm">
          {config.inputLabel} → <span className="font-semibold text-primary-dark">{config.outputLabel}</span>
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-semibold sm:text-xs">
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[#B96320]">
            {config.angleLabel}
          </span>
          <span className="rounded-full bg-primary-light/70 px-2 py-0.5 text-primary-dark">
            {config.geometryLabel}
          </span>
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-text-primary ring-1 ring-border/70">
            {config.unhybridizedLabel}
          </span>
        </div>
      </div>

      <div className="absolute right-3 top-3 hidden rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-[11px] font-semibold text-text-secondary shadow-sm backdrop-blur-sm sm:block">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            主瓣
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            副瓣
          </span>
          <span>{controls.renderMode === "solid" ? "实体轨道" : "电子云"}</span>
        </div>
      </div>
    </Html>
  );
}

function SourceOrbitals({
  axes,
  opacity,
  renderMode,
}: {
  axes: Vec3[];
  opacity: number;
  renderMode: HybridRenderMode;
}) {
  return (
    <group>
      <SOrbitalCloud
        opacity={opacity * 0.5}
        radius={0.38}
        renderStyle={renderMode === "cloud" ? "cloud" : "mixed"}
        seed={71}
        tone="neutral"
      />
      {axes.map((axis, index) => (
        <POrbitalPair
          center={[0, 0, 0]}
          direction={axis}
          length={0.72}
          negativeTone="warm"
          opacity={opacity * 0.52}
          positiveTone={index % 2 === 0 ? "primary" : "blue"}
          renderStyle={renderMode === "cloud" ? "cloud" : "mixed"}
          seed={91 + index * 19}
          showAxis
          width={0.18}
          key={`source-p-${index}`}
        />
      ))}
    </group>
  );
}

function HybridOrbital({
  direction,
  index,
  opacity,
  progress,
  renderMode,
}: {
  direction: Vec3;
  index: number;
  opacity: number;
  progress: number;
  renderMode: HybridRenderMode;
}) {
  const normalized = normalize(direction);
  const mainLength = 0.74 + progress * 0.66;
  const mainWidth = 0.18 + progress * 0.18;
  const tailLength = 0.24 + progress * 0.26;
  const tailWidth = 0.07 + progress * 0.09;
  const guideEnd = scale(normalized, mainLength + 0.14);

  return (
    <group>
      <StaticCylinder color={primaryDark} opacity={0.16 + progress * 0.18} radius={0.008} start={[0, 0, 0]} end={guideEnd} />
      {renderMode === "cloud" ? (
        <>
          <LobeCloud
            color={primary}
            direction={normalized}
            length={mainLength}
            opacity={opacity * 0.95}
            seed={100 + index * 13}
            size={0.029}
            width={mainWidth}
          />
          <LobeCloud
            color={accent}
            direction={scale(normalized, -1)}
            length={tailLength}
            opacity={opacity * 0.78}
            seed={200 + index * 17}
            size={0.024}
            width={tailWidth}
          />
        </>
      ) : (
        <>
          <LobeSurface
            color={primary}
            direction={normalized}
            length={mainLength}
            opacity={opacity}
            width={mainWidth}
          />
          <LobeSurface
            color={accent}
            direction={scale(normalized, -1)}
            length={tailLength}
            opacity={opacity * 0.72}
            width={tailWidth}
          />
        </>
      )}
    </group>
  );
}

function UnhybridizedPOrbital({
  axis,
  index,
  opacity,
  renderMode,
}: {
  axis: Vec3;
  index: number;
  opacity: number;
  renderMode: HybridRenderMode;
}) {
  const normalized = normalize(axis);

  return (
    <group>
      <StaticCylinder
        color={getAxisColor(axis)}
        opacity={0.24}
        radius={0.006}
        start={scale(normalized, -1.12)}
        end={scale(normalized, 1.12)}
      />
      <POrbitalPair
        center={[0, 0, 0]}
        direction={normalized}
        length={0.92}
        negativeTone="warm"
        opacity={opacity}
        positiveTone="neutral"
        renderStyle={renderMode === "cloud" ? "cloud" : "mixed"}
        seed={310 + index * 31}
        showAxis={false}
        width={0.22}
      />
      <SceneBadge
        color={textSecondary}
        position={scale(normalized, 1.28)}
        text={`p${index + 1}`}
      />
    </group>
  );
}

function LobeSurface({
  direction,
  length,
  width,
  color,
  opacity,
}: {
  direction: Vec3;
  length: number;
  width: number;
  color: string;
  opacity: number;
}) {
  const geometry = useMemo(() => createPearLobeGeometry(length, width), [length, width]);

  return (
    <mesh geometry={geometry} quaternion={getQuaternionForDirection(direction)}>
      <meshPhysicalMaterial
        clearcoat={0.52}
        clearcoatRoughness={0.18}
        color={color}
        depthWrite={false}
        emissive={color}
        emissiveIntensity={0.04}
        opacity={opacity}
        roughness={0.34}
        transparent
      />
    </mesh>
  );
}

function LobeCloud({
  direction,
  length,
  width,
  color,
  opacity,
  size,
  seed,
}: {
  direction: Vec3;
  length: number;
  width: number;
  color: string;
  opacity: number;
  size: number;
  seed: number;
}) {
  const geometry = useMemo(
    () => createLobeCloudGeometry(direction, length, width, 220, seed),
    [direction, length, seed, width],
  );

  return <PointCloud color={color} geometry={geometry} opacity={opacity} size={size} />;
}

function PointCloud({
  geometry,
  color,
  opacity,
  size,
}: {
  geometry: BufferGeometry;
  color: string;
  opacity: number;
  size: number;
}) {
  return (
    <points geometry={geometry}>
      <pointsMaterial color={color} depthWrite={false} opacity={opacity} size={size} transparent />
    </points>
  );
}

function AtomCore() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.15, 40, 32]} />
        <meshStandardMaterial
          color={textPrimary}
          emissive="#111827"
          emissiveIntensity={0.08}
          roughness={0.28}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.22, 40, 24]} />
        <meshBasicMaterial color="#FFFFFF" opacity={0.18} transparent />
      </mesh>
    </group>
  );
}

function ReferenceFloor() {
  const lines = [-1.5, -0.75, 0, 0.75, 1.5];

  return (
    <group position={[0, -1.18, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.4, 3.4]} />
        <meshBasicMaterial color="#F7FAF9" opacity={0.42} transparent />
      </mesh>
      {lines.map((x) => (
        <Line
          color="#D8E5E3"
          key={`floor-x-${x}`}
          lineWidth={0.8}
          opacity={0.5}
          points={[
            new Vector3(x, 0.002, -1.7),
            new Vector3(x, 0.002, 1.7),
          ]}
          transparent
        />
      ))}
      {lines.map((z) => (
        <Line
          color="#D8E5E3"
          key={`floor-z-${z}`}
          lineWidth={0.8}
          opacity={0.5}
          points={[
            new Vector3(-2.2, 0.003, z),
            new Vector3(2.2, 0.003, z),
          ]}
          transparent
        />
      ))}
    </group>
  );
}

function Sp2Plane({ opacity }: { opacity: number }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.42, 96]} />
        <meshBasicMaterial color={primary} depthWrite={false} opacity={opacity} transparent />
      </mesh>
      <Line
        color={primaryDark}
        lineWidth={1.3}
        opacity={0.28}
        points={makeCirclePoints(1.42, 90)}
        transparent
      />
    </group>
  );
}

function HybridAngleGuide({
  directions,
  label,
  mode,
}: {
  directions: Vec3[];
  label: string;
  mode: HybridMode;
}) {
  const radius = mode === "sp3" ? 0.66 : 0.78;
  const first = normalize(directions[0]);
  const second = normalize(directions[1]);

  if (mode === "sp") {
    const points = Array.from({ length: 29 }, (_, index) => {
      const theta = (Math.PI * index) / 28;
      return new Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0.06);
    });

    return (
      <group>
        <Line color={accentDark} lineWidth={2.2} points={points} />
        <SceneBadge color={accentDark} position={[0, radius + 0.16, 0.06]} text={label} />
      </group>
    );
  }

  const start = vectorFromVec(first).multiplyScalar(radius);
  const end = vectorFromVec(second).multiplyScalar(radius);
  const centerDirection = start.clone().add(end);
  if (centerDirection.lengthSq() < 0.0001) {
    centerDirection.set(0, 1, 0);
  } else {
    centerDirection.normalize();
  }
  const control = centerDirection.clone().multiplyScalar(radius * 1.18);
  const curve = new QuadraticBezierCurve3(start, control, end);
  const points = curve.getPoints(32);
  const labelPosition = curve.getPoint(0.52).add(centerDirection.multiplyScalar(0.18));

  return (
    <group>
      <Line color={accentDark} lineWidth={2.2} points={points} />
      <SceneBadge color={accentDark} position={toVec3(labelPosition)} text={label} />
    </group>
  );
}

function TetrahedralGuide({ directions, opacity }: { directions: Vec3[]; opacity: number }) {
  const endpoints = directions.map((direction) => scale(normalize(direction), 1.24));
  const pairs: Array<[Vec3, Vec3]> = [];

  for (let i = 0; i < endpoints.length; i += 1) {
    for (let j = i + 1; j < endpoints.length; j += 1) {
      pairs.push([endpoints[i], endpoints[j]]);
    }
  }

  return (
    <group>
      {pairs.map(([start, end], index) => (
        <DashedGuideLine end={end} key={`tetra-edge-${index}`} opacity={opacity} start={start} />
      ))}
    </group>
  );
}

function DashedGuideLine({ start, end, opacity }: { start: Vec3; end: Vec3; opacity: number }) {
  const startVector = vectorFromVec(start);
  const endVector = vectorFromVec(end);
  const segments = 8;

  return (
    <group>
      {Array.from({ length: segments }, (_, index) => {
        if (index % 2 === 1) return null;
        const segmentStart = startVector.clone().lerp(endVector, index / segments);
        const segmentEnd = startVector.clone().lerp(endVector, (index + 0.58) / segments);
        return (
          <StaticCylinder
            color={guide}
            end={toVec3(segmentEnd)}
            key={`dash-${index}`}
            opacity={opacity}
            radius={0.006}
            start={toVec3(segmentStart)}
          />
        );
      })}
    </group>
  );
}

function SceneBadge({ position, text, color }: { position: Vec3; text: string; color: string }) {
  return (
    <Html center distanceFactor={7.2} pointerEvents="none" position={position}>
      <span
        className="whitespace-nowrap rounded-full bg-white/88 px-2 py-0.5 text-center text-[10px] font-semibold leading-tight shadow-sm ring-1 ring-white/80 sm:px-2.5 sm:py-1 sm:text-xs"
        style={{ color }}
      >
        {text}
      </span>
    </Html>
  );
}

function StaticCylinder({
  start,
  end,
  color,
  opacity = 1,
  radius = 0.018,
}: {
  start: Vec3;
  end: Vec3;
  color: string;
  opacity?: number;
  radius?: number;
}) {
  const startVector = vectorFromVec(start);
  const endVector = vectorFromVec(end);
  const direction = new Vector3().subVectors(endVector, startVector);
  const midpoint = new Vector3().addVectors(startVector, endVector).multiplyScalar(0.5);
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize());

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, direction.length(), 14]} />
      <meshBasicMaterial color={color} opacity={opacity} transparent={opacity < 1} />
    </mesh>
  );
}

function getHybridSceneConfig(mode: BondingBasicsMode): HybridSceneConfig {
  if (mode === "sp") {
    return {
      mode,
      displayLabel: "sp",
      inputLabel: "1s + 1p",
      outputLabel: "2 个 sp 轨道",
      directions: [[-1, 0, 0], [1, 0, 0]],
      inputPAxes: [[1, 0, 0]],
      unhybridizedAxes: [[0, 1, 0], [0, 0, 1]],
      angleLabel: "180°",
      geometryLabel: "直线形",
      unhybridizedLabel: "未杂化 p 轨道 ×2",
      atomHint: "乙炔碳原子",
    };
  }

  if (mode === "sp2") {
    return {
      mode,
      displayLabel: "sp²",
      inputLabel: "1s + 2p",
      outputLabel: "3 个 sp² 轨道",
      directions: [
        [1, 0, 0],
        [-0.5, 0, 0.866],
        [-0.5, 0, -0.866],
      ],
      inputPAxes: [[1, 0, 0], [0, 0, 1]],
      unhybridizedAxes: [[0, 1, 0]],
      angleLabel: "120°",
      geometryLabel: "平面三角形",
      unhybridizedLabel: "未杂化 p 轨道 ×1",
      atomHint: "乙烯碳原子",
    };
  }

  return {
    mode: "sp3",
    displayLabel: "sp³",
    inputLabel: "1s + 3p",
    outputLabel: "4 个 sp³ 轨道",
    directions: [
      [0.94, 0, -0.33],
      [-0.47, 0.82, -0.33],
      [-0.47, -0.82, -0.33],
      [0, 0, 1],
    ],
    inputPAxes: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    unhybridizedAxes: [],
    angleLabel: "109.5°",
    geometryLabel: "四面体方向",
    unhybridizedLabel: "无未杂化 p 轨道",
    atomHint: "甲烷碳原子",
  };
}

function createPearLobeGeometry(length: number, width: number) {
  const rings = 28;
  const segments = 48;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let ring = 0; ring <= rings; ring += 1) {
    const t = ring / rings;
    const y = length * t;
    const profile = Math.pow(Math.sin(Math.PI * t), 0.58) * (0.36 + 0.82 * t);
    const radius = width * profile;

    for (let segment = 0; segment <= segments; segment += 1) {
      const phi = (Math.PI * 2 * segment) / segments;
      positions.push(Math.cos(phi) * radius, y, Math.sin(phi) * radius);
    }
  }

  for (let ring = 0; ring < rings; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const a = ring * (segments + 1) + segment;
      const b = a + segments + 1;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createLobeCloudGeometry(
  direction: Vec3,
  length: number,
  width: number,
  count: number,
  seed: number,
) {
  const forward = vectorFromVec(direction).normalize();
  const [basisA, basisB] = makeBasis(forward);
  const random = makeRandom(seed);
  const positions: number[] = [];

  for (let index = 0; index < count; index += 1) {
    const t = Math.pow(random(), 0.82);
    const profile = Math.pow(Math.sin(Math.PI * t), 0.58) * (0.36 + 0.82 * t);
    const radius = width * profile * Math.sqrt(random()) * 0.96;
    const phi = Math.PI * 2 * random();
    const axial = forward.clone().multiplyScalar(length * t);
    const radial = basisA
      .clone()
      .multiplyScalar(Math.cos(phi) * radius)
      .add(basisB.clone().multiplyScalar(Math.sin(phi) * radius));
    const point = axial.add(radial);
    positions.push(point.x, point.y, point.z);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return geometry;
}

function makeBasis(forward: Vector3): [Vector3, Vector3] {
  const helper = Math.abs(forward.y) > 0.88 ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0);
  const basisA = new Vector3().crossVectors(forward, helper).normalize();
  const basisB = new Vector3().crossVectors(forward, basisA).normalize();
  return [basisA, basisB];
}

function makeRandom(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function getQuaternionForDirection(direction: Vec3) {
  return new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    vectorFromVec(direction).normalize(),
  );
}

function normalize(vector: Vec3): Vec3 {
  return toVec3(vectorFromVec(vector).normalize());
}

function scale(vector: Vec3, scalar: number): Vec3 {
  return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

function vectorFromVec(vector: Vec3) {
  return new Vector3(vector[0], vector[1], vector[2]);
}

function toVec3(vector: Vector3): Vec3 {
  return [vector.x, vector.y, vector.z];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getAxisColor(axis: Vec3) {
  const normalized = normalize(axis);
  const absolute = normalized.map(Math.abs) as Vec3;

  if (absolute[0] >= absolute[1] && absolute[0] >= absolute[2]) return axisColors.x;
  if (absolute[1] >= absolute[0] && absolute[1] >= absolute[2]) return axisColors.y;
  return axisColors.z;
}

function makeCirclePoints(radius: number, segments: number) {
  return Array.from({ length: segments + 1 }, (_, index) => {
    const theta = (Math.PI * 2 * index) / segments;
    return new Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
  });
}
