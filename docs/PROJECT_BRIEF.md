# PROJECT_BRIEF.md

## Project Positioning

Chem3D Learn / 结构化学 3D 学习站 is a lightweight 3D interactive learning website for Chinese high-school structural chemistry.

It serves:
- 中国高中普通学生
- 化学教师课堂展示

The project is front-end-first. The current frontend pages and interaction model are the baseline for future work, and backend work should be derived from those frontend needs.

It is not:
- a full chemistry database
- a large question bank
- a backend SaaS product
- a drug discovery platform
- an AI chat product

## Learning Goal

The product helps students understand molecular and crystal spatial structure through:
- large interactive 3D visualization
- concise Chinese explanations
- step-by-step structure reasoning
- visible bond angles and lone pairs
- module-based learning organization
- simple classroom-friendly controls

The site should prioritize intuition over exhaustive data.

## Current Frontend Scope

Current frontend structure includes:
- Home page
- Modules page
- Module detail page with 3D learning experience when model data exists
- Paths page
- Exam page
- About page

Core 3D structures remain the priority:
- CH4
- NH3
- H2O
- CO2
- BF3
- simplified NaCl teaching model

Extended modules may exist as frontend content shells or placeholder teaching modules. They should not turn the product into a database, backend SaaS, or large competition-level content platform unless explicitly approved.

## Backend Direction

Backend can exist as a later support layer after the frontend direction is stable.

Allowed backend direction:
- minimal read-only API
- health check
- structure/module summaries
- single structure/module detail endpoints
- data mapping that follows current frontend content

Do not add unless explicitly requested:
- login
- user accounts
- database-backed user state
- teacher admin panel
- payment
- dynamic SMILES input
- RDKit runtime API
- Gemini API
- AI chat features

## Content Principles

- Use Chinese teaching copy suitable for high-school students.
- Keep explanations short enough for classroom projection.
- Focus on spatial structure, electron pair arrangement, molecular geometry, key angles, and learning-module guidance.
- If a chemistry fact is uncertain, mark `TODO-CHEM-VERIFY` instead of inventing.
- Do not overwrite protected manual molecule IDs: `ch4`, `nh3`, `h2o`, `co2`, `bf3`, `nacl`.
- Treat NaCl as a simplified teaching model, not a full crystallographic database record.

## Gemini UI Collaboration

Gemini may provide UI drafts and product-interface ideas.

Expected draft location:
- `docs/gemini-ui-draft.md`

Codex responsibilities:
- adapt Gemini drafts into the current Vite + React + TypeScript frontend
- prefer the current frontend implementation over older draft text
- fix TypeScript issues
- split UI into maintainable components
- align visuals with `docs/DESIGN_SYSTEM.md`
- run build and available checks after frontend code integration

Codex must not accept Gemini-generated scope creep:
- no Next.js
- no Firebase
- no login
- no Gemini API
- no RDKit runtime
- no AI chat features
