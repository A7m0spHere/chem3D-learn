import { expect, test } from "@playwright/test";
import {
  benzeneBuilderSeed,
  ethyleneBuilderSeed,
  organicCoplanarBuilderSeed,
} from "../../src/data/organicBuilderSeeds";
import { builderHistoryReducer, createBuilderHistory } from "../../src/hooks/useOrganicBuilder";
import {
  autoFillHydrogens,
  detectFunctionalGroups,
  findKnownMolecule,
  getFormula,
  getSuggestedPosition,
  knownOrganicMolecules,
  validateBuilderMolecule,
} from "../../src/lib/organicBuilderChemistry";
import { matchBuilderBondAngles } from "../../src/lib/organicBuilderGeometry";
import { generateOrganicSystematicName } from "../../src/lib/organicBuilderNomenclature";
import type {
  BuilderBondOrder,
  BuilderElement,
  BuilderMolecule,
  BuilderVec3,
} from "../../src/types/organicBuilder";

// ---------------------------------------------------------------------------
// 有机拼装实验室专项修复回归（命名、几何摆位、片段 ID、官能团检测、状态层）。
// 每个用例对应一次已确认的缺陷修复，防止回退。
// ---------------------------------------------------------------------------

test("不饱和醇/酮/胺的中文名保留烯炔词干，与英文一致", () => {
  const propenol = completeHeavySkeleton(
    "prop-2-en-1-ol",
    ["C", "C", "C", "O"],
    [[0, 1, 1], [1, 2, 2], [0, 3, 1]],
  );
  const butenone = completeHeavySkeleton(
    "but-3-en-2-one",
    ["C", "C", "C", "C", "O"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 1], [2, 4, 2]],
  );
  const butenediol = completeHeavySkeleton(
    "but-2-ene-1-4-diol",
    ["C", "C", "C", "C", "O", "O"],
    [[0, 1, 1], [1, 2, 2], [2, 3, 1], [0, 4, 1], [3, 5, 1]],
  );
  const propenylamine = completeHeavySkeleton(
    "prop-2-en-1-amine",
    ["C", "C", "C", "N"],
    [[0, 1, 1], [1, 2, 2], [0, 3, 1]],
  );

  expect(generateOrganicSystematicName(propenol)).toMatchObject({
    status: "generated",
    nameZh: "丙-2-烯-1-醇",
    nameEn: "prop-2-en-1-ol",
  });
  expect(generateOrganicSystematicName(butenone)).toMatchObject({
    status: "generated",
    nameZh: "丁-3-烯-2-酮",
    nameEn: "but-3-en-2-one",
  });
  expect(generateOrganicSystematicName(butenediol)).toMatchObject({
    status: "generated",
    nameZh: "丁-2-烯-1,4-二醇",
    nameEn: "but-2-ene-1,4-diol",
  });
  expect(generateOrganicSystematicName(propenylamine)).toMatchObject({
    status: "generated",
    nameZh: "丙-2-烯-1-胺",
    nameEn: "prop-2-en-1-amine",
  });
});

test("不饱和二酸/二醛拒绝命名并给出对应的具体原因", () => {
  const butenedioicAcid = completeHeavySkeleton(
    "butenedioic-acid",
    ["C", "C", "C", "C", "O", "O", "O", "O"],
    [[0, 1, 1], [1, 2, 2], [2, 3, 1], [0, 4, 2], [0, 5, 1], [3, 6, 2], [3, 7, 1]],
  );
  const butenedial = completeHeavySkeleton(
    "butenedial",
    ["C", "C", "C", "C", "O", "O"],
    [[0, 1, 1], [1, 2, 2], [2, 3, 1], [0, 4, 2], [3, 5, 2]],
  );

  for (const molecule of [butenedioicAcid, butenedial]) {
    const result = generateOrganicSystematicName(molecule);
    expect(result).toMatchObject({
      status: "unsupported",
      reasonZh: expect.stringContaining("二酸、二醛"),
    });
  }
});

test("最长碳链解析失败时拒绝命名，不再静默降级为短母链", () => {
  const isopropylheptane = completeHeavySkeleton(
    "4-isopropylheptane",
    Array.from({ length: 10 }, () => "C" as const),
    [
      [0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 5, 1], [5, 6, 1],
      [3, 7, 1], [7, 8, 1], [7, 9, 1],
    ],
  );
  expect(generateOrganicSystematicName(isopropylheptane)).toMatchObject({
    status: "unsupported",
    reasonZh: expect.stringContaining("最长碳链"),
  });
});

test("双片段拼乙酸：片段 id 不再冲突，可被精确识别", () => {
  let state = createBuilderHistory();
  state = builderHistoryReducer(state, { type: "add-fragment", fragmentId: "methyl" });
  const methylCarbonId = state.present.atoms.find((atom) => atom.element === "C")!.id;
  state = builderHistoryReducer(state, {
    type: "add-fragment",
    fragmentId: "carboxyl",
    attachToId: methylCarbonId,
  });

  expect(state.feedback?.tone).not.toBe("error");
  const ids = state.present.atoms.map((atom) => atom.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(getFormula(state.present)).toBe("C2H4O2");
  expect(validateBuilderMolecule(state.present).isComplete).toBe(true);
  expect(findKnownMolecule(state.present)?.nameZh).toBe("乙酸");
});

test("官能团检测按优先级报告，不再拆散羧基/醛基或误报苯环", () => {
  const aceticAcid = knownOrganicMolecules.find((candidate) => candidate.id === "ethanoic-acid")!.molecule;
  const ethanal = knownOrganicMolecules.find((candidate) => candidate.id === "ethanal")!.molecule;
  const benzene = knownOrganicMolecules.find((candidate) => candidate.id === "benzene")!.molecule;
  const dimethylEther = knownOrganicMolecules.find((candidate) => candidate.id === "dimethyl-ether")!.molecule;
  const acetone = completeHeavySkeleton(
    "acetone",
    ["C", "C", "C", "O"],
    [[0, 1, 1], [1, 2, 1], [1, 3, 2]],
  );
  const acetonitrile = completeHeavySkeleton(
    "acetonitrile",
    ["C", "C", "N"],
    [[0, 1, 1], [1, 2, 3]],
  );
  const ethylFormate = completeHeavySkeleton(
    "ethyl-formate",
    ["C", "O", "O", "C", "C"],
    [[0, 1, 2], [0, 2, 1], [2, 3, 1], [3, 4, 1]],
  );
  const hydrogenChloride: BuilderMolecule = {
    id: "hcl",
    atoms: [
      { id: "h", element: "H", position: [0, 0, 0] },
      { id: "cl", element: "Cl", position: [1.2, 0, 0] },
    ],
    bonds: [{ id: "b", atomIds: ["h", "cl"], order: 1 }],
  };

  const aceticGroups = detectFunctionalGroups(aceticAcid);
  expect(aceticGroups).toContain("羧基");
  expect(aceticGroups).not.toContain("羟基");
  expect(aceticGroups).not.toContain("羰基");

  const ethanalGroups = detectFunctionalGroups(ethanal);
  expect(ethanalGroups).toContain("醛基");
  expect(ethanalGroups).not.toContain("羰基");

  expect(detectFunctionalGroups(acetone)).toContain("羰基");

  const benzeneGroups = detectFunctionalGroups(benzene);
  expect(benzeneGroups).toContain("苯环（芳香环）");
  expect(benzeneGroups).not.toContain("碳碳双键");
  // 乙烯的碳碳双键必须继续报告（非环内键不受苯环抑制影响）。
  expect(detectFunctionalGroups(ethyleneBuilderSeed)).toContain("碳碳双键");

  expect(detectFunctionalGroups(acetonitrile)).toContain("氰基");
  expect(detectFunctionalGroups(dimethylEther)).toContain("醚键");

  const esterGroups = detectFunctionalGroups(ethylFormate);
  expect(esterGroups).toContain("酯基");
  expect(esterGroups).not.toContain("醛基");
  expect(esterGroups).not.toContain("醚键");

  expect(detectFunctionalGroups(hydrogenChloride)).not.toContain("卤代结构");
});

test("甲苯进入教学词典，无碳氢化物分子式按教学惯例书写", () => {
  const methylbenzene = completeHeavySkeleton(
    "methylbenzene-known",
    ["C", "C", "C", "C", "C", "C", "C"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1], [0, 6, 1]],
  );
  expect(findKnownMolecule(methylbenzene)?.nameZh).toBe("甲苯");

  const ammonia = autoFillHydrogens({
    id: "nh3",
    atoms: [{ id: "n", element: "N", position: [0, 0, 0] }],
    bonds: [],
  });
  const water = autoFillHydrogens({
    id: "h2o",
    atoms: [{ id: "o", element: "O", position: [0, 0, 0] }],
    bonds: [],
  });
  const hydrogenChloride: BuilderMolecule = {
    id: "hcl-formula",
    atoms: [
      { id: "h", element: "H", position: [0, 0, 0] },
      { id: "cl", element: "Cl", position: [1.2, 0, 0] },
    ],
    bonds: [{ id: "b", atomIds: ["h", "cl"], order: 1 }],
  };
  expect(getFormula(ammonia)).toBe("NH3");
  expect(getFormula(water)).toBe("H2O");
  expect(getFormula(hydrogenChloride)).toBe("HCl");
});

test("饱和 C2 母体单取代按教材习惯省略位次", () => {
  const chloroethane = completeHeavySkeleton(
    "chloroethane",
    ["C", "C", "Cl"],
    [[0, 1, 1], [0, 2, 1]],
  );
  expect(generateOrganicSystematicName(chloroethane)).toMatchObject({
    status: "generated",
    nameZh: "氯乙烷",
    nameEn: "chloroethane",
  });
});

test("建议摆位：O 中心弯折约 104.5°，双双键碳呈 180° 直线", () => {
  const water = autoFillHydrogens({
    id: "geometry-water",
    atoms: [{ id: "o", element: "O", position: [0, 0, 0] }],
    bonds: [],
  });
  const hydrogens = water.atoms.filter((atom) => atom.element === "H");
  expect(hydrogens).toHaveLength(2);
  const waterAngle = angleBetween(hydrogens[0].position, [0, 0, 0], hydrogens[1].position);
  expect(waterAngle).toBeGreaterThan(100);
  expect(waterAngle).toBeLessThan(110);

  const carbonDioxidePartial: BuilderMolecule = {
    id: "co2-partial",
    atoms: [
      { id: "c", element: "C", position: [0, 0, 0] },
      { id: "o1", element: "O", position: [1.08, 0, 0] },
    ],
    bonds: [{ id: "b1", atomIds: ["c", "o1"], order: 2 }],
  };
  const secondOxygen = getSuggestedPosition(carbonDioxidePartial, "c", "O", 2);
  const co2Angle = angleBetween([1.08, 0, 0], [0, 0, 0], secondOxygen);
  expect(co2Angle).toBeGreaterThan(175);
});

test("醚母体选择与化学键数组顺序无关", () => {
  const elements: BuilderElement[] = ["C", "C", "C", "O", "C", "C", "C"];
  const bonds: Array<[number, number, BuilderBondOrder]> = [
    [0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 5, 1], [4, 6, 1],
  ];
  const forward = completeHeavySkeleton("propyl-isopropyl-ether", elements, bonds);
  const reversed: BuilderMolecule = {
    ...forward,
    atoms: [...forward.atoms].reverse(),
    bonds: [...forward.bonds].reverse(),
  };
  const forwardName = generateOrganicSystematicName(forward);
  expect(forwardName).toMatchObject({ status: "generated", nameZh: "2-丙氧基丙烷" });
  expect(generateOrganicSystematicName(reversed)).toEqual(forwardName);
});

test("单氧不饱和链回落到氧杂骨架替代命名", () => {
  const methylVinylEther = completeHeavySkeleton(
    "methyl-vinyl-ether",
    ["C", "C", "O", "C"],
    [[0, 1, 2], [1, 2, 1], [2, 3, 1]],
  );
  expect(generateOrganicSystematicName(methylVinylEther)).toMatchObject({
    status: "generated",
    nameZh: "2-氧杂丁-3-烯",
    nameEn: "2-oxabut-3-ene",
    method: "skeletal-replacement",
  });
});

test("同类取代基超过十个时安全拒绝，名称不出现 undefined 字样", () => {
  const perfluoropentane = completeHeavySkeleton(
    "perfluoropentane",
    ["C", "C", "C", "C", "C", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F", "F"],
    [
      [0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 1],
      [0, 5, 1], [0, 6, 1], [0, 7, 1],
      [1, 8, 1], [1, 9, 1],
      [2, 10, 1], [2, 11, 1],
      [3, 12, 1], [3, 13, 1],
      [4, 14, 1], [4, 15, 1], [4, 16, 1],
    ],
  );
  const result = generateOrganicSystematicName(perfluoropentane);
  expect(result.status).toBe("unsupported");
  expect(JSON.stringify(result)).not.toContain("undefined");
});

test("片段拼接按母体方向旋转对齐，原子互不重叠且保持模板键角", () => {
  let state = createBuilderHistory({
    id: "ethyl-probe",
    nameZh: "probe",
    formula: "",
    atoms: [
      { id: "c1", element: "C", position: [0, 0, 0] },
      { id: "c2", element: "C", position: [1.08, 0, 0] },
    ],
    bonds: [{ id: "b", atomIds: ["c1", "c2"], order: 1 }],
  });
  state = builderHistoryReducer(state, { type: "add-fragment", fragmentId: "carboxyl", attachToId: "c2" });
  expect(state.feedback?.tone).toBe("success");

  const atoms = state.present.atoms;
  for (let first = 0; first < atoms.length; first += 1) {
    for (let second = first + 1; second < atoms.length; second += 1) {
      expect(distanceBetween(atoms[first].position, atoms[second].position)).toBeGreaterThan(0.45);
    }
  }
  // 羧基碳的 O=C 与母体方向应保持模板设定的 ≈120°。
  const carboxylCarbon = atoms.find((atom) => atom.id.endsWith("-c"))!;
  const doubleOxygen = atoms.find((atom) => atom.id.endsWith("-o1"))!;
  const anchor = atoms.find((atom) => atom.id === "c2")!;
  const angle = angleBetween(anchor.position, carboxylCarbon.position, doubleOxygen.position);
  expect(angle).toBeGreaterThan(110);
  expect(angle).toBeLessThan(130);
});

test("三元环中心不再标注 109.5° 典型键角", () => {
  const cyclopropane = completeHeavySkeleton(
    "cyclopropane-angles",
    ["C", "C", "C"],
    [[0, 1, 1], [1, 2, 1], [2, 0, 1]],
  );
  expect(validateBuilderMolecule(cyclopropane).isComplete).toBe(true);
  expect(matchBuilderBondAngles(cyclopropane)).toEqual([]);
});

test("恢复起点保留撤销历史，误点后可以找回", () => {
  let state = createBuilderHistory(ethyleneBuilderSeed);
  state = builderHistoryReducer(state, { type: "remove-atom", atomId: "h1" });
  state = builderHistoryReducer(state, { type: "reset" });
  expect(state.past.length).toBeGreaterThan(0);
  state = builderHistoryReducer(state, { type: "undo" });
  expect(state.present.atoms.some((atom) => atom.id === "h1")).toBe(false);
});

test("暂存区槽位避开残留原子，不再完全重叠", () => {
  let state = createBuilderHistory();
  state = builderHistoryReducer(state, { type: "add-atom", element: "C", order: 1 });
  state = builderHistoryReducer(state, { type: "add-atom", element: "O", order: 1 });
  const firstId = state.present.atoms[0].id;
  state = builderHistoryReducer(state, { type: "remove-atom", atomId: firstId });
  state = builderHistoryReducer(state, { type: "add-atom", element: "N", order: 1 });
  expect(state.present.atoms).toHaveLength(2);
  const [remaining, added] = state.present.atoms;
  expect(distanceBetween(remaining.position, added.position)).toBeGreaterThan(0.3);
});

test("拔下的原子吸附回去沿用该分子的键长标尺，不再明显长一截", () => {
  // 苯种子 C–H = 0.66，与样式化常数 0.92 不同；拔下再吸附回去必须与其余五个 H 等长。
  let benzene = createBuilderHistory(benzeneBuilderSeed, "h1");
  benzene = builderHistoryReducer(benzene, {
    type: "drop-atom",
    atomId: "h1",
    position: bondPartnerPosition(benzene.present, "c1", 0.8),
    connectToId: "c1",
    order: 1,
  });
  expect(benzene.feedback?.tone).toBe("success");
  const benzeneLengths = [1, 2, 3, 4, 5, 6].map((index) =>
    measureBond(benzene.present, `c${index}`, `h${index}`),
  );
  const [reattached, ...untouched] = benzeneLengths;
  untouched.forEach((length) => expect(Math.abs(reattached - length)).toBeLessThan(0.02));

  // 共面综合模型的甲基 C–H 约 0.59，同样应沿用局部标尺而非常数。
  let coplanar = createBuilderHistory(organicCoplanarBuilderSeed, "methylH1");
  coplanar = builderHistoryReducer(coplanar, {
    type: "drop-atom",
    atomId: "methylH1",
    position: bondPartnerPosition(coplanar.present, "methylC", 0.7),
    connectToId: "methylC",
    order: 1,
  });
  expect(coplanar.feedback?.tone).toBe("success");
  const reattachedMethyl = measureBond(coplanar.present, "methylC", "methylH1");
  const referenceMethyl = measureBond(coplanar.present, "methylC", "methylH2");
  expect(Math.abs(reattachedMethyl - referenceMethyl)).toBeLessThan(0.02);
});

test("从零拼装时键长仍使用样式化标尺", () => {
  // 分子内没有同类键可参照时必须回退到常数，否则空白画布拼装会失去统一尺度。
  let state = createBuilderHistory();
  state = builderHistoryReducer(state, { type: "add-atom", element: "C", order: 1 });
  const carbonId = state.present.atoms[0].id;
  state = builderHistoryReducer(state, { type: "add-atom", element: "H", order: 1, attachToId: carbonId });
  const hydrogenId = state.present.atoms.find((atom) => atom.element === "H")!.id;
  expect(measureBond(state.present, carbonId, hydrogenId)).toBeCloseTo(0.92, 2);
});

function measureBond(molecule: BuilderMolecule, firstId: string, secondId: string): number {
  const first = molecule.atoms.find((atom) => atom.id === firstId)!;
  const second = molecule.atoms.find((atom) => atom.id === secondId)!;
  return distanceBetween(first.position, second.position);
}

// 取靠近目标原子的一个落点，模拟拖到吸附范围内松手。
function bondPartnerPosition(molecule: BuilderMolecule, targetId: string, offset: number): BuilderVec3 {
  const target = molecule.atoms.find((atom) => atom.id === targetId)!;
  return [target.position[0] + offset, target.position[1], target.position[2]];
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

function angleBetween(first: BuilderVec3, vertex: BuilderVec3, second: BuilderVec3): number {
  const a: BuilderVec3 = [first[0] - vertex[0], first[1] - vertex[1], first[2] - vertex[2]];
  const b: BuilderVec3 = [second[0] - vertex[0], second[1] - vertex[1], second[2] - vertex[2]];
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const lengths = Math.hypot(...a) * Math.hypot(...b);
  return (Math.acos(Math.min(1, Math.max(-1, dot / (lengths || 1)))) * 180) / Math.PI;
}

function distanceBetween(first: BuilderVec3, second: BuilderVec3): number {
  return Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
}
