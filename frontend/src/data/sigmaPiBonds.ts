import type { SigmaPiBondMode } from "@/types/molecule";

export type SigmaPiBondModeInfo = {
  id: SigmaPiBondMode;
  label: string;
  title: string;
  description: string;
  points: string[];
  viewerLabel: string;
  viewerTitle: string;
  viewerSummary: string;
  examNote: string;
};

export const sigmaPiBondModes: SigmaPiBondModeInfo[] = [
  {
    id: "overview",
    label: "总览",
    title: "乙烯双键的成键图像",
    description:
      "乙烯 C₂H₄ 中，两个碳原子之间的 C=C 双键不是两根完全相同的单键，而是由 1 个 σ 键和 1 个 π 键共同组成。",
    points: ["C=C 双键包含 1 个 σ 键和 1 个 π 键", "σ 键在两核连线上", "π 电子云分布在分子平面上下"],
    viewerLabel: "乙烯双键 · 1σ + 1π",
    viewerTitle: "乙烯 C₂H₄｜C=C 双键由 1σ + 1π 组成",
    viewerSummary: "σ 键沿两核连线连接两个碳，π 键分布在分子平面上下。",
    examNote: "看到双键时，不要按“两根普通单键”理解；计数时记作 1 个 σ 键、1 个 π 键。",
  },
  {
    id: "sigma",
    label: "σ 键",
    title: "σ 键：沿键轴头碰头重叠",
    description:
      "σ 键来自轨道沿两核连线方向的正面重叠。电子云主要集中在两个原子核之间，围绕键轴近似对称。",
    points: ["沿 C-C 键轴方向重叠", "电子云集中在两核之间", "单键都可以看作 σ 键"],
    viewerLabel: "σ 键 · 头碰头重叠",
    viewerTitle: "σ 键｜沿键轴正面重叠",
    viewerSummary: "轨道沿两核连线头碰头重叠，电子云主要集中在两个原子核之间。",
    examNote: "单键只有 σ 键；双键和三键中也各有 1 个 σ 键。",
  },
  {
    id: "pi",
    label: "π 键",
    title: "π 键：p 轨道肩并肩重叠",
    description:
      "乙烯中每个碳原子保留 1 个未杂化 p 轨道。两个 p 轨道互相平行，进行侧向重叠，形成位于分子平面上下方的 π 电子云。",
    points: ["p 轨道垂直于乙烯分子平面", "两个 p 轨道必须保持平行", "π 键电子云在键轴上下两侧"],
    viewerLabel: "π 键 · 肩并肩重叠",
    viewerTitle: "π 键｜两个 p 轨道侧向重叠",
    viewerSummary: "两个未杂化 p 轨道保持平行，在键轴上下两侧形成 π 电子云。",
    examNote: "π 键通常出现在双键和三键中，是判断双键刚性与共面的关键。",
  },
  {
    id: "doubleBond",
    label: "双键组成",
    title: "C=C 双键 = 1σ + 1π",
    description:
      "双键的第一部分是连接两个碳原子的 σ 键，第二部分是上下分布的 π 键。两者共同让 C=C 键更短、更强，并限制自由旋转。",
    points: ["σ 键提供沿键轴的连接", "π 键提供侧向重叠", "双键计数为 1σ + 1π"],
    viewerLabel: "C=C = 1σ + 1π",
    viewerTitle: "C=C 双键｜1 个 σ 键 + 1 个 π 键",
    viewerSummary: "σ 键提供沿键轴的连接，π 键提供侧向重叠并限制双键自由旋转。",
    examNote: "三键可类比为 1 个 σ 键 + 2 个互相垂直的 π 键。",
  },
];

export function getSigmaPiBondModeInfo(mode: SigmaPiBondMode): SigmaPiBondModeInfo {
  return sigmaPiBondModes.find((item) => item.id === mode) ?? sigmaPiBondModes[0];
}
