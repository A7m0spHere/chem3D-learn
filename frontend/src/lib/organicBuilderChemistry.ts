import type {
  BuilderAtom,
  BuilderBond,
  BuilderBondOrder,
  BuilderElement,
  BuilderFragmentTemplate,
  BuilderMolecule,
  BuilderVec3,
  KnownMolecule,
  ValidationResult,
} from "@/types/organicBuilder";

export const builderElementConfig: Record<
  BuilderElement,
  { color: string; radius: number; valence: number; mass: number }
> = {
  C: { color: "#1F2933", radius: 0.24, valence: 4, mass: 12.011 },
  H: { color: "#FFFFFF", radius: 0.17, valence: 1, mass: 1.008 },
  O: { color: "#DC2626", radius: 0.22, valence: 2, mass: 15.999 },
  N: { color: "#2563EB", radius: 0.23, valence: 3, mass: 14.007 },
  F: { color: "#65A30D", radius: 0.2, valence: 1, mass: 18.998 },
  Cl: { color: "#16A34A", radius: 0.25, valence: 1, mass: 35.45 },
  Br: { color: "#9A3412", radius: 0.27, valence: 1, mass: 79.904 },
  I: { color: "#7E22CE", radius: 0.29, valence: 1, mass: 126.904 },
};

const LINEAR_DIRECTIONS: BuilderVec3[] = [[1, 0, 0], [-1, 0, 0]];
const PLANAR_DIRECTIONS: BuilderVec3[] = [
  [1, 0, 0],
  [-0.5, 0.866, 0],
  [-0.5, -0.866, 0],
];
const TETRAHEDRAL_DIRECTIONS: BuilderVec3[] = [
  [0.577, 0.577, 0.577],
  [0.577, -0.577, -0.577],
  [-0.577, 0.577, -0.577],
  [-0.577, -0.577, 0.577],
];
const PYRAMIDAL_DIRECTIONS: BuilderVec3[] = [
  [0.94, 0, -0.34],
  [-0.47, 0.814, -0.34],
  [-0.47, -0.814, -0.34],
];
const BENT_DIRECTIONS: BuilderVec3[] = [
  [0.79, 0.61, 0],
  [0.79, -0.61, 0],
];

export const builderFragmentTemplates: BuilderFragmentTemplate[] = [
  {
    id: "methyl",
    label: "–CH₃",
    nameZh: "甲基",
    attachmentAtomId: "c",
    atoms: [
      templateAtom("c", "C", [0, 0, 0]),
      templateAtom("h1", "H", [0.72, 0.58, 0.45]),
      templateAtom("h2", "H", [0.72, -0.58, 0.45]),
      templateAtom("h3", "H", [0.72, 0, -0.68]),
    ],
    bonds: [fragmentBond("c", "h1"), fragmentBond("c", "h2"), fragmentBond("c", "h3")],
  },
  {
    id: "hydroxyl",
    label: "–OH",
    nameZh: "羟基",
    attachmentAtomId: "o",
    atoms: [templateAtom("o", "O", [0, 0, 0]), templateAtom("h", "H", [0.75, 0.48, 0])],
    bonds: [fragmentBond("o", "h")],
  },
  {
    id: "amino",
    label: "–NH₂",
    nameZh: "氨基",
    attachmentAtomId: "n",
    atoms: [
      templateAtom("n", "N", [0, 0, 0]),
      templateAtom("h1", "H", [0.72, 0.56, 0.22]),
      templateAtom("h2", "H", [0.72, -0.56, 0.22]),
    ],
    bonds: [fragmentBond("n", "h1"), fragmentBond("n", "h2")],
  },
  {
    id: "aldehyde",
    label: "–CHO",
    nameZh: "醛基",
    attachmentAtomId: "c",
    atoms: [
      templateAtom("c", "C", [0, 0, 0]),
      templateAtom("o", "O", [0.78, 0.62, 0]),
      templateAtom("h", "H", [0.78, -0.62, 0]),
    ],
    bonds: [fragmentBond("c", "o", 2), fragmentBond("c", "h")],
  },
  {
    id: "carbonyl",
    label: "–C(=O)–",
    nameZh: "羰基片段",
    attachmentAtomId: "c",
    atoms: [templateAtom("c", "C", [0, 0, 0]), templateAtom("o", "O", [0.82, 0.56, 0])],
    bonds: [fragmentBond("c", "o", 2)],
  },
  {
    id: "carboxyl",
    label: "–COOH",
    nameZh: "羧基",
    attachmentAtomId: "c",
    atoms: [
      templateAtom("c", "C", [0, 0, 0]),
      templateAtom("o1", "O", [0.82, 0.6, 0]),
      templateAtom("o2", "O", [0.82, -0.6, 0]),
      templateAtom("h", "H", [1.55, -0.84, 0]),
    ],
    bonds: [fragmentBond("c", "o1", 2), fragmentBond("c", "o2"), fragmentBond("o2", "h")],
  },
];

export const knownOrganicMolecules: KnownMolecule[] = [
  known("methane", "甲烷", "Methane", "烷烃", "最简单的有机物，碳原子呈四面体成键。", ["C"], []),
  known("ethane", "乙烷", "Ethane", "烷烃", "两个碳以单键相连，碳碳单键可旋转。", ["C", "C"], [[0, 1, 1]]),
  known("ethene", "乙烯", "Ethene", "烯烃", "含一个碳碳双键，双键片段近似共面。", ["C", "C"], [[0, 1, 2]]),
  known("ethyne", "乙炔", "Ethyne", "炔烃", "含一个碳碳三键，三键片段呈直线形。", ["C", "C"], [[0, 1, 3]]),
  known("propane", "丙烷", "Propane", "烷烃", "三个碳以单键连接形成饱和碳链。", ["C", "C", "C"], [[0, 1, 1], [1, 2, 1]]),
  known("propene", "丙烯", "Propene", "烯烃", "三个碳的碳链中含一个碳碳双键。", ["C", "C", "C"], [[0, 1, 2], [1, 2, 1]]),
  known("propyne", "丙炔", "Propyne", "炔烃", "三个碳的碳链中含一个碳碳三键。", ["C", "C", "C"], [[0, 1, 3], [1, 2, 1]]),
  known(
    "benzene",
    "苯",
    "Benzene",
    "芳香烃",
    "六个碳形成平面环；交替单双键只是离域结构的一种教学表示。",
    ["C", "C", "C", "C", "C", "C"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1]],
  ),
  known("methanol", "甲醇", "Methanol", "醇", "最简单的醇，含一个羟基。", ["C", "O"], [[0, 1, 1]]),
  known("ethanol", "乙醇", "Ethanol", "醇", "含两个碳和一个羟基。", ["C", "C", "O"], [[0, 1, 1], [1, 2, 1]]),
  known("methanal", "甲醛", "Methanal", "醛", "最简单的醛，含醛基。", ["C", "O"], [[0, 1, 2]]),
  known("ethanal", "乙醛", "Ethanal", "醛", "两个碳的醛，末端含醛基。", ["C", "C", "O"], [[0, 1, 1], [1, 2, 2]]),
  known("methanoic-acid", "甲酸", "Methanoic acid", "羧酸", "最简单的羧酸。", ["C", "O", "O"], [[0, 1, 2], [0, 2, 1]]),
  known("ethanoic-acid", "乙酸", "Ethanoic acid", "羧酸", "含甲基和羧基的常见羧酸。", ["C", "C", "O", "O"], [[0, 1, 1], [1, 2, 2], [1, 3, 1]]),
  known("dimethyl-ether", "二甲醚", "Dimethyl ether", "醚", "与乙醇分子式相同，但连接关系不同。", ["C", "O", "C"], [[0, 1, 1], [1, 2, 1]]),
  known("methylamine", "甲胺", "Methylamine", "胺", "含一个甲基和一个氨基。", ["C", "N"], [[0, 1, 1]]),
  known("ethylamine", "乙胺", "Ethylamine", "胺", "含两个碳的碳链和一个氨基。", ["C", "C", "N"], [[0, 1, 1], [1, 2, 1]]),
];

export function validateBuilderMolecule(molecule: BuilderMolecule): ValidationResult {
  if (molecule.atoms.length === 0) {
    return {
      isComplete: false,
      fragmentCount: 0,
      completeAtomCount: 0,
      totalAtomCount: 0,
      issues: [{ kind: "empty", messageZh: "先从左侧原子盒中添加一个原子。" }],
    };
  }

  const issues: ValidationResult["issues"] = [];
  let completeAtomCount = 0;
  for (const candidate of molecule.atoms) {
    const used = getAtomBondOrderSum(molecule, candidate.id);
    const expected = builderElementConfig[candidate.element].valence;
    if (used === expected) {
      completeAtomCount += 1;
    } else if (used < expected) {
      issues.push({
        atomId: candidate.id,
        kind: "under-valence",
        messageZh: `${candidate.element} 还可形成 ${expected - used} 个键级。`,
      });
    } else {
      issues.push({
        atomId: candidate.id,
        kind: "over-valence",
        messageZh: `${candidate.element} 已超过当前教学模型允许的 ${expected} 价。`,
      });
    }
  }

  const fragmentCount = countFragments(molecule);
  if (fragmentCount > 1) {
    issues.push({ kind: "disconnected", messageZh: `当前有 ${fragmentCount} 个彼此分开的片段。` });
  }

  return {
    isComplete: completeAtomCount === molecule.atoms.length && fragmentCount === 1,
    fragmentCount,
    completeAtomCount,
    totalAtomCount: molecule.atoms.length,
    issues,
  };
}

export function canSetBond(
  molecule: BuilderMolecule,
  firstAtomId: string,
  secondAtomId: string,
  order: BuilderBondOrder,
): { ok: true } | { ok: false; messageZh: string } {
  if (firstAtomId === secondAtomId) return { ok: false, messageZh: "不能让一个原子与自身成键。" };
  const first = molecule.atoms.find((candidate) => candidate.id === firstAtomId);
  const second = molecule.atoms.find((candidate) => candidate.id === secondAtomId);
  if (!first || !second) return { ok: false, messageZh: "没有找到要连接的原子。" };
  const existing = findBondBetween(molecule, firstAtomId, secondAtomId);
  const previousOrder = existing?.order ?? 0;
  const delta = order - previousOrder;
  if (delta <= 0) return { ok: true };

  for (const candidate of [first, second]) {
    const used = getAtomBondOrderSum(molecule, candidate.id);
    const maximum = builderElementConfig[candidate.element].valence;
    if (used + delta > maximum) {
      return {
        ok: false,
        messageZh: `${candidate.element} 不能再增加 ${delta} 个键级：这会超过当前中性价态 ${maximum}。`,
      };
    }
  }
  return { ok: true };
}

export function getAtomBondOrderSum(molecule: BuilderMolecule, atomId: string): number {
  return molecule.bonds.reduce(
    (sum, candidate) => (candidate.atomIds.includes(atomId) ? sum + candidate.order : sum),
    0,
  );
}

export function getFormula(molecule: BuilderMolecule): string {
  const counts = new Map<BuilderElement, number>();
  molecule.atoms.forEach((candidate) => counts.set(candidate.element, (counts.get(candidate.element) ?? 0) + 1));
  const remaining = [...counts.keys()].filter((element) => element !== "C" && element !== "H").sort();
  const order: BuilderElement[] = counts.has("C")
    ? (["C", "H", ...remaining] as BuilderElement[])
    : ([...counts.keys()].sort() as BuilderElement[]);
  return order
    .filter((element) => counts.has(element))
    .map((element) => `${element}${(counts.get(element) ?? 0) > 1 ? counts.get(element) : ""}`)
    .join("");
}

export function getRelativeMolecularMass(molecule: BuilderMolecule): number {
  return Number(
    molecule.atoms
      .reduce((sum, candidate) => sum + builderElementConfig[candidate.element].mass, 0)
      .toFixed(3),
  );
}

export function findKnownMolecule(molecule: BuilderMolecule): KnownMolecule | undefined {
  const validation = validateBuilderMolecule(molecule);
  if (!validation.isComplete) return undefined;
  return knownOrganicMolecules.find((candidate) => areMolecularGraphsEqual(molecule, candidate.molecule));
}

export function detectFunctionalGroups(molecule: BuilderMolecule): string[] {
  const groups = new Set<string>();
  const neighbors = buildNeighborMap(molecule);
  const amideNitrogenIds = new Set<string>();
  molecule.atoms.filter((candidate) => candidate.element === "C").forEach((carbon) => {
    const adjacent = neighbors.get(carbon.id) ?? [];
    if (!adjacent.some((entry) => entry.atom.element === "O" && entry.order === 2)) return;
    adjacent
      .filter((entry) => entry.atom.element === "N" && entry.order === 1)
      .forEach((entry) => amideNitrogenIds.add(entry.atom.id));
  });
  molecule.bonds.forEach((candidate) => {
    const first = molecule.atoms.find((atomCandidate) => atomCandidate.id === candidate.atomIds[0]);
    const second = molecule.atoms.find((atomCandidate) => atomCandidate.id === candidate.atomIds[1]);
    if (!first || !second) return;
    const elements = [first.element, second.element].sort().join("-");
    if (elements === "C-C" && candidate.order === 2) groups.add("碳碳双键");
    if (elements === "C-C" && candidate.order === 3) groups.add("碳碳三键");
    if (elements === "C-O" && candidate.order === 2) groups.add("羰基");
    if (elements === "C-N" && candidate.order === 1) {
      const carbon = first.element === "C" ? first : second;
      const nitrogen = first.element === "N" ? first : second;
      const isAmideBond = amideNitrogenIds.has(nitrogen.id)
        || (neighbors.get(carbon.id) ?? []).some((entry) =>
          entry.atom.element === "O" && entry.order === 2,
        );
      groups.add(isAmideBond ? "酰胺基" : "氨基/胺键片段");
    }
    if ([first.element, second.element].some((element) => ["F", "Cl", "Br", "I"].includes(element))) {
      groups.add("卤代结构");
    }
  });

  molecule.atoms.filter((candidate) => candidate.element === "O").forEach((oxygen) => {
    const adjacent = neighbors.get(oxygen.id) ?? [];
    if (adjacent.some((entry) => entry.atom.element === "H") && adjacent.some((entry) => entry.atom.element === "C")) {
      groups.add("羟基");
    }
  });

  molecule.atoms.filter((candidate) => candidate.element === "C").forEach((carbon) => {
    const adjacent = neighbors.get(carbon.id) ?? [];
    const hasCarbonyl = adjacent.some((entry) => entry.atom.element === "O" && entry.order === 2);
    const hasHydroxylO = adjacent.some((entry) => {
      if (entry.atom.element !== "O" || entry.order !== 1) return false;
      return (neighbors.get(entry.atom.id) ?? []).some((secondNeighbor) => secondNeighbor.atom.element === "H");
    });
    const hasHydrogen = adjacent.some((entry) => entry.atom.element === "H");
    if (hasCarbonyl && hasHydroxylO) groups.add("羧基");
    else if (hasCarbonyl && hasHydrogen) groups.add("醛基");
  });
  return [...groups];
}

export function autoFillHydrogens(molecule: BuilderMolecule): BuilderMolecule {
  const next = cloneBuilderMolecule(molecule);
  const targetIds = next.atoms.filter((candidate) => candidate.element !== "H").map((candidate) => candidate.id);
  targetIds.forEach((atomId) => {
    const target = next.atoms.find((candidate) => candidate.id === atomId);
    if (!target) return;
    const deficit = builderElementConfig[target.element].valence - getAtomBondOrderSum(next, atomId);
    for (let index = 0; index < deficit; index += 1) {
      const id = nextBuilderId(next, "h");
      const position = getSuggestedPosition(next, atomId, "H", 1);
      next.atoms.push({ id, element: "H", label: "H", position });
      next.bonds.push({ id: nextBuilderId(next, "bond"), atomIds: [atomId, id], order: 1 });
    }
  });
  return next;
}

export function getSuggestedPosition(
  molecule: BuilderMolecule,
  centerAtomId: string,
  newElement: BuilderElement,
  order: BuilderBondOrder,
): BuilderVec3 {
  const center = molecule.atoms.find((candidate) => candidate.id === centerAtomId);
  if (!center) return [0, 0, 0];
  const neighborAtoms = molecule.bonds
    .filter((candidate) => candidate.atomIds.includes(centerAtomId))
    .map((candidate) => {
      const neighborId = candidate.atomIds[0] === centerAtomId ? candidate.atomIds[1] : candidate.atomIds[0];
      return molecule.atoms.find((atomCandidate) => atomCandidate.id === neighborId);
    })
    .filter((candidate): candidate is BuilderAtom => Boolean(candidate));
  const hasTriple = molecule.bonds.some((candidate) => candidate.atomIds.includes(centerAtomId) && candidate.order === 3) || order === 3;
  const hasDouble = molecule.bonds.some((candidate) => candidate.atomIds.includes(centerAtomId) && candidate.order === 2) || order === 2;
  const directions = hasTriple
    ? LINEAR_DIRECTIONS
    : hasDouble
      ? PLANAR_DIRECTIONS
      : center.element === "O"
        ? BENT_DIRECTIONS
        : center.element === "N"
          ? PYRAMIDAL_DIRECTIONS
          : TETRAHEDRAL_DIRECTIONS;
  const usedDirections = neighborAtoms.map((candidate) => normalize(sub(candidate.position, center.position)));
  const direction = directions.reduce(
    (best, candidate) => {
      const score = usedDirections.length === 0
        ? candidate[0] * 0.05 + candidate[1] * 0.02
        : Math.min(...usedDirections.map((used) => 1 - dot(candidate, used)));
      return score > best.score ? { direction: candidate, score } : best;
    },
    { direction: directions[0], score: -Infinity },
  ).direction;
  const distance = getStylizedBondLength(center.element, newElement);
  return add(center.position, scale(direction, distance));
}

export function cloneBuilderMolecule(molecule: BuilderMolecule): BuilderMolecule {
  return {
    ...molecule,
    atoms: molecule.atoms.map((candidate) => ({ ...candidate, position: [...candidate.position] as BuilderVec3 })),
    bonds: molecule.bonds.map((candidate) => ({ ...candidate, atomIds: [...candidate.atomIds] as [string, string] })),
  };
}

export function detachBuilderAtom(molecule: BuilderMolecule, atomId: string): BuilderMolecule {
  return {
    ...cloneBuilderMolecule(molecule),
    bonds: molecule.bonds
      .filter((candidate) => !candidate.atomIds.includes(atomId))
      .map((candidate) => ({ ...candidate, atomIds: [...candidate.atomIds] as [string, string] })),
  };
}

export function findBondBetween(
  molecule: BuilderMolecule,
  firstAtomId: string,
  secondAtomId: string,
): BuilderBond | undefined {
  return molecule.bonds.find(
    (candidate) => candidate.atomIds.includes(firstAtomId) && candidate.atomIds.includes(secondAtomId),
  );
}

export function nextBuilderId(molecule: BuilderMolecule, prefix: string): string {
  const used = new Set([...molecule.atoms.map((candidate) => candidate.id), ...molecule.bonds.map((candidate) => candidate.id)]);
  let index = 1;
  while (used.has(`${prefix}-${index}`)) index += 1;
  return `${prefix}-${index}`;
}

export function areBuilderMoleculesEqual(first: BuilderMolecule, second: BuilderMolecule): boolean {
  if (!areMolecularGraphsEqual(first, second)) return false;
  const firstPositions = [...first.atoms]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((candidate) => [candidate.id, ...candidate.position.map((value) => Number(value.toFixed(4)))]);
  const secondPositions = [...second.atoms]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((candidate) => [candidate.id, ...candidate.position.map((value) => Number(value.toFixed(4)))]);
  return JSON.stringify(firstPositions) === JSON.stringify(secondPositions);
}

export function countFragments(molecule: BuilderMolecule): number {
  if (molecule.atoms.length === 0) return 0;
  const adjacency = new Map(molecule.atoms.map((candidate) => [candidate.id, [] as string[]]));
  molecule.bonds.forEach((candidate) => {
    adjacency.get(candidate.atomIds[0])?.push(candidate.atomIds[1]);
    adjacency.get(candidate.atomIds[1])?.push(candidate.atomIds[0]);
  });
  const visited = new Set<string>();
  let count = 0;
  molecule.atoms.forEach((candidate) => {
    if (visited.has(candidate.id)) return;
    count += 1;
    const queue = [candidate.id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      queue.push(...(adjacency.get(current) ?? []).filter((id) => !visited.has(id)));
    }
  });
  return count;
}

function areMolecularGraphsEqual(first: BuilderMolecule, second: BuilderMolecule): boolean {
  if (first.atoms.length !== second.atoms.length || first.bonds.length !== second.bonds.length) return false;
  const firstElements = first.atoms.map((candidate) => candidate.element).sort().join(",");
  const secondElements = second.atoms.map((candidate) => candidate.element).sort().join(",");
  if (firstElements !== secondElements) return false;

  const firstSignatures = new Map(
    first.atoms.map((candidate) => [candidate.id, atomSignature(first, candidate.id)]),
  );
  const secondSignatures = new Map(
    second.atoms.map((candidate) => [candidate.id, atomSignature(second, candidate.id)]),
  );
  const mapping = new Map<string, string>();
  const used = new Set<string>();
  const orderedFirst = [...first.atoms].sort((a, b) => {
    const candidateCountA = second.atoms.filter((candidate) => secondSignatures.get(candidate.id) === firstSignatures.get(a.id)).length;
    const candidateCountB = second.atoms.filter((candidate) => secondSignatures.get(candidate.id) === firstSignatures.get(b.id)).length;
    return candidateCountA - candidateCountB;
  });

  const search = (index: number): boolean => {
    if (index === orderedFirst.length) return true;
    const source = orderedFirst[index];
    const candidates = second.atoms.filter(
      (candidate) => !used.has(candidate.id) && secondSignatures.get(candidate.id) === firstSignatures.get(source.id),
    );
    for (const candidate of candidates) {
      let compatible = true;
      for (const [mappedSourceId, mappedTargetId] of mapping) {
        const sourceBond = findBondBetween(first, source.id, mappedSourceId);
        const targetBond = findBondBetween(second, candidate.id, mappedTargetId);
        if ((sourceBond?.order ?? 0) !== (targetBond?.order ?? 0)) {
          compatible = false;
          break;
        }
      }
      if (!compatible) continue;
      mapping.set(source.id, candidate.id);
      used.add(candidate.id);
      if (search(index + 1)) return true;
      mapping.delete(source.id);
      used.delete(candidate.id);
    }
    return false;
  };
  return search(0);
}

function atomSignature(molecule: BuilderMolecule, atomId: string): string {
  const candidate = molecule.atoms.find((atomCandidate) => atomCandidate.id === atomId);
  const bonds = molecule.bonds.filter((bondCandidate) => bondCandidate.atomIds.includes(atomId));
  return `${candidate?.element ?? "?"}|${bonds.length}|${bonds.reduce((sum, bondCandidate) => sum + bondCandidate.order, 0)}|${bonds.map((bondCandidate) => bondCandidate.order).sort().join("")}`;
}

function known(
  id: string,
  nameZh: string,
  nameEn: string,
  categoryZh: string,
  summaryZh: string,
  heavyElements: BuilderElement[],
  heavyBonds: Array<[number, number, BuilderBondOrder]>,
): KnownMolecule {
  const molecule: BuilderMolecule = {
    id,
    atoms: heavyElements.map((element, index) => ({
      id: `a${index}`,
      element,
      position: [index * 1.1, 0, 0],
    })),
    bonds: heavyBonds.map(([first, second, order], index) => ({
      id: `b${index}`,
      atomIds: [`a${first}`, `a${second}`],
      order,
    })),
  };
  return { id, nameZh, nameEn, categoryZh, summaryZh, molecule: autoFillHydrogens(molecule) };
}

function buildNeighborMap(molecule: BuilderMolecule) {
  const map = new Map<string, Array<{ atom: BuilderAtom; order: BuilderBondOrder }>>();
  molecule.atoms.forEach((candidate) => map.set(candidate.id, []));
  molecule.bonds.forEach((candidate) => {
    const first = molecule.atoms.find((atomCandidate) => atomCandidate.id === candidate.atomIds[0]);
    const second = molecule.atoms.find((atomCandidate) => atomCandidate.id === candidate.atomIds[1]);
    if (!first || !second) return;
    map.get(first.id)?.push({ atom: second, order: candidate.order });
    map.get(second.id)?.push({ atom: first, order: candidate.order });
  });
  return map;
}

function templateAtom(
  templateId: string,
  element: BuilderElement,
  position: BuilderVec3,
): BuilderFragmentTemplate["atoms"][number] {
  return { templateId, element, label: element, position };
}

function fragmentBond(
  first: string,
  second: string,
  order: BuilderBondOrder = 1,
): BuilderFragmentTemplate["bonds"][number] {
  return { atomIds: [first, second], order };
}

function getStylizedBondLength(first: BuilderElement, second: BuilderElement): number {
  if (first === "H" || second === "H") return 0.92;
  if (["Cl", "Br", "I"].includes(first) || ["Cl", "Br", "I"].includes(second)) return 1.2;
  return 1.08;
}

function add(first: BuilderVec3, second: BuilderVec3): BuilderVec3 {
  return [first[0] + second[0], first[1] + second[1], first[2] + second[2]];
}

function sub(first: BuilderVec3, second: BuilderVec3): BuilderVec3 {
  return [first[0] - second[0], first[1] - second[1], first[2] - second[2]];
}

function scale(value: BuilderVec3, factor: number): BuilderVec3 {
  return [value[0] * factor, value[1] * factor, value[2] * factor];
}

function normalize(value: BuilderVec3): BuilderVec3 {
  const length = Math.hypot(...value) || 1;
  return scale(value, 1 / length);
}

function dot(first: BuilderVec3, second: BuilderVec3): number {
  return first[0] * second[0] + first[1] * second[1] + first[2] * second[2];
}
