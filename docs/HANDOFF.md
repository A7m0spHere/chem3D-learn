# HANDOFF.md

## 最近一次交接

- **任务**：T-039A 共享布局与普通分子 3D-first 收缩
- **日期**：2026-08-10
- **分支**：`codex/t039a-3d-first-clean`
- **基线**：`origin/main@99545223df0bc3cfec897d4d07e360a86c547d91`
- **阶段状态**：T-039A 已实现并完成本地验收，PR #2 当前保持 Draft；维护者审阅最终选定的普通分子“大 Viewer + 240px 右侧控制栏”已完成。不要启动 T-039B，直到 A 合并。

## 本轮改动

- `ModuleDetailPage` 已删除 360px 教学右栏；普通分子桌面端采用左侧大 Viewer + 240px 右栏，右栏依次放置模型控制与默认折叠的结构信息。现有专题 Panel 暂时排列在 Viewer 下方，后续按 B / C 阶段分别收缩。
- 新增 `StructureInfoDisclosure`：默认关闭、不持久化，使用原生按钮和 `aria-expanded` / `aria-controls`；模块切换时通过 React `key` 重新挂载并恢复关闭。
- 普通分子折叠摘要显示公式、名称、构型和典型键角；展开只显示名称 / 分子式、空间构型、典型键角与“典型值 / 空间关系示意”的模型边界。
- `MoleculeViewer` 不再接收 `activeStep` / `isGuidedMode`，不再聚焦步骤原子、键或角；键角、孤电子对、标记与自动旋转仍由 `FloatingToolbar` 独立控制。
- PR #2 维护者审阅最终撤销高度压缩：普通分子恢复原大 Viewer 高度，桌面四个控制按钮在 240px 右栏纵向占满，结构信息紧随按钮并在展开后使用单列事实；移动端仍在 Viewer 下方按“两列按钮 → 结构信息”排列。右栏不悬浮、不 sticky、不含教学正文；专题、晶体与拼装 Viewer 不受影响。
- 删除 `ExplorerPanel`、“回到自由探索”、前后步、完成状态、`LessonStep` / `GuidedObservation*` 类型及 T-038 引导测试；同时删除无任何入口的 `LessonPanel`、`StepBar`、`MoleculeSidebar`。
- 23 份 `data/manual/*.json` 与 `mockMolecules.ts` 中的 `lessonSteps` 已纯删除；契约测试锁定 23 份数据不再出现 `lessonSteps` / `guidedObservation`。
- 没有修改原子坐标、化学键、角度数值、晶胞几何、专题模式、路由、模块数量、依赖、lockfile、版本或 Darwin 快照。

## 验证

- `npm.cmd run lint`：通过。
- `npm.cmd run build`：通过；仅有既有按需 `ThreeViewerFrame` large chunk 警告。
- `npm.cmd run test:logic`：161 / 161 通过。首次 160 / 161 是新增 BF₃ 测试误写“约 120°”，改回既有“键角 120°”后全过。
- 系统 Chrome `molecule-viewer.visual.spec.ts`：5 / 5 通过；覆盖五个普通分子入口、默认折叠、键盘展开、44px 控件与独立工具栏状态；1280×720、1552×926 冻结 240px 右栏、纵向全宽按钮与右栏内单列结构信息，390×844 冻结纵向顺序、两列按钮与无横向溢出。
- 系统 Chrome `module-state-reset.visual.spec.ts`：5 / 5 通过；普通分子切模块后显示开关与折叠信息均恢复默认。
- `npm.cmd run test:production`：最终 4 / 4 通过；首次 3 / 4 的唯一失败是已删除右栏标题“自由探索”的过期测试断言，改为 `molecule-viewer` 容器断言后通过。
- Windows 未运行或更新 Darwin 快照。

## 已知边界

- T-039A 只完成普通分子和共享页面骨架。极性、σ/π、成键基础、有机平面、晶体、NaCl 周期工作台与拼装实验室仍使用原 Panel 数据和 UI；它们将在 T-039B～D 逐阶段迁移。
- 全宽 Canvas 会改变画面比例。Windows 只做无截图行为验证；T-039D 后需要 macOS 集中人工审核相关 Darwin 快照。
- T-038 仍是历史完成记录；D-044 只调整后续方向，不改写历史 SHA、日期或当时验收证据。
- 没有开展朋友 / 同学 Alpha，也不声称已获得普通学生验证。

## 下一位 Agent

1. 在 PR #2 中复核桌面与手机真实页面效果，确认大 Viewer、240px 右栏内“模型控制 → 结构信息”和移动端纵向顺序符合维护者预期。
2. 只有项目负责人单独授权后才把 PR #2 转为 Ready 或合并；不要使用旧的 `codex/t039a-3d-first`。
3. 只有 T-039A 合并后，才从最新 `main` 建 T-039B 分支，迁移专题展示 Viewer。
