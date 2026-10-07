# PROJECT_STATUS.md

> 项目当前状态快照。供 Codex 每次开工前快速了解全局。
> 最后更新：2026-10-07（待办清零批次：T-041 全部子项收口、T-043 全量闭环、three chunk 隔离 + 体积守卫落地，D-054 / D-055）
> 上一次实质进展更新：2026-10-06（批次 B + 批次 C：T-043 遗留缺陷④修复闭环、T-041-B/D 收口、D-053 基线收口决策、C-1 TeachingHtml、C-2 晶体样板合并）

## 一句话定位

Chem3D Learn / 结构化学 3D 学习站 —— 面向中国高中生和化学教师课堂演示的前端优先 3D 结构化学学习网站。详见 `docs/PROJECT_BRIEF.md`。

## 当前阶段（2026-10-07 快照）

- **版本**：`v0.1.0-rc.1` prerelease 已发布并部署 GitHub Pages（2026-07-29），此后未发新版本；`v0.1.0-rc.2` 的前置是 video 采集管线修复 + 素材重采。
- **产品形态**：全站完成 T-039 的 3D-first 收缩——普通分子为大 Viewer + 右侧控制栏 + 折叠结构信息；专题使用精简 Inspector；晶体统一全宽 Viewer → 模式工具栏 → 折叠「晶体信息」；拼装实验室为实时摘要 + 默认折叠诊断。
- **任务面**：**TASKS.md 待办清零**。T-043 标签体系审计与修复全量闭环（Phase 4 按 D-053 以 verify 收口，run `37646183162` 全绿）；T-041 全部子项完成（C：23 份 JSON 的 `metadata.notesZh` 以折叠面板渲染原文接入模型边界，D-054）；体检第三梯队第二批优先项完成（three chunk 函数式 manualChunks 隔离 + 构建体积守卫，D-055）。下一个开发任务：**T-044 体检第三梯队余项**（registry 表格化、ChemCanvas wrapper、11 条路由基线、tsconfig 强化）。
- **两项决策已定**（2026-08-27 维护者确认）：
  1. 过期 Darwin 快照 → 迁移到可复现 ubuntu CI（已收口，T-040）；
  2. T-031 真实用户反馈 → 待 `v0.1.0-rc.2` 发布后重启。

## 技术栈（已核实）

- **frontend/**（主产品）：Vite 6 + React 18 + TypeScript 5（strict）+ Tailwind CSS 3 + shadcn/ui + React Three Fiber 8 + Drei 9 + three 0.170 + react-router-dom 7。测试使用 Playwright。
- **backend/**：纯 `node:http`，零运行时依赖，只读 GET API；要求 Node.js `>=20`，测试使用内置 `node:test`。
- **video/**：独立的 Remotion 4 演示视频子项目，使用 React 19，依赖树与前端隔离。

## 已核实的产品与代码现状（2026-10-07 复核）

- 前端路由包含 Home / Modules / ModuleDetail / Paths / Exam / ExamTopicDetail / About / OrganicBuilder。
- `frontend/src/components/three/` 有 50 个源码文件（40 个 `.tsx` + 10 个 `.ts`）；公开模块均由真实结构数据或专题 Viewer 承接，placeholder 仅作防御性 fallback。
- 23 个手写结构 JSON 位于 `frontend/src/data/manual/` 并全部注册；`metadata.notesZh` 已接入 `StructureInfoDisclosure.modelBoundary`（晶体 / NaCl 周期工作台 / 普通分子三条路径，D-054）。
- `organicBuilderNomenclature.ts` 为 1959 行；`knownOrganicMolecules` 当前为 **16** 个。新增或删除条目时必须同步 T-001 表驱动测试的中文名期望表。
- `ModuleDetailPage.tsx` 的专题控制状态由 `useCrystalControls` / `useOrganicPlanarControls` / `useBondingControls` 三个 typed hook 管理，通过 `deriveViewerKind` / `viewerRegistry` 统一分发 viewer、toolbar、panel。
- **分包现状（D-055，2026-10-07 实测）**：`vite.config.ts` 函数式 manualChunks——three 家族 → 稳定命名 `three` chunk（847.6 KB / gzip 229.2），react / react-dom / vite `__vitePreload` 助手 → `react-vendor`（144.7 KB / gzip 46.6），首页入口 215.0 KB / gzip 69.0；构建由 `scripts/check-bundle-budget.mjs` 体积守卫把守（three ≤1100/310 KB、其余单 chunk ≤260/80 KB，随 build / build:pages 进 CI）。
- 测试基线：logic **163 / 163**、ESLint 零警告、`tsc --noEmit` 通过（2026-10-07 于 Windows 复跑）；`test:production`（含 prefetch 回归 + 体积守卫）**4 / 4**（chrome 通道）；Linux 基线 78 张由 CI 维护，2026-10-07 verify 全绿（run `37646183162`）；darwin 78 张为历史遗留待清理；backend 最近记录 22 / 22。
- 后端提供 `/health`、`/api/molecules`、`/api/molecules/:id` 及 `/api/structures` 别名；前端当前没有调用后端 API。
- `video/` 配置为 1950 帧、30 fps，即 65 秒演示视频。

## 关键里程碑速览

| 时间 | 里程碑 |
| --- | --- |
| 2026-07-25 ~ 07-26 | 工程地基：协作规范、错误边界、有机命名回归、后端 P0 修复、数据防漂移契约 |
| 2026-07-26 ~ 07-28 | 打磨期：引线标签系列收尾（9 viewer）、拼装化学硬伤修复、首页 gzip −67% |
| 2026-07-29 | 公开发布周：README / MIT / GitHub Pages / `v0.1.0-rc.1`（macOS 视觉回归 146/146） |
| 2026-08-01 ~ 08-03 | 方向纠偏：化学核验收口、XeO 占位清理、T-035 自测功能整体 revert |
| 2026-08-06 ~ 08-09 | T-038 NH₃ 引导观察样板（维护者实际体验后由 T-039 方向取代） |
| 2026-08-10 ~ 08-13 | T-039A～D 全站 3D-first 收缩分四个 PR 阶段合并 |
| 2026-08-27 ~ 08-30 | 门禁与基线收尾：T-040 ubuntu 基线合并（PR #4）、T-041-A 质量门禁（PR #7）、摘要栏挤压修复（PR #9） |
| 2026-08-30 ~ 09-30 | T-042 引线标签防遮挡合并（PR #10，含评审修复自反馈振荡）+ T-043 Phase 1 全量审计与文档整理（PR #11） |
| 2026-09-30 ~ 10-06 | 批次 A（移动端 340px + Phase 2 三缺陷）与批次 B/C（缺陷④闭环、D-053、TeachingHtml 69 处、晶体样板合并、mock 层退役） |
| 2026-10-07 | 待办清零：T-043 / T-041 全量闭环，three chunk 隔离 + 体积守卫（D-054 / D-055），verify 全绿 |

## 已知风险

- `motion.css` 按产品主人既有选择，在 `prefers-reduced-motion: reduce` 下仍让首页 Hero 与 `ScrollReveal` 播放 1100ms 过渡，属已知可访问性取舍；未经确认不要擅自改回全局禁用。
- `ViewerErrorBoundary` 的重试是整页 reload 而非仅重建 Canvas，用于绕开 `React.lazy` 缓存拒绝 Promise；Error Boundary 本身不覆盖事件处理、异步回调与所有 R3F 动画帧故障。
- 23 个 JSON 经 `as unknown as MoleculeRecord` 接入，绕过静态结构核验，无运行时 schema / 引用完整性测试。
- `backend/src/molecules.js` 与前端核心 JSON 重复，已有防漂移契约测试锁定结构核心（T-005）；教学文案与 nacl 简化胞差异为有意保留，未做构建期单源生成。
- GitHub Pages 无服务端 history rewrite：深层 URL 首个 HTTP 响应为 404，由 `404.html` 在浏览器端恢复；如需原生 200 或更强 SEO 应换支持 rewrite 的托管。
- three chunk（847.6 KB / gzip 229.2）仍触发 Vite large chunk 警告；受限设备直达 CH₄ Canvas 的加载时间目标（≤4 秒）尚未复测——three 隔离后 three / react-vendor chunk hash 稳定，回头访客可跳过重下载，但首访指标需实测确认。
- **质量门禁已建立（2026-08-30，PR #7）**：`deploy-pages.yml` 部署前跑 `quality-gate`（lint + test:logic + backend test）；`visual-regression.yml` 在 frontend 路径变化的 PR 上自动跑 `verify`。仓库未配置 branch protection，检查目前「可见但不强制」，设为必需检查是维护者在 Settings 的后续选择。
- **体积守卫预算是显式决策点（D-055）**：`check-bundle-budget.mjs` 超限即构建失败；上调预算必须修改脚本并在提交说明记录，不得静默放宽。

## 其他待确认

- `docs/ROADMAP.md` 历史 v0.x / v1.0 章节与已发布 `v0.1.0-rc.1` 的版本命名需在未来稳定版任务中统一。
- 前端与 video 未声明 Node `engines`，最低支持版本待确认。
- GitHub Pages 为正式部署平台，自定义域名尚未配置。
- 本机 `ui-review-20260830/`（8-30 的 UI 评审截图，1.1MB，问题均已修复）待维护者决定去留。
