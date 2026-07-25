import { expect, test } from "@playwright/test";
import {
  autoFillHydrogens,
  cloneBuilderMolecule,
  findKnownMolecule,
  getFormula,
  knownOrganicMolecules,
} from "../../src/lib/organicBuilderChemistry";
import { generateOrganicSystematicName } from "../../src/lib/organicBuilderNomenclature";
import type {
  BuilderBondOrder,
  BuilderElement,
  BuilderMolecule,
} from "../../src/types/organicBuilder";

const expectedKnownNamesZh: Record<string, string> = {
  benzene: "苯",
  "dimethyl-ether": "二甲醚",
  ethanal: "乙醛",
  ethane: "乙烷",
  "ethanoic-acid": "乙酸",
  ethene: "乙烯",
  ethanol: "乙醇",
  ethylamine: "乙胺",
  ethyne: "乙炔",
  methanal: "甲醛",
  methane: "甲烷",
  "methanoic-acid": "甲酸",
  methanol: "甲醇",
  methylamine: "甲胺",
  propane: "丙烷",
  propene: "丙烯",
  propyne: "丙炔",
};

test("中文名期望表与已知分子词典 ID 一一对应", () => {
  expect(Object.keys(expectedKnownNamesZh).sort()).toEqual(
    knownOrganicMolecules.map((candidate) => candidate.id).sort(),
  );
});

for (const candidate of knownOrganicMolecules) {
  test(`全量词典精确识别：${candidate.id}`, () => {
    const expectedNameZh = expectedKnownNamesZh[candidate.id];
    expect(candidate.nameZh).toBe(expectedNameZh);
    expect(findKnownMolecule(cloneBuilderMolecule(candidate.molecule))).toMatchObject({
      id: candidate.id,
      nameZh: expectedNameZh,
    });
  });
}

test("词典数组重排不改变任何已知结构的识别结果", () => {
  const originalOrder = [...knownOrganicMolecules];
  knownOrganicMolecules.reverse();
  try {
    for (const candidate of originalOrder) {
      expectKnownIdentity(candidate.molecule, candidate.id);
    }
  } finally {
    knownOrganicMolecules.splice(0, knownOrganicMolecules.length, ...originalOrder);
  }
});

test("原子与化学键数组重排不改变全量词典识别结果", () => {
  for (const candidate of knownOrganicMolecules) {
    const reordered = cloneBuilderMolecule(candidate.molecule);
    reordered.atoms.reverse();
    reordered.bonds.reverse();
    expectKnownIdentity(reordered, candidate.id);
  }
});

test("原子和化学键 ID 改名不改变全量词典识别结果", () => {
  for (const candidate of knownOrganicMolecules) {
    const renamed = renameGraphIds(candidate.molecule);
    expectKnownIdentity(renamed, candidate.id);
  }
});

test("空间坐标变化不改变全量词典识别结果", () => {
  for (const candidate of knownOrganicMolecules) {
    const moved = cloneBuilderMolecule(candidate.molecule);
    moved.atoms = moved.atoms.map((atom, index) => ({
      ...atom,
      position: [index * 7 + 0.25, index * -3 - 0.5, index + 1.75],
    }));
    expectKnownIdentity(moved, candidate.id);
  }
});

test("化学键端点顺序反转不改变全量词典识别结果", () => {
  for (const candidate of knownOrganicMolecules) {
    const reversedEndpoints = cloneBuilderMolecule(candidate.molecule);
    reversedEndpoints.bonds = reversedEndpoints.bonds.map((bond) => ({
      ...bond,
      atomIds: [bond.atomIds[1], bond.atomIds[0]],
    }));
    expectKnownIdentity(reversedEndpoints, candidate.id);
  }
});

test("同分异构的丙炔与丙二烯按连接和键级区分", () => {
  const propyne = knownOrganicMolecules.find((candidate) => candidate.id === "propyne")!;
  const propadiene = completeHeavySkeleton(
    "propadiene",
    ["C", "C", "C"],
    [[0, 1, 2], [1, 2, 2]],
  );

  expect(getFormula(propyne.molecule)).toBe("C3H4");
  expect(getFormula(propadiene)).toBe("C3H4");
  expectKnownIdentity(propyne.molecule, "propyne");
  expect(findKnownMolecule(propadiene)).toBeUndefined();
  expect(generateOrganicSystematicName(propadiene)).toMatchObject({
    status: "generated",
    nameZh: "丙-1,2-二烯",
  });
});

test("多键位次优先于支链位次决定编号方向", () => {
  const methylhexene = completeHeavySkeleton(
    "4-methylhex-2-ene",
    ["C", "C", "C", "C", "C", "C", "C"],
    [[0, 1, 1], [1, 2, 2], [2, 3, 1], [3, 4, 1], [4, 5, 1], [3, 6, 1]],
  );

  expect(generateOrganicSystematicName(methylhexene)).toMatchObject({
    status: "generated",
    nameZh: "4-甲基己-2-烯",
  });
});

test("羧酸优先于羟基作为主官能团", () => {
  const hydroxybutanoicAcid = completeHeavySkeleton(
    "3-hydroxybutanoic-acid",
    ["C", "C", "C", "C", "O", "O", "O"],
    [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 4, 2], [0, 5, 1], [2, 6, 1]],
  );

  expect(generateOrganicSystematicName(hydroxybutanoicAcid)).toMatchObject({
    status: "generated",
    nameZh: "3-羟基丁酸",
  });
});

test("不对称简单醚选择较长碳链作为母体", () => {
  const methoxyethane = completeHeavySkeleton(
    "methoxyethane",
    ["C", "O", "C", "C"],
    [[0, 1, 1], [1, 2, 1], [2, 3, 1]],
  );

  expect(generateOrganicSystematicName(methoxyethane)).toMatchObject({
    status: "generated",
    nameZh: "甲氧基乙烷",
  });
});

test("卤素取代基从较近一端取得最低位次", () => {
  const bromobutane = completeHeavySkeleton(
    "2-bromobutane",
    ["C", "C", "C", "C", "Br"],
    [[0, 1, 1], [1, 2, 1], [2, 3, 1], [1, 4, 1]],
  );

  expect(generateOrganicSystematicName(bromobutane)).toMatchObject({
    status: "generated",
    nameZh: "2-溴丁烷",
  });
});

function expectKnownIdentity(molecule: BuilderMolecule, expectedId: string): void {
  expect(findKnownMolecule(molecule)).toMatchObject({
    id: expectedId,
    nameZh: expectedKnownNamesZh[expectedId],
  });
}

function renameGraphIds(molecule: BuilderMolecule): BuilderMolecule {
  const renamedIds = new Map(
    molecule.atoms.map((atom, index) => [atom.id, `renamed-atom-${index}`]),
  );
  return {
    ...cloneBuilderMolecule(molecule),
    id: `${molecule.id}-renamed`,
    atoms: molecule.atoms.map((atom) => ({
      ...atom,
      id: renamedIds.get(atom.id)!,
      position: [...atom.position],
    })),
    bonds: molecule.bonds.map((bond, index) => ({
      ...bond,
      id: `renamed-bond-${index}`,
      atomIds: [renamedIds.get(bond.atomIds[0])!, renamedIds.get(bond.atomIds[1])!],
    })),
  };
}

function completeHeavySkeleton(
  id: string,
  elements: BuilderElement[],
  bonds: Array<[number, number, BuilderBondOrder]>,
): BuilderMolecule {
  return autoFillHydrogens({
    id,
    atoms: elements.map((element, index) => ({
      id: `a${index}`,
      element,
      position: [index * 1.1, 0, 0],
    })),
    bonds: bonds.map(([first, second, order], index) => ({
      id: `b${index}`,
      atomIds: [`a${first}`, `a${second}`],
      order,
    })),
  });
}
