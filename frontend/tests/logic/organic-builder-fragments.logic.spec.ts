import { expect, test } from "@playwright/test";
import { builderHistoryReducer, createBuilderHistory } from "../../src/hooks/useOrganicBuilder";
import {
  autoFillHydrogens,
  builderFragmentTemplates,
  detectFunctionalGroups,
  getFormula,
  validateBuilderMolecule,
} from "../../src/lib/organicBuilderChemistry";
import { generateOrganicSystematicName } from "../../src/lib/organicBuilderNomenclature";
import type { BuilderFragmentId, BuilderMolecule } from "../../src/types/organicBuilder";

// ---------------------------------------------------------------------------
// T-009 回归：有机拼装实验室「常用基团」片段库扩充。
//
// 在原有 6 个片段（甲基/羟基/氨基/醛基/羰基/羧基）之外新增 4 个高中常见基团：
// 乙烯基 –CH=CH₂、乙炔基 –C≡CH、甲氧基 –OCH₃、氰基 –C≡N。
//
// 断言口径：把每个片段接到一个游离碳上，自动补氢后
//   1. 价态完整（validateBuilderMolecule().isComplete，无 issue）——证明片段
//      落在现有 8 元素中性价模型内，不会产生 over/under-valence；
//   2. 引擎命名 / 官能团识别符合各自预期。氰基的 C≡N 会被现有命名引擎归入
//      「复杂含氮」而返回 unsupported——这是既有引擎边界（非本次回归引入），
//      InfoPanel 会如实显示「无法命名 + 原因」，这里断言它是预期的 unsupported。
// ---------------------------------------------------------------------------

/** 从单个游离碳开始，接一个片段，再自动补氢，返回补全后的分子。 */
function attachFragmentToCarbon(fragmentId: BuilderFragmentId): BuilderMolecule {
  const start = createBuilderHistory({
    id: "probe",
    nameZh: "probe",
    atoms: [{ id: "c", element: "C", position: [0, 0, 0] }],
    bonds: [],
  });
  const afterFragment = builderHistoryReducer(start, {
    type: "add-fragment",
    fragmentId,
    attachToId: "c",
  });
  return autoFillHydrogens(afterFragment.present);
}

test("新增 4 个片段模板已注册且结构自洽", () => {
  const ids = builderFragmentTemplates.map((fragment) => fragment.id);
  for (const id of ["vinyl", "ethynyl", "methoxy", "cyano"] as const) {
    expect(ids).toContain(id);
  }
  // 每个模板的 attachmentAtomId 必须指向自身 atoms 里真实存在的 templateId，
  // 且所有键端点都能在 atoms 中找到——否则 addFragment 拼接会产生悬空引用。
  for (const fragment of builderFragmentTemplates) {
    const templateIds = new Set(fragment.atoms.map((atom) => atom.templateId));
    expect(templateIds.has(fragment.attachmentAtomId)).toBe(true);
    for (const bond of fragment.bonds) {
      expect(templateIds.has(bond.atomIds[0])).toBe(true);
      expect(templateIds.has(bond.atomIds[1])).toBe(true);
    }
  }
});

test("乙烯基接碳后是丙烯，识别碳碳双键", () => {
  const molecule = attachFragmentToCarbon("vinyl");
  const validation = validateBuilderMolecule(molecule);
  expect(validation.isComplete).toBe(true);
  expect(validation.issues).toEqual([]);
  expect(getFormula(molecule)).toBe("C3H6");
  expect(detectFunctionalGroups(molecule)).toContain("碳碳双键");
  const naming = generateOrganicSystematicName(molecule);
  expect(naming.status).toBe("generated");
  expect(naming.nameZh).toBe("丙-1-烯");
});

test("乙炔基接碳后是丙炔，识别碳碳三键", () => {
  const molecule = attachFragmentToCarbon("ethynyl");
  const validation = validateBuilderMolecule(molecule);
  expect(validation.isComplete).toBe(true);
  expect(validation.issues).toEqual([]);
  expect(getFormula(molecule)).toBe("C3H4");
  expect(detectFunctionalGroups(molecule)).toContain("碳碳三键");
  const naming = generateOrganicSystematicName(molecule);
  expect(naming.status).toBe("generated");
  expect(naming.nameZh).toBe("丙-1-炔");
});

test("甲氧基接碳后是甲氧基甲烷（醚）", () => {
  const molecule = attachFragmentToCarbon("methoxy");
  const validation = validateBuilderMolecule(molecule);
  expect(validation.isComplete).toBe(true);
  expect(validation.issues).toEqual([]);
  expect(getFormula(molecule)).toBe("C2H6O");
  const naming = generateOrganicSystematicName(molecule);
  expect(naming.status).toBe("generated");
  expect(naming.nameZh).toBe("甲氧基甲烷");
});

test("氰基接碳后价态完整；命名落在既有引擎边界（unsupported）", () => {
  const molecule = attachFragmentToCarbon("cyano");
  const validation = validateBuilderMolecule(molecule);
  // 价态必须完整：证明氰基片段本身在中性价模型内自洽。
  expect(validation.isComplete).toBe(true);
  expect(validation.issues).toEqual([]);
  expect(getFormula(molecule)).toBe("C2H3N");
  // C≡N 被现有命名引擎归入「复杂含氮」——既有边界，非本次回归引入。
  const naming = generateOrganicSystematicName(molecule);
  expect(naming.status).toBe("unsupported");
  expect(naming.reasonZh).toBeTruthy();
});
