/** @typedef {import("./types/molecule.d.ts").MoleculeRecord} MoleculeRecord */
/** @typedef {import("./types/molecule.d.ts").MoleculeSummary} MoleculeSummary */

const commonMetadata = {
  level: "high-school",
  source: "hand-authored teaching model",
  verified: true
};

/** @type {MoleculeRecord[]} */
export const molecules = [
  {
    id: "ch4",
    kind: "molecule",
    formula: "CH4",
    names: { zh: "甲烷", en: "Methane" },
    nameZh: "甲烷",
    category: "vsepr",
    summaryZh:
      "甲烷分子以碳原子为中心，四个氢原子指向空间四个方向。它是理解正四面体构型和约 109.5° 键角的核心例子。",
    atoms: [
      { id: "c1", element: "C", label: "C", position: [0, 0, 0], radius: 0.34, color: "#1F2933" },
      { id: "h1", element: "H", label: "H", position: [1.08, 1.08, 1.08], radius: 0.22, color: "#F8FAFC" },
      { id: "h2", element: "H", label: "H", position: [-1.08, -1.08, 1.08], radius: 0.22, color: "#F8FAFC" },
      { id: "h3", element: "H", label: "H", position: [-1.08, 1.08, -1.08], radius: 0.22, color: "#F8FAFC" },
      { id: "h4", element: "H", label: "H", position: [1.08, -1.08, -1.08], radius: 0.22, color: "#F8FAFC" }
    ],
    bonds: [
      { id: "c1-h1", atomIds: ["c1", "h1"], order: 1, kind: "single" },
      { id: "c1-h2", atomIds: ["c1", "h2"], order: 1, kind: "single" },
      { id: "c1-h3", atomIds: ["c1", "h3"], order: 1, kind: "single" },
      { id: "c1-h4", atomIds: ["c1", "h4"], order: 1, kind: "single" }
    ],
    lonePairs: [],
    keyAngles: [
      {
        id: "h1-c1-h2",
        atomIds: ["h1", "c1", "h2"],
        valueDeg: 109.5,
        label: "约 109.5°",
        descriptionZh: "四个 C-H 键尽量远离，形成正四面体构型，任意两个 C-H 键之间的夹角约为 109.5°。"
      }
    ],
    lessonSteps: [
      {
        id: "center-atom",
        titleZh: "识别中心原子",
        bodyZh: "先找到位于中心的碳原子。甲烷中碳原子连接四个氢原子，是观察空间构型的起点。",
        focusAtomIds: ["c1"]
      },
      {
        id: "tetrahedral-shape",
        titleZh: "观察四面体结构",
        bodyZh: "四个氢原子不是排在同一平面上，而是分布在空间四个方向，整体呈正四面体结构。",
        focusAtomIds: ["h1", "h2", "h3", "h4"],
        focusBondIds: ["c1-h1", "c1-h2", "c1-h3", "c1-h4"]
      },
      {
        id: "bond-angle",
        titleZh: "观察键角",
        bodyZh: "显示 H-C-H 键角后，可以看到甲烷的典型键角约为 109.5°，这是正四面体结构的重要特征。",
        focusAngleIds: ["h1-c1-h2"],
        showAngles: true
      }
    ],
    rendering: {
      cameraPosition: [3.6, 3, 4.2],
      cameraFov: 42,
      atomScale: 1,
      bondRadius: 0.045,
      angleRadius: 0.82,
      showAtomLabels: true
    },
    metadata: {
      ...commonMetadata,
      notesZh: "CH4 正四面体教学模型，坐标用于课堂可视化，不作为实验键长数据。"
    }
  },
  {
    id: "nh3",
    kind: "molecule",
    formula: "NH3",
    names: { zh: "氨气", en: "Ammonia" },
    nameZh: "氨气",
    category: "vsepr",
    summaryZh:
      "氨气分子以氮原子为中心，三个氢原子位于下方近似三角形位置，氮原子上方有一对孤电子对。",
    atoms: [
      { id: "n1", element: "N", label: "N", position: [0, 0, 0], radius: 0.34, color: "#2563EB" },
      { id: "h1", element: "H", label: "H", position: [1.1, -0.44, 0], radius: 0.22, color: "#F8FAFC" },
      { id: "h2", element: "H", label: "H", position: [-0.55, -0.44, 0.95], radius: 0.22, color: "#F8FAFC" },
      { id: "h3", element: "H", label: "H", position: [-0.55, -0.44, -0.95], radius: 0.22, color: "#F8FAFC" }
    ],
    bonds: [
      { id: "n1-h1", atomIds: ["n1", "h1"], order: 1, kind: "single" },
      { id: "n1-h2", atomIds: ["n1", "h2"], order: 1, kind: "single" },
      { id: "n1-h3", atomIds: ["n1", "h3"], order: 1, kind: "single" }
    ],
    lonePairs: [
      { id: "n1-lp1", atomId: "n1", position: [0, 1.05, 0], label: "孤电子对", visibleByDefault: true }
    ],
    keyAngles: [
      {
        id: "h1-n1-h2",
        atomIds: ["h1", "n1", "h2"],
        valueDeg: 107,
        label: "约 107°",
        descriptionZh: "氮原子上的孤电子对排斥较强，使 H-N-H 键角小于正四面体角 109.5°。"
      }
    ],
    lessonSteps: [
      {
        id: "lone-pair",
        titleZh: "识别孤电子对",
        bodyZh: "氮原子上方有一对孤电子对。它参与电子对空间排布，但不是一个原子。",
        focusAtomIds: ["n1"],
        showLonePairs: true
      },
      {
        id: "trigonal-pyramidal",
        titleZh: "判断三角锥形",
        bodyZh: "分子构型只看原子核位置。三个氢原子围绕氮原子形成三角锥形，而不是正四面体形。",
        focusAtomIds: ["h1", "h2", "h3"],
        focusBondIds: ["n1-h1", "n1-h2", "n1-h3"],
        showLonePairs: true
      },
      {
        id: "bond-angle",
        titleZh: "观察键角压缩",
        bodyZh: "显示 H-N-H 键角后，可以看到氨气的典型键角约为 107°，略小于正四面体角 109.5°。",
        focusAngleIds: ["h1-n1-h2"],
        showLonePairs: true,
        showAngles: true
      }
    ],
    rendering: {
      cameraPosition: [3.3, 2.8, 4.3],
      cameraFov: 42,
      atomScale: 1,
      bondRadius: 0.045,
      angleRadius: 0.78,
      showAtomLabels: true
    },
    metadata: {
      ...commonMetadata,
      notesZh: "NH3 三角锥形教学模型，坐标用于课堂可视化，不作为实验键长数据。"
    }
  },
  {
    id: "h2o",
    kind: "molecule",
    formula: "H2O",
    names: { zh: "水", en: "Water" },
    nameZh: "水",
    category: "vsepr",
    summaryZh:
      "水分子以氧原子为中心，两个氢原子形成 V 形/折线形结构。氧原子上有两对孤电子对。",
    atoms: [
      { id: "o1", element: "O", label: "O", position: [0, 0, 0], radius: 0.35, color: "#DC2626" },
      { id: "h1", element: "H", label: "H", position: [-0.9, -0.7, 0], radius: 0.22, color: "#F8FAFC" },
      { id: "h2", element: "H", label: "H", position: [0.9, -0.7, 0], radius: 0.22, color: "#F8FAFC" }
    ],
    bonds: [
      { id: "o1-h1", atomIds: ["o1", "h1"], order: 1, kind: "single" },
      { id: "o1-h2", atomIds: ["o1", "h2"], order: 1, kind: "single" }
    ],
    lonePairs: [
      { id: "o1-lp1", atomId: "o1", position: [-0.46, 0.82, -0.44], label: "孤电子对", visibleByDefault: true },
      { id: "o1-lp2", atomId: "o1", position: [0.46, 0.82, 0.44], label: "孤电子对", visibleByDefault: true }
    ],
    keyAngles: [
      {
        id: "h1-o1-h2",
        atomIds: ["h1", "o1", "h2"],
        valueDeg: 104.5,
        label: "约 104.5°",
        descriptionZh: "氧原子上有两对孤电子对，排斥更强，使 H-O-H 键角比 NH3 的 H-N-H 键角更小。"
      }
    ],
    lessonSteps: [
      {
        id: "two-lone-pairs",
        titleZh: "识别两对孤电子对",
        bodyZh: "氧原子上有两对孤电子对。它们影响电子对空间排布，但不计入分子构型中的原子位置。",
        focusAtomIds: ["o1"],
        showLonePairs: true
      },
      {
        id: "bent-shape",
        titleZh: "判断 V 形结构",
        bodyZh: "只看原子核位置时，两个氢原子和氧原子形成 V 形/折线形结构，而不是直线形。",
        focusAtomIds: ["h1", "h2"],
        focusBondIds: ["o1-h1", "o1-h2"],
        showLonePairs: true
      },
      {
        id: "bond-angle",
        titleZh: "观察键角进一步减小",
        bodyZh: "显示 H-O-H 键角后，可以看到水分子的典型键角约为 104.5°，比 NH3 的键角更小。",
        focusAngleIds: ["h1-o1-h2"],
        showLonePairs: true,
        showAngles: true
      }
    ],
    rendering: {
      cameraPosition: [3.2, 2.6, 4.1],
      cameraFov: 42,
      atomScale: 1,
      bondRadius: 0.045,
      angleRadius: 0.72,
      showAtomLabels: true
    },
    metadata: {
      ...commonMetadata,
      notesZh: "H2O V 形/折线形教学模型，坐标用于课堂可视化，不作为实验键长数据。"
    }
  },
  {
    id: "co2",
    kind: "molecule",
    formula: "CO2",
    names: { zh: "二氧化碳", en: "Carbon dioxide" },
    nameZh: "二氧化碳",
    category: "vsepr",
    summaryZh:
      "二氧化碳以碳原子为中心，两个氧原子位于相反方向，整体呈直线形，O-C-O 键角为 180°。",
    atoms: [
      { id: "c1", element: "C", label: "C", position: [0, 0, 0], radius: 0.34, color: "#1F2933" },
      { id: "o1", element: "O", label: "O", position: [-1.28, 0, 0], radius: 0.35, color: "#DC2626" },
      { id: "o2", element: "O", label: "O", position: [1.28, 0, 0], radius: 0.35, color: "#DC2626" }
    ],
    bonds: [
      { id: "c1-o1", atomIds: ["c1", "o1"], order: 2, kind: "double" },
      { id: "c1-o2", atomIds: ["c1", "o2"], order: 2, kind: "double" }
    ],
    lonePairs: [],
    keyAngles: [
      {
        id: "o1-c1-o2",
        atomIds: ["o1", "c1", "o2"],
        valueDeg: 180,
        label: "180°",
        descriptionZh: "中心碳原子周围有两个电子域，彼此尽量远离，所以 O-C-O 呈直线形。"
      }
    ],
    lessonSteps: [
      {
        id: "center-atom",
        titleZh: "识别中心碳原子",
        bodyZh: "二氧化碳中碳原子位于中心，两侧各连接一个氧原子。",
        focusAtomIds: ["c1"]
      },
      {
        id: "linear-shape",
        titleZh: "判断直线形",
        bodyZh: "两个 C=O 双键方向相反，两个氧原子与碳原子排成一条直线。",
        focusAtomIds: ["o1", "c1", "o2"],
        focusBondIds: ["c1-o1", "c1-o2"]
      },
      {
        id: "bond-angle",
        titleZh: "观察 180° 键角",
        bodyZh: "显示 O-C-O 键角后，可以看到二氧化碳的键角为 180°，这是直线形分子的关键特征。",
        focusAngleIds: ["o1-c1-o2"],
        showAngles: true
      }
    ],
    rendering: {
      cameraPosition: [0, 2.2, 5.2],
      cameraFov: 42,
      atomScale: 1,
      bondRadius: 0.045,
      angleRadius: 0.86,
      showAtomLabels: true
    },
    metadata: {
      ...commonMetadata,
      notesZh: "CO2 直线形教学模型，坐标用于课堂可视化，不作为实验键长数据。"
    }
  },
  {
    id: "bf3",
    kind: "molecule",
    formula: "BF3",
    names: { zh: "三氟化硼", en: "Boron trifluoride" },
    nameZh: "三氟化硼",
    category: "vsepr",
    summaryZh:
      "三氟化硼以硼原子为中心，三个氟原子位于同一平面，形成平面三角形，F-B-F 键角约为 120°。",
    atoms: [
      { id: "b1", element: "B", label: "B", position: [0, 0, 0], radius: 0.32, color: "#B45309" },
      { id: "f1", element: "F", label: "F", position: [1.35, 0, 0], radius: 0.33, color: "#22C55E" },
      { id: "f2", element: "F", label: "F", position: [-0.68, 1.17, 0], radius: 0.33, color: "#22C55E" },
      { id: "f3", element: "F", label: "F", position: [-0.68, -1.17, 0], radius: 0.33, color: "#22C55E" }
    ],
    bonds: [
      { id: "b1-f1", atomIds: ["b1", "f1"], order: 1, kind: "single" },
      { id: "b1-f2", atomIds: ["b1", "f2"], order: 1, kind: "single" },
      { id: "b1-f3", atomIds: ["b1", "f3"], order: 1, kind: "single" }
    ],
    lonePairs: [],
    keyAngles: [
      {
        id: "f1-b1-f2",
        atomIds: ["f1", "b1", "f2"],
        valueDeg: 120,
        label: "约 120°",
        descriptionZh: "三个 B-F 键在同一平面内尽量远离，形成平面三角形，键角约为 120°。"
      }
    ],
    lessonSteps: [
      {
        id: "center-atom",
        titleZh: "识别中心硼原子",
        bodyZh: "硼原子位于中心，连接三个氟原子，是判断分子形状的起点。",
        focusAtomIds: ["b1"]
      },
      {
        id: "trigonal-planar",
        titleZh: "观察平面三角形",
        bodyZh: "三个氟原子分布在同一平面内，围绕中心硼原子形成平面三角形。",
        focusAtomIds: ["f1", "f2", "f3"],
        focusBondIds: ["b1-f1", "b1-f2", "b1-f3"]
      },
      {
        id: "bond-angle",
        titleZh: "观察 120° 键角",
        bodyZh: "显示 F-B-F 键角后，可以看到平面三角形结构的典型键角约为 120°。",
        focusAngleIds: ["f1-b1-f2"],
        showAngles: true
      }
    ],
    rendering: {
      cameraPosition: [0, 0, 4.8],
      cameraFov: 42,
      atomScale: 1,
      bondRadius: 0.045,
      angleRadius: 0.76,
      showAtomLabels: true
    },
    metadata: {
      ...commonMetadata,
      notesZh: "BF3 平面三角形教学模型，坐标用于课堂可视化，不作为实验键长数据。"
    }
  },
  {
    id: "nacl",
    kind: "crystal",
    formula: "NaCl",
    names: { zh: "氯化钠晶胞", en: "Sodium chloride unit cell" },
    nameZh: "氯化钠晶胞",
    category: "crystal",
    summaryZh:
      "氯化钠晶体可用简化晶胞模型观察 Na+ 与 Cl- 的交替排列。这里突出离子在三维空间中的规则重复关系。",
    atoms: [
      { id: "cl-000", element: "Cl-", label: "Cl-", position: [-1, -1, -1], radius: 0.34, color: "#22C55E" },
      { id: "cl-001", element: "Cl-", label: "Cl-", position: [-1, -1, 1], radius: 0.34, color: "#22C55E" },
      { id: "cl-010", element: "Cl-", label: "Cl-", position: [-1, 1, -1], radius: 0.34, color: "#22C55E" },
      { id: "cl-011", element: "Cl-", label: "Cl-", position: [-1, 1, 1], radius: 0.34, color: "#22C55E" },
      { id: "cl-100", element: "Cl-", label: "Cl-", position: [1, -1, -1], radius: 0.34, color: "#22C55E" },
      { id: "cl-101", element: "Cl-", label: "Cl-", position: [1, -1, 1], radius: 0.34, color: "#22C55E" },
      { id: "cl-110", element: "Cl-", label: "Cl-", position: [1, 1, -1], radius: 0.34, color: "#22C55E" },
      { id: "cl-111", element: "Cl-", label: "Cl-", position: [1, 1, 1], radius: 0.34, color: "#22C55E" },
      { id: "na-center", element: "Na+", label: "Na+", position: [0, 0, 0], radius: 0.25, color: "#F59E0B" },
      { id: "na-x1", element: "Na+", label: "Na+", position: [1, 0, 0], radius: 0.25, color: "#F59E0B" },
      { id: "na-x0", element: "Na+", label: "Na+", position: [-1, 0, 0], radius: 0.25, color: "#F59E0B" },
      { id: "na-y1", element: "Na+", label: "Na+", position: [0, 1, 0], radius: 0.25, color: "#F59E0B" },
      { id: "na-y0", element: "Na+", label: "Na+", position: [0, -1, 0], radius: 0.25, color: "#F59E0B" },
      { id: "na-z1", element: "Na+", label: "Na+", position: [0, 0, 1], radius: 0.25, color: "#F59E0B" },
      { id: "na-z0", element: "Na+", label: "Na+", position: [0, 0, -1], radius: 0.25, color: "#F59E0B" }
    ],
    bonds: [
      { id: "na-center-na-x1", atomIds: ["na-center", "na-x1"], kind: "visual-guide" },
      { id: "na-center-na-x0", atomIds: ["na-center", "na-x0"], kind: "visual-guide" },
      { id: "na-center-na-y1", atomIds: ["na-center", "na-y1"], kind: "visual-guide" },
      { id: "na-center-na-y0", atomIds: ["na-center", "na-y0"], kind: "visual-guide" },
      { id: "na-center-na-z1", atomIds: ["na-center", "na-z1"], kind: "visual-guide" },
      { id: "na-center-na-z0", atomIds: ["na-center", "na-z0"], kind: "visual-guide" }
    ],
    lonePairs: [],
    keyAngles: [
      {
        id: "na-x0-center-na-x1",
        atomIds: ["na-x0", "na-center", "na-x1"],
        valueDeg: 180,
        label: "180°",
        descriptionZh: "沿同一轴方向观察，两个相邻离子方向相反，帮助学生理解晶体结构的三维重复。"
      },
      {
        id: "na-x1-center-na-y1",
        atomIds: ["na-x1", "na-center", "na-y1"],
        valueDeg: 90,
        label: "90°",
        descriptionZh: "沿相互垂直的方向观察，相邻方向夹角为 90°，体现立方晶胞的空间关系。"
      }
    ],
    lessonSteps: [
      {
        id: "unit-cell",
        titleZh: "先看立方晶胞",
        bodyZh: "把模型看作一个立方体单元，离子在空间中按规则位置重复排列。",
        focusAtomIds: ["cl-000", "cl-111", "na-center"]
      },
      {
        id: "alternating-ions",
        titleZh: "观察正负离子交替",
        bodyZh: "Na+ 与 Cl- 在三维方向上交替出现。这个模型用于理解空间排列，不用于计算真实晶体参数。",
        focusAtomIds: ["na-center", "na-x1", "na-y1", "na-z1", "cl-111"]
      },
      {
        id: "three-dimensional",
        titleZh: "理解三维重复",
        bodyZh: "显示角度后，可以观察 90° 和 180° 的空间方向关系，帮助建立晶胞的三维印象。",
        focusAngleIds: ["na-x1-center-na-y1", "na-x0-center-na-x1"],
        showAngles: true
      }
    ],
    rendering: {
      cameraPosition: [4.4, 3.4, 5],
      cameraFov: 42,
      atomScale: 1,
      bondRadius: 0.025,
      angleRadius: 0.72,
      showAtomLabels: true
    },
    metadata: {
      ...commonMetadata,
      notesZh: "NaCl 简化晶胞教学模型，用于展示空间交替排列，不作为完整晶体学数据库记录。"
    }
  }
];

/** @type {Set<string>} */
const protectedIds = new Set(["ch4", "nh3", "h2o", "co2", "bf3", "nacl"]);

export function listSupportedIds() {
  return [...protectedIds];
}

/**
 * @returns {MoleculeSummary[]}
 */
export function getMoleculeSummaries() {
  return molecules.map((molecule) => ({
    id: molecule.id,
    kind: molecule.kind,
    formula: molecule.formula,
    nameZh: molecule.nameZh,
    category: molecule.category,
    summaryZh: molecule.summaryZh,
    lessonStepCount: molecule.lessonSteps.length,
    atomCount: molecule.atoms.length,
    bondCount: molecule.bonds.length,
    hasLonePairs: molecule.lonePairs.length > 0,
    keyAngleLabels: molecule.keyAngles.map((angle) => angle.label)
  }));
}

/**
 * @param {string} id
 * @returns {MoleculeRecord | undefined}
 */
export function findMoleculeById(id) {
  return molecules.find((molecule) => molecule.id === id.toLowerCase());
}
