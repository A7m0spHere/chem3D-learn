# PROJECT_STATUS.md

> 项目当前状态快照。供 Codex 每次开工前快速了解全局。
> 最后更新：2026-10-06（批次 B + 批次 C：T-043 遗留缺陷④修复闭环、T-041-B/D 收口、D-053 基线收口决策、C-1 TeachingHtml、C-2 晶体样板合并）
> 上一次实质进展更新：2026-09-30（T-042 引线标签防遮挡合并，PR #10；T-043 Phase 1 全量审计完成并落档台账，PR #11；全库文档整理）

## 一句话定位

Chem3D Learn / 结构化学 3D 学习站 —— 面向中国高中生和化学教师课堂演示的前端优先 3D 结构化学学习网站。详见 `docs/PROJECT_BRIEF.md`。

## 当前阶段（2026-10-06 快照）

- **版本**：`v0.1.0-rc.1` prerelease 已发布并部署 GitHub Pages（2026-07-29），此后未发新版本；`v0.1.0-rc.2` 的前置是 video 采集管线修复 + 素材重采。
- **产品形态**：全站完成 T-039 的 3D-first 收缩——普通分子为大 Viewer + 右侧控制栏 + 折叠结构信息；专题使用精简 Inspector；晶体统一全宽 Viewer → 模式工具栏 → 折叠「晶体信息」；拼装实验室为实时摘要 + 默认折叠诊断。
- **任务面**：**T-043 标签体系审计与修复已全部闭环**——Phase 1 审计（台账 `LABEL_AUDIT_20260930.md`）、Phase 2 三缺陷修复、遗留缺陷④「标签×信息卡」（Y/Z 轴标签与徽章在全部视口被信息卡遮盖 22-100%）已于 2026-10-06 以 `useStaticHtmlObstacle` 障碍物避让修复并加守卫。**T-041-B/D 已完成**（移动端画布 340px 下限 + mxene 测试事件驱动）。**D-053**：基线收口以 verify 结果为准，零差异即关闭 rebuild 前置。**体检第三梯队第一批完成**（C-1 TeachingHtml 收敛 69 处 Html 样板、C-2 晶体 Canvas/棱线样板合并 6 页）。当前最重要任务：**体检第三梯队第二批**（three chunk 体积守卫优先）。
- **两项决策已定**（2026-08-27 维护者确认）：
  1. 过期 Darwin 快照 → 迁移到可复现 ubuntu CI（已收口，T-040）；
  2. T-031 真实用户反馈 → 待 `v0.1.0-rc.2` 发布后重启。

## 技术栈（已核实）

- **frontend/**（主产品）：Vite 6 + React 18 + TypeScript 5（strict）+ Tailwind CSS 3 + shadcn/ui + React Three Fiber 8 + Drei 9 + three 0.170 + react-router-dom 7。测试使用 Playwright。
- **backend/**：纯 `node:http`，零运行时依赖，只读 GET API；要求 Node.js `>=20`，测试使用内置 `node:test`。
- **video/**：独立的 Remotion 4 演示视频子项目，使用 React 19，依赖树与前端隔离。

## 已核实的产品与代码现状（2026-08-27 复核）

- 前端路由包含 Home / Modules / ModuleDetail / Paths / Exam / ExamTopicDetail / About / OrganicBuilder。
- `frontend/src/components/three/` 有 50 个源码文件（40 个 `.tsx` + 10 个 `.ts`）；公开模块均由真实结构数据或专题 Viewer 承接，placeholder 仅作防御性 fallback。
- 23 个手写结构 JSON 位于 `frontend/src/data/manual/` 并全部注册；17 份晶体记录使用最小 `crystalControls` + `CrystalInfo`，无生产消费者 `crystalTeaching`。
- `organicBuilderNomenclature.ts` 为 1959 行；`knownOrganicMolecules` 当前为 **16** 个（甲烷、乙烷、乙烯、乙炔、丙烷、丙烯、丙炔、甲醇、乙醇、甲醛、乙醛、甲酸、乙酸、二甲醚、甲胺、乙胺）。新增或删除条目时必须同步 T-001 表驱动测试的中文名期望表。
- `ModuleDetailPage.tsx` 的专题控制状态由 `useCrystalControls` / `useOrganicPlanarControls` / `useBondingControls` 三个 typed hook 管理，通过 `deriveViewerKind` / `viewerRegistry` 统一分发 viewer、toolbar、panel。
- 测试基线：logic **163 / 163**、ESLint 零警告、`tsc --noEmit` 通过（2026-10-06 于 Windows 复跑）；visual 全套（chrome 通道 `--ignore-snapshots`）**177 / 177**；Linux 基线 78 张由 CI 维护，2026-10-06 verify 全绿（run `37458457980` / `37459897092`）；darwin 78 张为历史遗留待清理；backend 最近记录 22 / 22。
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

## 已知风险

- `motion.css` 按产品主人既有选择，在 `prefers-reduced-motion: reduce` 下仍让首页 Hero 与 `ScrollReveal` 播放 1100ms 过渡，属已知可访问性取舍；未经确认不要擅自改回全局禁用。
- `ViewerErrorBoundary` 的重试是整页 reload 而非仅重建 Canvas，用于绕开 `React.lazy` 缓存拒绝 Promise；Error Boundary 本身不覆盖事件处理、异步回调与所有 R3F 动画帧故障。
- 23 个 JSON 经 `as unknown as MoleculeRecord` 接入，绕过静态结构核验，无运行时 schema / 引用完整性测试。
- `backend/src/molecules.js` 与前端核心 JSON 重复，已有防漂移契约测试锁定结构核心（T-005）；教学文案与 nacl 简化胞差异为有意保留，未做构建期单源生成。
- GitHub Pages 无服务端 history rewrite：深层 URL 首个 HTTP 响应为 404，由 `404.html` 在浏览器端恢复；如需原生 200 或更强 SEO 应换支持 rewrite 的托管。
- 自动分包后按需 `ThreeViewerFrame` 约 838 KB（gzip ≈225 KB）仍触发 large chunk 警告；首页不下载它，但受限设备直达 CH₄ Canvas 中位约 4.38 秒，略高于 4 秒目标。
- **质量门禁已建立（2026-08-30，PR #7）**：`deploy-pages.yml` 部署前跑 `quality-gate`（lint + test:logic）；`visual-regression.yml` 在 frontend 路径变化的 PR 上自动跑 `verify`。仓库未配置 branch protection，检查目前「可见但不强制」，设为必需检查是维护者在 Settings 的后续选择。
- **23 / 23 份手写 JSON 的 `metadata.notesZh` 无消费者**：经化学核验的模型边界说明从未渲染；UI 的「模型边界」是 `ModuleDetailPage.tsx` 中另一套硬编码短句且只覆盖专题模块，见 T-041-C。

## 其他待确认

- `docs/ROADMAP.md` 历史 v0.x / v1.0 章节与已发布 `v0.1.0-rc.1` 的版本命名需在未来稳定版任务中统一。
- 前端与 video 未声明 Node `engines`，最低支持版本待确认。
- GitHub Pages 为正式部署平台，自定义域名尚未配置。
