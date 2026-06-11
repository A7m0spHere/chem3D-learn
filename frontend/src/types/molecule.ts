export type MoleculeCategory = "vsepr" | "crystal";
export type MoleculeKind = "molecule" | "crystal";

export type MoleculeNames = {
  zh: string;
  en?: string;
};

export type MoleculeRendering = {
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  atomScale?: number;
  bondRadius?: number;
  angleRadius?: number;
  showAtomLabels?: boolean;
};

export type MoleculeMetadata = {
  level?: "high-school";
  source?: string;
  notesZh?: string;
  verified?: boolean;
};

export type Atom = {
  id: string;
  element: string;
  label: string;
  position: [number, number, number];
  radius?: number;
  color?: string;
};

export type Bond = {
  id: string;
  atomIds: [string, string];
  order?: 1 | 2 | 3;
  kind?: "single" | "double" | "triple" | "ionic-neighbor" | "visual-guide";
};

export type LonePair = {
  id: string;
  atomId: string;
  position: [number, number, number];
  label?: string;
  visibleByDefault?: boolean;
};

export type AngleSpec = {
  id: string;
  atomIds: [string, string, string];
  valueDeg: number;
  label: string;
  descriptionZh: string;
};

export type LessonStep = {
  id: string;
  titleZh: string;
  bodyZh: string;
  focusAtomIds?: string[];
  focusBondIds?: string[];
  focusAngleIds?: string[];
  showLonePairs?: boolean;
  showAngles?: boolean;
};

export type MoleculeRecord = {
  id: string;
  kind?: MoleculeKind;
  names?: MoleculeNames;
  formula: string;
  nameZh: string;
  category: MoleculeCategory;
  summaryZh: string;
  atoms: Atom[];
  bonds: Bond[];
  lonePairs: LonePair[];
  keyAngles: AngleSpec[];
  lessonSteps: LessonStep[];
  rendering?: MoleculeRendering;
  metadata?: MoleculeMetadata;
};
