export type BuilderElement = "C" | "H" | "O" | "N" | "F" | "Cl" | "Br" | "I";
export type BuilderBondOrder = 1 | 2 | 3;
export type BuilderVec3 = [number, number, number];

export type OrganicBuilderNavigationState = {
  detachAtomId?: string;
  sourceModuleId?: string;
  entryTransition?: "viewer-expand";
};

export type BuilderAtom = {
  id: string;
  element: BuilderElement;
  label?: string;
  position: BuilderVec3;
  radius?: number;
  color?: string;
};

export type BuilderBond = {
  id: string;
  atomIds: [string, string];
  order: BuilderBondOrder;
};

export type BuilderMolecule = {
  id: string;
  atoms: BuilderAtom[];
  bonds: BuilderBond[];
};

export type BuilderSeed = BuilderMolecule & {
  moduleId?: string;
  nameZh: string;
  formula: string;
  noteZh?: string;
};

export type BuilderIssue = {
  atomId?: string;
  kind: "under-valence" | "over-valence" | "disconnected" | "empty";
  messageZh: string;
};

export type ValidationResult = {
  isComplete: boolean;
  fragmentCount: number;
  completeAtomCount: number;
  totalAtomCount: number;
  issues: BuilderIssue[];
};

export type BuilderBondAngleMatch = {
  id: string;
  atomIds: [string, string, string];
  centerAtomId: string;
  centerElement: BuilderElement;
  valueDeg: number;
  label: string;
  geometryZh: string;
  hybridization: "sp" | "sp²" | "sp³";
  descriptionZh: string;
};

export type KnownMolecule = {
  id: string;
  nameZh: string;
  nameEn: string;
  categoryZh: string;
  summaryZh: string;
  molecule: BuilderMolecule;
};

export type BuilderFragmentId =
  | "methyl"
  | "hydroxyl"
  | "amino"
  | "aldehyde"
  | "carbonyl"
  | "carboxyl"
  | "vinyl"
  | "ethynyl"
  | "methoxy"
  | "cyano";

export type BuilderFragmentTemplate = {
  id: BuilderFragmentId;
  label: string;
  nameZh: string;
  atoms: Array<Omit<BuilderAtom, "id"> & { templateId: string }>;
  bonds: Array<{ atomIds: [string, string]; order: BuilderBondOrder }>;
  attachmentAtomId: string;
};
