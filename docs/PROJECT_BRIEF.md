# PROJECT_BRIEF.md

## Project Positioning

Chem3D Learn / 结构化学 3D 学习站 is a lightweight 3D interactive learning website for Chinese high-school structural chemistry.

It serves:
- 中国高中普通学生
- 化学教师课堂展示

It is not:
- a chemistry database
- a question bank
- a document archive
- a backend SaaS product
- a drug discovery platform
- an AI chat product

## Learning Goal

The product helps students understand molecular and crystal spatial structure through:
- large interactive 3D visualization
- concise Chinese explanations
- step-by-step structure reasoning
- visible bond angles and lone pairs
- simple classroom-friendly controls

The site should prioritize intuition over exhaustive data.

## MVP Scope

Build only:
- Home page
- 3D Learning page
- Core VSEPR molecules:
  - CH4
  - NH3
  - H2O
  - CO2
  - BF3
- Simplified NaCl unit cell
- Basic interactions:
  - rotate
  - zoom
  - auto rotate
  - show/hide key bond angles
  - show/hide lone pairs
  - lesson step switching

## Explicit Non-Goals

Do not build:
- login
- user accounts
- backend
- database
- teacher admin panel
- complex question bank
- payment
- dynamic SMILES input
- RDKit runtime API
- competition-level advanced content
- Gemini API
- AI chat features

## Content Principles

- Use Chinese teaching copy suitable for high-school students.
- Keep explanations short enough for classroom projection.
- Focus on spatial structure, electron pair arrangement, molecular geometry, and key angles.
- If a chemistry fact is uncertain, mark `TODO-CHEM-VERIFY` instead of inventing.
- Do not overwrite protected manual molecule IDs: `ch4`, `nh3`, `h2o`, `co2`, `bf3`, `nacl`.

## Gemini UI Collaboration

Gemini may provide only HomePage / LearningPage UI drafts.

Expected draft location:
- `docs/gemini-ui-draft.md`

Codex responsibilities:
- adapt Gemini drafts into the Vite + React + TypeScript frontend
- fix TypeScript issues
- split UI into maintainable components
- align visuals with `docs/DESIGN_SYSTEM.md`
- run build and available checks after frontend integration

Codex must not accept Gemini-generated scope creep:
- no Next.js
- no Firebase
- no backend
- no login
- no Gemini API
- no AI chat features
