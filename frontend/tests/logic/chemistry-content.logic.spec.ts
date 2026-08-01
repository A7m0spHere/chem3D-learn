import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { learningModules } from "../../src/data/learningModules";
import { organicCoplanarModes } from "../../src/data/organicCoplanar";
import { organicCoplanarBuilderSeed } from "../../src/data/organicBuilderSeeds";
import type { MoleculeRecord } from "../../src/types/molecule";

function readMoleculeJson(fileName: string): MoleculeRecord {
  return JSON.parse(
    readFileSync(new URL(`../../src/data/manual/${fileName}`, import.meta.url), "utf8"),
  ) as MoleculeRecord;
}

test("BF₃ 文案把中心 B 的六电子、八隅体例外与路易斯酸边界说清", () => {
  const bf3 = readMoleculeJson("bf3.json");
  const module = learningModules.find((item) => item.id === "planar-bf3");
  const mockSource = readFileSync(
    new URL("../../src/data/mockMolecules.ts", import.meta.url),
    "utf8",
  );
  const copy = JSON.stringify({ bf3, module });

  expect(module?.keyPoints).toContain("常用中性路易斯结构中，中心 B 周围计入 6 个价层电子");
  expect(module?.keyPoints).toContain("中心 B 未满足八隅体，可接受电子对，表现为路易斯酸");
  expect(bf3.lessonSteps.at(-1)?.bodyZh).toContain("BF₃ 表现为路易斯酸");
  expect(mockSource).toContain("所有原子都缺电子");
  expect(mockSource).not.toContain("缺电子表述后续复核");
  expect(copy).not.toContain("缺电子分子");
  expect(copy).not.toContain("TODO-CHEM-VERIFY");
});

test("CaF₂ 数据锁定萤石常规胞计数、8:4 配位与示意尺度边界", () => {
  const caf2 = readMoleculeJson("caf2.json");
  if (!caf2?.crystal || !caf2.crystalTeaching || !caf2.metadata) {
    throw new Error("CaF₂ 晶体教学数据未完整注册");
  }
  const calciumSites = caf2.atoms.filter((atom) => atom.element === "Ca");
  const fluorideSites = caf2.atoms.filter((atom) => atom.element === "F");
  const copy = JSON.stringify(caf2);

  // JSON 为闭合常规胞展示了 8 个顶点与 6 个面心 Ca 位点；均摊后才是 4 个 Ca。
  expect(calciumSites).toHaveLength(14);
  expect(fluorideSites).toHaveLength(8);
  expect(caf2.crystal.unitCellCount).toEqual({ Ca: 4, F: 8 });
  expect(caf2.crystal.coordination).toBe("8 : 4");
  expect(caf2.crystal.latticeZh).toContain("Fm-3m");
  expect(caf2.crystalTeaching.coordinationNumberZh).toBe("Ca²⁺：8；F⁻：4");
  expect(caf2.crystalTeaching.coordinationDescriptionZh.join(" ")).toContain("4 × 8 = 8 × 4");
  expect(copy).not.toContain("这是电中性的要求");
  expect(caf2.metadata.notesZh).toContain("约 5.463 Å");
  expect(caf2.metadata.notesZh).toContain("画面单位不等于 Å");
  expect(caf2.metadata.verified).toBe(true);
  expect(copy).not.toContain("TODO-CHEM-VERIFY");
});

test("有机共面模型明确自身身份、45° 教学姿态与构象边界", () => {
  const overview = organicCoplanarModes.find((mode) => mode.id === "overview");
  const sp2 = organicCoplanarModes.find((mode) => mode.id === "sp2Fragment");
  const rotation = organicCoplanarModes.find((mode) => mode.id === "rotation");
  const copy = JSON.stringify({ organicCoplanarBuilderSeed, organicCoplanarModes });

  expect(organicCoplanarBuilderSeed.formula).toBe("C₁₁H₁₁N");
  expect(organicCoplanarBuilderSeed.noteZh).toContain("不是单纯苯乙烯");
  expect(overview?.bodyZh).toContain("理想化综合模型");
  expect(sp2?.bodyZh).toContain("代表性教学姿态");
  expect(sp2?.notes).toContain("45° 不是最低能计算结果；实际取向会受取代基、相态、环境与热运动影响。");
  expect(rotation?.bodyZh).toContain("不是在预测最低能构象");
  expect(copy).not.toContain("默认示例中，乙烯基平面与苯环平面约成 45° 夹角");
  expect(copy).not.toContain("TODO-CHEM-VERIFY");
});
