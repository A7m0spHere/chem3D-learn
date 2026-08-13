# HANDOFF.md

## 当前任务

- **任务**：T-039D 拼装实验室、目录与全局清理
- **日期**：2026-08-13
- **基线**：`main@0aceb2d79531c3734ca5a2e578ff238f03705695`，开工时与 `origin/main` 一致且工作区干净
- **阶段状态**：实现与 Windows 验收已完成；交付分支为 `main`，提交与推送结果见本次 Git 历史

## 已完成实现

- Organic Builder 右栏收为常驻实时摘要与默认折叠“诊断详情”；保留全部核心拼装、3D 操作、命名、键角、官能团和验证数据流。
- Builder、目录筛选与主要动作的触控高度提高到至少 44px；`xl` 继续显示全屏 Canvas 上的左右浮层，低于 `xl` 继续使用底部按需入口。
- Modules 卡片压为两行说明、单行“看什么”、两个标签和明确入口；Paths 删除重复自学段落，每条路线只保留一条理解顺序和每个结构的短观察理由。模块数、分组、路由及 Exam 未改。
- 17 份晶体手写 JSON 删除 `crystalTeaching`；类型、`mockMolecules` 透传和迁移期测试引用同步清理。CaF₂、CsCl、Diamond、PBA、Sodium 另删除未进入 `MoleculeRecord` 的顶层重复标题 / 描述字段。
- `MOLECULE_DATA_SCHEMA.md`、`UI_SPEC.md`、`BACKEND_DATA_SYNC.md` 已同步；新增 `t039d-3d-first.visual.spec.ts` 覆盖六档视口和三个 Viewer 家族。

## 验证结果

- 23 份手写 JSON 全部可解析；17 份晶体均无 `crystalTeaching`，所有 23 份记录均无 `MoleculeRecord` 契约外顶层字段。
- `npm.cmd run lint`、`npm.cmd run build` 通过；build 只保留既有按需 `ThreeViewerFrame` large chunk 警告。
- `npm.cmd run test:logic`：163 / 163 通过。
- 系统 Chrome：T-039D 新增契约 3 / 3；Builder、普通分子、专题、晶体、NaCl 与状态重置既有无截图回归 37 / 37；合计 40 / 40。
- `npm.cmd run test:production`：build 与生产预取回归 4 / 4 通过。
- 独立 Python Playwright 验收覆盖 6 档视口：Builder 画布保持视口主导，Modules / Paths 全部公开分组与路线可见；三页横向溢出为 0、浏览器错误为 0，诊断按钮与关键动作均至少 44px。
- `git diff --check` 通过；Windows 未运行或更新 Darwin 快照。

## 已知边界与下一步

- 当前只有 `*-darwin.png` 视觉基线；本轮 Windows 验收没有更新任何快照。
- 下一项只做 macOS 默认 Chromium 的 T-039A～D 集中视觉审核，先分类 expected / actual / diff，再定向更新人工确认属于预期布局变化的基线。
