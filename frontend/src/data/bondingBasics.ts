export type BondingBasicsModuleId =
  | "hybrid-orbitals-sp"
  | "ionic-bond-formation"
  | "coordinate-bond-formation";

export type BondingBasicsMode =
  | "sp"
  | "sp2"
  | "sp3"
  | "transfer"
  | "attraction"
  | "lattice"
  | "donor"
  | "overlap"
  | "formed";

export type HybridRenderMode = "solid" | "cloud";

export type HybridOrbitalControls = {
  progress: number;
  renderMode: HybridRenderMode;
  showUnhybridizedP: boolean;
  showAxes: boolean;
};

export type BondingBasicsModeInfo = {
  id: BondingBasicsMode;
  label: string;
  title: string;
  state: string;
  viewerTitle: string;
  viewerSummary: string;
  angleLabel?: string;
  structure?: string;
};

export type BondingBasicsLesson = {
  id: BondingBasicsModuleId;
  title: string;
  modes: BondingBasicsModeInfo[];
};

export const bondingBasicsLessons: Record<BondingBasicsModuleId, BondingBasicsLesson> = {
  "hybrid-orbitals-sp": {
    id: "hybrid-orbitals-sp",
    title: "sp / sp² / sp³ 杂化轨道",
    modes: [
      {
        id: "sp",
        label: "sp",
        title: "sp 杂化：两个方向相反的杂化轨道",
        state: "2 个杂化轨道，保留 2 组 p 轨道",
        viewerTitle: "sp 杂化｜两个杂化轨道沿 X 轴反向排布",
        viewerSummary: "sp 杂化形成 2 个方向相反的大头杂化轨道，夹角 180°；另保留 2 组未杂化 p 轨道。",
        angleLabel: "180°",
        structure: "直线形",
      },
      {
        id: "sp2",
        label: "sp²",
        title: "sp² 杂化：三个轨道在同一平面内",
        state: "3 个共面杂化轨道，保留 1 组 p 轨道",
        viewerTitle: "sp² 杂化｜三个轨道平面三角分布",
        viewerSummary: "sp² 杂化形成 3 个共面大头杂化轨道，夹角约 120°；另保留 1 组垂直平面的未杂化 p 轨道。",
        angleLabel: "120°",
        structure: "平面三角形",
      },
      {
        id: "sp3",
        label: "sp³",
        title: "sp³ 杂化：四个轨道指向四面体",
        state: "4 个四面体方向杂化轨道",
        viewerTitle: "sp³ 杂化｜四个轨道指向四面体",
        viewerSummary: "sp³ 杂化形成 4 个指向四面体顶点的大头杂化轨道，代表性夹角约 109.5°。",
        angleLabel: "109.5°",
        structure: "四面体方向",
      },
    ],
  },
  "ionic-bond-formation": {
    id: "ionic-bond-formation",
    title: "离子键形成",
    modes: [
      {
        id: "transfer",
        label: "电子转移",
        title: "第一步：电子从金属原子转移",
        state: "电子向非金属侧转移",
        viewerTitle: "离子键形成｜电子转移",
        viewerSummary: "一个电子从左侧原子转移到右侧原子，形成阳离子和阴离子。",
        structure: "电子转移示意",
      },
      {
        id: "attraction",
        label: "静电吸引",
        title: "第二步：异号离子相互吸引",
        state: "异号离子相互吸引",
        viewerTitle: "离子键形成｜异号离子静电吸引",
        viewerSummary: "阳离子和阴离子通过静电吸引结合，不是共享一对电子。",
        structure: "离子静电作用示意",
      },
      {
        id: "lattice",
        label: "离子排列",
        title: "第三步：大量离子形成有序排列",
        state: "阴阳离子有序排列",
        viewerTitle: "离子键形成｜阴阳离子的有序排列",
        viewerSummary: "大量阴阳离子靠静电作用形成有序结构，这里只做基础示意。",
        structure: "简化离子排列",
      },
    ],
  },
  "coordinate-bond-formation": {
    id: "coordinate-bond-formation",
    title: "配位键形成",
    modes: [
      {
        id: "donor",
        label: "提供体",
        title: "第一步：提供体有可用孤对电子",
        state: "孤对电子与空轨道已显示",
        viewerTitle: "配位键形成｜孤对电子提供体",
        viewerSummary: "左侧提供体带有孤对电子，右侧接受体有空轨道。",
        structure: "电子对提供 / 接受示意",
      },
      {
        id: "overlap",
        label: "靠近重叠",
        title: "第二步：孤对电子进入空轨道方向",
        state: "孤对电子靠近空轨道",
        viewerTitle: "配位键形成｜孤对电子指向空轨道",
        viewerSummary: "提供体的孤对电子沿成键方向靠近接受体空轨道。",
        structure: "轨道重叠示意",
      },
      {
        id: "formed",
        label: "形成后",
        title: "第三步：形成后与普通共价键类似",
        state: "共用电子对连接两端",
        viewerTitle: "配位键形成｜共用电子对连接两端",
        viewerSummary: "形成后的配位键可视为两个粒子之间的一条共价连接。",
        structure: "配位键形成示意",
      },
    ],
  },
};

export function isBondingBasicsModuleId(id: string): id is BondingBasicsModuleId {
  return id in bondingBasicsLessons;
}

export function getBondingBasicsLesson(id: BondingBasicsModuleId): BondingBasicsLesson {
  return bondingBasicsLessons[id];
}

export function getDefaultBondingBasicsMode(id: BondingBasicsModuleId): BondingBasicsMode {
  return bondingBasicsLessons[id].modes[0].id;
}

export function getBondingBasicsModeInfo(
  moduleId: BondingBasicsModuleId,
  mode: BondingBasicsMode,
): BondingBasicsModeInfo {
  const lesson = getBondingBasicsLesson(moduleId);
  return lesson.modes.find((item) => item.id === mode) ?? lesson.modes[0];
}
