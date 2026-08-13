import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { learningModules } from "../../src/data/learningModules";
import { acetyleneLinearModes } from "../../src/data/acetyleneLinear";
import { benzenePlanarModes } from "../../src/data/benzenePlanar";
import { bondingBasicsLessons } from "../../src/data/bondingBasics";
import { ethylenePlanarModes } from "../../src/data/ethylenePlanar";
import { molecularPolarityModes } from "../../src/data/molecularPolarity";
import { organicCoplanarModes } from "../../src/data/organicCoplanar";
import { organicCoplanarBuilderSeed } from "../../src/data/organicBuilderSeeds";
import { orbitalBondLessons } from "../../src/data/sigmaPiBonds";
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
  expect(module?.description).toContain("键角 120°");
  expect(mockSource).toContain("所有原子都缺电子");
  expect(mockSource).not.toContain("缺电子表述后续复核");
  expect(copy).not.toContain("缺电子分子");
  expect(copy).not.toContain("TODO-CHEM-VERIFY");
});

test("23 份手写结构不再携带课程步骤、旧教学面板或引导观察数据", () => {
  const manualDataUrl = new URL("../../src/data/manual/", import.meta.url);
  const files = readdirSync(manualDataUrl).filter((file) => file.endsWith(".json"));
  const allowedFields = new Set([
    "atoms",
    "bonds",
    "category",
    "coordinationLinks",
    "crystal",
    "crystalControls",
    "formula",
    "id",
    "interlayerForces",
    "ions",
    "keyAngles",
    "kind",
    "lonePairs",
    "metadata",
    "names",
    "nameZh",
    "rendering",
    "summaryZh",
  ]);

  expect(files).toHaveLength(23);
  for (const file of files) {
    const raw = readFileSync(new URL(file, manualDataUrl), "utf8");
    const record = JSON.parse(raw) as Record<string, unknown>;

    expect(record, file).not.toHaveProperty("lessonSteps");
    expect(record, file).not.toHaveProperty("crystalTeaching");
    expect(raw, file).not.toContain("guidedObservation");
    expect(Object.keys(record).filter((field) => !allowedFields.has(field)), file).toEqual([]);
  }
});

test("CaF₂ 数据锁定萤石常规胞计数、8:4 配位与示意尺度边界", () => {
  const caf2 = readMoleculeJson("caf2.json");
  if (!caf2?.crystal || !caf2.crystalControls || !caf2.metadata) {
    throw new Error("CaF₂ 晶体结构与控制数据未完整注册");
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
  expect(caf2.crystalControls.viewModes.map((mode) => mode.id)).toContain("coordinationAnion");
  expect(caf2.crystal.formulaExplanationZh).toContain("4 × 8 = 8 × 4");
  expect(copy).not.toContain("这是电中性的要求");
  expect(caf2.metadata.notesZh).toContain("约 5.463 Å");
  expect(caf2.metadata.notesZh).toContain("画面单位不等于 Å");
  expect(caf2.metadata.verified).toBe(true);
  expect(copy).not.toContain("TODO-CHEM-VERIFY");
});

test("17 份晶体数据只提供最小 CrystalControls 与 CrystalInfo", () => {
  const manualDataUrl = new URL("../../src/data/manual/", import.meta.url);
  const records = readdirSync(manualDataUrl)
    .filter((file) => file.endsWith(".json"))
    .map((file) => ({ file, record: readMoleculeJson(file) }))
    .filter(({ record }) => record.kind === "crystal");

  expect(records).toHaveLength(17);
  for (const { file, record } of records) {
    expect(record.crystal, file).toBeTruthy();
    expect(record.crystal?.typeZh, file).toBeTruthy();
    expect(record.crystal?.latticeZh, file).toBeTruthy();
    expect(record.crystal?.coordination, file).toBeTruthy();
    expect(record.crystal?.formulaExplanationZh, file).toBeTruthy();

    const controls = record.crystalControls;
    expect(controls, file).toBeTruthy();
    expect(controls?.viewModes.length, file).toBeGreaterThan(0);
    expect(new Set(controls?.viewModes.map((mode) => mode.id)).size, file).toBe(
      controls?.viewModes.length,
    );
    for (const mode of controls?.viewModes ?? []) {
      expect(Object.keys(mode).sort(), `${file}:${mode.id}`).toEqual(["id", "labelZh"]);
      expect(mode.labelZh, `${file}:${mode.id}`).toBeTruthy();
    }
    for (const stage of controls?.voidStages ?? []) {
      expect(Object.keys(stage).sort(), `${file}:${stage.id}`).toEqual(["id", "labelZh"]);
      expect(stage.labelZh, `${file}:${stage.id}`).toBeTruthy();
    }

    expect(record, file).not.toHaveProperty("crystalTeaching");
  }
});

test("有机共面模型明确自身身份、45° 教学姿态与构象边界", () => {
  const overview = organicCoplanarModes.find((mode) => mode.id === "overview");
  const sp2 = organicCoplanarModes.find((mode) => mode.id === "sp2Fragment");
  const rotation = organicCoplanarModes.find((mode) => mode.id === "rotation");
  const copy = JSON.stringify({ organicCoplanarBuilderSeed, organicCoplanarModes });

  expect(organicCoplanarBuilderSeed.formula).toBe("C₁₁H₁₁N");
  expect(organicCoplanarBuilderSeed.noteZh).toContain("不是单纯苯乙烯");
  expect(overview?.viewerSummary).toContain("理想化综合模型");
  expect(sp2?.viewerSummary).toContain("当前 45° 是理想化代表姿态");
  expect(rotation?.state).toContain("绕连接单键旋转");
  expect(copy).not.toContain("bodyZh");
  expect(copy).not.toContain("facts");
  expect(copy).not.toContain("notes");
  expect(copy).not.toContain("默认示例中，乙烯基平面与苯环平面约成 45° 夹角");
  expect(copy).not.toContain("TODO-CHEM-VERIFY");
});

test("专题模式只保留渲染控制与精简状态，不再携带旧 Panel 教学字段", () => {
  const modeGroups = [
    molecularPolarityModes,
    orbitalBondLessons.sigma.modes,
    orbitalBondLessons.pi.modes,
    ...Object.values(bondingBasicsLessons).map((lesson) => lesson.modes),
    ethylenePlanarModes,
    benzenePlanarModes,
    acetyleneLinearModes,
    organicCoplanarModes,
  ];
  const removedFields = [
    "bodyZh",
    "description",
    "examNote",
    "facts",
    "notes",
    "points",
    "viewerNotes",
  ];

  for (const modes of modeGroups) {
    expect(new Set(modes.map((mode) => mode.id)).size).toBe(modes.length);
    for (const mode of modes) {
      expect(mode.state).toBeTruthy();
      for (const field of removedFields) {
        expect(mode).not.toHaveProperty(field);
      }
    }
  }
});
