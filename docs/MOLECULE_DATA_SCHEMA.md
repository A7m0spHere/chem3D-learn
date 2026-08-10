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
  crystalTeaching?: CrystalTeaching;
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
- `crystalTeaching`: optional crystal-specific teaching modes, observation steps, counting copy, and void guidance.

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

## CrystalTeaching Void Guidance

Crystal modules that use the shared void-mode panel may override its generic hints:

```ts
type CrystalTeaching = {
  voidStages?: CrystalVoidStageTeaching[];
  voidGuidanceZh?: string[];
  // Other crystal teaching fields omitted here.
};
```

- `voidStages`: optional ordered interaction stages such as framework, visible voids, and filled sites.
- `voidGuidanceZh`: optional module-specific explanation shown below the stage controls. Use it when the shared “center marker” wording does not match the rendered model, for example a porous framework that visualizes pore volume and guest molecules.

## Data Rules

- Keep data small and hand-authored for core structures.
- Do not put public course steps, quiz state, scores, or long guided-observation copy in structure records. Viewer controls and concise information disclosures consume structural values directly.
- Extended frontend modules may exist without real 3D data; use placeholders honestly.
- Do not add dynamic SMILES parsing or RDKit runtime generation without explicit approval.
- Do not turn this into a large chemistry database.
- Use `TODO-CHEM-VERIFY` for uncertain chemistry facts.
- NaCl is a simplified teaching model, not a full crystallographic database entry.
