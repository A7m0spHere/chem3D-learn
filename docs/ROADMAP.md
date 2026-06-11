# ROADMAP.md

## v0.1 - Project Harness

- Establish project documentation.
- Define MVP boundaries, design system, UI spec, molecule schema, QA checklist, and review guide.
- Do not create frontend code in this phase.

## v0.2 - Frontend Scaffold

- Create Vite + React + TypeScript frontend.
- Add Tailwind CSS and shadcn/ui foundation.
- Set up basic routing for Home and 3D Learning.
- Confirm build command works.

## v0.3 - Static UI Shell

- Build Home page shell.
- Build 3D Learning page responsive layout.
- Add placeholder panels for selector, viewer, controls, and lesson steps.
- Keep design aligned with the light education style.

## v0.4 - Molecule Data and Types

- Add TypeScript molecule data types.
- Add hand-authored records for CH4, NH3, H2O, CO2, BF3, and simplified NaCl.
- Protect manual IDs.
- Mark uncertain facts with `TODO-CHEM-VERIFY`.

## v0.6 - 3D Viewer MVP

- Integrate React Three Fiber and Drei.
- Render atoms, bonds, lone pairs, and key angle annotations.
- Support rotate, zoom, auto rotate, and structure switching.

## v0.8 - Teaching Interaction

- Connect lesson steps to viewer focus states.
- Add toggles for bond angles and lone pairs.
- Improve mobile, tablet, and teacher projection readability.
- Run QA checklist against the full MVP flow.

## v1.0 - MVP Release

- Polish Chinese teaching copy.
- Review chemical accuracy for MVP structures.
- Verify responsive layouts.
- Confirm build, lint, and tests where available.
- Document known limitations and future scope.
