import { expect, test } from "@playwright/test";
import { ethyleneBuilderSeed } from "../../src/data/organicBuilderSeeds";
import { builderHistoryReducer, createBuilderHistory } from "../../src/hooks/useOrganicBuilder";
import {
  autoFillHydrogens,
  canSetBond,
  cloneBuilderMolecule,
  detectFunctionalGroups,
  findKnownMolecule,
  getFormula,
  getRelativeMolecularMass,
  knownOrganicMolecules,
  validateBuilderMolecule,
} from "../../src/lib/organicBuilderChemistry";
import { matchBuilderBondAngles } from "../../src/lib/organicBuilderGeometry";
import { generateOrganicSystematicName } from "../../src/lib/organicBuilderNomenclature";
import type {
  BuilderBondOrder,
  BuilderElement,
  BuilderMolecule,
} from "../../src/types/organicBuilder";

test("乙烯种子满足价态并能被精确识别", () => {
  const validation = validateBuilderMolecule(ethyleneBuilderSeed);
  expect(validation.isComplete).toBe(true);
  expect(getFormula(ethyleneBuilderSeed)).toBe("C2H4");
  expect(getRelativeMolecularMass(ethyleneBuilderSeed)).toBeCloseTo(28.054, 3);
  expect(findKnownMolecule(ethyleneBuilderSeed)?.nameZh).toBe("乙烯");
  expect(detectFunctionalGroups(ethyleneBuilderSeed)).toContain("碳碳双键");
});

test("一键补氢把游离碳补成甲烷", () => {
  const carbon: BuilderMolecule = {
    id: "carbon",
    atoms: [{ id: "c", element: "C", position: [0, 0, 0] }],
    bonds: [],
  };
  const methane = autoFillHydrogens(carbon);
  expect(getFormula(methane)).toBe("CH4");
  expect(validateBuilderMolecule(methane).isComplete).toBe(true);
  expect(findKnownMolecule(methane)?.nameZh).toBe("甲烷");
});

test("中性碳的第五个键被阻止但欠价中间态允许保留", () => {
  const methane = cloneBuilderMolecule(knownOrganicMolecules.find((candidate) => candidate.id === "methane")!.molecule);
  methane.atoms.push({ id: "extra-h", element: "H", position: [2, 0, 0] });
  const carbonId = methane.atoms.find((candidate) => candidate.element === "C")!.id;
  const result = canSetBond(methane, carbonId, "extra-h", 1);
  expect(result.ok).toBe(false);

  const incomplete: BuilderMolecule = {
    id: "incomplete",
    atoms: [{ id: "c", element: "C", position: [0, 0, 0] }],
    bonds: [],
  };
  expect(validateBuilderMolecule(incomplete).issues[0]?.kind).toBe("under-valence");
});

test("同分异构体按连接关系区分乙醇和二甲醚", () => {
  const ethanol = knownOrganicMolecules.find((candidate) => candidate.id === "ethanol")!.molecule;
  const ether = knownOrganicMolecules.find((candidate) => candidate.id === "dimethyl-ether")!.molecule;
  expect(getFormula(ethanol)).toBe("C2H6O");
  expect(getFormula(ether)).toBe("C2H6O");
  expect(findKnownMolecule(ethanol)?.nameZh).toBe("乙醇");
  expect(findKnownMolecule(ether)?.nameZh).toBe("二甲醚");
});

test("拔下原子、撤销和重做保持完整历史", () => {
  let state = createBuilderHistory(ethyleneBuilderSeed, "h1");
  expect(state.present.bonds.some((candidate) => candidate.atomIds.includes("h1"))).toBe(false);
  expect(state.past).toHaveLength(1);

  state = builderHistoryReducer(state, { type: "undo" });
  expect(state.present.bonds.some((candidate) => candidate.atomIds.includes("h1"))).toBe(true);

  state = builderHistoryReducer(state, { type: "redo" });
  expect(state.present.bonds.some((candidate) => candidate.atomIds.includes("h1"))).toBe(false);
});

test("卤素和官能团规则进入同一价态体系", () => {
  const chloromethane: BuilderMolecule = {
    id: "chloromethane",
    atoms: [
      { id: "c", element: "C", position: [0, 0, 0] },
      { id: "cl", element: "Cl", position: [1.2, 0, 0] },
    ],
    bonds: [{ id: "c-cl", atomIds: ["c", "cl"], order: 1 }],
  };
  const completed = autoFillHydrogens(chloromethane);
  expect(getFormula(completed)).toBe("CH3Cl");
  expect(validateBuilderMolecule(completed).isComplete).toBe(true);
  expect(detectFunctionalGroups(completed)).toContain("卤代结构");
});

test("结构完成后按局部成键环境自动匹配典型键角", () => {
  const methane = autoFillHydrogens({
    id: "angle-methane",
    atoms: [{ id: "c", element: "C", position: [0, 0, 0] }],
    bonds: [],
  });
  const ammonia = autoFillHydrogens({
    id: "angle-ammonia",
    atoms: [{ id: "n", element: "N", position: [0, 0, 0] }],
    bonds: [],
  });
  const water = autoFillHydrogens({
    id: "angle-water",
    atoms: [{ id: "o", element: "O", position: [0, 0, 0] }],
    bonds: [],
  });
  const ethyne = knownOrganicMolecules.find((candidate) => candidate.id === "ethyne")!.molecule;
  const dimethylEther = knownOrganicMolecules.find((candidate) => candidate.id === "dimethyl-ether")!.molecule;

  expect(matchBuilderBondAngles(methane)).toEqual([
    expect.objectContaining({ centerAtomId: "c", geometryZh: "四面体", hybridization: "sp³", valueDeg: 109.5 }),
  ]);
  expect(matchBuilderBondAngles(ethyleneBuilderSeed)).toHaveLength(2);
  expect(matchBuilderBondAngles(ethyleneBuilderSeed)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ centerElement: "C", geometryZh: "平面三角形", hybridization: "sp²", valueDeg: 120 }),
    ]),
  );
  expect(matchBuilderBondAngles(ethyne)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ centerElement: "C", geometryZh: "直线形", hybridization: "sp", valueDeg: 180 }),
    ]),
  );
  expect(matchBuilderBondAngles(ammonia)).toEqual([
    expect.objectContaining({ centerAtomId: "n", geometryZh: "三角锥形", valueDeg: 107 }),
  ]);
  expect(matchBuilderBondAngles(water)).toEqual([
    expect.objectContaining({ centerAtomId: "o", geometryZh: "V 形", valueDeg: 104.5 }),
  ]);
  expect(matchBuilderBondAngles(dimethylEther)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ centerElement: "O", geometryZh: "折线形", hybridization: "sp³", valueDeg: 109.5 }),
    ]),
  );
  expect(matchBuilderBondAngles({
    id: "angle-incomplete",
    atoms: [{ id: "c", element: "C", position: [0, 0, 0] }],
    bonds: [],
  })).toEqual([]);
});

test("未收录的截图含氮链生成双语骨架替代名称", () => {
  const molecule = completeHeavySkeleton(
    "diazapentadiene",
    ["C", "N", "C", "N", "C"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 1], [3, 4, 2]],
  );
  expect(getFormula(molecule)).toBe("C3H6N2");
  expect(generateOrganicSystematicName(molecule)).toMatchObject({
    status: "generated",
    nameZh: "2,4-二氮杂戊-1,4-二烯",
    nameEn: "2,4-diazapenta-1,4-diene",
    method: "skeletal-replacement",
  });
});

test("本地规则覆盖简单支链、卤代物和醇", () => {
  const isobutane = completeHeavySkeleton(
    "isobutane",
    ["C", "C", "C", "C"],
    [[0, 1, 1], [0, 2, 1], [0, 3, 1]],
  );
  const chloropropane = completeHeavySkeleton(
    "chloropropane",
    ["C", "C", "C", "Cl"],
    [[0, 1, 1], [1, 2, 1], [0, 3, 1]],
  );
  const propan2ol = completeHeavySkeleton(
    "propan-2-ol",
    ["C", "C", "C", "O"],
    [[0, 1, 1], [1, 2, 1], [1, 3, 1]],
  );

  expect(generateOrganicSystematicName(isobutane)).toMatchObject({
    status: "generated",
    nameZh: "2-甲基丙烷",
    nameEn: "2-methylpropane",
  });
  expect(generateOrganicSystematicName(chloropropane)).toMatchObject({
    status: "generated",
    nameZh: "1-氯丙烷",
    nameEn: "1-chloropropane",
  });
  expect(generateOrganicSystematicName(propan2ol)).toMatchObject({
    status: "generated",
    nameZh: "丙-2-醇",
    nameEn: "propan-2-ol",
  });
});

test("本地规则覆盖 C10 母体、复数不饱和键及烯炔编号", () => {
  const decane = completeHeavySkeleton(
    "decane",
    Array.from({ length: 10 }, () => "C" as const),
    Array.from({ length: 9 }, (_, index) => [index, index + 1, 1] as [number, number, BuilderBondOrder]),
  );
  const hexa13diene = completeHeavySkeleton(
    "hexa-1-3-diene",
    ["C", "C", "C", "C", "C", "C"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 1]],
  );
  const hex1en5yne = completeHeavySkeleton(
    "hex-1-en-5-yne",
    ["C", "C", "C", "C", "C", "C"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 5, 3]],
  );
  const methylpent1ene = completeHeavySkeleton(
    "3-methylpent-1-ene",
    ["C", "C", "C", "C", "C", "C"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 1], [3, 4, 1], [2, 5, 1]],
  );

  expect(generateOrganicSystematicName(decane)).toMatchObject({
    status: "generated",
    nameZh: "癸烷",
    nameEn: "decane",
  });
  expect(generateOrganicSystematicName(hexa13diene)).toMatchObject({
    status: "generated",
    nameZh: "己-1,3-二烯",
    nameEn: "hexa-1,3-diene",
  });
  expect(generateOrganicSystematicName(hex1en5yne)).toMatchObject({
    status: "generated",
    nameZh: "己-1-烯-5-炔",
    nameEn: "hex-1-en-5-yne",
  });
  expect(generateOrganicSystematicName(methylpent1ene)).toMatchObject({
    status: "generated",
    nameZh: "3-甲基戊-1-烯",
    nameEn: "3-methylpent-1-ene",
  });
});

test("本地规则覆盖酮、羧酸、伯胺、多羟基和简单醚", () => {
  const butan2one = completeHeavySkeleton(
    "butan-2-one",
    ["C", "C", "C", "C", "O"],
    [[0, 1, 1], [1, 2, 1], [2, 3, 1], [1, 4, 2]],
  );
  const butanoicAcid = completeHeavySkeleton(
    "butanoic-acid",
    ["C", "C", "C", "C", "O", "O"],
    [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 4, 2], [0, 5, 1]],
  );
  const propan1amine = completeHeavySkeleton(
    "propan-1-amine",
    ["C", "C", "C", "N"],
    [[0, 1, 1], [1, 2, 1], [0, 3, 1]],
  );
  const ethane12diol = completeHeavySkeleton(
    "ethane-1-2-diol",
    ["C", "C", "O", "O"],
    [[0, 1, 1], [0, 2, 1], [1, 3, 1]],
  );
  const methoxypropane = completeHeavySkeleton(
    "methoxypropane",
    ["C", "O", "C", "C", "C"],
    [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1]],
  );
  const ethanedioicAcid = completeHeavySkeleton(
    "ethanedioic-acid",
    ["C", "C", "O", "O", "O", "O"],
    [[0, 1, 1], [0, 2, 2], [0, 3, 1], [1, 4, 2], [1, 5, 1]],
  );

  expect(generateOrganicSystematicName(butan2one)).toMatchObject({
    status: "generated",
    nameZh: "丁-2-酮",
    nameEn: "butan-2-one",
  });
  expect(generateOrganicSystematicName(butanoicAcid)).toMatchObject({
    status: "generated",
    nameZh: "丁酸",
    nameEn: "butanoic acid",
  });
  expect(generateOrganicSystematicName(propan1amine)).toMatchObject({
    status: "generated",
    nameZh: "丙-1-胺",
    nameEn: "propan-1-amine",
  });
  expect(generateOrganicSystematicName(ethane12diol)).toMatchObject({
    status: "generated",
    nameZh: "乙-1,2-二醇",
    nameEn: "ethane-1,2-diol",
  });
  expect(generateOrganicSystematicName(methoxypropane)).toMatchObject({
    status: "generated",
    nameZh: "1-甲氧基丙烷",
    nameEn: "1-methoxypropane",
  });
  expect(generateOrganicSystematicName(ethanedioicAcid)).toMatchObject({
    status: "generated",
    nameZh: "乙二酸",
    nameEn: "ethanedioic acid",
  });
});

test("本地规则覆盖伯仲叔酰胺、不饱和酰胺和截图结构", () => {
  const methanamide = completeHeavySkeleton(
    "methanamide",
    ["C", "O", "N"],
    [[0, 1, 2], [0, 2, 1]],
  );
  const ethanamide = completeHeavySkeleton(
    "ethanamide",
    ["C", "C", "O", "N"],
    [[0, 1, 1], [1, 2, 2], [1, 3, 1]],
  );
  const nMethylethanamide = completeHeavySkeleton(
    "n-methylethanamide",
    ["C", "C", "O", "N", "C"],
    [[0, 1, 1], [1, 2, 2], [1, 3, 1], [3, 4, 1]],
  );
  const nnDimethylethanamide = completeHeavySkeleton(
    "n-n-dimethylethanamide",
    ["C", "C", "O", "N", "C", "C"],
    [[0, 1, 1], [1, 2, 2], [1, 3, 1], [3, 4, 1], [3, 5, 1]],
  );
  const but2ynamide = completeHeavySkeleton(
    "but-2-ynamide",
    ["C", "C", "C", "C", "O", "N"],
    [[0, 1, 1], [1, 2, 3], [2, 3, 1], [0, 4, 2], [0, 5, 1]],
  );
  const screenshotAmide = completeHeavySkeleton(
    "screenshot-amide",
    ["C", "C", "C", "C", "N", "C", "O", "C", "C", "C"],
    [
      [0, 1, 2], [1, 2, 1], [2, 3, 3], [3, 4, 1],
      [4, 5, 1], [5, 6, 2], [5, 7, 1], [7, 8, 3], [8, 9, 1],
    ],
  );
  const chloroNMethylbutanamide = completeHeavySkeleton(
    "3-chloro-n-methylbutanamide",
    ["C", "C", "C", "C", "O", "N", "C", "Cl"],
    [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 4, 2], [0, 5, 1], [5, 6, 1], [2, 7, 1]],
  );
  const hydroxybutanamide = completeHeavySkeleton(
    "3-hydroxybutanamide",
    ["C", "C", "C", "C", "O", "N", "O"],
    [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 4, 2], [0, 5, 1], [2, 6, 1]],
  );

  expect(generateOrganicSystematicName(methanamide)).toMatchObject({
    status: "generated",
    nameZh: "甲酰胺",
    nameEn: "methanamide",
    categoryZh: "酰胺",
  });
  expect(generateOrganicSystematicName(ethanamide)).toMatchObject({
    status: "generated",
    nameZh: "乙酰胺",
    nameEn: "ethanamide",
  });
  expect(generateOrganicSystematicName(nMethylethanamide)).toMatchObject({
    status: "generated",
    nameZh: "N-甲基乙酰胺",
    nameEn: "N-methylethanamide",
  });
  expect(generateOrganicSystematicName(nnDimethylethanamide)).toMatchObject({
    status: "generated",
    nameZh: "N,N-二甲基乙酰胺",
    nameEn: "N,N-dimethylethanamide",
  });
  expect(generateOrganicSystematicName(but2ynamide)).toMatchObject({
    status: "generated",
    nameZh: "丁-2-炔酰胺",
    nameEn: "but-2-ynamide",
  });
  expect(getFormula(screenshotAmide)).toBe("C8H7NO");
  expect(generateOrganicSystematicName(screenshotAmide)).toMatchObject({
    status: "generated",
    nameZh: "N-(丁-3-烯-1-炔-1-基)丁-2-炔酰胺",
    nameEn: "N-(but-3-en-1-yn-1-yl)but-2-ynamide",
    categoryZh: "酰胺",
  });
  expect(generateOrganicSystematicName(chloroNMethylbutanamide)).toMatchObject({
    status: "generated",
    nameZh: "3-氯-N-甲基丁酰胺",
    nameEn: "3-chloro-N-methylbutanamide",
  });
  expect(generateOrganicSystematicName(hydroxybutanamide)).toMatchObject({
    status: "generated",
    nameZh: "3-羟基丁酰胺",
    nameEn: "3-hydroxybutanamide",
  });
  expect(detectFunctionalGroups(screenshotAmide)).toContain("酰胺基");
  expect(detectFunctionalGroups(screenshotAmide)).not.toContain("氨基/胺键片段");
  expect(matchBuilderBondAngles(screenshotAmide)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        centerElement: "N",
        geometryZh: "平面型酰胺氮",
        hybridization: "sp²",
        valueDeg: 120,
      }),
    ]),
  );

  const reordered: BuilderMolecule = {
    ...cloneBuilderMolecule(screenshotAmide),
    atoms: [...screenshotAmide.atoms].reverse(),
    bonds: [...screenshotAmide.bonds].reverse(),
  };
  expect(generateOrganicSystematicName(reordered)).toEqual(generateOrganicSystematicName(screenshotAmide));
});

test("酰亚胺、复杂 N-取代基、酯和酰卤返回具体超范围原因", () => {
  const imide = completeHeavySkeleton(
    "imide",
    ["C", "C", "O", "N", "C", "O", "C"],
    [[0, 1, 1], [1, 2, 2], [1, 3, 1], [3, 4, 1], [4, 5, 2], [4, 6, 1]],
  );
  const branchedNSubstituent = completeHeavySkeleton(
    "branched-n-substituent",
    ["C", "C", "O", "N", "C", "C", "C"],
    [[0, 1, 1], [1, 2, 2], [1, 3, 1], [3, 4, 1], [4, 5, 1], [4, 6, 1]],
  );
  const ester = completeHeavySkeleton(
    "ester",
    ["C", "C", "O", "O", "C"],
    [[0, 1, 1], [1, 2, 2], [1, 3, 1], [3, 4, 1]],
  );
  const acylChloride = completeHeavySkeleton(
    "acyl-chloride",
    ["C", "C", "O", "Cl"],
    [[0, 1, 1], [1, 2, 2], [1, 3, 1]],
  );

  expect(generateOrganicSystematicName(imide)).toMatchObject({
    status: "unsupported",
    reasonZh: expect.stringContaining("多酰胺和酰亚胺"),
  });
  expect(generateOrganicSystematicName(branchedNSubstituent)).toMatchObject({
    status: "unsupported",
    reasonZh: expect.stringContaining("端点"),
  });
  expect(generateOrganicSystematicName(ester)).toMatchObject({
    status: "unsupported",
    reasonZh: expect.stringContaining("酯、酸酐"),
  });
  expect(generateOrganicSystematicName(acylChloride)).toMatchObject({
    status: "unsupported",
    reasonZh: expect.stringContaining("酰卤"),
  });
});

test("主官能团优先级和同类多官能团后缀保持一致", () => {
  const oxobutanoicAcid = completeHeavySkeleton(
    "3-oxobutanoic-acid",
    ["C", "C", "C", "C", "O", "O", "O"],
    [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 4, 2], [0, 5, 1], [2, 6, 2]],
  );
  const aminopropanol = completeHeavySkeleton(
    "3-aminopropan-1-ol",
    ["C", "C", "C", "O", "N"],
    [[0, 1, 1], [1, 2, 1], [0, 3, 1], [2, 4, 1]],
  );
  const pentane24dione = completeHeavySkeleton(
    "pentane-2-4-dione",
    ["C", "C", "C", "C", "C", "O", "O"],
    [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [1, 5, 2], [3, 6, 2]],
  );
  const propane13diamine = completeHeavySkeleton(
    "propane-1-3-diamine",
    ["C", "C", "C", "N", "N"],
    [[0, 1, 1], [1, 2, 1], [0, 3, 1], [2, 4, 1]],
  );

  expect(generateOrganicSystematicName(oxobutanoicAcid)).toMatchObject({
    status: "generated",
    nameZh: "3-氧代丁酸",
    nameEn: "3-oxobutanoic acid",
  });
  expect(generateOrganicSystematicName(aminopropanol)).toMatchObject({
    status: "generated",
    nameZh: "3-氨基丙-1-醇",
    nameEn: "3-aminopropan-1-ol",
  });
  expect(generateOrganicSystematicName(pentane24dione)).toMatchObject({
    status: "generated",
    nameZh: "戊-2,4-二酮",
    nameEn: "pentane-2,4-dione",
  });
  expect(generateOrganicSystematicName(propane13diamine)).toMatchObject({
    status: "generated",
    nameZh: "丙-1,3-二胺",
    nameEn: "propane-1,3-diamine",
  });
});

test("母体选择优先保留主官能团而不是脱离官能团的最长路径", () => {
  const branchedAlcohol = completeHeavySkeleton(
    "branched-alcohol-parent",
    ["C", "C", "C", "C", "C", "C", "C", "C", "O"],
    [
      [0, 1, 1], [1, 2, 1], [2, 3, 1],
      [0, 4, 1], [4, 5, 1], [5, 6, 1],
      [0, 7, 1], [7, 8, 1],
    ],
  );

  expect(generateOrganicSystematicName(branchedAlcohol)).toMatchObject({
    status: "generated",
    nameZh: "2-丙基戊-1-醇",
    nameEn: "2-propylpentan-1-ol",
  });
});

test("本地规则覆盖 C3–C10 环烷烃及简单单取代环烷烃", () => {
  const cyclopropane = completeHeavySkeleton(
    "cyclopropane",
    ["C", "C", "C"],
    [[0, 1, 1], [1, 2, 1], [2, 0, 1]],
  );
  const methylcyclohexane = completeHeavySkeleton(
    "methylcyclohexane",
    ["C", "C", "C", "C", "C", "C", "C"],
    [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 5, 1], [5, 0, 1], [0, 6, 1]],
  );
  const chlorocyclobutane = completeHeavySkeleton(
    "chlorocyclobutane",
    ["C", "C", "C", "C", "Cl"],
    [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1], [0, 4, 1]],
  );

  expect(generateOrganicSystematicName(cyclopropane)).toMatchObject({
    status: "generated",
    nameZh: "环丙烷",
    nameEn: "cyclopropane",
  });
  expect(generateOrganicSystematicName(methylcyclohexane)).toMatchObject({
    status: "generated",
    nameZh: "甲基环己烷",
    nameEn: "methylcyclohexane",
  });
  expect(generateOrganicSystematicName(chlorocyclobutane)).toMatchObject({
    status: "generated",
    nameZh: "氯环丁烷",
    nameEn: "chlorocyclobutane",
  });
});

test("多取代环烷烃采用最低位次组并以字母序打破编号平局", () => {
  const dimethylcyclopropane = completeHeavySkeleton(
    "1-1-dimethylcyclopropane",
    ["C", "C", "C", "C", "C"],
    [[0, 1, 1], [1, 2, 1], [2, 0, 1], [0, 3, 1], [0, 4, 1]],
  );
  const bromochlorocyclopentane = completeHeavySkeleton(
    "1-bromo-3-chlorocyclopentane",
    ["C", "C", "C", "C", "C", "Cl", "Br"],
    [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 0, 1], [0, 5, 1], [2, 6, 1]],
  );
  const trimethylcyclohexane = completeHeavySkeleton(
    "1-2-4-trimethylcyclohexane",
    ["C", "C", "C", "C", "C", "C", "C", "C", "C"],
    [
      [0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 5, 1], [5, 0, 1],
      [0, 6, 1], [1, 7, 1], [3, 8, 1],
    ],
  );

  expect(generateOrganicSystematicName(dimethylcyclopropane)).toMatchObject({
    status: "generated",
    nameZh: "1,1-二甲基环丙烷",
    nameEn: "1,1-dimethylcyclopropane",
  });
  expect(generateOrganicSystematicName(bromochlorocyclopentane)).toMatchObject({
    status: "generated",
    nameZh: "1-溴-3-氯环戊烷",
    nameEn: "1-bromo-3-chlorocyclopentane",
  });
  expect(generateOrganicSystematicName(trimethylcyclohexane)).toMatchObject({
    status: "generated",
    nameZh: "1,2,4-三甲基环己烷",
    nameEn: "1,2,4-trimethylcyclohexane",
  });
});

test("本地规则覆盖常见单取代苯并保持苯的教学词典优先级", () => {
  const benzene = completeHeavySkeleton(
    "benzene-generated-fixture",
    ["C", "C", "C", "C", "C", "C"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1]],
  );
  const methylbenzene = completeHeavySkeleton(
    "methylbenzene",
    ["C", "C", "C", "C", "C", "C", "C"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1]],
  );
  const chlorobenzene = completeHeavySkeleton(
    "chlorobenzene",
    ["C", "C", "C", "C", "C", "C", "Cl"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1]],
  );
  const phenol = completeHeavySkeleton(
    "phenol",
    ["C", "C", "C", "C", "C", "C", "O"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1]],
  );
  const methoxybenzene = completeHeavySkeleton(
    "methoxybenzene",
    ["C", "C", "C", "C", "C", "C", "O", "C"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1], [6, 7, 1]],
  );
  const benzenamine = completeHeavySkeleton(
    "benzenamine",
    ["C", "C", "C", "C", "C", "C", "N"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1]],
  );
  const benzaldehyde = completeHeavySkeleton(
    "benzaldehyde",
    ["C", "C", "C", "C", "C", "C", "C", "O"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1], [6, 7, 2]],
  );
  const benzoicAcid = completeHeavySkeleton(
    "benzoic-acid",
    ["C", "C", "C", "C", "C", "C", "C", "O", "O"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1], [6, 7, 2], [6, 8, 1]],
  );

  expect(findKnownMolecule(benzene)?.nameZh).toBe("苯");
  expect(generateOrganicSystematicName(methylbenzene)).toMatchObject({ nameZh: "甲基苯", nameEn: "methylbenzene" });
  expect(generateOrganicSystematicName(chlorobenzene)).toMatchObject({ nameZh: "氯苯", nameEn: "chlorobenzene" });
  expect(generateOrganicSystematicName(phenol)).toMatchObject({ nameZh: "苯酚", nameEn: "phenol" });
  expect(generateOrganicSystematicName(methoxybenzene)).toMatchObject({ nameZh: "甲氧基苯", nameEn: "methoxybenzene" });
  expect(generateOrganicSystematicName(benzenamine)).toMatchObject({ nameZh: "苯胺", nameEn: "benzenamine" });
  expect(generateOrganicSystematicName(benzaldehyde)).toMatchObject({ nameZh: "苯甲醛", nameEn: "benzaldehyde" });
  expect(generateOrganicSystematicName(benzoicAcid)).toMatchObject({ nameZh: "苯甲酸", nameEn: "benzoic acid" });
});

test("二取代苯生成稳定编号及邻、间、对位教学别名", () => {
  const orthoDichlorobenzene = completeHeavySkeleton(
    "ortho-dichlorobenzene",
    ["C", "C", "C", "C", "C", "C", "Cl", "Cl"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1], [1, 7, 1]],
  );
  const metaDimethylbenzene = completeHeavySkeleton(
    "meta-dimethylbenzene",
    ["C", "C", "C", "C", "C", "C", "C", "C"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1], [2, 7, 1]],
  );
  const paraDimethoxybenzene = completeHeavySkeleton(
    "para-dimethoxybenzene",
    ["C", "C", "C", "C", "C", "C", "O", "C", "O", "C"],
    [
      [0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1],
      [0, 6, 1], [6, 7, 1], [3, 8, 1], [8, 9, 1],
    ],
  );

  expect(generateOrganicSystematicName(orthoDichlorobenzene)).toMatchObject({
    status: "generated",
    nameZh: "1,2-二氯苯",
    nameEn: "1,2-dichlorobenzene",
    teachingAlias: {
      descriptorZh: "邻位（1,2-）",
      descriptorEn: "ortho (o-)",
      nameZh: "邻二氯苯",
      nameEn: "o-dichlorobenzene",
    },
  });
  expect(generateOrganicSystematicName(metaDimethylbenzene)).toMatchObject({
    status: "generated",
    nameZh: "1,3-二甲基苯",
    nameEn: "1,3-dimethylbenzene",
    teachingAlias: {
      descriptorZh: "间位（1,3-）",
      descriptorEn: "meta (m-)",
      nameZh: "间二甲苯",
      nameEn: "m-xylene",
    },
  });
  expect(generateOrganicSystematicName(paraDimethoxybenzene)).toMatchObject({
    status: "generated",
    nameZh: "1,4-二甲氧基苯",
    nameEn: "1,4-dimethoxybenzene",
    teachingAlias: {
      descriptorZh: "对位（1,4-）",
      descriptorEn: "para (p-)",
      nameZh: "对二甲氧基苯",
      nameEn: "p-dimethoxybenzene",
    },
  });
});

test("混合二取代苯按前缀字母序编号，主官能团固定为 1 位", () => {
  const metaChloromethylbenzene = completeHeavySkeleton(
    "meta-chloromethylbenzene",
    ["C", "C", "C", "C", "C", "C", "C", "Cl"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1], [2, 7, 1]],
  );
  const orthoChlorophenol = completeHeavySkeleton(
    "ortho-chlorophenol",
    ["C", "C", "C", "C", "C", "C", "Cl", "O"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1], [1, 7, 1]],
  );
  const orthoBenzenediol = completeHeavySkeleton(
    "ortho-benzenediol",
    ["C", "C", "C", "C", "C", "C", "O", "O"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1], [1, 7, 1]],
  );

  expect(generateOrganicSystematicName(metaChloromethylbenzene)).toMatchObject({
    status: "generated",
    nameZh: "1-氯-3-甲基苯",
    nameEn: "1-chloro-3-methylbenzene",
    teachingAlias: {
      descriptorZh: "间位（1,3-）",
      descriptorEn: "meta (m-)",
    },
  });
  expect(generateOrganicSystematicName(orthoChlorophenol)).toMatchObject({
    status: "generated",
    nameZh: "2-氯苯酚",
    nameEn: "2-chlorophenol",
    teachingAlias: {
      descriptorZh: "邻位（1,2-）",
      nameZh: "邻氯苯酚",
      nameEn: "o-chlorophenol",
    },
  });
  expect(generateOrganicSystematicName(orthoBenzenediol)).toMatchObject({
    status: "generated",
    nameZh: "苯-1,2-二酚",
    nameEn: "benzene-1,2-diol",
    teachingAlias: {
      descriptorZh: "邻位（1,2-）",
      nameZh: "邻苯二酚",
      nameEn: "o-benzenediol",
    },
  });

  const reordered: BuilderMolecule = {
    ...cloneBuilderMolecule(metaChloromethylbenzene),
    atoms: [...metaChloromethylbenzene.atoms].reverse(),
    bonds: [...metaChloromethylbenzene.bonds].reverse(),
  };
  expect(generateOrganicSystematicName(reordered)).toEqual(generateOrganicSystematicName(metaChloromethylbenzene));
});

test("三至六取代苯采用最低位次组并保持主官能团优先", () => {
  const trichlorobenzene = completeHeavySkeleton(
    "trichlorobenzene",
    ["C", "C", "C", "C", "C", "C", "Cl", "Cl", "Cl"],
    [
      [0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1],
      [0, 6, 1], [2, 7, 1], [4, 8, 1],
    ],
  );
  const chlorodimethylphenol = completeHeavySkeleton(
    "chloro-dimethyl-phenol",
    ["C", "C", "C", "C", "C", "C", "O", "Cl", "C", "C"],
    [
      [0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1],
      [0, 6, 1], [1, 7, 1], [3, 8, 1], [4, 9, 1],
    ],
  );
  const benzene135triol = completeHeavySkeleton(
    "benzene-1-3-5-triol",
    ["C", "C", "C", "C", "C", "C", "O", "O", "O"],
    [
      [0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1],
      [0, 6, 1], [2, 7, 1], [4, 8, 1],
    ],
  );
  const hexachlorobenzene = completeHeavySkeleton(
    "hexachlorobenzene",
    ["C", "C", "C", "C", "C", "C", "Cl", "Cl", "Cl", "Cl", "Cl", "Cl"],
    [
      [0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1],
      [0, 6, 1], [1, 7, 1], [2, 8, 1], [3, 9, 1], [4, 10, 1], [5, 11, 1],
    ],
  );

  expect(generateOrganicSystematicName(trichlorobenzene)).toMatchObject({
    status: "generated",
    nameZh: "1,3,5-三氯苯",
    nameEn: "1,3,5-trichlorobenzene",
  });
  expect(generateOrganicSystematicName(chlorodimethylphenol)).toMatchObject({
    status: "generated",
    nameZh: "2-氯-4,5-二甲基苯酚",
    nameEn: "2-chloro-4,5-dimethylphenol",
  });
  expect(generateOrganicSystematicName(benzene135triol)).toMatchObject({
    status: "generated",
    nameZh: "苯-1,3,5-三酚",
    nameEn: "benzene-1,3,5-triol",
  });
  expect(generateOrganicSystematicName(hexachlorobenzene)).toMatchObject({
    status: "generated",
    nameZh: "1,2,3,4,5,6-六氯苯",
    nameEn: "1,2,3,4,5,6-hexachlorobenzene",
  });
});

test("系统名称不受原子与化学键数组顺序影响", () => {
  const original = completeHeavySkeleton(
    "order-invariant",
    ["C", "C", "C", "Cl"],
    [[0, 1, 1], [1, 2, 1], [0, 3, 1]],
  );
  const reordered: BuilderMolecule = {
    ...cloneBuilderMolecule(original),
    atoms: [...original.atoms].reverse(),
    bonds: [...original.bonds].reverse(),
  };
  expect(generateOrganicSystematicName(reordered)).toEqual(generateOrganicSystematicName(original));
});

test("未完成、多片段、环烯烃和复杂支链苯不会猜测系统名称", () => {
  const incomplete: BuilderMolecule = {
    id: "incomplete-name",
    atoms: [{ id: "c0", element: "C", position: [0, 0, 0] }],
    bonds: [],
  };
  const disconnected = autoFillHydrogens({
    id: "disconnected-name",
    atoms: [
      { id: "c0", element: "C", position: [0, 0, 0] },
      { id: "c1", element: "C", position: [2, 0, 0] },
    ],
    bonds: [],
  });
  const cyclobutene = completeHeavySkeleton(
    "cyclobutene",
    ["C", "C", "C", "C"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 1], [3, 0, 1]],
  );
  const isopropylbenzene = completeHeavySkeleton(
    "isopropylbenzene",
    ["C", "C", "C", "C", "C", "C", "C", "C", "C"],
    [
      [0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1],
      [0, 6, 1], [6, 7, 1], [6, 8, 1],
    ],
  );
  const butylcyclopropane = completeHeavySkeleton(
    "butylcyclopropane",
    ["C", "C", "C", "C", "C", "C", "C"],
    [[0, 1, 1], [1, 2, 1], [2, 0, 1], [0, 3, 1], [3, 4, 1], [4, 5, 1], [5, 6, 1]],
  );
  const undecane = completeHeavySkeleton(
    "undecane",
    Array.from({ length: 11 }, () => "C" as const),
    Array.from({ length: 10 }, (_, index) => [index, index + 1, 1] as [number, number, BuilderBondOrder]),
  );
  const dimethylamine = completeHeavySkeleton(
    "dimethylamine",
    ["C", "N", "C"],
    [[0, 1, 1], [1, 2, 1]],
  );

  expect(generateOrganicSystematicName(incomplete).status).toBe("not-ready");
  expect(generateOrganicSystematicName(disconnected).status).toBe("not-ready");
  expect(generateOrganicSystematicName(cyclobutene)).toMatchObject({
    status: "unsupported",
    reasonZh: expect.stringContaining("饱和单环烷烃"),
  });
  expect(generateOrganicSystematicName(isopropylbenzene)).toMatchObject({
    status: "unsupported",
    reasonZh: expect.stringContaining("取代基当前支持"),
  });
  expect(generateOrganicSystematicName(butylcyclopropane)).toMatchObject({
    status: "unsupported",
    reasonZh: expect.stringContaining("不长于母环"),
  });
  expect(generateOrganicSystematicName(undecane)).toMatchObject({
    status: "unsupported",
    reasonZh: expect.stringContaining("C1–C10"),
  });
  expect(generateOrganicSystematicName(dimethylamine)).toMatchObject({
    status: "unsupported",
    reasonZh: expect.stringContaining("仲胺、叔胺"),
  });
});

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
