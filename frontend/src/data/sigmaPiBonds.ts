export type OrbitalBondLessonType = "sigma" | "pi";
export type SigmaBondMode = "ss" | "sp";
export type PiBondMode = "before" | "forming" | "after";

export type OrbitalBondModeInfo = {
  id: SigmaBondMode | PiBondMode;
  label: string;
  title: string;
  description: string;
  points: string[];
  viewerTitle: string;
  viewerSummary: string;
  examNote: string;
};

export type OrbitalBondLessonInfo = {
  type: OrbitalBondLessonType;
  title: string;
  eyebrow: string;
  subtitle: string;
  modelObject: string;
  badge: string;
  modes: OrbitalBondModeInfo[];
  limitation: string;
};

export const sigmaBondModes: OrbitalBondModeInfo[] = [
  {
    id: "ss",
    label: "s-s σ 键",
    title: "s-s σ 键：两个球形轨道头碰头重叠",
    description:
      "两个 s 轨道沿两核连线方向靠近，电子云在两核之间集中。因为重叠区围绕键轴近似对称，所以形成 σ 键。",
    points: ["X 轴表示两核连线，也是键轴", "两个 s 轨道都是球形电子云", "重叠区集中在两个原子核之间"],
    viewerTitle: "s-s σ 键｜球形轨道沿 X 轴正面重叠",
    viewerSummary: "两个 s 轨道沿键轴头碰头重叠，电子云主要集中在两核之间。",
    examNote: "判断 σ 键时，抓住“沿键轴正面重叠、绕键轴近似对称”这两个关键词。",
  },
  {
    id: "sp",
    label: "s-p σ 键",
    title: "s-p σ 键：球形轨道与 p 轨道正面重叠",
    description:
      "s 轨道可以和沿键轴取向的 p 轨道头碰头重叠。只要重叠发生在两核连线方向上，也属于 σ 键。",
    points: ["左侧是球形 s 轨道", "右侧 p 轨道沿 X 轴取向", "靠近键轴的一端与 s 轨道正面重叠"],
    viewerTitle: "s-p σ 键｜s 轨道与 p 轨道头碰头重叠",
    viewerSummary: "s 轨道与沿键轴取向的 p 轨道正面重叠，同样形成 σ 键。",
    examNote: "σ 键不只来自 s-s；s-p、p-p 只要沿键轴正面重叠，也按 σ 键理解。",
  },
];

export const piBondModes: OrbitalBondModeInfo[] = [
  {
    id: "before",
    label: "成键前",
    title: "成键前：两个 p 轨道平行但尚未有效重叠",
    description:
      "两个 p 轨道都垂直于键轴，并保持互相平行。此时原子核距离较远，侧向重叠还不明显。",
    points: ["X 轴表示两核连线", "p 轨道沿 Z 方向伸展", "两个 p 轨道必须保持平行"],
    viewerTitle: "p-p π 键｜成键前的平行 p 轨道",
    viewerSummary: "两个 p 轨道已经平行取向，但侧向重叠还很弱。",
    examNote: "π 键的前提是 p 轨道平行；如果旋转破坏平行关系，π 重叠会减弱或消失。",
  },
  {
    id: "forming",
    label: "成键中",
    title: "成键中：p 轨道开始肩并肩重叠",
    description:
      "两个平行 p 轨道从侧面靠近，键轴上方和下方分别出现连续的电子云重叠区域。",
    points: ["重叠不是沿键轴正面发生", "上方一组电子云开始连通", "下方一组电子云也同步连通"],
    viewerTitle: "p-p π 键｜肩并肩重叠正在形成",
    viewerSummary: "平行 p 轨道侧向靠近，在键轴上下两侧形成 π 重叠区。",
    examNote: "π 键的电子云不在键轴正中央，而在键轴上下或左右两侧。",
  },
  {
    id: "after",
    label: "成键后",
    title: "成键后：键轴两侧形成 π 电子云",
    description:
      "成键后，两个 p 轨道的侧向重叠稳定下来，电子云主要分布在键轴上下两侧，而不是集中在键轴上。",
    points: ["p-p 侧向重叠形成 π 键", "π 电子云位于键轴上下两侧", "轨道平行性决定 π 键是否能保持"],
    viewerTitle: "p-p π 键｜键轴上下两侧的 π 电子云",
    viewerSummary: "两个平行 p 轨道侧向重叠，π 电子云分布在键轴上下两侧。",
    examNote: "双键和三键中的 π 键会限制自由旋转，本质上是为了保持 p 轨道平行重叠。",
  },
];

export const orbitalBondLessons: Record<OrbitalBondLessonType, OrbitalBondLessonInfo> = {
  sigma: {
    type: "sigma",
    title: "σ 键",
    eyebrow: "轨道重叠专题",
    subtitle: "沿键轴头碰头重叠",
    modelObject: "s-s 与 s-p 轨道重叠",
    badge: "正面重叠",
    modes: sigmaBondModes,
    limitation: "这里的轨道和电子云是高中课堂教学示意，不是真实量子化学电子密度计算图。",
  },
  pi: {
    type: "pi",
    title: "π 键",
    eyebrow: "轨道重叠专题",
    subtitle: "p-p 轨道肩并肩重叠",
    modelObject: "p-p 侧向重叠过程",
    badge: "侧向重叠",
    modes: piBondModes,
    limitation: "这里的轨道和电子云是高中课堂教学示意，不是真实量子化学电子密度计算图。",
  },
};

export function getOrbitalBondLesson(type: OrbitalBondLessonType): OrbitalBondLessonInfo {
  return orbitalBondLessons[type];
}

export function getOrbitalBondModeInfo(
  type: "sigma",
  mode: SigmaBondMode,
): OrbitalBondModeInfo;
export function getOrbitalBondModeInfo(type: "pi", mode: PiBondMode): OrbitalBondModeInfo;
export function getOrbitalBondModeInfo(
  type: OrbitalBondLessonType,
  mode: SigmaBondMode | PiBondMode,
): OrbitalBondModeInfo {
  const lesson = getOrbitalBondLesson(type);
  return lesson.modes.find((item) => item.id === mode) ?? lesson.modes[0];
}
