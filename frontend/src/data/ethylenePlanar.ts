import type { EthylenePlanarMode } from "@/types/molecule";

export type EthylenePlaneView = "top" | "side";

export type EthylenePlanarModeInfo = {
  id: EthylenePlanarMode;
  label: string;
  title: string;
  description: string;
  points: string[];
  viewerTitle: string;
  summary: string;
};

export const ethylenePlanarModes: EthylenePlanarModeInfo[] = [
  {
    id: "overview",
    label: "整体结构",
    title: "乙烯的平面结构",
    description:
      "乙烯 C₂H₄ 中，每个碳原子周围有 3 个电子域，采用 sp² 杂化，形成近似平面三角形结构。两个碳原子通过 C=C 双键连接，整个分子的 2 个 C 和 4 个 H 位于同一平面内。",
    points: ["6 个原子共面", "每个 C 近似平面三角形", "C=C 双键限制旋转"],
    viewerTitle: "乙烯 C₂H₄｜所有原子近似共面",
    summary: "每个碳原子采用 sp² 杂化，乙烯的 2 个 C 和 4 个 H 位于同一平面内。",
  },
  {
    id: "plane",
    label: "共面验证",
    title: "用空间平面验证共面",
    description:
      "判断共面时，不是只看结构式，而是看原子是否能落在同一个空间平面上。乙烯中 2 个 C 和 4 个 H 都位于同一平面，因此乙烯是典型的平面分子。",
    points: ["所有原子落在同一平面", "侧视角可以验证共面", "共面性来自 sp² 构型和 π 键要求"],
    viewerTitle: "乙烯 C₂H₄｜六个原子位于同一平面",
    summary: "两个 sp² 碳和四个 H 原子位于同一分子平面，侧视时可以直接验证。",
  },
  {
    id: "angle",
    label: "键角",
    title: "键角约 120°",
    description:
      "乙烯中每个碳原子是 sp² 杂化，三个 σ 键方向尽量远离，形成近似平面三角形，因此键角接近 120°。",
    points: ["每个 C 为 sp² 杂化", "三个 σ 键方向近似平面三角形", "键角写作约 120° 或 ≈120°"],
    viewerTitle: "sp² 碳｜平面三角结构｜键角约 120°",
    summary: "每个 C 周围有 3 个 σ 键电子域，采用 sp² 杂化，因此局部近似平面三角形。",
  },
  {
    id: "piBond",
    label: "π 键",
    title: "双键中的 π 键",
    description:
      "C=C 双键不是两根完全相同的单键，而是由 1 个 σ 键和 1 个 π 键组成。π 键来自两个碳原子未杂化 p 轨道的侧向重叠，p 轨道垂直于分子平面。",
    points: ["双键 = 1 个 σ 键 + 1 个 π 键", "p 轨道垂直于分子平面", "π 键由 p 轨道侧向重叠形成"],
    viewerTitle: "C=C 双键｜1 个 σ 键 + 1 个 π 键",
    summary: "两个未杂化 p 轨道保持平行并侧向重叠，在分子平面上下形成 π 键。",
  },
  {
    id: "rotationLock",
    label: "旋转限制",
    title: "C=C 双键不能自由旋转",
    description:
      "单键通常可以绕键轴旋转，但 C=C 双键不能自由旋转。原因是 π 键需要两个 p 轨道保持平行侧向重叠。如果绕双键旋转，p 轨道重叠被破坏，π 键也会被破坏。",
    points: ["C=C 双键有旋转限制", "旋转会破坏 p 轨道平行重叠", "这是乙烯保持平面结构的重要原因"],
    viewerTitle: "C=C 双键｜不能自由旋转",
    summary: "绕 C=C 扭转会破坏 p 轨道的平行侧向重叠，因此双键不能像单键一样自由旋转。",
  },
];

export function getEthylenePlanarModeInfo(mode: EthylenePlanarMode): EthylenePlanarModeInfo {
  return ethylenePlanarModes.find((item) => item.id === mode) ?? ethylenePlanarModes[0];
}
