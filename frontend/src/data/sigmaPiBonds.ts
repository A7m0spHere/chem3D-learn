export type OrbitalBondLessonType = "sigma" | "pi";
export type SigmaBondMode = "ss" | "sp";
export type PiBondMode = "before" | "forming" | "after";

export type OrbitalBondModeInfo = {
  id: SigmaBondMode | PiBondMode;
  label: string;
  title: string;
  state: string;
  viewerTitle: string;
  viewerSummary: string;
};

export type OrbitalBondLessonInfo = {
  type: OrbitalBondLessonType;
  title: string;
  modes: OrbitalBondModeInfo[];
};

export const sigmaBondModes: OrbitalBondModeInfo[] = [
  {
    id: "ss",
    label: "s-s σ 键",
    title: "s-s σ 键：两个球形轨道头碰头重叠",
    state: "沿键轴正面重叠",
    viewerTitle: "s-s σ 键｜球形轨道沿 X 轴正面重叠",
    viewerSummary: "两个 s 轨道沿键轴头碰头重叠，电子云主要集中在两核之间。",
  },
  {
    id: "sp",
    label: "s-p σ 键",
    title: "s-p σ 键：球形轨道与 p 轨道正面重叠",
    state: "沿键轴正面重叠",
    viewerTitle: "s-p σ 键｜s 轨道与 p 轨道头碰头重叠",
    viewerSummary: "s 轨道与沿键轴取向的 p 轨道正面重叠，同样形成 σ 键。",
  },
];

export const piBondModes: OrbitalBondModeInfo[] = [
  {
    id: "before",
    label: "成键前",
    title: "成键前：两个 p 轨道平行但尚未有效重叠",
    state: "平行取向，尚未有效重叠",
    viewerTitle: "p-p π 键｜成键前的平行 p 轨道",
    viewerSummary: "两个 p 轨道已经平行取向，但侧向重叠还很弱。",
  },
  {
    id: "forming",
    label: "成键中",
    title: "成键中：p 轨道开始肩并肩重叠",
    state: "p 轨道侧向重叠中",
    viewerTitle: "p-p π 键｜肩并肩重叠正在形成",
    viewerSummary: "平行 p 轨道侧向靠近，在键轴上下两侧形成 π 重叠区。",
  },
  {
    id: "after",
    label: "成键后",
    title: "成键后：键轴两侧形成 π 电子云",
    state: "π 电子云位于键轴两侧",
    viewerTitle: "p-p π 键｜键轴上下两侧的 π 电子云",
    viewerSummary: "两个平行 p 轨道侧向重叠，π 电子云分布在键轴上下两侧。",
  },
];

export const orbitalBondLessons: Record<OrbitalBondLessonType, OrbitalBondLessonInfo> = {
  sigma: {
    type: "sigma",
    title: "σ 键",
    modes: sigmaBondModes,
  },
  pi: {
    type: "pi",
    title: "π 键",
    modes: piBondModes,
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
