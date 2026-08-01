# QA_CHECKLIST.md

Use this checklist to review each Codex output.

## Scope Control

- [ ] Change matches the confirmed task.
- [ ] No unrelated large refactor is introduced.
- [ ] Current frontend structure is treated as the product baseline.
- [ ] Existing multi-page frontend is not rolled back unless explicitly requested.
- [ ] No login, user account, payment, AI chat, Gemini API, dynamic SMILES, RDKit runtime, or database-backed user workflow is added unless explicitly approved.
- [ ] Backend changes, when requested, stay aligned with frontend needs and remain minimal unless explicitly expanded.

## Documentation-Only Tasks

- [ ] Only documentation files are modified.
- [ ] No application code is changed.
- [ ] No dependencies are installed.
- [ ] `npm run build` is skipped unless explicitly requested.
- [ ] Documentation no longer contradicts the current frontend baseline.

## Build and Commands

When frontend code changes:

- [ ] `cd frontend && npm run build` passes.
- [ ] `npm run lint` is run if available.
- [ ] `npm test` is run if available.
- [ ] No TypeScript blocking errors remain.

For documentation-only tasks:

- [ ] Build is intentionally skipped and explained.
- [ ] Read-only checks confirm expected wording.

## UI

- [ ] Home page has clear product identity and learning entry.
- [ ] Modules page presents categories and module cards clearly.
- [ ] Module detail page keeps the viewer and lesson/module panel prominent.
- [ ] Paths, Exam, and About pages match current frontend direction or clearly show placeholder status.
- [ ] Tablet and mobile layouts avoid horizontal overflow.
- [ ] Teacher projection mode keeps text, buttons, labels, and step explanations readable.
- [ ] UI follows the light education style from `docs/DESIGN_SYSTEM.md`.
- [ ] UI avoids dark dashboard, cyberpunk, purple-blue AI template, and overcrowding.

## Product completeness / 产品完备度

- [ ] 公开目录不展示无法进入的“建设中”内容；规划项保留在治理文档中。
- [ ] 当前公开模块均有真实或专题 Viewer，不把防御性 placeholder 当作已交付内容。
- [ ] 核心考试专题至少支持一次“作答—反馈—解释—重试”闭环，而不只是静态讲义。
- [ ] 小范围 Alpha 前已收口发布范围内的 `TODO-CHEM-VERIFY`，并完成适用自动化验证。
- [ ] Alpha 可以由维护者和少量朋友开展，不设置人数 KPI，也不把零 Issue 解释为稳定。

## 3D Interaction

- [ ] Model can rotate when a real 3D viewer is shown.
- [ ] Model can zoom when a real 3D viewer is shown.
- [ ] Auto rotate can be toggled.
- [ ] Bond angle display can be toggled.
- [ ] Lone pair display can be toggled where applicable.
- [ ] Atom labels can be toggled where supported.
- [ ] Lesson step switching updates the explanation and intended viewer focus.
- [ ] Switching modules does not crash.
- [ ] Placeholder viewers do not imply that unavailable 3D models are complete.

## Chemistry Content

- [ ] CH4 geometry is tetrahedral.
- [ ] NH3 geometry is trigonal pyramidal.
- [ ] H2O geometry is bent.
- [ ] CO2 geometry is linear.
- [ ] BF3 geometry is trigonal planar.
- [ ] NaCl is represented as a simplified teaching model, not a full crystallographic database.
- [ ] Uncertain facts are marked `TODO-CHEM-VERIFY`.
- [ ] Protected manual IDs are not overwritten accidentally.

## Chemistry verification / 化学内容复核

- [ ] 结构类型、空间群、Wyckoff 位置、配位数等事实引用 IUCr、同行评审论文或可追溯晶体结构数据库，而不是只引用项目测试。
- [ ] 常规晶胞、原胞、化学式单位与对称学不等价位点没有混用。
- [ ] 手写分数坐标逐项映射到权威结构记录，并说明采用的原点与晶胞选择。
- [ ] 配位数、第一配位层方向和最近邻距离关系同时有来源依据与代码测试。
- [ ] 模型显示尺度与带 Å / nm 单位的物理晶格常数明确区分。
- [ ] canonical 组成计数、边界 display instance 与临时 ghost image 明确区分。
- [ ] 配位引导线不写成共价键，离子晶体不暗示为离散分子。
- [ ] 已核实的 `TODO-CHEM-VERIFY` 替换为可追溯说明；仍不确定的事实继续保留标记。
- [ ] 涉及可见文案或布局变化时，在 macOS 审核 Darwin 快照；Windows 不更新基线。

## Darwin visual regression / macOS 视觉回归

- [ ] 用 Playwright 默认 Chromium 生成与审核 `*-darwin.png`；系统 Chrome 只作额外行为回归，不生成快照基线。
- [ ] 更新前先完整运行一次无更新视觉测试，并检查 expected / actual / diff、trace、console 与 pageerror。
- [ ] 逐项区分合理产品变化、真实回归、WebGL / 时序不稳定和平台天然差异；真实回归先修代码，不能用更新快照掩盖。
- [ ] 只定向更新人工审核通过的快照；不使用全局 `--update-snapshots`，不放宽全局截图容差。
- [ ] Canvas-ready 等待真实 `<canvas>` 可见；WebGL 点击用真实命中结果验证，不依赖固定中心像素或任意长 sleep。
- [ ] 更新后完整视觉测试连续通过两次；高风险晶体 Viewer / Workspace 使用 `--repeat-each=3`。
- [ ] 复核 1280px 课堂展示与 390px 移动端，无 Canvas 裁切、横向溢出、标签遮挡或信息层级破坏。
- [ ] 最终确认仅有 `*-darwin.png`，没有新增 Windows / Linux 快照，也没有提交 test-results、report 或 trace。

## Release candidate / 发布候选

- [ ] 发布版本与 `frontend/package.json`、`frontend/package-lock.json`、README badge、CHANGELOG 和 Release Notes 一致。
- [ ] `backend/` 与 `video/` 保持独立 package version，未随前端候选版本改写。
- [ ] 发布准备提交已进入 `main`，工作区干净，且 Pages workflow 对应同一 release SHA。
- [ ] 创建 annotated tag 前再次确认同名 tag / Release 不存在，tag 精确指向已验证的 `main` 发布提交。
- [ ] GitHub Release 使用人工审核的 notes，标记为 prerelease 且不是 draft / latest stable。
- [ ] 发布前后均检查首页、Modules、代表性分子、NaCl 教学 / 周期模式、Organic Builder、深层 URL、静态资源与 `pageerror`。
- [ ] Release、tag、Pages 部署与线上站点对应同一 release SHA；README 与 CHANGELOG 发布链接有效。
- [ ] 未发布 npm package、未经审核的二进制附件、稳定版或额外候选版本。

## RC feedback / 候选版本反馈

- [ ] Bug、化学内容、体验 / 可访问性 Issue Form 均可打开，字段与标签符合各自证据需求。
- [ ] Issue config 提供在线站点、当前 Release 与 RC 指南入口，并明确安全问题不得公开披露。
- [ ] 反馈台账只记录真实 Issue / 试用反馈，不创建示例、推测或虚构反馈。
- [ ] 分诊同时记录版本、环境、复现状态、证据、P0–P3 依据、处置和版本影响。
- [ ] P0 覆盖站点不可用、广泛黑屏、数据丢失 / 安全、核心化学错误与主流浏览器不可用。
- [ ] P1 覆盖核心功能稳定失败、NaCl 选择 / 配位 / 计数错误、严重布局、误导教学与深层路由失败。
- [ ] P2 在稳定版前修复或明确接受；P3 不单独触发新 RC。
- [ ] 发布 `v0.1.0` 前已有真实目标用户试用、无开放 P0 / P1、P2 有结论、完整测试与 Pages 冒烟通过、无化学阻断。
- [ ] P0 / P1 修复、核心交互 / 教学内容变化、测试或快照变化、需要重新试用时发布新 RC；不移动既有 tag。
- [ ] 没有足够真实反馈时继续保留当前 RC，不把“零 Issue”解释为稳定版已验证。

## Gemini Draft Review

- [ ] Gemini draft material is treated as reference, not source of architectural truth.
- [ ] The current frontend implementation has priority over older draft text.
- [ ] Codex adapts drafts into Vite + React + TypeScript.
- [ ] No Next.js, Firebase, login, Gemini API, RDKit runtime, or AI chat feature is introduced from a Gemini draft.

## Final Response

- [ ] Changed files are listed.
- [ ] Commands run are listed.
- [ ] Build status is stated.
- [ ] Known limitations are listed.
