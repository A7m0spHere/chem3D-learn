import type { EthylenePlanarMode } from "@/types/molecule";

export type EthylenePlaneView = "top" | "side";

export type EthylenePlanarModeInfo = {
  id: EthylenePlanarMode;
  label: string;
  title: string;
  state: string;
  viewerTitle: string;
  summary: string;
};

export const ethylenePlanarModes: EthylenePlanarModeInfo[] = [
  {
    id: "overview",
    label: "整体结构",
    title: "乙烯的平面结构",
    state: "6 个原子近似共面",
    viewerTitle: "乙烯 C₂H₄｜所有原子近似共面",
    summary: "每个碳原子采用 sp² 杂化，乙烯的 2 个 C 和 4 个 H 位于同一平面内。",
  },
  {
    id: "plane",
    label: "共面验证",
    title: "用空间平面验证共面",
    state: "参考平面已显示",
    viewerTitle: "乙烯 C₂H₄｜六个原子位于同一平面",
    summary: "两个 sp² 碳和四个 H 原子位于同一分子平面，侧视时可以直接验证。",
  },
  {
    id: "angle",
    label: "键角",
    title: "键角约 120°",
    state: "代表性键角约 120°",
    viewerTitle: "sp² 碳｜平面三角结构｜键角约 120°",
    summary: "每个 C 周围有 3 个 σ 键电子域，采用 sp² 杂化，因此局部近似平面三角形。",
  },
  {
    id: "piBond",
    label: "π 键",
    title: "双键中的 π 键",
    state: "p 轨道与 π 电子云已显示",
    viewerTitle: "C=C 双键｜1 个 σ 键 + 1 个 π 键",
    summary: "两个未杂化 p 轨道保持平行并侧向重叠，在分子平面上下形成 π 键。",
  },
  {
    id: "rotationLock",
    label: "旋转限制",
    title: "C=C 双键不能自由旋转",
    state: "双键扭转受限",
    viewerTitle: "C=C 双键｜不能自由旋转",
    summary: "绕 C=C 扭转会破坏 p 轨道的平行侧向重叠，因此双键不能像单键一样自由旋转。",
  },
];

export function getEthylenePlanarModeInfo(mode: EthylenePlanarMode): EthylenePlanarModeInfo {
  return ethylenePlanarModes.find((item) => item.id === mode) ?? ethylenePlanarModes[0];
}
