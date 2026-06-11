# MOLECULE_DATA_SCHEMA.md

## Purpose

This document defines the hand-authored structure data needed by Chem3D Learn. The schema is for concise high-school teaching content, not a full chemistry database.

Hand-authored molecule data should live in:
- `frontend/src/data/manual`

Shared TypeScript types should live in:
- `frontend/src/types`

Protected manual IDs:
- `ch4`
- `nh3`
- `h2o`
- `co2`
- `bf3`
- `nacl`

Do not overwrite protected records without explicit instruction.

## MoleculeRecord

Each structure record must include:

```ts
type MoleculeRecord = {
  id: string;
  formula: string;
  nameZh: string;
  category: "vsepr" | "crystal";
  summaryZh: string;
  atoms: Atom[];
  bonds: Bond[];
  lonePairs: LonePair[];
  keyAngles: AngleSpec[];
  lessonSteps: LessonStep[];
};
```

Field semantics:
- `id`: stable lowercase ID used by routing and selection.
- `formula`: display formula, such as `CH4`.
- `nameZh`: Chinese display name.
- `category`: `vsepr` for molecule structures, `crystal` for simplified crystal structures.
- `summaryZh`: one or two Chinese sentences for quick orientation.
- `atoms`: all visible atoms or ions.
- `bonds`: visible bonds or crystal neighbor connections.
- `lonePairs`: visible lone-pair markers, empty when not applicable.
- `keyAngles`: teaching-focused angle annotations.
- `lessonSteps`: ordered explanation steps.

## Atom

```ts
type Atom = {
  id: string;
  element: string;
  label: string;
  position: [number, number, number];
  radius?: number;
  color?: string;
};
```

Field semantics:
- `id`: stable atom ID referenced by bonds, angles, and lone pairs.
- `element`: chemical symbol or ion symbol, such as `C`, `H`, `Na+`, `Cl-`.
- `label`: viewer label, usually same as element.
- `position`: 3D coordinates in teaching-model units, not experimental coordinates unless stated.
- `radius`: optional visual radius override.
- `color`: optional visual color override.

## Bond

```ts
type Bond = {
  id: string;
  atomIds: [string, string];
  order?: 1 | 2 | 3;
  kind?: "single" | "double" | "triple" | "ionic-neighbor" | "visual-guide";
};
```

Field semantics:
- `id`: stable bond ID.
- `atomIds`: the two connected atom IDs.
- `order`: simple bond order for molecular display.
- `kind`: visual interpretation. `ionic-neighbor` or `visual-guide` may be used for simplified NaCl.

## LonePair

```ts
type LonePair = {
  id: string;
  atomId: string;
  position: [number, number, number];
  label?: string;
  visibleByDefault?: boolean;
};
```

Field semantics:
- `id`: stable lone-pair marker ID.
- `atomId`: central or owning atom ID.
- `position`: 3D marker position near the owning atom.
- `label`: optional Chinese or symbolic label, such as `孤电子对`.
- `visibleByDefault`: whether the marker appears before the toggle is used.

## AngleSpec

```ts
type AngleSpec = {
  id: string;
  atomIds: [string, string, string];
  valueDeg: number;
  label: string;
  descriptionZh: string;
};
```

Field semantics:
- `id`: stable angle annotation ID.
- `atomIds`: three atom IDs in angle order, with the vertex atom in the middle.
- `valueDeg`: displayed angle value in degrees.
- `label`: short viewer label, such as `109.5°`.
- `descriptionZh`: concise teaching note explaining why the angle matters.

If the exact value is uncertain for the teaching model, mark the related description with `TODO-CHEM-VERIFY`.

## LessonStep

```ts
type LessonStep = {
  id: string;
  titleZh: string;
  bodyZh: string;
  focusAtomIds?: string[];
  focusBondIds?: string[];
  focusAngleIds?: string[];
  showLonePairs?: boolean;
  showAngles?: boolean;
};
```

Field semantics:
- `id`: stable step ID.
- `titleZh`: short Chinese step title.
- `bodyZh`: concise Chinese teaching explanation.
- `focusAtomIds`: optional atoms to highlight.
- `focusBondIds`: optional bonds to highlight.
- `focusAngleIds`: optional angles to highlight.
- `showLonePairs`: whether this step should emphasize lone pairs.
- `showAngles`: whether this step should emphasize key angles.

## Data Rules

- Keep data small and hand-authored for the MVP.
- Do not add dynamic SMILES parsing or RDKit runtime generation.
- Do not turn this into a large chemistry database.
- Use `TODO-CHEM-VERIFY` for uncertain chemistry facts.
- NaCl is a simplified unit cell teaching model, not a full crystallographic database entry.
