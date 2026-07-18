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
import type { BuilderMolecule } from "../../src/types/organicBuilder";

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
