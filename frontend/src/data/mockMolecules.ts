import type { MoleculeRecord } from "@/types/molecule";
import ch4Data from "@/data/manual/ch4.json";
import bf3Data from "@/data/manual/bf3.json";
import co2Data from "@/data/manual/co2.json";
import h2oData from "@/data/manual/h2o.json";
import nh3Data from "@/data/manual/nh3.json";
import naclData from "@/data/manual/nacl.json";
import csclData from "@/data/manual/cscl.json";
import sodiumMetalData from "@/data/manual/sodium-metal.json";
import diamondData from "@/data/manual/diamond.json";
import zincMetalData from "@/data/manual/zinc-metal.json";
import octahedralVoidsData from "@/data/manual/octahedral-voids.json";
import tetrahedralVoidsData from "@/data/manual/tetrahedral-voids.json";
import graphiteData from "@/data/manual/graphite.json";

export type MockMoleculeRecord = MoleculeRecord & {
  geometryZh: string;
  categoryLabelZh: string;
  centralAtomZh: string;
  lonePairsTextZh: string;
  commonMistakeZh: string;
};

// ---------------------------------------------------------------------------
// Real 3D molecule data registry
//
// Maps molecule IDs to their hand-authored 3D data (atoms, bonds, lone pairs,
// angles, lesson steps, rendering config, etc.). Only molecules listed here
// render through the full 3D viewer; others fall back to the placeholder.
//
// To add a new molecule:
//   1. Create frontend/src/data/manual/<id>.json
//   2. Import it above and register it in this Map.
// ---------------------------------------------------------------------------
// JSON imports lose tuple types (position: [number,number,number] becomes
// number[]). The `as unknown as MoleculeRecord` bridge is intentional — it is
// the standard pattern for importing typed JSON in Vite/TS projects. Add
// runtime validation (e.g. Zod) if this grows beyond hand-authored data.
const realMoleculesById = new Map<string, MoleculeRecord>([
  ["ch4", ch4Data as unknown as MoleculeRecord],
  ["h2o", h2oData as unknown as MoleculeRecord],
  ["nh3", nh3Data as unknown as MoleculeRecord],
  ["co2", co2Data as unknown as MoleculeRecord],
  ["bf3", bf3Data as unknown as MoleculeRecord],
  ["nacl", naclData as unknown as MoleculeRecord],
  ["cscl", csclData as unknown as MoleculeRecord],
  ["sodium-metal", sodiumMetalData as unknown as MoleculeRecord],
  ["diamond", diamondData as unknown as MoleculeRecord],
  ["zinc-metal", zincMetalData as unknown as MoleculeRecord],
  ["octahedral-voids", octahedralVoidsData as unknown as MoleculeRecord],
  ["tetrahedral-voids", tetrahedralVoidsData as unknown as MoleculeRecord],
  ["graphite", graphiteData as unknown as MoleculeRecord],
]);

/** Returns the hand-authored 3D data for a molecule, or undefined. */
export function getRealMoleculeData(id: string): MoleculeRecord | undefined {
  return realMoleculesById.get(id);
}

/**
 * Merges mock metadata (geometryZh, commonMistakeZh, etc.) with real 3D
 * structural data. When real data is available, it takes precedence for all
 * structural fields; mock-only UI fields are preserved from the mock record.
 *
 * This avoids unsafe spread + double-cast patterns at the call site.
 */
export function mergeMoleculeData(
  mock: MockMoleculeRecord,
  real?: MoleculeRecord,
): MockMoleculeRecord {
  if (!real) return mock;

  return {
    // Mock-specific UI metadata — only the mock record carries these
    geometryZh: mock.geometryZh,
    categoryLabelZh: mock.categoryLabelZh,
    centralAtomZh: mock.centralAtomZh,
    lonePairsTextZh: mock.lonePairsTextZh,
    commonMistakeZh: mock.commonMistakeZh,

    // Structural fields from the hand-authored 3D data
    id: real.id,
    kind: real.kind,
    names: real.names,
    formula: real.formula,
    nameZh: real.nameZh,
    category: real.category,
    summaryZh: real.summaryZh,
    atoms: real.atoms,
    bonds: real.bonds,
    ions: real.ions,
    coordinationLinks: real.coordinationLinks,
    crystal: real.crystal,
    lonePairs: real.lonePairs,
    keyAngles: real.keyAngles,
    lessonSteps: real.lessonSteps,
    rendering: real.rendering,
    metadata: real.metadata,
    crystalTeaching: real.crystalTeaching,
  };
}

export const mockMolecules: MockMoleculeRecord[] = [
  {
    id: "ch4",
    formula: "CH4",
    nameZh: "甲烷",
    category: "vsepr",
    categoryLabelZh: "分子构型",
    geometryZh: "正四面体形",
    centralAtomZh: "C，四个成键电子对",
    lonePairsTextZh: "中心原子 0 对",
    summaryZh: "甲烷以碳原子为中心，四个氢原子指向空间四个方向，是理解正四面体构型的入门例子。",
    commonMistakeZh: "不要把四个 H 原子画成同一平面的正方形。正四面体是三维空间结构。",
    atoms: [
      { id: "c1", element: "C", label: "C", position: [0, 0, 0], color: "#1F2933" },
      { id: "h1", element: "H", label: "H", position: [1, 1, 1], color: "#FFFFFF" },
      { id: "h2", element: "H", label: "H", position: [-1, -1, 1], color: "#FFFFFF" },
      { id: "h3", element: "H", label: "H", position: [-1, 1, -1], color: "#FFFFFF" },
      { id: "h4", element: "H", label: "H", position: [1, -1, -1], color: "#FFFFFF" },
    ],
    bonds: [
      { id: "c1-h1", atomIds: ["c1", "h1"], kind: "single", order: 1 },
      { id: "c1-h2", atomIds: ["c1", "h2"], kind: "single", order: 1 },
      { id: "c1-h3", atomIds: ["c1", "h3"], kind: "single", order: 1 },
      { id: "c1-h4", atomIds: ["c1", "h4"], kind: "single", order: 1 },
    ],
    lonePairs: [],
    keyAngles: [
      {
        id: "h-c-h",
        atomIds: ["h1", "c1", "h2"],
        valueDeg: 109.5,
        label: "约 109.5°",
        descriptionZh: "四个 C-H 键尽量远离，形成正四面体构型。",
      },
    ],
    lessonSteps: [
      {
        id: "center",
        titleZh: "找到中心原子",
        bodyZh: "先确认中心碳原子，再观察四个 C-H 键从中心伸向不同方向。",
        focusAtomIds: ["c1"],
      },
      {
        id: "shape",
        titleZh: "观察空间构型",
        bodyZh: "四个氢原子不在同一平面内，而是形成正四面体的四个顶点。",
        focusBondIds: ["c1-h1", "c1-h2", "c1-h3", "c1-h4"],
      },
      {
        id: "angle",
        titleZh: "理解键角",
        bodyZh: "显示键角后，重点记住正四面体中 H-C-H 键角约为 109.5°。",
        focusAngleIds: ["h-c-h"],
        showAngles: true,
      },
    ],
  },
  {
    id: "nh3",
    formula: "NH3",
    nameZh: "氨气",
    category: "vsepr",
    categoryLabelZh: "键角与孤电子对",
    geometryZh: "三角锥形",
    centralAtomZh: "N，三对成键电子对",
    lonePairsTextZh: "中心原子 1 对",
    summaryZh: "氨分子含有一对孤电子对，原子排列呈三角锥形。",
    commonMistakeZh: "电子对空间排布近似四面体，但分子构型只看原子核位置，所以是三角锥形。",
    atoms: [
      { id: "n1", element: "N", label: "N", position: [0, 0, 0], color: "#2563EB" },
      { id: "h1", element: "H", label: "H", position: [1, -0.8, 0.5], color: "#FFFFFF" },
      { id: "h2", element: "H", label: "H", position: [-1, -0.8, 0.5], color: "#FFFFFF" },
      { id: "h3", element: "H", label: "H", position: [0, -0.8, -1], color: "#FFFFFF" },
    ],
    bonds: [
      { id: "n1-h1", atomIds: ["n1", "h1"], kind: "single", order: 1 },
      { id: "n1-h2", atomIds: ["n1", "h2"], kind: "single", order: 1 },
      { id: "n1-h3", atomIds: ["n1", "h3"], kind: "single", order: 1 },
    ],
    lonePairs: [
      { id: "lp1", atomId: "n1", position: [0, 1, 0], label: "孤电子对", visibleByDefault: true },
    ],
    keyAngles: [
      {
        id: "h-n-h",
        atomIds: ["h1", "n1", "h2"],
        valueDeg: 107,
        label: "约 107°",
        descriptionZh: "孤电子对排斥较强，使 H-N-H 键角小于 109.5°。",
      },
    ],
    lessonSteps: [
      {
        id: "lone-pair",
        titleZh: "识别孤电子对",
        bodyZh: "氮原子上有一对孤电子对，它会影响周围 N-H 键的方向。",
        showLonePairs: true,
      },
      {
        id: "shape",
        titleZh: "判断构型",
        bodyZh: "只看原子核位置，三个氢原子围绕氮原子形成三角锥形。",
      },
      {
        id: "angle",
        titleZh: "比较键角",
        bodyZh: "与甲烷相比，氨的键角略小，原因是孤电子对排斥更强。",
        showAngles: true,
        focusAngleIds: ["h-n-h"],
      },
    ],
  },
  {
    id: "h2o",
    formula: "H2O",
    nameZh: "水",
    category: "vsepr",
    categoryLabelZh: "键角与孤电子对",
    geometryZh: "V 形",
    centralAtomZh: "O，两对成键电子对",
    lonePairsTextZh: "中心原子 2 对",
    summaryZh: "水分子中氧原子有两对孤电子对，因此两个 O-H 键形成 V 形结构。",
    commonMistakeZh: "不要把 H-O-H 误判为 180° 直线形。孤电子对会显著压缩键角。",
    atoms: [
      { id: "o1", element: "O", label: "O", position: [0, 0, 0], color: "#DC2626" },
      { id: "h1", element: "H", label: "H", position: [-0.9, -0.7, 0], color: "#FFFFFF" },
      { id: "h2", element: "H", label: "H", position: [0.9, -0.7, 0], color: "#FFFFFF" },
    ],
    bonds: [
      { id: "o1-h1", atomIds: ["o1", "h1"], kind: "single", order: 1 },
      { id: "o1-h2", atomIds: ["o1", "h2"], kind: "single", order: 1 },
    ],
    lonePairs: [
      { id: "lp1", atomId: "o1", position: [-0.45, 0.9, 0], label: "孤电子对", visibleByDefault: true },
      { id: "lp2", atomId: "o1", position: [0.45, 0.9, 0], label: "孤电子对", visibleByDefault: true },
    ],
    keyAngles: [
      {
        id: "h-o-h",
        atomIds: ["h1", "o1", "h2"],
        valueDeg: 104.5,
        label: "约 104.5°",
        descriptionZh: "两对孤电子对排斥更强，使 H-O-H 键角继续减小。",
      },
    ],
    lessonSteps: [
      {
        id: "lone-pairs",
        titleZh: "看到两对孤电子对",
        bodyZh: "氧原子上有两对孤电子对，它们占据空间并影响 O-H 键方向。",
        showLonePairs: true,
      },
      {
        id: "shape",
        titleZh: "判断 V 形",
        bodyZh: "分子构型只看原子位置，两个氢原子和氧原子形成 V 形。",
      },
      {
        id: "angle",
        titleZh: "观察键角收缩",
        bodyZh: "水的键角比氨更小，高中阶段重点理解孤电子对数量增加带来的影响。",
        showAngles: true,
        focusAngleIds: ["h-o-h"],
      },
    ],
  },
  {
    id: "co2",
    formula: "CO2",
    nameZh: "二氧化碳",
    category: "vsepr",
    categoryLabelZh: "分子构型",
    geometryZh: "直线形",
    centralAtomZh: "C，两组电子区域",
    lonePairsTextZh: "中心原子 0 对",
    summaryZh: "二氧化碳中两个 C=O 双键沿同一直线排列，整体呈直线形。",
    commonMistakeZh: "高中阶段先抓住直线形和 180° 键角，不需要展开过深的成键细节。",
    atoms: [
      { id: "c1", element: "C", label: "C", position: [0, 0, 0], color: "#1F2933" },
      { id: "o1", element: "O", label: "O", position: [-1.3, 0, 0], color: "#DC2626" },
      { id: "o2", element: "O", label: "O", position: [1.3, 0, 0], color: "#DC2626" },
    ],
    bonds: [
      { id: "c1-o1", atomIds: ["c1", "o1"], kind: "double", order: 2 },
      { id: "c1-o2", atomIds: ["c1", "o2"], kind: "double", order: 2 },
    ],
    lonePairs: [],
    keyAngles: [
      {
        id: "o-c-o",
        atomIds: ["o1", "c1", "o2"],
        valueDeg: 180,
        label: "180°",
        descriptionZh: "两个 C=O 双键方向相反，形成直线形结构。",
      },
    ],
    lessonSteps: [
      {
        id: "center",
        titleZh: "确定中心碳原子",
        bodyZh: "碳原子在中间，两侧各连接一个氧原子。",
      },
      {
        id: "line",
        titleZh: "观察直线形",
        bodyZh: "两个氧原子位于碳原子两侧，三个原子在一条直线上。",
      },
      {
        id: "angle",
        titleZh: "显示 180° 键角",
        bodyZh: "显示键角时，重点观察 O-C-O 为 180°。",
        showAngles: true,
        focusAngleIds: ["o-c-o"],
      },
    ],
  },
  {
    id: "bf3",
    formula: "BF3",
    nameZh: "三氟化硼",
    category: "vsepr",
    categoryLabelZh: "分子构型",
    geometryZh: "平面三角形",
    centralAtomZh: "B，三组电子区域",
    lonePairsTextZh: "中心原子 0 对",
    summaryZh: "三氟化硼中三个 B-F 键位于同一平面，形成平面三角形结构。",
    commonMistakeZh: "注意中心硼原子周围是三个方向，不是四面体结构。TODO-CHEM-VERIFY：缺电子表述后续复核。",
    atoms: [
      { id: "b1", element: "B", label: "B", position: [0, 0, 0], color: "#0D9488" },
      { id: "f1", element: "F", label: "F", position: [0, 1.25, 0], color: "#10B981" },
      { id: "f2", element: "F", label: "F", position: [-1.1, -0.65, 0], color: "#10B981" },
      { id: "f3", element: "F", label: "F", position: [1.1, -0.65, 0], color: "#10B981" },
    ],
    bonds: [
      { id: "b1-f1", atomIds: ["b1", "f1"], kind: "single", order: 1 },
      { id: "b1-f2", atomIds: ["b1", "f2"], kind: "single", order: 1 },
      { id: "b1-f3", atomIds: ["b1", "f3"], kind: "single", order: 1 },
    ],
    lonePairs: [],
    keyAngles: [
      {
        id: "f-b-f",
        atomIds: ["f2", "b1", "f3"],
        valueDeg: 120,
        label: "约 120°",
        descriptionZh: "三个 B-F 键在同一平面内，相邻键夹角约为 120°。",
      },
    ],
    lessonSteps: [
      {
        id: "plane",
        titleZh: "确认同一平面",
        bodyZh: "三个氟原子围绕中心硼原子展开，整体位于同一平面。",
      },
      {
        id: "shape",
        titleZh: "判断平面三角形",
        bodyZh: "三个方向均匀分布，形成平面三角形结构。",
      },
      {
        id: "angle",
        titleZh: "观察 120°",
        bodyZh: "显示键角后，观察相邻 B-F 键夹角约为 120°。",
        showAngles: true,
        focusAngleIds: ["f-b-f"],
      },
    ],
  },
  {
    id: "nacl",
    formula: "NaCl",
    nameZh: "NaCl 型晶体结构（氯化钠晶胞）",
    category: "crystal",
    categoryLabelZh: "晶体结构",
    geometryZh: "面心立方 / 六配位",
    centralAtomZh: "Cl- 面心立方，Na+ 填入八面体空隙",
    lonePairsTextZh: "不适用（离子晶体）",
    summaryZh: "NaCl 是典型离子晶体。Cl- 构成面心立方排列，Na+ 位于棱心和体心，一个晶胞中两类离子数目比为 1 : 1。",
    commonMistakeZh: "NaCl 晶体不是由独立 NaCl 分子构成；图中辅助线只表示最近邻配位关系，不表示共价键。",
    atoms: [
      { id: "na1", element: "Na+", label: "Na+", position: [0, 0, 0], color: "#2A9D8F" },
      { id: "cl1", element: "Cl-", label: "Cl-", position: [1.2, 0, 0], color: "#64748B" },
      { id: "cl2", element: "Cl-", label: "Cl-", position: [-1.2, 0, 0], color: "#64748B" },
      { id: "cl3", element: "Cl-", label: "Cl-", position: [0, 1.2, 0], color: "#64748B" },
      { id: "cl4", element: "Cl-", label: "Cl-", position: [0, -1.2, 0], color: "#64748B" },
      { id: "cl5", element: "Cl-", label: "Cl-", position: [0, 0, 1.2], color: "#64748B" },
      { id: "cl6", element: "Cl-", label: "Cl-", position: [0, 0, -1.2], color: "#64748B" },
    ],
    bonds: [
      { id: "na1-cl1", atomIds: ["na1", "cl1"], kind: "ionic-neighbor" },
      { id: "na1-cl2", atomIds: ["na1", "cl2"], kind: "ionic-neighbor" },
      { id: "na1-cl3", atomIds: ["na1", "cl3"], kind: "ionic-neighbor" },
      { id: "na1-cl4", atomIds: ["na1", "cl4"], kind: "ionic-neighbor" },
      { id: "na1-cl5", atomIds: ["na1", "cl5"], kind: "ionic-neighbor" },
      { id: "na1-cl6", atomIds: ["na1", "cl6"], kind: "ionic-neighbor" },
    ],
    lonePairs: [],
    keyAngles: [
      {
        id: "cl-na-cl",
        atomIds: ["cl1", "na1", "cl3"],
        valueDeg: 90,
        label: "约 90°",
        descriptionZh: "简化配位示意中，相邻方向近似垂直。",
      },
    ],
    lessonSteps: [
      {
        id: "center",
        titleZh: "观察晶胞组成",
        bodyZh: "先看 Cl- 的顶点和面心位置，再看 Na+ 的棱心和体心位置。",
      },
      {
        id: "coordination",
        titleZh: "理解六配位",
        bodyZh: "体心 Na+ 周围有 6 个最近邻 Cl-；反过来，每个 Cl- 周围也有 6 个 Na+。",
      },
      {
        id: "limit",
        titleZh: "完成粒子计数",
        bodyZh: "Cl-：8 × 1/8 + 6 × 1/2 = 4；Na+：12 × 1/4 + 1 = 4。",
        showAngles: true,
        focusAngleIds: ["cl-na-cl"],
      },
    ],
  },
  {
    id: "cscl",
    formula: "CsCl",
    nameZh: "CsCl 型晶体结构",
    category: "crystal",
    categoryLabelZh: "晶体结构",
    geometryZh: "简单立方 / 八配位",
    centralAtomZh: "Cl- 顶点，Cs+ 体心",
    lonePairsTextZh: "不适用（离子晶体）",
    summaryZh: "CsCl 常用画法是 Cl- 位于立方体顶点，Cs+ 位于体心，一个晶胞中两类离子数目比为 1 : 1。",
    commonMistakeZh: "CsCl 不能简单当作普通 BCC 金属晶体；顶点和体心是不同离子。NaCl 是 6 : 6 配位，CsCl 是 8 : 8 配位。",
    atoms: [
      { id: "cs-body", element: "Cs+", label: "Cs+", position: [0, 0, 0], color: "#A16207" },
      { id: "cl-corner-1", element: "Cl-", label: "Cl-", position: [-0.5, -0.5, -0.5], color: "#10B981" },
      { id: "cl-corner-2", element: "Cl-", label: "Cl-", position: [0.5, -0.5, -0.5], color: "#10B981" },
      { id: "cl-corner-3", element: "Cl-", label: "Cl-", position: [-0.5, 0.5, -0.5], color: "#10B981" },
      { id: "cl-corner-4", element: "Cl-", label: "Cl-", position: [0.5, 0.5, -0.5], color: "#10B981" },
      { id: "cl-corner-5", element: "Cl-", label: "Cl-", position: [-0.5, -0.5, 0.5], color: "#10B981" },
      { id: "cl-corner-6", element: "Cl-", label: "Cl-", position: [0.5, -0.5, 0.5], color: "#10B981" },
      { id: "cl-corner-7", element: "Cl-", label: "Cl-", position: [-0.5, 0.5, 0.5], color: "#10B981" },
      { id: "cl-corner-8", element: "Cl-", label: "Cl-", position: [0.5, 0.5, 0.5], color: "#10B981" },
    ],
    bonds: [],
    lonePairs: [],
    keyAngles: [],
    lessonSteps: [
      {
        id: "cell",
        titleZh: "观察 CsCl 晶胞",
        bodyZh: "Cl- 位于立方体 8 个顶点，Cs+ 位于体心。",
      },
      {
        id: "coordination",
        titleZh: "理解八配位",
        bodyZh: "体心 Cs+ 与 8 个顶点 Cl- 最近邻，形成 8 : 8 配位。",
      },
      {
        id: "counting",
        titleZh: "完成晶胞计数",
        bodyZh: "Cl-：8 × 1/8 = 1；Cs+：1，所以化学式为 CsCl。",
      },
    ],
  },
  {
    id: "sodium-metal",
    formula: "Na",
    nameZh: "金属钠晶体结构",
    category: "crystal",
    categoryLabelZh: "晶体结构",
    geometryZh: "体心立方 / BCC",
    centralAtomZh: "Na 顶点与 Na 体心",
    lonePairsTextZh: "不适用（金属晶体）",
    summaryZh: "金属钠晶体可用体心立方结构表示。Na 原子位于 8 个顶点和 1 个体心，一个晶胞中实际含有 2 个 Na 原子。",
    commonMistakeZh: "金属钠不是阴阳离子交替排列的离子晶体；最近邻示意线也不是普通化学键。",
    atoms: [
      { id: "na-body", element: "Na", label: "Na", position: [0, 0, 0], color: "#D6D3C6" },
      { id: "na-corner-1", element: "Na", label: "Na", position: [-0.5, -0.5, -0.5], color: "#D6D3C6" },
      { id: "na-corner-2", element: "Na", label: "Na", position: [0.5, -0.5, -0.5], color: "#D6D3C6" },
      { id: "na-corner-3", element: "Na", label: "Na", position: [-0.5, 0.5, -0.5], color: "#D6D3C6" },
      { id: "na-corner-4", element: "Na", label: "Na", position: [0.5, 0.5, -0.5], color: "#D6D3C6" },
      { id: "na-corner-5", element: "Na", label: "Na", position: [-0.5, -0.5, 0.5], color: "#D6D3C6" },
      { id: "na-corner-6", element: "Na", label: "Na", position: [0.5, -0.5, 0.5], color: "#D6D3C6" },
      { id: "na-corner-7", element: "Na", label: "Na", position: [-0.5, 0.5, 0.5], color: "#D6D3C6" },
      { id: "na-corner-8", element: "Na", label: "Na", position: [0.5, 0.5, 0.5], color: "#D6D3C6" },
    ],
    bonds: [],
    lonePairs: [],
    keyAngles: [],
    lessonSteps: [
      {
        id: "cell",
        titleZh: "观察 BCC 晶胞",
        bodyZh: "金属钠晶体可用体心立方结构表示：Na 原子位于 8 个顶点和 1 个体心。",
      },
      {
        id: "coordination",
        titleZh: "理解最近邻关系",
        bodyZh: "体心 Na 周围最近的 Na 原子有 8 个，可按最近邻关系理解为 8 配位。",
      },
      {
        id: "counting",
        titleZh: "完成晶胞计数",
        bodyZh: "顶点 Na：8 × 1/8 = 1；体心 Na：1，所以一个 BCC 晶胞中实际含有 2 个 Na 原子。",
      },
    ],
  },
  {
    id: "diamond",
    formula: "C",
    nameZh: "金刚石晶体结构",
    category: "crystal",
    categoryLabelZh: "晶体结构",
    geometryZh: "金刚石型 / 四配位",
    centralAtomZh: "C，四个最近邻 C",
    lonePairsTextZh: "不适用（共价晶体）",
    summaryZh: "金刚石是典型的共价晶体，也可称为原子晶体。每个 C 原子与周围 4 个 C 原子形成共价键，构成连续的三维空间网状结构。",
    commonMistakeZh: "金刚石不是分子晶体，也不是离子晶体或金属晶体；晶胞中实际含有 8 个 C 原子，不代表存在独立的 8 原子分子。",
    atoms: [
      { id: "c-inner-1", element: "C", label: "C", position: [-0.25, -0.25, -0.25], color: "#374151" },
      { id: "c-corner-1", element: "C", label: "C", position: [-0.5, -0.5, -0.5], color: "#374151" },
      { id: "c-face-x-neg", element: "C", label: "C", position: [-0.5, 0, 0], color: "#374151" },
      { id: "c-face-y-neg", element: "C", label: "C", position: [0, -0.5, 0], color: "#374151" },
      { id: "c-face-z-neg", element: "C", label: "C", position: [0, 0, -0.5], color: "#374151" },
    ],
    bonds: [
      { id: "c-inner-1-c-corner-1", atomIds: ["c-inner-1", "c-corner-1"], kind: "single", order: 1 },
      { id: "c-inner-1-c-face-x-neg", atomIds: ["c-inner-1", "c-face-x-neg"], kind: "single", order: 1 },
      { id: "c-inner-1-c-face-y-neg", atomIds: ["c-inner-1", "c-face-y-neg"], kind: "single", order: 1 },
      { id: "c-inner-1-c-face-z-neg", atomIds: ["c-inner-1", "c-face-z-neg"], kind: "single", order: 1 },
    ],
    lonePairs: [],
    keyAngles: [
      {
        id: "diamond-tetrahedral-angle",
        atomIds: ["c-corner-1", "c-inner-1", "c-face-x-neg"],
        valueDeg: 109.5,
        label: "约 109.5°",
        descriptionZh: "金刚石中 C-C-C 键角约为 109.5°。",
      },
    ],
    lessonSteps: [
      {
        id: "cell",
        titleZh: "观察金刚石晶胞",
        bodyZh: "常规晶胞中可以看到顶点 C、面心 C 和晶胞内部 C。",
      },
      {
        id: "coordination",
        titleZh: "理解四面体配位",
        bodyZh: "每个 C 原子与周围 4 个 C 原子形成共价键，空间构型接近正四面体。",
      },
      {
        id: "counting",
        titleZh: "完成晶胞计数",
        bodyZh: "顶点、面心和内部 C 需要按共享关系计数，一个常规晶胞中实际含有 8 个 C 原子。",
      },
    ],
  },
];

export const mockMoleculeById = new Map(mockMolecules.map((molecule) => [molecule.id, molecule]));

export function getMockMolecule(id: string): MockMoleculeRecord | undefined {
  return mockMoleculeById.get(id);
}
