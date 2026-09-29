# HANDOFF.md

## 当前任务

- **任务**：T-042「3D 引线标签防遮挡」（T-043 Phase 0）实现完成 + T-043 立项（2026-08-30 ~ 08-31，Claude Code，分支 `claude/t042-label-occlusion`，**PR #10 待评审**）。
- **来源**：维护者针对 UI 审查提出的「标签遮挡 3D 模型」问题，选定组合拳路线（决策 D-050）；随后确立 T-043「标签/标注系统全量审计与修复」为最高优先级，T-042 为其 Phase 0。

## 本次改了什么（PR #10）

- **新增 `useClampedHtmlPosition.ts`**：覆盖 drei `<Html calculatePosition>`，pill 出画布时按实测半宽/半高钳回界内（极窄视口不溢出）；同画布同 `collisionGroup` 标签 O(n²) 相交检测、沿 y 分离（maxPush 72）。`CalloutLabel` 全部 32 处与极性 `TinyDipoleLabel` 7 处接入。默认视角不出界/不重叠时位置逐像素不变——这是基线影响可控的关键。
- **样式降噪**：`htmlOverlayStyles.ts` 的 compact/subtle/amber/sp2 与晶体徽章半透明背景 55-60% → 90%，消除「半透明 pill 透出 canvas 引线文字」的叠印观感；徽章教学配色保留，仅提升不透明度。
- **测试锚点与守卫**：`CalloutLabel` 增加 `data-callout-label`；新增 `mof5-callout.visual.spec.ts`（文本/偏移断言 + 360px 极窄视口不出界守卫）。
- **重叠淡出机制**：已实现并验证（密堆积配位视图阳性对照：3 个压模标签淡至 0.3），默认关闭、由调用方显式传 `fadeTo` 启用——原因与启用条件见 D-050 第 4 条（避免误伤密堆积刻意贴原子的教学标签）。
- **文档**：DECISIONS.md 增 D-050；TASKS.md 立项 T-043（标签体系 9 类全量清单 + 四阶段实施）；PROJECT_STATUS.md 更新任务面；`.gitignore` 增加 `.zcode/`（ZCode 本地会话目录）。

## 验证

- `npm run build` 通过（保留 3D chunk large chunk 既知警告）；lint 通过；logic **163 / 163**（2026-09-30 推送前复验）。
- 标签相关断言（7 个 callout spec + crystal-viewer + molecule-viewer + specialty-viewers + molecular-polarity）**59 / 59**。
- 本地实测：MOF-5 默认视角叠印消除、极性 390px 钳制入界；修复前后对比截图在维护者本地 `ui-review-20260830/`（未跟踪、不提交）。

## PR 与基线预期（重要）

- PR #10 的 verify 门禁**预期会报告** mof5 / ren3 / metal-close-packing / batio3 系列 crystal canvas 基线差异（pill 不透明度变化所致）。按 T-042 收口条件与 D-050，随 T-041-B 布局改动合并同一 rebuild + 人工逐张审核基线周期收口，本 PR 不做基线 rebuild。
- `git status` 中 `ui-review-20260830/` 为维护者本地审查截图文件夹，保持未跟踪、不提交（既有约定）。

## 遗留问题

- **T-043 Phase 1 全量审计未开始**——当前最高优先级：23+ 模型页 × 关键视口（360/390/768/1024/1280/1552）截图矩阵 + 缺陷台账，清单见 TASKS.md。distanceFactor 直挂标签、AngleArc、孤对/原子标注、fullscreen 场景标签等约 9 类体系均未审计。
- T-041-B/C/D 待办不变；杂化专题顶部裁切、密堆积配位视图「结构顶出画布上缘」（main 上预存）随 T-043 / T-041-B 收口。
- 远端仍有约 18 个已合并/历史分支（claude/t040-page-enter-fix 等）未删除，本地已清理；远端清理属维护者操作（或 GitHub 合并时勾选自动删除）。

## 下一步建议

1. 维护者评审 PR #10 并合并（callout 基线差异按上节预期处理，不在本 PR 内 rebuild）。
2. 启动 T-043 Phase 1 全量审计（截图矩阵 + 缺陷台账）。
3. T-041-B 实施时与 T-042 的基线变化合并同一 rebuild 周期，人工逐张审核后合并。
