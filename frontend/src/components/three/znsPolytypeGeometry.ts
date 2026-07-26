import type { Vec3 } from "@/components/three/StickCylinder";

// ---------------------------------------------------------------------------
// ZnS 多晶型（闪锌矿 / 纤锌矿）viewer 的纯几何计算。
//
// 与 closePackingGeometry.ts / mof5Geometry.ts 同款：只做无 React / R3F 副作用
// 的坐标与棱构造，方便单测、复用，并给 ZnSPolytypeCell.tsx 瘦身。教学文案、
// 相机预设、视图分场景逻辑仍留在 viewer 里。
// ---------------------------------------------------------------------------

/**
 * 立方晶胞（闪锌矿常规立方胞）的 12 条棱。
 * `half` 为立方体半边长；返回沿 x/y/z 三个方向、每方向 4 条共 12 条棱。
 */
export function createCubeEdges(half: number): Array<[Vec3, Vec3]> {
  const edges: Array<[Vec3, Vec3]> = [];
  const signs = [-half, half];
  for (const y of signs) {
    for (const z of signs) edges.push([[-half, y, z], [half, y, z]]);
  }
  for (const x of signs) {
    for (const z of signs) edges.push([[x, -half, z], [x, half, z]]);
  }
  for (const x of signs) {
    for (const y of signs) edges.push([[x, y, -half], [x, y, half]]);
  }
  return edges;
}

/**
 * 纤锌矿六方晶胞的棱：由底面 4 个顶点沿 y 拉伸出顶面，连底面环、顶面环与竖棱，
 * 共 12 条。半高取理想 hcp 的 √(8/3)/2。
 */
export function createWurtziteCellEdges(): Array<[Vec3, Vec3]> {
  const halfHeight = Math.sqrt(8 / 3) / 2;
  const bottom: Vec3[] = [
    [-0.25, -halfHeight, -Math.sqrt(3) / 4],
    [0.75, -halfHeight, -Math.sqrt(3) / 4],
    [0.25, -halfHeight, Math.sqrt(3) / 4],
    [-0.75, -halfHeight, Math.sqrt(3) / 4],
  ];
  const top = bottom.map(([x, , z]): Vec3 => [x, halfHeight, z]);
  const edges: Array<[Vec3, Vec3]> = [];
  for (let index = 0; index < bottom.length; index += 1) {
    const next = (index + 1) % bottom.length;
    edges.push([bottom[index], bottom[next]], [top[index], top[next]], [bottom[index], top[index]]);
  }
  return edges;
}

/** 四面体配位的 4 个近邻方向（正四面体顶点，中心在原点）。 */
export const tetrahedronNeighborPositions: Vec3[] = [
  [0.52, 0.52, 0.52],
  [0.52, -0.52, -0.52],
  [-0.52, 0.52, -0.52],
  [-0.52, -0.52, 0.52],
];

/** 正四面体 4 顶点两两相连的 6 条棱（索引对，指向 tetrahedronNeighborPositions）。 */
export const tetrahedronEdgeIndices: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
];
