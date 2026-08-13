# MOLECULE_DATA_SCHEMA.md

## Purpose

This document defines the hand-authored structure data used by Chem3D Learn. The schema is for concise high-school teaching content, not a full chemistry database.

Frontend hand-authored molecule data currently lives in:
- `frontend/src/data/manual`

Shared TypeScript types live in:
- `frontend/src/types`

Frontend manual data is the current source of truth. A backend may later reuse, mirror, or map this data, but backend integration should not silently replace the frontend data model without an explicit plan.

Protected manual IDs:
- `ch4`
- `nh3`
- `h2o`
- `co2`
- `bf3`
- `nacl`

Do not overwrite protected records without explicit instruction.

## MoleculeRecord

Each structure record should follow the current frontend type shape:

```ts
type MoleculeRecord = {
  id: string;
  kind?: "molecule" | "crystal";
  names?: {
    zh: string;
    en?: string;
  };
  formula: string;
  nameZh: string;
  category: "vsepr" | "crystal";
  summaryZh: string;
  atoms: Atom[];
  bonds: Bond[];
  lonePairs: LonePair[];
  keyAngles: AngleSpec[];
  rendering?: MoleculeRendering;
  metadata?: MoleculeMetadata;
  crystal?: CrystalInfo;
  crystalControls?: CrystalControls;
};
```

Field semantics:
- `id`: stable lowercase ID used by routing, registry lookup, and selection.
- `kind`: optional broad render kind, usually `molecule` or `crystal`.
- `names`: optional localized names; `names.zh` may duplicate `nameZh` for richer display.
- `formula`: display formula, such as `CH4`.
- `nameZh`: Chinese display name.
- `category`: `vsepr` for molecule structures, `crystal` for simplified crystal structures.
- `summaryZh`: one or two Chinese sentences for quick orientation.
- `atoms`: all visible atoms or ions.
- `bonds`: visible bonds or crystal neighbor connections.
- `lonePairs`: visible lone-pair markers, empty when not applicable.
- `keyAngles`: teaching-focused angle annotations.
- `rendering`: optional viewer tuning for camera, atom scale, bond radius, and labels.
- `metadata`: optional source and verification metadata.
- `crystal`: concise crystal identity, lattice / model, coordination, unit-cell counts, and composition explanation consumed by the default-collapsed CrystalInfo.
- `crystalControls`: minimal runtime controls. Each view mode or void stage contains only a stable ID and short Chinese label.

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
- `kind`: visual interpretation. `ionic-neighbor` or `visual-guide` may be used for simplified NaCl teaching models.

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

## MoleculeRendering

```ts
type MoleculeRendering = {
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  atomScale?: number;
  bondRadius?: number;
  angleRadius?: number;
  showAtomLabels?: boolean;
};
```

Field semantics:
- `cameraPosition`: default camera position for this structure.
- `cameraFov`: default camera field of view.
- `atomScale`: visual atom scale multiplier.
- `bondRadius`: default rendered bond radius.
- `angleRadius`: angle annotation radius.
- `showAtomLabels`: preferred default for atom label visibility; runtime UI may override it.

## MoleculeMetadata

```ts
type MoleculeMetadata = {
  level?: "high-school";
  source?: string;
  notesZh?: string;
  verified?: boolean;
};
```

Field semantics:
- `level`: intended learning level.
- `source`: short source or authoring note.
- `notesZh`: Chinese notes for limitations, simplifications, or teaching intent.
- `verified`: whether chemistry content has been manually reviewed.

## CrystalInfo and CrystalControls

Public crystal records use concise facts and short runtime controls:

```ts
type CrystalInfo = {
  typeZh: string;
  latticeZh: string;
  coordination: string;
  unitCellCount: Record<string, number>;
  formulaExplanationZh: string;
};

type CrystalControls = {
  viewModes: Array<{ id: CrystalViewMode; labelZh: string }>;
  voidStages?: Array<{ id: CrystalVoidStage; labelZh: string }>;
};
```

- `CrystalInfo` is the only public crystal fact source for the shared disclosure. Keep its copy concise and chemically reviewed.
- `viewModes` and `voidStages` only select real Viewer branches. Titles and summaries should come from the short label plus `summaryZh`, not from duplicated teaching paragraphs.
- Void stages such as framework, visible voids, and filled sites belong to first-level interaction when the active mode needs them.
- Do not add `titleZh`, `bodyZh`, observation guides, common mistakes, teaching tips, or course steps back into `CrystalControls`.
- Do not add top-level `titleZh`, `subtitleZh`, `descriptionZh`, or the removed `crystalTeaching` compatibility object back into manual records. Use `nameZh`, `summaryZh`, `crystal`, and `crystalControls` as the single concise sources.

## Data Rules

- Keep data small and hand-authored for core structures.
- Do not put public course steps, quiz state, scores, or long guided-observation copy in structure records. Viewer controls and concise information disclosures consume structural values directly.
- Extended frontend modules may exist without real 3D data; use placeholders honestly.
- Do not add dynamic SMILES parsing or RDKit runtime generation without explicit approval.
- Do not turn this into a large chemistry database.
- Use `TODO-CHEM-VERIFY` for uncertain chemistry facts.
- NaCl is a simplified teaching model, not a full crystallographic database entry.
