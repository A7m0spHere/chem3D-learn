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
