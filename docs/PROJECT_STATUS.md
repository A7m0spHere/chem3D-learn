# PROJECT_STATUS.md

> 项目当前状态快照。供 Claude Code / Codex 每次开工前快速了解全局。
> 最后更新：2026-07-25（Codex 独立复核与事实校正）

## 一句话定位

Chem3D Learn / 结构化学 3D 学习站 —— 面向中国高中生和化学教师课堂演示的前端优先 3D 结构化学学习网站。详见 `docs/PROJECT_BRIEF.md`。

## 技术栈（已核实）

- **frontend/**（主产品）：Vite 6 + React 18 + TypeScript 5（strict）+ Tailwind CSS 3 + shadcn/ui + React Three Fiber 8 + Drei 9 + three 0.170 + react-router-dom 7。测试使用 Playwright。
- **backend/**：纯 `node:http`，零运行时依赖，只读 GET API；要求 Node.js `>=20`，测试使用内置 `node:test`。
- **video/**：独立的 Remotion 4 演示视频子项目，使用 React 19，依赖树与前端隔离。

## 已核实的产品与代码现状

- 前端路由包含 Home / Modules / ModuleDetail / Paths / Exam / ExamTopicDetail / About / OrganicBuilder。
- `frontend/src/components/three/` 当前有 44 个源码文件（37 个 `.tsx` + 7 个 `.ts`），其中 24 个 `.tsx` 是直接包含 R3F `Canvas` 的主 Viewer。
- 真实 3D 内容覆盖 VSEPR 核心分子、多个晶胞与空隙模型、σ/π 键和杂化轨道、有机共面/乙烯/苯/乙炔、有机拼装实验室等专题。
- `frontend/src/data/manual/` 下有 23 个已跟踪 JSON，并全部在 `mockMolecules.ts` 注册。模块目录、考试专题和专项教学数据还分布在 `frontend/src/data/*.ts`。
- `organicBuilderNomenclature.ts` 为 1894 行；`organicBuilderChemistry.ts` 中 `knownOrganicMolecules` 当前是 **17 个**。
- `ModuleDetailPage.tsx` 当前有 **33 个 `useState`**，并通过 `deriveViewerKind` / `viewerRegistry` 统一分发 viewer、toolbar、panel。
- 后端提供 `/health`、`/api/molecules`、`/api/molecules/:id` 及 `/api/structures` 别名，共 6 条独立手写结构数据；前端当前没有调用后端 API。
- `video/` 配置为 1950 帧、30 fps，即 65 秒演示视频。

## 当前工作区状态（重要）

2026-07-25 再次 `git fetch origin` 后，`main` 与 `origin/main` 为 `0 ahead / 0 behind`，但工作区仍有前序 Claude Code 改动没有收口：

- `frontend/src/pages/ModuleDetailPage.tsx` 已修改，接入 `ViewerErrorBoundary`。
- `frontend/src/components/common/ViewerErrorBoundary.tsx` 仍是未跟踪业务文件。
- `frontend/package-lock.json` 有 39 行 npm 平台元数据删除，是否保留为**待确认**。
- `.tmp-npm-cache/` 未跟踪、约 10.8 MB，且当前未被 `.gitignore` 覆盖；不得提交。
- `CLAUDE.md`、`docs/DECISIONS.md` 仍未跟踪。本轮文档事实校正没有修改它们。

因此，“工作区已有实现”“验证通过”和“已提交/已推送”必须分开表述。`ViewerErrorBoundary` 当前属于**已实现、已静态验证，但尚未完成行为验收与业务改动交付**。

## 独立验证结果（2026-07-25）

- `frontend npm run build`：**通过**；Vite 转换 2313 个模块。
- `frontend npm run lint`：**通过**。
- `frontend npm run test:logic`：**23 / 23 通过**。
- `backend npm test`：**5 / 5 通过**。
- `frontend npm run test:visual -- --list`：发现 **14 个文件、109 个用例**。
- 视觉基线：共 **80 张，全部为 `*-darwin.png`**；Windows/Linux 基线为 0。
- 默认 Playwright 冒烟测试：**失败**，缺少 `chromium_headless_shell-1228`。
- 设置 `PLAYWRIGHT_CHANNEL=chrome` 后，同一无截图冒烟测试：**1 / 1 通过**。
- 完整视觉回归：**未运行**，因为当前只有 macOS 基线。
- `video/`：`node_modules` 未安装，本轮未运行 lint、构建或渲染。

构建虽通过，但存在 Vite 非阻断警告：`three` chunk 约 688 KB，超过默认 500 KB 提示阈值。其在课堂弱网/旧设备上的实际影响为**待确认**。

## 正在进行

1. **T-ERR ViewerErrorBoundary 收口**：工作区已有实现，待验证真正的重试语义、故障覆盖范围和视觉效果，并排除无关锁文件/缓存后单独交付。
2. **T-000 AI 协作规范交付收口**：共享文档已建立并完成本轮事实校正，但 `CLAUDE.md`、`docs/DECISIONS.md` 仍未跟踪，完整交付状态待处理。

## 下一步（按优先级，见 docs/TASKS.md）

1. 先完成 T-ERR，避免未验证业务改动长期留在脏工作区。
2. 为 17 个 `knownOrganicMolecules` 补全量、表驱动的识别/命名回归测试，并避免重复现有 23 项逻辑测试。
3. 拆解 `ModuleDetailPage` 的 33 个状态，并补跨模块切换的状态重置回归测试。

## 已知风险

- `ViewerErrorBoundary` 的“重新加载模型”按钮目前只清除边界 state；对于 `React.lazy` 已缓存的分包拒绝，是否能真正重新加载为**待验证**。
- React Error Boundary 不能覆盖所有事件处理、异步回调和 R3F 动画帧错误；“防止所有 WebGL 白屏”的说法缺乏证据。
- 23 个 JSON 通过 `as unknown as MoleculeRecord` 接入，绕过了静态结构核验，当前没有运行时 schema / 引用完整性测试。
- `backend/src/molecules.js` 与前端 6 个核心 JSON 重复，存在数据漂移风险。
- `createBrowserRouter` 的生产静态托管需要 SPA history fallback；当前仓库没有正式部署配置。
- 当前有两处显式化学待核实项：
  - `mockMolecules.ts` 的 BF₃ 缺电子表述。
  - `caf2.json` 的约 5.46 Å 晶胞参数。
- HANDOFF 曾记录 npm 安装报告 4 个漏洞（1 中危、3 高危），本轮未联网重跑 `npm audit`，所以该数字仍为**待确认**。

## 其他待确认

- 是否需要创建根 README；当前根目录和 `frontend/` 均无 README。
- `docs/ROADMAP.md` 的 v1.0 RC 计划与实际实现如何对应。
- 前端与视频未声明 Node `engines`，最低支持版本待确认。
- 正式部署平台、缓存策略和 SPA fallback 配置待确认。
