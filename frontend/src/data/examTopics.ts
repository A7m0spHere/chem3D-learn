export type DomainType = "晶体化学" | "有机立体" | "化学键与轨道" | "分子结构";
export type DifficultyType = "高考核心" | "高考提高" | "竞赛入门" | "竞赛拓展" | "竞赛挑战";

export interface ExamTopic {
  id: string;
  title: string;
  description: string;
  domain: DomainType;
  difficulty: DifficultyType;
  partition: "高频能力" | "高考真题结构" | "竞赛视野";
  route?: string;
}

export const examTopics: ExamTopic[] = [
  // === 晶体化学 · 高频能力 ===
  {
    id: "exam-crystal-formula",
    title: "晶胞均摊与化学式推导",
    description: "掌握晶胞顶点、棱、面心、体心的粒子均摊规则，快速推导化学式。",
    domain: "晶体化学",
    difficulty: "高考核心",
    partition: "高频能力",
    route: "/module/exam-crystal-formula",
  },
  {
    id: "exam-coordination-number",
    title: "配位数与最近邻粒子",
    description: "学会在复杂晶体中寻找原子的第一、第二最近邻并计数。",
    domain: "晶体化学",
    difficulty: "高考核心",
    partition: "高频能力",
    route: "/module/exam-coordination-number",
  },
  {
    id: "exam-fractional-coordinates",
    title: "晶胞内的分数坐标",
    description: "从三维坐标系理解原子位置，掌握分数坐标的投影与写法规。",
    domain: "晶体化学",
    difficulty: "高考提高",
    partition: "高频能力",
    route: "/module/exam-fractional-coordinates",
  },
  {
    id: "exam-crystal-density",
    title: "晶胞密度与 NA 计算",
    description: "利用晶胞参数与摩尔质量，求解密度或阿伏伽德罗常数的经典题型。",
    domain: "晶体化学",
    difficulty: "高考核心",
    partition: "高频能力",
    route: "/module/exam-crystal-density",
  },
  {
    id: "exam-interstitial-sites",
    title: "四面体与八面体空隙",
    description: "识别 FCC 与 HCP 堆积中的空隙位置、比例与填隙计算。",
    domain: "晶体化学",
    difficulty: "高考提高",
    partition: "高频能力",
    route: "/module/exam-interstitial-sites",
  },

  // === 晶体化学 · 高考真题结构 ===
  {
    id: "exam-nacl-cscl",
    title: "NaCl 与 CsCl 结构",
    description: "离子晶体基础模板，深入对比 6:6 与 8:8 配位的空间特征。",
    domain: "晶体化学",
    difficulty: "高考核心",
    partition: "高考真题结构",
    route: "/module/nacl", // 可以复用已有的
  },
  {
    id: "exam-diamond-si",
    title: "金刚石与单晶硅",
    description: "共价晶体典型代表，理解 C-C 键数与碳原子数 2:1 的比例关系。",
    domain: "晶体化学",
    difficulty: "高考核心",
    partition: "高考真题结构",
    route: "/module/exam-diamond-si",
  },
  {
    id: "exam-perovskite",
    title: "BaTiO₃ 钙钛矿结构",
    description: "近年高考热门，考查体心与面心混合配位情况及其衍生物。",
    domain: "晶体化学",
    difficulty: "高考提高",
    partition: "高考真题结构",
    route: "/module/exam-perovskite",
  },
  {
    id: "exam-fcc-hcp",
    title: "金属晶体密堆积",
    description: "面心立方(FCC)与六方最密(HCP)的空间结构差异与空间利用率推导。",
    domain: "晶体化学",
    difficulty: "高考提高",
    partition: "高考真题结构",
    route: "/module/exam-fcc-hcp",
  },

  // === 晶体化学 · 竞赛视野 ===
  {
    id: "exam-pba",
    title: "PBA 普鲁士蓝类似物",
    description: "经典配合物框架，认识过渡金属双金属配位晶胞。",
    domain: "晶体化学",
    difficulty: "竞赛入门",
    partition: "竞赛视野",
  },
  {
    id: "exam-zns",
    title: "ZnS 闪锌矿 / 纤锌矿",
    description: "两种晶型对比，探讨四面体配位在不同密堆积骨架中的呈现。",
    domain: "晶体化学",
    difficulty: "竞赛入门",
    partition: "竞赛视野",
  },
  {
    id: "exam-caf2",
    title: "CaF₂ 萤石 / 反萤石结构",
    description: "理解 8:4 与 4:8 配位模型及所有四面体空隙被填满的晶体学特征。",
    domain: "晶体化学",
    difficulty: "竞赛入门",
    partition: "竞赛视野",
  },
  {
    id: "exam-hbn",
    title: "h-BN 六方氮化硼",
    description: "层状结构的非碳材料，层间相互作用与石墨的区别。",
    domain: "晶体化学",
    difficulty: "竞赛入门",
    partition: "竞赛视野",
  },
  {
    id: "exam-mof",
    title: "MOF 多孔晶体",
    description: "金属有机框架材料的空间拓扑网络与孔道结构初步认知。",
    domain: "晶体化学",
    difficulty: "竞赛拓展",
    partition: "竞赛视野",
  },
  {
    id: "exam-mxene",
    title: "MXene 二维层状材料",
    description: "过渡金属碳化物二维剥离层状结构及表面端基空间分布。",
    domain: "晶体化学",
    difficulty: "竞赛拓展",
    partition: "竞赛视野",
  },
  {
    id: "exam-ren3",
    title: "ReN₃ 高压氮化物",
    description: "非极性强共价晶格在高压环境下的特殊配位方式。",
    domain: "晶体化学",
    difficulty: "竞赛拓展",
    partition: "竞赛视野",
  },
  {
    id: "exam-xeo",
    title: "XeO 特殊晶体结构",
    description: "稀有气体氧化物在高压或极端条件下的分子晶体或共价骨架结构。",
    domain: "晶体化学",
    difficulty: "竞赛挑战",
    partition: "竞赛视野",
  },
];
