# QA_CHECKLIST.md

Use this checklist to review each Codex output.

## Scope Control

- [ ] Change matches the confirmed task.
- [ ] No unrelated large refactor is introduced.
- [ ] No backend, database, login, teacher admin, payment, AI chat, Gemini API, dynamic SMILES, or RDKit runtime feature is added.
- [ ] MVP structures remain limited to CH4, NH3, H2O, CO2, BF3, and simplified NaCl unless explicitly approved.

## Documentation-Only Harness Task Limits

For the initial harness documentation task:

- [ ] Does not create `frontend/`.
- [ ] Does not install dependencies.
- [ ] Does not write application code.
- [ ] Does not run `npm run build`.
- [ ] Does not create `docs/gemini-ui-draft.md` unless an actual Gemini draft exists.

## Build and Commands

When frontend code exists:

- [ ] `cd frontend && npm run build` passes.
- [ ] `npm run lint` is run if available.
- [ ] `npm test` is run if available.
- [ ] No TypeScript blocking errors remain.

For documentation-only tasks before frontend scaffolding:

- [ ] Build is intentionally skipped and explained.
- [ ] Read-only checks confirm expected files.

## UI

- [ ] Home page has clear product identity and learning entry.
- [ ] Home page shows MVP module previews.
- [ ] Learning page desktop layout uses left selector, central 3D viewer, and right lesson panel.
- [ ] Tablet layout allows sidebar collapse.
- [ ] Mobile layout places viewer above explanation and uses a top model selector.
- [ ] Teacher projection mode keeps text, buttons, and step explanations readable.
- [ ] UI follows the light education style from `docs/DESIGN_SYSTEM.md`.
- [ ] UI avoids dark dashboard, cyberpunk, purple-blue AI template, heavy gradients, and overcrowding.

## 3D Interaction

- [ ] Model can rotate.
- [ ] Model can zoom.
- [ ] Auto rotate can be toggled.
- [ ] Bond angle display can be toggled.
- [ ] Lone pair display can be toggled where applicable.
- [ ] Lesson step switching updates the explanation and any intended viewer focus.
- [ ] Switching molecule does not crash.

## Chemistry Content

- [ ] CH4 geometry is tetrahedral.
- [ ] NH3 geometry is trigonal pyramidal.
- [ ] H2O geometry is bent.
- [ ] CO2 geometry is linear.
- [ ] BF3 geometry is trigonal planar.
- [ ] NaCl is represented as a simplified unit cell.
- [ ] Uncertain facts are marked `TODO-CHEM-VERIFY`.
- [ ] Protected manual IDs are not overwritten accidentally.

## Gemini Draft Review

- [ ] Gemini is used only for HomePage / LearningPage UI drafts.
- [ ] Gemini draft material is treated as reference, not source of architectural truth.
- [ ] Codex adapts drafts into Vite + React + TypeScript.
- [ ] No Next.js, Firebase, backend, login, Gemini API, or AI chat feature is introduced from a Gemini draft.

## Final Response

- [ ] Changed files are listed.
- [ ] Commands run are listed.
- [ ] Build status is stated.
- [ ] Known limitations are listed.
