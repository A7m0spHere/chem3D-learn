import type { AcetyleneLinearMode } from "@/types/molecule";

export type AcetyleneLineView = "front" | "side";

export type AcetyleneLinearModeInfo = {
  id: AcetyleneLinearMode;
  label: string;
  title: string;
  description: string;
  points: string[];
  viewerTitle: string;
  summary: string;
};

export const acetyleneLinearModes: AcetyleneLinearModeInfo[] = [
  {
    id: "overview",
    label: "整体结构",
    title: "乙炔的直线形骨架",
    description:
      "乙炔 C₂H₂ 的四个原子按 H–C≡C–H 排列在同一直线上，是有机物共线判断中最基础的母体之一。",
    points: ["4 个原子共线", "两个碳原子之间是三键", "共线原子必然也共面"],
    viewerTitle: "乙炔 C₂H₂｜H–C≡C–H 四原子共线",
    summary: "乙炔中两个 sp 碳和两个 H 位于同一直线，是判断共线与共面的基础直线母体。",
  },
  {
    id: "line",
    label: "共线验证",
    title: "用参考线验证四原子共线",
    description:
      "从正视角可以看到 H–C≡C–H 完整直线，侧视角可以验证四个原子没有偏离同一条轴线。",
    points: ["参考线穿过全部 4 个原子", "侧视时仍贴合直线轴", "共线判断优先寻找三键片段"],
    viewerTitle: "共线参考线｜四个原子位于同一轴线",
    summary: "三键片段提供稳定直线轴，H–C≡C–H 的四个原子可作为共线判断的起点。",
  },
  {
    id: "angle",
    label: "键角",
    title: "乙炔中键角为 180°",
    description:
      "乙炔中每个碳原子采用 sp 杂化，两个 σ 键方向相反，形成直线形结构，键角为 180°。",
    points: ["每个 C 为 sp 杂化", "两个 σ 键方向相反", "代表性键角 180°"],
    viewerTitle: "sp 碳｜直线形结构｜键角 180°",
    summary: "sp 杂化使两个 σ 键沿同一轴线反向排列，因此 H–C≡C 或 C≡C–H 键角为 180°。",
  },
  {
    id: "piBond",
    label: "π 键",
    title: "三键中有两组互相垂直的 π 键",
    description:
      "C≡C 三键包含 1 个 σ 键和 2 个 π 键。两组 π 电子云位于互相垂直的方向上，这里只做高中课堂示意。",
    points: ["两个未杂化 p 轨道方向互相垂直", "形成两组 π 电子云", "三键片段保持直线形"],
    viewerTitle: "C≡C 三键｜两组互相垂直的 π 键",
    summary: "两个 sp 碳各保留两组互相垂直的 p 轨道，侧向重叠形成两组 π 键示意。",
  },
  {
    id: "tripleBond",
    label: "三键组成",
    title: "C≡C 三键 = 1σ + 2π",
    description:
      "三键不是三根完全相同的单键，而是由 1 个沿键轴的 σ 键和 2 个互相垂直的 π 键共同组成。",
    points: ["σ 键沿 C-C 键轴", "两组 π 键互相垂直", "三键计数为 1σ + 2π"],
    viewerTitle: "C≡C 三键｜1 个 σ 键 + 2 个 π 键",
    summary: "三键由沿键轴的 1 个 σ 键和两组互相垂直的 π 键组成，是乙炔直线结构的重要原因。",
  },
];

export function getAcetyleneLinearModeInfo(mode: AcetyleneLinearMode): AcetyleneLinearModeInfo {
  return acetyleneLinearModes.find((item) => item.id === mode) ?? acetyleneLinearModes[0];
}
