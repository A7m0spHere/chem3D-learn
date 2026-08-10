import type { AcetyleneLinearMode } from "@/types/molecule";

export type AcetyleneLineView = "front" | "side";

export type AcetyleneLinearModeInfo = {
  id: AcetyleneLinearMode;
  label: string;
  title: string;
  state: string;
  viewerTitle: string;
  summary: string;
};

export const acetyleneLinearModes: AcetyleneLinearModeInfo[] = [
  {
    id: "overview",
    label: "整体结构",
    title: "乙炔的直线形骨架",
    state: "4 个原子共线",
    viewerTitle: "乙炔 C₂H₂｜H–C≡C–H 四原子共线",
    summary: "乙炔中两个 sp 碳和两个 H 位于同一直线，是判断共线与共面的基础直线母体。",
  },
  {
    id: "line",
    label: "共线验证",
    title: "用参考线验证四原子共线",
    state: "共线参考线已显示",
    viewerTitle: "共线参考线｜四个原子位于同一轴线",
    summary: "三键片段提供稳定直线轴，H–C≡C–H 的四个原子可作为共线判断的起点。",
  },
  {
    id: "angle",
    label: "键角",
    title: "乙炔中键角为 180°",
    state: "键角 180°",
    viewerTitle: "sp 碳｜直线形结构｜键角 180°",
    summary: "sp 杂化使两个 σ 键沿同一轴线反向排列，因此 H–C≡C 或 C≡C–H 键角为 180°。",
  },
  {
    id: "piBond",
    label: "π 键",
    title: "三键中有两组互相垂直的 π 键",
    state: "两组互相垂直的 π 键",
    viewerTitle: "C≡C 三键｜两组互相垂直的 π 键",
    summary: "两个 sp 碳各保留两组互相垂直的 p 轨道，侧向重叠形成两组 π 键示意。",
  },
  {
    id: "tripleBond",
    label: "三键组成",
    title: "C≡C 三键 = 1σ + 2π",
    state: "1 个 σ 键 + 2 个 π 键",
    viewerTitle: "C≡C 三键｜1 个 σ 键 + 2 个 π 键",
    summary: "三键由沿键轴的 1 个 σ 键和两组互相垂直的 π 键组成，是乙炔直线结构的重要原因。",
  },
];

export function getAcetyleneLinearModeInfo(mode: AcetyleneLinearMode): AcetyleneLinearModeInfo {
  return acetyleneLinearModes.find((item) => item.id === mode) ?? acetyleneLinearModes[0];
}
