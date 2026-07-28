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
// 两方向夹角 ≈104.7°（cos ≈ 0.61² − 0.79² < 0），对应水/醇/醚氧的 V 形教学键角。
const BENT_DIRECTIONS: BuilderVec3[] = [
  [0.61, 0.79, 0],
  [0.61, -0.79, 0],
];

// 所有模板约定：attachment 原子位于原点，母体位于 anchorDirection = [-1, 0, 0] 方向；
// 拼接时 addFragment 会把该方向旋转对齐到真实母体方向，因此模板内部键角即最终键角。
// 键长采用与 getStylizedBondLength 一致的样式化标尺（含 H 0.92，重原子间 1.08）。
export const builderFragmentTemplates: BuilderFragmentTemplate[] = [
  {
    id: "methyl",
    label: "–CH₃",
    nameZh: "甲基",
    attachmentAtomId: "c",
    anchorDirection: [-1, 0, 0],
    atoms: [
      templateAtom("c", "C", [0, 0, 0]),
      // 四面体方向：与母体键均成 ≈109.5°。
      templateAtom("h1", "H", [0.307, 0.867, 0]),
      templateAtom("h2", "H", [0.307, -0.434, 0.751]),
      templateAtom("h3", "H", [0.307, -0.434, -0.751]),
    ],
    bonds: [fragmentBond("c", "h1"), fragmentBond("c", "h2"), fragmentBond("c", "h3")],
  },
  {
    id: "hydroxyl",
    label: "–OH",
    nameZh: "羟基",
    attachmentAtomId: "o",
    anchorDirection: [-1, 0, 0],
    atoms: [templateAtom("o", "O", [0, 0, 0]), templateAtom("h", "H", [0.307, 0.867, 0])],
    bonds: [fragmentBond("o", "h")],
  },
  {
    id: "amino",
    label: "–NH₂",
    nameZh: "氨基",
    attachmentAtomId: "n",
    anchorDirection: [-1, 0, 0],
    atoms: [
      templateAtom("n", "N", [0, 0, 0]),
      // 三角锥：两个 N–H 与母体键彼此均约 107°。
      templateAtom("h1", "H", [0.269, 0.739, -0.477]),
      templateAtom("h2", "H", [0.269, -0.739, -0.477]),
    ],
    bonds: [fragmentBond("n", "h1"), fragmentBond("n", "h2")],
  },
  {
    id: "aldehyde",
    label: "–CHO",
    nameZh: "醛基",
    attachmentAtomId: "c",
    anchorDirection: [-1, 0, 0],
    atoms: [
      templateAtom("c", "C", [0, 0, 0]),
      // sp² 平面：O=C 与 C–H 相对母体键各成 ≈120°。
      templateAtom("o", "O", [0.54, 0.935, 0]),
      templateAtom("h", "H", [0.46, -0.797, 0]),
    ],
    bonds: [fragmentBond("c", "o", 2), fragmentBond("c", "h")],
  },
  {
    id: "carbonyl",
    label: "–C(=O)–",
    nameZh: "羰基片段",
    attachmentAtomId: "c",
    anchorDirection: [-1, 0, 0],
    atoms: [templateAtom("c", "C", [0, 0, 0]), templateAtom("o", "O", [0.54, 0.935, 0])],
    bonds: [fragmentBond("c", "o", 2)],
  },
  {
    id: "carboxyl",
    label: "–COOH",
    nameZh: "羧基",
    attachmentAtomId: "c",
    anchorDirection: [-1, 0, 0],
    atoms: [
      templateAtom("c", "C", [0, 0, 0]),
      templateAtom("o1", "O", [0.54, 0.935, 0]),
      templateAtom("o2", "O", [0.54, -0.935, 0]),
      // O–H 相对 O–C 键成 ≈109.5°，避免羟基氢倒向羰基一侧。
      templateAtom("h", "H", [1.444, -0.768, 0]),
    ],
    bonds: [fragmentBond("c", "o1", 2), fragmentBond("c", "o2"), fragmentBond("o2", "h")],
  },
  {
    // 氰基 –C≡N：碳氮三键。价态在中性模型内完整（C 四键、N 三键）。
    // 注意：本地命名引擎目前把 C≡N 的 N 归入"复杂含氮"而返回 unsupported，
    // 这是既有引擎边界，InfoPanel 会如实显示"无法命名 + 原因"，不是回归。
    id: "cyano",
    label: "–C≡N",
    nameZh: "氰基",
    attachmentAtomId: "c",
    anchorDirection: [-1, 0, 0],
    atoms: [templateAtom("c", "C", [0, 0, 0]), templateAtom("n", "N", [1.08, 0, 0])],
    bonds: [fragmentBond("c", "n", 3)],
  },
  {
    // 乙烯基 –CH=CH₂：末端碳碳双键，接上后可命名为丙-1-烯等。
    id: "vinyl",
    label: "–CH=CH₂",
    nameZh: "乙烯基",
    attachmentAtomId: "c1",
    anchorDirection: [-1, 0, 0],
    atoms: [templateAtom("c1", "C", [0, 0, 0]), templateAtom("c2", "C", [0.54, 0.935, 0])],
    bonds: [fragmentBond("c1", "c2", 2)],
  },
  {
    // 乙炔基 –C≡CH：末端碳碳三键，接上后可命名为丙-1-炔等。
    id: "ethynyl",
    label: "–C≡CH",
    nameZh: "乙炔基",
    attachmentAtomId: "c1",
    anchorDirection: [-1, 0, 0],
    atoms: [templateAtom("c1", "C", [0, 0, 0]), templateAtom("c2", "C", [1.08, 0, 0])],
    bonds: [fragmentBond("c1", "c2", 3)],
  },
  {
    // 甲氧基 –OCH₃：醚氧连一个甲基，接上后按醚命名（如甲氧基甲烷）。
    id: "methoxy",
    label: "–OCH₃",
    nameZh: "甲氧基",
    attachmentAtomId: "o",
    anchorDirection: [-1, 0, 0],
    atoms: [templateAtom("o", "O", [0, 0, 0]), templateAtom("c", "C", [0.27, 1.045, 0])],
    bonds: [fragmentBond("o", "c")],
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
  known(
    "toluene",
    "甲苯",
    "Toluene",
    "芳香烃",
    "苯的同系物，苯环上连有一个甲基。",
    ["C", "C", "C", "C", "C", "C", "C"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1]],
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
  // 有碳按 Hill 规则（C、H、其余字母序）；无碳按高中教学惯例写 NH3、HCl、H2O，
  // 而不是严格字母序的 H3N、ClH。
  const order: BuilderElement[] = counts.has("C")
    ? (["C", "H", ...remaining] as BuilderElement[])
    : counts.has("N")
      ? (["N", "H", ...remaining.filter((element) => element !== "N")] as BuilderElement[])
      : (["H", ...remaining] as BuilderElement[]);
  return order
    .filter((element) => counts.has(element))
    .map((element) => `${element}${(counts.get(element) ?? 0) > 1 ? counts.get(element) : ""}`)
    .join("");
}

const SUBSCRIPT_DIGITS: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
};

// 仅供显示层使用：把 getFormula 的 ASCII 输出（"C2H4"）转成教学材料通用的
// Unicode 下标写法（"C₂H₄"），与种子/模块目录的 formula 字段排版统一。
// getFormula 本身保持 ASCII，词典比较与既有逻辑测试不受影响；
// 对已是下标的字符串无 ASCII 数字可替换，重复调用结果不变。
export function formatFormulaSubscripts(formula: string): string {
  return formula.replace(/\d/g, (digit) => SUBSCRIPT_DIGITS[digit] ?? digit);
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

  // 凯库勒式六元碳环按"苯环"整体报告，并抑制环内键的"碳碳双键"：
  // "苯不含真正碳碳双键（不能因加成使溴水褪色）"是核心考点，拆散报告会强化错误概念。
  const aromaticBondKeys = findKekuleBenzeneBondKeys(molecule, neighbors);
  if (aromaticBondKeys.size > 0) groups.add("苯环（芳香环）");

  // 第一遍：按优先级识别含羰基的完整官能团（羧基 > 酰胺 > 酯 > 醛），
  // 并"认领"成员原子，避免第二遍把羧基拆报成"羰基 + 羟基"、把乙醛重复报"羰基 + 醛基"。
  const claimedCarbonylCarbonIds = new Set<string>();
  const claimedOxygenIds = new Set<string>();
  const amideNitrogenIds = new Set<string>();
  molecule.atoms.filter((candidate) => candidate.element === "C").forEach((carbon) => {
    const adjacent = neighbors.get(carbon.id) ?? [];
    const carbonylOxygen = adjacent.find((entry) => entry.atom.element === "O" && entry.order === 2);
    if (!carbonylOxygen) return;
    const hydroxylOxygen = adjacent.find((entry) =>
      entry.atom.element === "O"
      && entry.order === 1
      && (neighbors.get(entry.atom.id) ?? []).some((second) => second.atom.element === "H"),
    );
    if (hydroxylOxygen) {
      groups.add("羧基");
      claimedCarbonylCarbonIds.add(carbon.id);
      claimedOxygenIds.add(hydroxylOxygen.atom.id);
      return;
    }
    const amideNitrogen = adjacent.find((entry) => entry.atom.element === "N" && entry.order === 1);
    if (amideNitrogen) {
      groups.add("酰胺基");
      claimedCarbonylCarbonIds.add(carbon.id);
      amideNitrogenIds.add(amideNitrogen.atom.id);
      return;
    }
    const esterOxygen = adjacent.find((entry) =>
      entry.atom.element === "O"
      && entry.order === 1
      && (neighbors.get(entry.atom.id) ?? []).some((second) =>
        second.atom.element === "C" && second.atom.id !== carbon.id,
      ),
    );
    if (esterOxygen) {
      groups.add("酯基");
      claimedCarbonylCarbonIds.add(carbon.id);
      claimedOxygenIds.add(esterOxygen.atom.id);
      return;
    }
    if (adjacent.some((entry) => entry.atom.element === "H")) {
      groups.add("醛基");
      claimedCarbonylCarbonIds.add(carbon.id);
    }
  });

  // 第二遍：逐键识别基础片段，跳过已被高层官能团认领的键和原子。
  molecule.bonds.forEach((candidate) => {
    const first = molecule.atoms.find((atomCandidate) => atomCandidate.id === candidate.atomIds[0]);
    const second = molecule.atoms.find((atomCandidate) => atomCandidate.id === candidate.atomIds[1]);
    if (!first || !second) return;
    const elements = [first.element, second.element].sort().join("-");
    if (elements === "C-C" && candidate.order === 2 && !aromaticBondKeys.has(bondPairKey(candidate.atomIds))) {
      groups.add("碳碳双键");
    }
    if (elements === "C-C" && candidate.order === 3) groups.add("碳碳三键");
    if (elements === "C-N" && candidate.order === 3) groups.add("氰基");
    if (elements === "C-O" && candidate.order === 2) {
      const carbon = first.element === "C" ? first : second;
      if (!claimedCarbonylCarbonIds.has(carbon.id)) groups.add("羰基");
    }
    if (elements === "C-N" && candidate.order === 1) {
      const nitrogen = first.element === "N" ? first : second;
      groups.add(amideNitrogenIds.has(nitrogen.id) ? "酰胺基" : "氨基/胺键片段");
    }
    // 卤代结构要求卤素直接连在碳上：HCl、HF 等无机氢化物不属于卤代烃片段。
    const halogenAtom = [first, second].find((atom) => ["F", "Cl", "Br", "I"].includes(atom.element));
    const otherAtom = halogenAtom === first ? second : first;
    if (halogenAtom && otherAtom.element === "C") groups.add("卤代结构");
  });

  // 羟基 / 醚键：跳过已被羧基、酯基认领的氧原子。
  molecule.atoms.filter((candidate) => candidate.element === "O").forEach((oxygen) => {
    if (claimedOxygenIds.has(oxygen.id)) return;
    const adjacent = neighbors.get(oxygen.id) ?? [];
    const hasHydrogen = adjacent.some((entry) => entry.atom.element === "H");
    const singleBondCarbons = adjacent.filter((entry) => entry.atom.element === "C" && entry.order === 1);
    if (hasHydrogen && singleBondCarbons.length > 0) groups.add("羟基");
    if (!hasHydrogen && singleBondCarbons.length === 2) groups.add("醚键");
  });
  return [...groups];
}

function bondPairKey(atomIds: [string, string]): string {
  return [...atomIds].sort().join("|");
}

// 识别"六元全碳环 + 环内交替单双键"（凯库勒式苯环），返回六条环键的无序键 key。
// 保守策略：迭代剥离度小于 2 的碳得到环核，只认恰为孤立六元交替环的连通分量；
// 稠环、桥环等复杂环核不识别为苯环，环内 C=C 仍按普通碳碳双键报告。
function findKekuleBenzeneBondKeys(
  molecule: BuilderMolecule,
  neighbors: ReturnType<typeof buildNeighborMap>,
): Set<string> {
  const keys = new Set<string>();
  const carbonAdjacency = new Map<string, Array<{ id: string; order: BuilderBondOrder }>>();
  const degrees = new Map<string, number>();
  for (const atom of molecule.atoms) {
    if (atom.element !== "C") continue;
    const carbonNeighbors = (neighbors.get(atom.id) ?? [])
      .filter((entry) => entry.atom.element === "C")
      .map((entry) => ({ id: entry.atom.id, order: entry.order }));
    carbonAdjacency.set(atom.id, carbonNeighbors);
    degrees.set(atom.id, carbonNeighbors.length);
  }
  const removed = new Set<string>();
  const pruneQueue = [...degrees.keys()].filter((id) => (degrees.get(id) ?? 0) < 2);
  while (pruneQueue.length > 0) {
    const current = pruneQueue.shift()!;
    if (removed.has(current)) continue;
    removed.add(current);
    for (const neighbor of carbonAdjacency.get(current) ?? []) {
      if (removed.has(neighbor.id)) continue;
      const nextDegree = (degrees.get(neighbor.id) ?? 0) - 1;
      degrees.set(neighbor.id, nextDegree);
      if (nextDegree < 2) pruneQueue.push(neighbor.id);
    }
  }

  const visited = new Set<string>();
  for (const startId of degrees.keys()) {
    if (removed.has(startId) || visited.has(startId)) continue;
    const component: string[] = [];
    const stack = [startId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      component.push(current);
      for (const neighbor of carbonAdjacency.get(current) ?? []) {
        if (!removed.has(neighbor.id) && !visited.has(neighbor.id)) stack.push(neighbor.id);
      }
    }
    if (component.length !== 6) continue;
    const componentSet = new Set(component);
    const isKekuleRing = component.every((id) => {
      const ringBonds = (carbonAdjacency.get(id) ?? []).filter((neighbor) => componentSet.has(neighbor.id));
      const orders = ringBonds.map((neighbor) => neighbor.order).sort();
      return ringBonds.length === 2 && orders[0] === 1 && orders[1] === 2;
    });
    if (!isKekuleRing) continue;
    for (const id of component) {
      for (const neighbor of carbonAdjacency.get(id) ?? []) {
        if (componentSet.has(neighbor.id)) keys.add([id, neighbor.id].sort().join("|"));
      }
    }
  }
  return keys;
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
  const centerBonds = molecule.bonds.filter((candidate) => candidate.atomIds.includes(centerAtomId));
  const hasTriple = centerBonds.some((candidate) => candidate.order === 3) || order === 3;
  // 双键要按"个数"判断：两个双键的碳（O=C=O、丙二烯）是 sp 直线形，不能落进 sp² 平面方向集。
  const doubleBondCount = centerBonds.filter((candidate) => candidate.order === 2).length
    + (order === 2 ? 1 : 0);
  const directions = hasTriple || doubleBondCount >= 2
    ? LINEAR_DIRECTIONS
    : doubleBondCount === 1
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
  const distance = resolveBondLength(molecule, center, newElement, order);
  return add(center.position, scale(direction, distance));
}

// 决定新键长时优先沿用分子里同类键的现有长度，而不是无条件用样式化常数：
// 种子分子各自有一套键长标尺（苯的 C–H 是 0.66、共面综合模型约 0.45），若把拔下的 H
// 按常数 0.92 吸附回去，它会比同环上其余五个 H 明显长一截。
// 取舍：先找同一中心原子上的同类键（最贴近局部标尺），再退回全分子同类键的中位数，
// 都没有才用样式化常数——从零拼装时分子内所有键本就是常数长度，因此行为不变。
function resolveBondLength(
  molecule: BuilderMolecule,
  center: BuilderAtom,
  newElement: BuilderElement,
  order: BuilderBondOrder,
): number {
  const stylized = getStylizedBondLength(center.element, newElement);
  const sameCenter = sampleBondLengths(molecule, center.element, newElement, order, center.id);
  const reference = sameCenter.length > 0
    ? median(sameCenter)
    : median(sampleBondLengths(molecule, center.element, newElement, order));
  if (reference === undefined) return stylized;
  // 防御退化值：极端情况下（例如手工构造的重叠原子）不接受近零或超长的参考键长。
  return Math.min(Math.max(reference, 0.35), 2);
}

// 收集分子中「元素对与键级都相同」的键长；给出 centerId 时只看该原子参与的键。
function sampleBondLengths(
  molecule: BuilderMolecule,
  centerElement: BuilderElement,
  newElement: BuilderElement,
  order: BuilderBondOrder,
  centerId?: string,
): number[] {
  const wanted = [centerElement, newElement].sort().join("-");
  const lengths: number[] = [];
  for (const candidate of molecule.bonds) {
    if (candidate.order !== order) continue;
    if (centerId && !candidate.atomIds.includes(centerId)) continue;
    const first = molecule.atoms.find((atom) => atom.id === candidate.atomIds[0]);
    const second = molecule.atoms.find((atom) => atom.id === candidate.atomIds[1]);
    if (!first || !second) continue;
    if ([first.element, second.element].sort().join("-") !== wanted) continue;
    lengths.push(Math.hypot(...sub(second.position, first.position)));
  }
  return lengths;
}

function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
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
  const ids = [
    ...molecule.atoms.map((candidate) => candidate.id),
    ...molecule.bonds.map((candidate) => candidate.id),
  ];
  // 片段原子以 `${prefix}-${index}-<templateId>` 派生 id 而不入库 `${prefix}-${index}` 本身，
  // 因此除精确占用外还要跳过派生占用，否则第二个片段会复用同一 suffix 造成原子 id 冲突。
  const isTaken = (candidate: string) =>
    ids.some((id) => id === candidate || id.startsWith(`${candidate}-`));
  let index = 1;
  while (isTaken(`${prefix}-${index}`)) index += 1;
  return `${prefix}-${index}`;
}

export function areBuilderMoleculesEqual(first: BuilderMolecule, second: BuilderMolecule): boolean {
  // 快速通道：id 逐一对应且元素/键/坐标一致时直接判等，跳过昂贵的图同构回溯。
  // "present 与 initial 尚未修改"这个最常见场景恰是同构搜索最贵的路径（必须找到完整映射）。
  if (quickStructuralEqual(first, second)) return true;
  if (!areMolecularGraphsEqual(first, second)) return false;
  const firstPositions = [...first.atoms]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((candidate) => [candidate.id, ...candidate.position.map((value) => Number(value.toFixed(4)))]);
  const secondPositions = [...second.atoms]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((candidate) => [candidate.id, ...candidate.position.map((value) => Number(value.toFixed(4)))]);
  return JSON.stringify(firstPositions) === JSON.stringify(secondPositions);
}

function quickStructuralEqual(first: BuilderMolecule, second: BuilderMolecule): boolean {
  if (first.atoms.length !== second.atoms.length || first.bonds.length !== second.bonds.length) return false;
  const serializeAtoms = (molecule: BuilderMolecule) => [...molecule.atoms]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((candidate) => `${candidate.id}|${candidate.element}|${candidate.position.map((value) => value.toFixed(4)).join(",")}`)
    .join(";");
  const serializeBonds = (molecule: BuilderMolecule) => molecule.bonds
    .map((candidate) => `${[...candidate.atomIds].sort().join("~")}|${candidate.order}`)
    .sort()
    .join(";");
  return serializeAtoms(first) === serializeAtoms(second) && serializeBonds(first) === serializeBonds(second);
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

// 求把 from 方向转到 to 方向的最小旋转，并应用于 value（罗德里格斯公式，避免引入 three 依赖）。
// 用于片段拼接：把模板的 anchorDirection 对齐到真实母体方向，使模板键角在任意接入方向下保持不变。
export function rotateVectorBetween(value: BuilderVec3, from: BuilderVec3, to: BuilderVec3): BuilderVec3 {
  const source = normalize(from);
  const target = normalize(to);
  const cosine = dot(source, target);
  if (cosine > 0.9999) return [...value] as BuilderVec3;
  if (cosine < -0.9999) {
    // 反向特例：绕任意与 source 垂直的轴旋转 180°（v' = 2(axis·v)axis − v）。
    const helper: BuilderVec3 = Math.abs(source[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const axis = normalize(cross(source, helper));
    const projection = dot(axis, value);
    return [
      2 * projection * axis[0] - value[0],
      2 * projection * axis[1] - value[1],
      2 * projection * axis[2] - value[2],
    ];
  }
  // 未归一化轴（|axis| = sinθ）下的等价展开：v' = v·cosθ + axis×v + axis(axis·v)/(1+cosθ)。
  const axis = cross(source, target);
  const scaleFactor = 1 / (1 + cosine);
  const axisCrossValue = cross(axis, value);
  const axisDotValue = dot(axis, value);
  return [
    value[0] * cosine + axisCrossValue[0] + axis[0] * axisDotValue * scaleFactor,
    value[1] * cosine + axisCrossValue[1] + axis[1] * axisDotValue * scaleFactor,
    value[2] * cosine + axisCrossValue[2] + axis[2] * axisDotValue * scaleFactor,
  ];
}

function cross(first: BuilderVec3, second: BuilderVec3): BuilderVec3 {
  return [
    first[1] * second[2] - first[2] * second[1],
    first[2] * second[0] - first[0] * second[2],
    first[0] * second[1] - first[1] * second[0],
  ];
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
