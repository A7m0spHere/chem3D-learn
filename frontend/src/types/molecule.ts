export type MoleculeCategory = "vsepr" | "crystal";
export type MoleculeKind = "molecule" | "crystal";
export type CrystalViewMode =
  | "pressure"
  | "layer"
  | "inPlaneBond"
  | "interlayerForce"
  | "piElectron"
  | "cell"
  | "coordination"
  | "coordinationAnion"
  | "counting"
  | "voids"
  | "comparison"
  | "metallicBond"
  | "covalentNetwork"
  | "polyhedron"
  | "aSiteCoordination"
  | "bSiteCoordination"
  | "originShift"
  | "hcpStacking"
  | "fccStacking";
export type CrystalModelStyle = "ballStick" | "packing";
export type CrystalSiteType = "corner" | "face-center" | "edge-center" | "body-center";
export type CrystalVoidStage = "framework" | "voids" | "filled";
export type OrganicCoplanarMode =
  | "overview"
  | "benzenePlane"
  | "sp3Carbon"
  | "sp2Fragment"
  | "spFragment"
  | "amineGroup"
  | "rotation";
export type EthylenePlanarMode =
  | "overview"
  | "plane"
  | "angle"
  | "piBond"
  | "rotationLock";
export type BenzenePlanarMode =
  | "overview"
  | "plane"
  | "angle"
  | "diagonal"
  | "piBond";
export type AcetyleneLinearMode =
  | "overview"
  | "line"
  | "angle"
  | "piBond"
  | "tripleBond";
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

export type CrystalControlViewMode = {
  id: CrystalViewMode;
  labelZh: string;
};

export type CrystalControlVoidStage = {
  id: CrystalVoidStage;
  labelZh: string;
};

export type CrystalControls = {
  viewModes: CrystalControlViewMode[];
  voidStages?: CrystalControlVoidStage[];
};

export type Atom = {
  id: string;
  element: string;
  label: string;
  position: [number, number, number];
  radius?: number;
  color?: string;
  siteType?: CrystalSiteType;
};

export type Bond = {
  id: string;
  atomIds: [string, string];
  order?: 1 | 2 | 3;
  kind?: "single" | "double" | "triple" | "ionic-neighbor" | "visual-guide";
};

export type CoordinationLink = {
  id: string;
  atomIds: [string, string];
  labelZh?: string;
};

export type InterlayerForce = {
  id: string;
  start: [number, number, number];
  end: [number, number, number];
  kind?: "vanDerWaals";
  labelZh?: string;
};

export type CrystalInfo = {
  typeZh: string;
  latticeZh: string;
  coordination: string;
  unitCellCount: Record<string, number>;
  formulaExplanationZh: string;
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

export type MoleculeRecord = {
  id: string;
  kind?: MoleculeKind;
  names?: MoleculeNames;
  formula: string;
  nameZh: string;
  category: MoleculeCategory;
  summaryZh: string;
  atoms: Atom[];
  ions?: Atom[];
  coordinationLinks?: CoordinationLink[];
  interlayerForces?: InterlayerForce[];
  crystal?: CrystalInfo;
  crystalControls?: CrystalControls;
  bonds: Bond[];
  lonePairs: LonePair[];
  keyAngles: AngleSpec[];
  rendering?: MoleculeRendering;
  metadata?: MoleculeMetadata;
};
