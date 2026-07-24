import { Html, Line } from "@react-three/drei";
import { useMemo } from "react";
import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Quaternion,
  Vector3,
} from "three";
import { useDisposable } from "@/components/three/useDisposable";

export type OrbitalTone = "primary" | "warm" | "neutral" | "blue";
export type OrbitalRenderStyle = "surface" | "cloud" | "mixed";
export type OrbitalDirection = [number, number, number];
export type OrbitalCloudKind = "s" | "p" | "pi" | "lonePair" | "polarity";
export type PiCloudOrientation = "xy" | "xz" | "yz";
export type PiCloudStyle = "overlap-lobes" | "delocalized-ring" | "layer";
export type PiPhaseTone = "same" | "opposite";
export type Vec3 = [number, number, number];

const toneColors: Record<OrbitalTone, { main: string; light: string; dark: string }> = {
  primary: { main: "#2A9D8F", light: "#DFF8F4", dark: "#1F6F68" },
  warm: { main: "#F4A261", light: "#FFF0D8", dark: "#B96320" },
  neutral: { main: "#94A3B8", light: "#EEF4F8", dark: "#64748B" },
  blue: { main: "#3B82F6", light: "#DBEAFE", dark: "#2563EB" },
};

const axisColors = {
  x: "#E45D4F",
  y: "#2E9E73",
  z: "#4277C7",
};

type OrbitalSurfaceProps = {
  direction: OrbitalDirection;
  length?: number;
  width?: number;
  opacity?: number;
  position?: Vec3;
  tone?: OrbitalTone;
};

export function OrbitalSurface({
  direction,
  length = 0.86,
  width = 0.24,
  opacity = 0.5,
  position = [0, 0, 0],
  tone = "primary",
}: OrbitalSurfaceProps) {
  const geometry = useDisposable(() => createPearLobeGeometry(length, width), [length, width]);
  const [dx, dy, dz] = direction;
  const quaternion = useMemo(() => getQuaternionForDirection([dx, dy, dz]), [dx, dy, dz]);
  const colors = toneColors[tone];

  return (
    <group position={position} quaternion={quaternion}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color={colors.main}
          depthTest
          depthWrite={false}
          opacity={opacity}
          roughness={0.58}
          transparent
        />
      </mesh>
    </group>
  );
}

type DeterministicPointCloudProps = {
  geometry: BufferGeometry;
  opacity?: number;
  size?: number;
  tone?: OrbitalTone;
  depthTest?: boolean;
  sizeAttenuation?: boolean;
  colorVariant?: "main" | "dark";
  renderOrder?: number;
};

export function DeterministicPointCloud({
  geometry,
  opacity = 0.42,
  size = 0.024,
  tone = "primary",
  depthTest = false,
  sizeAttenuation = true,
  colorVariant = "main",
  renderOrder,
}: DeterministicPointCloudProps) {
  const colors = toneColors[tone];

  return (
    <points geometry={geometry} renderOrder={renderOrder}>
      <pointsMaterial
        color={colorVariant === "dark" ? colors.dark : colors.main}
        depthTest={depthTest}
        depthWrite={false}
        opacity={opacity}
        size={size}
        sizeAttenuation={sizeAttenuation}
        transparent
      />
    </points>
  );
}

type SOrbitalCloudProps = {
  center?: Vec3;
  radius?: number;
  opacity?: number;
  tone?: OrbitalTone;
  renderStyle?: OrbitalRenderStyle;
  seed?: number;
};

export function SOrbitalCloud({
  center = [0, 0, 0],
  radius = 0.42,
  opacity = 0.34,
  tone = "primary",
  renderStyle = "surface",
  seed = 17,
}: SOrbitalCloudProps) {
  const cloudGeometry = useDisposable(
    () =>
      renderStyle === "surface"
        ? createPointCloudGeometry([])
        : createSphereCloudGeometry(radius * 1.02, 180, seed),
    [radius, renderStyle, seed],
  );
  const colors = toneColors[tone];

  return (
    <group position={center}>
      {renderStyle !== "cloud" ? (
        <mesh>
          <sphereGeometry args={[radius, 48, 32]} />
          <meshPhysicalMaterial
            color={colors.main}
            depthTest
            depthWrite={false}
            opacity={opacity}
            roughness={0.58}
            transparent
          />
        </mesh>
      ) : null}
      {renderStyle !== "surface" ? (
        <DeterministicPointCloud
          geometry={cloudGeometry}
          opacity={Math.min(0.7, opacity * 1.4)}
          size={0.026}
          tone={tone}
        />
      ) : null}
    </group>
  );
}

type POrbitalPairProps = {
  center?: Vec3;
  direction: OrbitalDirection;
  length?: number;
  width?: number;
  opacity?: number;
  positiveTone?: OrbitalTone;
  negativeTone?: OrbitalTone;
  renderStyle?: OrbitalRenderStyle;
  showAxis?: boolean;
  seed?: number;
};

export function POrbitalPair({
  center = [0, 0, 0],
  direction,
  length = 0.78,
  width = 0.2,
  opacity = 0.46,
  positiveTone = "primary",
  negativeTone = "primary",
  renderStyle = "surface",
  showAxis = true,
  seed = 31,
}: POrbitalPairProps) {
  const [dx, dy, dz] = direction;
  const normalized = useMemo(() => normalize([dx, dy, dz]), [dx, dy, dz]);
  const negativeDirection = useMemo(() => scale(normalized, -1), [normalized]);
  const positiveGeometry = useDisposable(
    () =>
      renderStyle === "surface"
        ? createPointCloudGeometry([])
        : createLobeCloudGeometry(normalized, length, width, 120, seed),
    [length, normalized, renderStyle, seed, width],
  );
  const negativeGeometry = useDisposable(
    () =>
      renderStyle === "surface"
        ? createPointCloudGeometry([])
        : createLobeCloudGeometry(negativeDirection, length, width, 120, seed + 73),
    [length, negativeDirection, renderStyle, seed, width],
  );

  return (
    <group position={center}>
      {showAxis ? (
        <GuideCylinder
          color={toneColors[positiveTone].dark}
          end={scale(normalized, length * 1.08)}
          opacity={0.24}
          radius={0.007}
          start={scale(normalized, -length * 1.08)}
        />
      ) : null}
      {renderStyle !== "cloud" ? (
        <>
          <OrbitalSurface
            direction={normalized}
            length={length}
            opacity={opacity}
            tone={positiveTone}
            width={width}
          />
          <OrbitalSurface
            direction={negativeDirection}
            length={length}
            opacity={opacity}
            tone={negativeTone}
            width={width}
          />
        </>
      ) : null}
      {renderStyle !== "surface" ? (
        <>
          <DeterministicPointCloud
            geometry={positiveGeometry}
            opacity={opacity * 0.86}
            size={0.023}
            tone={positiveTone}
          />
          <DeterministicPointCloud
            geometry={negativeGeometry}
            opacity={opacity * 0.86}
            size={0.023}
            tone={negativeTone}
          />
        </>
      ) : null}
    </group>
  );
}

type PiCloudBandProps = {
  center?: Vec3;
  scale?: Vec3;
  orientation?: PiCloudOrientation;
  cloudStyle?: PiCloudStyle;
  length?: number;
  width?: number;
  thickness?: number;
  waist?: number;
  particleCount?: number;
  particleOpacity?: number;
  particleSize?: number;
  phaseTone?: PiPhaseTone;
  showParticles?: boolean;
  opacity?: number;
  tone?: OrbitalTone;
  renderStyle?: OrbitalRenderStyle;
  seed?: number;
};

export function PiCloudBand({
  center = [0, 0, 0],
  scale = [1, 0.22, 0.16],
  orientation,
  cloudStyle = "overlap-lobes",
  length,
  width,
  thickness,
  waist = 0.18,
  particleCount = 210,
  particleOpacity = 0.44,
  particleSize = 0.018,
  phaseTone = "same",
  showParticles = true,
  opacity = 0.2,
  tone = "primary",
  renderStyle = "surface",
  seed = 101,
}: PiCloudBandProps) {
  const dimensions = resolvePiCloudDimensions({
    length,
    orientation,
    scale,
    thickness,
    width,
  });
  const surfaceGeometry = useDisposable(
    () =>
      renderStyle === "cloud"
        ? new BufferGeometry()
        : createPiCloudSurfaceGeometry({
            cloudStyle,
            length: dimensions.length,
            orientation: dimensions.orientation,
            phaseTone,
            thickness: dimensions.thickness,
            waist,
            width: dimensions.width,
          }),
    [
      cloudStyle,
      dimensions.length,
      dimensions.orientation,
      dimensions.thickness,
      dimensions.width,
      phaseTone,
      renderStyle,
      waist,
    ],
  );
  const particlePositions = useMemo(
    () => {
      if (!showParticles || renderStyle === "surface") return [];
      return createPiCloudParticlePositions({
        count: Math.min(96, Math.max(24, Math.round(particleCount / 4))),
        length: dimensions.length,
        orientation: dimensions.orientation,
        seed,
        thickness: dimensions.thickness,
        waist,
        width: dimensions.width,
      });
    },
    [
      dimensions.length,
      dimensions.orientation,
      dimensions.thickness,
      dimensions.width,
      particleCount,
      renderStyle,
      seed,
      showParticles,
      waist,
    ],
  );
  const colors = toneColors[tone];
  const particleGeometry = useDisposable(
    () => createPointCloudGeometry(particlePositions),
    [particlePositions],
  );

  return (
    <group position={center}>
      {renderStyle !== "cloud" ? (
        <mesh geometry={surfaceGeometry}>
          <meshPhysicalMaterial
            color={colors.main}
            depthTest
            depthWrite={false}
            forceSinglePass
            opacity={opacity}
            roughness={0.58}
            side={DoubleSide}
            transparent
          />
        </mesh>
      ) : null}
      {showParticles && renderStyle !== "surface" ? (
        <DeterministicPointCloud
          colorVariant="dark"
          depthTest={false}
          geometry={particleGeometry}
          opacity={Math.min(0.9, particleOpacity)}
          renderOrder={12}
          size={particleSize}
          tone={tone}
        />
      ) : null}
    </group>
  );
}

function createPointCloudGeometry(positions: Vec3[]) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions.flat(), 3));
  return geometry;
}

function resolvePiCloudDimensions({
  length,
  orientation,
  scale: scaleValue,
  thickness,
  width,
}: {
  length?: number;
  orientation?: PiCloudOrientation;
  scale: Vec3;
  thickness?: number;
  width?: number;
}) {
  const resolvedOrientation = orientation ?? inferPiCloudOrientation(scaleValue);

  if (resolvedOrientation === "xz") {
    return {
      length: length ?? scaleValue[0],
      orientation: resolvedOrientation,
      thickness: thickness ?? scaleValue[1],
      width: width ?? scaleValue[2],
    };
  }

  if (resolvedOrientation === "yz") {
    return {
      length: length ?? scaleValue[1],
      orientation: resolvedOrientation,
      thickness: thickness ?? scaleValue[0],
      width: width ?? scaleValue[2],
    };
  }

  return {
    length: length ?? scaleValue[0],
    orientation: resolvedOrientation,
    thickness: thickness ?? scaleValue[2],
    width: width ?? scaleValue[1],
  };
}

function inferPiCloudOrientation(scaleValue: Vec3): PiCloudOrientation {
  if (scaleValue[1] <= scaleValue[0] && scaleValue[1] <= scaleValue[2]) return "xz";
  if (scaleValue[0] <= scaleValue[1] && scaleValue[0] <= scaleValue[2]) return "yz";
  return "xy";
}

function createPiCloudSurfaceGeometry({
  cloudStyle,
  length,
  width,
  thickness,
  waist,
  orientation,
  phaseTone,
}: {
  cloudStyle: PiCloudStyle;
  length: number;
  width: number;
  thickness: number;
  waist: number;
  orientation: PiCloudOrientation;
  phaseTone: PiPhaseTone;
}) {
  if (cloudStyle === "delocalized-ring") {
    return createDelocalizedPiGeometry({
      length,
      orientation,
      radialPulse: 6,
      thickness,
      width,
    });
  }

  if (cloudStyle === "layer") {
    return createLayerPiGeometry({
      length,
      orientation,
      radialPulse: 4,
      thickness,
      width,
    });
  }

  return createPiOverlapLobeGeometry({
    length,
    orientation,
    phaseTone,
    thickness,
    waist,
    width,
  });
}

function createPiOverlapLobeGeometry({
  length,
  width,
  thickness,
  waist,
  orientation,
  phaseTone,
}: {
  length: number;
  width: number;
  thickness: number;
  waist: number;
  orientation: PiCloudOrientation;
  phaseTone: PiPhaseTone;
}) {
  const rings = 52;
  const segments = 48;
  const positions: number[] = [];
  const indices: number[] = [];
  const halfLength = length * 0.86;
  const phaseScale = phaseTone === "opposite" ? 0.98 : 1;

  for (let ring = 0; ring <= rings; ring += 1) {
    const u = -1 + (ring / rings) * 2;
    const endTaper = Math.pow(Math.max(0, 1 - u * u), 0.42);
    const centerPinch = 1 - waist * Math.exp(-((u / 0.3) ** 2));
    const lobeBoost = 0.88 + 0.18 * Math.exp(-(((Math.abs(u) - 0.5) / 0.3) ** 2));
    const lateralRadius = width * endTaper * centerPinch * lobeBoost;
    const normalRadius =
      Math.max(thickness, width * 0.32) * endTaper * (0.84 + 0.16 * centerPinch) * phaseScale;
    const centerLine = u * halfLength;

    for (let segment = 0; segment <= segments; segment += 1) {
      const phi = (Math.PI * 2 * segment) / segments;
      const lateral = Math.cos(phi) * lateralRadius;
      const normal = Math.sin(phi) * normalRadius;
      positions.push(...mapPiCloudPoint(orientation, centerLine, lateral, normal));
    }
  }

  const ringSize = segments + 1;
  for (let ring = 0; ring < rings; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const a = ring * ringSize + segment;
      const b = a + ringSize;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createDelocalizedPiGeometry({
  length,
  width,
  thickness,
  orientation,
  radialPulse,
}: {
  length: number;
  width: number;
  thickness: number;
  orientation: PiCloudOrientation;
  radialPulse: number;
}) {
  const rings = 10;
  const segments = 96;
  const positions: number[] = [];
  const indices: number[] = [];
  const radiusX = length;
  const radiusY = width;

  for (let ring = 0; ring <= rings; ring += 1) {
    const r = ring / rings;
    const smoothR = Math.pow(r, 0.86);

    for (let segment = 0; segment <= segments; segment += 1) {
      const theta = (Math.PI * 2 * segment) / segments;
      const pulse = 0.9 + 0.1 * Math.cos(theta * radialPulse);
      const x = Math.cos(theta) * radiusX * smoothR * pulse;
      const y = Math.sin(theta) * radiusY * smoothR * pulse;
      const edgeLift = Math.pow(smoothR, 1.5) * thickness * 0.55;
      const z = thickness * (0.25 + edgeLift) * Math.sin(theta * radialPulse) * 0.18;
      positions.push(...mapPiCloudPoint(orientation, x, y, z));
    }
  }

  const ringSize = segments + 1;
  for (let ring = 0; ring < rings; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const a = ring * ringSize + segment;
      const b = a + ringSize;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createLayerPiGeometry({
  length,
  width,
  thickness,
  orientation,
  radialPulse,
}: {
  length: number;
  width: number;
  thickness: number;
  orientation: PiCloudOrientation;
  radialPulse: number;
}) {
  const lengthSegments = 40;
  const widthSegments = 22;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= lengthSegments; i += 1) {
    const u = -1 + (i / lengthSegments) * 2;
    const endTaper = Math.pow(Math.max(0, 1 - Math.abs(u) ** 2.4), 0.18);

    for (let j = 0; j <= widthSegments; j += 1) {
      const v = -1 + (j / widthSegments) * 2;
      const edgeTaper = Math.pow(Math.max(0, 1 - Math.abs(v) ** 2.2), 0.22);
      const wave = Math.sin((u * 2.2 + v * 1.35) * Math.PI * radialPulse);
      const longitudinal = u * length * endTaper;
      const lateral = v * width * edgeTaper;
      const normal = wave * thickness * 0.22 + thickness * 0.04;
      positions.push(...mapPiCloudPoint(orientation, longitudinal, lateral, normal));
    }
  }

  const rowSize = widthSegments + 1;
  for (let i = 0; i < lengthSegments; i += 1) {
    for (let j = 0; j < widthSegments; j += 1) {
      const a = i * rowSize + j;
      const b = a + rowSize;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createPiCloudParticlePositions({
  length,
  width,
  thickness,
  waist,
  orientation,
  count,
  seed,
}: {
  length: number;
  width: number;
  thickness: number;
  waist: number;
  orientation: PiCloudOrientation;
  count: number;
  seed: number;
}) {
  const random = makeRandom(seed);
  const positions: Vec3[] = [];

  for (let index = 0; index < count; index += 1) {
    const raw = random();
    const lobeCenter = raw < 0.5 ? -0.48 : 0.48;
    const u =
      random() < 0.72
        ? clamp(lobeCenter + (random() - random()) * 0.42, -0.94, 0.94)
        : -0.94 + random() * 1.88;
    const halfWidth = getPiCloudHalfWidth(u, width, waist);
    const lateralSign = random() < 0.5 ? -1 : 1;
    const lateral = lateralSign * halfWidth * Math.pow(random(), 0.72);
    const edgeRatio = Math.min(1, Math.abs(lateral) / Math.max(halfWidth, 0.001));
    const normal =
      (random() - 0.5) *
      2 *
      thickness *
      (0.18 + 0.82 * (1 - edgeRatio)) *
      Math.pow(random(), 0.7);

    positions.push(mapPiCloudPoint(orientation, u * length, lateral, normal));
  }

  return positions;
}

function getPiCloudHalfWidth(u: number, width: number, waist: number) {
  const edgeTaper = 0.15 + 0.85 * Math.pow(Math.max(0, 1 - Math.abs(u) ** 2.2), 0.5);
  const leftLobe = Math.exp(-(((u + 0.48) / 0.34) ** 2));
  const rightLobe = Math.exp(-(((u - 0.48) / 0.34) ** 2));
  const centerWaist = 1 - waist * Math.exp(-((u / 0.24) ** 2));
  return width * edgeTaper * (1 + 0.46 * (leftLobe + rightLobe)) * centerWaist;
}

function mapPiCloudPoint(
  orientation: PiCloudOrientation,
  longitudinal: number,
  lateral: number,
  normal: number,
): Vec3 {
  if (orientation === "xz") return [longitudinal, normal, lateral];
  if (orientation === "yz") return [normal, longitudinal, lateral];
  return [longitudinal, lateral, normal];
}

type LonePairOrbitalProps = {
  origin: Vec3;
  direction: OrbitalDirection;
  distance?: number;
  length?: number;
  width?: number;
  opacity?: number;
  tone?: OrbitalTone;
  electronTones?: [OrbitalTone, OrbitalTone];
};

export function LonePairOrbital({
  origin,
  direction,
  distance = 0.44,
  length = 0.58,
  width = 0.24,
  opacity = 0.42,
  tone = "blue",
  electronTones = ["blue", "blue"],
}: LonePairOrbitalProps) {
  const [dx, dy, dz] = direction;
  const normalized = useMemo(() => normalize([dx, dy, dz]), [dx, dy, dz]);
  const { electronOne, electronTwo } = useMemo(() => {
    const [basisA] = makeBasis(vectorFromVec(normalized));
    return {
      electronOne: add(scale(normalized, 0.22), toVec3(basisA.clone().multiplyScalar(-0.078))),
      electronTwo: add(scale(normalized, 0.22), toVec3(basisA.clone().multiplyScalar(0.078))),
    };
  }, [normalized]);
  const center = add(origin, scale(normalized, distance));

  return (
    <group position={center}>
      <OrbitalSurface
        direction={normalized}
        length={length}
        opacity={opacity}
        tone={tone}
        width={width}
      />
      <ElectronDot position={electronOne} radius={0.045} tone={electronTones[0]} />
      <ElectronDot position={electronTwo} radius={0.045} tone={electronTones[1]} />
    </group>
  );
}

export function ElectronDot({
  position,
  tone = "neutral",
  radius = 0.052,
}: {
  position: Vec3;
  tone?: OrbitalTone;
  radius?: number;
}) {
  const colors = toneColors[tone];

  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 20, 20]} />
      <meshStandardMaterial
        color={colors.main}
        emissive={colors.light}
        emissiveIntensity={0.12}
        roughness={0.34}
      />
    </mesh>
  );
}

type AxisTriadProps = {
  origin?: Vec3;
  length?: number;
  showLabels?: boolean;
  opacity?: number;
};

export function AxisTriad({
  origin = [0, 0, 0],
  length = 1.5,
  showLabels = true,
  opacity = 0.52,
}: AxisTriadProps) {
  const axes = useMemo(
    (): Array<{ key: "x" | "y" | "z"; label: string; end: Vec3; points: [Vector3, Vector3] }> => [
      { key: "x", label: "X", end: [length, 0, 0], points: [new Vector3(0, 0, 0), new Vector3(length, 0, 0)] },
      { key: "y", label: "Y", end: [0, length, 0], points: [new Vector3(0, 0, 0), new Vector3(0, length, 0)] },
      { key: "z", label: "Z", end: [0, 0, length], points: [new Vector3(0, 0, 0), new Vector3(0, 0, length)] },
    ],
    [length],
  );

  return (
    <group position={origin}>
      {axes.map((axis) => (
        <group key={axis.key}>
          <Line
            color={axisColors[axis.key]}
            lineWidth={1.8}
            opacity={opacity}
            points={axis.points}
            transparent
          />
          {showLabels ? (
            <Html center distanceFactor={6.8} pointerEvents="none" position={scale(axis.end, 1.05)}>
              <span
                className="rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-bold shadow-sm"
                style={{ color: axisColors[axis.key] }}
              >
                {axis.label}
              </span>
            </Html>
          ) : null}
        </group>
      ))}
    </group>
  );
}

export function GuideCylinder({
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
  const { length, midpoint, quaternion } = useMemo(() => {
    const startVector = vectorFromVec(start);
    const endVector = vectorFromVec(end);
    const direction = new Vector3().subVectors(endVector, startVector);
    return {
      length: direction.length(),
      midpoint: new Vector3().addVectors(startVector, endVector).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize()),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start[0], start[1], start[2], end[0], end[1], end[2]]);

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 14]} />
      <meshBasicMaterial color={color} opacity={opacity} transparent={opacity < 1} />
    </mesh>
  );
}

export function createPearLobeGeometry(length: number, width: number) {
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

export function createLobeCloudGeometry(
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
    const point = forward
      .clone()
      .multiplyScalar(length * t)
      .add(basisA.clone().multiplyScalar(Math.cos(phi) * radius))
      .add(basisB.clone().multiplyScalar(Math.sin(phi) * radius));
    positions.push(point.x, point.y, point.z);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return geometry;
}

function createSphereCloudGeometry(radius: number, count: number, seed: number) {
  const random = makeRandom(seed);
  const positions: number[] = [];

  for (let index = 0; index < count; index += 1) {
    const u = random();
    const v = random();
    const r = radius * Math.cbrt(random());
    const theta = Math.acos(1 - 2 * u);
    const phi = 2 * Math.PI * v;
    positions.push(
      r * Math.sin(theta) * Math.cos(phi),
      r * Math.cos(theta),
      r * Math.sin(theta) * Math.sin(phi),
    );
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

export function getQuaternionForDirection(direction: Vec3) {
  return new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    vectorFromVec(direction).normalize(),
  );
}

export function normalize(vector: Vec3): Vec3 {
  return toVec3(vectorFromVec(vector).normalize());
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function scale(vector: Vec3, scalar: number): Vec3 {
  return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

export function vectorFromVec(vector: Vec3) {
  return new Vector3(vector[0], vector[1], vector[2]);
}

export function toVec3(vector: Vector3): Vec3 {
  return [vector.x, vector.y, vector.z];
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
