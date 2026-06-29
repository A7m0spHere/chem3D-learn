// ---------------------------------------------------------------------------
// Learning Modules Data — 知识点驱动的学习模块数据
// ---------------------------------------------------------------------------

export type ModuleCategory =
  | "molecular-geometry"
  | "crystal-structure"
  | "organic-stereochemistry"
  | "bonding-orbitals"
  | "exam-spatial-thinking";

export type DifficultyLevel = "基础" | "核心" | "拓展";

export interface LearningModule {
  id: string;
  title: string;
  subtitle: string;
  category: ModuleCategory;
  difficulty: DifficultyLevel;
  tags: string[];
  representativeModels: string[];
  description: string;
  keyPoints: string[];
  examValue: string;
  visualFocus: string;
  route: string;
  // Specific data for display
  formula?: string;
  geometryName?: string;
  hybridization?: string;
  bondAngle?: string;
  lonePairs?: string;
  polarity?: string;
}

export interface CategoryMeta {
  id: ModuleCategory;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
}

export const categories: CategoryMeta[] = [
  {
    id: "molecular-geometry",
    title: "分子空间构型",
    subtitle: "VSEPR · 杂化轨道 · 键角 · 极性",
    description:
      "从 CH₄ 正四面体出发，理解孤对电子如何影响键角，再到直线形和平面三角形。掌握分子空间结构的判断与对比。",
    iconName: "Atom",
  },
  {
    id: "crystal-structure",
    title: "晶体结构",
    subtitle: "晶胞 · 配位数 · 均摊法 · 密度计算",
    description:
      "NaCl、CsCl、金刚石等典型晶体的三维空间展示，帮助建立晶体结构的空间直觉与定量计算能力。",
    iconName: "Box",
  },
  {
    id: "organic-stereochemistry",
    title: "有机立体结构",
    subtitle: "共线共面 · 构象 · 顺反异构 · 手性",
    description:
      "从甲烷到苯，观察碳骨架的空间形态，理解单键旋转、双键刚性、手性中心与对映异构。",
    iconName: "Hexagon",
  },
  {
    id: "bonding-orbitals",
    title: "化学键与轨道",
    subtitle: "σ 键 · π 键 · sp/sp²/sp³ · 配位键",
    description:
      "理解轨道重叠方式、电子云方向性，以及不同类型化学键的本质区别，建立微观成键图像。",
    iconName: "Link2",
  },
  {
    id: "exam-spatial-thinking",
    title: "考试空间理解专题",
    subtitle: "构型判断 · 极性 · 共面原子数 · 晶体计算",
    description:
      "直接面向高中化学考试题型的空间思维训练。不再死记硬背，用 3D 辅助工具理解题背后的空间逻辑。",
    iconName: "GraduationCap",
  },
];

export const learningModules: LearningModule[] = [
  // === 1. 分子空间构型 (molecular-geometry) ===
  {
    id: "tetrahedral-ch4",
    title: "四面体构型：CH₄",
    subtitle: "甲烷分子的正四面体构型",
    category: "molecular-geometry",
    difficulty: "基础",
    tags: ["VSEPR", "sp³", "正四面体", "非极性"],
    representativeModels: ["ch4"],
    description: "甲烷是最简单的四面体结构，没有孤对电子干扰。理解正四面体是学习 VSEPR 的起点。",
    keyPoints: ["四个 C-H 键在空间中完全等价且对称分布", "中心 C 原子采取 sp³ 杂化"],
    examValue: "高考常考：四面体键角 109.5° 的来源、二氯甲烷无同分异构体的证明。",
    visualFocus: "观察 4 个氢原子如何占据正四面体的四个顶点。",
    route: "/module/tetrahedral-ch4",
    formula: "CH₄",
    geometryName: "正四面体",
    hybridization: "sp³",
    bondAngle: "109.5°",
    lonePairs: "无",
    polarity: "非极性",
  },
  {
    id: "pyramidal-nh3",
    title: "三角锥形：NH₃",
    subtitle: "孤对电子压缩键角的典型例子",
    category: "molecular-geometry",
    difficulty: "核心",
    tags: ["VSEPR", "孤对电子", "三角锥形", "极性"],
    representativeModels: ["nh3"],
    description: "氨分子有一对孤对电子，它占据了原本的一个四面体顶点，使 N-H 键之间的排斥力增大，键角从 109.5° 压缩至约 107°。",
    keyPoints: ["孤对电子对成键电子对的排斥力大于成键电子对之间的排斥力", "分子呈极性"],
    examValue: "高考重点：区分电子排布（四面体）和分子构型（三角锥）。",
    visualFocus: "重点观察顶部孤对电子云的空间占据体积及其对键的挤压作用。",
    route: "/module/pyramidal-nh3",
    formula: "NH₃",
    geometryName: "三角锥形",
    hybridization: "sp³",
    bondAngle: "≈ 107°",
    lonePairs: "1 对",
    polarity: "极性",
  },
  {
    id: "v-shape-h2o",
    title: "V 形分子：H₂O",
    subtitle: "双孤对电子的进一步压缩",
    category: "molecular-geometry",
    difficulty: "核心",
    tags: ["VSEPR", "孤对电子", "V 形", "极性"],
    representativeModels: ["h2o"],
    description: "水分子有两对孤对电子，它们的排斥作用使得 H-O-H 键角进一步压缩至约 104.5°，是 VSEPR 理论中极好的对比教材。",
    keyPoints: ["两对孤对电子占据 sp³ 杂化轨道", "高度极性的分子"],
    examValue: "高考必考：CH₄ vs NH₃ vs H₂O 键角的递变规律及其原因解释。",
    visualFocus: "观察两对孤对电子的空间位置，体会它们如何将分子逼成 V 形结构。",
    route: "/module/v-shape-h2o",
    formula: "H₂O",
    geometryName: "V 形",
    hybridization: "sp³",
    bondAngle: "104.5°",
    lonePairs: "2 对",
    polarity: "极性",
  },
  {
    id: "linear-co2",
    title: "直线形分子：CO₂",
    subtitle: "无孤对电子的 sp 杂化",
    category: "molecular-geometry",
    difficulty: "基础",
    tags: ["VSEPR", "sp", "直线形", "非极性"],
    representativeModels: ["co2"],
    description: "两个 C=O 双键在中心碳原子两侧沿直线排列，键角 180°。由于对称性，偶极矩互相抵消，分子整体无极性。",
    keyPoints: ["中心原子采用 sp 杂化", "含有两个大 π 键", "两个键偶极方向相反"],
    examValue: "极性判断常考分子，经常与 SO₂ (V形极性) 对比。",
    visualFocus: "旋转观察 180° 直线排布以及中心 C 原子的无孤对电子状态。",
    route: "/module/linear-co2",
    formula: "CO₂",
    geometryName: "直线形",
    hybridization: "sp",
    bondAngle: "180°",
    lonePairs: "中心 C 无",
    polarity: "非极性",
  },
  {
    id: "planar-bf3",
    title: "平面三角形：BF₃",
    subtitle: "无孤对电子的 sp² 杂化",
    category: "molecular-geometry",
    difficulty: "基础",
    tags: ["VSEPR", "sp²", "平面三角形", "缺电子"],
    representativeModels: ["bf3"],
    description: "中心 B 原子采用 sp² 杂化，三个 B-F 键在同一平面内均匀分布，键角 120°。",
    keyPoints: ["缺电子分子", "中心原子 B 没有满 8 电子结构", "极性抵消为非极性分子"],
    examValue: "经常与 NH₃ (三角锥) 对比，考察有无孤对电子对分子构型和平面的影响。",
    visualFocus: "从侧面观察可以发现 4 个原子完全共面。",
    route: "/module/planar-bf3",
    formula: "BF₃",
    geometryName: "平面三角形",
    hybridization: "sp²",
    bondAngle: "120°",
    lonePairs: "中心 B 无",
    polarity: "非极性",
  },
  {
    id: "polarity-judgment",
    title: "分子极性判断",
    subtitle: "从电负性到键偶极抵消",
    category: "molecular-geometry",
    difficulty: "核心",
    tags: ["分子极性", "键偶极", "BF₃ 反例"],
    representativeModels: [],
    description: "键有极性，不代表分子一定有极性；关键要看键偶极在空间中能否抵消。本模块固定比较 HCl、H₂O、HClO 和 BF₃。",
    keyPoints: ["先看电负性，再判断键偶极方向", "看空间构型，判断键偶极能否抵消", "BF₃ 虽含极性键，但整体为非极性分子"],
    examValue: "高考核心：用键偶极矢量合成判断分子极性，避免把“有极性键”机械等同于“极性分子”。",
    visualFocus: "在 3D 中展示 HCl、H₂O、HClO 的合偶极矩不为 0，以及 BF₃ 三个 B–F 键偶极对称抵消。",
    route: "/module/polarity-judgment",
  },

  // === 2. 晶体结构 (crystal-structure) ===
  {
    id: "nacl-crystal",
    title: "NaCl 型晶体结构（氯化钠晶胞）",
    subtitle: "面心立方排列与六配位关系",
    category: "crystal-structure",
    difficulty: "核心",
    tags: ["离子晶体", "晶胞", "配位数", "面心立方"],
    representativeModels: ["nacl"],
    description: "最典型的离子晶体结构。Cl⁻ 形成面心立方最密堆积，Na⁺ 填充在所有的八面体空隙中。",
    keyPoints: ["Na⁺ 的配位数为 6，Cl⁻ 的配位数为 6", "1 个晶胞包含 4 个 Na⁺ 和 4 个 Cl⁻"],
    examValue: "晶体类型中的模板题，常考晶胞粒子数、最近邻离子数和配位立方体切割。",
    visualFocus: "观察 Cl⁻ 的顶点与面心位置、Na⁺ 的棱心与体心位置，并用均摊法完成粒子计数。",
    route: "/module/nacl-crystal",
    formula: "NaCl",
  },
  {
    id: "cscl-crystal",
    title: "CsCl 型晶体结构",
    subtitle: "8:8 配位的离子晶体",
    category: "crystal-structure",
    difficulty: "核心",
    tags: ["晶体结构", "离子晶体", "8配位", "晶胞计数"],
    representativeModels: ["cscl"],
    description: "另一种典型离子晶体。常用画法是 Cl⁻ 位于立方体顶点，Cs⁺ 位于体心，形成 8 : 8 配位。",
    keyPoints: ["Cs⁺ 的配位数为 8，Cl⁻ 的配位数也为 8", "1 个晶胞包含 1 个 Cs⁺ 和 1 个 Cl⁻"],
    examValue: "经常与 NaCl 进行对比，考查 6 : 6 配位和 8 : 8 配位、晶胞均摊计数，以及不要误判为普通 BCC 金属晶体。",
    visualFocus: "观察体心 Cs⁺ 被 8 个顶点 Cl⁻ 包围的空间关系，并用 8 × 1/8 + 体心 1 个完成计数。",
    route: "/module/cscl-crystal",
    formula: "CsCl",
  },
  {
    id: "sodium-metal-crystal",
    title: "金属钠晶体结构",
    subtitle: "体心立方晶胞与均摊计数",
    category: "crystal-structure",
    difficulty: "核心",
    tags: ["金属晶体", "体心立方", "均摊法"],
    representativeModels: ["sodium-metal"],
    description: "教材中的金属钠晶胞可用体心立方模型理解：8 个顶点 Na 原子各被 8 个晶胞共享，体心 Na 原子完全属于本晶胞。",
    keyPoints: ["顶点 8 个 Na 各占 1/8", "体心 1 个 Na 独占", "平均每个晶胞含 2 个 Na 原子"],
    examValue: "用真实晶体实例练习均摊法，比单独记忆“顶点、棱、面、体”更容易迁移到计算题。",
    visualFocus: "先数顶点，再看体心；把 8 × 1/8 和 1 × 1 合并，得到每个晶胞平均 2 个 Na 原子。",
    route: "/module/sodium-metal-crystal",
    formula: "Na",
  },
  {
    id: "diamond-crystal",
    title: "金刚石晶体结构",
    subtitle: "正四面体配位的共价晶体",
    category: "crystal-structure",
    difficulty: "拓展",
    tags: ["晶体结构", "共价晶体", "原子晶体", "正四面体", "四面体空隙", "4配位", "晶胞计数"],
    representativeModels: ["diamond"],
    description: "金刚石是典型共价晶体。可把它拆解为面心立方相关 C 骨架中，一半四面体空隙位置被 C 占据，整体形成三维空间网状结构。",
    keyPoints: ["每个 C 原子为 4 配位，近似正四面体", "晶胞内部 4 个 C 可理解为占据一半四面体空隙", "一个常规晶胞中实际含有 8 个 C 原子"],
    examValue: "常考共价晶体结构、C-C 键数比例、晶胞均摊计数，以及与 NaCl 八面体空隙填充、石墨层状结构的区别。",
    visualFocus: "观察顶点、面心和内部 C 原子的位置，理解面心立方骨架、一半四面体空隙占据、四面体配位和晶胞计数。",
    route: "/module/diamond-crystal",
    formula: "C",
  },
  {
    id: "graphite-structure",
    title: "石墨结构",
    subtitle: "层状混合晶体",
    category: "crystal-structure",
    difficulty: "拓展",
    tags: ["混合晶体", "sp²", "层状"],
    representativeModels: ["graphite"],
    description: "石墨中碳原子采取 sp² 杂化形成平面正六边形层状网络，层间靠范德华力结合，存在离域大 π 键。",
    keyPoints: ["层内共价键，层间范德华力", "可以导电", "质软有润滑性"],
    examValue: "考察石墨晶体中 C 原子数与 C-C 键的比例 (2:3)。",
    visualFocus: "对比层内的紧密排列与层间的较大距离。",
    route: "/module/graphite-structure",
  },
  {
    id: "zinc-metal-crystal",
    title: "金属锌晶体结构",
    subtitle: "六方最密堆积与十二配位",
    category: "crystal-structure",
    difficulty: "核心",
    tags: ["金属晶体", "六方最密堆积", "A-B-A", "配位数", "晶胞计数"],
    representativeModels: ["zinc-metal"],
    description: "教材中的金属锌晶体可作为六方最密堆积实例观察：六方晶胞呈 A-B-A 金属原子堆积，局部配位环境中一个 Zn 周围有 12 个最近邻。",
    keyPoints: ["A-B-A 六方最密堆积", "配位数为 12", "六方晶胞平均含 6 个 Zn 原子"],
    examValue: "用具体晶体区分“配位数”和“晶胞平均占有数”：配位环境数 6 + 3 + 3，晶胞计数算 12×1/6 + 2×1/2 + 3。",
    visualFocus: "先看六方晶胞和 A-B-A 分层，再切换到周期延展后的局部配位簇数出 12 配位，最后完成晶胞平均占有计数。",
    route: "/module/zinc-metal-crystal",
    formula: "Zn",
  },
  {
    id: "octahedral-voids",
    title: "八面体空隙",
    subtitle: "密堆积中的六配位空隙",
    category: "crystal-structure",
    difficulty: "拓展",
    tags: ["空隙", "密堆积", "八面体"],
    representativeModels: ["octahedral-voids"],
    description: "由 6 个球包围形成的空间空隙，中心球如果填入该空隙，其配位数为 6。在面心立方中最常见。",
    keyPoints: ["N 个球密堆积形成 N 个八面体空隙", "面心立方的体心和棱心是八面体空隙"],
    examValue: "难度较高的晶体题中会涉及填隙比例计算。",
    visualFocus: "隔离出 6 个构成空隙的球，展示中间可容纳原子的最大半径。",
    route: "/module/octahedral-voids",
  },
  {
    id: "tetrahedral-voids",
    title: "四面体空隙",
    subtitle: "密堆积中的四配位空隙",
    category: "crystal-structure",
    difficulty: "拓展",
    tags: ["空隙", "密堆积", "四面体"],
    representativeModels: ["tetrahedral-voids"],
    description: "由 4 个球构成的四面体空间中的空隙，配位数为 4。",
    keyPoints: ["N 个球密堆积形成 2N 个四面体空隙"],
    examValue: "结合 CaF₂ 等特殊晶体结构进行考察。",
    visualFocus: "展示面心立方晶胞内部 8 个角落的四面体空隙位置。",
    route: "/module/tetrahedral-voids",
  },

  // === 3. 有机立体结构 (organic-stereochemistry) ===
  {
    id: "organic-coplanar",
    title: "有机物原子共线共面分析",
    subtitle: "结合单双三键判断原子共面",
    category: "organic-stereochemistry",
    difficulty: "核心",
    tags: ["共面", "共线", "有机结构"],
    representativeModels: [],
    description: "通过一个多取代苯综合模型，同时观察苯环平面、sp3 四面体、sp2 平面、sp 直线和胺基结构，理解有机物中原子共线共面的判断方法。",
    keyPoints: ["苯环平面是判断起点", "sp3 片段具有四面体空间性", "sp2、sp 片段分别对应平面与直线", "单键旋转会影响能否对齐共面"],
    examValue: "用于建立共线共面判断的空间直觉，本模块只做 3D 概念示例，不做题目训练。",
    visualFocus: "在同一个多取代苯模型中切换观察苯环平面、甲基四面体、乙烯基平面、乙炔基直线和胺基空间片段。",
    route: "/module/organic-coplanar",
  },
  {
    id: "ethylene-planar",
    title: "乙烯平面结构",
    subtitle: "6 原子共面基础母体",
    category: "organic-stereochemistry",
    difficulty: "基础",
    tags: ["乙烯", "sp²", "共面"],
    representativeModels: ["ethylene-planar"],
    description: "由于 C=C 双键中 π 键的限制，乙烯分子不能自由旋转，2 个 C 和 4 个 H 严格共面。",
    keyPoints: ["键角约 120°", "双键刚性"],
    examValue: "基础判断模块，常作为大分子的一部分出现。",
    visualFocus: "从侧边视角证实分子的绝对平面性。",
    route: "/module/ethylene-planar",
  },
  {
    id: "acetylene-linear",
    title: "乙炔直线结构",
    subtitle: "4 原子共线基础母体",
    category: "organic-stereochemistry",
    difficulty: "基础",
    tags: ["乙炔", "sp", "共线"],
    representativeModels: [],
    description: "C≡C 三键使得碳原子采用 sp 杂化，4 个原子在同一条直线上。",
    keyPoints: ["键角 180°", "共线必然共面"],
    examValue: "提供一条绝对直线，在大分子中共面判断中起到核心骨架作用。",
    visualFocus: "展示直线结构以及两个互相垂直的 π 键电子云。",
    route: "/module/acetylene-linear",
    formula: "C₂H₂",
    geometryName: "直线形",
    hybridization: "sp",
    bondAngle: "180°",
  },
  {
    id: "benzene-planar",
    title: "苯环平面结构",
    subtitle: "12 原子大共面结构",
    category: "organic-stereochemistry",
    difficulty: "核心",
    tags: ["苯", "共面", "大 π 键"],
    representativeModels: [],
    description: "苯环的 6 个 C 和 6 个 H 全部位于同一平面内，是判断复杂有机物共面的“定盘星”。",
    keyPoints: ["正六边形，键角 120°", "对角线上的 4 个原子共线"],
    examValue: "围绕苯环旋转单键是高考最爱考察的共面极限题型。",
    visualFocus: "标出苯环上的对角线结构以及整体平面的扩展。",
    route: "/module/benzene-planar",
    formula: "C₆H₆",
    geometryName: "平面正六边形",
    hybridization: "sp²",
    bondAngle: "≈ 120°",
  },
  {
    id: "single-bond-rotation",
    title: "单键旋转与构象",
    subtitle: "乙烷和丁烷的交叉与重叠",
    category: "organic-stereochemistry",
    difficulty: "拓展",
    tags: ["单键旋转", "构象", "纽曼投影"],
    representativeModels: [],
    description: "单键可以自由旋转，这使得分子的空间形状（构象）不断发生变化，包括交叉式、重叠式等。",
    keyPoints: ["旋转不破坏化学键", "交叉式最稳定，重叠式能量最高"],
    examValue: "解释为什么共面原子数通常是“最多”或“最少”。",
    visualFocus: "通过 3D 动画沿 C-C 键轴方向（纽曼投影视角）展示旋转过程。",
    route: "/module/single-bond-rotation",
  },
  {
    id: "cis-trans-isomerism",
    title: "顺反异构",
    subtitle: "双键刚性导致的空间异构",
    category: "organic-stereochemistry",
    difficulty: "核心",
    tags: ["顺反异构", "双键"],
    representativeModels: [],
    description: "当双键两端的碳原子分别连有不同的原子或基团时，由于双键不能旋转，会产生顺式和反式两种空间排布。",
    keyPoints: ["产生顺反异构的条件：每个 C 必须连两个不同的基团"],
    examValue: "要求判断给定分子是否存在顺反异构。",
    visualFocus: "尝试旋转双键导致的“断键”警告，展示顺反分子的形状差异。",
    route: "/module/cis-trans-isomerism",
  },
  {
    id: "chirality-carbon",
    title: "手性碳判断",
    subtitle: "不对称碳与对映异构",
    category: "organic-stereochemistry",
    difficulty: "拓展",
    tags: ["手性", "对映异构", "不对称碳"],
    representativeModels: [],
    description: "当一个碳原子连接四个完全不同的原子或基团时，它和它的镜像无法重合，这种性质叫做手性。",
    keyPoints: ["寻找连有 4 个不同基团的 sp³ 碳", "常标记为 C*"],
    examValue: "在复杂的天然产物或药物分子中寻找并计数手性碳原子。",
    visualFocus: "把分子及其镜像重叠，直观展示无法完美契合的现象。",
    route: "/module/chirality-carbon",
  },

  // === 4. 化学键与轨道 (bonding-orbitals) ===
  {
    id: "sigma-pi-bonds",
    title: "σ 键与 π 键",
    subtitle: "从乙烯双键看 1σ + 1π",
    category: "bonding-orbitals",
    difficulty: "核心",
    tags: ["σ 键", "π 键", "乙烯", "双键刚性"],
    representativeModels: [],
    description: "以乙烯 C=C 双键为例，观察 σ 键沿键轴头碰头重叠，π 键由 p 轨道肩并肩重叠形成，理解双键由 1 个 σ 键和 1 个 π 键组成。",
    keyPoints: ["C=C 双键 = 1 个 σ 键 + 1 个 π 键", "π 电子云分布在分子平面上下", "π 键让双键具有刚性"],
    examValue: "高考常用：清点 σ/π 键个数，解释乙烯共面和双键刚性来源。",
    visualFocus: "在乙烯 3D 模型中切换观察 σ 键、π 键和双键组成。本模块为高中教学示意，不是真实电子云计算图。",
    route: "/module/sigma-pi-bonds",
    formula: "C₂H₄",
  },
  {
    id: "hybrid-orbitals-sp",
    title: "sp / sp² / sp³ 杂化轨道",
    subtitle: "原子轨道的混合与空间重排",
    category: "bonding-orbitals",
    difficulty: "核心",
    tags: ["杂化轨道", "sp系"],
    representativeModels: [],
    description: "中心原子为了更好的成键，将 s 轨道与 p 轨道重新组合，形成能量相等、方向特定的新轨道的过程。",
    keyPoints: ["杂化轨道的总数等于参与杂化的轨道总数", "sp³(四面体), sp²(平面), sp(直线)"],
    examValue: "根据分子构型反推杂化方式，或根据杂化判断构型。",
    visualFocus: "动画展示 s 和 p 轨道如何融合形成不对称的“大头小尾”杂化轨道并散开。",
    route: "/module/hybrid-orbitals-sp",
  },
  {
    id: "ionic-bond-formation",
    title: "离子键形成",
    subtitle: "电子转移与静电作用",
    category: "bonding-orbitals",
    difficulty: "基础",
    tags: ["离子键", "静电作用"],
    representativeModels: [],
    description: "电负性差异大的原子间通过电子得失形成阴阳离子，并靠静电引力结合。",
    keyPoints: ["无方向性", "无饱和性", "决定了离子晶体特有的物理性质"],
    examValue: "物质结构基础概念题，区别于共价键的特性。",
    visualFocus: "动态展示电子跳跃转移过程以及静电力场的建立。",
    route: "/module/ionic-bond-formation",
  },
  {
    id: "covalent-bond-formation",
    title: "共价键形成",
    subtitle: "电子对共享与轨道重叠",
    category: "bonding-orbitals",
    difficulty: "基础",
    tags: ["共价键", "电子对共享"],
    representativeModels: [],
    description: "电负性相近的原子之间，通过共享电子对（轨道重叠）形成的化学键。",
    keyPoints: ["有方向性", "有饱和性"],
    examValue: "极性键与非极性键的判断。",
    visualFocus: "展示两个原子的未成对电子相互靠近并重叠的稳定状态。",
    route: "/module/covalent-bond-formation",
  },
  {
    id: "coordinate-bond-formation",
    title: "配位键形成",
    subtitle: "孤对电子的单向奔赴",
    category: "bonding-orbitals",
    difficulty: "拓展",
    tags: ["配位键", "孤对电子", "配合物"],
    representativeModels: [],
    description: "一种特殊的共价键，共用电子对由一个原子单方面提供，另一个原子提供空轨道接受。",
    keyPoints: ["形成条件：提供者有孤对电子，接受者有空轨道", "在配合物中广泛存在（如 [Cu(NH₃)₄]²⁺）"],
    examValue: "判断某些特殊离子或络合物中的配位键存在情况。",
    visualFocus: "明确区分单向提供的电子云和空轨道，一旦形成则与普通共价键无异。",
    route: "/module/coordinate-bond-formation",
  },

  // === 5. 考试空间理解专题 (exam-spatial-thinking) ===
  {
    id: "exam-crystal-density",
    title: "晶体密度计算专题",
    subtitle: "突破高考压轴计算大关",
    category: "exam-spatial-thinking",
    difficulty: "拓展",
    tags: ["计算", "晶体密度", "阿伏伽德罗常数"],
    representativeModels: [],
    description: "将宏观的密度概念和微观的晶胞体积、摩尔质量、阿伏伽德罗常数 NA 结合的综合计算题型。",
    keyPoints: ["公式：ρ = (Z * M) / (NA * V)", "单位换算 (pm, nm 到 cm) 极易出错"],
    examValue: "高考结构化学选做题最后一步必考，分值高，难度大。",
    visualFocus: "构建可视化的公式推导图：从单个晶胞的质量到 1 摩尔物质体积的关系。",
    route: "/module/exam-crystal-density",
  },
  {
    id: "exam-bond-angle-comparison",
    title: "键角大小比较专题",
    subtitle: "孤对电子与电负性的双重影响",
    category: "exam-spatial-thinking",
    difficulty: "核心",
    tags: ["键角比较", "电负性"],
    representativeModels: [],
    description: "综合考察杂化类型、孤对电子排斥作用以及中心原子或配位原子的电负性变化对键角的细微影响。",
    keyPoints: ["优先看杂化 (sp > sp² > sp³)", "同杂化看孤对电子数", "孤对相同看电负性拉扯"],
    examValue: "选择题中的易错点，经常要求按由大到小排序。",
    visualFocus: "动态展示电负性改变时电子云偏移对排斥力和键角造成的影响。",
    route: "/module/exam-bond-angle-comparison",
  },
  {
    id: "exam-coplanar-max",
    title: "原子最多共面数专题",
    subtitle: "利用单键旋转和极限状态拿分",
    category: "exam-spatial-thinking",
    difficulty: "核心",
    tags: ["共面数计算", "极限状态"],
    representativeModels: [],
    description: "专门针对复杂有机大分子的“最多/最少共面原子数”计算。教授如何从核心母体入手，沿单键旋转寻找使原子进入同一平面的极限角度。",
    keyPoints: ["找到最大的共面母体（如苯环）", "以单键为轴进行极限假设"],
    examValue: "高考选择常客，错一个原子就全错。",
    visualFocus: "针对经典真题分子，分步骤演示“旋转 -> 共面重合 -> 计数”的通关过程。",
    route: "/module/exam-coplanar-max",
  },
  {
    id: "exam-collinear-max",
    title: "原子最多共线数专题",
    subtitle: "寻找隐藏在分子中的直线",
    category: "exam-spatial-thinking",
    difficulty: "核心",
    tags: ["共线数计算", "炔基"],
    representativeModels: [],
    description: "以乙炔、碳氧化物为基础，在复杂的支链网络中找出穿过最多原子的直线。",
    keyPoints: ["苯环对角线上的原子可视为直线", "三键是直线的发源地"],
    examValue: "与共面问题常合并考察。",
    visualFocus: "在杂乱的三维分子树中，发出一道激光穿透所有共线原子。",
    route: "/module/exam-collinear-max",
  },
];

// Helper functions
export function getModulesByCategory(category: ModuleCategory): LearningModule[] {
  return learningModules.filter((m) => m.category === category);
}

export function getModuleById(id: string): LearningModule | undefined {
  const canonicalId =
    id === "coplanar-collinear-analysis"
      ? "organic-coplanar"
      : id === "molecular-polarity"
        ? "polarity-judgment"
        : id;
  return learningModules.find((m) => m.id === canonicalId);
}

// Learning Paths
export interface LearningPathStep {
  moduleId: string;
}

export interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  steps: LearningPathStep[];
}

export const learningPaths: LearningPath[] = [
  {
    id: "vsepr-intro",
    title: "VSEPR 与分子构型",
    subtitle: "从零孤对电子到双孤对电子，再到直线形和平面三角形",
    steps: [
      { moduleId: "tetrahedral-ch4" },
      { moduleId: "pyramidal-nh3" },
      { moduleId: "v-shape-h2o" },
      { moduleId: "linear-co2" },
      { moduleId: "planar-bf3" },
      { moduleId: "polarity-judgment" },
    ],
  },
  {
    id: "crystal-intro",
    title: "晶体结构入门",
    subtitle: "晶胞实例 → 配位数 → 密度计算",
    steps: [
      { moduleId: "sodium-metal-crystal" },
      { moduleId: "nacl-crystal" },
      { moduleId: "zinc-metal-crystal" },
      { moduleId: "octahedral-voids" },
      { moduleId: "exam-crystal-density" },
    ],
  },
  {
    id: "organic-spatial",
    title: "有机空间结构",
    subtitle: "四面体 → 平面 → 直线 → 旋转 → 异构 → 手性",
    steps: [
      { moduleId: "ethylene-planar" },
      { moduleId: "acetylene-linear" },
      { moduleId: "benzene-planar" },
      { moduleId: "single-bond-rotation" },
      { moduleId: "cis-trans-isomerism" },
      { moduleId: "chirality-carbon" },
      { moduleId: "organic-coplanar" },
    ],
  },
];
