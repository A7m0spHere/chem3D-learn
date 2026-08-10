import type { OrganicCoplanarMode } from "@/types/molecule";

export type OrganicCoplanarModeInfo = {
  id: OrganicCoplanarMode;
  labelZh: string;
  state: string;
  viewerTitle: string;
  viewerSummary: string;
};

export const organicCoplanarModes: OrganicCoplanarModeInfo[] = [
  {
    id: "overview",
    labelZh: "总览",
    state: "苯环连接四类空间片段",
    viewerTitle: "多取代苯｜先建立整体空间图像",
    viewerSummary: "这是理想化综合模型，不是单纯苯乙烯；各片段具有不同的空间特征，需要分片段判断。",
  },
  {
    id: "benzenePlane",
    labelZh: "苯环平面",
    state: "苯环参考平面已显示",
    viewerTitle: "苯环平面｜共面判断的参考面",
    viewerSummary: "苯环原子位于同一平面，但不能据此断定所有取代基后续原子都共面。",
  },
  {
    id: "sp3Carbon",
    labelZh: "sp³ 片段",
    state: "甲基呈四面体空间分布",
    viewerTitle: "sp³ 片段｜甲基呈四面体空间分布",
    viewerSummary: "连接苯环的甲基碳附近具有三维空间性，三个 H 不会全部落在苯环平面内。",
  },
  {
    id: "sp2Fragment",
    labelZh: "sp² 片段",
    state: "乙烯基自身近似共面",
    viewerTitle: "sp² 片段｜乙烯基自身保持平面",
    viewerSummary: "乙烯基自身近似共面；当前 45° 是理想化代表姿态，不是所有苯乙烯类结构的唯一构象。",
  },
  {
    id: "spFragment",
    labelZh: "sp 直线",
    state: "乙炔基沿直线延伸",
    viewerTitle: "sp 片段｜乙炔基沿直线延伸",
    viewerSummary: "三键片段中的相关原子沿同一直线排列，键角接近 180°。",
  },
  {
    id: "amineGroup",
    labelZh: "胺基",
    state: "含氮片段与孤电子对已显示",
    viewerTitle: "胺基片段｜观察含氮结构的空间性",
    viewerSummary: "N、两个 H 和孤电子对构成空间示意，本模块不把胺基绝对化为固定平面。",
  },
  {
    id: "rotation",
    labelZh: "单键旋转",
    state: "乙烯基可绕连接单键旋转",
    viewerTitle: "单键旋转｜改变乙烯基与苯环的平面关系",
    viewerSummary: "只绕 ringC2 → vinylC1 单键旋转乙烯基，用于比较默认夹角与对齐状态。",
  },
];

export function getOrganicCoplanarModeInfo(mode: OrganicCoplanarMode): OrganicCoplanarModeInfo {
  return organicCoplanarModes.find((item) => item.id === mode) ?? organicCoplanarModes[0];
}
