# HANDOFF.md

## 最近一次交接

- **任务**：T-039C 晶体与 NaCl 周期工作台 3D-first 收缩
- **日期**：2026-08-13
- **分支**：`main`
- **基线**：已合并 T-039B 的 `origin/main@c3e6876`（PR #3）
- **阶段状态**：T-039A / B / C 已完成；T-039D 是唯一下一阶段。

## 本轮改动

- 17 份晶体 JSON 增加最小 `crystalControls`，只保留模式 / 空隙阶段 ID 与短标签；缺失的 6 份 `CrystalInfo` 已补齐。所有晶体 Viewer 都只读取短控制契约和 `summaryZh`，不再读取长 `CrystalTeaching` 标题或正文。
- 删除 `CrystalKnowledgePanel`，新增共享 `CrystalInfoDisclosure`；晶体统一使用全宽 Viewer → 工具栏 → 默认折叠信息。空隙阶段按钮移入模式工具栏首层，标签开关与模式切换继续真实驱动原 3D 分支。
- NaCl 教学模式保留六配位、粒子计数、标签与“周期探索”。周期模式保留 N=1/2/3、选择、六邻居、ghost、隔离与退出选择；边框三态放进单层二级 Disclosure，周期事实默认折叠，选择区只保留功能性实时状态。
- `CrystalControls` 类型与 hook 的 `CrystalControlState` 命名已分离；`mockMolecules` 会合并真实 `crystalControls`。CaF₂ 已核实的 `4 × 8 = 8 × 4` 计数依据移到 `CrystalInfo.formulaExplanationZh`。
- `crystal-viewer.visual.spec.ts` 的 macOS 行为文案断言已同步短标题，但 Windows 没有运行截图回归或更新 80 张 Darwin 基线。

## 验证

- `npm.cmd run lint`、`npm.cmd run build` 通过；`npm.cmd run test:logic` 163 / 163 通过。build 只保留既有按需 `ThreeViewerFrame` large chunk 警告。
- 系统 Chrome `crystal-3d-first.visual.spec.ts`：4 / 4 通过；覆盖代表性晶体、全宽顺序、首层空隙阶段、键盘 Disclosure、390px 触控与无溢出。
- 系统 Chrome `crystal-workspace.visual.spec.ts`：4 / 4 通过；覆盖 N=1/2/3、边框二级 Disclosure、真实粒子 / 边界副本选择、六配位、ghost、隔离、拖拽、状态重置和 1440/1280/768/390。
- 系统 Chrome普通分子 / 专题 / 状态重置回归：19 / 19 通过。
- 系统 Chrome `npm.cmd run test:production`：4 / 4 通过；首页仍不提前加载模块详情或重型 3D chunk，动态路由错误兜底正常。
- 真实渲染实测 1920×1080、1440×900、1366×768、1280×800、1024×768、390×844 均无横向溢出；CrystalInfo 默认高度 70px，NaCl 移动端 94px。
- `/favicon.ico` 是既有缺失资源；NaCl 测试只按 `message.location().url` 排除该已知请求，其他 page / console error 仍会失败。

## 已知边界

- `CrystalTeaching` 类型和 JSON 长字段尚未删除，但 `rg` 应只剩兼容合并与类型定义，没有生产 UI 消费者；必须由 T-039D 连同最终无消费者字段一起清理。
- T-039D 还需收缩 Organic Builder、Modules / Paths / Exam 文案，并在 macOS 集中人工审核 / 更新确有预期变化的 Darwin 基线；Windows 禁止更新这些快照。
- 没有修改晶体几何、坐标、配位 / 周期算法、相机、渲染参数、依赖、lockfile、版本或发布配置；也没有恢复引导、在线答题或 Alpha 招募。

## 下一位 Agent

1. 从已交付 T-039C 的最新 `main` 开始 T-039D，只处理拼装实验室、目录文案、最终无消费者数据和 macOS 视觉收口。
2. 删除 `CrystalTeaching` 前先用 `rg` 复核所有消费者，并同步 17 份手写晶体 JSON、类型、逻辑契约与数据规范。
3. 在 macOS 使用默认 Chromium 审核完整 Darwin 快照；只更新经人工确认属于 T-039A～D 预期布局变化的基线。
