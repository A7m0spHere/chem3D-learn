# HANDOFF.md

## 当前任务

- **任务**：T-042「3D 引线标签防遮挡」（T-043 Phase 0）实现完成 + T-043 立项（2026-08-30 ~ 08-31，Claude Code，分支 `claude/t042-label-occlusion`，**PR #10 待评审**）。
- **来源**：维护者针对 UI 审查提出的「标签遮挡 3D 模型」问题，选定组合拳路线（决策 D-050）；随后确立 T-043「标签/标注系统全量审计与修复」为最高优先级，T-042 为其 Phase 0。

## 本次改了什么（PR #10）

- **新增 `useClampedHtmlPosition.ts`**：覆盖 drei `<Html calculatePosition>`，pill 出画布时按实测半宽/半高钳回界内（极窄视口不溢出）；同画布同 `collisionGroup` 标签 O(n²) 相交检测、沿 y 分离（maxPush 72）。`CalloutLabel` 全部 32 处与极性 `TinyDipoleLabel` 7 处接入。默认视角不出界/不重叠时位置逐像素不变——这是基线影响可控的关键。
- **样式降噪**：`htmlOverlayStyles.ts` 的 compact/subtle/amber/sp2 与晶体徽章半透明背景 55-60% → 90%，消除「半透明 pill 透出 canvas 引线文字」的叠印观感；徽章教学配色保留，仅提升不透明度。
- **测试锚点与守卫**：`CalloutLabel` 增加 `data-callout-label`；新增 `mof5-callout.visual.spec.ts`（文本/偏移断言 + 360px 极窄视口不出界守卫）。
- **重叠淡出机制**：已实现并验证（密堆积配位视图阳性对照：3 个压模标签淡至 0.3），默认关闭、由调用方显式传 `fadeTo` 启用——原因与启用条件见 D-050 第 4 条（避免误伤密堆积刻意贴原子的教学标签）。
- **评审修复（2026-09-30，PR #10 评审轮）**：碰撞分离**自反馈振荡** P1——registry 残留标签自身上一帧矩形，固定相机下每帧与自己判定重叠并自推 `2·hh+2`px（评审探针实测 26px 交替，Node 算法复现确认），拖拽旋转等连续渲染期间全部接入标签以帧频抖动。修复：分离循环跳过自身条目；新增「固定相机位姿连续重渲染 y 稳定」守卫测试（同宽度两次访问比较，阈值 8px，避开 aspect 重投影的良性漂移 0.8~1.6px）。顺带清理 hook 的未使用类型与 useMemo 冗余依赖两个 lint warning。
- **文档**：DECISIONS.md 增 D-050（含 2026-09-30 评审更正）；TASKS.md 立项 T-043（标签体系 9 类全量清单 + 四阶段实施）并更正 T-042 收口条件；PROJECT_STATUS.md 更新任务面；`.gitignore` 增加 `.zcode/`（ZCode 本地会话目录）。

## 验证

- `npm run build` 通过（保留 3D chunk large chunk 既知警告）；lint 通过；logic **163 / 163**（2026-09-30 整理轮复验；评审轮改动不触及 logic 路径）。
- 标签相关断言（7 个 callout spec + crystal-viewer + molecule-viewer + specialty-viewers + molecular-polarity）**59 / 59**（T-042 实现轮）。
- **2026-09-30 评审轮**（自反馈振荡修复后）：mof5-callout **8 / 8**（含新增守卫）+ 其余 10 个相关 spec **52 / 52**（Windows 系统 Chrome 通道 + `--ignore-snapshots`）；lint 0 error 0 warning；修复前振荡实证见 D-050 评审更正（探针 26px 交替 → 修复后同宽度访问稳定）。
- 本地实测：MOF-5 默认视角叠印消除、极性 390px 钳制入界、拖拽旋转后标签干净无叠印；修复前后对比截图在维护者本地 `ui-review-20260830/`（未跟踪、不提交）。

## PR 与基线现实（2026-09-30 评审更新）

- PR #10 首轮 verify 门禁**实际通过**（run `36596664466`）——此前 D-050 预判「pill 不透明度变化会触碰晶体基线」偏保守：各晶体基线截图均为默认模式，callout 只在特定子模式（配位/八面体等）渲染（batio3 默认模式实测 0 个 callout），基线未拍到 pill。T-042 自身无需 rebuild；rebuild 仅随 T-041-B 自身布局改动需要。
- 评审已修复分离自反馈振荡（见上节），修复对单帧静态渲染无影响，不影响基线。
- `git status` 中 `ui-review-20260830/` 为维护者本地审查截图文件夹，保持未跟踪、不提交（既有约定）。

## 遗留问题

- **T-043 Phase 1 全量审计未开始**——当前最高优先级：23+ 模型页 × 关键视口（360/390/768/1024/1280/1552）截图矩阵 + 缺陷台账，清单见 TASKS.md。distanceFactor 直挂标签、AngleArc、孤对/原子标注、fullscreen 场景标签等约 9 类体系均未审计。
- 多标签互推的收敛性未系统验证（受 maxPush 限幅，D-016 不追求完美避让）；`fadeTo` 未来启用时注意原生 `LineSegments`（晶胞棱线等）不在 `isLineLike` 排除列表——均留 T-043 Phase 2 按体系处理。
- T-041-B/C/D 待办不变；杂化专题顶部裁切、密堆积配位视图「结构顶出画布上缘」（main 上预存）随 T-043 / T-041-B 收口。
- 远端仍有约 18 个已合并/历史分支（claude/t040-page-enter-fix 等）未删除，本地已清理；远端清理属维护者操作（或 GitHub 合并时勾选自动删除）。

## 下一步建议

1. 维护者评审 PR #10 并合并（verify 门禁首轮已通过、无基线差异；评审发现的振荡缺陷已修复并有守卫测试）。
2. 启动 T-043 Phase 1 全量审计（截图矩阵 + 缺陷台账）。
3. T-041-B 实施时自行走 rebuild + 人工逐张审核周期（T-042 已实证无基线影响，不再是 rebuild 的理由）。
