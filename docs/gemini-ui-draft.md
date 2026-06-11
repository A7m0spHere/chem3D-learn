# Gemini UI Draft

## 草稿边界

这份文档保存 Gemini 生成的 HomePage / LearningPage UI 原型代码，以及对该原型的工程、化学内容和接入方式评审。

该草稿仅作为 UI 视觉方向、页面布局和交互原型参考，不是正式前端工程代码。后续接入时必须遵守项目既定技术栈与边界：Vite、React、TypeScript、Tailwind CSS、shadcn/ui、React Three Fiber、Drei；不得引入 Next.js、Firebase、后端服务、登录、数据库、Gemini API 或 AI 聊天功能。

## 评审摘要

- Gemini 草稿的浅色教育风、首页与学习页结构、模型选择、教学步骤、显示键角/孤电子对等交互方向可作为参考。
- 不建议直接把该代码接入正式工程，因为它把 UI、数据、教学文案和伪 3D 渲染器集中在一个 `App.tsx` 风格文件中。
- 不应把其中的 Canvas 伪 3D `ViewerPlaceholder` 当作正式 `MoleculeViewer`；正式 3D 应使用 React Three Fiber + Drei 重写。
- 不应采用草稿中的分子数据结构作为正式 schema；正式数据应以 `docs/MOLECULE_DATA_SCHEMA.md` 为准，并放入 `frontend/src/data/manual`。
- 化学文案后续需要复核：CO2 的 π 键表述应更适合高中阶段，BF3 中“平面大平面”等生成错误要修正，NaCl 当前更像局部配位环境示意，不应直接称为完整晶胞。
- 后续接入建议：先拆分 Home / Learning 静态 UI，再用占位 Viewer，最后单独实现 React Three Fiber 版核心 3D 模型。

## 完整评审文本

结论：**这份 Gemini 代码可以作为 UI 原型参考，但不建议直接作为正式前端工程代码接入。**

它的视觉方向基本对，页面也能表达你想要的产品形态；但它把 **UI、分子数据、教学文案、伪 3D 渲染器** 全塞进了一个 `App.tsx` 风格文件里，而且数据结构和我们前面定的 `MOLECULE_DATA_SCHEMA` 不一致。正式开发时，应让 Codex **吸收它的界面风格，不照搬它的工程结构**。

## 一、这份代码做得好的地方

### 1. 没有明显跑偏到后端或 AI SaaS

它没有引入登录、数据库、Firebase、Gemini API、后端接口，也没有变成 AI 聊天站。这点符合你目前的 MVP 边界。

### 2. 视觉方向基本符合项目

它用了你之前定下的浅色教育风色彩：`#2A9D8F`、`#1F6F68`、`#F4A261`、`#F7FAF9`、`#1F2933` 等，这和我们之前设定的设计系统基本一致。报告里也明确建议把这些颜色 token 固定下来，避免 AI 生成紫蓝色 SaaS 风格。

### 3. 页面结构符合 Home + Learning 的方向

代码里有首页、学习页、顶部导航、模型卡片、左侧模型目录、中间 Viewer、右侧讲解面板、底部步骤条，这些都符合我们之前定的 Learning 页结构。上传代码中已经包含 `AppHeader`、`HomePage`、`LearningPage`、`MoleculeSidebar`、`ViewerPlaceholder`、`LessonPanel`、`StepBar` 等组件雏形。

### 4. 交互原型比普通静态 UI 更完整

它已经做了模型切换、步骤切换、自动旋转、显示键角、显示孤电子对、重置视角等原型交互。`ViewerPlaceholder` 使用 Canvas 做了一个“伪 3D”渲染器，支持拖拽旋转和自动旋转。

这对**早期演示效果**有帮助。

## 二、主要问题：不能直接作为正式代码

### 问题 1：它不是 React Three Fiber / Drei 真 3D

我们之前定的正式 3D 技术栈是：

```text
React Three Fiber + Drei + Three.js
```

报告里也明确说，MVP 前端基线应采用 Vite + React + TypeScript + Tailwind + shadcn/ui + React Three Fiber + Drei。

但 Gemini 这份代码用的是：

```text
HTML Canvas 2D + 手写 3D 投影公式
```

这可以当“视觉占位”或“交互演示”，但不适合作为正式 MoleculeViewer。原因：

* 它不是 WebGL。
* 不能自然扩展到真正的 3D 模型、光照、轨道、晶胞。
* 后面接 `AtomMesh / BondMesh / AngleArc / LonePairMesh` 会比较别扭。
* 鼠标滚轮缩放其实没实现，代码里提示“滚动滑轮（此处为模拟）”。

我的建议：**保留这个 Canvas 版本作为 Gemini UI demo，不要把它命名为正式 `MoleculeViewer`。**

正式版本仍然让 Codex 用 React Three Fiber 重写。

---

### 问题 2：数据结构和我们定的 schema 不一致

Gemini 代码里定义的是：

```ts
interface MoleculeData {
  id: string;
  name: string;
  formula: string;
  category: ...
  geometry: string;
  bondAngle: string;
  centralAtom: string;
  lonePairsCount: string;
  commonMistake: string;
  steps: ...
  atoms: ...
  bonds: ...
  lonePairs?: ...
}
```

这个结构能跑原型，但不符合我们之前定的正式数据契约。报告中建议的正式 schema 应包含 `kind`、`names`、`atoms`、`bonds`、`lonePairs`、`keyAngles`、`annotations`、`lessonSteps`、`rendering`、`metadata`、`crystal` 等字段。

当前问题包括：

* `name` 不是 `{ zh, en }`。
* 没有 `kind: "molecule" | "crystal"`。
* 没有 `keyAngles`，只有一个字符串 `bondAngle`。
* 没有 `lessonSteps`，而是 `steps`。
* 没有 `metadata`。
* `atoms` 里直接写 `x/y/z`，不是 `position: [x, y, z]`。
* `bonds` 用数组下标 `from: number/to: number`，不如用原子 ID 稳定。
* 所有数据写在 `App.tsx` 里，没有拆到 `frontend/src/data/manual/`。

这会导致后面扩展困难。

正式工程应该是：

```text
frontend/src/types/molecule.ts
frontend/src/data/manual/ch4.json
frontend/src/data/manual/nh3.json
frontend/src/data/manual/h2o.json
frontend/src/data/manual/co2.json
frontend/src/data/manual/bf3.json
frontend/src/data/manual/nacl.json
```

---

### 问题 3：组件全部挤在一个文件，不适合长期维护

现在这份代码把：

* 类型定义
* 分子数据
* 页面路由
* Header
* HomePage
* LearningPage
* Sidebar
* Viewer
* LessonPanel
* StepBar

全部放在一个文件里。作为 Gemini demo 可以接受，但正式项目不能这么做。

建议拆成：

```text
frontend/src/pages/HomePage.tsx
frontend/src/pages/LearningPage.tsx

frontend/src/components/common/AppHeader.tsx
frontend/src/components/home/ModuleCard.tsx
frontend/src/components/learning/MoleculeSidebar.tsx
frontend/src/components/learning/LessonPanel.tsx
frontend/src/components/learning/StepBar.tsx
frontend/src/components/learning/ViewerPlaceholder.tsx

frontend/src/types/molecule.ts
frontend/src/data/manual/
```

后续真正 3D 再放：

```text
frontend/src/components/three/MoleculeViewer.tsx
frontend/src/components/three/AtomMesh.tsx
frontend/src/components/three/BondMesh.tsx
frontend/src/components/three/AngleArc.tsx
frontend/src/components/three/LonePairMesh.tsx
frontend/src/components/three/NaClCell.tsx
```

---

## 三、化学内容需要人工复核

整体文案方向可以，但有几处要收敛，避免讲得太满。

### 1. CO₂ 的 π 键表述需要改

代码里写：

> “未参与杂化的两个 p 轨道与氧形成两个大 π 键。”

这句话对高中生可能过深，也容易引出争议。建议改成：

```text
碳原子采用 sp 杂化，两个 C=O 双键沿直线方向排列。每个双键中包含一个 σ 键和一个 π 键；高中阶段重点掌握其直线形和 180° 键角即可。
```

### 2. BF₃ 文案有小问题

代码中有：

> “平面大平面”

这个明显是生成错误。建议改成：

```text
平面三角形结构
```

另一个表述：

> “3 个 F 原子均分 360°”

可以改为：

```text
3 个 F 原子位于同一平面，相邻 B-F 键夹角约为 120°。
```

### 3. NaCl 这里最需要谨慎

代码里 `nacl` 的结构是一个中心 Na 周围 6 个 Cl，本质上更像是 **NaCl 的局部配位环境示意**，不是完整晶胞。代码自己也写了“简化的面心立方单元结构示意”。

但是页面标题叫“氯化钠晶胞”，这会误导学生。建议改成：

```text
NaCl 配位环境（简化）
```

或者如果你要叫“晶胞”，就必须后面让 Codex 真正做一个更规范的 NaCl 晶胞模型。

### 4. 部分语言偏营销

比如：

```text
帮助大家秒懂分子构型和晶胞规律
```

建议改得更教学化：

```text
帮助学生逐步理解分子构型、键角变化和晶胞空间关系。
```

这个网站要兼顾老师课堂展示，语气不能太像短视频标题。

---

## 四、我建议怎么处理这份代码

不要直接让 Codex “把这份代码塞进项目”。应该这样处理：

### 第一步：保存为草稿

把 Gemini 代码放到：

```text
docs/gemini-ui-draft.md
```

或者：

```text
docs/gemini-ui-draft.tsx
```

它只是参考，不是正式源码。

### 第二步：让 Codex 做“拆分接入”，不是照搬

给 Codex 的任务应是：

```text
保留 Gemini 草稿的视觉风格和页面布局；
不要照搬它的数据结构；
不要照搬它的 Canvas 伪 3D 作为正式 MoleculeViewer；
先接入 HomePage 和 LearningPage 静态 UI；
数据先用占位 mock；
真实 3D 后续用 React Three Fiber 重新实现。
```

### 第三步：把 3D 分两步走

不要现在同时做完整 3D。路线仍然是：

```text
1. 接入 Home / Learning 静态 UI
2. 再做 CH4 的 React Three Fiber 垂直切片
3. 再扩展 NH3 / H2O / CO2 / BF3
4. 最后做 NaCl
```

这和我们之前定的路线一致：先证明 “CH₄ + 步骤教学” 闭环，再扩展内容。

## 五、给这份 Gemini 代码的评分

| 维度      |   评分 | 判断                                        |
| ------- | ---: | ----------------------------------------- |
| 视觉方向    | 8/10 | 浅色、教育风、结构清楚，符合项目调性                        |
| 页面完整度   | 8/10 | Home 和 Learning 都有，交互也比较完整                |
| 工程结构    | 4/10 | 所有东西塞一个文件，不适合正式项目                         |
| 数据结构    | 4/10 | 和正式 schema 不一致                            |
| 3D 技术路线 | 3/10 | Canvas 伪 3D 只能做 demo，不是正式 Three.js/R3F 方案 |
| 化学文案    | 6/10 | 大方向可用，但 NaCl、CO₂、BF₃ 等需要复核                |
| 可接入价值   | 7/10 | 很适合做 UI 参考，不适合直接成为正式代码                    |

综合判断：

```text
可作为 UI 草稿：可以
可作为前端初版视觉参考：可以
可直接作为正式工程代码：不建议
可作为正式 3D Viewer：不建议
```

## 六、你下一步给 Codex 的 prompt

把 Gemini 代码保存到 `docs/gemini-ui-draft.tsx` 后，给 Codex 这段：

```text
请进入 plan 模式，先不要立即写代码。

目标：
根据 docs/gemini-ui-draft.tsx，把 Gemini 生成的前端 UI 草稿接入当前 Chem3D Learn 项目。

重要判断：
Gemini 草稿只能作为视觉和布局参考，不得作为正式工程结构照搬。

要求：
1. 遵守 AGENTS.md、PLANS.md、docs/DESIGN_SYSTEM.md、docs/UI_SPEC.md。
2. 保持 Vite + React + TypeScript + Tailwind CSS。
3. 不要引入 Next.js。
4. 不要创建后端。
5. 不要创建数据库。
6. 不要添加登录。
7. 不要添加 Gemini API。
8. 不要添加 Firebase。
9. 不要实现真实 3D。
10. 不要把 Gemini 的 Canvas 伪 3D 当作正式 MoleculeViewer。
11. 可以保留一个 ViewerPlaceholder 作为临时占位组件。
12. 不要把所有代码塞进 App.tsx。

请按以下结构拆分：
- src/pages/HomePage.tsx
- src/pages/LearningPage.tsx
- src/components/common/AppHeader.tsx
- src/components/home/ModuleCard.tsx
- src/components/learning/MoleculeSidebar.tsx
- src/components/learning/ViewerPlaceholder.tsx
- src/components/learning/LessonPanel.tsx
- src/components/learning/StepBar.tsx

数据要求：
1. 本轮不要创建完整正式分子数据。
2. 可以创建 src/data/mockMolecules.ts 作为 UI 占位数据。
3. 不要创建 src/data/manual/ch4.json 等正式数据文件。
4. 后续正式 MoleculeViewer 再按 docs/MOLECULE_DATA_SCHEMA.md 创建数据。

视觉要求：
1. 保留 Gemini 草稿的浅色教育风。
2. 保留主色 #2A9D8F、深主色 #1F6F68、强调色 #F4A261。
3. 删除或弱化过度营销化文案，例如“秒懂”。
4. 将“交互实验室”可改为“3D 学习页”或“3D 结构学习”。

化学内容要求：
1. 所有具体化学解释先保持简洁。
2. CO2 的 π 键表述不要写得过深。
3. NaCl 暂时称为“NaCl 配位环境（简化）”，不要称为完整晶胞。
4. 不确定内容标记 TODO-CHEM-VERIFY。

完成后运行：
cd frontend
npm run build

请先输出计划，列出：
- 将读取哪些文件
- 将创建哪些文件
- 将修改哪些文件
- 如何拆分 Gemini 草稿
- 风险点
- 验证命令

等我确认后再执行。
```

## 最终建议

这份 Gemini 代码**可以进入下一步**，但要按“UI 草稿”处理。
现在不要让 Codex 做 CH₄ 真 3D，先让它完成 **Gemini UI 拆分接入 + build 通过**。等页面骨架稳定后，再单独开一轮任务做正式 React Three Fiber 版 CH₄。

## Gemini 生成的 React 原型代码

```tsx
import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. 类型定义 (TypeScript Interfaces)
// ==========================================
interface Atom3D {
  symbol: string;
  color: string;
  size: number;
  x: number; // 原始 3D X 坐标
  y: number; // 原始 3D Y 坐标
  z: number; // 原始 3D Z 坐标
}

interface Bond3D {
  from: number;
  to: number;
}

interface LonePairCloud {
  x: number;
  y: number;
  z: number;
  color: string;
}

interface MoleculeData {
  id: string;
  name: string;
  formula: string;
  category: '分子构型' | '键角与孤电子对' | '有机立体结构' | '晶体结构';
  geometry: string;
  bondAngle: string;
  centralAtom: string;
  lonePairsCount: string;
  commonMistake: string;
  steps: { title: string; content: string }[];
  atoms: Atom3D[];
  bonds: Bond3D[];
  lonePairs?: LonePairCloud[];
}

// ==========================================
// 2. 核心分子数据集 (精简且完整，防止再次超时)
// ==========================================
const MOLECULES_DATA: Record<string, MoleculeData> = {
  ch4: {
    id: 'ch4',
    name: '甲烷',
    formula: 'CH₄',
    category: '分子构型',
    geometry: '正四面体形',
    bondAngle: '109.5°',
    centralAtom: 'C (sp³ 杂化)',
    lonePairsCount: '0 对',
    commonMistake: '容易误判为平面正方形。在三维空间中，4个 C-H 键排斥力最小的排布是正四面体。',
    steps: [
      { title: '空间对称性', content: '观察中心的碳原子(C)与周围4个氢原子(H)构成的对称结构。所有键长完全相等，夹角均为 109.5°。' },
      { title: '杂化轨道解释', content: '碳原子的 2s 和 3个 2p 轨道杂化形成 4 个等同的 sp³ 杂化轨道，指向正四面体顶点。' },
      { title: '课堂考点突破', content: '二氯甲烷(CH₂Cl₂)只有一种空间结构，这也强有力地证明了甲烷是正四面体，而非平面正方形。' }
    ],
    atoms: [
      { symbol: 'C', color: '#374151', size: 18, x: 0, y: 0, z: 0 },
      { symbol: 'H', color: '#94A3B8', size: 10, x: 0, y: 70, z: 0 },
      { symbol: 'H', color: '#94A3B8', size: 10, x: 66, y: -23, z: 0 },
      { symbol: 'H', color: '#94A3B8', size: 10, x: -33, y: -23, z: 57 },
      { symbol: 'H', color: '#94A3B8', size: 10, x: -33, y: -23, z: -57 }
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 }, { from: 0, to: 4 }]
  },
  nh3: {
    id: 'nh3',
    name: '氨气',
    formula: 'NH₃',
    category: '键角与孤电子对',
    geometry: '三角锥形',
    bondAngle: '107°',
    centralAtom: 'N (sp³ 杂化)',
    lonePairsCount: '1 对',
    commonMistake: '容易忽略顶部的孤电子对。分子空间构型只描述原子核排列，故为三角锥形，而不是正四面体。',
    steps: [
      { title: '孤电子对排斥', content: '中心氮原子(N)上拥有一对未成键的孤电子对（占据顶部云团），它的排斥力比成键电子对更强。' },
      { title: '键角收缩效应', content: '受孤电子对的向下挤压，3 个 N-H 键向内靠拢，使得 H-N-H 键角从 109.5° 压缩到了 107°。' },
      { title: '极性分析', content: '由于三角锥形结构不对称，正负电荷中心不重合，NH₃ 属于强极性分子，极易溶于水。' }
    ],
    atoms: [
      { symbol: 'N', color: '#2563EB', size: 18, x: 0, y: -15, z: 0 },
      { symbol: 'H', color: '#94A3B8', size: 10, x: 60, y: 25, z: 0 },
      { symbol: 'H', color: '#94A3B8', size: 10, x: -30, y: 25, z: 52 },
      { symbol: 'H', color: '#94A3B8', size: 10, x: -30, y: 25, z: -52 }
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 }],
    lonePairs: [{ x: 0, y: -65, z: 0, color: '#F4A261' }]
  },
  h2o: {
    id: 'h2o',
    name: '水',
    formula: 'H₂O',
    category: '键角与孤电子对',
    geometry: 'V形 (折线形)',
    bondAngle: '104.5°',
    centralAtom: 'O (sp³ 杂化)',
    lonePairsCount: '2 对',
    commonMistake: '容易误记为 180° 直线型。必须掌握其含有两对孤电子对，产生极强的向下排斥力。',
    steps: [
      { title: '两对孤电子对', content: '氧原子含有 2 对孤电子对。两对孤电子对之间的排斥力，以及它们对成键电子的排斥力都极强。' },
      { title: '键角进一步收缩', content: '相较于 NH₃ 的 1 对孤电子对，H₂O 有 2 对，排斥更加强烈，迫使 H-O-H 键角进一步缩减到 104.5°。' },
      { title: '化学常识延伸', content: '折线形结构使得水分子具有极强的极性。这也是水能形成氢键、具有反常高沸点的主要基础之一。' }
    ],
    atoms: [
      { symbol: 'O', color: '#DC2626', size: 18, x: 0, y: -15, z: 0 },
      { symbol: 'H', color: '#94A3B8', size: 10, x: -50, y: 35, z: 0 },
      { symbol: 'H', color: '#94A3B8', size: 10, x: 50, y: 35, z: 0 }
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }],
    lonePairs: [
      { x: -35, y: -55, z: -25, color: '#F4A261' },
      { x: 35, y: -55, z: 25, color: '#F4A261' }
    ]
  },
  co2: {
    id: 'co2',
    name: '二氧化碳',
    formula: 'CO₂',
    category: '分子构型',
    geometry: '直线形',
    bondAngle: '180°',
    centralAtom: 'C (sp 杂化)',
    lonePairsCount: '0 对 (中心原子)',
    commonMistake: '容易将 C=O 双键的 σ 键和 π 键混淆。需要注意中心碳原子无孤电子对，空间排斥呈 180°。',
    steps: [
      { title: '直线形分布', content: '碳原子位于正中心，与两边的氧原子以双键结合，键角为 180° 直线型，不具有孤电子对排斥。' },
      { title: 'sp 杂化轨道', content: '碳原子采取 sp 杂化，两个 sp 杂化轨道夹角为 180°。未参与杂化的两个 p 轨道与氧形成两个大 π 键。' },
      { title: '非极性判定', content: '虽然 C-O 键属于强极性键，但由于分子结构完全对称，偶极矩相互抵消，整个 CO₂ 是非极性分子。' }
    ],
    atoms: [
      { symbol: 'C', color: '#374151', size: 18, x: 0, y: 0, z: 0 },
      { symbol: 'O', color: '#DC2626', size: 18, x: -70, y: 0, z: 0 },
      { symbol: 'O', color: '#DC2626', size: 18, x: 70, y: 0, z: 0 }
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }]
  },
  bf3: {
    id: 'bf3',
    name: '三氟化硼',
    formula: 'BF₃',
    category: '分子构型',
    geometry: '平面三角形',
    bondAngle: '120°',
    centralAtom: 'B (sp² 杂化)',
    lonePairsCount: '0 对',
    commonMistake: '容易认为中心硼原子满足“八隅律”。事实上，硼是缺电子原子，价层只有 6 个电子。',
    steps: [
      { title: '平面大平面', content: 'B 处于中心，3 个 F 原子均分 360°，完美分布在一个平面上，夹角均为 120°。' },
      { title: 'sp² 杂化轨道', content: '硼原子采取 sp² 杂化，三个等同的杂化轨道在同一个平面内，互相排斥力达到最小。' },
      { title: '不饱和性与极性', content: '由于结构高度对称，BF₃ 是非极性分子。它作为路易斯酸，非常容易接纳其他分子的孤电子对。' }
    ],
    atoms: [
      { symbol: 'B', color: '#0D9488', size: 18, x: 0, y: 0, z: 0 },
      { symbol: 'F', color: '#10B981', size: 14, x: 0, y: -70, z: 0 },
      { symbol: 'F', color: '#10B981', size: 14, x: 60, y: 35, z: 0 },
      { symbol: 'F', color: '#10B981', size: 14, x: -60, y: 35, z: 0 }
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 }]
  },
  nacl: {
    id: 'nacl',
    name: '氯化钠晶胞',
    formula: 'NaCl (晶体)',
    category: '晶体结构',
    geometry: '面心立方点阵',
    bondAngle: '90°',
    centralAtom: 'Na⁺ / Cl⁻ 相互配位',
    lonePairsCount: '无意义',
    commonMistake: '经常分不清每个离子被多少个相反电性离子包围。请牢记配位数均为 6。',
    steps: [
      { title: '配位数 6 对 6', content: '在 NaCl 晶胞中，每个钠离子（绿小球）被 6 个氯离子（灰大球）包围；反之每个氯离子也被 6 个钠离子包围。' },
      { title: '晶胞组成计算', content: '利用均摊法计算：1 个晶胞内包含 4 个 Na⁺（12个棱心+1个体心）和 4 个 Cl⁻（8个顶点+6个面心）。' },
      { title: '物理性质联系', content: '离子晶体没有单个分子存在。其熔沸点高，硬度大，主要是因为强烈的离子键（库仑引力）所致。' }
    ],
    atoms: [
      // 简化的面心立方单元结构示意，用于良好地渲染展示
      { symbol: 'Na', color: '#0D9488', size: 14, x: 0, y: 0, z: 0 },
      { symbol: 'Cl', color: '#64748B', size: 18, x: 50, y: 0, z: 0 },
      { symbol: 'Cl', color: '#64748B', size: 18, x: -50, y: 0, z: 0 },
      { symbol: 'Cl', color: '#64748B', size: 18, x: 0, y: 50, z: 0 },
      { symbol: 'Cl', color: '#64748B', size: 18, x: 0, y: -50, z: 0 },
      { symbol: 'Cl', color: '#64748B', size: 18, x: 0, y: 0, z: 50 },
      { symbol: 'Cl', color: '#64748B', size: 18, x: 0, y: 0, z: -50 }
    ],
    bonds: [
      { from: 0, to: 1 }, { from: 0, to: 2 },
      { from: 0, to: 3 }, { from: 0, to: 4 },
      { from: 0, to: 5 }, { from: 0, to: 6 }
    ]
  }
};

// ==========================================
// 3. 主应用组件 (App Entry)
// ==========================================
export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'learning'>('home');
  const [selectedMoleculeId, setSelectedMoleculeId] = useState<string>('ch4');

  // 辅助跳转到学习页
  const handleStartLearn = (moleculeId?: string) => {
    if (moleculeId) {
      setSelectedMoleculeId(moleculeId);
    }
    setCurrentPage('learning');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF9] text-[#1F2933] font-sans">
      {/* 顶部统一导航 */}
      <AppHeader currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* 页面路由分支 */}
      {currentPage === 'home' ? (
        <HomePage onStartLearn={handleStartLearn} />
      ) : (
        <LearningPage selectedId={selectedMoleculeId} setSelectedId={setSelectedMoleculeId} />
      )}
    </div>
  );
}

// ==========================================
// 4. 共享头部组件 (AppHeader)
// ==========================================
interface AppHeaderProps {
  currentPage: 'home' | 'learning';
  setCurrentPage: (page: 'home' | 'learning') => void;
}

function AppHeader({ currentPage, setCurrentPage }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#DDE7E4] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
          {/* Logo 图标 */}
          <div className="w-9 h-9 rounded-lg bg-[#2A9D8F] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            C3D
          </div>
          <div>
            <span className="font-bold text-lg tracking-wide text-[#1F6F68]">结构化学 3D 学习站</span>
            <span className="text-xs text-[#64748B] ml-2 block sm:inline">Chem3D Learn</span>
          </div>
        </div>
        <nav className="flex space-x-1 sm:space-x-4">
          <button
            onClick={() => setCurrentPage('home')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPage === 'home'
                ? 'bg-[#2A9D8F]/10 text-[#1F6F68]'
                : 'text-[#64748B] hover:text-[#1F2933] hover:bg-gray-100'
            }`}
          >
            首页
          </button>
          <button
            onClick={() => setCurrentPage('learning')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPage === 'learning'
                ? 'bg-[#2A9D8F]/10 text-[#1F6F68]'
                : 'text-[#64748B] hover:text-[#1F2933] hover:bg-gray-100'
            }`}
          >
            交互实验室
          </button>
        </nav>
      </div>
    </header>
  );
}

// ==========================================
// 5. 首页页面组件 (HomePage)
// ==========================================
interface HomePageProps {
  onStartLearn: (id?: string) => void;
}

function HomePage({ onStartLearn }: HomePageProps) {
  return (
    <main className="flex-grow">
      {/* Hero 区域 */}
      <section className="bg-gradient-to-b from-white to-[#F7FAF9] py-16 px-4 text-center border-b border-[#DDE7E4]">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#2A9D8F]/10 text-[#1F6F68] mb-4">
            面向高中化学学习与课堂教学展示
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1F2933] tracking-tight mb-6 leading-tight">
            把结构化学变成可以旋转的 <span className="text-[#2A9D8F]">3D 世界</span>
          </h1>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto mb-10 leading-relaxed">
            专为中国高中普通学生打造，告别枯燥的平面公式。通过流畅的 3D 交互、详尽的排斥原理解析和经典高考易错点，帮助大家秒懂分子构型和晶胞规律。
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => onStartLearn()}
              className="w-full sm:w-auto px-8 py-4 bg-[#2A9D8F] hover:bg-[#1F6F68] text-white font-semibold rounded-lg shadow-md transition-colors text-base"
            >
              进入 3D 实验室
            </button>
            <a
              href="#core-models"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-[#DDE7E4] text-[#1F2933] hover:bg-gray-50 font-semibold rounded-lg shadow-sm transition-colors text-base text-center"
            >
              查看核心模型
            </a>
          </div>
        </div>
      </section>

      {/* 四个模块卡片展示 */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[#1F2933] text-center mb-10">核心教学体系</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModuleCard
            title="1. 分子构型"
            desc="从直观角度观察直线形、正四面体等经典对称形式，理解其杂化轨道的空间延伸。"
            icon="📐"
          />
          <ModuleCard
            title="2. 键角与孤电子对"
            desc="通过对比 H₂O、NH₃ 的键角挤压，理解孤电子对云团在空间产生的超强静电排斥力。"
            icon="⚡"
          />
          <ModuleCard
            title="3. 有机立体结构"
            desc="直观感悟手性碳原子、饱和碳原子的四面体节点、双键平面性及三键的直线特性。"
            icon="🧬"
          />
          <ModuleCard
            title="4. 晶体结构"
            desc="完美还原 NaCl 晶胞的空间分布，告别平面死记，看清晶胞“配位数 6”的空间联系。"
            icon="💎"
          />
        </div>
      </section>

      {/* 核心示例模型区 */}
      <section id="core-models" className="py-16 bg-white border-t border-[#DDE7E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#1F2933]">首批收录经典模型</h2>
            <p className="text-[#64748B] mt-2">点击直接在 3D 空间下研究它</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Object.values(MOLECULES_DATA).map((mol) => (
              <div
                key={mol.id}
                onClick={() => onStartLearn(mol.id)}
                className="group border border-[#DDE7E4] rounded-xl p-6 text-center cursor-pointer bg-[#F7FAF9] hover:bg-white hover:border-[#2A9D8F] hover:shadow-md transition-all flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-white group-hover:bg-[#2A9D8F]/10 flex items-center justify-center text-[#2A9D8F] text-xl font-bold mb-3 shadow-inner transition-colors">
                  {mol.formula}
                </div>
                <h3 className="font-bold text-base text-[#1F2933] group-hover:text-[#2A9D8F] transition-colors">{mol.name}</h3>
                <p className="text-xs text-[#64748B] mt-1">{mol.geometry}</p>
                <span className="mt-4 px-2 py-0.5 rounded text-[10px] bg-[#DDE7E4] text-[#1F2933] font-medium group-hover:bg-[#2A9D8F] group-hover:text-white transition-colors">
                  去学习 →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 简短项目说明区 */}
      <section className="py-12 bg-[#F7FAF9] border-t border-[#DDE7E4] text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="font-bold text-lg text-[#1F6F68] mb-2">💡 关于项目</h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            本项目专注于帮助高中生摆脱在“结构化学”学习中遭遇的空间感瓶颈。不提供刷不完的套卷题，而是力争通过高交互性的 3D 视觉展示，将每一个键角、每一个电子对、每一种杂化讲解透彻，为中学课堂与日常自主预习提供最纯粹、直观的辅助。
          </p>
        </div>
      </section>
    </main>
  );
}

interface ModuleCardProps {
  title: string;
  desc: string;
  icon: string;
}

function ModuleCard({ title, desc, icon }: ModuleCardProps) {
  return (
    <div className="bg-white border border-[#DDE7E4] rounded-xl p-6 shadow-sm hover:shadow-md hover:border-[#2A9D8F]/40 transition-all flex flex-col justify-between h-full">
      <div>
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-[#1F2933] mb-2">{title}</h3>
        <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ==========================================
// 6. 核心学习交互页 (LearningPage)
// ==========================================
interface LearningPageProps {
  selectedId: string;
  setSelectedId: (id: string) => void;
}

function LearningPage({ selectedId, setSelectedId }: LearningPageProps) {
  const currentMolecule = MOLECULES_DATA[selectedId] || MOLECULES_DATA.ch4;
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // 控制面板设置
  const [showAngles, setShowAngles] = useState<boolean>(true);
  const [showLonePairs, setShowLonePairs] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // 每次切换分子，步骤重置为第 0 步
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [selectedId]);

  return (
    <main className="flex-grow flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      {/* 1. 左侧侧边栏 Sidebar */}
      <MoleculeSidebar selectedId={selectedId} onSelect={setSelectedId} />

      {/* 2. 中间大区域 (3D Viewer + 底部步骤条) */}
      <div className="flex-grow flex flex-col bg-slate-50 border-r border-[#DDE7E4] relative overflow-hidden">
        {/* 顶部控制栏 */}
        <div className="bg-white border-b border-[#DDE7E4] py-3 px-6 flex flex-wrap gap-4 items-center justify-between text-sm z-10">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#1F2933]">{currentMolecule.name}</span>
            <span className="text-xs bg-[#2A9D8F]/10 text-[#1F6F68] px-2 py-0.5 rounded-full font-semibold">
              {currentMolecule.formula}
            </span>
          </div>

          {/* 选项操控 */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-medium text-[#1F2933]">
              <input
                type="checkbox"
                checked={showAngles}
                onChange={(e) => setShowAngles(e.target.checked)}
                className="rounded border-[#DDE7E4] text-[#2A9D8F] focus:ring-[#2A9D8F]"
              />
              <span>显示键角</span>
            </label>

            {currentMolecule.lonePairs && (
              <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-medium text-[#1F2933]">
                <input
                  type="checkbox"
                  checked={showLonePairs}
                  onChange={(e) => setShowLonePairs(e.target.checked)}
                  className="rounded border-[#DDE7E4] text-[#2A9D8F] focus:ring-[#2A9D8F]"
                />
                <span>显示孤电子对云团</span>
              </label>
            )}

            <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-medium text-[#1F2933]">
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="rounded border-[#DDE7E4] text-[#2A9D8F] focus:ring-[#2A9D8F]"
              />
              <span>自动旋转</span>
            </label>
          </div>
        </div>

        {/* 3D 渲染区域 */}
        <div className="flex-grow relative">
          <ViewerPlaceholder
            molecule={currentMolecule}
            showAngles={showAngles}
            showLonePairs={showLonePairs}
            autoRotate={autoRotate}
          />
        </div>

        {/* 底部步骤条 */}
        <StepBar
          steps={currentMolecule.steps}
          currentIndex={currentStepIndex}
          onStepChange={setCurrentStepIndex}
        />
      </div>

      {/* 3. 右侧教学面板 LessonPanel */}
      <LessonPanel
        molecule={currentMolecule}
        currentStepIndex={currentStepIndex}
        steps={currentMolecule.steps}
      />
    </main>
  );
}

// ==========================================
// 7. 左侧目录组件 (MoleculeSidebar)
// ==========================================
interface MoleculeSidebarProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

function MoleculeSidebar({ selectedId, onSelect }: MoleculeSidebarProps) {
  return (
    <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#DDE7E4] flex flex-col flex-shrink-0 h-48 md:h-auto overflow-y-auto">
      <div className="p-4 bg-[#F7FAF9] border-b border-[#DDE7E4] font-semibold text-sm text-[#1F6F68] flex items-center justify-between">
        <span>📍 经典教学案例</span>
        <span className="text-[10px] bg-[#DDE7E4] px-1.5 py-0.5 rounded">6个模型</span>
      </div>
      <div className="p-2 space-y-1">
        {Object.values(MOLECULES_DATA).map((mol) => {
          const isSelected = mol.id === selectedId;
          return (
            <button
              key={mol.id}
              onClick={() => onSelect(mol.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all text-sm ${
                isSelected
                  ? 'bg-[#2A9D8F] text-white shadow-sm font-medium'
                  : 'hover:bg-gray-100 text-[#1F2933]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20' : 'bg-slate-200 text-[#1F2933]'}`}>
                  {mol.formula}
                </span>
                <span>{mol.name}</span>
              </div>
              <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-[#64748B]'}`}>
                {mol.geometry}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 8. 实时拖拽 Faux-3D 渲染器 (ViewerPlaceholder)
// ==========================================
interface ViewerPlaceholderProps {
  molecule: MoleculeData;
  showAngles: boolean;
  showLonePairs: boolean;
  autoRotate: boolean;
}

function ViewerPlaceholder({ molecule, showAngles, showLonePairs, autoRotate }: ViewerPlaceholderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 视角旋转角度 (Pitch & Yaw)
  const [pitch, setPitch] = useState<number>(0.2); // X 轴旋转角度
  const [yaw, setYaw] = useState<number>(0.3); // Y 轴旋转角度
  const isDragging = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 1. 自动旋转逻辑
  useEffect(() => {
    if (!autoRotate) return;
    let animId: number;
    const tick = () => {
      setYaw((prev) => (prev + 0.012) % (Math.PI * 2));
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [autoRotate]);

  // 2. 鼠标拖拽控制
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    setYaw((prev) => prev + deltaX * 0.007);
    setPitch((prev) => Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, prev + deltaY * 0.007)));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const resetView = () => {
    setPitch(0.2);
    setYaw(0.3);
  };

  // 3. 3D 渲染画布绘制
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空背景并设为浅绿色网格
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制微弱背景网格以增强 3D 深度感
    ctx.strokeStyle = '#EAF0EE';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 计算三维旋转公式
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);

    const transform3D = (x: number, y: number, z: number) => {
      // 围绕 Y 轴旋转 (Yaw)
      let x1 = x * cosY - z * sinY;
      let z1 = x * sinY + z * cosY;

      // 围绕 X 轴旋转 (Pitch)
      let y2 = y * cosP - z1 * sinP;
      let z2 = y * sinP + z1 * cosP;

      // 视点透视投影 (简易 Z 轴缩放)
      const scale = 250 / (250 + z2);
      return {
        screenX: centerX + x1 * scale,
        screenY: centerY + y2 * scale,
        depth: z2 // 用作 Z-buffer 深度排序
      };
    };

    // 转换所有的原子节点
    const transformedAtoms = molecule.atoms.map((atom, index) => ({
      ...atom,
      ...transform3D(atom.x, atom.y, atom.z),
      type: 'atom',
      originalIndex: index
    }));

    // 转换所有的孤电子对
    const transformedLonePairs = (showLonePairs && molecule.lonePairs
      ? molecule.lonePairs.map((lp, index) => ({
          ...lp,
          ...transform3D(lp.x, lp.y, lp.z),
          type: 'lonepair',
          originalIndex: index
        }))
      : []) as any[];

    // 深度排序 (Z-buffer)，确保近处的物体遮挡远处的物体
    const renderList = [
      ...transformedAtoms,
      ...transformedLonePairs
    ].sort((a, b) => b.depth - a.depth);

    // 绘制化学键 (在原子后渲染或分段深度渲染，这里做简化经典双向连线)
    ctx.lineWidth = 4;
    molecule.bonds.forEach((bond) => {
      const atomA = transformedAtoms[bond.from];
      const atomB = transformedAtoms[bond.to];
      if (!atomA || !atomB) return;

      // 渐变键设计
      const grad = ctx.createLinearGradient(atomA.screenX, atomA.screenY, atomB.screenX, atomB.screenY);
      grad.addColorStop(0, '#CBD5E1');
      grad.addColorStop(1, '#94A3B8');

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(atomA.screenX, atomA.screenY);
      ctx.lineTo(atomB.screenX, atomB.screenY);
      ctx.stroke();
    });

    // 绘制键角标线和标注
    if (showAngles && transformedAtoms.length >= 3) {
      // 在中心原子与成键原子间绘制虚线弧度
      const center = transformedAtoms[0];
      const h1 = transformedAtoms[1];
      const h2 = transformedAtoms[2];

      if (center && h1 && h2) {
        ctx.strokeStyle = '#F4A261';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(h1.screenX, h1.screenY);
        ctx.quadraticCurveTo(center.screenX, center.screenY, h2.screenX, h2.screenY);
        ctx.stroke();

        ctx.setLineDash([]); // 还原实线

        // 在弧度附近绘字
        ctx.fillStyle = '#1F6F68';
        ctx.font = 'bold 11px sans-serif';
        const labelX = (h1.screenX + h2.screenX) / 2 + (center.screenX - (h1.screenX + h2.screenX) / 2) * 0.2;
        const labelY = (h1.screenY + h2.screenY) / 2 + (center.screenY - (h1.screenY + h2.screenY) / 2) * 0.2;
        ctx.fillText(molecule.bondAngle, labelX - 10, labelY);
      }
    }

    // 渲染深度排序后的对象 (原子 & 孤电子对云团)
    renderList.forEach((item) => {
      if (item.type === 'atom') {
        // 绘制原子球体
        const r = item.size * (250 / (250 + item.depth));

        // 渐变高光效果，立体感十足
        const radGrad = ctx.createRadialGradient(
          item.screenX - r * 0.3,
          item.screenY - r * 0.3,
          r * 0.1,
          item.screenX,
          item.screenY,
          r
        );
        radGrad.addColorStop(0, '#FFFFFF');
        radGrad.addColorStop(0.4, item.color);
        radGrad.addColorStop(1, '#000000');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(item.screenX, item.screenY, r, 0, Math.PI * 2);
        ctx.fill();

        // 绘制元素符号
        ctx.fillStyle = item.color === '#E2E8F0' || item.color === '#94A3B8' ? '#1F2933' : '#FFFFFF';
        ctx.font = `bold ${Math.max(10, r * 0.8)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.symbol, item.screenX, item.screenY);
      } else if (item.type === 'lonepair') {
        // 渲染孤电子对：高透明的椭圆形发光云团
        const r = 24 * (250 / (250 + item.depth));
        ctx.fillStyle = 'rgba(244, 162, 97, 0.22)';
        ctx.strokeStyle = 'rgba(244, 162, 97, 0.5)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(item.screenX, item.screenY, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制电子云中心符号
        ctx.fillStyle = '#E76F51';
        ctx.font = '10px monospace';
        ctx.fillText('e⁻', item.screenX - 4, item.screenY - 3);
        ctx.fillText('e⁻', item.screenX + 4, item.screenY + 3);
      }
    });
  }, [molecule, yaw, pitch, showAngles, showLonePairs]);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing flex flex-col justify-between p-4">
      {/* 操作提示 */}
      <div className="absolute top-2 left-4 text-[11px] text-[#64748B] bg-white/70 backdrop-blur px-2.5 py-1 rounded-md border border-[#DDE7E4]">
        🖱️ 拖拽鼠标旋转分子 | 滚动滑轮（此处为模拟）
      </div>

      <canvas
        ref={canvasRef}
        width={500}
        height={400}
        className="w-full h-full block bg-transparent"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      />

      {/* 控制工具条 */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button
          onClick={resetView}
          className="px-3 py-1.5 bg-white border border-[#DDE7E4] hover:bg-slate-50 text-[#1F2933] text-xs font-semibold rounded-md shadow-sm transition-colors"
        >
          🔄 重置视角
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 9. 右侧讲解卡片 (LessonPanel)
// ==========================================
interface LessonPanelProps {
  molecule: MoleculeData;
  currentStepIndex: number;
  steps: { title: string; content: string }[];
}

function LessonPanel({ molecule, currentStepIndex, steps }: LessonPanelProps) {
  const currentStep = steps[currentStepIndex] || { title: '暂无说明', content: '暂无详细步骤。' };

  return (
    <div className="w-full md:w-80 bg-white border-t md:border-t-0 border-[#DDE7E4] flex flex-col flex-shrink-0 h-64 md:h-auto overflow-y-auto">
      <div className="p-4 bg-[#F7FAF9] border-b border-[#DDE7E4] font-semibold text-sm text-[#1F6F68]">
        📖 结构数据解析
      </div>
      <div className="p-4 space-y-4">
        {/* 数据面板 */}
        <div className="bg-[#F7FAF9] rounded-lg p-3.5 border border-[#DDE7E4] text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-[#64748B]">分子名称:</span>
            <span className="font-bold text-[#1F2933]">{molecule.name} ({molecule.formula})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">分子构型:</span>
            <span className="font-semibold text-[#2A9D8F]">{molecule.geometry}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">关键键角:</span>
            <span className="font-mono text-[#F4A261] font-semibold">{molecule.bondAngle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">中心原子:</span>
            <span className="font-medium">{molecule.centralAtom}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">孤电子对:</span>
            <span className="font-medium text-amber-600">{molecule.lonePairsCount}</span>
          </div>
        </div>

        {/* 考试易错提醒 */}
        <div className="bg-amber-50 rounded-lg p-3.5 border border-amber-200 text-xs">
          <h4 className="font-bold text-amber-800 mb-1 flex items-center gap-1">
            ⚠️ 高考易错点拨
          </h4>
          <p className="text-amber-900 leading-relaxed text-[11px]">{molecule.commonMistake}</p>
        </div>

        {/* 当前步骤详解 */}
        <div className="border-t border-dashed border-[#DDE7E4] pt-4">
          <div className="flex items-center space-x-1.5 mb-2">
            <span className="w-5 h-5 rounded-full bg-[#2A9D8F] text-white flex items-center justify-center font-bold text-xs">
              {currentStepIndex + 1}
            </span>
            <h4 className="font-bold text-sm text-[#1F2933]">{currentStep.title}</h4>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed bg-[#F7FAF9] p-3 rounded border border-gray-100">
            {currentStep.content}
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. 底部步骤导航条 (StepBar)
// ==========================================
interface StepBarProps {
  steps: { title: string; content: string }[];
  currentIndex: number;
  onStepChange: (index: number) => void;
}

function StepBar({ steps, currentIndex, onStepChange }: StepBarProps) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < steps.length - 1;

  return (
    <div className="bg-white border-t border-[#DDE7E4] p-3 px-6 flex items-center justify-between">
      {/* 上一步 */}
      <button
        disabled={!hasPrev}
        onClick={() => onStepChange(currentIndex - 1)}
        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
          hasPrev
            ? 'bg-[#2A9D8F]/10 hover:bg-[#2A9D8F]/20 text-[#1F6F68]'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
      >
        ← 上一步
      </button>

      {/* 步骤条圆点指示器 */}
      <div className="flex items-center space-x-2">
        {steps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => onStepChange(idx)}
            title={step.title}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === currentIndex
                ? 'bg-[#2A9D8F] w-6'
                : 'bg-slate-300 hover:bg-[#2A9D8F]/50'
            }`}
          />
        ))}
      </div>

      {/* 下一步 */}
      <button
        disabled={!hasNext}
        onClick={() => onStepChange(currentIndex + 1)}
        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
          hasNext
            ? 'bg-[#2A9D8F] hover:bg-[#1F6F68] text-white'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
      >
        下一步 →
      </button>
    </div>
  );
}
```
