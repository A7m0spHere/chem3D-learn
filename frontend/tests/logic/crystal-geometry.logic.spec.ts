import { expect, test } from "@playwright/test";
import {
  createCubeEdges,
  createWurtziteCellEdges,
  tetrahedronEdgeIndices,
  tetrahedronNeighborPositions,
} from "../../src/components/three/znsPolytypeGeometry";
import {
  cellEdges,
  coordinationCluster,
  electronPoints,
  generateHexLayer,
  hcpLayerPatch,
  hexAngles,
  packingBOffset,
  packingLayerGap,
  sameLayerNeighbors,
  unitCellAtoms,
} from "../../src/components/three/zincMetalGeometry";

// ---------------------------------------------------------------------------
// T-004 回归：把 ZnSPolytypeCell / ZincMetalCell 里无 React/R3F 副作用的纯几何
// 计算下沉到 znsPolytypeGeometry.ts / zincMetalGeometry.ts 后，用表驱动断言锁定
// 这些函数的输入输出契约，防止后续重构悄悄改坐标。
//
// 只覆盖纯几何（坐标、边、位点计数与结构关系），不触碰 viewer 渲染 / 交互。
// ---------------------------------------------------------------------------

type Vec3 = [number, number, number];

function distance(a: Vec3, b: Vec3) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

// --- ZnS：立方晶胞棱 -------------------------------------------------------

test("createCubeEdges 生成立方体的 12 条棱且端点都在 ±half 顶点上", () => {
  const half = 0.5;
  const edges = createCubeEdges(half);

  expect(edges).toHaveLength(12);

  // 每条棱长度恰好等于边长 2*half（都是沿单轴的棱，不含面对角线/体对角线）。
  for (const [start, end] of edges) {
    expect(distance(start, end)).toBeCloseTo(2 * half, 6);
    for (const point of [start, end]) {
      for (const coord of point) {
        expect(Math.abs(Math.abs(coord) - half)).toBeCloseTo(0, 6);
      }
    }
  }

  // half 缩放线性传导：0.5 → 1.0 的棱长应翻倍。
  const bigger = createCubeEdges(1);
  expect(distance(bigger[0][0], bigger[0][1])).toBeCloseTo(2, 6);
});

// --- ZnS：纤锌矿六方棱柱棱 -------------------------------------------------

test("createWurtziteCellEdges 生成 12 条棱（4 底 + 4 顶 + 4 竖）且上下层等高对称", () => {
  const edges = createWurtziteCellEdges();
  expect(edges).toHaveLength(12);

  const halfHeight = Math.sqrt(8 / 3) / 2;
  const ys = edges.flatMap(([start, end]) => [start[1], end[1]]);
  // 所有顶点的 y 只可能是 ±halfHeight。
  for (const y of ys) {
    expect(Math.abs(Math.abs(y) - halfHeight)).toBeCloseTo(0, 6);
  }
  // 竖棱：起点在底、终点在顶、xz 相同。
  const verticalEdges = edges.filter(
    ([start, end]) => start[1] < 0 && end[1] > 0,
  );
  expect(verticalEdges).toHaveLength(4);
  for (const [start, end] of verticalEdges) {
    expect(start[0]).toBeCloseTo(end[0], 6);
    expect(start[2]).toBeCloseTo(end[2], 6);
  }
});

// --- ZnS：四面体配位 -------------------------------------------------------

test("tetrahedronNeighborPositions 是 4 个等距顶点、6 条棱两两相连", () => {
  expect(tetrahedronNeighborPositions).toHaveLength(4);
  expect(tetrahedronEdgeIndices).toHaveLength(6);

  // 4 个顶点到原点等距（正四面体的中心配位特征）。
  const centerDistances = tetrahedronNeighborPositions.map((p) =>
    distance(p, [0, 0, 0]),
  );
  for (const d of centerDistances) {
    expect(d).toBeCloseTo(centerDistances[0], 6);
  }

  // 6 条棱覆盖 C(4,2) 全部无序点对，无重复、索引合法。
  const pairKeys = new Set(
    tetrahedronEdgeIndices.map(([a, b]) => [a, b].sort((x, y) => x - y).join("-")),
  );
  expect(pairKeys.size).toBe(6);
  for (const [a, b] of tetrahedronEdgeIndices) {
    expect(a).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(4);
  }
});

// --- 锌金属：单晶胞位点 -----------------------------------------------------

test("unitCellAtoms 含 12 顶角 + 2 面心 + 3 内部，共 17 个 Zn 位点", () => {
  expect(unitCellAtoms).toHaveLength(17);

  const byKind = unitCellAtoms.reduce<Record<string, number>>((acc, atom) => {
    acc[atom.kind] = (acc[atom.kind] ?? 0) + 1;
    return acc;
  }, {});
  expect(byKind.corner).toBe(12);
  expect(byKind.face).toBe(2);
  expect(byKind.internal).toBe(3);

  // id 唯一。
  const ids = new Set(unitCellAtoms.map((atom) => atom.id));
  expect(ids.size).toBe(17);
});

// --- 锌金属：12 配位簇 ------------------------------------------------------

test("coordinationCluster 是 1 中心 + 12 最近邻（同层 6 / 上层 3 / 下层 3）", () => {
  expect(coordinationCluster).toHaveLength(13);

  const [center, ...neighbors] = coordinationCluster;
  expect(center.kind).toBe("center");
  expect(neighbors).toHaveLength(12);

  const byKind = neighbors.reduce<Record<string, number>>((acc, atom) => {
    acc[atom.kind] = (acc[atom.kind] ?? 0) + 1;
    return acc;
  }, {});
  expect(byKind["same-neighbor"]).toBe(6);
  expect(byKind["upper-neighbor"]).toBe(3);
  expect(byKind["lower-neighbor"]).toBe(3);

  // 同层 6 个最近邻共面（y = 0）且到中心等距。
  expect(sameLayerNeighbors).toHaveLength(6);
  const sameDistances = sameLayerNeighbors.map((atom) =>
    distance(atom.position, [0, 0, 0]),
  );
  for (const d of sameDistances) {
    expect(d).toBeCloseTo(sameDistances[0], 6);
    // 六个同层邻居都在 y=0 平面。
  }
  for (const atom of sameLayerNeighbors) {
    expect(atom.position[1]).toBeCloseTo(0, 6);
  }
});

// --- 锌金属：晶胞棱与电子点 -------------------------------------------------

test("cellEdges 生成六方棱柱 18 条棱，hexAngles 为 6 个 60° 均分角", () => {
  expect(hexAngles).toHaveLength(6);
  // 6 底 + 6 顶 + 6 竖 = 18。
  expect(cellEdges).toHaveLength(18);

  expect(electronPoints).toHaveLength(12);
});

// --- 锌金属：密排片生成 -----------------------------------------------------

test("generateHexLayer 半径 2 生成 19 个原子并带正确 layer 标记", () => {
  const layerA = generateHexLayer(2, 0, [0, 0], "A");
  // 轴向六边形 radius=2 的格点数：3r²+3r+1 = 19。
  expect(layerA).toHaveLength(19);
  for (const atom of layerA) {
    expect(atom.layer).toBe("A");
    expect(atom.position[1]).toBeCloseTo(0, 6);
  }

  // offset 平移整层：B 层带 packingBOffset。
  const layerB = generateHexLayer(2, 0.62, packingBOffset, "B");
  const originB = layerB.find((atom) => atom.id.endsWith("-0-0"));
  expect(originB?.position[0]).toBeCloseTo(packingBOffset[0], 6);
  expect(originB?.position[2]).toBeCloseTo(packingBOffset[1], 6);
});

test("hcpLayerPatch 是 A/B/A 三层共 57 个原子，A 层错位为 0、B 层错位为 packingBOffset", () => {
  expect(hcpLayerPatch).toHaveLength(57);

  const layers = hcpLayerPatch.reduce<Record<string, number>>((acc, atom) => {
    acc[atom.layer] = (acc[atom.layer] ?? 0) + 1;
    return acc;
  }, {});
  expect(layers.A).toBe(38);
  expect(layers.B).toBe(19);

  // 三层 y 值为 -gap / 0 / +gap。
  const ys = new Set(hcpLayerPatch.map((atom) => atom.position[1]));
  expect(ys.has(-packingLayerGap)).toBe(true);
  expect(ys.has(0)).toBe(true);
  expect(ys.has(packingLayerGap)).toBe(true);
});
