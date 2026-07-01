import type { OrganicCoplanarMode } from "@/types/molecule";

export type OrganicCoplanarModeInfo = {
  id: OrganicCoplanarMode;
  labelZh: string;
  titleZh: string;
  bodyZh: string;
  facts: Array<{ label: string; value: string }>;
  notes: string[];
  viewerTitle: string;
  viewerSummary: string;
};

export const organicCoplanarModes: OrganicCoplanarModeInfo[] = [
  {
    id: "overview",
    labelZh: "总览",
    titleZh: "多取代苯综合模型",
    bodyZh: "在同一个苯环上连接甲基、乙烯基、乙炔基和胺基，先建立整体空间图像，再分别判断不同片段的共面或共线特点。",
    facts: [
      { label: "示例结构", value: "C6H2(CH3)(CH=CH2)(C≡CH)(NH2)" },
      { label: "学习目标", value: "用一个 3D 模型串联平面、四面体、直线和单键旋转" },
    ],
    notes: [
      "苯环本身是平面结构。",
      "取代基后续原子不能一概认为都与苯环共面。",
      "本模型只做高中共线共面判断的定性示意。",
    ],
    viewerTitle: "多取代苯｜先建立整体空间图像",
    viewerSummary: "苯环、甲基、乙烯基、乙炔基和胺基具有不同的空间特征，需要分片段判断。",
  },
  {
    id: "benzenePlane",
    labelZh: "苯环平面",
    titleZh: "苯环是共面判断的起点",
    bodyZh: "苯环 6 个 C 和环上剩余 H 位于同一平面；直接连在苯环上的取代基首原子可以作为共面判断的起点。",
    facts: [
      { label: "参考平面", value: "苯环 xy 平面，z = 0" },
      { label: "环上 H", value: "四取代苯只保留 ringC3、ringC6 上的 2 个 H" },
    ],
    notes: [
      "不要表达成所有取代基都与苯环共面。",
      "取代基后续原子是否共面，还要继续结合 sp³、sp²、sp 和单键旋转判断。",
    ],
    viewerTitle: "苯环平面｜共面判断的参考面",
    viewerSummary: "苯环原子位于同一平面，但不能据此断定所有取代基后续原子都共面。",
  },
  {
    id: "sp3Carbon",
    labelZh: "sp³ 片段",
    titleZh: "甲基碳显示四面体空间性",
    bodyZh: "连接苯环的甲基 C 可以位于苯环平面附近，但甲基上的 3 个 H 呈四面体排布，不能强行全部放入苯环平面。",
    facts: [
      { label: "片段", value: "ringC1 - CH3" },
      { label: "杂化特点", value: "sp³，近似四面体" },
    ],
    notes: [
      "至少一个甲基 H 明显偏离苯环平面。",
      "sp³ 碳周围的原子一般体现三维空间分布。",
    ],
    viewerTitle: "sp³ 片段｜甲基呈四面体空间分布",
    viewerSummary: "连接苯环的甲基碳附近具有三维空间性，三个 H 不会全部落在苯环平面内。",
  },
  {
    id: "sp2Fragment",
    labelZh: "sp² 片段",
    titleZh: "乙烯基自身是平面片段",
    bodyZh: "乙烯基中的 C=C 双键使该片段自身保持平面；默认示例中，乙烯基平面与苯环平面约成 45° 夹角。",
    facts: [
      { label: "片段", value: "ringC2 - CH=CH2" },
      { label: "默认关系", value: "乙烯基平面与苯环平面有夹角" },
    ],
    notes: [
      "乙烯基自身平面，不等于默认就与苯环共面。",
      "芳环与乙烯基之间的连接单键可以旋转。",
    ],
    viewerTitle: "sp² 片段｜乙烯基自身保持平面",
    viewerSummary: "乙烯基自身共面，但它与苯环平面之间可以存在夹角。",
  },
  {
    id: "spFragment",
    labelZh: "sp 直线",
    titleZh: "乙炔基沿一条直线延伸",
    bodyZh: "-C≡CH 片段必须沿同一条直线排列，体现 sp 杂化碳的直线结构。",
    facts: [
      { label: "片段", value: "ringC4 - C≡CH" },
      { label: "空间特点", value: "三键片段共线，键角接近 180°" },
    ],
    notes: [
      "共线参考线只是教学辅助线，不是额外化学键。",
      "判断共线时优先寻找三键、直线形片段和苯环对位方向。",
    ],
    viewerTitle: "sp 片段｜乙炔基沿直线延伸",
    viewerSummary: "三键片段中的相关原子沿同一直线排列，键角接近 180°。",
  },
  {
    id: "amineGroup",
    labelZh: "胺基",
    titleZh: "胺基用于观察含氮片段空间性",
    bodyZh: "N、两个 H 和孤电子对用于展示含氮片段的空间性。本模块只做高中定性示意，不展开真实构象能量和复杂共轭理论。",
    facts: [
      { label: "片段", value: "ringC5 - NH2" },
      { label: "显示内容", value: "N-H 键与孤电子对示意" },
    ],
    notes: [
      "不要绝对化表达胺基一定平面或一定不平面。",
      "判断大分子共面时，胺基通常不是本模块的刚性平面核心。",
    ],
    viewerTitle: "胺基片段｜观察含氮结构的空间性",
    viewerSummary: "N、两个 H 和孤电子对构成空间示意，本模块不把胺基绝对化为固定平面。",
  },
  {
    id: "rotation",
    labelZh: "单键旋转",
    titleZh: "只旋转 ringC2 → vinylC1 单键",
    bodyZh: "点击“对齐平面”后，只让乙烯基片段绕 ringC2 → vinylC1 轴旋转到苯环 xy 平面，不改变甲基、乙炔基和胺基结构。",
    facts: [
      { label: "旋转轴", value: "ringC2 → vinylC1" },
      { label: "对齐效果", value: "苯环平面与乙烯基平面重合" },
    ],
    notes: [
      "单键旋转会影响能否找到更大的共面范围。",
      "对齐后高亮苯环、乙烯基和处于同一参考平面的相关原子。",
    ],
    viewerTitle: "单键旋转｜改变乙烯基与苯环的平面关系",
    viewerSummary: "只绕 ringC2 → vinylC1 单键旋转乙烯基，用于比较默认夹角与对齐状态。",
  },
];

export function getOrganicCoplanarModeInfo(mode: OrganicCoplanarMode): OrganicCoplanarModeInfo {
  return organicCoplanarModes.find((item) => item.id === mode) ?? organicCoplanarModes[0];
}
