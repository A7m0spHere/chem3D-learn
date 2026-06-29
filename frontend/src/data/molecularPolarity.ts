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
  subtitle: string;
  formula?: string;
  result?: string;
  description: string;
  points: string[];
  viewerNotes: string[];
};

export const polarityJudgmentFlow =
  "先看电负性 → 判断键偶极方向 → 看空间构型 → 判断是否抵消 → 得出分子极性";

export const polarityCoreSentence =
  "键有极性，不代表分子一定有极性；关键要看键偶极在空间中能否抵消。";

export const electronegativityOrder = [
  { element: "F", value: "约 4.0", note: "吸引成键电子能力很强" },
  { element: "O", value: "约 3.4", note: "比 H、Cl 更能吸引电子" },
  { element: "Cl", value: "约 3.2", note: "H–Cl 中电子偏向 Cl" },
  { element: "B", value: "约 2.0", note: "明显小于 F" },
  { element: "H", value: "约 2.2", note: "常作为 δ+ 一端" },
] as const;

export const bondDipoleExamples = [
  { bond: "H–Cl", direction: "H → Cl", note: "电子云偏向 Cl" },
  { bond: "O–H", direction: "H → O", note: "电子云偏向 O" },
  { bond: "O–Cl", direction: "Cl → O", note: "O 的电负性略大于 Cl" },
  { bond: "B–F", direction: "B → F", note: "F 明显更吸电子" },
] as const;

export const molecularPolarityModes: MolecularPolarityModeInfo[] = [
  {
    id: "electronegativity",
    label: "电负性",
    title: "先判断谁更会拉电子",
    subtitle: "F > O > Cl > B > H",
    description:
      "电负性表示原子吸引成键电子的能力。电子通常偏向电负性较大的原子，使这一端带部分负电。",
    points: [
      "F 的电负性明显大于 B，所以 B–F 键具有明显极性。",
      "O 的电负性大于 H，也略大于 Cl。",
      "本模块先用电负性确定键偶极方向，再看空间中能否抵消。",
    ],
    viewerNotes: ["F > O > Cl > B > H", "B–F 键：电子云偏向 F"],
  },
  {
    id: "bondDipole",
    label: "键偶极",
    title: "极性键可以看作一个小箭头",
    subtitle: "箭头从 δ+ 指向 δ−",
    description:
      "键偶极是有方向的矢量。高中阶段可把箭头理解为从部分正电的一端指向部分负电的一端。",
    points: [
      "H–Cl：H → Cl",
      "O–H：H → O",
      "O–Cl：Cl → O",
      "B–F：B → F",
    ],
    viewerNotes: ["四种键偶极是后面四个分子的判断基础。"],
  },
  {
    id: "hcl",
    label: "HCl",
    title: "HCl：最简单的极性分子",
    subtitle: "一条极性键，合偶极矩不为 0",
    formula: "HCl",
    result: "极性分子",
    description:
      "H–Cl 是直线双原子分子。Cl 的电负性大于 H，键偶极方向为 H → Cl，合偶极矩方向也为 H → Cl。",
    points: ["H 端标 δ+", "Cl 端标 δ−", "合偶极矩 ≠ 0，所以 HCl 是极性分子。"],
    viewerNotes: ["H → Cl", "合偶极矩 ≠ 0", "HCl：极性分子"],
  },
  {
    id: "water",
    label: "H₂O",
    title: "H₂O：V 形结构使偶极不能抵消",
    subtitle: "两个 O–H 键偶极合成后仍不为 0",
    formula: "H₂O",
    result: "极性分子",
    description:
      "水分子是 V 形结构，两个 O–H 键偶极方向均为 H → O。由于两个键不在相反方向上，合偶极矩大致沿 H–O–H 角平分线指向 O。",
    points: ["两个 O–H 键都有极性", "V 形结构不对称", "合偶极矩 ≠ 0，所以 H₂O 是极性分子。"],
    viewerNotes: ["H → O", "合偶极矩 ≠ 0", "H₂O：极性分子"],
  },
  {
    id: "hypochlorousAcid",
    label: "HClO",
    title: "HClO：弯曲且不对称的多键分子",
    subtitle: "结构是 H–O–Cl，中心原子是 O",
    formula: "HClO",
    result: "极性分子",
    description:
      "次氯酸的结构是 H–O–Cl，中心原子是 O。由于 O 的电负性大于 H，也略大于 Cl，两个键偶极都大致指向 O 附近；再加上结构不对称，所以 HClO 是极性分子。",
    points: [
      "HClO 中 O–H 与 O–Cl 两个键偶极都大致指向 O 附近，但由于 H–O–Cl 是弯曲且不对称的结构，两个键偶极不能互相抵消，因此整体为极性分子。",
      "不能画成 H–Cl–O。",
      "不能把 H–O–Cl 画成完全直线。",
    ],
    viewerNotes: ["H–O–Cl", "H → O", "Cl → O", "HClO：极性分子"],
  },
  {
    id: "bf3",
    label: "BF₃",
    title: "BF₃：有极性键，但整体非极性",
    subtitle: "平面三角形让三个键偶极对称抵消",
    formula: "BF₃",
    result: "非极性分子",
    description:
      "BF₃ 中虽然每条 B–F 键都有极性，但由于分子为平面三角形，三个键偶极对称分布并完全抵消，所以 BF₃ 是非极性分子。",
    points: [
      "F 的电负性大于 B，每条 B–F 键都有极性。",
      "键偶极方向为 B → F。",
      "不是因为 B–F 键没有极性，而是因为三个 B–F 键偶极大小相等、方向对称，矢量和为 0。",
    ],
    viewerNotes: ["每条 B–F 键：有极性", "三个键偶极：对称抵消", "合偶极矩 = 0", "BF₃：非极性分子"],
  },
];

export function getMolecularPolarityModeInfo(
  mode: MolecularPolarityMode,
): MolecularPolarityModeInfo {
  return molecularPolarityModes.find((item) => item.id === mode) ?? molecularPolarityModes[0];
}
