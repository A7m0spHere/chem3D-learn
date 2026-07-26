// ---------------------------------------------------------------------------
// 锌金属（六方最密堆积）viewer 的纯几何计算。
//
// 与 closePackingGeometry.ts / mof5Geometry.ts 同款：这里只放无 React / R3F
// 副作用的坐标、边、原子位点生成，方便单测覆盖，也让 ZincMetalCell.tsx 专注
// 渲染与交互。颜色、标签文案、相机预设等「表现层」仍留在 viewer。
// ---------------------------------------------------------------------------

export type ZnSiteKind =
  | "corner"
  | "face"
  | "internal"
  | "center"
  | "same-neighbor"
  | "upper-neighbor"
  | "lower-neighbor";

export type ZnVisualAtom = {
  id: string;
  label: string;
  position: [number, number, number];
  radius: number;
  kind: ZnSiteKind;
  layer?: "A-top" | "B" | "A-bottom";
};

export type HcpLayer = "A" | "B";

export type HcpPackingAtom = {
  id: string;
  position: [number, number, number];
  layer: HcpLayer;
};

// 单晶胞（六方棱柱）尺寸。
export const hexRadius = 0.95;
export const cellHalfHeight = 0.75;
export const hexAngles = [0, 60, 120, 180, 240, 300].map(
  (degree) => (degree * Math.PI) / 180,
);

// 堆积模型（多层密排片）参数。
export const packingNearest = 0.52;
export const packingRadius = 0.24;
export const packingLayerGap = 0.62;
export const packingBasisA: [number, number] = [packingNearest, 0];
export const packingBasisB: [number, number] = [
  packingNearest / 2,
  (Math.sqrt(3) * packingNearest) / 2,
];
// B 层相对 A 层在基面内的错位（1/3 对角线），实现 ABAB 堆叠。
export const packingBOffset: [number, number] = [
  (packingBasisA[0] + packingBasisB[0]) / 3,
  (packingBasisA[1] + packingBasisB[1]) / 3,
];

export const bottomCorners: ZnVisualAtom[] = hexAngles.map((angle, index) => ({
  id: `unit-bottom-corner-${index + 1}`,
  label: "顶角 Zn",
  position: [hexRadius * Math.cos(angle), -cellHalfHeight, hexRadius * Math.sin(angle)],
  radius: 0.105,
  kind: "corner",
  layer: "A-bottom",
}));

export const topCorners: ZnVisualAtom[] = hexAngles.map((angle, index) => ({
  id: `unit-top-corner-${index + 1}`,
  label: "顶角 Zn",
  position: [hexRadius * Math.cos(angle), cellHalfHeight, hexRadius * Math.sin(angle)],
  radius: 0.105,
  kind: "corner",
  layer: "A-top",
}));

export const unitCellAtoms: ZnVisualAtom[] = [
  ...bottomCorners,
  ...topCorners,
  {
    id: "unit-bottom-face",
    label: "面心 Zn",
    position: [0, -cellHalfHeight, 0],
    radius: 0.12,
    kind: "face",
    layer: "A-bottom",
  },
  {
    id: "unit-top-face",
    label: "面心 Zn",
    position: [0, cellHalfHeight, 0],
    radius: 0.12,
    kind: "face",
    layer: "A-top",
  },
  {
    id: "unit-inner-1",
    label: "内部 Zn",
    position: [0.475, 0, 0.274],
    radius: 0.12,
    kind: "internal",
    layer: "B",
  },
  {
    id: "unit-inner-2",
    label: "内部 Zn",
    position: [-0.475, 0, 0.274],
    radius: 0.12,
    kind: "internal",
    layer: "B",
  },
  {
    id: "unit-inner-3",
    label: "内部 Zn",
    position: [0, 0, -0.548],
    radius: 0.12,
    kind: "internal",
    layer: "B",
  },
];

export const sameLayerNeighbors: ZnVisualAtom[] = hexAngles.map((angle, index) => ({
  id: `cluster-same-${index + 1}`,
  label: "同层最近邻",
  position: [0.82 * Math.cos(angle), 0, 0.82 * Math.sin(angle)],
  radius: 0.115,
  kind: "same-neighbor",
}));

export const coordinationCluster: ZnVisualAtom[] = [
  {
    id: "cluster-center",
    label: "中心 Zn",
    position: [0, 0, 0],
    radius: 0.13,
    kind: "center",
  },
  ...sameLayerNeighbors,
  {
    id: "cluster-upper-1",
    label: "上层最近邻",
    position: [0.41, 0.67, 0.237],
    radius: 0.115,
    kind: "upper-neighbor",
  },
  {
    id: "cluster-upper-2",
    label: "上层最近邻",
    position: [-0.41, 0.67, 0.237],
    radius: 0.115,
    kind: "upper-neighbor",
  },
  {
    id: "cluster-upper-3",
    label: "上层最近邻",
    position: [0, 0.67, -0.474],
    radius: 0.115,
    kind: "upper-neighbor",
  },
  {
    id: "cluster-lower-1",
    label: "下层最近邻",
    position: [0.41, -0.67, -0.237],
    radius: 0.115,
    kind: "lower-neighbor",
  },
  {
    id: "cluster-lower-2",
    label: "下层最近邻",
    position: [-0.41, -0.67, -0.237],
    radius: 0.115,
    kind: "lower-neighbor",
  },
  {
    id: "cluster-lower-3",
    label: "下层最近邻",
    position: [0, -0.67, 0.474],
    radius: 0.115,
    kind: "lower-neighbor",
  },
];

export const cellEdges: Array<[[number, number, number], [number, number, number]]> = [
  ...hexAngles.map((_, index): [[number, number, number], [number, number, number]] => {
    const nextIndex = (index + 1) % hexAngles.length;
    return [bottomCorners[index].position, bottomCorners[nextIndex].position];
  }),
  ...hexAngles.map((_, index): [[number, number, number], [number, number, number]] => {
    const nextIndex = (index + 1) % hexAngles.length;
    return [topCorners[index].position, topCorners[nextIndex].position];
  }),
  ...hexAngles.map((_, index): [[number, number, number], [number, number, number]] => [
    bottomCorners[index].position,
    topCorners[index].position,
  ]),
];

// 金属键视图里漂浮的自由电子示意点（固定散布，动效仅在 viewer 里叠加抖动）。
export const electronPoints: [number, number, number][] = [
  [-0.6, -0.42, -0.26],
  [-0.34, 0.24, 0.36],
  [0.1, -0.24, 0.58],
  [0.52, 0.18, -0.34],
  [-0.66, 0.46, 0.02],
  [0.62, -0.5, 0.12],
  [0.0, 0.5, -0.58],
  [-0.18, -0.54, -0.5],
  [0.34, 0.38, 0.48],
  [-0.44, -0.28, 0.46],
  [0.68, 0.42, -0.04],
  [-0.52, 0.04, -0.52],
];

/** 生成一层轴向六边形密排片：以 (q, r) 遍历六边形范围，映射到 xz 基面。 */
export function generateHexLayer(
  radius: number,
  y: number,
  offset: [number, number] = [0, 0],
  layer: HcpLayer,
): HcpPackingAtom[] {
  const atoms: HcpPackingAtom[] = [];

  for (let q = -radius; q <= radius; q += 1) {
    const rMin = Math.max(-radius, -q - radius);
    const rMax = Math.min(radius, -q + radius);

    for (let r = rMin; r <= rMax; r += 1) {
      const x = q * packingBasisA[0] + r * packingBasisB[0] + offset[0];
      const z = q * packingBasisA[1] + r * packingBasisB[1] + offset[1];

      atoms.push({
        id: `packing-${layer}-${y}-${q}-${r}`,
        layer,
        position: [x, y, z],
      });
    }
  }

  return atoms;
}

// ABAB 三层密排片（A / B / A），演示六方最密堆积的层序。
export const hcpLayerPatch: HcpPackingAtom[] = [
  ...generateHexLayer(2, -packingLayerGap, [0, 0], "A"),
  ...generateHexLayer(2, 0, packingBOffset, "B"),
  ...generateHexLayer(2, packingLayerGap, [0, 0], "A"),
];
