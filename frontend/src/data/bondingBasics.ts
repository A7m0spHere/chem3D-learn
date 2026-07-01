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

export type BondingBasicsModeInfo = {
  id: BondingBasicsMode;
  label: string;
  title: string;
  description: string;
  points: string[];
  viewerTitle: string;
  viewerSummary: string;
};

export type BondingBasicsLesson = {
  id: BondingBasicsModuleId;
  title: string;
  eyebrow: string;
  subtitle: string;
  badge: string;
  modelObject: string;
  modes: BondingBasicsModeInfo[];
  limitation: string;
};

export const bondingBasicsLessons: Record<BondingBasicsModuleId, BondingBasicsLesson> = {
  "hybrid-orbitals-sp": {
    id: "hybrid-orbitals-sp",
    title: "sp / sp² / sp³ 杂化轨道",
    eyebrow: "轨道基础专题",
    subtitle: "轨道数目与空间方向",
    badge: "杂化轨道",
    modelObject: "s 轨道与 p 轨道的方向重排示意",
    modes: [
      {
        id: "sp",
        label: "sp",
        title: "sp 杂化：两个方向相反的杂化轨道",
        description: "1 个 s 轨道和 1 个 p 轨道组合，形成 2 个方向相反的杂化轨道，夹角为 180°。",
        points: ["参与轨道数为 2", "空间排布为直线形", "常用于解释 CO₂、乙炔等直线结构"],
        viewerTitle: "sp 杂化｜两个杂化轨道沿 X 轴反向排布",
        viewerSummary: "sp 杂化形成 2 个方向相反的轨道，代表性夹角为 180°。",
      },
      {
        id: "sp2",
        label: "sp²",
        title: "sp² 杂化：三个轨道在同一平面内",
        description: "1 个 s 轨道和 2 个 p 轨道组合，形成 3 个共面的杂化轨道，彼此约 120°。",
        points: ["参与轨道数为 3", "三个方向位于同一平面", "常用于解释 BF₃、乙烯、苯环等平面结构"],
        viewerTitle: "sp² 杂化｜三个轨道平面三角分布",
        viewerSummary: "sp² 杂化形成 3 个共面方向，代表性夹角约 120°。",
      },
      {
        id: "sp3",
        label: "sp³",
        title: "sp³ 杂化：四个轨道指向四面体",
        description: "1 个 s 轨道和 3 个 p 轨道组合，形成 4 个指向四面体顶点的杂化轨道。",
        points: ["参与轨道数为 4", "空间排布为四面体", "常用于解释 CH₄、NH₃、H₂O 的电子域排布"],
        viewerTitle: "sp³ 杂化｜四个轨道指向四面体",
        viewerSummary: "sp³ 杂化形成 4 个四面体方向，代表性夹角约 109.5°。",
      },
    ],
    limitation: "这里用方向和形状帮助建立高中空间直觉，不代表真实轨道计算结果。",
  },
  "ionic-bond-formation": {
    id: "ionic-bond-formation",
    title: "离子键形成",
    eyebrow: "成键基础专题",
    subtitle: "电子转移与静电吸引",
    badge: "离子键",
    modelObject: "金属原子与非金属原子的电子转移示意",
    modes: [
      {
        id: "transfer",
        label: "电子转移",
        title: "第一步：电子从金属原子转移",
        description: "电负性差异较大时，金属原子容易失去电子，非金属原子容易得到电子。",
        points: ["左侧原子失去电子", "右侧原子得到电子", "电子转移后形成带电粒子"],
        viewerTitle: "离子键形成｜电子转移",
        viewerSummary: "一个电子从左侧原子转移到右侧原子，形成阳离子和阴离子。",
      },
      {
        id: "attraction",
        label: "静电吸引",
        title: "第二步：异号离子相互吸引",
        description: "电子转移后形成阳离子和阴离子，异号电荷之间的静电吸引使二者结合。",
        points: ["阳离子带正电", "阴离子带负电", "吸引力没有固定方向性"],
        viewerTitle: "离子键形成｜异号离子静电吸引",
        viewerSummary: "阳离子和阴离子通过静电吸引结合，不是共享一对电子。",
      },
      {
        id: "lattice",
        label: "离子排列",
        title: "第三步：大量离子形成有序排列",
        description: "在晶体中，不是一个阳离子只对应一个阴离子，而是大量阴阳离子按一定方式排列。",
        points: ["离子键通常无方向性", "离子晶体中存在周期性排列", "实际晶体结构要结合晶胞继续学习"],
        viewerTitle: "离子键形成｜阴阳离子的有序排列",
        viewerSummary: "大量阴阳离子靠静电作用形成有序结构，这里只做基础示意。",
      },
    ],
    limitation: "这里是高中基础示意，不展示真实晶格能计算或完整晶体周期结构。",
  },
  "coordinate-bond-formation": {
    id: "coordinate-bond-formation",
    title: "配位键形成",
    eyebrow: "成键基础专题",
    subtitle: "孤对电子提供与空轨道接受",
    badge: "配位键",
    modelObject: "电子对提供体与空轨道接受体",
    modes: [
      {
        id: "donor",
        label: "提供体",
        title: "第一步：提供体有可用孤对电子",
        description: "配位键的电子对由一方提供。提供体通常有可以参与成键的孤对电子。",
        points: ["提供体带有孤对电子", "接受体需要有空轨道", "先分清谁提供电子对"],
        viewerTitle: "配位键形成｜孤对电子提供体",
        viewerSummary: "左侧提供体带有孤对电子，右侧接受体有空轨道。",
      },
      {
        id: "overlap",
        label: "靠近重叠",
        title: "第二步：孤对电子进入空轨道方向",
        description: "提供体靠近接受体，孤对电子所在方向与接受体空轨道发生重叠。",
        points: ["电子对来自同一方", "空轨道负责接受", "形成过程仍可看作轨道重叠"],
        viewerTitle: "配位键形成｜孤对电子指向空轨道",
        viewerSummary: "提供体的孤对电子沿成键方向靠近接受体空轨道。",
      },
      {
        id: "formed",
        label: "形成后",
        title: "第三步：形成后与普通共价键类似",
        description: "配位键形成后，共用电子对位于两个原子之间，通常按共价键理解其空间连接。",
        points: ["形成前电子对来源特殊", "形成后是共用电子对", "考试中重点看形成条件"],
        viewerTitle: "配位键形成｜共用电子对连接两端",
        viewerSummary: "形成后的配位键可视为两个粒子之间的一条共价连接。",
      },
    ],
    limitation: "这里不展开配合物真实几何和能级，只帮助识别配位键形成条件。",
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
