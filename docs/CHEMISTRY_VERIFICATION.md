# Chemistry Verification / 化学事实复核

> 最后复核：2026-07-29（T-029A）
> 复核对象：NaCl 教学晶胞与 Crystal Workspace 周期模型
> 结论状态：本页列出的 NaCl 结构、坐标、组成与第一配位层结论已完成来源核对。

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

## 尚未验证事项

- 本页不选定某一温度、压力下的 NaCl 精确物理晶格常数；Viewer 也不展示物理单位。
- 不覆盖高压相变、缺陷、表面、声子、能量或稳定性预测。
- 不扩展到 BF₃、CaF₂ 或全站其他化学待核实项。
- T-029B 的 macOS Darwin 视觉回归仍待执行；Windows 不更新该基线。
