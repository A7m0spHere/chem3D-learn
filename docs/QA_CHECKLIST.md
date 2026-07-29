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
- [ ] 涉及可见文案或布局变化时，在 macOS 审核 Darwin 快照；Windows 不更新基线（NaCl 本轮对应 T-029B）。

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
