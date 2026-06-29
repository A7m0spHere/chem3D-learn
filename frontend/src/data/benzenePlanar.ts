import type { BenzenePlanarMode } from "@/types/molecule";

export type BenzenePlaneView = "top" | "side";

export type BenzenePlanarModeInfo = {
  id: BenzenePlanarMode;
  label: string;
  title: string;
  description: string;
  points: string[];
  viewerTitle: string;
  summary: string;
};

export const benzenePlanarModes: BenzenePlanarModeInfo[] = [
  {
    id: "overview",
    label: "整体结构",
    title: "苯环的正六边形骨架",
    description:
      "苯 C₆H₆ 中 6 个碳原子组成近似正六边形，6 个氢原子向外延伸，12 个原子整体位于同一平面内。",
    points: ["6 个 C 构成正六边形", "6 个 H 向环外延伸", "12 个原子都在同一平面"],
    viewerTitle: "苯 C₆H₆｜12 个原子大共面",
    summary: "苯环是判断有机物共面问题的基础母体：6 个 C 和 6 个 H 可视为同一平面内的 12 个原子。",
  },
  {
    id: "plane",
    label: "共面验证",
    title: "用参考平面验证 12 原子共面",
    description:
      "从俯视角可以看到苯环的正六边形，从侧视角可以看到 C 和 H 都贴近同一参考平面。",
    points: ["俯视观察正六边形", "侧视验证 12 原子共面", "共面平面是后续取代基判断的起点"],
    viewerTitle: "苯环平面｜12 个原子位于同一参考平面",
    summary: "苯环本身提供一个稳定的共面参考面，复杂有机物共面判断通常先从这个平面出发。",
  },
  {
    id: "angle",
    label: "键角",
    title: "苯环上每个碳近似 120°",
    description:
      "苯环中每个碳原子近似 sp² 杂化，周围三个 σ 键方向在平面内分布，局部键角约为 120°。",
    points: ["每个环 C 近似 sp²", "局部呈平面三角结构", "代表性键角约 120°"],
    viewerTitle: "苯环碳｜sp² 平面三角｜键角约 120°",
    summary: "每个环碳周围有 3 个 σ 键方向，近似平面三角形，因此苯环上的代表性键角约 120°。",
  },
  {
    id: "diagonal",
    label: "对位共线",
    title: "对位方向上的四原子共线",
    description:
      "苯环的正六边形结构使对位方向形成一条直线，可用于判断某些题目中的共线原子。",
    points: ["选一条穿过环中心的对位方向", "H-C-C-H 四个原子在同一直线上", "共线原子必然也共面"],
    viewerTitle: "对位方向｜H–C–C–H 四原子共线",
    summary: "苯环上相对的两个 C 及其外侧 H 位于同一直线，这是共线共面判断中的常用观察点。",
  },
  {
    id: "piBond",
    label: "大 π 键",
    title: "离域大 π 键维持平面性",
    description:
      "6 个环碳各有一个垂直于环平面的 p 轨道，侧向重叠形成离域大 π 键。这里使用高中课堂示意图表达，不代表精确轨道计算。",
    points: ["p 轨道垂直于苯环平面", "π 电子云分布在平面上下", "大 π 键解释苯环稳定平面结构"],
    viewerTitle: "苯环大 π 键｜平面上下的离域电子云",
    summary: "6 个垂直于平面的 p 轨道侧向重叠，形成分布在苯环上下的大 π 电子云示意。",
  },
];

export function getBenzenePlanarModeInfo(mode: BenzenePlanarMode): BenzenePlanarModeInfo {
  return benzenePlanarModes.find((item) => item.id === mode) ?? benzenePlanarModes[0];
}
