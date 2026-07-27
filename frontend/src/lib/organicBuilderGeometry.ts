import {
  validateBuilderMolecule,
} from "@/lib/organicBuilderChemistry";
import type {
  BuilderAtom,
  BuilderBond,
  BuilderBondAngleMatch,
  BuilderElement,
  BuilderMolecule,
} from "@/types/organicBuilder";

type AdjacentAtom = {
  atom: BuilderAtom;
  bond: BuilderBond;
};

type LocalGeometryRule = Pick<
  BuilderBondAngleMatch,
  "valueDeg" | "label" | "geometryZh" | "hybridization" | "descriptionZh"
>;

export function matchBuilderBondAngles(molecule: BuilderMolecule): BuilderBondAngleMatch[] {
  if (!validateBuilderMolecule(molecule).isComplete) return [];

  const atomsById = new Map(molecule.atoms.map((atom) => [atom.id, atom]));
  const adjacency = new Map(molecule.atoms.map((atom) => [atom.id, [] as AdjacentAtom[]]));
  for (const bond of molecule.bonds) {
    const first = atomsById.get(bond.atomIds[0]);
    const second = atomsById.get(bond.atomIds[1]);
    if (!first || !second) continue;
    adjacency.get(first.id)?.push({ atom: second, bond });
    adjacency.get(second.id)?.push({ atom: first, bond });
  }

  return molecule.atoms.flatMap((center) => {
    if (center.element === "H") return [];
    const neighbors = adjacency.get(center.id) ?? [];
    if (neighbors.length < 2) return [];
    const rule = matchLocalGeometry(center, neighbors, adjacency);
    const pair = chooseRepresentativeNeighborPair(neighbors);
    if (!rule || !pair) return [];
    // 三/四元小环内的真实夹角（约 60°/90°）与杂化典型值差距过大：
    // 宁可不标注，也不能在 60° 的弧上写"≈109.5°"自相矛盾。
    if (isTightRingPair(pair, adjacency, center.id)) return [];
    return [{
      id: `builder-angle-${pair[0].atom.id}-${center.id}-${pair[1].atom.id}`,
      atomIds: [pair[0].atom.id, center.id, pair[1].atom.id],
      centerAtomId: center.id,
      centerElement: center.element,
      ...rule,
    }];
  });
}

// pair 两原子直接成键（三元环）或共享除中心外的邻居（四元环）时视为小环代表角。
function isTightRingPair(
  pair: [AdjacentAtom, AdjacentAtom],
  adjacency: Map<string, AdjacentAtom[]>,
  centerId: string,
): boolean {
  const [first, second] = pair;
  const firstNeighbors = adjacency.get(first.atom.id) ?? [];
  if (firstNeighbors.some((neighbor) => neighbor.atom.id === second.atom.id)) return true;
  const secondNeighborIds = new Set(
    (adjacency.get(second.atom.id) ?? []).map((neighbor) => neighbor.atom.id),
  );
  return firstNeighbors.some((neighbor) =>
    neighbor.atom.id !== centerId && secondNeighborIds.has(neighbor.atom.id),
  );
}

function matchLocalGeometry(
  center: BuilderAtom,
  neighbors: AdjacentAtom[],
  adjacency: Map<string, AdjacentAtom[]>,
): LocalGeometryRule | undefined {
  const centerElement: BuilderElement = center.element;
  const bondOrders = neighbors.map((neighbor) => neighbor.bond.order);
  const hasTripleBond = bondOrders.includes(3);
  const doubleBondCount = bondOrders.filter((order) => order === 2).length;

  if (centerElement === "C") {
    if (neighbors.length === 2 && (hasTripleBond || doubleBondCount === 2)) {
      return {
        valueDeg: 180,
        label: "180°",
        geometryZh: "直线形",
        hybridization: "sp",
        descriptionZh: "中心碳有两个电子域，按 sp 直线形匹配 180°。",
      };
    }
    if (doubleBondCount > 0 && neighbors.length === 3) {
      return {
        valueDeg: 120,
        label: "≈120°",
        geometryZh: "平面三角形",
        hybridization: "sp²",
        descriptionZh: "中心碳含双键并形成三个电子域，按 sp² 平面三角形匹配约 120°。",
      };
    }
    if (neighbors.length === 4 && bondOrders.every((order) => order === 1)) {
      return {
        valueDeg: 109.5,
        label: "≈109.5°",
        geometryZh: "四面体",
        hybridization: "sp³",
        descriptionZh: "中心碳形成四个单键，按 sp³ 四面体匹配约 109.5°。",
      };
    }
  }

  if (centerElement === "N") {
    if (doubleBondCount > 0 && neighbors.length === 2) {
      return {
        valueDeg: 120,
        label: "≈120°",
        geometryZh: "平面型氮中心",
        hybridization: "sp²",
        descriptionZh: "中心氮含双键，按 sp² 局部平面结构匹配约 120°。",
      };
    }
    if (neighbors.length === 3 && bondOrders.every((order) => order === 1)) {
      const isAmideNitrogen = neighbors.some((neighbor) =>
        neighbor.atom.element === "C"
        && (adjacency.get(neighbor.atom.id) ?? []).some((secondNeighbor) =>
          secondNeighbor.atom.element === "O" && secondNeighbor.bond.order === 2,
        ),
      );
      if (isAmideNitrogen) {
        return {
          valueDeg: 120,
          label: "≈120°",
          geometryZh: "平面型酰胺氮",
          hybridization: "sp²",
          descriptionZh: "酰胺氮的孤电子对与羰基共轭，局部按 sp² 近似平面结构匹配约 120°。",
        };
      }
      // 直连不饱和碳（苯环、C=C）的氮因共轭明显平面化（如苯胺 H–N–H ≈113°），
      // 既不是 107° 也不是 120°：宁可不标注，避免给出错误教学值。
      const isConjugatedNitrogen = neighbors.some((neighbor) =>
        neighbor.atom.element === "C"
        && neighbor.bond.order === 1
        && (adjacency.get(neighbor.atom.id) ?? []).some((secondNeighbor) =>
          secondNeighbor.atom.element === "C" && secondNeighbor.bond.order === 2,
        ),
      );
      if (isConjugatedNitrogen) return undefined;
      return {
        valueDeg: 107,
        label: "≈107°",
        geometryZh: "三角锥形",
        hybridization: "sp³",
        descriptionZh: "中心氮有一对孤电子对，典型键角由 109.5° 压缩到约 107°。",
      };
    }
  }

  if (
    centerElement === "O"
    && neighbors.length === 2
    && bondOrders.every((order) => order === 1)
  ) {
    const isWaterCenter = neighbors.every((neighbor) => neighbor.atom.element === "H");
    return isWaterCenter
      ? {
          valueDeg: 104.5,
          label: "≈104.5°",
          geometryZh: "V 形",
          hybridization: "sp³",
          descriptionZh: "水分子中的氧有两对孤电子对，H–O–H 典型键角约 104.5°。",
        }
      : {
          valueDeg: 109.5,
          label: "≈109.5°",
          geometryZh: "折线形",
          hybridization: "sp³",
          descriptionZh: "单键氧（醇、醚、羧基中的 –O– 等）按 sp³ 电子域给出约 109.5° 的基础教学近似值。",
        };
  }

  return undefined;
}

function chooseRepresentativeNeighborPair(neighbors: AdjacentAtom[]): [AdjacentAtom, AdjacentAtom] | undefined {
  const pairs: Array<[AdjacentAtom, AdjacentAtom]> = [];
  for (let firstIndex = 0; firstIndex < neighbors.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < neighbors.length; secondIndex += 1) {
      pairs.push([neighbors[firstIndex], neighbors[secondIndex]]);
    }
  }
  return pairs.sort(compareNeighborPairs)[0];
}

function compareNeighborPairs(
  first: [AdjacentAtom, AdjacentAtom],
  second: [AdjacentAtom, AdjacentAtom],
): number {
  const firstScore = neighborPairScore(first);
  const secondScore = neighborPairScore(second);
  for (let index = 0; index < firstScore.length; index += 1) {
    if (firstScore[index] !== secondScore[index]) return firstScore[index] - secondScore[index];
  }
  const firstKey = first.map((neighbor) => `${neighbor.atom.element}-${neighbor.atom.id}`).sort().join("|");
  const secondKey = second.map((neighbor) => `${neighbor.atom.element}-${neighbor.atom.id}`).sort().join("|");
  return firstKey.localeCompare(secondKey);
}

function neighborPairScore(pair: [AdjacentAtom, AdjacentAtom]): number[] {
  const heavyAtomCount = pair.filter((neighbor) => neighbor.atom.element !== "H").length;
  const carbonCount = pair.filter((neighbor) => neighbor.atom.element === "C").length;
  const bondOrderSum = pair.reduce((sum, neighbor) => sum + neighbor.bond.order, 0);
  return [-heavyAtomCount, -carbonCount, -bondOrderSum];
}
