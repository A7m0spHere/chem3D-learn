import type { BenzenePlanarMode } from "@/types/molecule";

export type BenzenePlaneView = "top" | "side";

export type BenzenePlanarModeInfo = {
  id: BenzenePlanarMode;
  label: string;
  title: string;
  state: string;
  viewerTitle: string;
  summary: string;
};

export const benzenePlanarModes: BenzenePlanarModeInfo[] = [
  {
    id: "overview",
    label: "整体结构",
    title: "苯环的正六边形骨架",
    state: "12 个原子近似共面",
    viewerTitle: "苯 C₆H₆｜12 个原子大共面",
    summary: "苯环是判断有机物共面问题的基础母体：6 个 C 和 6 个 H 可视为同一平面内的 12 个原子。",
  },
  {
    id: "plane",
    label: "共面验证",
    title: "用参考平面验证 12 原子共面",
    state: "参考平面已显示",
    viewerTitle: "苯环平面｜12 个原子位于同一参考平面",
    summary: "苯环本身提供一个稳定的共面参考面，复杂有机物共面判断通常先从这个平面出发。",
  },
  {
    id: "angle",
    label: "键角",
    title: "苯环上每个碳近似 120°",
    state: "代表性键角约 120°",
    viewerTitle: "苯环碳｜sp² 平面三角｜键角约 120°",
    summary: "每个环碳周围有 3 个 σ 键方向，近似平面三角形，因此苯环上的代表性键角约 120°。",
  },
  {
    id: "diagonal",
    label: "对位共线",
    title: "对位方向上的四原子共线",
    state: "H–C–C–H 参考线已显示",
    viewerTitle: "对位方向｜H–C–C–H 四原子共线",
    summary: "苯环上相对的两个 C 及其外侧 H 位于同一直线，这是共线共面判断中的常用观察点。",
  },
  {
    id: "piBond",
    label: "大 π 键",
    title: "离域大 π 键维持平面性",
    state: "离域 π 电子云已显示",
    viewerTitle: "苯环大 π 键｜平面上下的离域电子云",
    summary: "6 个垂直于平面的 p 轨道侧向重叠，形成分布在苯环上下的大 π 电子云示意。",
  },
];

export function getBenzenePlanarModeInfo(mode: BenzenePlanarMode): BenzenePlanarModeInfo {
  return benzenePlanarModes.find((item) => item.id === mode) ?? benzenePlanarModes[0];
}
