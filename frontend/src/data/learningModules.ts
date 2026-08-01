// ---------------------------------------------------------------------------
// Learning Modules Data — 知识点驱动的学习模块数据
// 分类与模块顺序对应课本递进：化学键 → 分子构型 → 晶体 → 有机立体
// ---------------------------------------------------------------------------

export type ModuleCategory =
  | "molecular-geometry"
  | "crystal-structure"
  | "organic-stereochemistry"
  | "bonding-orbitals";

export type DifficultyLevel = "基础" | "核心" | "拓展" | "竞赛入门";

export interface LearningModule {
  id: string;
  title: string;
  subtitle: string;
  category: ModuleCategory;
  difficulty: DifficultyLevel;
  tags: string[];
  representativeModels: string[];
  /** 专题 Viewer 提供交互 3D 时显式标记，不与手写结构数据绑定混为一谈。 */
  hasInteractiveViewer?: boolean;
  /** 配置后，学生可从当前有机 3D 模型直接抓取原子进入拼装实验室。 */
  builderSeedId?: string;
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
    id: "bonding-orbitals",
    title: "化学键与轨道",
    subtitle: "σ 键 · π 键 · sp/sp²/sp³ · 配位键",
    description:
      "理解轨道重叠方式、电子云方向性，以及不同类型化学键的本质区别，建立微观成键图像。",
    iconName: "Link2",
  },
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
    subtitle: "共线共面 · 平面结构 · 直线结构",
    description:
      "从乙烯、乙炔到苯环，观察碳骨架的平面和直线片段，建立有机物共线共面的空间判断基础。",
    iconName: "Hexagon",
  },
];

export const learningModules: LearningModule[] = [
  // === 1. 化学键与轨道 (bonding-orbitals) ===
  {
    id: "ionic-bond-formation",
    title: "离子键形成",
    subtitle: "电子转移与静电作用",
    category: "bonding-orbitals",
    difficulty: "基础",
    tags: ["离子键", "静电作用"],
    representativeModels: [],
    hasInteractiveViewer: true,
    description: "电负性差异大的原子间通过电子得失形成阴阳离子，并靠静电引力结合。",
    keyPoints: ["无方向性", "无饱和性", "决定了离子晶体特有的物理性质"],
    examValue: "物质结构基础概念题，区别于共价键的特性。",
    visualFocus: "动态展示电子跳跃转移过程以及静电力场的建立。",
    route: "/module/ionic-bond-formation",
  },
  {
    id: "sigma-bond-orbitals",
    title: "σ 键",
    subtitle: "s-s 与 s-p 的头碰头重叠",
    category: "bonding-orbitals",
    difficulty: "核心",
    tags: ["σ 键", "s-s", "s-p"],
    representativeModels: [],
    hasInteractiveViewer: true,
    description: "不以具体分子为例，直接观察 s-s 和 s-p 轨道沿键轴正面重叠，理解 σ 键的轴向对称特征。",
    keyPoints: ["X 轴是两核连线，也是键轴", "s-s 可头碰头重叠形成 σ 键", "s-p 沿键轴正面重叠也形成 σ 键"],
    examValue: "高考常用：清点单键、双键和三键中的 σ 键，并理解“沿键轴正面重叠”的判断标准。",
    visualFocus: "在 XYZ 坐标系中观察球形 s 轨道和哑铃状 p 轨道如何沿键轴重叠。本模块为高中教学示意，不是真实电子云计算图。",
    route: "/module/sigma-bond-orbitals",
  },
  {
    id: "pi-bond-orbitals",
    title: "π 键",
    subtitle: "p-p 轨道肩并肩重叠",
    category: "bonding-orbitals",
    difficulty: "核心",
    tags: ["π 键", "p-p", "侧向重叠"],
    representativeModels: [],
    hasInteractiveViewer: true,
    description: "用两个平行 p 轨道展示 π 键的形成过程，观察成键前、成键中和成键后电子云在键轴两侧的变化。",
    keyPoints: ["p 轨道必须保持平行", "π 键来自 p-p 侧向重叠", "π 电子云分布在键轴上下两侧"],
    examValue: "高考常用：解释双键不能自由旋转、判断双键和三键中的 π 键数量。",
    visualFocus: "在 XYZ 坐标系中用微动画展示 p-p 侧向重叠从分离到成键后的变化。本模块为高中教学示意，不是真实电子云计算图。",
    route: "/module/pi-bond-orbitals",
  },
  {
    id: "hybrid-orbitals-sp",
    title: "sp / sp² / sp³ 杂化轨道",
    subtitle: "原子轨道的混合与空间重排",
    category: "bonding-orbitals",
    difficulty: "核心",
    tags: ["杂化轨道", "sp系"],
    representativeModels: [],
    hasInteractiveViewer: true,
    description: "中心原子为了更好的成键，将 s 轨道与 p 轨道重新组合，形成能量相等、方向特定的新轨道的过程。",
    keyPoints: ["杂化轨道的总数等于参与杂化的轨道总数", "sp³(四面体), sp²(平面), sp(直线)"],
    examValue: "根据分子构型反推杂化方式，或根据杂化判断构型。",
    visualFocus: "动画展示 s 和 p 轨道如何融合形成不对称的“大头小尾”杂化轨道并散开。",
    route: "/module/hybrid-orbitals-sp",
  },
  {
    id: "coordinate-bond-formation",
    title: "配位键形成",
    subtitle: "孤对电子的单向奔赴",
    category: "bonding-orbitals",
    difficulty: "拓展",
    tags: ["配位键", "孤对电子", "配合物"],
    representativeModels: [],
    hasInteractiveViewer: true,
    description: "一种特殊的共价键，共用电子对由一个原子单方面提供，另一个原子提供空轨道接受。",
    keyPoints: ["形成条件：提供者有孤对电子，接受者有空轨道", "在配合物中广泛存在（如 [Cu(NH₃)₄]²⁺）"],
    examValue: "判断某些特殊离子或络合物中的配位键存在情况。",
    visualFocus: "明确区分单向提供的电子云和空轨道，一旦形成则与普通共价键无异。",
    route: "/module/coordinate-bond-formation",
  },

  // === 2. 分子空间构型 (molecular-geometry) ===
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
    tags: ["VSEPR", "sp²", "平面三角形", "中心 B 未满八隅体"],
    representativeModels: ["bf3"],
    description: "中心 B 原子采用 sp² 杂化，三个 B-F 键在同一平面内均匀分布，键角 120°。",
    keyPoints: [
      "常用中性路易斯结构中，中心 B 周围计入 6 个价层电子",
      "中心 B 未满足八隅体，可接受电子对，表现为路易斯酸",
      "极性抵消为非极性分子",
    ],
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
    hasInteractiveViewer: true,
    description: "键有极性，不代表分子一定有极性；关键要看键偶极在空间中能否抵消。本模块固定比较 HCl、H₂O、HClO 和 BF₃。",
    keyPoints: ["先看电负性，再判断键偶极方向", "看空间构型，判断键偶极能否抵消", "BF₃ 虽含极性键，但整体为非极性分子"],
    examValue: "高考核心：用键偶极矢量合成判断分子极性，避免把“有极性键”机械等同于“极性分子”。",
    visualFocus: "在 3D 中展示 HCl、H₂O、HClO 的合偶极矩不为 0，以及 BF₃ 三个 B–F 键偶极对称抵消。",
    route: "/module/polarity-judgment",
  },

  // === 3. 晶体结构 (crystal-structure) ===
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
    id: "metal-close-packing",
    title: "金属晶体密堆积",
    subtitle: "FCC 与 HCP 的层序、配位和晶胞计数",
    category: "crystal-structure",
    difficulty: "拓展",
    tags: ["FCC", "HCP", "密堆积", "配位数"],
    representativeModels: ["metal-close-packing"],
    description: "从单层六方密排出发，比较 HCP 的 ABAB 与 FCC 的 ABCABC 层序，并分别完成十二配位、常用晶胞计数和空间利用率归纳。",
    keyPoints: ["HCP 为 ABAB，FCC/CCP 为 ABCABC", "两者配位数均为 12", "理想空间利用率均约为 74%", "FCC 常用晶胞含 4 个原子，HCP 高中常用六方柱晶胞含 6 个原子"],
    examValue: "高考提高：根据连续堆积层判断 HCP/FCC，比较配位数、晶胞平均占有数和空间利用率。",
    visualFocus: "先观察单层三角形空隙，再追踪第三层是否回到 A 位，最后比较十二配位和两种常用晶胞计数。",
    route: "/module/metal-close-packing",
    formula: "M",
  },
  {
    id: "zns-polytypes",
    title: "ZnS 闪锌矿 / 纤锌矿",
    subtitle: "ABC / AB 层序、半填四面体空隙与 4:4 配位",
    category: "crystal-structure",
    difficulty: "竞赛入门",
    tags: ["ZnS", "闪锌矿", "纤锌矿", "四面体空隙"],
    representativeModels: ["zns"],
    description: "把 FCC/HCP 密堆积认知迁移到 ZnS：闪锌矿采用 ABCABC 层序，纤锌矿采用 ABAB 层序，Zn 均占 S 骨架中一半四面体空隙。",
    keyPoints: ["闪锌矿：ABCABC，立方 F-43m", "纤锌矿：ABAB，六方 P6₃mc", "Zn 只占一半四面体空隙", "Zn 和 S 都是 4 配位"],
    examValue: "竞赛入门：由密堆积层序判断多晶型，结合四面体空隙占据、双向配位与晶胞计数解释 ZnS 化学式。",
    visualFocus: "先并列比较立方与六方晶胞，再沿用 ABC/AB 层序，逐步显示全部四面体空隙、半数 Zn 占据、4:4 配位和两类晶胞计数。",
    route: "/module/zns-polytypes",
    formula: "ZnS",
  },
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
  {
    id: "batio3-perovskite",
    title: "BaTiO₃ 钙钛矿结构",
    subtitle: "理想立方晶胞、双配位与等价原点",
    category: "crystal-structure",
    difficulty: "拓展",
    tags: ["钙钛矿", "晶胞计数", "TiO₆", "等价原点"],
    representativeModels: ["batio3"],
    description: "用理想立方钙钛矿教学模型观察 Ba、Ti、O 的晶胞位置，理解 TiO₆ 八面体、BaO₁₂ 局部配位和等价原点画法。",
    keyPoints: ["Ba²⁺ 位于顶点，Ti⁴⁺ 位于体心，O²⁻ 位于面心", "Ti⁴⁺ 为 6 配位，Ba²⁺ 为 12 配位", "均摊后 Ba : Ti : O = 1 : 1 : 3", "平移原点只改变画法，不改变无限晶体结构"],
    examValue: "高考提高：陌生晶胞位置辨认、配位数、均摊计数和不同原点下分数坐标的等价判断。",
    visualFocus: "先观察 Ba 顶点、Ti 体心、O 面心，再分别突出 TiO₆、两类局部配位、晶胞计数和原点平移后的等价画法。",
    route: "/module/batio3-perovskite",
    formula: "BaTiO₃",
  },
  {
    id: "caf2-fluorite",
    title: "CaF₂ 萤石结构",
    subtitle: "8:4 配位与四面体空隙全填满",
    category: "crystal-structure",
    difficulty: "竞赛入门",
    tags: ["离子晶体", "萤石型", "8:4 配位", "四面体空隙"],
    representativeModels: ["caf2"],
    description: "Ca²⁺ 面心立方骨架中，F⁻ 填满全部 8 个四面体空隙，形成 8:4 配位。对比金刚石（只填一半）和 NaCl（填八面体空隙），并可切换观察反萤石（Li₂O 型）的离子位置互换。",
    keyPoints: ["Ca²⁺ 为立方体 8 配位，F⁻ 为四面体 4 配位", "晶胞含 4 个 Ca²⁺ 和 8 个 F⁻，比例 1:2", "从两端统计同一批最近邻接触：4 × 8 = 8 × 4", "反萤石结构 = 阴阳离子位置互换（Li₂O 型）"],
    examValue: "竞赛入门：掌握萤石型这一高频陌生晶胞模板，区分电荷守恒与最近邻接触计数，并能迁移到 Li₂O、BaF₂ 等同型结构。",
    visualFocus: "先看 Ca²⁺ 骨架与 8 个四面体空隙如何被 F⁻ 全部填满，再分别数 Ca²⁺ 的 8 配位立方体和 F⁻ 的 4 配位四面体。",
    route: "/module/caf2-fluorite",
    formula: "CaF₂",
  },
  {
    id: "hbn-structure",
    title: "h-BN 六方氮化硼",
    subtitle: "B/N 交替的层状六方晶体",
    category: "crystal-structure",
    difficulty: "竞赛入门",
    tags: ["层状晶体", "B-N 共价键", "对比石墨"],
    representativeModels: ["hbn"],
    description: "h-BN 与石墨一样具有平面六方层状骨架，但层内由 B 和 N 原子交替排列，通常表现为绝缘材料，适合用来对比“像石墨但不是石墨”。",
    keyPoints: ["B/N 在同一层中交替排列", "层内 B-N 共价键，层间弱相互作用", "与石墨相比通常不导电"],
    examValue: "竞赛入门：读懂非碳层状材料结构图，区分 B-N 交替、层间弱作用和石墨导电性的差异。",
    visualFocus: "先观察 B/N 交替六元环，再切换层间作用力和对比石墨，避免把 h-BN 当成一层全同种原子的石墨。",
    route: "/module/hbn-structure",
    formula: "BN",
  },
  {
    id: "pba-prussian-blue-analogues",
    title: "PBA 普鲁士蓝类似物",
    subtitle: "双金属氰基桥联配位框架",
    category: "crystal-structure",
    difficulty: "竞赛入门",
    tags: ["晶体化学", "竞赛入门", "配位晶胞"],
    representativeModels: ["pba"],
    description: "先看 M / M′ 双金属节点，再看 C≡N 桥联和空位水合，建立配合物框架晶体的空间直觉。",
    keyPoints: ["M 与 M′ 通过 C≡N 桥联形成三维配位框架", "M′(CN)₆ 可看成八面体配位单元", "空位、水合和 A 位离子会改变化学式与孔道环境"],
    examValue: "竞赛入门：帮助读懂陌生配合物晶胞图，区分金属节点、配体桥和可变占位，而不是机械套用 NaCl / CsCl 模板。",
    visualFocus: "旋转观察 M / M′ 节点如何被 C≡N 桥连接，再切换空位水合模式看通式变量。",
    route: "/module/pba-prussian-blue-analogues",
    formula: "PBA",
  },
  {
    id: "mof-metal-organic-framework",
    title: "MOF 金属有机框架",
    subtitle: "以 MOF-5 理解节点、连接体、pcu 拓扑与孔隙",
    category: "crystal-structure",
    difficulty: "竞赛入门",
    tags: ["MOF-5", "金属有机框架", "pcu 拓扑", "多孔晶体"],
    representativeModels: ["mof5"],
    description: "以经典 MOF-5 为例，把 Zn₄O 次级构筑单元和 BDC 线性连接体逐步抽象成六连接 pcu 网络，理解三维孔隙与组成计数。",
    keyPoints: ["Zn₄O 是金属簇节点，不是单个 Zn", "BDC 是线性二连接有机连接体", "Zn₄O SBU 构成六连接 pcu 网络", "教学拓扑立方与 Fm-3m 常规晶胞需要区分"],
    examValue: "竞赛拓展：建立节点—连接体—拓扑的读图方法，能够从陌生多孔框架中辨认局部配位、网络连接数和共享计数。",
    visualFocus: "先放大 Zn₄O 节点与 BDC，再抽象成完整立方拓扑，逐步显出孔隙和客体示意，最后比较拓扑单元与常规晶胞计数。",
    route: "/module/mof-metal-organic-framework",
    formula: "Zn₄O(BDC)₃",
  },
  {
    id: "mxene-2d-material",
    title: "MXene 二维层状材料",
    subtitle: "以 Ti₃C₂Tₓ 理解 MAX 来源、五层骨架与表面端基",
    category: "crystal-structure",
    difficulty: "竞赛入门",
    tags: ["MXene", "Ti₃C₂Tₓ", "MAX 相", "二维材料"],
    representativeModels: ["ti3c2tx"],
    description: "从 Ti₃AlC₂ MAX 相选择性移除 Al 出发，观察 Ti–C–Ti–C–Ti 五层片层、C 的 Ti₆ 局部配位、混合表面端基和重新堆叠。",
    keyPoints: ["Ti₃AlC₂ 去除 Al 后保留 Ti₃C₂ 骨架", "单层按 Ti–C–Ti–C–Ti 排列", "代表性 C 周围有 6 个 Ti 近邻", "Tₓ 表示可变表面端基"],
    examValue: "竞赛拓展：读懂 Mₙ₊₁XₙTₓ 通式，区分 MAX 前驱体、二维骨架、表面端基与重新堆叠后的层间环境。",
    visualFocus: "先对比 MAX 相和剥离片层，再从侧面数五层、放大 C 的六配位，最后观察混合端基、重新堆叠与 Ti₃C₂Tₓ 组成表达。",
    route: "/module/mxene-2d-material",
    formula: "Ti₃C₂Tₓ",
  },
  {
    id: "ren3-high-pressure-nitride",
    title: "ReN₃ 高压氮化物",
    subtitle: "理论预测 Imm2 相的高压窗口、N₃ 单元与 ReN₇ 网络",
    category: "crystal-structure",
    difficulty: "竞赛入门",
    tags: ["ReN₃", "高压氮化物", "Imm2", "七配位"],
    representativeModels: ["ren3"],
    description: "以理论预测的正交 Imm2-ReN₃ 为模型，从计算稳定压力窗口进入真实轴长比例晶胞，辨认折线 N₃ 单元、ReN₇ 七配位与延展多面体网络。",
    keyPoints: ["约 38.3–100 GPa 是计算稳定窗口，不等于实验确认", "常规晶胞含 2 Re + 6 N", "N₃ 单元是晶体网络的一部分", "代表性 Re 周围有 7 个 N 近邻"],
    examValue: "竞赛入门：练习从高压相图口径、Wyckoff 位点和近邻距离读取陌生氮富集晶体，区分局部配位式、化学式与延展网络。",
    visualFocus: "先确认理论预测状态和压力范围，再读正交晶胞，依次隔离 N₃ 单元、ReN₇ 多面体与周期网络，最后用位点数目推导 ReN₃。",
    route: "/module/ren3-high-pressure-nitride",
    formula: "ReN₃",
  },

  // === 4. 有机立体结构 (organic-stereochemistry) ===
  {
    id: "ethylene-planar",
    title: "乙烯平面结构",
    subtitle: "6 原子共面基础母体",
    category: "organic-stereochemistry",
    difficulty: "基础",
    tags: ["乙烯", "sp²", "共面"],
    representativeModels: ["ethylene-planar"],
    builderSeedId: "ethylene-planar",
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
    hasInteractiveViewer: true,
    builderSeedId: "acetylene-linear",
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
    hasInteractiveViewer: true,
    builderSeedId: "benzene-planar",
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
    id: "organic-coplanar",
    title: "有机物原子共线共面分析",
    subtitle: "结合单双三键判断原子共面",
    category: "organic-stereochemistry",
    difficulty: "核心",
    tags: ["共面", "共线", "有机结构"],
    representativeModels: [],
    hasInteractiveViewer: true,
    builderSeedId: "organic-coplanar",
    description: "通过一个多取代苯综合模型，同时观察苯环平面、sp³ 四面体、sp² 平面、sp 直线和胺基结构，理解有机物中原子共线共面的判断方法。",
    keyPoints: ["苯环平面是判断起点", "sp³ 片段具有四面体空间性", "sp²、sp 片段分别对应平面与直线", "单键旋转会影响能否对齐共面"],
    examValue: "用于建立共线共面判断的空间直觉，本模块只做 3D 概念示例，不做题目训练。",
    visualFocus: "在同一个多取代苯模型中切换观察苯环平面、甲基四面体、乙烯基平面、乙炔基直线和胺基空间片段。",
    route: "/module/organic-coplanar",
  },

];

// 首页“常查结构”精选：学生做题时最常需要对照的模型
export const featuredModuleIds: string[] = [
  "tetrahedral-ch4",
  "pyramidal-nh3",
  "v-shape-h2o",
  "nacl-crystal",
  "diamond-crystal",
  "benzene-planar",
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

export function getFeaturedModules(): LearningModule[] {
  return featuredModuleIds
    .map((id) => getModuleById(id))
    .filter((m): m is LearningModule => Boolean(m));
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
    subtitle: "晶胞实例 → 配位数 → 空隙结构",
    steps: [
      { moduleId: "sodium-metal-crystal" },
      { moduleId: "nacl-crystal" },
      { moduleId: "zinc-metal-crystal" },
      { moduleId: "octahedral-voids" },
    ],
  },
  {
    id: "organic-spatial",
    title: "有机空间结构",
    subtitle: "平面 → 直线 → 苯环 → 共面综合",
    steps: [
      { moduleId: "ethylene-planar" },
      { moduleId: "acetylene-linear" },
      { moduleId: "benzene-planar" },
      { moduleId: "organic-coplanar" },
    ],
  },
];
