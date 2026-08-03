# Chemistry Verification / 化学事实复核

> 最后复核：2026-08-01（T-033）
> 复核对象：BF₃ 缺电子边界、CaF₂ 萤石晶胞、芳环—乙烯基共面教学模型，以及既有 NaCl 周期模型
> 结论状态：T-033 的“来源—结论—文案—代码—测试”映射已建立；旧 NaCl 核验记录继续保留。

## T-033：三处化学内容核验

### 现有内容定位与影响范围

2026-08-01 对 `BF3 / BF₃ / 缺电子 / 电子不足 / CaF2 / CaF₂ / 氟化钙 / 晶胞参数 / styrene / 苯乙烯 / 共面 / 近共面 / TODO-CHEM-VERIFY` 做了全仓检索。命中文件分为三类：

- **直接决定 T-033 页面内容与几何**：`frontend/src/data/manual/bf3.json`、`caf2.json`、`learningModules.ts`、`mockMolecules.ts`、`molecularPolarity.ts`、`organicBuilderSeeds.ts`、`organicCoplanar.ts`、`frontend/src/components/three/CaF2Cell.tsx`、`frontend/src/components/learning/OrganicCoplanarPanel.tsx`、`frontend/src/pages/ModuleDetailPage.tsx`、`frontend/src/data/examTopics.ts`。
- **直接或相邻测试**：`frontend/tests/logic/chemistry-content.logic.spec.ts`、`crystal-geometry.logic.spec.ts`、`organic-builder-fixes.logic.spec.ts`；`frontend/tests/visual/molecule-viewer.visual.spec.ts`、`crystal-viewer.visual.spec.ts`、`organic-coplanar.visual.spec.ts`、`molecular-polarity.visual.spec.ts`、`core-learning-pages.visual.spec.ts`、`module-state-reset.visual.spec.ts`、`three-viewer-frame.visual.spec.ts`、`crystal-atom-legend.visual.spec.ts`。其余乙烯、乙炔、苯专题测试只命中通用“共面”术语，不是本轮争议结论。
- **数据副本、目录与说明文档**：`backend/src/molecules.js` 及 `backend/test/{api,data-parity,server.integration}.test.js` 含 BF₃ 结构副本，但没有本轮缺电子结论；`backend/README.md`、根 `README.md`、`CHANGELOG.md`、`docs/releases/v0.1.0-rc.1.md` 只列模块或版本；`docs/PRODUCT_COMPLETENESS_AUDIT.md`、`PROJECT_STATUS.md`、`TASKS.md`、`DECISIONS.md`、`HANDOFF.md`、`ROADMAP.md` 记录任务状态；`PROJECT_BRIEF.md`、`UI_SPEC.md`、`MOLECULE_DATA_SCHEMA.md`、`CODE_REVIEW.md`、`QA_CHECKLIST.md`、`RC_FEEDBACK.md`、`BACKEND_DATA_SYNC.md` 和 `AGENTS.md` 只命中项目规则或通用术语。

检索还命中 `AcetyleneLinearPanel.tsx`、`BenzenePlanarPanel.tsx`、`BenzenePlanarToolbar.tsx`、`EthylenePlanarPanel.tsx`、`EthylenePlanarToolbar.tsx`、`MolecularPolarityPanel.tsx`、`MolecularPolarityToolbar.tsx`、`CrystalAtomLegend.tsx`，以及 `acetyleneLinear.ts`、`benzenePlanar.ts`、`bondingBasics.ts`、`ethylenePlanar.ts`、`ethylene-planar.json`、`zns.json`、`useOrganicPlanarControls.ts`、`organicBuilderChemistry.ts`。逐项检查后，这些内容只涉及通用平面 / 共线教学、BF₃ 极性或其他晶体，不承载 T-033 需要纠正的三条结论，因此未改动。

### 权威来源与来源支持的结论

| ID | 来源、条目与正式信息 | 来源支持的具体结论 | 本项目采用方式 |
| --- | --- | --- | --- |
| B1 | [IUPAC Gold Book：Lewis acid](https://goldbook.iupac.org/terms/view/L03508/html)，DOI `10.1351/goldbook.L03508`，2026-08-01 访问 | 路易斯酸是电子对受体，可与路易斯碱形成加合物。 | 用“可接受电子对”解释 BF₃ 的路易斯酸性，不把“酸”含混写成“不稳定”。 |
| B2 | [OpenStax Chemistry 2e §15.2, Lewis Acids and Bases](https://openstax.org/books/chemistry-2e/pages/15-2-lewis-acids-and-bases)，2026-08-01 访问 | BF₃ 的 B 价层只有 6 个电子、少于八隅体，并能与电子对给体反应。 | 基础页写“常用中性路易斯结构中，中心 B 周围计入 6 个价层电子，未满足八隅体”。 |
| B3 | [OpenStax Chemistry §7.3, Lewis Symbols and Structures](https://openstax.org/books/chemistry/pages/7-3-lewis-symbols-and-structures)，2026-08-01 访问 | 三条 B—F 单键是常用 Lewis 表示；实验 B—F 键较预期单键短，可见一定多键特征。 | 把多键 / 离域放入补充边界，不用它否定基础 Lewis 计数。 |
| B4 | J. M. Guevara-Vela et al., [“Electrostatics Explains the Reverse Lewis Acidity of BH₃ and Boron Trihalides”](https://pubs.acs.org/doi/10.1021/acs.jpca.1c05766), *J. Phys. Chem. A* (2021)，DOI `10.1021/acs.jpca.1c05766` | “π 回馈解释 BX₃ 酸性顺序”存在理论模型争议；该研究提出静电解释，不支持把强 π 回馈当成唯一原因。 | 高中页不下“π 回馈完全填满 B 空轨道”等过度结论，只说 B—F 有一定多键 / 离域特征且不改变 BF₃ 为路易斯酸的基础事实。 |
| C1 | [AFLOW Fluorite prototype AB2_cF12_225_a_c-001](https://aflow.org/p/AB2_cF12_225_a_c-001/)，Mehl et al., *Comput. Mater. Sci.* 136 (2017)，DOI `10.1016/j.commatsci.2017.01.017` | CaF₂ 为 fluorite / C1，Pearson `cF12`，空间群 `Fm-3m`（No. 225）；Ca 在 4a，F 在 8c 的 `(1/4,1/4,1/4)` 类位置。 | 确认项目是萤石型常规立方晶胞，坐标与 4 Ca + 8 F 计数正确。 |
| C2 | S. Speziale & T. S. Duffy, [“Single-crystal elastic constants of fluorite (CaF₂) to 9.3 GPa”](https://duffy.princeton.edu/sites/g/files/toruqf616/files/speziale_pcm_2002.pdf), *Phys. Chem. Miner.* 29 (2002) 465–472，DOI `10.1007/s00269-002-0250-x` | 约 300 K 的实验研究确认常压相为立方 `Fm-3m`；同一样品在大气压下的粉末 XRD 晶格常数为 `5.4631 ± 0.0004 Å`，与引用值 `5.4632 ± 0.0003 Å` 一致。 | 页面只给“室温附近、常压下约 5.463 Å”，不伪装成跨温压的唯一常数。 |
| C3 | R. Vauchy et al., [“Breaking the hard-sphere model with fluorite and antifluorite solid solutions”](https://www.nature.com/articles/s41598-023-29326-0), *Scientific Reports* 13, 2217 (2023)，DOI `10.1038/s41598-023-29326-0` | 萤石结构中阳离子、阴离子分别为 8 配位和 4 配位；论文将 298 K 实验晶格参数与离子半径分开讨论，并说明硬球半径不能简单等同真实晶格。 | 锁定 Ca²⁺ 8 配位、F⁻ 4 配位，并在页面明确区分晶格常数、离子半径、最近邻距离与显示尺度。 |
| O1 | [NIST CCCBDB：Styrene experimental barrier to internal rotation](https://cccbdb.nist.gov/exprotbar2x.asp?casno=100425&ti=1)，收录 Caminati, Vogelsanger & Bauder, *J. Mol. Spectrosc.* 128 (1988) 384–398；2026-08-01 访问 | 气相微波数据拟合的苯基—乙烯基扭转势在 0° / 180° 为最低点，45° 高约 3.58 kJ·mol⁻¹，90° 高约 13.77 kJ·mol⁻¹。 | 只说明**单纯苯乙烯气相势能最低构象近共面**，不把 45° 说成最低能。 |
| O2 | V. H. Grassian et al., [“Conformational Study of Jet-Cooled Styrene Derivatives”](https://doi.org/10.1021/j100346a022), *J. Phys. Chem.* 93 (1989) 3470–3474，DOI `10.1021/j100346a022` | 喷射冷却条件下，苯乙烯及若干无位阻取代物的乙烯基与芳环为平面构象；不同取代物可出现不同构象数。 | 支持“无明显位阻时倾向近共面”，同时禁止推广为所有取代苯乙烯始终共面。 |
| O3 | N. Yasuda, H. Uekusa & Y. Ohashi, [“Styrene at 83 K”](https://doi.org/10.1107/S1600536801019237), *Acta Cryst.* E57 (2001) o1189–o1190，DOI `10.1107/S1600536801019237` | 83 K 单晶中苯环—乙烯基扭转角为 `7.82(17)°`，属于近共面而非严格 0°。 | 用于区分低温固态实测与理想完全共面模型。 |
| O4 | G. Celebre et al., [“Is styrene planar in liquid phases?”](https://doi.org/10.1063/1.1668636), *J. Chem. Phys.* 120 (2004) 7075–7084，DOI `10.1063/1.1668636` | 液相 NMR 需要考虑环—烯内旋转的时间平均；“室温液相始终为一个完全共面静止构象”并不成立。 | 页面用“实际取向会受相态、环境与热运动影响”，不向高中生堆叠动力学细节。 |

### 三项内容结论与文案决定

#### BF₃

- **原内容**：“缺电子分子”“中心原子 B 没有满 8 电子结构”，另有 `TODO-CHEM-VERIFY`。第二句方向正确，但第一句容易被理解为所有原子都缺电子，且没有解释 Lewis 酸语义。
- **确认结论**：在常用中性 Lewis 结构中，三个 B—F 单键使中心 B 周围计入 6 个价层电子，B 未满足八隅体；BF₃ 能接受路易斯碱的电子对，因此是 Lewis 酸 [B1–B2]。这不等于三个 F 也都缺电子，也不等于 BF₃ “不稳定”。
- **高级边界**：B—F 键长与成键分析说明简单三单键图不是电子结构的全部；对 BX₃ 酸性顺序是否主要由 pπ–pπ 回馈解释，现代分析并不一致 [B3–B4]。因此基础页只保留“可有一定多键 / 离域特征”，不把某一种轨道解释写成唯一事实。
- **最终层级**：模块要点使用“中心 B 周围 6 个价层电子 / 未满足八隅体 / 可接受电子对”；补充说明才谈 B—F 多键或离域边界。

#### CaF₂

- **原内容**：结构、坐标、4:8 计数和 8:4 配位均正确；但 metadata 写“a 约 5.46 Å”且留有 `TODO-CHEM-VERIFY`，没有注明温压，也没有在页面明确模型长度不是 Å。
- **确认结论**：项目显示的是常压萤石型 `Fm-3m` 常规立方晶胞，Ca 为 4a 面心立方子晶格，F 为 8c；常规胞含 4 Ca²⁺ + 8 F⁻；Ca²⁺ 配位数 8、F⁻ 配位数 4 [C1–C3]。电荷守恒决定 Ca : F = 1 : 2；从 Ca、F 两端统计同一批最近邻接触得到 `4 × 8 = 8 × 4`。两者在本结构中相容，但不是同一条规则，不能泛化为“个数少的离子必然配位数更高”。
- **参数边界**：C2 在约 300 K、常压实验体系中给出 `a = 5.4631 ± 0.0004 Å`；其他室温来源在末位会略有差异。温度、压力、样品纯度和测量 / 拟合方法都会造成差别，因此页面采用“室温附近、常压下约 5.463 Å”，不宣称唯一绝对值。
- **显示模型**：`caf2.json` 使用以晶胞中心为原点的分数位置 `±0.5 / ±0.25`；`CaF2Cell.tsx` 再乘统一渲染尺度。模型没有把 5.463 Å 转换为 Three.js 世界单位。最近邻 Ca—F 的几何距离是 `√3·a/4`，也不能与晶格常数、离子半径或画面球半径混用。

#### 芳环—乙烯基近共面

- **原内容**：源码注释把“苯乙烯类因共轭，优势构象近共面”与固定 45° 教学姿态并列，容易让人误以为模型是苯乙烯或 45° 是能量结论。
- **模型身份**：页面实际是 `C₆H₂(CH₃)(CH=CH₂)(C≡CH)(NH₂)`、分子式 `C₁₁H₁₁N` 的四取代苯综合教学模型；它同时混合甲基、乙烯基、乙炔基和胺基，不是单纯苯乙烯，也没有为该具体取代结构做构象搜索。
- **分相态结论**：单纯苯乙烯的气相扭转势最低点在近共面位置 [O1]；无明显位阻的若干喷射冷却衍生物也可近共面 [O2]；83 K 晶体中实测为约 7.82°，不是严格 0° [O3]；液相存在内旋转与时间平均 [O4]。这些结果分别属于气相、喷射冷却、低温固态和液相，不能混成“室温始终完全共面”。
- **最终层级**：页面明确 45° 是为了演示单键扭转而人为固定的理想化代表姿态；“对齐平面”也是几何教学操作，不是最低能预测。实际取向受具体取代基、相态、环境和热运动影响。

### 来源—结论—文案—代码—测试核验矩阵

| 核验项 | 当前表述（修改前） | 核验结论 | 权威来源 | 最终文案 | 代码位置 | 测试位置 |
| --- | --- | --- | --- | --- | --- | --- |
| BF₃：中心 B 的电子计数 | “缺电子分子”“中心原子 B 没有满 8 电子结构” | 常用中性 Lewis 结构中，中心 B 周围计入 6 个电子、未满足八隅体；不能扩写为所有原子都缺电子或分子不稳定。 | B2、B3 | “常用中性路易斯结构中，中心 B 周围计入 6 个价层电子” | `learningModules.ts`、`manual/bf3.json`、`mockMolecules.ts` | `chemistry-content.logic.spec.ts`；`molecule-viewer.visual.spec.ts` |
| BF₃：Lewis 酸与 B—F 成键边界 | 只提“电子不足”，未解释 Lewis 酸；TODO 待核实 | BF₃ 可接受电子对，符合 Lewis 酸定义；B—F 多键 / 离域说明简单 Lewis 图有限，但其解释细节有模型争议，不取消 Lewis 酸事实。 | B1–B4 | “中心 B 未满足八隅体，可接受电子对，表现为路易斯酸”；多键 / 离域放 metadata 补充 | `learningModules.ts`、`manual/bf3.json` | 同上 |
| CaF₂：结构、坐标、计数和配位 | 萤石型；Ca 面心立方，F 填满 8 个四面体位置；4 Ca + 8 F；8:4 配位；曾把倒数关系概括成“电中性要求” | 几何、计数和配位正确；标准结构为 `Fm-3m`、Ca 4a、F 8c。闭合画面显示 8 顶点 + 6 面心 Ca，但均摊后是 4 Ca。电荷守恒决定 1:2，`4 × 8 = 8 × 4` 来自最近邻接触两端计数，二者不可混同。 | C1、C3 | “萤石型（CaF₂ 型，立方 Fm-3m）”“Ca²⁺：8；F⁻：4”“从两端统计同一批最近邻接触” | `manual/caf2.json`；Viewer 几何在 `components/three/CaF2Cell.tsx`；目录在 `learningModules.ts` / `examTopics.ts` | `chemistry-content.logic.spec.ts`；`crystal-viewer.visual.spec.ts` |
| CaF₂：晶格常数与模型尺度 | “a 约 5.46 Å（TODO：精确参数）”，未注明条件；未明确 UI 缩放关系 | 约 300 K、常压实验值可记为 `5.4631 ± 0.0004 Å`；项目只需给约值与条件。模型按分数坐标 / 视觉尺度，不使用 Å 直接缩放。 | C2、C3 | “室温附近、常压下约 5.463 Å；数值随条件和来源略变；画面单位不等于 Å” | `manual/caf2.json`；尺度实现 `CaF2Cell.tsx` | `chemistry-content.logic.spec.ts` |
| 综合模型身份与 45° 姿态 | 注释称“苯乙烯类”，代码固定 45°；页面只说“默认示例” | 实际是 `C₁₁H₁₁N` 四取代苯综合示例，45° 未经能量计算，只是教学姿态，不能当成具体化合物的最低能构象。 | 模型组成来自项目代码；相态边界由 O1–O4 支持 | “理想化综合模型，不是单纯苯乙烯”“45° 是代表性教学姿态” | `organicBuilderSeeds.ts`、`organicCoplanar.ts`；Viewer 同样固定 45° 于 `OrganicCoplanarViewer.tsx` | `chemistry-content.logic.spec.ts`；`organic-coplanar.visual.spec.ts` |
| 单纯苯乙烯 / 衍生物的近共面边界 | 容易读成“所有苯乙烯类始终共面” | 气相最低点可近共面；83 K 晶体为近共面但非严格 0°；液相有动态扭转；取代物受位阻和环境影响，不能一概而论。 | O1–O4 | “实际取向会受取代基、相态、环境与热运动影响”“对齐不是最低能预测” | `organicCoplanar.ts`、`organicBuilderSeeds.ts` | 同上 |

### T-033 验证边界

- 项目测试只证明代码仍呈现上述已核实结论，不是化学来源。
- 本轮不改 BF₃、CaF₂ 或综合有机模型的原子坐标；检查结果表明，争议集中在文案边界与物理尺度说明。
- `backend/src/molecules.js` 的 BF₃ 副本只承载平面三角形结构，没有重复“缺电子”文案，因此保持不动；既有 parity 测试继续锁结构核心。
- Windows 环境不更新 Darwin 视觉快照；新增的浏览器断言不产生截图。

## T-029A：NaCl 教学模型核验记录

## 适用范围

本页只复核 `naclPeriodicGeometry.ts`、两套 NaCl Viewer、`nacl.json` 及其测试直接使用的事实。它描述常压附近常见的岩盐型（rock-salt / halite）NaCl 教学模型，不是温压相图、缺陷化学、表面结构或精确实验晶格参数数据库。

以下两类结论必须分开：

- **晶体学事实**：结构类型、空间群、常规胞坐标、晶胞组成、第一配位层和以物理晶格常数 `a` 表示的最近邻距离。
- **项目显示算法**：`NACL_LATTICE_PARAMETER = 2`、半开周期超晶胞的 canonical 表示、`(2N+1)³` 个显示实例、边界显示副本与 ghost。

## 来源与证据等级

| ID | 来源 | 类型与出版 / 访问信息 | 本项目采用的证据 |
| --- | --- | --- | --- |
| S1 | [International Tables for Crystallography, Vol. A, §1.3.2](https://it.iucr.org/Ac/ch1o3v0001/sec1o3o2/) | IUCr 权威晶体学表；2016；2026-07-29 访问 | conventional / primitive cell 定义；面心立方常规胞的三个心化平移；常规胞体积为原胞 4 倍。 |
| S2 | [IUCr Online Dictionary: Z and Z'](https://dictionary.iucr.org/Z_and_Z%27) | IUCr 在线晶体学词典；页面 2025-09-18 更新；2026-07-29 访问 | NaCl 属 `Fm-3m`；晶胞含 4 Na 与 4 Cl，故 `Z=4`。 |
| S3 | [Lima-de-Faria et al., “Nomenclature of inorganic structure types”](https://www.iucr.org/resources/commissions/crystallographic-nomenclature/inorganic) | IUCr 委员会报告，*Acta Cryst.* A46 (1990) 1–11；DOI `10.1107/S0108767389008834` | NaCl 的双方六配位、八面体第一配位环境、三维无限离子结构与 `Fm-3m` 结构类型表达。 |
| S4 | [AFLOW Rock Salt/Halite prototype: AB_cF8_225_a_b-001](https://aflowlib.org/p/AB_cF8_225_a_b-001/) | 学术晶体原型库；Mehl et al., *Comput. Mater. Sci.* 136 (2017) S1–S828；DOI `10.1016/j.commatsci.2017.01.017`；2026-07-29 访问 | NaCl / halite / B1、Pearson `cF8`、空间群 `Fm-3m`（No. 225）、Cl 4a 与 Na 4b、FCC 原胞基矢。页面记录 ICSD 240598，并引用 AMCSD 来源。 |
| S5 | [Materials Data on NaCl by Materials Project (mp-22862)](https://www.osti.gov/biblio/1199028) | Materials Project / LBNL 数据集，OSTI；2020；DOI `10.17188/1199028`；2026-07-29 访问 | halite / rock-salt、立方 `Fm-3m`；Na 与 Cl 均有 6 个异号最近邻，形成 NaCl₆ / ClNa₆ 八面体。 |
| S6 | [Hendrickson, “Evolution of diffraction methods for solving crystal structures”](https://journals.iucr.org/a/issues/2013/01/00/wl0020/wl0020.pdf) | *Acta Cryst.* A69 (2013) 51–59；DOI `10.1107/S0108767312050453` | 文中 NaCl 示例使用物理晶格常数约 `5.640 Å`，用于证明项目的数值 `2` 不是物理晶格常数。 |

证据使用原则：

- S1–S3 是术语、晶胞和配位表达的最高优先级依据。
- S4–S5 提供具体 NaCl 结构记录并交叉核对空间群、Wyckoff 位置和配位。
- S6 只用于区分真实物理长度与项目显示尺度；本项目不把某个温压条件下的实验数值写成通用常量。
- 项目测试只能证明实现符合已确认的关系，不能反过来充当化学来源。

## NaCl 岩盐型结构

已确认：

- NaCl 采用 rock-salt / halite（B1）型结构，标准空间群为 `Fm-3m`（No. 225）[S3–S5]。
- `F` 表示面心立方常规胞。S1 给出的三个面心平移为 `(0,1/2,1/2)`、`(1/2,0,1/2)`、`(1/2,1/2,0)`；该常规胞体积是 FCC 原胞的 4 倍。
- 项目使用边长互相垂直的立方常规胞，以便与高中教材晶胞边框、顶点 / 面心 / 棱心 / 体心计数一致。它不是最小原胞。
- 由常规胞 `Z=4` 与 FCC 常规胞 / 原胞体积比 4 可知，NaCl 原胞含 1 个 NaCl 化学式单位；项目没有把常规胞的 8 个离子位点称作原胞基元。

## 常规晶胞与分数坐标

AFLOW 的标准表示把 Cl 放在 4a、Na 放在 4b。用 S1 的 F 心化平移展开这两个 Wyckoff 轨道，得到：

| 子格子 | 常规胞内完整分数坐标集合 | 与项目实现的关系 |
| --- | --- | --- |
| Cl⁻（4a） | `(0,0,0)`、`(0,1/2,1/2)`、`(1/2,0,1/2)`、`(1/2,1/2,0)` | 与 `naclConventionalBasis.chloride` 逐项相同。 |
| Na⁺（4b） | `(1/2,1/2,1/2)`、`(1/2,0,0)`、`(0,1/2,0)`、`(0,0,1/2)` | 与 `naclConventionalBasis.sodium` 集合相同，仅排列顺序不同。 |

进一步核对：

- Cl⁻ 集合整体加 `(1/2,0,0)` 并对每个分量取模 1，正好得到 Na⁺ 集合；沿 `y` 或 `z` 的等价半胞平移也给出同一轨道集合。
- 因而两组坐标是两个互相穿插的 FCC 子格子，属于同一个标准常规胞与原点选择；无需通过改变结构来“修正”坐标。
- 常规胞内有两个被占据的 Wyckoff 轨道（Cl 4a、Na 4b）。完整列出的 4+4 个位置不是 8 个对称学不等价位点。

结论：当前代码的 NaCl 分数坐标正确，无需修改。

## 配位数与最近邻距离

S3 与 S5 均确认 Na 和 Cl 互为六配位，第一配位环境为八面体。由已核对的分数坐标可直接得到：

- 以 Cl⁻ `(0,0,0)` 为例，最近的 Na⁺ 周期像位于 `(±1/2,0,0)`、`(0,±1/2,0)`、`(0,0,±1/2)`。
- 以 Na⁺ 为中心同理，最近的 6 个 Cl⁻ 位于当前正交立方坐标系的 `±x / ±y / ±z` 方向。
- 若物理常规胞边长记为 `a`，每个位移向量只有一个分量为 `±1/2`，所以最近邻距离严格为 `a/2`。
- “六配位”在本项目中专指**第一配位层的 6 个最近邻异号离子**，不是 6 条共价键。

### `NACL_LATTICE_PARAMETER = 2` 的语义

代码中的常量应读作无量纲显示尺度 `a_model = 2`：

| 量 | 项目数值 | 含义 |
| --- | --- | --- |
| `NACL_LATTICE_PARAMETER` | `2` | 让单个常规胞边框落在 `[-1,+1]` 的渲染坐标尺度。 |
| `NACL_NEAREST_DISTANCE` | `1` | `a_model/2`，即 Viewer 内部坐标距离。 |
| 物理晶格常数 `a` | 未写入项目常量 | 随温度、压力、样品和计算方法而变，应带 Å 等物理单位并注明条件。 |

S6 的 NaCl 示例给出约 `5.640 Å`，已经足以排除“代码中的 2 表示 2 Å / 2 nm”的解释。项目 UI 不展示物理晶格参数，也不允许从显示坐标反推实验长度。

## 超晶胞计数

常规胞含 4 Na⁺ + 4 Cl⁻ = 4 个 NaCl 化学式单位 [S2]。因此 N×N×N 常规胞超晶胞为：

| 项目 | 数量 |
| --- | --- |
| 常规晶胞 | `N³` |
| Na⁺ | `4N³` |
| Cl⁻ | `4N³` |
| NaCl 化学式单位 | `4N³` |
| canonical 离子位点 | `8N³` |

这里的 canonical 是项目术语：在 `[0,N)³` 半开周期区间内，每个组成位点只列一次。它不是“所有对称学不等价位点”；晶体学上仍是 4a 与 4b 两个被占据的 Wyckoff 轨道。

## canonical sites、display instances 与 ghost images

| 对象 | 来源 | 是否计入当前超晶胞组成 | 教学语义 |
| --- | --- | --- | --- |
| `NaClPeriodicSite` / canonical site | 常规胞 4+4 位点按 N³ 扩展 | 是，合计 `8N³` | 周期模型中不重复计数的离子位点。 |
| `NaClDisplayInstance` | 项目把位于半开区间下边界的位点复制到正侧边界 | 否；它引用既有 `siteId` | 用于闭合外边界的显示本体或边界显示副本。 |
| ghost atom | 选中某个显示实例后，为完整显示其第一配位层临时补出的相邻周期镜像 | 否 | “周期补齐镜像”是正式含义，“幽灵粒子”只是辅助称呼。 |

`generateNaClDisplayInstances` 的总数是：

```text
(2N+1)³
N=1 → 27
N=2 → 125
N=3 → 343
```

这是项目把边长为 N 个常规胞、步长为半个常规胞的交错离子点阵连同两端边界一起显示后得到的实例数。它不是标准晶体学组成公式，也不产生额外离子。化学组成始终由 `8N³` 个 canonical 位点计算。

ghost 的判定还依赖当前选中的显示身份 `siteId + periodicImageShift`。它只存在于一次配位观察的渲染结果中，不写回 canonical sites 或常规 display instances。

## 教学文案边界

- 优先说“周期模型中的独立离子位点”，并紧接说明它是当前有限超晶胞的不重复组成计数，不是对称学不等价位点数。
- 第一次出现 ghost 时写“周期补齐镜像（幽灵粒子）”，避免把它理解为新增真实离子。
- 使用“边界显示副本”“第一配位层”“最近邻配位引导线”，不使用“实际粒子数”或“六条键”。
- 周期 Viewer 的六条虚线由 `NaClCoordinationDisplayCluster` 直接绘制，不写入 `molecule.bonds`，只连接中心与 6 个最近邻。
- 旧教学 Viewer 的 `nacl.json` 为兼容通用结构 schema，保存了 6 条 `kind: "ionic-neighbor"` 的教学引导记录；它们只服务于最近邻展示，数据文案与 UI 均明确不是共价键。
- NaCl 晶体按三维无限离子晶格理解，不暗示它由离散 NaCl 分子构成。

## 代码和测试映射

| 已验证结论 | 对应代码 | 对应测试 | 状态 |
| --- | --- | --- | --- |
| Cl 4a / Na 4b 的常规胞坐标；两 FCC 子格子相差半胞平移 | `frontend/src/components/three/naclPeriodicGeometry.ts`：`naclConventionalBasis` | `frontend/tests/logic/nacl-periodic.logic.spec.ts`：`naclConventionalBasis` 用例 | 已验证 |
| 常规胞 4 Na + 4 Cl；N 超晶胞 `8N³`、1:1 | `generateNaClPeriodicSites` | N=1/2/3 计数、元素比、唯一性用例 | 已验证 |
| 第一配位层为 6 个异号离子，方向 `±x/±y/±z`，距离 `a_model/2` | `getNaClCoordinationImages`、`NACL_NEAREST_DISTANCE` | 配位数、异号、距离、方向、边界周期像用例 | 已验证 |
| `NACL_LATTICE_PARAMETER=2` 仅为无量纲显示尺度 | 常量注释、`NaClPeriodicPanel.tsx` 最近邻距离说明 | 常量关系用例 + Crystal Workspace 文案断言 | 已验证 |
| display instance 不创建 canonical site；数量与 `8N³` 分离 | `generateNaClDisplayInstances` | 27/125/343、siteId 存在、重建公式、输入不变用例 | 已验证 |
| ghost 不写回组成，最终身份由 combined shift 决定 | `buildNaClCoordinationDisplayCluster` | 边界副本、ghost、combined shift、输入不变用例 | 已验证 |
| 六条虚线是最近邻配位引导，不是共价键 | `NaClPeriodicCell.tsx`：`CoordinationOverlay` | `crystal-workspace.visual.spec.ts` 的选择 / 第一配位层状态流转 | 已验证 |
| 旧教学晶胞 4:4、六配位与非分子边界 | `nacl.json`、`NaClCell.tsx` | `crystal-viewer.visual.spec.ts` 的 NaCl 定向用例 | 已验证 |

现有逻辑测试已经覆盖本轮要求的几何与计数关系，因此 T-029A 不复制第二套化学算法，也不新增重复的几何测试；只补长期有价值的 UI 语义断言。

## 已验证结论

- [x] rock-salt / halite、`Fm-3m`（No. 225）记录一致。
- [x] 项目使用 FCC 常规立方晶胞，不是原胞。
- [x] 当前 4 个 Cl⁻ 与 4 个 Na⁺ 分数坐标正确。
- [x] 常规胞含 4 个 NaCl 化学式单位。
- [x] 两类离子的第一配位数均为 6，方向为 `±x / ±y / ±z`，距离为 `a/2`。
- [x] `a_model=2` 与物理晶格常数已经区分。
- [x] `8N³` 组成计数与 `(2N+1)³` 显示实例计数已经区分。
- [x] display instance、ghost 与虚线的教学语义已经区分。
- [x] NaCl 的两个 `TODO-CHEM-VERIFY` 已有来源支持，可替换为本页引用。

## NaCl 尚未验证事项

- 本页不选定某一温度、压力下的 NaCl 精确物理晶格常数；Viewer 也不展示物理单位。
- 不覆盖高压相变、缺陷、表面、声子、能量或稳定性预测。
- 不扩展到本页 T-033 之外的其他化学主题。
- T-029B 的 macOS Darwin 视觉回归仍待执行；Windows 不更新该基线。
