import type { Vec3 } from "@/components/three/StickCylinder";

export type MxeneElement = "Ti" | "C";
export type MxeneLayerId =
  | "ti-top"
  | "c-top"
  | "ti-inner"
  | "c-bottom"
  | "ti-bottom";

export type MxeneLayerAtom = {
  element: MxeneElement;
  id: string;
  layerId: MxeneLayerId;
  position: Vec3;
};

export type MxeneLayer = {
  atoms: MxeneLayerAtom[];
  element: MxeneElement;
  id: MxeneLayerId;
  labelZh: string;
  y: number;
};

export type MxeneLink = {
  end: Vec3;
  id: string;
  start: Vec3;
};

export type MxenePatch = {
  layers: MxeneLayer[];
  links: MxeneLink[];
  radius: number;
  spacing: number;
};

export type TerminationKind = "O" | "OH" | "F";

export type TerminationSite = {
  anchor: Vec3;
  atom: Vec3;
  hydrogen?: Vec3;
  id: string;
  kind: TerminationKind;
  side: "top" | "bottom";
};

const LAYER_DEFINITIONS: Array<{
  element: MxeneElement;
  id: MxeneLayerId;
  labelZh: string;
  offset: [number, number];
  y: number;
}> = [
  { element: "Ti", id: "ti-top", labelZh: "表面 Ti", offset: [0, 0], y: 0.56 },
  { element: "C", id: "c-top", labelZh: "C", offset: [0.5, Math.sqrt(3) / 6], y: 0.28 },
  { element: "Ti", id: "ti-inner", labelZh: "内部 Ti", offset: [0, Math.sqrt(3) / 3], y: 0 },
  { element: "C", id: "c-bottom", labelZh: "C", offset: [0.5, Math.sqrt(3) / 6], y: -0.28 },
  { element: "Ti", id: "ti-bottom", labelZh: "表面 Ti", offset: [0, 0], y: -0.56 },
];

export const OCTAHEDRAL_TI_POSITIONS: Vec3[] = [
  ...triangleAt(0.34, 0.48, 0),
  ...triangleAt(-0.34, 0.48, Math.PI / 3),
];

export const OCTAHEDRON_EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 0],
  [3, 4], [4, 5], [5, 3],
  [0, 3], [0, 5], [1, 3], [1, 4], [2, 4], [2, 5],
];

export function createMxenePatch(radius = 2, spacing = 0.5): MxenePatch {
  const layers = LAYER_DEFINITIONS.map((definition) => ({
    atoms: createTriangularLayer(
      definition.id,
      definition.element,
      definition.y,
      [definition.offset[0] * spacing, definition.offset[1] * spacing],
      radius,
      spacing,
    ),
    element: definition.element,
    id: definition.id,
    labelZh: definition.labelZh,
    y: definition.y,
  }));

  return {
    layers,
    links: createAdjacentLayerLinks(layers, spacing * 1.03),
    radius,
    spacing,
  };
}

export function createTerminationSites(patch: MxenePatch, count = 7): TerminationSite[] {
  const topLayer = patch.layers.find((layer) => layer.id === "ti-top");
  const bottomLayer = patch.layers.find((layer) => layer.id === "ti-bottom");
  if (!topLayer || !bottomLayer) return [];

  const orderedTop = [...topLayer.atoms]
    .sort((a, b) => inPlaneDistance(a.position) - inPlaneDistance(b.position))
    .slice(0, count);
  const bottomByPlanarKey = new Map(
    bottomLayer.atoms.map((atom) => [planarKey(atom.position), atom]),
  );
  const pattern: TerminationKind[] = ["O", "OH", "F", "O", "F", "OH", "O"];

  return orderedTop.flatMap((topAtom, index) => {
    const bottomAtom = bottomByPlanarKey.get(planarKey(topAtom.position));
    if (!bottomAtom) return [];
    const kind = pattern[index % pattern.length];
    return [
      createTerminationSite(topAtom.position, kind, "top", index),
      createTerminationSite(bottomAtom.position, kind, "bottom", index),
    ];
  });
}

export function translate(position: Vec3, offset: Vec3): Vec3 {
  return [position[0] + offset[0], position[1] + offset[1], position[2] + offset[2]];
}

function createTriangularLayer(
  layerId: MxeneLayerId,
  element: MxeneElement,
  y: number,
  offset: [number, number],
  radius: number,
  spacing: number,
): MxeneLayerAtom[] {
  const atoms: MxeneLayerAtom[] = [];

  for (let q = -radius; q <= radius; q += 1) {
    for (let r = -radius; r <= radius; r += 1) {
      if (Math.abs(q + r) > radius) continue;
      const x = spacing * (q + r / 2) + offset[0];
      const z = spacing * (Math.sqrt(3) / 2) * r + offset[1];
      atoms.push({
        element,
        id: `${layerId}-${q + radius}-${r + radius}`,
        layerId,
        position: [x, y, z],
      });
    }
  }

  return atoms;
}

function createAdjacentLayerLinks(layers: MxeneLayer[], maximumDistance: number): MxeneLink[] {
  const links: MxeneLink[] = [];

  for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex += 1) {
    const firstLayer = layers[layerIndex];
    const secondLayer = layers[layerIndex + 1];

    for (const atom of firstLayer.atoms) {
      const nearest = secondLayer.atoms
        .map((candidate) => ({ candidate, distance: distance(atom.position, candidate.position) }))
        .filter((entry) => entry.distance <= maximumDistance)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);

      for (const { candidate } of nearest) {
        links.push({
          end: candidate.position,
          id: `link-${atom.id}-${candidate.id}`,
          start: atom.position,
        });
      }
    }
  }

  return links;
}

function createTerminationSite(
  anchor: Vec3,
  kind: TerminationKind,
  side: "top" | "bottom",
  index: number,
): TerminationSite {
  const direction = side === "top" ? 1 : -1;
  const atom: Vec3 = [anchor[0], anchor[1] + direction * 0.27, anchor[2]];
  return {
    anchor,
    atom,
    hydrogen: kind === "OH"
      ? [anchor[0] + 0.07, atom[1] + direction * 0.14, anchor[2] + 0.04]
      : undefined,
    id: `termination-${side}-${index}-${kind}`,
    kind,
    side,
  };
}

function triangleAt(y: number, radius: number, rotation: number): Vec3[] {
  return Array.from({ length: 3 }, (_, index) => {
    const angle = rotation + index * (Math.PI * 2 / 3);
    return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
  });
}

function distance(a: Vec3, b: Vec3) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function inPlaneDistance(position: Vec3) {
  return Math.hypot(position[0], position[2]);
}

function planarKey(position: Vec3) {
  return `${position[0].toFixed(4)}-${position[2].toFixed(4)}`;
}
