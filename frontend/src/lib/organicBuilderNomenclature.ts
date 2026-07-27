import { validateBuilderMolecule } from "@/lib/organicBuilderChemistry";
import type {
  BuilderAtom,
  BuilderBondOrder,
  BuilderElement,
  BuilderMolecule,
} from "@/types/organicBuilder";

export type OrganicSystematicNameResult =
  | {
      status: "generated";
      nameZh: string;
      nameEn: string;
      categoryZh: string;
      method: "substitutive" | "skeletal-replacement";
      noteZh: string;
      teachingAlias?: {
        descriptorZh: string;
        descriptorEn: string;
        nameZh?: string;
        nameEn?: string;
      };
    }
  | { status: "not-ready"; reasonZh: string }
  | { status: "unsupported"; reasonZh: string };

type GraphNeighbor = {
  atom: BuilderAtom;
  order: BuilderBondOrder;
};

type BuilderGraph = {
  atomsById: Map<string, BuilderAtom>;
  fullNeighbors: Map<string, GraphNeighbor[]>;
  heavyAtoms: BuilderAtom[];
  heavyNeighbors: Map<string, GraphNeighbor[]>;
};

type FunctionalKind = "acid" | "amide" | "aldehyde" | "ketone" | "alcohol" | "amine";

type FunctionalGroup = {
  kind: FunctionalKind;
  carbonId: string;
  heteroIds: string[];
  nitrogenId?: string;
};

type AmideNSubstituent = {
  carbonIds: Set<string>;
  nameZh: string;
  nameEn: string;
  isComplex: boolean;
};

type AmideNaming = {
  carbonIds: Set<string>;
  nitrogenId: string;
  substituents: AmideNSubstituent[];
};

type Substituent = {
  locant: number;
  key: string;
  nameZh: string;
  nameEn: string;
};

type TeachingAlias = NonNullable<
  Extract<OrganicSystematicNameResult, { status: "generated" }>["teachingAlias"]
>;

type BenzeneAttachment = {
  ringId: string;
  outsideId: string;
  order: BuilderBondOrder;
};

type BenzeneSubstituentKind =
  | "halogen"
  | "alkyl"
  | "alkoxy"
  | "hydroxy"
  | "amino"
  | "formyl"
  | "carboxy";

type BenzeneSubstituent = {
  ringId: string;
  kind: BenzeneSubstituentKind;
  key: string;
  prefixZh: string;
  prefixEn: string;
  monoNameZh: string;
  monoNameEn: string;
  categoryZh: string;
  parentPriority: number;
  parentNameZh?: string;
  parentNameEn?: string;
};

type NumberedBenzeneSubstituent = BenzeneSubstituent & { locant: number };

type BenzenePosition = {
  descriptorZh: string;
  descriptorEn: string;
  shortZh: "邻" | "间" | "对";
  shortEn: "o" | "m" | "p";
};

type RingPrefixSubstituent = {
  ringId: string;
  key: string;
  prefixZh: string;
  prefixEn: string;
  kind: "halogen" | "alkyl";
};

type NumberedRingPrefixSubstituent = RingPrefixSubstituent & { locant: number };

type NameCandidate = Extract<OrganicSystematicNameResult, { status: "generated" }> & {
  parentLength: number;
  multipleBondCount: number;
  principalLocants: number[];
  unsaturationLocants: number[];
  substituentLocants: number[];
  substituentCount: number;
};

const EN_ROOTS = ["", "meth", "eth", "prop", "but", "pent", "hex", "hept", "oct", "non", "dec"];
const ZH_ROOTS = ["", "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const EN_MULTIPLIERS = ["", "", "di", "tri", "tetra", "penta", "hexa", "hepta", "octa", "nona", "deca"];
const ZH_MULTIPLIERS = ["", "", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

const FUNCTIONAL_PRIORITY: Record<FunctionalKind, number> = {
  acid: 6,
  amide: 5,
  aldehyde: 4,
  ketone: 3,
  alcohol: 2,
  amine: 1,
};

const HALOGEN_PREFIX: Partial<Record<BuilderElement, { zh: string; en: string }>> = {
  F: { zh: "氟", en: "fluoro" },
  Cl: { zh: "氯", en: "chloro" },
  Br: { zh: "溴", en: "bromo" },
  I: { zh: "碘", en: "iodo" },
};

export function generateOrganicSystematicName(molecule: BuilderMolecule): OrganicSystematicNameResult {
  const validation = validateBuilderMolecule(molecule);
  if (!validation.isComplete) {
    if (validation.fragmentCount > 1) {
      return { status: "not-ready", reasonZh: `当前有 ${validation.fragmentCount} 个独立片段，请先连接为一个整体。` };
    }
    if (validation.totalAtomCount === 0) {
      return { status: "not-ready", reasonZh: "请先添加原子并完成分子结构。" };
    }
    return { status: "not-ready", reasonZh: "请先补全各原子的中性价态，再生成结构名称。" };
  }

  const graph = buildGraph(molecule);
  if (!graph.heavyAtoms.some((atom) => atom.element === "C")) {
    return { status: "unsupported", reasonZh: "当前本地规则只处理含碳的中性有机结构。" };
  }
  if (!isHeavyGraphConnected(graph)) {
    return { status: "not-ready", reasonZh: "请先把所有重原子连接为一个整体。" };
  }
  if (hasHeavyAtomCycle(graph)) {
    return nameSupportedCyclicStructure(graph);
  }

  const etherName = tryNameSimpleEther(graph);
  if (etherName?.status === "generated") return etherName;

  const replacementName = tryNameSkeletalReplacement(graph);
  if (replacementName) return replacementName;

  // 醚规则拒绝且骨架替代（oxa）也覆盖不了时，保留醚规则给出的具体原因。
  if (etherName) return etherName;

  return nameCarbonSkeleton(graph);
}

function buildGraph(molecule: BuilderMolecule): BuilderGraph {
  const atomsById = new Map(molecule.atoms.map((atom) => [atom.id, atom]));
  const fullNeighbors = new Map(molecule.atoms.map((atom) => [atom.id, [] as GraphNeighbor[]]));
  for (const bond of molecule.bonds) {
    const first = atomsById.get(bond.atomIds[0]);
    const second = atomsById.get(bond.atomIds[1]);
    if (!first || !second) continue;
    fullNeighbors.get(first.id)?.push({ atom: second, order: bond.order });
    fullNeighbors.get(second.id)?.push({ atom: first, order: bond.order });
  }
  const heavyAtoms = molecule.atoms.filter((atom) => atom.element !== "H");
  const heavyNeighbors = new Map(
    heavyAtoms.map((atom) => [
      atom.id,
      (fullNeighbors.get(atom.id) ?? []).filter((neighbor) => neighbor.atom.element !== "H"),
    ]),
  );
  return { atomsById, fullNeighbors, heavyAtoms, heavyNeighbors };
}

function isHeavyGraphConnected(graph: BuilderGraph): boolean {
  const first = graph.heavyAtoms[0];
  if (!first) return false;
  const visited = new Set<string>();
  const queue = [first.id];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    queue.push(...(graph.heavyNeighbors.get(current) ?? []).map((neighbor) => neighbor.atom.id));
  }
  return visited.size === graph.heavyAtoms.length;
}

function hasHeavyAtomCycle(graph: BuilderGraph): boolean {
  const edgeCount = [...graph.heavyNeighbors.values()].reduce((sum, neighbors) => sum + neighbors.length, 0) / 2;
  return edgeCount !== graph.heavyAtoms.length - 1;
}

function nameSupportedCyclicStructure(graph: BuilderGraph): OrganicSystematicNameResult {
  const ring = findCycleCore(graph);
  const ringEdges = getRingEdges(graph, ring);
  const isSimpleCarbonRing = ring.size >= 3
    && [...ring].every((id) => graph.atomsById.get(id)?.element === "C")
    && [...ring].every((id) => ringNeighbors(graph, id, ring).length === 2)
    && ringEdges.length === ring.size;
  if (!isSimpleCarbonRing) {
    return { status: "unsupported", reasonZh: "桥环、稠环、螺环或含杂原子的环系暂不在本地基础规则内。" };
  }
  if (ring.size > 10) {
    return { status: "unsupported", reasonZh: "当前环状母体只支持 C3–C10 的单环结构。" };
  }

  const attachments = [...ring].flatMap((ringId) =>
    (graph.heavyNeighbors.get(ringId) ?? [])
      .filter((neighbor) => !ring.has(neighbor.atom.id))
      .map((neighbor) => ({ ringId, outsideId: neighbor.atom.id, order: neighbor.order })),
  );
  const outsideIds = new Set(graph.heavyAtoms.map((atom) => atom.id).filter((id) => !ring.has(id)));

  const isBenzeneRing = ring.size === 6
    && ringEdges.filter((edge) => edge.order === 2).length === 3
    && [...ring].every((id) => {
      const orders = ringNeighbors(graph, id, ring).map((neighbor) => neighbor.order).sort();
      return orders.length === 2 && orders[0] === 1 && orders[1] === 2;
    });
  if (isBenzeneRing) {
    if (attachments.length > ring.size) {
      return { status: "unsupported", reasonZh: "苯环每个碳原子最多连接一个当前规则支持的取代基。" };
    }
    return nameBenzeneStructure(graph, ring, outsideIds, attachments);
  }

  if (ringEdges.every((edge) => edge.order === 1)) {
    return nameCycloalkaneStructure(graph, ring, outsideIds, attachments);
  }
  return { status: "unsupported", reasonZh: "当前环状规则只支持饱和单环烷烃和交替单双键表示的苯环。" };
}

function nameCycloalkaneStructure(
  graph: BuilderGraph,
  ring: Set<string>,
  outsideIds: Set<string>,
  attachments: BenzeneAttachment[],
): OrganicSystematicNameResult {
  const ringSize = ring.size;
  const parentZh = `环${ZH_ROOTS[ringSize]}烷`;
  const parentEn = `cyclo${EN_ROOTS[ringSize]}ane`;
  if (outsideIds.size === 0) return generated(parentZh, parentEn, "环烷烃", "substitutive");
  if (attachments.length > 10) {
    return { status: "unsupported", reasonZh: "当前多取代环烷烃最多支持十个简单取代基。" };
  }
  if (attachments.length === 0 || attachments.some((attachment) => attachment.order !== 1)) {
    return { status: "unsupported", reasonZh: "环烷烃取代基必须通过单键与环相连。" };
  }

  const components = attachments.map((attachment) =>
    collectOutsideHeavyComponent(graph, attachment.outsideId, ring),
  );
  const coveredIds = new Set(components.flatMap((component) => [...component]));
  const componentsOverlap = components.some((component, index) =>
    components.some((other, otherIndex) =>
      otherIndex > index && [...component].some((id) => other.has(id)),
    ),
  );
  if (componentsOverlap || coveredIds.size !== outsideIds.size) {
    return { status: "unsupported", reasonZh: "环外相互连接、跨接或形成支链的复杂取代基暂不支持。" };
  }
  const parsed = attachments.map((attachment, index) =>
    parseCycloalkaneSubstituent(graph, attachment, components[index], ringSize),
  );
  if (parsed.some((substituent) => !substituent)) {
    return {
      status: "unsupported",
      reasonZh: "取代环烷烃当前只支持卤素或不长于母环的直链 C1–C4 烷基。",
    };
  }
  const substituents = parsed as RingPrefixSubstituent[];
  if (substituents.length === 1) {
    const [only] = substituents;
    return generated(
      `${only.prefixZh}${parentZh}`,
      `${only.prefixEn}${parentEn}`,
      only.kind === "halogen" ? "卤代环烷烃" : "环烷烃",
      "substitutive",
    );
  }

  const numbered = numberRingPrefixSubstituents(graph, ring, substituents);
  if (!numbered) {
    return { status: "unsupported", reasonZh: "无法为当前多取代环烷烃确定稳定的最低位次编号。" };
  }
  return generated(
    `${formatNumberedRingPrefixes(numbered, "zh")}${parentZh}`,
    `${formatNumberedRingPrefixes(numbered, "en")}${parentEn}`,
    categoryForCycloalkaneSubstituents(numbered),
    "substitutive",
  );
}

function parseCycloalkaneSubstituent(
  graph: BuilderGraph,
  attachment: BenzeneAttachment,
  component: Set<string>,
  ringSize: number,
): RingPrefixSubstituent | undefined {
  const outsideAtom = graph.atomsById.get(attachment.outsideId);
  if (!outsideAtom) return undefined;
  const halogen = HALOGEN_PREFIX[outsideAtom.element];
  if (component.size === 1 && halogen) {
    return {
      ringId: attachment.ringId,
      key: outsideAtom.element,
      prefixZh: halogen.zh,
      prefixEn: halogen.en,
      kind: "halogen",
    };
  }
  if (
    outsideAtom.element === "C"
    && component.size <= 4
    && component.size <= ringSize
    && isStraightSaturatedCarbonSubstituent(graph, component, attachment.outsideId, attachment.ringId)
  ) {
    const prefixZh = `${ZH_ROOTS[component.size]}基`;
    const prefixEn = `${EN_ROOTS[component.size]}yl`;
    return {
      ringId: attachment.ringId,
      key: prefixEn,
      prefixZh,
      prefixEn,
      kind: "alkyl",
    };
  }
  return undefined;
}

function numberRingPrefixSubstituents(
  graph: BuilderGraph,
  ring: Set<string>,
  substituents: RingPrefixSubstituent[],
): NumberedRingPrefixSubstituent[] | undefined {
  const candidates = enumerateRingOrientations(graph, ring).map((orientation) => {
    const locants = new Map(orientation.map((ringId, index) => [ringId, index + 1]));
    const numbered = substituents.map((substituent) => ({
      ...substituent,
      locant: locants.get(substituent.ringId) ?? 99,
    }));
    return { numbered, score: ringPrefixNumberingScore(numbered) };
  });
  return candidates.sort((first, second) => {
    const scoreComparison = compareNumberArrays(first.score, second.score);
    if (scoreComparison !== 0) return scoreComparison;
    return formatNumberedRingPrefixes(first.numbered, "en")
      .localeCompare(formatNumberedRingPrefixes(second.numbered, "en"));
  })[0]?.numbered;
}

function ringPrefixNumberingScore(substituents: NumberedRingPrefixSubstituent[]): number[] {
  const allLocants = substituents.map((substituent) => substituent.locant).sort((first, second) => first - second);
  const alphabeticalLocants = [...groupNumberedRingPrefixSubstituents(substituents).values()]
    .sort((first, second) => first[0].prefixEn.localeCompare(second[0].prefixEn))
    .flatMap((group) => [
      ...group.map((substituent) => substituent.locant).sort((first, second) => first - second),
      99,
    ]);
  return [...allLocants, 99, ...alphabeticalLocants];
}

function formatNumberedRingPrefixes(
  substituents: NumberedRingPrefixSubstituent[],
  language: "zh" | "en",
): string {
  return [...groupNumberedRingPrefixSubstituents(substituents).values()]
    .sort((first, second) => first[0].prefixEn.localeCompare(second[0].prefixEn))
    .map((group) => {
      const locants = group.map((substituent) => substituent.locant).sort((first, second) => first - second);
      const multiplier = language === "zh" ? ZH_MULTIPLIERS[group.length] : EN_MULTIPLIERS[group.length];
      const name = language === "zh" ? group[0].prefixZh : group[0].prefixEn;
      return `${locants.join(",")}-${multiplier}${name}`;
    })
    .join("-");
}

function groupNumberedRingPrefixSubstituents(
  substituents: NumberedRingPrefixSubstituent[],
): Map<string, NumberedRingPrefixSubstituent[]> {
  const grouped = new Map<string, NumberedRingPrefixSubstituent[]>();
  for (const substituent of substituents) {
    const group = grouped.get(substituent.key) ?? [];
    group.push(substituent);
    grouped.set(substituent.key, group);
  }
  return grouped;
}

function categoryForCycloalkaneSubstituents(substituents: RingPrefixSubstituent[]): string {
  if (substituents.every((substituent) => substituent.kind === "halogen")) return "卤代环烷烃";
  if (substituents.every((substituent) => substituent.kind === "alkyl")) return "环烷烃";
  return "取代环烷烃";
}

function nameBenzeneStructure(
  graph: BuilderGraph,
  ring: Set<string>,
  outsideIds: Set<string>,
  attachments: BenzeneAttachment[],
): OrganicSystematicNameResult {
  if (outsideIds.size === 0) return generated("苯", "benzene", "芳香烃", "substitutive");
  if (attachments.length === 0 || attachments.some((attachment) => attachment.order !== 1)) {
    return { status: "unsupported", reasonZh: "苯环取代基必须通过单键与环相连。" };
  }

  const components = attachments.map((attachment) =>
    collectOutsideHeavyComponent(graph, attachment.outsideId, ring),
  );
  const coveredIds = new Set(components.flatMap((component) => [...component]));
  const componentsOverlap = components.some((component, index) =>
    components.some((other, otherIndex) =>
      otherIndex > index && [...component].some((id) => other.has(id)),
    ),
  );
  if (componentsOverlap || coveredIds.size !== outsideIds.size) {
    return { status: "unsupported", reasonZh: "苯环外相互连接或跨接的复杂取代基暂不支持。" };
  }

  const substituents = attachments.map((attachment, index) =>
    parseBenzeneSubstituent(graph, attachment, components[index]),
  );
  if (substituents.some((substituent) => !substituent)) {
    return {
      status: "unsupported",
      reasonZh: "苯环取代基当前支持卤素、直链 C1–C4 烷基、羟基、氨基、直链 C1–C4 烷氧基、醛基和羧基。",
    };
  }
  const parsed = substituents as BenzeneSubstituent[];
  if (parsed.length === 1) {
    const substituent = parsed[0];
    return generated(
      substituent.monoNameZh,
      substituent.monoNameEn,
      substituent.categoryZh,
      "substitutive",
    );
  }
  if (parsed.length === 2) return nameDisubstitutedBenzene(graph, ring, parsed[0], parsed[1]);
  return namePolysubstitutedBenzene(graph, ring, parsed);
}

function parseBenzeneSubstituent(
  graph: BuilderGraph,
  attachment: BenzeneAttachment,
  component: Set<string>,
): BenzeneSubstituent | undefined {
  const outsideAtom = graph.atomsById.get(attachment.outsideId);
  if (!outsideAtom) return undefined;

  const halogen = HALOGEN_PREFIX[outsideAtom.element];
  if (component.size === 1 && halogen) {
    return {
      ringId: attachment.ringId,
      kind: "halogen",
      key: outsideAtom.element,
      prefixZh: halogen.zh,
      prefixEn: halogen.en,
      monoNameZh: `${halogen.zh}苯`,
      monoNameEn: `${halogen.en}benzene`,
      categoryZh: "卤代芳烃",
      parentPriority: 0,
    };
  }

  if (
    outsideAtom.element === "C"
    && component.size <= 4
    && isStraightSaturatedCarbonSubstituent(graph, component, attachment.outsideId, attachment.ringId)
  ) {
    const prefixZh = `${ZH_ROOTS[component.size]}基`;
    const prefixEn = `${EN_ROOTS[component.size]}yl`;
    return {
      ringId: attachment.ringId,
      kind: "alkyl",
      key: prefixEn,
      prefixZh,
      prefixEn,
      monoNameZh: `${prefixZh}苯`,
      monoNameEn: `${prefixEn}benzene`,
      categoryZh: "芳香烃",
      parentPriority: 0,
    };
  }

  if (outsideAtom.element === "O") {
    const oxygenNeighbors = graph.heavyNeighbors.get(outsideAtom.id) ?? [];
    if (component.size === 1 && hydrogenCount(graph, outsideAtom.id) === 1 && oxygenNeighbors.length === 1) {
      return {
        ringId: attachment.ringId,
        kind: "hydroxy",
        key: "hydroxy",
        prefixZh: "羟基",
        prefixEn: "hydroxy",
        monoNameZh: "苯酚",
        monoNameEn: "phenol",
        categoryZh: "酚",
        parentPriority: 2,
        parentNameZh: "苯酚",
        parentNameEn: "phenol",
      };
    }
    const alkoxyCarbons = new Set([...component].filter((id) => id !== outsideAtom.id));
    const carbonNeighbor = oxygenNeighbors.find((neighbor) => alkoxyCarbons.has(neighbor.atom.id));
    if (
      alkoxyCarbons.size >= 1
      && alkoxyCarbons.size <= 4
      && [...alkoxyCarbons].every((id) => graph.atomsById.get(id)?.element === "C")
      && hydrogenCount(graph, outsideAtom.id) === 0
      && oxygenNeighbors.length === 2
      && oxygenNeighbors.every((neighbor) => neighbor.order === 1)
      && oxygenNeighbors.some((neighbor) => neighbor.atom.id === attachment.ringId)
      && carbonNeighbor
      && isStraightSaturatedCarbonSubstituent(graph, alkoxyCarbons, carbonNeighbor.atom.id, outsideAtom.id)
    ) {
      const prefixZh = `${ZH_ROOTS[alkoxyCarbons.size]}氧基`;
      const prefixEn = `${EN_ROOTS[alkoxyCarbons.size]}oxy`;
      return {
        ringId: attachment.ringId,
        kind: "alkoxy",
        key: prefixEn,
        prefixZh,
        prefixEn,
        monoNameZh: `${prefixZh}苯`,
        monoNameEn: `${prefixEn}benzene`,
        categoryZh: "芳香醚",
        parentPriority: 0,
      };
    }
  }

  if (
    outsideAtom.element === "N"
    && component.size === 1
    && hydrogenCount(graph, outsideAtom.id) === 2
    && (graph.heavyNeighbors.get(outsideAtom.id) ?? []).length === 1
  ) {
    return {
      ringId: attachment.ringId,
      kind: "amino",
      key: "amino",
      prefixZh: "氨基",
      prefixEn: "amino",
      monoNameZh: "苯胺",
      monoNameEn: "benzenamine",
      categoryZh: "芳香胺",
      parentPriority: 1,
      parentNameZh: "苯胺",
      parentNameEn: "benzenamine",
    };
  }

  if (outsideAtom.element === "C") {
    const neighbors = graph.heavyNeighbors.get(outsideAtom.id) ?? [];
    const ringBond = neighbors.find((neighbor) => neighbor.atom.id === attachment.ringId && neighbor.order === 1);
    const doubleOxygen = neighbors.find((neighbor) =>
      component.has(neighbor.atom.id) && neighbor.atom.element === "O" && neighbor.order === 2,
    );
    if (ringBond && doubleOxygen && component.size === 2 && hydrogenCount(graph, outsideAtom.id) === 1) {
      return {
        ringId: attachment.ringId,
        kind: "formyl",
        key: "formyl",
        prefixZh: "甲酰基",
        prefixEn: "formyl",
        monoNameZh: "苯甲醛",
        monoNameEn: "benzaldehyde",
        categoryZh: "芳香醛",
        parentPriority: 3,
        parentNameZh: "苯甲醛",
        parentNameEn: "benzaldehyde",
      };
    }
    const hydroxylOxygen = neighbors.find((neighbor) =>
      component.has(neighbor.atom.id)
      && neighbor.atom.element === "O"
      && neighbor.order === 1
      && hydrogenCount(graph, neighbor.atom.id) === 1,
    );
    if (ringBond && doubleOxygen && component.size === 3 && hydroxylOxygen) {
      return {
        ringId: attachment.ringId,
        kind: "carboxy",
        key: "carboxy",
        prefixZh: "羧基",
        prefixEn: "carboxy",
        monoNameZh: "苯甲酸",
        monoNameEn: "benzoic acid",
        categoryZh: "芳香羧酸",
        parentPriority: 4,
        parentNameZh: "苯甲酸",
        parentNameEn: "benzoic acid",
      };
    }
  }
  return undefined;
}

function nameDisubstitutedBenzene(
  graph: BuilderGraph,
  ring: Set<string>,
  first: BenzeneSubstituent,
  second: BenzeneSubstituent,
): OrganicSystematicNameResult {
  const path = findPath(graph, first.ringId, second.ringId, ring);
  const relativeLocant = path ? path.length : 0;
  const position = benzenePosition(relativeLocant);
  if (!position) {
    return { status: "unsupported", reasonZh: "无法确定两个苯环取代点之间的相对位置。" };
  }

  const aliasBase: TeachingAlias = {
    descriptorZh: position.descriptorZh,
    descriptorEn: position.descriptorEn,
  };
  if (first.parentPriority > 0 || second.parentPriority > 0) {
    if (first.parentPriority === second.parentPriority) {
      if (first.kind !== second.kind) {
        return { status: "unsupported", reasonZh: "两个同级主官能团的苯环组合暂不支持。" };
      }
      return nameRepeatedPrincipalBenzene(first, relativeLocant, position, aliasBase);
    }
    const principal = first.parentPriority > second.parentPriority ? first : second;
    const prefix = principal === first ? second : first;
    if (!principal.parentNameZh || !principal.parentNameEn) {
      return { status: "unsupported", reasonZh: "无法为当前苯环主官能团选择母体名称。" };
    }
    return generated(
      `${relativeLocant}-${prefix.prefixZh}${principal.parentNameZh}`,
      `${relativeLocant}-${prefix.prefixEn}${principal.parentNameEn}`,
      principal.categoryZh,
      "substitutive",
      {
        ...aliasBase,
        nameZh: `${position.shortZh}${prefix.prefixZh}${principal.parentNameZh}`,
        nameEn: `${position.shortEn}-${prefix.prefixEn}${principal.parentNameEn}`,
      },
    );
  }

  const categoryZh = categoryForBenzeneSubstituents([first, second]);
  if (first.key === second.key) {
    const aliasNameZh = first.key === "methyl"
      ? `${position.shortZh}二甲苯`
      : `${position.shortZh}${ZH_MULTIPLIERS[2]}${first.prefixZh}苯`;
    const aliasNameEn = first.key === "methyl"
      ? `${position.shortEn}-xylene`
      : `${position.shortEn}-${EN_MULTIPLIERS[2]}${first.prefixEn}benzene`;
    return generated(
      `1,${relativeLocant}-${ZH_MULTIPLIERS[2]}${first.prefixZh}苯`,
      `1,${relativeLocant}-${EN_MULTIPLIERS[2]}${first.prefixEn}benzene`,
      categoryZh,
      "substitutive",
      {
        ...aliasBase,
        nameZh: aliasNameZh,
        nameEn: aliasNameEn,
      },
    );
  }

  const [alphabeticalFirst, alphabeticalSecond] = [first, second]
    .sort((left, right) => left.prefixEn.localeCompare(right.prefixEn));
  return generated(
    `1-${alphabeticalFirst.prefixZh}-${relativeLocant}-${alphabeticalSecond.prefixZh}苯`,
    `1-${alphabeticalFirst.prefixEn}-${relativeLocant}-${alphabeticalSecond.prefixEn}benzene`,
    categoryZh,
    "substitutive",
    aliasBase,
  );
}

function namePolysubstitutedBenzene(
  graph: BuilderGraph,
  ring: Set<string>,
  substituents: BenzeneSubstituent[],
): OrganicSystematicNameResult {
  const numbered = numberBenzeneSubstituents(graph, ring, substituents);
  if (!numbered) {
    return { status: "unsupported", reasonZh: "无法为当前多取代苯确定稳定的最低位次编号。" };
  }

  const highestPriority = Math.max(...numbered.map((substituent) => substituent.parentPriority));
  if (highestPriority > 0) {
    const principal = numbered.filter((substituent) => substituent.parentPriority === highestPriority);
    const prefixes = numbered.filter((substituent) => substituent.parentPriority !== highestPriority);
    const parent = formatPolysubstitutedBenzeneParent(principal);
    if (!parent) {
      return { status: "unsupported", reasonZh: "无法为当前多主官能团苯环生成可靠母体名称。" };
    }
    return generated(
      `${formatNumberedBenzenePrefixes(prefixes, "zh")}${parent.zh}`,
      `${formatNumberedBenzenePrefixes(prefixes, "en")}${parent.en}`,
      principal[0].categoryZh,
      "substitutive",
    );
  }

  return generated(
    `${formatNumberedBenzenePrefixes(numbered, "zh")}苯`,
    `${formatNumberedBenzenePrefixes(numbered, "en")}benzene`,
    categoryForBenzeneSubstituents(numbered),
    "substitutive",
  );
}

function numberBenzeneSubstituents(
  graph: BuilderGraph,
  ring: Set<string>,
  substituents: BenzeneSubstituent[],
): NumberedBenzeneSubstituent[] | undefined {
  const orientations = enumerateRingOrientations(graph, ring);
  const candidates = orientations.map((orientation) => {
    const locants = new Map(orientation.map((ringId, index) => [ringId, index + 1]));
    const numbered = substituents.map((substituent) => ({
      ...substituent,
      locant: locants.get(substituent.ringId) ?? 99,
    }));
    return { numbered, score: benzeneNumberingScore(numbered) };
  });
  return candidates.sort((first, second) => {
    const scoreComparison = compareNumberArrays(first.score, second.score);
    if (scoreComparison !== 0) return scoreComparison;
    return formatNumberedBenzenePrefixes(first.numbered, "en")
      .localeCompare(formatNumberedBenzenePrefixes(second.numbered, "en"));
  })[0]?.numbered;
}

function benzeneNumberingScore(substituents: NumberedBenzeneSubstituent[]): number[] {
  const highestPriority = Math.max(...substituents.map((substituent) => substituent.parentPriority));
  const principalLocants = highestPriority > 0
    ? substituents
      .filter((substituent) => substituent.parentPriority === highestPriority)
      .map((substituent) => substituent.locant)
      .sort((first, second) => first - second)
    : [];
  const allLocants = substituents.map((substituent) => substituent.locant).sort((first, second) => first - second);
  const alphabeticalLocants = [...groupNumberedBenzeneSubstituents(substituents).values()]
    .sort((first, second) => first[0].prefixEn.localeCompare(second[0].prefixEn))
    .flatMap((group) => [
      ...group.map((substituent) => substituent.locant).sort((first, second) => first - second),
      99,
    ]);
  return [...principalLocants, 99, ...allLocants, 99, ...alphabeticalLocants];
}

function formatPolysubstitutedBenzeneParent(
  principal: NumberedBenzeneSubstituent[],
): { zh: string; en: string } | undefined {
  if (principal.length === 1) {
    const [only] = principal;
    if (!only.parentNameZh || !only.parentNameEn) return undefined;
    return { zh: only.parentNameZh, en: only.parentNameEn };
  }
  if (principal.some((substituent) => substituent.kind !== principal[0].kind)) return undefined;
  const locants = principal.map((substituent) => substituent.locant).sort((first, second) => first - second);
  const locantText = locants.join(",");
  const multiplierZh = ZH_MULTIPLIERS[principal.length];
  const multiplierEn = EN_MULTIPLIERS[principal.length];
  if (!multiplierZh || !multiplierEn) return undefined;
  if (principal[0].kind === "hydroxy") {
    return { zh: `苯-${locantText}-${multiplierZh}酚`, en: `benzene-${locantText}-${multiplierEn}ol` };
  }
  if (principal[0].kind === "amino") {
    return { zh: `苯-${locantText}-${multiplierZh}胺`, en: `benzene-${locantText}-${multiplierEn}amine` };
  }
  if (principal[0].kind === "formyl") {
    return {
      zh: `苯-${locantText}-${multiplierZh}甲醛`,
      en: `benzene-${locantText}-${multiplierEn}carbaldehyde`,
    };
  }
  if (principal[0].kind === "carboxy") {
    return {
      zh: `苯-${locantText}-${multiplierZh}甲酸`,
      en: `benzene-${locantText}-${multiplierEn}carboxylic acid`,
    };
  }
  return undefined;
}

function formatNumberedBenzenePrefixes(
  substituents: NumberedBenzeneSubstituent[],
  language: "zh" | "en",
): string {
  if (substituents.length === 0) return "";
  return [...groupNumberedBenzeneSubstituents(substituents).values()]
    .sort((first, second) => first[0].prefixEn.localeCompare(second[0].prefixEn))
    .map((group) => {
      const locants = group.map((substituent) => substituent.locant).sort((first, second) => first - second);
      const multiplier = language === "zh" ? ZH_MULTIPLIERS[group.length] : EN_MULTIPLIERS[group.length];
      const name = language === "zh" ? group[0].prefixZh : group[0].prefixEn;
      return `${locants.join(",")}-${multiplier}${name}`;
    })
    .join("-");
}

function groupNumberedBenzeneSubstituents(
  substituents: NumberedBenzeneSubstituent[],
): Map<string, NumberedBenzeneSubstituent[]> {
  const grouped = new Map<string, NumberedBenzeneSubstituent[]>();
  for (const substituent of substituents) {
    const group = grouped.get(substituent.key) ?? [];
    group.push(substituent);
    grouped.set(substituent.key, group);
  }
  return grouped;
}

function nameRepeatedPrincipalBenzene(
  substituent: BenzeneSubstituent,
  relativeLocant: number,
  position: BenzenePosition,
  aliasBase: TeachingAlias,
): OrganicSystematicNameResult {
  const names = {
    hydroxy: {
      zh: `苯-1,${relativeLocant}-二酚`,
      en: `benzene-1,${relativeLocant}-diol`,
      aliasZh: `${position.shortZh}苯二酚`,
      aliasEn: `${position.shortEn}-benzenediol`,
    },
    amino: {
      zh: `苯-1,${relativeLocant}-二胺`,
      en: `benzene-1,${relativeLocant}-diamine`,
      aliasZh: `${position.shortZh}苯二胺`,
      aliasEn: `${position.shortEn}-benzenediamine`,
    },
    formyl: {
      zh: `苯-1,${relativeLocant}-二甲醛`,
      en: `benzene-1,${relativeLocant}-dicarbaldehyde`,
      aliasZh: `${position.shortZh}苯二甲醛`,
      aliasEn: `${position.shortEn}-benzenedicarbaldehyde`,
    },
    carboxy: {
      zh: `苯-1,${relativeLocant}-二甲酸`,
      en: `benzene-1,${relativeLocant}-dicarboxylic acid`,
      aliasZh: `${position.shortZh}苯二甲酸`,
      aliasEn: `${position.shortEn}-benzenedicarboxylic acid`,
    },
  } as const;
  const name = substituent.kind === "hydroxy"
    || substituent.kind === "amino"
    || substituent.kind === "formyl"
    || substituent.kind === "carboxy"
    ? names[substituent.kind]
    : undefined;
  if (!name) {
    return { status: "unsupported", reasonZh: "该主官能团的二取代苯命名暂不支持。" };
  }
  return generated(name.zh, name.en, substituent.categoryZh, "substitutive", {
    ...aliasBase,
    nameZh: name.aliasZh,
    nameEn: name.aliasEn,
  });
}

function benzenePosition(relativeLocant: number): BenzenePosition | undefined {
  if (relativeLocant === 2) {
    return { descriptorZh: "邻位（1,2-）", descriptorEn: "ortho (o-)", shortZh: "邻", shortEn: "o" };
  }
  if (relativeLocant === 3) {
    return { descriptorZh: "间位（1,3-）", descriptorEn: "meta (m-)", shortZh: "间", shortEn: "m" };
  }
  if (relativeLocant === 4) {
    return { descriptorZh: "对位（1,4-）", descriptorEn: "para (p-)", shortZh: "对", shortEn: "p" };
  }
  return undefined;
}

function categoryForBenzeneSubstituents(substituents: BenzeneSubstituent[]): string {
  if (substituents.every((substituent) => substituent.kind === "halogen")) return "卤代芳烃";
  if (substituents.every((substituent) => substituent.kind === "alkyl")) return "芳香烃";
  if (substituents.every((substituent) => substituent.kind === "alkoxy")) return "芳香醚";
  return "取代芳烃";
}

function enumerateRingOrientations(graph: BuilderGraph, ring: Set<string>): string[][] {
  const orientations: string[][] = [];
  for (const startId of ring) {
    for (const firstNeighbor of ringNeighbors(graph, startId, ring)) {
      const orientation = [startId, firstNeighbor.atom.id];
      let previousId = startId;
      let currentId = firstNeighbor.atom.id;
      while (orientation.length < ring.size) {
        const next = ringNeighbors(graph, currentId, ring)
          .find((neighbor) => neighbor.atom.id !== previousId && !orientation.includes(neighbor.atom.id));
        if (!next) break;
        orientation.push(next.atom.id);
        previousId = currentId;
        currentId = next.atom.id;
      }
      if (orientation.length === ring.size) orientations.push(orientation);
    }
  }
  return orientations;
}

function collectOutsideHeavyComponent(
  graph: BuilderGraph,
  startId: string,
  ring: Set<string>,
): Set<string> {
  const component = new Set<string>();
  const queue = [startId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (component.has(current) || ring.has(current)) continue;
    component.add(current);
    for (const neighbor of graph.heavyNeighbors.get(current) ?? []) {
      if (!ring.has(neighbor.atom.id)) queue.push(neighbor.atom.id);
    }
  }
  return component;
}

function findCycleCore(graph: BuilderGraph): Set<string> {
  const remaining = new Set(graph.heavyAtoms.map((atom) => atom.id));
  const degrees = new Map(
    graph.heavyAtoms.map((atom) => [atom.id, (graph.heavyNeighbors.get(atom.id) ?? []).length]),
  );
  const queue = [...remaining].filter((id) => (degrees.get(id) ?? 0) < 2);
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (!remaining.delete(current)) continue;
    for (const neighbor of graph.heavyNeighbors.get(current) ?? []) {
      if (!remaining.has(neighbor.atom.id)) continue;
      const nextDegree = (degrees.get(neighbor.atom.id) ?? 0) - 1;
      degrees.set(neighbor.atom.id, nextDegree);
      if (nextDegree < 2) queue.push(neighbor.atom.id);
    }
  }
  return remaining;
}

function getRingEdges(graph: BuilderGraph, ring: Set<string>): Array<{ atomIds: [string, string]; order: BuilderBondOrder }> {
  const seen = new Set<string>();
  const edges: Array<{ atomIds: [string, string]; order: BuilderBondOrder }> = [];
  for (const firstId of ring) {
    for (const neighbor of ringNeighbors(graph, firstId, ring)) {
      const key = [firstId, neighbor.atom.id].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ atomIds: [firstId, neighbor.atom.id], order: neighbor.order });
    }
  }
  return edges;
}

function ringNeighbors(graph: BuilderGraph, atomId: string, ring: Set<string>): GraphNeighbor[] {
  return (graph.heavyNeighbors.get(atomId) ?? []).filter((neighbor) => ring.has(neighbor.atom.id));
}

function isStraightSaturatedCarbonSubstituent(
  graph: BuilderGraph,
  carbonIds: Set<string>,
  attachmentId: string,
  anchorId: string,
): boolean {
  if (!carbonIds.has(attachmentId) || carbonIds.size === 0) return false;
  let internalEdgeCount = 0;
  for (const id of carbonIds) {
    if (graph.atomsById.get(id)?.element !== "C") return false;
    const neighbors = graph.heavyNeighbors.get(id) ?? [];
    const internal = neighbors.filter((neighbor) => carbonIds.has(neighbor.atom.id));
    const external = neighbors.filter((neighbor) => !carbonIds.has(neighbor.atom.id));
    if (internal.length > 2 || internal.some((neighbor) => neighbor.order !== 1)) return false;
    if (id === attachmentId) {
      if (internal.length > 1 || external.length !== 1 || external[0].atom.id !== anchorId || external[0].order !== 1) return false;
    } else if (external.length > 0) {
      return false;
    }
    internalEdgeCount += internal.length;
  }
  return internalEdgeCount / 2 === carbonIds.size - 1;
}

function tryNameSimpleEther(graph: BuilderGraph): OrganicSystematicNameResult | undefined {
  const oxygens = graph.heavyAtoms.filter((atom) => atom.element === "O");
  const nonCarbonOrOxygen = graph.heavyAtoms.some((atom) => atom.element !== "C" && atom.element !== "O");
  if (oxygens.length !== 1 || nonCarbonOrOxygen) return undefined;

  const oxygen = oxygens[0];
  const oxygenNeighbors = graph.heavyNeighbors.get(oxygen.id) ?? [];
  if (
    oxygenNeighbors.length !== 2
    || oxygenNeighbors.some((neighbor) => neighbor.atom.element !== "C" || neighbor.order !== 1)
    || hydrogenCount(graph, oxygen.id) > 0
  ) {
    return undefined;
  }

  const components = oxygenNeighbors.map((neighbor) => collectCarbonComponent(graph, neighbor.atom.id, oxygen.id));
  if (components.some((component) => !component || !isLinearSaturatedCarbonComponent(graph, component))) {
    return { status: "unsupported", reasonZh: "当前只支持两侧均为简单直链烷基的醚类命名。" };
  }
  const [firstComponent, secondComponent] = components as [Set<string>, Set<string>];
  const sides = [
    makeEtherSide(graph, firstComponent, oxygen.id),
    makeEtherSide(graph, secondComponent, oxygen.id),
  ];
  if (sides.some((side) => !side) || sides.some((side) => side!.length > 10)) {
    return { status: "unsupported", reasonZh: "醚类母体或烷氧基已超出当前 C1–C10 的命名范围。" };
  }

  const validSides = sides as [NonNullable<(typeof sides)[number]>, NonNullable<(typeof sides)[number]>];
  // 母体取较长一侧；等长平局时优先能让另一侧构成合法端连烷氧基（O 位次为 1）的分配，
  // 保证同一分子的命名结果与化学键数组顺序无关。
  const chosen = [
    { parent: validSides[0], alkoxy: validSides[1] },
    { parent: validSides[1], alkoxy: validSides[0] },
  ]
    .filter((assignment) => assignment.parent.length >= assignment.alkoxy.length)
    .filter((assignment) => assignment.alkoxy.oxygenLocant === 1 && assignment.alkoxy.length <= 4)
    .sort((first, second) => second.parent.length - first.parent.length)[0];
  if (!chosen) {
    return { status: "unsupported", reasonZh: "当前只支持由直链 C1–C4 烷基形成的简单烷氧基。" };
  }
  const { parent, alkoxy } = chosen;

  const showParentLocant = parent.length > 2;
  const locantPrefix = showParentLocant ? `${parent.oxygenLocant}-` : "";
  return generated(
    `${locantPrefix}${ZH_ROOTS[alkoxy.length]}氧基${ZH_ROOTS[parent.length]}烷`,
    `${locantPrefix}${EN_ROOTS[alkoxy.length]}oxy${EN_ROOTS[parent.length]}ane`,
    "醚",
    "substitutive",
  );
}

function makeEtherSide(graph: BuilderGraph, component: Set<string>, oxygenId: string) {
  const attachment = [...component].find((id) =>
    (graph.heavyNeighbors.get(id) ?? []).some((neighbor) => neighbor.atom.id === oxygenId),
  );
  if (!attachment) return undefined;
  const endpoints = [...component].filter((id) => carbonNeighborsWithin(graph, id, component).length <= 1);
  const orientedPaths = endpoints.flatMap((endpoint) => {
    const path = findPath(graph, endpoint, endpoints.find((candidate) => candidate !== endpoint) ?? endpoint, component);
    return path ? [path, [...path].reverse()] : [];
  });
  const paths = orientedPaths.filter((path) => path.length === component.size && path.includes(attachment));
  if (paths.length === 0) return undefined;
  const path = paths.sort((first, second) => first.indexOf(attachment) - second.indexOf(attachment))[0];
  return { length: path.length, oxygenLocant: path.indexOf(attachment) + 1 };
}

function tryNameSkeletalReplacement(graph: BuilderGraph): OrganicSystematicNameResult | undefined {
  const heteroAtoms = graph.heavyAtoms.filter((atom) => atom.element === "N" || atom.element === "O");
  if (heteroAtoms.length === 0) return undefined;
  if (graph.heavyAtoms.some((atom) => !["C", "N", "O"].includes(atom.element))) return undefined;
  if (graph.heavyAtoms.some((atom) => (graph.heavyNeighbors.get(atom.id) ?? []).length > 2)) return undefined;

  for (const atom of heteroAtoms) {
    const neighbors = graph.heavyNeighbors.get(atom.id) ?? [];
    if (neighbors.length !== 2 || hydrogenCount(graph, atom.id) > 0) return undefined;
    if (atom.element === "O" && neighbors.some((neighbor) => neighbor.order !== 1)) return undefined;
    if (atom.element === "N" && neighbors.reduce((sum, neighbor) => sum + neighbor.order, 0) !== 3) return undefined;
  }

  const endpoints = graph.heavyAtoms.filter((atom) => (graph.heavyNeighbors.get(atom.id) ?? []).length === 1);
  if (endpoints.length !== 2 || graph.heavyAtoms.length > 10) {
    return { status: "unsupported", reasonZh: "杂原子骨架暂只支持 C1–C10 的无环单路径结构。" };
  }
  const allowed = new Set(graph.heavyAtoms.map((atom) => atom.id));
  const path = findPath(graph, endpoints[0].id, endpoints[1].id, allowed);
  if (!path || path.length !== graph.heavyAtoms.length) return undefined;

  const orientations = [path, [...path].reverse()];
  const ordered = orientations.sort((first, second) => compareNumberArrays(
    replacementNumberingScore(graph, first),
    replacementNumberingScore(graph, second),
  ))[0];
  const doubleLocants = bondLocants(graph, ordered, 2);
  const tripleLocants = bondLocants(graph, ordered, 3);
  const oxygenLocants = elementLocants(graph, ordered, "O");
  const nitrogenLocants = elementLocants(graph, ordered, "N");
  const prefixesEn = [
    replacementPrefixEn(oxygenLocants, "oxa"),
    replacementPrefixEn(nitrogenLocants, "aza"),
  ].filter(Boolean).join("-");
  const prefixesZh = [
    replacementPrefixZh(oxygenLocants, "氧杂"),
    replacementPrefixZh(nitrogenLocants, "氮杂"),
  ].filter(Boolean).join("-");
  const parent = formatHydrocarbonParent(ordered.length, doubleLocants, tripleLocants);
  if (!parent) {
    return { status: "unsupported", reasonZh: "当前不支持该杂原子链中的多重不饱和键组合。" };
  }
  return generated(
    `${prefixesZh}${parent.zh}`,
    `${prefixesEn}${parent.en}`,
    "杂原子链",
    "skeletal-replacement",
  );
}

function replacementNumberingScore(graph: BuilderGraph, path: string[]): number[] {
  return [
    ...elementLocants(graph, path, "O"),
    99,
    ...elementLocants(graph, path, "N"),
    99,
    ...bondLocants(graph, path, 2),
    99,
    ...bondLocants(graph, path, 3),
  ];
}

function replacementPrefixEn(locants: number[], base: "aza" | "oxa"): string {
  if (locants.length === 0) return "";
  return `${locants.join(",")}-${EN_MULTIPLIERS[locants.length] ?? "poly"}${base}`;
}

function replacementPrefixZh(locants: number[], base: "氮杂" | "氧杂"): string {
  if (locants.length === 0) return "";
  return `${locants.join(",")}-${ZH_MULTIPLIERS[locants.length] ?? "多"}${base}`;
}

function nameCarbonSkeleton(graph: BuilderGraph): OrganicSystematicNameResult {
  const classification = classifyFunctionalGroups(graph);
  if (classification.status === "unsupported") return classification;
  const amideGroups = classification.groups.filter((group) => group.kind === "amide");
  if (amideGroups.length > 1) {
    return { status: "unsupported", reasonZh: "当前只支持一个无环酰胺基；多酰胺和酰亚胺暂不在本地基础规则内。" };
  }
  if (amideGroups.length === 1 && classification.groups.some((group) => group.kind === "acid")) {
    return { status: "unsupported", reasonZh: "羧酸与酰胺并存时需要更复杂的前缀规则，暂不在本地基础规则内。" };
  }

  const amide = amideGroups[0] ? analyzeAmideNitrogenSubstituents(graph, amideGroups[0]) : undefined;
  if (amide?.status === "unsupported") return amide;
  const amideNaming = amide?.status === "ok" ? amide.amide : undefined;
  const excludedAmideCarbonIds = amideNaming?.carbonIds ?? new Set<string>();
  const carbonIds = graph.heavyAtoms
    .filter((atom) => atom.element === "C" && !excludedAmideCarbonIds.has(atom.id))
    .map((atom) => atom.id);
  const carbonSet = new Set(carbonIds);
  if (!isCarbonSkeletonConnected(graph, carbonSet)) {
    return { status: "unsupported", reasonZh: "当前结构含有尚未覆盖的杂原子桥或多个碳骨架。" };
  }

  const { groups } = classification;
  const principalKind = groups.reduce<FunctionalKind | undefined>((best, group) =>
    !best || FUNCTIONAL_PRIORITY[group.kind] > FUNCTIONAL_PRIORITY[best] ? group.kind : best,
  undefined);
  const principalGroups = principalKind ? groups.filter((group) => group.kind === principalKind) : [];
  const requiredCarbonIds = new Set(principalGroups.map((group) => group.carbonId));
  const carbonPaths = enumerateCarbonPaths(graph, carbonSet);
  const longestCarbonPath = Math.max(...carbonPaths.map((path) => path.length));
  if (longestCarbonPath > 10) {
    return { status: "unsupported", reasonZh: "最长母体碳链超过 C10；当前只支持 C1–C10 的母体。" };
  }
  const paths = carbonPaths
    .filter((path) => [...requiredCarbonIds].every((id) => path.includes(id)))
    .flatMap((path) => path.length === 1 ? [path] : [path, [...path].reverse()]);
  if (paths.length === 0) {
    return { status: "unsupported", reasonZh: "主官能团无法同时纳入一条可靠的母体碳链。" };
  }

  const candidates = paths
    .map((path) => analyzeCarbonPath(graph, carbonSet, groups, principalKind, path, amideNaming))
    .filter((candidate): candidate is NameCandidate => Boolean(candidate));
  if (candidates.length === 0) {
    // 兜底原因分级：同类多主官能团与碳碳不饱和键并存（丁烯二酸、丁烯二醛）给出专门说明，
    // 避免落入与实际结构不符的"复杂支链/杂原子/超 C10"通用文案。
    const hasCarbonUnsaturation = graph.heavyAtoms.some((atom) =>
      atom.element === "C"
      && (graph.heavyNeighbors.get(atom.id) ?? []).some((neighbor) =>
        neighbor.atom.element === "C" && neighbor.order > 1,
      ),
    );
    if (principalGroups.length > 1 && hasCarbonUnsaturation) {
      return {
        status: "unsupported",
        reasonZh: "同类多主官能团（二酸、二醛等）与碳碳双键/三键并存的位次组合暂不在本地基础规则内。",
      };
    }
    return { status: "unsupported", reasonZh: "当前结构含复杂支链、杂原子取代或超出 C1–C10 的母体。" };
  }
  const best = candidates.sort(compareCandidates)[0];
  // 最长链守卫：若存在比已解析母链更长的候选路径（因复杂支链等原因全部解析失败），
  // 按"选最长碳链作主链"规则宁可拒绝，也不静默降级为较短母链的名称。
  const longestFilteredPath = Math.max(...paths.map((path) => path.length));
  if (best.parentLength < longestFilteredPath) {
    return {
      status: "unsupported",
      reasonZh: "存在比可命名母链更长的碳链（其支链或取代方式超出当前规则），按最长碳链规则暂无法可靠命名。",
    };
  }
  return best;
}

function classifyFunctionalGroups(
  graph: BuilderGraph,
): { status: "ok"; groups: FunctionalGroup[] } | Extract<OrganicSystematicNameResult, { status: "unsupported" }> {
  const groups: FunctionalGroup[] = [];
  const claimedHetero = new Set<string>();
  const carbons = graph.heavyAtoms.filter((atom) => atom.element === "C");

  for (const carbon of carbons) {
    const neighbors = graph.heavyNeighbors.get(carbon.id) ?? [];
    const doubleOxygens = neighbors.filter((neighbor) => neighbor.atom.element === "O" && neighbor.order === 2);
    if (doubleOxygens.length > 1) {
      return { status: "unsupported", reasonZh: "当前不支持同一碳原子连接多个双键氧的结构。" };
    }
    const carbonylOxygen = doubleOxygens[0];
    if (!carbonylOxygen) continue;
    const hydroxylOxygen = neighbors.find((neighbor) =>
      neighbor.atom.element === "O"
      && neighbor.order === 1
      && hydrogenCount(graph, neighbor.atom.id) === 1,
    );
    if (hydroxylOxygen) {
      groups.push({ kind: "acid", carbonId: carbon.id, heteroIds: [carbonylOxygen.atom.id, hydroxylOxygen.atom.id] });
      claimedHetero.add(carbonylOxygen.atom.id);
      claimedHetero.add(hydroxylOxygen.atom.id);
      continue;
    }
    const amideNitrogens = neighbors.filter((neighbor) =>
      neighbor.atom.element === "N" && neighbor.order === 1,
    );
    if (amideNitrogens.length > 0) {
      if (amideNitrogens.length !== 1) {
        return { status: "unsupported", reasonZh: "同一羰基连接多个氮原子的酰胺衍生物暂不在本地基础规则内。" };
      }
      const amideNitrogen = amideNitrogens[0];
      const unsupportedNeighbors = neighbors.filter((neighbor) =>
        neighbor.atom.id !== carbonylOxygen.atom.id
        && neighbor.atom.id !== amideNitrogen.atom.id
        && (neighbor.atom.element !== "C" || neighbor.order !== 1),
      );
      if (unsupportedNeighbors.length > 0) {
        return { status: "unsupported", reasonZh: "该羰基同时连接了酰胺氮和其他未支持取代基。" };
      }
      groups.push({
        kind: "amide",
        carbonId: carbon.id,
        heteroIds: [carbonylOxygen.atom.id, amideNitrogen.atom.id],
        nitrogenId: amideNitrogen.atom.id,
      });
      claimedHetero.add(carbonylOxygen.atom.id);
      claimedHetero.add(amideNitrogen.atom.id);
      continue;
    }
    const hasCarbonylHydrogen = hydrogenCount(graph, carbon.id) > 0;
    const carbonNeighborCount = neighbors.filter((neighbor) => neighbor.atom.element === "C").length;
    if (!hasCarbonylHydrogen && carbonNeighborCount !== 2) {
      if (neighbors.some((neighbor) => HALOGEN_PREFIX[neighbor.atom.element])) {
        return { status: "unsupported", reasonZh: "酰卤暂不在本地基础规则内。" };
      }
      if (neighbors.some((neighbor) => neighbor.atom.element === "O" && neighbor.order === 1)) {
        return { status: "unsupported", reasonZh: "酯、酸酐等含单键氧的羰基衍生物暂不在本地基础规则内。" };
      }
      return { status: "unsupported", reasonZh: "该羰基衍生物暂不在本地基础规则内。" };
    }
    const kind: FunctionalKind = hasCarbonylHydrogen ? "aldehyde" : "ketone";
    groups.push({ kind, carbonId: carbon.id, heteroIds: [carbonylOxygen.atom.id] });
    claimedHetero.add(carbonylOxygen.atom.id);
  }

  for (const oxygen of graph.heavyAtoms.filter((atom) => atom.element === "O" && !claimedHetero.has(atom.id))) {
    const neighbors = graph.heavyNeighbors.get(oxygen.id) ?? [];
    if (neighbors.length === 1 && neighbors[0].atom.element === "C" && neighbors[0].order === 1 && hydrogenCount(graph, oxygen.id) === 1) {
      groups.push({ kind: "alcohol", carbonId: neighbors[0].atom.id, heteroIds: [oxygen.id] });
      claimedHetero.add(oxygen.id);
      continue;
    }
    return { status: "unsupported", reasonZh: "当前只支持羟基、羰基、羧基和简单醚中的氧原子。" };
  }

  for (const nitrogen of graph.heavyAtoms.filter((atom) => atom.element === "N" && !claimedHetero.has(atom.id))) {
    const neighbors = graph.heavyNeighbors.get(nitrogen.id) ?? [];
    if (
      neighbors.length === 1
      && neighbors[0].atom.element === "C"
      && neighbors[0].order === 1
      && hydrogenCount(graph, nitrogen.id) === 2
    ) {
      groups.push({ kind: "amine", carbonId: neighbors[0].atom.id, heteroIds: [nitrogen.id] });
      continue;
    }
    return { status: "unsupported", reasonZh: "仲胺、叔胺及复杂含氮官能团暂不在本地基础规则内。" };
  }

  for (const halogen of graph.heavyAtoms.filter((atom) => HALOGEN_PREFIX[atom.element])) {
    const neighbors = graph.heavyNeighbors.get(halogen.id) ?? [];
    if (neighbors.length !== 1 || neighbors[0].atom.element !== "C" || neighbors[0].order !== 1) {
      return { status: "unsupported", reasonZh: "卤素必须以单键连接在母体碳原子上。" };
    }
  }
  return { status: "ok", groups };
}

function analyzeAmideNitrogenSubstituents(
  graph: BuilderGraph,
  amideGroup: FunctionalGroup,
): { status: "ok"; amide: AmideNaming } | Extract<OrganicSystematicNameResult, { status: "unsupported" }> {
  const nitrogenId = amideGroup.nitrogenId;
  if (!nitrogenId) {
    return { status: "unsupported", reasonZh: "未能确定酰胺氮原子。" };
  }
  const nitrogenNeighbors = graph.heavyNeighbors.get(nitrogenId) ?? [];
  const unsupportedNeighbors = nitrogenNeighbors.filter((neighbor) =>
    neighbor.atom.id !== amideGroup.carbonId
    && (neighbor.atom.element !== "C" || neighbor.order !== 1),
  );
  if (unsupportedNeighbors.length > 0) {
    return { status: "unsupported", reasonZh: "酰胺氮上的取代基当前只支持以单键连接的碳氢链。" };
  }
  const carbonNeighbors = nitrogenNeighbors.filter((neighbor) =>
    neighbor.atom.id !== amideGroup.carbonId && neighbor.atom.element === "C" && neighbor.order === 1,
  );
  if (carbonNeighbors.length > 2) {
    return { status: "unsupported", reasonZh: "酰胺氮最多支持两个当前规则内的 N-取代基。" };
  }

  const allCarbonIds = new Set<string>();
  const substituents: AmideNSubstituent[] = [];
  for (const neighbor of carbonNeighbors) {
    const component = collectCarbonComponent(graph, neighbor.atom.id, nitrogenId);
    if (component.size > 10) {
      return { status: "unsupported", reasonZh: "酰胺氮上的单个烃基超过 C10，暂不在本地基础规则内。" };
    }
    if ([...component].some((id) => allCarbonIds.has(id))) {
      return { status: "unsupported", reasonZh: "酰胺氮取代基之间形成环或跨接，暂不在本地基础规则内。" };
    }
    const substituent = nameAmideNSubstituent(graph, component, nitrogenId, neighbor.atom.id);
    if (substituent.status === "unsupported") return substituent;
    component.forEach((id) => allCarbonIds.add(id));
    substituents.push(substituent.substituent);
  }

  return {
    status: "ok",
    amide: { carbonIds: allCarbonIds, nitrogenId, substituents },
  };
}

function nameAmideNSubstituent(
  graph: BuilderGraph,
  component: Set<string>,
  nitrogenId: string,
  attachmentId: string,
): { status: "ok"; substituent: AmideNSubstituent } | Extract<OrganicSystematicNameResult, { status: "unsupported" }> {
  let internalEdgeCount = 0;
  for (const id of component) {
    const neighbors = graph.heavyNeighbors.get(id) ?? [];
    const internal = neighbors.filter((neighbor) => neighbor.atom.element === "C" && component.has(neighbor.atom.id));
    const external = neighbors.filter((neighbor) => !component.has(neighbor.atom.id));
    if (internal.length > 2) {
      return { status: "unsupported", reasonZh: "酰胺氮上的支链烃基暂不在本地基础规则内。" };
    }
    if (id === attachmentId) {
      if (
        internal.length > 1
        || external.length !== 1
        || external[0].atom.id !== nitrogenId
        || external[0].order !== 1
      ) {
        return { status: "unsupported", reasonZh: "酰胺氮取代基需从无环直链烃基的端点以单键连接。" };
      }
    } else if (external.length > 0) {
      return { status: "unsupported", reasonZh: "酰胺氮取代基当前只支持不含杂原子或其他取代的碳氢直链。" };
    }
    internalEdgeCount += internal.length;
  }
  if (internalEdgeCount / 2 !== component.size - 1) {
    return { status: "unsupported", reasonZh: "酰胺氮取代基形成了环或跨接结构。" };
  }

  const terminalId = component.size === 1
    ? attachmentId
    : [...component].find((id) =>
        id !== attachmentId && carbonNeighborsWithin(graph, id, component).length === 1,
      );
  if (!terminalId) {
    return { status: "unsupported", reasonZh: "未能为酰胺氮取代基确定稳定的直链编号。" };
  }
  const path = findPath(graph, attachmentId, terminalId, component);
  if (!path || path.length !== component.size) {
    return { status: "unsupported", reasonZh: "未能为酰胺氮取代基确定稳定的直链编号。" };
  }
  const doubleLocants = bondLocants(graph, path, 2, "C");
  const tripleLocants = bondLocants(graph, path, 3, "C");
  if (doubleLocants.length === 0 && tripleLocants.length === 0) {
    return {
      status: "ok",
      substituent: {
        carbonIds: component,
        nameZh: `${ZH_ROOTS[path.length]}基`,
        nameEn: `${EN_ROOTS[path.length]}yl`,
        isComplex: false,
      },
    };
  }
  const parent = formatHydrocarbonParent(path.length, doubleLocants, tripleLocants);
  if (!parent) {
    return { status: "unsupported", reasonZh: "酰胺氮取代基中的不饱和键组合暂不在本地基础规则内。" };
  }
  return {
    status: "ok",
    substituent: {
      carbonIds: component,
      nameZh: `${parent.zh}-1-基`,
      nameEn: `${trimTerminalE(parent.en)}-1-yl`,
      isComplex: true,
    },
  };
}

function analyzeCarbonPath(
  graph: BuilderGraph,
  carbonSet: Set<string>,
  groups: FunctionalGroup[],
  principalKind: FunctionalKind | undefined,
  path: string[],
  amideNaming?: AmideNaming,
): NameCandidate | undefined {
  if (path.length > 10) return undefined;
  const pathSet = new Set(path);
  const accounted = new Set(path);
  amideNaming?.carbonIds.forEach((id) => accounted.add(id));
  const substituents: Substituent[] = [];
  const visitedBranches = new Set<string>();

  for (let index = 0; index < path.length; index += 1) {
    const carbonId = path[index];
    const locant = index + 1;
    for (const neighbor of graph.heavyNeighbors.get(carbonId) ?? []) {
      if (neighbor.atom.element === "C" && !pathSet.has(neighbor.atom.id) && !visitedBranches.has(neighbor.atom.id)) {
        const branch = collectBranch(graph, neighbor.atom.id, carbonId, pathSet);
        if (!branch || branch.size > 4 || !isSimpleAlkylBranch(graph, branch, carbonId)) return undefined;
        branch.forEach((id) => {
          visitedBranches.add(id);
          accounted.add(id);
        });
        substituents.push({
          locant,
          key: `alkyl-${branch.size}`,
          nameZh: `${ZH_ROOTS[branch.size]}基`,
          nameEn: `${EN_ROOTS[branch.size]}yl`,
        });
      }
      const halogen = HALOGEN_PREFIX[neighbor.atom.element];
      if (halogen) {
        accounted.add(neighbor.atom.id);
        substituents.push({ locant, key: neighbor.atom.element, nameZh: halogen.zh, nameEn: halogen.en });
      }
    }
  }

  const principalLocants: number[] = [];
  for (const group of groups) {
    const carbonIndex = path.indexOf(group.carbonId);
    if (carbonIndex < 0) return undefined;
    const locant = carbonIndex + 1;
    group.heteroIds.forEach((id) => accounted.add(id));
    if (group.kind === principalKind) {
      principalLocants.push(locant);
      continue;
    }
    const prefix = functionalPrefix(group.kind);
    if (!prefix) return undefined;
    substituents.push({ locant, key: group.kind, ...prefix });
  }

  if (accounted.size !== graph.heavyAtoms.length) return undefined;
  // 同类前缀的倍数词表只到"十/deca"；超出会拼出字面 undefined，直接判定该候选失败。
  const substituentKeyCounts = new Map<string, number>();
  for (const substituent of substituents) {
    substituentKeyCounts.set(substituent.key, (substituentKeyCounts.get(substituent.key) ?? 0) + 1);
  }
  if ([...substituentKeyCounts.values()].some((count) => count > 10)) return undefined;
  const doubleLocants = bondLocants(graph, path, 2, "C");
  const tripleLocants = bondLocants(graph, path, 3, "C");
  const parent = formatParentWithFunctionalGroup(
    path.length,
    doubleLocants,
    tripleLocants,
    principalKind,
    principalLocants.sort((a, b) => a - b),
  );
  if (!parent) return undefined;

  // 饱和 C1–C2 母体上的单一取代基没有位次歧义，按教材习惯省略位次（氯乙烷而非 1-氯乙烷）。
  const omitSubstituentLocant = path.length <= 2
    && substituents.length === 1
    && !principalKind
    && doubleLocants.length === 0
    && tripleLocants.length === 0
    && (amideNaming?.substituents.length ?? 0) === 0;
  const prefixEn = formatCombinedSubstituents(
    substituents,
    amideNaming?.substituents ?? [],
    "en",
    path.length,
    omitSubstituentLocant,
  );
  const prefixZh = formatCombinedSubstituents(
    substituents,
    amideNaming?.substituents ?? [],
    "zh",
    path.length,
    omitSubstituentLocant,
  );
  const categoryZh = categoryFor(principalKind, doubleLocants, tripleLocants, substituents);
  const result = generated(
    `${prefixZh}${parent.zh}`,
    `${prefixEn}${parent.en}`,
    categoryZh,
    "substitutive",
  );
  return {
    ...result,
    parentLength: path.length,
    multipleBondCount: doubleLocants.length + tripleLocants.length,
    principalLocants: [...principalLocants].sort((a, b) => a - b),
    unsaturationLocants: [...doubleLocants, ...tripleLocants].sort((a, b) => a - b),
    substituentLocants: substituents.map((substituent) => substituent.locant).sort((a, b) => a - b),
    substituentCount: substituents.length + (amideNaming?.substituents.length ?? 0),
  };
}

function compareCandidates(first: NameCandidate, second: NameCandidate): number {
  if (first.parentLength !== second.parentLength) return second.parentLength - first.parentLength;
  if (first.multipleBondCount !== second.multipleBondCount) return second.multipleBondCount - first.multipleBondCount;
  const locantComparison = compareNumberArrays(
    [...first.principalLocants, 99, ...first.unsaturationLocants, 99, ...first.substituentLocants],
    [...second.principalLocants, 99, ...second.unsaturationLocants, 99, ...second.substituentLocants],
  );
  if (locantComparison !== 0) return locantComparison;
  if (first.substituentCount !== second.substituentCount) return second.substituentCount - first.substituentCount;
  return first.nameEn.localeCompare(second.nameEn);
}

function formatParentWithFunctionalGroup(
  length: number,
  doubleLocants: number[],
  tripleLocants: number[],
  principalKind: FunctionalKind | undefined,
  locants: number[],
): { zh: string; en: string } | undefined {
  if (!principalKind) return formatHydrocarbonParent(length, doubleLocants, tripleLocants);
  if (locants.length === 0 || locants.length > 10) return undefined;
  if (
    (principalKind === "acid" || principalKind === "amide" || principalKind === "aldehyde")
    && locants.some((locant) => locant !== 1 && locant !== length)
  ) {
    return undefined;
  }
  if (principalKind === "acid" && locants.length > 1 && (doubleLocants.length > 0 || tripleLocants.length > 0)) {
    return undefined;
  }

  const rootEn = EN_ROOTS[length];
  const rootZh = ZH_ROOTS[length];
  if (!rootEn || !rootZh) return undefined;
  const unsaturated = formatHydrocarbonParent(length, doubleLocants, tripleLocants);
  if (!unsaturated) return undefined;
  const hasUnsaturation = doubleLocants.length + tripleLocants.length > 0;
  const count = locants.length;
  const multiplierEn = EN_MULTIPLIERS[count];
  const multiplierZh = ZH_MULTIPLIERS[count];
  const locantText = locants.join(",");

  if (principalKind === "acid") {
    if (count === 1) {
      return {
        zh: hasUnsaturation ? `${unsaturated.zh}酸` : `${rootZh}酸`,
        en: hasUnsaturation ? `${trimTerminalE(unsaturated.en)}oic acid` : `${rootEn}anoic acid`,
      };
    }
    return { zh: `${rootZh}${multiplierZh}酸`, en: `${rootEn}ane${multiplierEn}oic acid` };
  }
  if (principalKind === "amide") {
    if (count !== 1) return undefined;
    return {
      zh: hasUnsaturation ? `${unsaturated.zh}酰胺` : `${rootZh}酰胺`,
      en: hasUnsaturation ? `${trimTerminalE(unsaturated.en)}amide` : `${rootEn}anamide`,
    };
  }
  if (principalKind === "aldehyde") {
    if (count === 1) {
      return {
        zh: hasUnsaturation ? `${unsaturated.zh}醛` : `${rootZh}醛`,
        en: hasUnsaturation ? `${trimTerminalE(unsaturated.en)}al` : `${rootEn}anal`,
      };
    }
    // 多元醛与不饱和键并存的位次组合尚未验证，宁可拒绝也不给出丢失烯/炔的错误名称。
    if (hasUnsaturation) return undefined;
    return {
      zh: `${rootZh}-${locantText}-${multiplierZh}醛`,
      en: `${rootEn}ane-${locantText}-${multiplierEn}al`,
    };
  }

  const suffix = principalKind === "ketone" ? "one" : principalKind === "alcohol" ? "ol" : "amine";
  const suffixZh = principalKind === "ketone" ? "酮" : principalKind === "alcohol" ? "醇" : "胺";
  // 中文词干必须与英文一致地携带不饱和信息（丙-2-烯-1-醇），否则丙烯醇会被误写成"丙-1-醇"。
  const stemZh = hasUnsaturation ? unsaturated.zh : rootZh;
  if (count === 1) {
    const stemEn = hasUnsaturation ? trimTerminalE(unsaturated.en) : `${rootEn}an`;
    const showLocant = length > 2 || principalKind === "ketone";
    return {
      zh: showLocant ? `${stemZh}-${locantText}-${suffixZh}` : `${stemZh}${suffixZh}`,
      en: showLocant ? `${stemEn}-${locantText}-${suffix}` : `${stemEn}${suffix}`,
    };
  }
  // 复数后缀（diol/dione/diamine）以辅音开头，英文词尾 e 需保留：but-2-ene-1,4-diol。
  const stemEn = hasUnsaturation ? unsaturated.en : `${rootEn}ane`;
  return {
    zh: `${stemZh}-${locantText}-${multiplierZh}${suffixZh}`,
    en: `${stemEn}-${locantText}-${multiplierEn}${suffix}`,
  };
}

function formatHydrocarbonParent(
  length: number,
  doubleLocants: number[],
  tripleLocants: number[],
): { zh: string; en: string } | undefined {
  const rootEn = EN_ROOTS[length];
  const rootZh = ZH_ROOTS[length];
  if (!rootEn || !rootZh) return undefined;
  if (doubleLocants.length > 10 || tripleLocants.length > 10) return undefined;
  if (doubleLocants.length === 0 && tripleLocants.length === 0) {
    return { zh: `${rootZh}烷`, en: `${rootEn}ane` };
  }

  const doubleEn = unsaturationSegmentEn(doubleLocants, "en");
  const tripleEn = unsaturationSegmentEn(tripleLocants, "yn");
  const doubleZh = unsaturationSegmentZh(doubleLocants, "烯");
  const tripleZh = unsaturationSegmentZh(tripleLocants, "炔");
  const needsConnectorA = doubleLocants.length > 1 || tripleLocants.length > 1;
  const stemEn = `${rootEn}${needsConnectorA ? "a" : ""}`;
  if (doubleLocants.length > 0 && tripleLocants.length > 0) {
    const enPart = doubleEn.replace(/ene$/, "en");
    return {
      zh: `${rootZh}-${doubleZh}-${tripleZh}`,
      en: `${stemEn}-${enPart}-${tripleEn}`,
    };
  }
  return {
    zh: `${rootZh}-${doubleZh || tripleZh}`,
    en: `${stemEn}-${doubleEn || tripleEn}`,
  };
}

function unsaturationSegmentEn(locants: number[], ending: "en" | "yn"): string {
  if (locants.length === 0) return "";
  const multiplier = EN_MULTIPLIERS[locants.length];
  return `${locants.join(",")}-${multiplier}${ending}e`;
}

function unsaturationSegmentZh(locants: number[], ending: "烯" | "炔"): string {
  if (locants.length === 0) return "";
  return `${locants.join(",")}-${ZH_MULTIPLIERS[locants.length]}${ending}`;
}

function formatCombinedSubstituents(
  substituents: Substituent[],
  amideSubstituents: AmideNSubstituent[],
  language: "zh" | "en",
  parentLength: number,
  omitAllLocants = false,
): string {
  const tokens: Array<{ sortKey: string; zh: string; en: string }> = [];
  const grouped = new Map<string, Substituent[]>();
  for (const substituent of substituents) {
    const values = grouped.get(substituent.key) ?? [];
    values.push(substituent);
    grouped.set(substituent.key, values);
  }
  for (const group of grouped.values()) {
    const locants = group.map((item) => item.locant).sort((a, b) => a - b);
    const omitLocant = omitAllLocants || (parentLength === 1 && locants.every((locant) => locant === 1));
    const locantPrefix = omitLocant ? "" : `${locants.join(",")}-`;
    tokens.push({
      sortKey: group[0].nameEn,
      zh: `${locantPrefix}${ZH_MULTIPLIERS[group.length]}${group[0].nameZh}`,
      en: `${locantPrefix}${EN_MULTIPLIERS[group.length]}${group[0].nameEn}`,
    });
  }

  const groupedAmide = new Map<string, AmideNSubstituent[]>();
  for (const substituent of amideSubstituents) {
    const values = groupedAmide.get(substituent.nameEn) ?? [];
    values.push(substituent);
    groupedAmide.set(substituent.nameEn, values);
  }
  for (const group of groupedAmide.values()) {
    const first = group[0];
    if (group.length === 2) {
      tokens.push({
        sortKey: first.nameEn,
        zh: first.isComplex ? `N,N-双(${first.nameZh})` : `N,N-二${first.nameZh}`,
        en: first.isComplex ? `N,N-bis(${first.nameEn})` : `N,N-di${first.nameEn}`,
      });
      continue;
    }
    tokens.push({
      sortKey: first.nameEn,
      zh: first.isComplex ? `N-(${first.nameZh})` : `N-${first.nameZh}`,
      en: first.isComplex ? `N-(${first.nameEn})` : `N-${first.nameEn}`,
    });
  }

  return tokens
    .sort((first, second) => first.sortKey.localeCompare(second.sortKey))
    .map((token) => token[language])
    .join("-");
}

function functionalPrefix(kind: FunctionalKind): Pick<Substituent, "nameZh" | "nameEn"> | undefined {
  if (kind === "aldehyde" || kind === "ketone") return { nameZh: "氧代", nameEn: "oxo" };
  if (kind === "alcohol") return { nameZh: "羟基", nameEn: "hydroxy" };
  if (kind === "amine") return { nameZh: "氨基", nameEn: "amino" };
  return undefined;
}

function categoryFor(
  principalKind: FunctionalKind | undefined,
  doubleLocants: number[],
  tripleLocants: number[],
  substituents: Substituent[],
): string {
  if (principalKind === "acid") return "羧酸";
  if (principalKind === "amide") return "酰胺";
  if (principalKind === "aldehyde") return "醛";
  if (principalKind === "ketone") return "酮";
  if (principalKind === "alcohol") return "醇";
  if (principalKind === "amine") return "胺";
  if (doubleLocants.length > 0 && tripleLocants.length > 0) return "烯炔";
  if (doubleLocants.length > 0) return "烯烃";
  if (tripleLocants.length > 0) return "炔烃";
  if (substituents.some((substituent) => ["F", "Cl", "Br", "I"].includes(substituent.key))) return "卤代烃";
  return "烷烃";
}

function generated(
  nameZh: string,
  nameEn: string,
  categoryZh: string,
  method: "substitutive" | "skeletal-replacement",
  teachingAlias?: TeachingAlias,
): Extract<OrganicSystematicNameResult, { status: "generated" }> {
  return {
    status: "generated",
    nameZh,
    nameEn,
    categoryZh,
    method,
    noteZh: "依据当前原子连接关系和本地基础规则生成；不包含 E/Z、R/S 等立体化学信息。",
    ...(teachingAlias ? { teachingAlias } : {}),
  };
}

function hydrogenCount(graph: BuilderGraph, atomId: string): number {
  return (graph.fullNeighbors.get(atomId) ?? []).filter((neighbor) => neighbor.atom.element === "H").length;
}

function collectCarbonComponent(graph: BuilderGraph, startId: string, blockedId: string): Set<string> {
  const component = new Set<string>();
  const queue = [startId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (component.has(current)) continue;
    component.add(current);
    for (const neighbor of graph.heavyNeighbors.get(current) ?? []) {
      if (neighbor.atom.id !== blockedId && neighbor.atom.element === "C") queue.push(neighbor.atom.id);
    }
  }
  return component;
}

function collectBranch(
  graph: BuilderGraph,
  startId: string,
  parentId: string,
  pathSet: Set<string>,
): Set<string> | undefined {
  const branch = new Set<string>();
  const queue: Array<[string, string]> = [[startId, parentId]];
  while (queue.length > 0) {
    const [current, previous] = queue.shift()!;
    if (pathSet.has(current)) return undefined;
    if (branch.has(current)) continue;
    branch.add(current);
    for (const neighbor of graph.heavyNeighbors.get(current) ?? []) {
      if (neighbor.atom.element !== "C" || neighbor.atom.id === previous) continue;
      queue.push([neighbor.atom.id, current]);
    }
  }
  return branch;
}

function isSimpleAlkylBranch(graph: BuilderGraph, branch: Set<string>, parentId: string): boolean {
  for (const id of branch) {
    const heavyNeighbors = graph.heavyNeighbors.get(id) ?? [];
    if (heavyNeighbors.some((neighbor) => neighbor.atom.element !== "C")) return false;
    if (heavyNeighbors.some((neighbor) => neighbor.atom.element === "C" && neighbor.order !== 1)) return false;
    const branchDegree = heavyNeighbors.filter((neighbor) => branch.has(neighbor.atom.id)).length;
    if (branchDegree > 2) return false;
  }
  const attachmentCount = [...branch].reduce(
    (count, id) => count + (graph.heavyNeighbors.get(id) ?? []).filter((neighbor) => neighbor.atom.id === parentId).length,
    0,
  );
  const attachmentAtom = [...branch].find((id) =>
    (graph.heavyNeighbors.get(id) ?? []).some((neighbor) => neighbor.atom.id === parentId),
  );
  return attachmentCount === 1
    && Boolean(attachmentAtom)
    && carbonNeighborsWithin(graph, attachmentAtom!, branch).length <= 1;
}

function isLinearSaturatedCarbonComponent(graph: BuilderGraph, component: Set<string>): boolean {
  for (const id of component) {
    const carbonNeighbors = carbonNeighborsWithin(graph, id, component);
    if (carbonNeighbors.length > 2 || carbonNeighbors.some((neighbor) => neighbor.order !== 1)) return false;
    const unexpected = (graph.heavyNeighbors.get(id) ?? []).some((neighbor) =>
      neighbor.atom.element !== "C" && neighbor.atom.element !== "O",
    );
    if (unexpected) return false;
  }
  return true;
}

function carbonNeighborsWithin(graph: BuilderGraph, atomId: string, allowed: Set<string>): GraphNeighbor[] {
  return (graph.heavyNeighbors.get(atomId) ?? []).filter((neighbor) =>
    neighbor.atom.element === "C" && allowed.has(neighbor.atom.id),
  );
}

function isCarbonSkeletonConnected(graph: BuilderGraph, carbonSet: Set<string>): boolean {
  const first = [...carbonSet][0];
  if (!first) return false;
  const visited = new Set<string>();
  const queue = [first];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    queue.push(...carbonNeighborsWithin(graph, current, carbonSet).map((neighbor) => neighbor.atom.id));
  }
  return visited.size === carbonSet.size;
}

function enumerateCarbonPaths(graph: BuilderGraph, carbonSet: Set<string>): string[][] {
  const ids = [...carbonSet];
  const paths: string[][] = [];
  for (let firstIndex = 0; firstIndex < ids.length; firstIndex += 1) {
    for (let secondIndex = firstIndex; secondIndex < ids.length; secondIndex += 1) {
      const path = findPath(graph, ids[firstIndex], ids[secondIndex], carbonSet, true);
      if (path) paths.push(path);
    }
  }
  return paths;
}

function findPath(
  graph: BuilderGraph,
  startId: string,
  endId: string,
  allowed: Set<string>,
  carbonOnly = false,
): string[] | undefined {
  const queue = [startId];
  const previous = new Map<string, string | undefined>([[startId, undefined]]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === endId) break;
    for (const neighbor of graph.heavyNeighbors.get(current) ?? []) {
      if (!allowed.has(neighbor.atom.id) || previous.has(neighbor.atom.id)) continue;
      if (carbonOnly && neighbor.atom.element !== "C") continue;
      previous.set(neighbor.atom.id, current);
      queue.push(neighbor.atom.id);
    }
  }
  if (!previous.has(endId)) return undefined;
  const path: string[] = [];
  let current: string | undefined = endId;
  while (current) {
    path.push(current);
    current = previous.get(current);
  }
  return path.reverse();
}

function bondLocants(
  graph: BuilderGraph,
  path: string[],
  order: BuilderBondOrder,
  element?: BuilderElement,
): number[] {
  const locants: number[] = [];
  for (let index = 0; index < path.length - 1; index += 1) {
    const firstId = path[index];
    const secondId = path[index + 1];
    const neighbor = (graph.heavyNeighbors.get(firstId) ?? []).find((candidate) => candidate.atom.id === secondId);
    const first = graph.atomsById.get(firstId);
    const second = graph.atomsById.get(secondId);
    if (neighbor?.order === order && (!element || (first?.element === element && second?.element === element))) {
      locants.push(index + 1);
    }
  }
  return locants;
}

function elementLocants(graph: BuilderGraph, path: string[], element: BuilderElement): number[] {
  return path
    .map((id, index) => graph.atomsById.get(id)?.element === element ? index + 1 : undefined)
    .filter((locant): locant is number => locant !== undefined);
}

function compareNumberArrays(first: number[], second: number[]): number {
  const length = Math.max(first.length, second.length);
  for (let index = 0; index < length; index += 1) {
    const firstValue = first[index] ?? 99;
    const secondValue = second[index] ?? 99;
    if (firstValue !== secondValue) return firstValue - secondValue;
  }
  return 0;
}

function trimTerminalE(value: string): string {
  return value.endsWith("e") ? value.slice(0, -1) : value;
}
