import type {
  BuilderAtom,
  BuilderBond,
  BuilderSeed,
  BuilderVec3,
} from "@/types/organicBuilder";

const atom = (
  id: string,
  element: BuilderAtom["element"],
  position: BuilderVec3,
  radius?: number,
): BuilderAtom => ({ id, element, label: element, position, radius });

const bond = (
  id: string,
  first: string,
  second: string,
  order: BuilderBond["order"] = 1,
): BuilderBond => ({ id, atomIds: [first, second], order });

export const ethyleneBuilderSeed: BuilderSeed = {
  id: "ethylene-planar",
  moduleId: "ethylene-planar",
  nameZh: "乙烯",
  formula: "C₂H₄",
  noteZh: "双键两端的碳采用 sp² 杂化，六个原子近似共面。",
  atoms: [
    atom("c1", "C", [-0.67, 0, 0], 0.22),
    atom("c2", "C", [0.67, 0, 0], 0.22),
    atom("h1", "H", [-1.215, 0.944, 0], 0.15),
    atom("h2", "H", [-1.215, -0.944, 0], 0.15),
    atom("h3", "H", [1.215, 0.944, 0], 0.15),
    atom("h4", "H", [1.215, -0.944, 0], 0.15),
  ],
  bonds: [
    bond("c1-c2", "c1", "c2", 2),
    bond("c1-h1", "c1", "h1"),
    bond("c1-h2", "c1", "h2"),
    bond("c2-h3", "c2", "h3"),
    bond("c2-h4", "c2", "h4"),
  ],
};

export const acetyleneBuilderSeed: BuilderSeed = {
  id: "acetylene-linear",
  moduleId: "acetylene-linear",
  nameZh: "乙炔",
  formula: "C₂H₂",
  noteZh: "三键两端的碳采用 sp 杂化，H—C≡C—H 四个原子共线。",
  atoms: [
    atom("h1", "H", [-1.72, 0, 0], 0.15),
    atom("c1", "C", [-0.62, 0, 0], 0.22),
    atom("c2", "C", [0.62, 0, 0], 0.22),
    atom("h2", "H", [1.72, 0, 0], 0.15),
  ],
  bonds: [
    bond("h1-c1", "h1", "c1"),
    bond("c1-c2", "c1", "c2", 3),
    bond("c2-h2", "c2", "h2"),
  ],
};

const ringRadius = 1.12;
const hydrogenRadius = 1.78;
const ringAngles = [0, 60, 120, 180, 240, 300].map((degree) => (degree * Math.PI) / 180);

export const benzeneBuilderSeed: BuilderSeed = {
  id: "benzene-planar",
  moduleId: "benzene-planar",
  nameZh: "苯",
  formula: "C₆H₆",
  noteZh: "拼装态用交替单双键表示；真实苯环中的 π 电子离域，六条碳碳键等价。",
  atoms: [
    ...ringAngles.map((angle, index) =>
      atom(
        `c${index + 1}`,
        "C",
        [round(ringRadius * Math.cos(angle)), round(ringRadius * Math.sin(angle)), 0],
        0.2,
      ),
    ),
    ...ringAngles.map((angle, index) =>
      atom(
        `h${index + 1}`,
        "H",
        [round(hydrogenRadius * Math.cos(angle)), round(hydrogenRadius * Math.sin(angle)), 0],
        0.14,
      ),
    ),
  ],
  bonds: [
    ...[1, 2, 3, 4, 5, 6].map((index) =>
      bond(
        `c${index}-c${index === 6 ? 1 : index + 1}`,
        `c${index}`,
        `c${index === 6 ? 1 : index + 1}`,
        index % 2 === 1 ? 2 : 1,
      ),
    ),
    ...[1, 2, 3, 4, 5, 6].map((index) => bond(`c${index}-h${index}`, `c${index}`, `h${index}`)),
  ],
};

export const organicCoplanarBuilderSeed = createOrganicCoplanarSeed();

export const organicBuilderSeeds: BuilderSeed[] = [
  ethyleneBuilderSeed,
  acetyleneBuilderSeed,
  benzeneBuilderSeed,
  organicCoplanarBuilderSeed,
];

const seedsById = new Map(organicBuilderSeeds.map((seed) => [seed.id, seed]));

export function getOrganicBuilderSeed(seedId: string): BuilderSeed | undefined {
  const seed = seedsById.get(seedId);
  return seed ? cloneBuilderSeed(seed) : undefined;
}

export function cloneBuilderSeed(seed: BuilderSeed): BuilderSeed {
  return {
    ...seed,
    atoms: seed.atoms.map((candidate) => ({ ...candidate, position: [...candidate.position] as BuilderVec3 })),
    bonds: seed.bonds.map((candidate) => ({ ...candidate, atomIds: [...candidate.atomIds] as [string, string] })),
  };
}

function createOrganicCoplanarSeed(): BuilderSeed {
  const radius = 1.16;
  const angles = [0, 60, 120, 180, 240, 300].map((degree) => (degree * Math.PI) / 180);
  const positions = angles.map((angle): BuilderVec3 => [radius * Math.cos(angle), radius * Math.sin(angle), 0]);
  const atoms: BuilderAtom[] = positions.map((position, index) => atom(`ringC${index + 1}`, "C", position, 0.17));
  const bonds: BuilderBond[] = positions.map((_, index) =>
    bond(
      `ring-${index + 1}`,
      `ringC${index + 1}`,
      `ringC${((index + 1) % positions.length) + 1}`,
      index % 2 === 0 ? 2 : 1,
    ),
  );

  const addAtom = (id: string, element: BuilderAtom["element"], position: BuilderVec3, radiusValue: number) => {
    atoms.push(atom(id, element, position, radiusValue));
  };
  const addBond = (id: string, first: string, second: string, order: BuilderBond["order"] = 1) => {
    bonds.push(bond(id, first, second, order));
  };
  const radial = (index: number) => normalize(positions[index]);
  const tangent = (direction: BuilderVec3): BuilderVec3 => normalize([-direction[1], direction[0], 0]);

  [2, 5].forEach((ringIndex) => {
    const hPosition = add(positions[ringIndex], scale(radial(ringIndex), 0.45));
    addAtom(`ringH${ringIndex + 1}`, "H", hPosition, 0.105);
    addBond(`ringC${ringIndex + 1}-H`, `ringC${ringIndex + 1}`, `ringH${ringIndex + 1}`);
  });

  const methylDirection = radial(0);
  const methylTangent = tangent(methylDirection);
  const methylC = add(positions[0], scale(methylDirection, 0.92));
  addAtom("methylC", "C", methylC, 0.16);
  addBond("ringC1-methylC", "ringC1", "methylC");
  [
    add(add(methylC, scale(methylDirection, 0.34)), [0, 0, 0.48]),
    add(add(add(methylC, scale(methylDirection, 0.34)), scale(methylTangent, 0.42)), [0, 0, -0.24]),
    add(add(add(methylC, scale(methylDirection, 0.34)), scale(methylTangent, -0.42)), [0, 0, -0.24]),
  ].forEach((position, index) => {
    addAtom(`methylH${index + 1}`, "H", position, 0.1);
    addBond(`methylC-H${index + 1}`, "methylC", `methylH${index + 1}`);
  });

  const vinylDirection = radial(1);
  const vinylTangent = tangent(vinylDirection);
  const vinylPlaneVector = normalize(add(scale(vinylTangent, Math.cos(Math.PI / 4)), [0, 0, Math.sin(Math.PI / 4)]));
  const vinylC1 = add(positions[1], scale(vinylDirection, 0.86));
  const vinylC2 = add(vinylC1, scale(vinylDirection, 0.78));
  const vinylH1 = add(vinylC1, scale(vinylPlaneVector, 0.46));
  const vinylH2 = add(add(vinylC2, scale(vinylDirection, 0.16)), scale(vinylPlaneVector, 0.42));
  const vinylH3 = add(add(vinylC2, scale(vinylDirection, 0.16)), scale(vinylPlaneVector, -0.42));
  addAtom("vinylC1", "C", vinylC1, 0.155);
  addAtom("vinylC2", "C", vinylC2, 0.155);
  [vinylH1, vinylH2, vinylH3].forEach((position, index) => addAtom(`vinylH${index + 1}`, "H", position, 0.1));
  addBond("ringC2-vinylC1", "ringC2", "vinylC1");
  addBond("vinylC1-vinylC2", "vinylC1", "vinylC2", 2);
  addBond("vinylC1-H", "vinylC1", "vinylH1");
  addBond("vinylC2-H1", "vinylC2", "vinylH2");
  addBond("vinylC2-H2", "vinylC2", "vinylH3");

  const ethynylDirection = radial(3);
  const ethynylC1 = add(positions[3], scale(ethynylDirection, 0.82));
  const ethynylC2 = add(ethynylC1, scale(ethynylDirection, 0.72));
  const ethynylH = add(ethynylC2, scale(ethynylDirection, 0.44));
  addAtom("ethynylC1", "C", ethynylC1, 0.148);
  addAtom("ethynylC2", "C", ethynylC2, 0.148);
  addAtom("ethynylH", "H", ethynylH, 0.1);
  addBond("ringC4-ethynylC1", "ringC4", "ethynylC1");
  addBond("ethynylC1-ethynylC2", "ethynylC1", "ethynylC2", 3);
  addBond("ethynylC2-H", "ethynylC2", "ethynylH");

  const amineDirection = radial(4);
  const amineTangent = tangent(amineDirection);
  const amineN = add(add(positions[4], scale(amineDirection, 0.78)), [0, 0, 0.05]);
  const amineH1 = add(add(add(amineN, scale(amineDirection, 0.3)), scale(amineTangent, 0.34)), [0, 0, 0.16]);
  const amineH2 = add(add(add(amineN, scale(amineDirection, 0.3)), scale(amineTangent, -0.34)), [0, 0, -0.16]);
  addAtom("amineN", "N", amineN, 0.15);
  addAtom("amineH1", "H", amineH1, 0.1);
  addAtom("amineH2", "H", amineH2, 0.1);
  addBond("ringC5-amineN", "ringC5", "amineN");
  addBond("amineN-H1", "amineN", "amineH1");
  addBond("amineN-H2", "amineN", "amineH2");

  return {
    id: "organic-coplanar",
    moduleId: "organic-coplanar",
    nameZh: "有机共面分析综合模型",
    formula: "C₁₁H₁₁N",
    noteZh: "这是用于比较 sp³、sp²、sp 与胺基空间结构的教学综合模型。",
    atoms,
    bonds,
  };
}

function add(first: BuilderVec3, second: BuilderVec3): BuilderVec3 {
  return [first[0] + second[0], first[1] + second[1], first[2] + second[2]];
}

function scale(value: BuilderVec3, factor: number): BuilderVec3 {
  return [value[0] * factor, value[1] * factor, value[2] * factor];
}

function normalize(value: BuilderVec3): BuilderVec3 {
  const length = Math.hypot(...value) || 1;
  return scale(value, 1 / length);
}

function round(value: number): number {
  return Number(value.toFixed(4));
}
