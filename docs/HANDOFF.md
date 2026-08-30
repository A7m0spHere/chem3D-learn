# HANDOFF.md

## 当前任务

- **任务**：UI 动效/布局审查修复 + 修复后 code review（2026-08-30，Claude Code，分支 `claude/ui-review-fixes`，PR #9）。
- **来源**：维护者要求对前端动效与布局做一次审查；多视口截图（12 页 × 4 视口）发现 3 个 P1 缺陷与若干 P2，随后按「基线零冲突优先」实施修复。

## 本次改了什么（PR #9）

- **摘要栏挤压（P1-1，最严重）**：`ThreeViewerFrame.tsx` 摘要文本 `flex-1`（basis 0）+ `min-w-0` 会被宽图例 `footerMeta`（`shrink-0`）挤到每行 1-4 字（MOF-5 移动端摘要栏实测 721px 高、NaCl/CaF₂ 同病）。改为 `min-w-[min(15rem,100%)]`：窄屏下图例整体换行、文本独占整行，MOF-5 摘要栏 721px → 125px；桌面同行时下限不生效、渲染逐像素不变。
- **chips 词中断行（P2）**：`ModuleDetailPage` 页首标签容器 `flex` 默认 nowrap，窄屏下 chip 被挤压词内断行（「竞赛入/门」「MOF-/5」）；加 `flex-wrap` + `whitespace-nowrap`。
- **顶栏文案重复（P2）**：`MoleculeViewer` 的 title「CH4｜自由探索」与 meta「甲烷 · 自由探索」重复出现「自由探索」；meta 改为 `displayName`（测试只断言 title，安全）。
- **ScrollReveal 打印兜底（P1-3）**：`motion.css` 追加 `@media print` 强制 `.motion-scroll-reveal` 可见——打印/另存 PDF 不再输出大片空白。滑动动画本身未动（产品主人既定手感）。

## Code review 结论（按 docs/CODE_REVIEW.md）

- 评审发现并已修复 1 项：`min-w-[15rem]` 在超窄视口（<272px）会超出容器产生横向溢出，改为 `min-w-[min(15rem,100%)]` 钳在容器内。
- 基线零冲突已取证：78 张 Linux 基线中 viewer 系列为 `canvasArea` 元素级截图（不含摘要栏/chips），390px 基线仅 organic-builder 两张（独立布局），home/modules 基线不含 viewer 摘要栏。
- 未修（有意挂账，均记录在 TASKS.md T-041-B）：① `CalloutLabel` 标签出界/叠印（位置随相机旋转变化，需边界钳制，随 B 的 rebuild 周期修）；② 推荐卡标题=副标题重复（改 `ModuleCard` 会触碰 `modules-molecular-geometry-filter-linux.png` 基线，同周期修）。

## PR 门禁四轮攻防（重要教训）

PR #9 是新 PR 视觉回归门禁的首次实战，四轮才全绿，暴露了两类真实问题：

1. **helper 竞争（已修）**：`waitForTouchTargetSettled` 在 `page.reload()` 后若懒加载 chunk 晚于 `fonts.ready` 挂载整页容器，`querySelector` 拿到 null 会整段跳过动画等待（run 33314825061 实测动画 98.4% 进度时测量）。修法：先 `waitForSelector(".motion-page-enter", { state: "attached" })` 再 `getAnimations`。
2. **±2px 等式断言的加载窗口抖动（已修）**：晶体三宽度循环与 NH₃ 1024 等式测试都是 `goto` 后**无稳定等待**直接测量。两轮门禁分别在晶体页漂 6.45/3.22px、NH₃ 页漂 2.31px，且失败断言逐轮不同；诊断轮（输出全部 box + transform）显示稳定值逐像素相等、transform 均为 none。修法：测量前统一调用 `waitForTouchTargetSettled`（等字体 + 容器挂载 + 动画结束），不放宽容差。**教训：新增 ±2px 级布局断言时必须配套稳定等待；main 三次全绿不代表无 flake，只是窗口未命中。**
3. 诊断轮遗留过 2 个 eslint warning（eslint-disable 指令未匹配规则），已随诊断代码一并移除。

## 验证

- `npm run build` 通过；`npm run lint` 通过；`npm run test:logic` **163 / 163**。
- 系统 Chrome 通道 + `--ignore-snapshots`：受影响的 5 个 spec 共 **43 / 43**（molecule-viewer、core-learning-pages、specialty-viewers、crystal-3d-first、crystal-viewer）。
- 390px 实测复检：MOF-5 摘要 721 → 125px、NaCl 141 → 109px，五页均无横向溢出；修复后截图逐张目检确认。
- PR 视觉回归门禁第四轮全绿（run `33317754131`，168/168）：基线零冲突 + 全套件通过的最终实证。前三轮失败与修复见上节。
- `git status` 干净：无快照 / lockfile / 缓存污染；`ui-review-20260830/` 为维护者本地的审查截图文件夹，未跟踪、不提交。

## 遗留问题（T-041 B/C/D，按序待办）

- **B（中）**：移动端 3D 主视区本身（顶栏/工具栏换行吃掉高度）+ 挂账的标签钳制与推荐卡标题去重——三者共用一个 rebuild 周期。验收：canvas ≥40% 屏高、无横向溢出。
- **C（中）**：23 份 JSON 的 `metadata.notesZh` 零消费者；接入方式待维护者决策（并入 `StructureInfoDisclosure.modelBoundary` 处理长度，或 JSON 另立短字段）。
- **D（低）**：`mxene-callout` 的 `waitForTimeout(1000)` 改事件驱动，需 CI 验证。

## 平台与环境边界（不变）

- Linux 78 张基线为现行基线；darwin 78 张为遗留待清理；任何平台的快照不得在 Windows 本机更新。
- Windows 本机跑 `playwright test` 必须带 `--ignore-snapshots`，用系统 Chrome 通道（`PLAYWRIGHT_CHANNEL=chrome`）。
- verify / rebuild：`gh workflow run visual-regression.yml --ref main -f mode=verify`；PR 上 frontend 路径变化会自动触发 verify（PR #7 门禁）。

## 下一步建议

1. T-041-B 主体实施（含挂账两项），走 rebuild → 人工逐张审核基线 PR。
2. 决策 T-041-C 接入方式后实施。
3. 全部收口后发 `v0.1.0-rc.2`，重启 T-031 真实反馈收集。
4. 可选：Settings → Branches 把 lint / logic / visual 设为必需检查；清理 darwin 旧基线。

