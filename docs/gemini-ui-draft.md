# Chem3D Learn - UI/UX 与高级动效重新设计方案

> 说明：本文档是历史 UI 草稿参考，不再作为当前范围约束来源。当前以前端现有实现为准；如草稿内容与现有 Home、Modules、Module Detail、Paths、Exam、About 页面结构冲突，优先遵循现有前端与最新项目文档。

## 一、当前 UI 问题诊断

1. **首页缺乏第一眼吸引力和学科氛围**：作为 3D 可视化工具，当前首页像是一份“说明书”，缺乏立体几何和化学微观世界的空间氛围感，无法在第一秒抓住学生和教师的眼球。
2. **交互生硬，缺乏呼吸感**：现有的页面切换和卡片 hover 过于基础，缺少类似 Apple/Vercel 那种具有反馈感、阻尼感和丝滑过渡的现代产品体验。
3. **缺少空间感与层次**：元素大多扁平堆叠在背景上，没有利用现代 CSS 的毛玻璃（backdrop-blur）、阴影层次和微动效来区分信息的优先级。
4. **3D Viewer 与 UI 的融合度不足**：控制面板（例如显示孤电子对、自动旋转）过于像开发者调试面板，而非浑然一体的教学操作面板。
5. **滚动体验扁平**：主页的内容向下滚动时缺乏叙事感，没有随着视差或渐进呈现（Scroll Reveal）来引导用户的阅读节奏。

## 二、新版产品设计目标

- **设计气质**：现代教育产品、轻科技感、清晰理性、低干扰。
- **化学学科感**：通过极简的化学元素（如水分子、苯环）作为微小的装饰，强化身份认同，但不喧宾夺主。
- **空间感与丝滑**：借鉴 Vercel 的干净卡片和 Arc Browser 的柔和交互，运用克制的过渡（Fade/Translate/Blur）、带有延迟的跟移动效，打造高级感。
- **绝对克制**：**拒绝**游戏粒子爆发、强霓虹发光、赛博朋克深色模式，一切动效以“不妨碍长时间学习”和“适合课堂投影展示”为最高准则。

## 三、新版页面结构设计

### 1. 顶部导航栏
- **布局**：高度 64px，吸顶，透明背景 + 滚动时变为毛玻璃 (`backdrop-blur-md`)。
- **左侧**：Logo + Chem3D Learn（文字带有极淡的金属/玻璃光泽感）。
- **中间**：学习模块 / 模型库 / 知识库 的轻量导航（Hover 时有柔和的背景色滑块跟随）。
- **右侧**：GitHub 图标 / 开始学习按钮。

### 2. 主页结构 (叙事式滚动)
- **Hero 首屏**：核心 Value Proposition 大标题，辅以缓动的化学氛围背景。包含一个半露出的 3D 预览卡片（悬浮感）。CTA 按钮带有微光扫过效果。
- **痛点与解决方案区**：“看不懂空间结构？” -> 左右分栏或交替布局，随滚动依次 Fade-up 显示。
- **核心模型矩阵区**：3x2 的网格，展示 CH4/NH3 等，Hover 时卡片轻微上浮，边框呈现主色渐变。
- **教学场景说明区**：分别为“教师课堂投影”和“学生自学”设计的两个大功能块。
- **底部 CTA 与 Footer**：干净利落的引导转化。

### 3. 学习页结构 (2.5 栏布局)
- **左侧 (Molecule Sidebar, 280px)**：按知识体系（基础 VSEPR、含孤电子对）分类的分子列表。
- **中间 (3D Viewer, 1fr)**：极致放大。背景采用微弱的径向渐变，制造无垠空间的镜头感。
- **右侧 (Lesson Panel, 360px)**：收纳所有文字解释。分为：基础信息（标签化）、教学正文、观察提示、易错点 Callout（警示色背景）。

### 4. 3D 区域控制 (Floating Toolbar)
- 所有控制操作（自动旋转、显隐孤电子对/键角/标记）全部整合为一个底部居中的 **悬浮胶囊工具栏**。
- 背景毛玻璃，按钮小巧精致，确保绝不遮挡模型核心区域。

---

## 四、视觉风格方案

1. **设计关键词**：清洁、柔和、理性、空间深度。
2. **色彩方案 (优先浅色模式)**：
   - **主色 (Primary)**：`#0F766E` (Teal-700) —— 理性、科学的深青色。
   - **辅助色/高亮 (Primary Light)**：`#CCFBF1` (Teal-50) —— 极淡的青色背景。
   - **背景色 (Background)**：`#FAFAFA` (Neutral-50) 到 `#FFFFFF`。
   - **卡片色 (Surface)**：`#FFFFFF` (带 `0 4px 20px rgba(0,0,0,0.03)` 阴影)。
   - **强调色 (Accent)**：`#F59E0B` (Amber-500) —— 孤电子对等特异性高亮。
   - **成功/警示色**：`#10B981` (Emerald-500) / `#EF4444` (Red-500)。
   - **文字色**：主文本 `#111827`，次级 `#6B7280`。
   - **3D 背景**：中心 `#FFFFFF` 向四周辐射渐变至 `#F3F4F6`。

3. **字体与排版**：
   - **中文字体**：PingFang SC / 思源黑体。英文字体：Inter / Roboto。
   - **圆角**：卡片大圆角 `24px` (`rounded-3xl`)，内部组件中圆角 `12px` (`rounded-xl`)。
   - **留白**：极度宽裕（`gap-6`, `gap-8`, `p-6`），减少压迫感。

---

## 五、动效系统 (Motion System)

### 1. 主页滚动动效
- **Hero 首屏入场**：
  - 标题、副标题、按钮使用 Stagger (错开 100ms) 的 Fade-up。
  - 属性：`duration: 600ms`, `translateY: 24px -> 0`, `easing: cubic-bezier(0.16, 1, 0.3, 1)`。
- **Section 滚动进入 (Scroll Reveal)**：
  - 监听 IntersectionObserver。当进入视口 15% 时触发。
  - 标题先现，内容卡片群采用 `stagger: 150ms` 依次出现。
  - 带轻微的 blur 效果 (`blur-sm` -> `blur-none`)，位移控制在 `24px`，杜绝大幅度飞入。

### 2. 主页背景水分子氛围动画
**定位**：安静、极低存在感的化学氛围点缀。
- **视觉**：极简 SVG 线稿（O-H-H，键角 ~104.5°），不带复杂球棍立体感。
- **参数**：
  - **同屏数量**：桌面端 6-10 个，移动端 0-3 个。
  - **透明度**：极低（最大 `opacity: 0.04` 到 `0.08`）。
  - **动画表现**：随机在背景生成，`fade-in` (2s) -> 缓慢向上/侧向漂浮 (`translateY: -50px` 持续 15s) 伴随极缓慢自转 (`rotate: -15deg 到 15deg`) -> `fade-out` (2s)。
  - **层级**：`z-index: -1`，绝不能遮挡文字。

### 3. 鼠标凯库勒式苯环跟随效果
**定位**：打破常规圆点指针，注入学科灵魂，但保持克制。
- **视觉**：极简正六边形，内部包含交替双键线条的 SVG 轮廓。颜色采用极淡的主色 `#0F766E`，基础透明度 `0.2` 到 `0.3`。
- **跟随逻辑**：
  - 使用 `requestAnimationFrame` 计算弹性差值（Lerp 平滑跟随），带有约 100ms-150ms 的视觉迟滞（Spring 物理感）。
  - **偏移**：中心点偏离真实鼠标指针右下方约 `16px`，确保**不遮挡点击热区**，并保留系统原生指针。
- **交互变化**：
  - Hover 到可点击区域（Button/Card）时：透明度升至 `0.6`，缩放至 `1.2`，带有极短的缓动放大动画。
  - **禁用区域**：当鼠标进入 3D Viewer 画布 (`canvas`) 内时，苯环 `opacity` 变为 `0`，绝对禁止干扰模型拖拽。
- **性能与实现**：
  - 不要触发 React state 渲染，直接通过 `ref.current.style.transform` 逐帧更新。`pointer-events: none` 穿透点击。

### 4. 学习页交互动画
- **左侧列表**：Hover 时背景变浅色，不发生位移。选中时左侧出现主色指示条或产生平滑的主色描边过渡。
- **按钮**：点击时有物理按压反馈 `active:scale-95`，持续 150ms。
- **骨架屏 (Skeleton)**：3D 模型加载时，占位符呈现优雅的呼吸渐变（shimmer 扫光效果）。

---

## 六、响应式、性能与降级建议

1. **响应式设计**：
   - 移动端：主页水分子减少或关闭。鼠标苯环跟随**强制关闭**。学习页改为上下布局（3D 视图置顶固定高度，下方列表与知识卡片）。
2. **性能风险规避**：
   - 水分子动画使用 CSS `keyframes` 配合 `transform` 和 `opacity` 实现 GPU 加速，不用 JS 定时器更新。
   - 苯环跟随动画通过 `useRef` + rAF 改变 DOM style，避免 React 树的 Reconciliation 开销。
3. **Reduced Motion 降级 (无障碍)**：
   - 监听 `window.matchMedia('(prefers-reduced-motion: reduce)')`。
   - 若开启：完全关闭水分子背景；完全关闭苯环跟随；关闭所有的 Scroll Reveal 渐隐上浮，仅保留极其快速的 opacity fade。

---

## 七、分阶段开发计划

1. **阶段 1：基础脚手架与动效基建**
   - 补充 Tailwind 动画配置、编写全局 `motion.css`。
   - 新增基建 Hooks：`useReducedMotion`，`usePointerFollower`，`useIntersectionObserver`。
   - 创建原子级组件：`MotionButton`，`ScrollReveal`。
2. **阶段 2：化学学科氛围特效**
   - 实现 `MoleculeBackground`（SVG 水分子 CSS 动画）。
   - 实现 `CursorBenzeneFollower`（rAF 跟随逻辑与 3D 区域隐藏判断）。
3. **阶段 3：首页重构**
   - 实现包含上下滚动 Reveal 的新版首屏与模块卡片。
4. **阶段 4：学习页重构**
   - 实现 2.5 栏布局。封装 `FloatingToolbar` 悬浮栏。改造 `LessonPanel` 的知识点卡片化。
5. **阶段 5：联调与验收**
   - 检查 3D 旋转是否受影响。验证构建产物。

---

## 八、Codex 开发实施提示词 (Prompt for Codex)

> **目标**：请根据 `docs/gemini-ui-draft.md` 中定义的“UI/UX 与高级动效重新设计方案”，对 Chem3D Learn 进行前端重构。
> 
> **项目背景与技术限制**：
> - 这是一个 Vite + React + TS + Tailwind + Three.js 的纯前端项目。
> - **绝对禁止**修改 `MoleculeViewer` 中核心的 Three.js / R3F 渲染、旋转、孤电子对绘制逻辑。
> - 不要修改分子数据 JSON 结构。
> - 不要引入大型动画库（如 GSAP、Framer Motion），必须使用纯 CSS transition/keyframes 或原生的 `requestAnimationFrame` 结合 `useRef` 以保证性能。
> 
> **阶段 1：新增 Hooks 与组件**
> 1. 新增 `src/hooks/useReducedMotion.ts`：用于检测系统减弱动画设置。
> 2. 新增 `src/hooks/usePointerFollower.ts`：使用 rAF 封装平滑跟随逻辑。
> 3. 新增 `src/hooks/useIntersectionObserver.ts`：用于触发滚动进入动画。
> 4. 新增 `src/components/motion/ScrollReveal.tsx`：包裹子元素，实现向下滚动时的 staggered fade-up 动画。
> 5. 新增 `src/components/motion/CursorBenzeneFollower.tsx`：实现凯库勒式苯环 SVG 的鼠标跟随，务必采用 `pointer-events-none`，且在检测到父级或自身包含某个 class（如 3d-viewer-area）时 `opacity: 0`。
> 6. 新增 `src/components/motion/MoleculeBackground.tsx`：使用绝对定位在首页底层铺垫少量透明度 0.05 的极简 H2O 线稿 SVG，纯 CSS 缓慢漂浮。
> 
> **阶段 2：样式与主页重构**
> 1. 更新 `tailwind.config.ts` 和 `src/styles/index.css`，引入 `motion-fade-up`，`motion-scale-in` 等关键帧，并定义主色 `#0F766E`。
> 2. 改造 `HomePage.tsx`：引入 `MoleculeBackground`。将各个 Section 用 `ScrollReveal` 包裹。提升排版空间感，运用大圆角（rounded-3xl）和毛玻璃背景。
> 3. 改造 `AppHeader.tsx`：应用吸顶的 `backdrop-blur-md` 和极简风格。
> 
> **阶段 3：学习页重构**
> 1. 改造当前模块详情学习界面布局为 2.5 栏（280px Sidebar + 1fr 3D Viewer + 360px Panel）。
> 2. 新增 `src/components/learning/FloatingToolbar.tsx`：从普通面板中剥离 3D 控制按钮，放在 3D 画布正下方的悬浮毛玻璃胶囊中。
> 3. 重排 `LessonPanel.tsx`，使用图标（Lucide）和浅底色卡片（Callout）区分不同性质的文字（提示、易错点等）。
> 
> **性能与降级要求**：
> - `CursorBenzeneFollower`：移动端、或检测到 `useReducedMotion` 为 true 时，不渲染或静止。禁止在 rAF 中调用 `setState`，必须直接修改 DOM `style.transform`。
> - 确保所有 z-index 设置正确，悬浮特效绝不能挡住按钮点击或 3D 模型的拖拽旋转。
> 
> **验证命令**：
> - 实施完成后，必须运行 `npm run build` 确保无 TypeScript 和构建错误。
