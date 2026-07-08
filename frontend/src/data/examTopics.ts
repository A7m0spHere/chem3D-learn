export type DomainType = "晶体化学" | "有机立体" | "化学键与轨道" | "分子结构";
export type DifficultyType = "高考核心" | "高考提高" | "竞赛入门" | "竞赛拓展" | "竞赛挑战";
export type ExamTopicStatus = "ready" | "planned";

export interface ExamTopic {
  id: string;
  title: string;
  description: string;
  domain: DomainType;
  difficulty: DifficultyType;
  partition: "高频能力" | "高考真题结构" | "竞赛视野";
  status: ExamTopicStatus;
  route?: string;
}

export interface ExamTopicStep {
  title: string;
  body: string;
  formula?: string;
}

export interface ExamTopicDetail {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  coreSteps: ExamTopicStep[];
  commonMistakes: string[];
  relatedModuleIds: string[];
  classroomPrompt: string;
  examTip: string;
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
    status: "ready",
    route: "/exam/exam-crystal-formula",
  },
  {
    id: "exam-coordination-number",
    title: "配位数与最近邻粒子",
    description: "学会在复杂晶体中寻找原子的第一、第二最近邻并计数。",
    domain: "晶体化学",
    difficulty: "高考核心",
    partition: "高频能力",
    status: "ready",
    route: "/exam/exam-coordination-number",
  },
  {
    id: "exam-fractional-coordinates",
    title: "晶胞内的分数坐标",
    description: "从三维坐标系理解原子位置，掌握分数坐标的投影与写法。",
    domain: "晶体化学",
    difficulty: "高考提高",
    partition: "高频能力",
    status: "ready",
    route: "/exam/exam-fractional-coordinates",
  },
  {
    id: "exam-crystal-density",
    title: "晶胞密度与 NA 计算",
    description: "利用晶胞参数与摩尔质量，求解密度或阿伏伽德罗常数的经典题型。",
    domain: "晶体化学",
    difficulty: "高考核心",
    partition: "高频能力",
    status: "ready",
    route: "/exam/exam-crystal-density",
  },
  {
    id: "exam-interstitial-sites",
    title: "四面体与八面体空隙",
    description: "识别 FCC 与 HCP 堆积中的空隙位置、比例与填隙计算。",
    domain: "晶体化学",
    difficulty: "高考提高",
    partition: "高频能力",
    status: "ready",
    route: "/exam/exam-interstitial-sites",
  },

  // === 晶体化学 · 高考真题结构 ===
  {
    id: "exam-nacl-cscl",
    title: "NaCl 与 CsCl 结构",
    description: "离子晶体基础模板，深入对比 6:6 与 8:8 配位的空间特征。",
    domain: "晶体化学",
    difficulty: "高考核心",
    partition: "高考真题结构",
    status: "ready",
    route: "/module/nacl-crystal",
  },
  {
    id: "exam-diamond-si",
    title: "金刚石与单晶硅",
    description: "共价晶体典型代表，理解 C-C 键数与碳原子数 2:1 的比例关系。",
    domain: "晶体化学",
    difficulty: "高考核心",
    partition: "高考真题结构",
    status: "ready",
    route: "/exam/exam-diamond-si",
  },
  {
    id: "exam-perovskite",
    title: "BaTiO₃ 钙钛矿结构",
    description: "近年高考热门，考查体心与面心混合配位情况及其衍生物。",
    domain: "晶体化学",
    difficulty: "高考提高",
    partition: "高考真题结构",
    status: "planned",
  },
  {
    id: "exam-fcc-hcp",
    title: "金属晶体密堆积",
    description: "面心立方(FCC)与六方最密(HCP)的空间结构差异与空间利用率推导。",
    domain: "晶体化学",
    difficulty: "高考提高",
    partition: "高考真题结构",
    status: "planned",
  },

  // === 晶体化学 · 竞赛视野 ===
  {
    id: "exam-pba",
    title: "PBA 普鲁士蓝类似物",
    description: "经典配合物框架，认识过渡金属双金属配位晶胞。",
    domain: "晶体化学",
    difficulty: "竞赛入门",
    partition: "竞赛视野",
    status: "ready",
    route: "/module/pba-prussian-blue-analogues",
  },
  {
    id: "exam-zns",
    title: "ZnS 闪锌矿 / 纤锌矿",
    description: "两种晶型对比，探讨四面体配位在不同密堆积骨架中的呈现。",
    domain: "晶体化学",
    difficulty: "竞赛入门",
    partition: "竞赛视野",
    status: "planned",
  },
  {
    id: "exam-caf2",
    title: "CaF₂ 萤石 / 反萤石结构",
    description: "理解 8:4 与 4:8 配位模型及所有四面体空隙被填满的晶体学特征。",
    domain: "晶体化学",
    difficulty: "竞赛入门",
    partition: "竞赛视野",
    status: "planned",
  },
  {
    id: "exam-hbn",
    title: "h-BN 六方氮化硼",
    description: "层状结构的非碳材料，层间相互作用与石墨的区别。",
    domain: "晶体化学",
    difficulty: "竞赛入门",
    partition: "竞赛视野",
    status: "ready",
    route: "/module/hbn-structure",
  },
  {
    id: "exam-mof",
    title: "MOF 多孔晶体",
    description: "金属有机框架材料的空间拓扑网络与孔道结构初步认知。",
    domain: "晶体化学",
    difficulty: "竞赛拓展",
    partition: "竞赛视野",
    status: "planned",
  },
  {
    id: "exam-mxene",
    title: "MXene 二维层状材料",
    description: "过渡金属碳化物二维剥离层状结构及表面端基空间分布。",
    domain: "晶体化学",
    difficulty: "竞赛拓展",
    partition: "竞赛视野",
    status: "planned",
  },
  {
    id: "exam-ren3",
    title: "ReN₃ 高压氮化物",
    description: "非极性强共价晶格在高压环境下的特殊配位方式。",
    domain: "晶体化学",
    difficulty: "竞赛拓展",
    partition: "竞赛视野",
    status: "planned",
  },
  {
    id: "exam-xeo",
    title: "XeO 特殊晶体结构",
    description: "稀有气体氧化物在高压或极端条件下的分子晶体或共价骨架结构。",
    domain: "晶体化学",
    difficulty: "竞赛挑战",
    partition: "竞赛视野",
    status: "planned",
  },
];

export const examTopicDetails: ExamTopicDetail[] = [
  {
    id: "exam-crystal-formula",
    title: "晶胞均摊与化学式推导",
    subtitle: "先数位置，再算归属，最后化简比例",
    summary:
      "晶胞化学式不是数图中画了几个球，而是计算每类粒子平均属于一个晶胞的数量，再化成最简整数比。",
    coreSteps: [
      {
        title: "识别粒子所在位置",
        body: "先把每一类粒子按顶点、棱心、面心、体心、晶胞内部分组，不同元素或离子分开统计。",
        formula: "顶点 1/8 · 棱心 1/4 · 面心 1/2 · 体心 1",
      },
      {
        title: "分别计算平均占有数",
        body: "同一类粒子的贡献相加，得到每个晶胞中这种粒子的平均个数。晶胞内部粒子通常完整属于本晶胞。",
      },
      {
        title: "化成最简整数比",
        body: "把各类粒子平均数写成比例，约成最简整数比，得到化学式或晶胞中式量单位数。",
      },
    ],
    commonMistakes: [
      "把图里画出的球数直接当作晶胞粒子数。",
      "只统计一种粒子，忘记阴阳离子或不同原子要分别均摊。",
      "把面心 1/2、棱心 1/4 和体心 1 混淆。",
    ],
    relatedModuleIds: ["sodium-metal-crystal", "nacl-crystal", "cscl-crystal"],
    classroomPrompt: "投影时先让学生只数顶点，再打开完整晶胞，强调“画出来”不等于“完全属于”。",
    examTip: "遇到陌生晶胞，先写位置贡献表，再代入比例；不要先猜化学式。",
  },
  {
    id: "exam-coordination-number",
    title: "配位数与最近邻粒子",
    subtitle: "配位数看距离，不看晶胞里画了几个",
    summary:
      "配位数表示一个粒子周围最近邻异号离子或相邻粒子的个数，关键是锁定目标粒子并寻找所有等距离的最近邻。",
    coreSteps: [
      {
        title: "锁定一个目标粒子",
        body: "选定一个原子或离子作为中心，最好选高对称位置，例如体心、面心或晶胞中心附近的粒子。",
      },
      {
        title: "寻找第一近邻",
        body: "只统计距离最近且等距离的一圈粒子。离子晶体中通常先看异号离子，金属晶体中看最近的同种原子。",
      },
      {
        title: "用周期延展补全",
        body: "晶胞边界外还有相邻晶胞。边界附近的最近邻不能只看当前晶胞内画出的部分。",
      },
    ],
    commonMistakes: [
      "把一个晶胞中的粒子数当作配位数。",
      "从二维投影图数邻居，漏掉前后方向的粒子。",
      "把第二近邻也算进第一配位层。",
    ],
    relatedModuleIds: ["nacl-crystal", "cscl-crystal", "zinc-metal-crystal"],
    classroomPrompt: "先在 NaCl 中数 6 个最近邻，再切换 CsCl 对比 8 个最近邻，让学生看到配位数来自空间包围。",
    examTip: "题目问配位数时，优先画出目标粒子的局部包围结构，而不是完整晶胞。",
  },
  {
    id: "exam-fractional-coordinates",
    title: "晶胞内的分数坐标",
    subtitle: "把晶胞边长当作 1，描述点在三条轴上的比例",
    summary:
      "分数坐标用晶胞三条边作为单位，记录粒子从原点出发在 a、b、c 方向上分别走了多少比例。",
    coreSteps: [
      {
        title: "先确定原点和三条轴",
        body: "看题目给出的晶胞方向，确认原点、a 轴、b 轴和 c 轴。换原点会改变同一个点的坐标写法。",
      },
      {
        title: "分别读出三个方向比例",
        body: "把点投影到 a、b、c 三个方向，写成 x/a、y/b、z/c 的形式，常见值有 0、1/2、1/4、3/4、1。",
        formula: "(x/a, y/b, z/c)",
      },
      {
        title: "检查是否在晶胞范围内",
        body: "高中题中常用 0 到 1 之间的分数表示晶胞内位置；边界点可由相邻晶胞共享。",
      },
    ],
    commonMistakes: [
      "只读平面投影，忘记 z 方向。",
      "把实际距离单位直接写进坐标，而不是写比例。",
      "没有看清题目原点，导致三个分量整体偏移。",
    ],
    relatedModuleIds: ["nacl-crystal", "diamond-crystal", "zinc-metal-crystal"],
    classroomPrompt: "用立方体前下左角作原点，让学生先说体心坐标，再说面心和棱心坐标。",
    examTip: "分数坐标题先画三轴小坐标系，按 x、y、z 顺序逐个读数。",
  },
  {
    id: "exam-crystal-density",
    title: "晶胞密度与 NA 计算",
    subtitle: "质量来自 Z 和摩尔质量，体积来自晶胞参数",
    summary:
      "晶体密度计算的核心是单个晶胞的质量除以单个晶胞的体积。最常见陷阱是单位换算和 Z 的含义。",
    coreSteps: [
      {
        title: "求每个晶胞的式量单位数 Z",
        body: "先通过均摊法确定一个晶胞中含有几个化学式单位。NaCl 型常规晶胞中 Z = 4，CsCl 型常规晶胞中 Z = 1。",
      },
      {
        title: "写出晶胞质量",
        body: "晶胞质量等于 Z 乘以摩尔质量，再除以阿伏伽德罗常数。",
        formula: "m_cell = ZM / NA",
      },
      {
        title: "用晶胞体积计算密度",
        body: "立方晶胞体积为 a³。若 a 用 pm 或 nm 给出，必须先换算成 cm，再代入密度单位 g·cm⁻³。",
        formula: "ρ = ZM / (NA · V_cell)",
      },
    ],
    commonMistakes: [
      "把 pm、nm 直接代入 cm³ 体系。",
      "把晶胞中原子总数误当成化学式单位数 Z。",
      "只用边长 a 做分母，忘记体积是 a³。",
    ],
    relatedModuleIds: ["nacl-crystal", "cscl-crystal", "diamond-crystal"],
    classroomPrompt: "先让学生口算 Z，再单独列出单位换算，避免所有错误混在同一步。",
    examTip: "密度题固定三行：Z、V_cell、ρ 公式；每行都带单位检查。",
  },
  {
    id: "exam-interstitial-sites",
    title: "四面体与八面体空隙",
    subtitle: "先看几个球围成空隙，再记数量比例",
    summary:
      "密堆积空隙不是额外画出来的粒子，而是由周围球围出的空间位置。八面体空隙对应 6 配位，四面体空隙对应 4 配位。",
    coreSteps: [
      {
        title: "识别空隙类型",
        body: "由 6 个球围成、中心到 6 个球近似等距的是八面体空隙；由 4 个球围成的是四面体空隙。",
      },
      {
        title: "记住数量比例",
        body: "若密堆积骨架中有 N 个球，通常形成 N 个八面体空隙和 2N 个四面体空隙。",
        formula: "八面体空隙 : 四面体空隙 = N : 2N",
      },
      {
        title: "结合填隙比例推导化学式",
        body: "题目给出填入多少空隙时，用已填空隙数与骨架粒子数做比例，而不是把所有空隙默认填满。",
      },
    ],
    commonMistakes: [
      "把空隙当成已经存在的原子或离子。",
      "混淆 N 个八面体空隙和 2N 个四面体空隙。",
      "看到 NaCl 就只背结论，没有理解 Na+ 填入八面体空隙。",
    ],
    relatedModuleIds: ["octahedral-voids", "tetrahedral-voids", "nacl-crystal"],
    classroomPrompt: "先隔离一个空隙局部模型，再回到完整晶胞，帮助学生把局部配位和整体计数分开。",
    examTip: "填隙题先写骨架粒子数 N，再写空隙总数和实际填入比例。",
  },
  {
    id: "exam-diamond-si",
    title: "金刚石与单晶硅",
    subtitle: "同一种金刚石型骨架，抓住四配位和键数共享",
    summary:
      "金刚石和单晶硅都可按金刚石型共价晶体理解。每个 C 或 Si 原子与周围 4 个同种原子成键，常规晶胞均摊后含 8 个原子，键数计算要记得每条共价键被两个原子共享。",
    coreSteps: [
      {
        title: "先认结构类型",
        body: "金刚石与单晶硅都是三维共价网络，不是由独立小分子堆积而成。考试中看到金刚石型结构时，先把它看成每个原子四配位的空间骨架。",
      },
      {
        title: "锁定四面体配位",
        body: "每个 C 或 Si 原子周围有 4 个最近邻同种原子，方向接近正四面体。对应的 X-X-X 键角约为 109.5°，这里的 X 可以是 C，也可以迁移为 Si。",
        formula: "配位数 = 4 · 键角约 109.5°",
      },
      {
        title: "完成常规晶胞均摊",
        body: "金刚石型常规晶胞可按顶点、面心和晶胞内部原子计数：顶点贡献 1，面心贡献 3，内部 4 个完整属于晶胞，所以一个常规晶胞平均含 8 个原子。",
        formula: "8 × 1/8 + 6 × 1/2 + 4 = 8",
      },
      {
        title: "用共享关系算共价键",
        body: "若晶体中有 N 个原子，每个原子连 4 条键端，共有 4N 个键端；每条共价键由两个原子共享，所以实际共价键数为 2N。",
        formula: "N 个原子 → 4N / 2 = 2N 条共价键",
      },
    ],
    commonMistakes: [
      "把晶胞图中显示出来的球数直接当作独占原子数。",
      "把金刚石或单晶硅误认为 C8、Si8 这样独立存在的小分子。",
      "计算共价键数时忘记一条键连接两个原子，把 4N 误当作总键数。",
      "只记金刚石结论，遇到单晶硅时不会迁移同样的金刚石型四配位骨架。",
    ],
    relatedModuleIds: ["diamond-crystal", "tetrahedral-voids"],
    classroomPrompt: "先打开金刚石 3D 模块观察四面体配位，再把所有 C 替换想象为 Si，强调空间骨架相同、元素不同。",
    examTip: "金刚石型题目先写两行：每个原子 4 配位；共价键数 = 原子数 × 4 ÷ 2。",
  },
];

export function getExamTopicById(id: string): ExamTopic | undefined {
  return examTopics.find((topic) => topic.id === id);
}

export function getExamTopicDetailById(id: string): ExamTopicDetail | undefined {
  return examTopicDetails.find((topic) => topic.id === id);
}
