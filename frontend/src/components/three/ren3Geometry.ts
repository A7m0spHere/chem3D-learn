import type { Vec3 } from "@/components/three/StickCylinder";

export type FractionalVec3 = [number, number, number];
export type Ren3Element = "Re" | "N";
export type Ren3Site = "Re-2b" | "N1-4c" | "N2-2b";

export type Ren3Atom = {
  cartesian: Vec3;
  element: Ren3Element;
  fractional: FractionalVec3;
  id: string;
  site: Ren3Site;
};

export type Ren3AtomImage = Ren3Atom & {
  cartesian: Vec3;
  imageId: string;
  translation: Vec3;
};

export type Ren3Neighbor = {
  atom: Ren3AtomImage;
  distance: number;
  relative: Vec3;
};

export type Ren3Coordination = {
  center: Ren3AtomImage;
  neighbors: Ren3Neighbor[];
};

export type Ren3TriNitrogenUnit = {
  center: Ren3AtomImage;
  terminals: Ren3Neighbor[];
};

export type Ren3Link = {
  distance: number;
  end: Vec3;
  id: string;
  kind: "Re-N" | "N-N";
  start: Vec3;
};

export type Ren3Polyhedron = {
  center: Vec3;
  id: string;
  vertices: Vec3[];
};

export type Ren3NetworkModel = {
  atoms: Ren3AtomImage[];
  links: Ren3Link[];
  polyhedra: Ren3Polyhedron[];
};

export const REN3_LATTICE = {
  a: 5.25,
  b: 2.81,
  c: 4.75,
} as const;

export const REN3_RE_N_CUTOFF = 2.25;
export const REN3_N_N_CUTOFF = 1.5;

const IMM2_SEEDS: Array<{
  element: Ren3Element;
  fractional: FractionalVec3;
  site: Ren3Site;
}> = [
  { element: "Re", fractional: [0.5, 0, 0.3466], site: "Re-2b" },
  { element: "N", fractional: [0.21, 0.5, 0.2455], site: "N1-4c" },
  { element: "N", fractional: [0, 0.5, 0.4123], site: "N2-2b" },
];

const DEFAULT_PERIODIC_TRANSLATIONS = createTranslationGrid(-1, 1);

export const REN3_CONVENTIONAL_ATOMS = createRen3ConventionalCell();

export const REN3_CELL_COUNTS = REN3_CONVENTIONAL_ATOMS.reduce(
  (counts, atom) => {
    counts[atom.element] += 1;
    return counts;
  },
  { Re: 0, N: 0 } as Record<Ren3Element, number>,
);

export function createRen3ConventionalCell(): Ren3Atom[] {
  return IMM2_SEEDS.flatMap((seed) => {
    const generated = applyImm2Operations(seed.fractional);
    return generated.map((fractional, index) => ({
      cartesian: fractionalToCartesian(fractional),
      element: seed.element,
      fractional,
      id: `${seed.site}-${index + 1}`,
      site: seed.site,
    }));
  });
}

export function applyImm2Operations(fractional: FractionalVec3): FractionalVec3[] {
  const [x, y, z] = fractional;
  const mirrorImages: FractionalVec3[] = [
    [x, y, z],
    [-x, y, z],
    [x, -y, z],
    [-x, -y, z],
  ];
  const withBodyCentering = mirrorImages.flatMap<FractionalVec3>((position) => [
    position,
    [position[0] + 0.5, position[1] + 0.5, position[2] + 0.5],
  ]);

  return dedupeFractional(withBodyCentering.map(wrapFractional));
}

export function createRen3PeriodicAtoms(
  translations: Vec3[] = DEFAULT_PERIODIC_TRANSLATIONS,
): Ren3AtomImage[] {
  return translations.flatMap((translation) =>
    REN3_CONVENTIONAL_ATOMS.map((atom) => atomToImage(atom, translation)),
  );
}

export function getRepresentativeRen3Coordination(): Ren3Coordination {
  const centerAtom = REN3_CONVENTIONAL_ATOMS.find((atom) => atom.site === "Re-2b");
  if (!centerAtom) throw new Error("Imm2-ReN3 缺少 Re 2b 位点");
  const center = atomToImage(centerAtom, [0, 0, 0]);
  const neighbors = createRen3PeriodicAtoms()
    .filter((candidate) => candidate.element === "N")
    .map((candidate) => ({
      atom: candidate,
      distance: distance(center.cartesian, candidate.cartesian),
      relative: subtract(candidate.cartesian, center.cartesian),
    }))
    .filter((entry) => entry.distance <= REN3_RE_N_CUTOFF)
    .sort((first, second) => first.distance - second.distance);

  return { center, neighbors };
}

export function getRepresentativeTriNitrogenUnit(): Ren3TriNitrogenUnit {
  const centerAtom = REN3_CONVENTIONAL_ATOMS.find((atom) => atom.site === "N2-2b");
  if (!centerAtom) throw new Error("Imm2-ReN3 缺少 N2 2b 位点");
  const center = atomToImage(centerAtom, [0, 0, 0]);
  const terminals = createRen3PeriodicAtoms()
    .filter((candidate) => candidate.site === "N1-4c")
    .map((candidate) => ({
      atom: candidate,
      distance: distance(center.cartesian, candidate.cartesian),
      relative: subtract(candidate.cartesian, center.cartesian),
    }))
    .filter((entry) => entry.distance <= REN3_N_N_CUTOFF)
    .sort((first, second) => first.atom.cartesian[0] - second.atom.cartesian[0]);

  return { center, terminals };
}

export function createRen3NetworkModel(): Ren3NetworkModel {
  const reAtoms = REN3_CONVENTIONAL_ATOMS.filter((atom) => atom.element === "Re");
  const centerImages = [
    atomToImage(reAtoms[0], [0, 0, 0]),
    atomToImage(reAtoms[1], [0, 0, 0]),
    atomToImage(reAtoms[0], [1, 0, 0]),
    atomToImage(reAtoms[1], [0, 0, 1]),
  ];
  const candidates = createRen3PeriodicAtoms(createTranslationGrid(-1, 2));
  const atomMap = new Map<string, Ren3AtomImage>();
  const linkMap = new Map<string, Ren3Link>();
  const polyhedra: Ren3Polyhedron[] = [];

  for (const center of centerImages) {
    atomMap.set(cartesianKey(center.cartesian, center.element), center);
    const neighbors = candidates
      .filter((candidate) => candidate.element === "N")
      .map((candidate) => ({
        atom: candidate,
        distance: distance(center.cartesian, candidate.cartesian),
      }))
      .filter((entry) => entry.distance <= REN3_RE_N_CUTOFF)
      .sort((first, second) => first.distance - second.distance);

    for (const neighbor of neighbors) {
      atomMap.set(cartesianKey(neighbor.atom.cartesian, neighbor.atom.element), neighbor.atom);
      const key = undirectedLinkKey(center.cartesian, neighbor.atom.cartesian, "Re-N");
      linkMap.set(key, {
        distance: neighbor.distance,
        end: neighbor.atom.cartesian,
        id: key,
        kind: "Re-N",
        start: center.cartesian,
      });
    }

    polyhedra.push({
      center: center.cartesian,
      id: `polyhedron-${center.imageId}`,
      vertices: neighbors.map((entry) => entry.atom.cartesian),
    });
  }

  const currentAtoms = [...atomMap.values()];
  for (const center of currentAtoms.filter((atom) => atom.site === "N2-2b")) {
    for (const terminal of candidates.filter((atom) => atom.site === "N1-4c")) {
      const nNDistance = distance(center.cartesian, terminal.cartesian);
      if (nNDistance > REN3_N_N_CUTOFF) continue;
      atomMap.set(cartesianKey(terminal.cartesian, terminal.element), terminal);
      const key = undirectedLinkKey(center.cartesian, terminal.cartesian, "N-N");
      linkMap.set(key, {
        distance: nNDistance,
        end: terminal.cartesian,
        id: key,
        kind: "N-N",
        start: center.cartesian,
      });
    }
  }

  return {
    atoms: [...atomMap.values()],
    links: [...linkMap.values()],
    polyhedra,
  };
}

export function fractionalToCartesian(
  fractional: FractionalVec3,
  translation: Vec3 = [0, 0, 0],
): Vec3 {
  return [
    (fractional[0] + translation[0]) * REN3_LATTICE.a,
    (fractional[1] + translation[1]) * REN3_LATTICE.b,
    (fractional[2] + translation[2]) * REN3_LATTICE.c,
  ];
}

export function cartesianToScene(
  cartesian: Vec3,
  origin: Vec3 = [REN3_LATTICE.a / 2, REN3_LATTICE.b / 2, REN3_LATTICE.c / 2],
  scale = 0.52,
): Vec3 {
  return [
    (cartesian[0] - origin[0]) * scale,
    (cartesian[2] - origin[2]) * scale,
    (cartesian[1] - origin[1]) * scale,
  ];
}

export function relativeCartesianToScene(relative: Vec3, scale = 0.72): Vec3 {
  return [relative[0] * scale, relative[2] * scale, relative[1] * scale];
}

export function centerOfPoints(points: Vec3[]): Vec3 {
  if (points.length === 0) return [0, 0, 0];
  const total = points.reduce<Vec3>(
    (sum, point) => [sum[0] + point[0], sum[1] + point[1], sum[2] + point[2]],
    [0, 0, 0],
  );
  return [total[0] / points.length, total[1] / points.length, total[2] / points.length];
}

export function convexHullFaces(points: Vec3[]): Array<[number, number, number]> {
  const faces: Array<[number, number, number]> = [];
  const center = centerOfPoints(points);

  for (let first = 0; first < points.length - 2; first += 1) {
    for (let second = first + 1; second < points.length - 1; second += 1) {
      for (let third = second + 1; third < points.length; third += 1) {
        const normal = cross(
          subtract(points[second], points[first]),
          subtract(points[third], points[first]),
        );
        if (magnitude(normal) < 1e-7) continue;

        let hasPositive = false;
        let hasNegative = false;
        for (let index = 0; index < points.length; index += 1) {
          if (index === first || index === second || index === third) continue;
          const side = dot(normal, subtract(points[index], points[first]));
          if (side > 1e-6) hasPositive = true;
          if (side < -1e-6) hasNegative = true;
        }
        if (hasPositive && hasNegative) continue;

        const faceCenter: Vec3 = [
          (points[first][0] + points[second][0] + points[third][0]) / 3,
          (points[first][1] + points[second][1] + points[third][1]) / 3,
          (points[first][2] + points[second][2] + points[third][2]) / 3,
        ];
        const pointsOutward = dot(normal, subtract(faceCenter, center)) >= 0;
        faces.push(pointsOutward ? [first, second, third] : [first, third, second]);
      }
    }
  }

  return faces;
}

export function convexHullEdges(
  faces: Array<[number, number, number]>,
): Array<[number, number]> {
  const edgeMap = new Map<string, [number, number]>();
  for (const [first, second, third] of faces) {
    for (const [start, end] of [[first, second], [second, third], [third, first]] as Array<[
      number,
      number,
    ]>) {
      const ordered: [number, number] = start < end ? [start, end] : [end, start];
      edgeMap.set(`${ordered[0]}-${ordered[1]}`, ordered);
    }
  }
  return [...edgeMap.values()];
}

function atomToImage(atom: Ren3Atom, translation: Vec3): Ren3AtomImage {
  const cartesian = fractionalToCartesian(atom.fractional, translation);
  return {
    ...atom,
    cartesian,
    imageId: `${atom.id}@${translation.join(",")}`,
    translation,
  };
}

function createTranslationGrid(minimum: number, maximum: number): Vec3[] {
  const translations: Vec3[] = [];
  for (let x = minimum; x <= maximum; x += 1) {
    for (let y = minimum; y <= maximum; y += 1) {
      for (let z = minimum; z <= maximum; z += 1) {
        translations.push([x, y, z]);
      }
    }
  }
  return translations;
}

function wrapFractional(position: FractionalVec3): FractionalVec3 {
  return position.map((value) => ((value % 1) + 1) % 1) as FractionalVec3;
}

function dedupeFractional(positions: FractionalVec3[]): FractionalVec3[] {
  const positionMap = new Map<string, FractionalVec3>();
  for (const position of positions) {
    positionMap.set(position.map((value) => value.toFixed(5)).join("-"), position);
  }
  return [...positionMap.values()];
}

function cartesianKey(position: Vec3, element: Ren3Element): string {
  return `${element}-${position.map((value) => value.toFixed(4)).join("-")}`;
}

function undirectedLinkKey(start: Vec3, end: Vec3, kind: Ren3Link["kind"]): string {
  const keys = [start, end].map((position) => position.map((value) => value.toFixed(4)).join("-"));
  keys.sort();
  return `${kind}-${keys.join("|")}`;
}

function subtract(first: Vec3, second: Vec3): Vec3 {
  return [first[0] - second[0], first[1] - second[1], first[2] - second[2]];
}

function distance(first: Vec3, second: Vec3): number {
  return magnitude(subtract(first, second));
}

function magnitude(vector: Vec3): number {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function cross(first: Vec3, second: Vec3): Vec3 {
  return [
    first[1] * second[2] - first[2] * second[1],
    first[2] * second[0] - first[0] * second[2],
    first[0] * second[1] - first[1] * second[0],
  ];
}

function dot(first: Vec3, second: Vec3): number {
  return first[0] * second[0] + first[1] * second[1] + first[2] * second[2];
}
