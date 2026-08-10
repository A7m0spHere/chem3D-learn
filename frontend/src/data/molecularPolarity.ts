export type MolecularPolarityMode =
  | "electronegativity"
  | "bondDipole"
  | "hcl"
  | "water"
  | "hypochlorousAcid"
  | "bf3";

export type MolecularPolarityModeInfo = {
  id: MolecularPolarityMode;
  label: string;
  title: string;
  formula?: string;
  result?: string;
  state: string;
};

export const bondDipoleExamples = [
  { bond: "H–Cl", direction: "H → Cl" },
  { bond: "O–H", direction: "H → O" },
  { bond: "O–Cl", direction: "Cl → O" },
  { bond: "B–F", direction: "B → F" },
] as const;

export const molecularPolarityModes: MolecularPolarityModeInfo[] = [
  {
    id: "electronegativity",
    label: "电负性",
    title: "先判断谁更会拉电子",
    state: "电子云偏向高电负性原子",
  },
  {
    id: "bondDipole",
    label: "键偶极",
    title: "极性键可以看作一个小箭头",
    state: "箭头由 δ+ 指向 δ−",
  },
  {
    id: "hcl",
    label: "HCl",
    title: "HCl：最简单的极性分子",
    formula: "HCl",
    result: "极性分子",
    state: "合偶极矩 ≠ 0",
  },
  {
    id: "water",
    label: "H₂O",
    title: "H₂O：V 形结构使偶极不能抵消",
    formula: "H₂O",
    result: "极性分子",
    state: "合偶极矩 ≠ 0",
  },
  {
    id: "hypochlorousAcid",
    label: "HClO",
    title: "HClO：弯曲且不对称的多键分子",
    formula: "HClO",
    result: "极性分子",
    state: "弯曲结构，合偶极矩 ≠ 0",
  },
  {
    id: "bf3",
    label: "BF₃",
    title: "BF₃：有极性键，但整体非极性",
    formula: "BF₃",
    result: "非极性分子",
    state: "平面三角形，合偶极矩 = 0",
  },
];

export function getMolecularPolarityModeInfo(
  mode: MolecularPolarityMode,
): MolecularPolarityModeInfo {
  return molecularPolarityModes.find((item) => item.id === mode) ?? molecularPolarityModes[0];
}
