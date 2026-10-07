# HANDOFF.md

## 当前任务

- **任务**：待办清零批次，2026-10-07，Claude Code，直接 push。三个提交：`6d1a591`（three chunk 隔离 + 体积守卫）、`5139ff8`（T-041-C notesZh 接入）、文档收口。
- **前序**：2026-10-06 批次 B + C（缺陷④闭环、D-053、TeachingHtml、晶体样板合并），见 git log 与 `docs/archive/`。

## 本次改了什么

### 1. three chunk 函数式 manualChunks 隔离 + 构建体积守卫（`6d1a591`，D-055）

- `vite.config.ts` 函数式 manualChunks：`three / three-stdlib / @react-three` → 稳定命名 `three` chunk；App 改动不再使其 hash 失效（长期缓存收益）。
- **两个实测踩坑（都是「首页入口静态 import 992KB three chunk」的同一症状、不同机制）**：
  1. **react / react-dom 被吸收进 manual chunk**——对象式时代的教训在函数式同样发生（入口 import 7 个 react 绑定，`Minified React error` 特征串全在 three chunk 里）；
  2. **vite 的 `__vitePreload` 助手被共享归组进 three chunk**——入口为一个 <1 KB 的 `Promise.resolve()` 助手静态依赖 3D vendor（通过 `import{_ as er}from"./three-*.js"` + 导出表定位确认）。
  两者均解法：显式指派 `react-vendor` chunk。诊断手法：临时 vite build API 脚本导出 chunk 的 `modules` 清单（writeBundle 阶段，注意 fileName 带 `assets/` 前缀），按路径模式筛出被吸收的共享模块。
- `scripts/check-bundle-budget.mjs`：扫描 `dist/assets/*.js`，three chunk 预算 1100/310 KB（raw/gzip）、其余单 chunk 260/80 KB、断言 three 恰好一个；接线进 `build` / `build:pages`，`test:production` / `test:pages` / `test:sites` / deploy-pages CI 全部继承。超限 exit 1，上调预算须显式改脚本 + 提交说明（D-055）。
- 实测：three 847.6 KB / gzip 229.2（纯 3D）；首页入口 215.0 / 69.0 + react-vendor 144.7 / 46.6；首页 JS 入口 gzip 与旧自动分包持平（116 → 115.6 KB），但旧入口里混入的 react-reconciler / scheduler / zustand（fiber 独占）移出首页加载路径。
- 注意：守卫用 `/* global console, process */` 顶注声明 node 全局——本仓库 eslint 对 `.mjs` 不关 no-undef 且无 globals 配置，现有 `tests/deployment/*.mjs` 同款惯例。

### 2. T-041-C：notesZh 模型边界接入（`5139ff8`，D-054）

- `CrystalInfoDisclosure` 两个分支把 `molecule.metadata?.notesZh` 传给 `StructureInfoDisclosure.modelBoundary`；`NaClPeriodicPanel` 新增可选 `modelBoundary` prop 由 ModuleDetailPage 透传；普通分子分支 `notesZh` 优先、原硬编码句兜底。
- 决策：折叠面板渲染**原文**，不做短字段改写（避免二次加工核验过的化学表述）；面板默认折叠，与 3D-first 不冲突。23/23 份 JSON 均有 `notesZh`（脚本核验）。
- UI 上「模型边界」标签与断言（`molecule-viewer.visual.spec.ts` 断言 `模型边界：` 可见）不受影响——文案变了，锚点没变。

### 3. T-043 / T-041 文档收口

- T-043 Phase 4 按 D-053 收口：verify run `37646183162` 全绿（零差异），T-043 整体闭环移入已完成索引。
- T-041 全部子项（A/B/C/D）完成；TASKS.md 待办区新增 **T-044**（体检第三梯队余项：registry 表格化、ChemCanvas wrapper、11 条路由基线、tsconfig 强化）。
- DECISIONS.md 追加 D-054（notesZh 折叠渲染原文）、D-055（three 隔离 + 守卫预算）。

## 验证

- Windows 本机：`npm run build`（含守卫）✓、`npm run lint` ✓、`npm run test:logic` **163/163** ✓、`npm run test:production`（chrome 通道，含 prefetch 回归）**4/4** ✓、守卫失败路径实测（临时调低预算 → exit 1 → 恢复）✓。
- CI：verify run `37646183162` 全绿（覆盖 `5139ff8`）；deploy-pages run `37646145309` 全绿——quality-gate（lint + logic + backend test）与 build（`test:pages` 内含体积守卫，Linux 侧确认通过）。

## 遗留问题

- T-044 体检第三梯队余项（见 TASKS.md 待办）：ModuleDetailPage registry 表格化、ChemCanvas wrapper、11 条路由基线补齐、tsconfig 强化。
- three 隔离后的首访加载指标（受限设备直达 CH₄，目标 ≤4 秒）未复测；回头访客因 chunk hash 稳定受益是确定的。
- video 采集管线修复 + 素材重采 → rc.2 → T-031 反馈重启；backend 冻结决策。
- 本机 `ui-review-20260830/`（8-30 的 UI 评审截图，1.1MB，问题均已修复）待维护者决定去留。
- 本机 Mimosa 安全扫描 hook 提示「未得到完整扫描结论（library_source / callgraph 部分）」——如需完整安全审计请单独运行 Mimosa 深度扫描。

## 下一步建议

1. T-044 四个余项按列表逐项领取，每项独立小提交（验收标准见 TASKS.md）。
2. video 管线修复 → rc.2 发布 → T-031 反馈重启。
3. 有空时复测一次受限设备直达 CH₄ 的首访加载时间，更新 PROJECT_STATUS 已知风险行。
