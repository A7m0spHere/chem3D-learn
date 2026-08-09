import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { GuidedObservation, LessonStep, MoleculeRecord } from "../../src/types/molecule";

function readMoleculeJson(fileName: string): MoleculeRecord {
  return JSON.parse(
    readFileSync(new URL(`../../src/data/manual/${fileName}`, import.meta.url), "utf8"),
  ) as MoleculeRecord;
}

function requireGuidedObservation(step: LessonStep): GuidedObservation {
  if (!step.guidedObservation) {
    throw new Error(`${step.id} 缺少引导观察数据`);
  }

  return step.guidedObservation;
}

test("NH₃ 四步引导观察为每一步冻结目标、操作、变化与原因", () => {
  const nh3 = readMoleculeJson("nh3.json");
  const [shapeStep, lonePairStep, bondAngleStep, comparisonStep] = nh3.lessonSteps;

  if (!shapeStep || !lonePairStep || !bondAngleStep || !comparisonStep) {
    throw new Error("NH₃ 四步引导观察数据不完整");
  }

  expect(nh3.lessonSteps).toHaveLength(4);
  expect(nh3.lessonSteps.map((step) => step.id)).toEqual([
    "trigonal-pyramidal",
    "lone-pair",
    "bond-angle",
    "compare-bond-angles",
  ]);

  for (const step of nh3.lessonSteps) {
    const guidedObservation = requireGuidedObservation(step);

    expect(guidedObservation.observationGoalZh).not.toBe("");
    expect(guidedObservation.operationHintZh).not.toBe("");
    expect(guidedObservation.visibleChangeZh).not.toBe("");
    expect(guidedObservation.reasonZh).not.toBe("");
  }

  expect(shapeStep).toMatchObject({
    focusAtomIds: ["n1", "h1", "h2", "h3"],
    focusBondIds: ["n1-h1", "n1-h2", "n1-h3"],
  });
  expect(shapeStep.showAngles).toBeUndefined();
  expect(shapeStep.showLonePairs).toBeUndefined();

  expect(lonePairStep).toMatchObject({
    focusAtomIds: ["n1"],
    showLonePairs: true,
  });
  expect(lonePairStep.showAngles).toBeUndefined();

  expect(bondAngleStep).toMatchObject({
    focusAngleIds: ["h1-n1-h2"],
    showAngles: true,
    showLonePairs: true,
  });
  expect(comparisonStep).toMatchObject({
    focusAngleIds: ["h1-n1-h2"],
    showAngles: true,
    showLonePairs: true,
  });
});

test("NH₃ 对比总结与 CH₄、NH₃、H₂O 的已核验键角及孤电子对数一致", () => {
  const ch4 = readMoleculeJson("ch4.json");
  const nh3 = readMoleculeJson("nh3.json");
  const h2o = readMoleculeJson("h2o.json");
  const comparison = requireGuidedObservation(nh3.lessonSteps[3]).comparison;

  if (!comparison) {
    throw new Error("NH₃ 第四步缺少轻量对比总结");
  }

  expect(comparison.titleZh).toBe("孤电子对与键角");
  expect(comparison.items).toEqual([
    {
      moleculeId: "ch4",
      formula: "CH₄",
      centralLonePairCount: ch4.lonePairs.length,
      bondAngleDeg: ch4.keyAngles[0].valueDeg,
    },
    {
      moleculeId: "nh3",
      formula: "NH₃",
      centralLonePairCount: nh3.lonePairs.length,
      bondAngleDeg: nh3.keyAngles[0].valueDeg,
    },
    {
      moleculeId: "h2o",
      formula: "H₂O",
      centralLonePairCount: h2o.lonePairs.length,
      bondAngleDeg: h2o.keyAngles[0].valueDeg,
    },
  ]);
});

test("引导观察字段保持可选，既有手写结构无需批量迁移", () => {
  const ch4 = readMoleculeJson("ch4.json");
  const h2o = readMoleculeJson("h2o.json");
  const legacyStep: LessonStep = {
    id: "legacy-step",
    titleZh: "旧步骤",
    bodyZh: "未提供引导观察字段的既有步骤仍然有效。",
  };

  expect(legacyStep.guidedObservation).toBeUndefined();
  expect([...ch4.lessonSteps, ...h2o.lessonSteps].every(
    (step) => step.guidedObservation === undefined,
  )).toBe(true);
});
