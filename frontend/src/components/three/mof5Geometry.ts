import type { Vec3 } from "@/components/three/StickCylinder";

export type PcuAxis = "x" | "y" | "z";

export type PcuNode = {
  id: string;
  position: Vec3;
};

export type PcuLinker = {
  axis: PcuAxis;
  end: Vec3;
  id: string;
  ring: Vec3[];
  start: Vec3;
};

export type PcuPeriodicStub = {
  end: Vec3;
  id: string;
  start: Vec3;
};

export type PcuGeometry = {
  linkers: PcuLinker[];
  nodes: PcuNode[];
  periodicStubs: PcuPeriodicStub[];
};

export const TETRAHEDRAL_DIRECTIONS: Vec3[] = [
  normalize([1, 1, 1]),
  normalize([1, -1, -1]),
  normalize([-1, 1, -1]),
  normalize([-1, -1, 1]),
];

export const TETRAHEDRON_EDGES: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
];

export function createPcuGeometry(half = 0.88, stubLength = 0.32): PcuGeometry {
  const coordinates = [-half, half];
  const nodes: PcuNode[] = [];

  for (const x of coordinates) {
    for (const y of coordinates) {
      for (const z of coordinates) {
        nodes.push({ id: `node-${signId(x)}-${signId(y)}-${signId(z)}`, position: [x, y, z] });
      }
    }
  }

  const linkers: PcuLinker[] = [];

  for (const y of coordinates) {
    for (const z of coordinates) {
      linkers.push(createPcuLinker("x", [-half, y, z], [half, y, z]));
    }
  }
  for (const x of coordinates) {
    for (const z of coordinates) {
      linkers.push(createPcuLinker("y", [x, -half, z], [x, half, z]));
    }
  }
  for (const x of coordinates) {
    for (const y of coordinates) {
      linkers.push(createPcuLinker("z", [x, y, -half], [x, y, half]));
    }
  }

  const periodicStubs = nodes.flatMap((node) =>
    ([0, 1, 2] as const).map((axisIndex) => {
      const end: Vec3 = [...node.position];
      end[axisIndex] += Math.sign(node.position[axisIndex]) * stubLength;
      return {
        end,
        id: `${node.id}-periodic-${["x", "y", "z"][axisIndex]}`,
        start: node.position,
      };
    }),
  );

  return { linkers, nodes, periodicStubs };
}

function createPcuLinker(axis: PcuAxis, start: Vec3, end: Vec3): PcuLinker {
  return {
    axis,
    end,
    id: `linker-${axis}-${start.map(signId).join("-")}`,
    ring: createRingOnLinker(start, end, axis),
    start,
  };
}

export function createRingOnLinker(
  start: Vec3,
  end: Vec3,
  axis: PcuAxis,
  radius = 0.14,
): Vec3[] {
  const center = midpoint(start, end);
  const direction: Vec3 = axis === "x" ? [1, 0, 0] : axis === "y" ? [0, 1, 0] : [0, 0, 1];
  const inPlane: Vec3 = axis === "z" ? [1, 0, 0] : [0, 0, 1];

  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index;
    return add(
      center,
      add(scale(direction, Math.cos(angle) * radius), scale(inPlane, Math.sin(angle) * radius)),
    );
  });
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function lerp(a: Vec3, b: Vec3, amount: number): Vec3 {
  return [
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  ];
}

export function midpoint(a: Vec3, b: Vec3): Vec3 {
  return scale(add(a, b), 0.5);
}

export function normalize(value: Vec3): Vec3 {
  const length = Math.hypot(value[0], value[1], value[2]);
  if (length === 0) return [0, 0, 0];
  return [value[0] / length, value[1] / length, value[2] / length];
}

export function scale(value: Vec3, amount: number): Vec3 {
  return [value[0] * amount, value[1] * amount, value[2] * amount];
}

function signId(value: number) {
  if (value === 0) return "0";
  return value > 0 ? "p" : "n";
}
