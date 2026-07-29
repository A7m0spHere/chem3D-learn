import { expect, test } from "@playwright/test";
import {
  NACL_LATTICE_PARAMETER,
  NACL_NEAREST_DISTANCE,
  buildNaClCoordinationDisplayCluster,
  centerFractional,
  fractionalToCartesian,
  generateNaClCellFrameSegments,
  generateNaClDisplayInstances,
  generateNaClPeriodicSites,
  getNaClCoordinationImages,
  naclConventionalBasis,
  wrapPeriodicFractional,
  type CrystalCellFrameMode,
  type NaClDisplaySelection,
  type NaClPeriodicSite,
  type Vec3,
} from "../../src/components/three/naclPeriodicGeometry";

// ---------------------------------------------------------------------------
// T-028A / T-028A.1：NaCl 周期超晶胞纯函数内核的契约测试。
//
// 只覆盖纯几何（位点计数、坐标、配位镜像、周期去重），不触碰 viewer 渲染 / 交互。
// 沿用 crystal-geometry.logic.spec.ts 的表驱动断言范式。
//
// T-028A.1 修正：
//   - 居中改为晶胞体积居中（size/2），不再要求 canonical 位点平均值为零；
//   - 邻居字段拆分为 cellOffset（局部晶胞偏移）与 periodicImageShift（超晶胞周期平移）；
//   - 新增「canonical 位点 + periodicImageShift 重建镜像 cartesian」契约。
// ---------------------------------------------------------------------------

type Vec3Tuple = [number, number, number];

function distance(a: Vec3Tuple, b: Vec3Tuple) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function vec3Equal(a: Vec3, b: Vec3, digits = 6) {
  return (
    a.length === 3 &&
    b.length === 3 &&
    Math.abs(a[0] - b[0]) < 10 ** -digits &&
    Math.abs(a[1] - b[1]) < 10 ** -digits &&
    Math.abs(a[2] - b[2]) < 10 ** -digits
  );
}

function vec3Round(v: Vec3, digits = 6): Vec3 {
  return [Number(v[0].toFixed(digits)), Number(v[1].toFixed(digits)), Number(v[2].toFixed(digits))];
}

function countByElement(sites: NaClPeriodicSite[]): Record<string, number> {
  return sites.reduce<Record<string, number>>((acc, s) => {
    acc[s.element] = (acc[s.element] ?? 0) + 1;
    return acc;
  }, {});
}

// === 基元定义 ===========================================================

test("naclConventionalBasis：Cl⁻ 与 Na⁺ 子格子各 4 个位点，Na⁺ = Cl⁻ + (½,0,0) 平移（mod 1）", () => {
  expect(naclConventionalBasis.chloride).toHaveLength(4);
  expect(naclConventionalBasis.sodium).toHaveLength(4);

  // Na⁺ 子格子 = 每个 Cl⁻ 位点 + (1/2,0,0) 后 mod 1 回到常规晶胞内。
  const mod1 = (v: Vec3): Vec3 => [
    ((v[0] % 1) + 1) % 1,
    ((v[1] % 1) + 1) % 1,
    ((v[2] % 1) + 1) % 1,
  ];
  const coordKey = (v: Vec3) => v.map((c) => c.toFixed(6)).join(",");
  const shiftedClKeys = naclConventionalBasis.chloride
    .map((b): Vec3 => mod1([b[0] + 1 / 2, b[1], b[2]]))
    .map(coordKey)
    .sort();
  const naKeys = naclConventionalBasis.sodium.map(coordKey).sort();
  expect(shiftedClKeys).toEqual(naKeys);

  // 所有基元位点分量恒为 0 或 1/2（在常规立方晶胞内）。
  for (const b of [...naclConventionalBasis.chloride, ...naclConventionalBasis.sodium]) {
    for (const c of b) {
      expect(Math.abs(c) < 1e-9 || Math.abs(c - 1 / 2) < 1e-9).toBe(true);
    }
  }
});

// === 周期位点计数与组成 ================================================

test("generateNaClPeriodicSites：N=1 → 8 位点（4 Cl⁻ + 4 Na⁺）", () => {
  const sites = generateNaClPeriodicSites(1);
  expect(sites).toHaveLength(8);
  const counts = countByElement(sites);
  expect(counts["Cl-"]).toBe(4);
  expect(counts["Na+"]).toBe(4);
});

test("generateNaClPeriodicSites：N=2 → 64 位点（32 Cl⁻ + 32 Na⁺）", () => {
  const sites = generateNaClPeriodicSites(2);
  expect(sites).toHaveLength(64);
  const counts = countByElement(sites);
  expect(counts["Cl-"]).toBe(32);
  expect(counts["Na+"]).toBe(32);
});

test("generateNaClPeriodicSites：N=3 → 216 位点（108 Cl⁻ + 108 Na⁺）", () => {
  const sites = generateNaClPeriodicSites(3);
  expect(sites).toHaveLength(216);
  const counts = countByElement(sites);
  expect(counts["Cl-"]).toBe(108);
  expect(counts["Na+"]).toBe(108);
});

test("generateNaClPeriodicSites：Na⁺:Cl⁻ 始终为 1:1，总数 = 8·N³", () => {
  for (const size of [1, 2, 3, 4]) {
    const sites = generateNaClPeriodicSites(size);
    expect(sites).toHaveLength(8 * size ** 3);
    const counts = countByElement(sites);
    expect(counts["Na+"]).toBe(counts["Cl-"]);
  }
});

test("generateNaClPeriodicSites：非法 size 抛错", () => {
  expect(() => generateNaClPeriodicSites(0)).toThrow();
  expect(() => generateNaClPeriodicSites(1.5)).toThrow();
  expect(() => generateNaClPeriodicSites(-2)).toThrow();
});

// === id 与位点唯一性 ===================================================

test("generateNaClPeriodicSites：所有 id 唯一", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const ids = new Set(sites.map((s) => s.id));
    expect(ids.size).toBe(sites.length);
  }
});

test("generateNaClPeriodicSites：所有 (cell + basisIndex) 组合唯一", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const keys = new Set(sites.map((s) => `${s.cell.join(",")}|${s.basisIndex}`));
    expect(keys.size).toBe(sites.length);
    for (const s of sites) {
      expect(s.basisIndex).toBeGreaterThanOrEqual(0);
      expect(s.basisIndex).toBeLessThanOrEqual(7);
    }
  }
});

test("generateNaClPeriodicSites：无重复 canonical fractional position", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const keys = new Set(
      sites.map((s) => wrapPeriodicFractional(s.fractional, size).map((c) => c.toFixed(6)).join(",")),
    );
    expect(keys.size).toBe(sites.length);
  }
});

test("generateNaClPeriodicSites：多次调用结果深度相等（顺序确定）", () => {
  const first = generateNaClPeriodicSites(3);
  const second = generateNaClPeriodicSites(3);
  expect(second.length).toBe(first.length);
  for (let i = 0; i < first.length; i += 1) {
    expect(second[i].id).toBe(first[i].id);
    expect(vec3Equal(second[i].cartesian, first[i].cartesian)).toBe(true);
  }
});

test("generateNaClPeriodicSites：先 Cl⁻ 子格子后 Na⁺ 子格子（顺序确定）", () => {
  const sites = generateNaClPeriodicSites(1);
  expect(sites.slice(0, 4).every((s) => s.element === "Cl-")).toBe(true);
  expect(sites.slice(4, 8).every((s) => s.element === "Na+")).toBe(true);
});

// === 晶胞体积居中（T-028A.1 修正）=======================================

test("centerFractional：把 [0,size) 整体平移到关于原点对称的 [-size/2, +size/2]", () => {
  // N=1：边界 [0,1] 映射为 [-0.5, +0.5]。
  expect(centerFractional([0, 0, 0], 1)).toEqual([-0.5, -0.5, -0.5]);
  expect(centerFractional([1, 1, 1], 1)).toEqual([0.5, 0.5, 0.5]);
  // N=2：边界 [0,2] 映射为 [-1, +1]。
  expect(centerFractional([0, 0, 0], 2)).toEqual([-1, -1, -1]);
  expect(centerFractional([2, 2, 2], 2)).toEqual([1, 1, 1]);
  // N=3：边界 [0,3] 映射为 [-1.5, +1.5]。
  expect(centerFractional([0, 0, 0], 3)).toEqual([-1.5, -1.5, -1.5]);
  expect(centerFractional([3, 3, 3], 3)).toEqual([1.5, 1.5, 1.5]);
});

test("centerFractional + fractionalToCartesian：N=1 晶胞边界 [0,1]→cartesian [-1,+1]", () => {
  const a = NACL_LATTICE_PARAMETER; // 2
  expect(fractionalToCartesian(centerFractional([0, 0, 0], 1))).toEqual([-1, -1, -1]);
  expect(fractionalToCartesian(centerFractional([1, 1, 1], 1))).toEqual([1, 1, 1]);
  expect(a).toBe(2);
});

test("generateNaClPeriodicSites：N=2 / N=3 canonical 位点落在晶胞体积范围 [-size·a/2, +size·a/2] 内", () => {
  // 晶胞体积居中后，超晶胞空间范围关于原点对称 [-size·a/2, +size·a/2]。
  // canonical 位点集合不含正侧边界的显示镜像，故其 max < +size·a/2，
  // 但所有位点都落在对称的晶胞体积范围内。
  const a = NACL_LATTICE_PARAMETER;
  for (const size of [2, 3]) {
    const bound = (size * a) / 2;
    const sites = generateNaClPeriodicSites(size);
    for (const s of sites) {
      for (const c of s.cartesian) {
        expect(c).toBeGreaterThanOrEqual(-bound - 1e-9);
        expect(c).toBeLessThanOrEqual(bound + 1e-9);
      }
    }
    // 负侧边界由 cell=0 的 (0,0,0) 基元触达：min ≈ -size·a/2。
    const min = [Infinity, Infinity, Infinity];
    for (const s of sites) {
      for (let i = 0; i < 3; i += 1) min[i] = Math.min(min[i], s.cartesian[i]);
    }
    for (let i = 0; i < 3; i += 1) {
      expect(min[i]).toBeCloseTo(-bound, 6);
    }
  }
});

test("generateNaClPeriodicSites：N=1 canonical 位点坐标与现有 NaCl ±1 晶胞尺度兼容", () => {
  // 现有 nacl.json 用 ±1 的笛卡尔尺度（a=2，边界 [-1,+1]）。
  // 本内核不读 nacl.json，但 N=1 经晶胞体积居中后位点落在 [-1,+1] 范围内，尺度兼容。
  const sites = generateNaClPeriodicSites(1);
  for (const s of sites) {
    for (const c of s.cartesian) {
      expect(c).toBeGreaterThanOrEqual(-1 - 1e-9);
      expect(c).toBeLessThanOrEqual(1 + 1e-9);
    }
  }
});

test("generateNaClPeriodicSites：canonical 位点集合算术平均值不必为零", () => {
  // T-028A.1 修正：居中的是晶胞体积，不是 canonical 位点平均值。
  // canonical 集合不含正侧边界的显示镜像，平均值不为零，不作为中心判定。
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const mean: Vec3 = [0, 0, 0];
    for (const s of sites) {
      for (let i = 0; i < 3; i += 1) mean[i] += s.cartesian[i];
    }
    for (let i = 0; i < 3; i += 1) mean[i] /= sites.length;
    // 不要求为零；只要各分量在 [-1, 1] 范围（量级合理）即可。
    for (const m of mean) {
      expect(Math.abs(m)).toBeLessThanOrEqual(1);
    }
  }
});

// === 坐标转换 ==========================================================

test("fractionalToCartesian：分数坐标乘以晶格常数 a，比例明确可逆", () => {
  const a = NACL_LATTICE_PARAMETER;
  const frac: Vec3 = [0.25, 0.5, 0.75];
  const cart = fractionalToCartesian(frac);
  expect(cart[0]).toBeCloseTo(0.25 * a, 6);
  expect(cart[1]).toBeCloseTo(0.5 * a, 6);
  expect(cart[2]).toBeCloseTo(0.75 * a, 6);
  for (let i = 0; i < 3; i += 1) {
    expect(cart[i] / a).toBeCloseTo(frac[i], 6);
  }
});

test("wrapPeriodicFractional：把任意整数平移压回 [0,size)", () => {
  expect(wrapPeriodicFractional([3, -1, 5], 2)).toEqual([1, 1, 1]);
  expect(wrapPeriodicFractional([0, 0, 0], 1)).toEqual([0, 0, 0]);
  expect(wrapPeriodicFractional([-2, 4, -6], 2)).toEqual([0, 0, 0]);
});

// === 配位计算 ==========================================================

test("getNaClCoordinationImages：代表性 Na⁺ → 6 个 Cl⁻ 周期镜像", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const center = sites.find((s) => s.element === "Na+")!;
    const neighbors = getNaClCoordinationImages(center.id, sites, size);
    expect(neighbors).toHaveLength(6);
    expect(neighbors.every((n) => n.element === "Cl-")).toBe(true);
  }
});

test("getNaClCoordinationImages：代表性 Cl⁻ → 6 个 Na⁺ 周期镜像", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const center = sites.find((s) => s.element === "Cl-")!;
    const neighbors = getNaClCoordinationImages(center.id, sites, size);
    expect(neighbors).toHaveLength(6);
    expect(neighbors.every((n) => n.element === "Na+")).toBe(true);
  }
});

test("getNaClCoordinationImages：6 个 (siteId + periodicImageShift) 唯一", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    for (const element of ["Na+", "Cl-"] as const) {
      const center = sites.find((s) => s.element === element)!;
      const neighbors = getNaClCoordinationImages(center.id, sites, size);
      const keys = new Set(
        neighbors.map((n) => `${n.siteId}|${n.periodicImageShift.join(",")}`),
      );
      expect(keys.size).toBe(6);
    }
  }
});

test("getNaClCoordinationImages：6 个距离相等且等于理论最近邻距离 a/2", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const center = sites.find((s) => s.element === "Na+")!;
    const neighbors = getNaClCoordinationImages(center.id, sites, size);
    for (const n of neighbors) {
      expect(n.distance).toBeCloseTo(NACL_NEAREST_DISTANCE, 6);
      expect(distance(center.cartesian, n.cartesian)).toBeCloseTo(NACL_NEAREST_DISTANCE, 6);
    }
  }
});

test("getNaClCoordinationImages：6 个方向覆盖 ±x/±y/±z", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    for (const element of ["Na+", "Cl-"] as const) {
      const center = sites.find((s) => s.element === element)!;
      const neighbors = getNaClCoordinationImages(center.id, sites, size);
      const dirKeys = new Set(neighbors.map((n) => vec3Round(n.direction).join(",")));
      const expected = new Set([
        "1,0,0", "-1,0,0", "0,1,0", "0,-1,0", "0,0,1", "0,0,-1",
      ]);
      expect(dirKeys).toEqual(expected);
    }
  }
});

test("getNaClCoordinationImages：N=1 允许同 siteId 不同 periodicImageShift（不合并周期镜像）", () => {
  const sites = generateNaClPeriodicSites(1);
  const center = sites.find((s) => s.element === "Cl-")!;
  const neighbors = getNaClCoordinationImages(center.id, sites, 1);

  // N=1 只有 4 个异号 siteId，6 个邻居必有 siteId 重复。
  const siteIds = neighbors.map((n) => n.siteId);
  const uniqueSiteIds = new Set(siteIds);
  expect(uniqueSiteIds.size).toBeLessThanOrEqual(4);
  expect(uniqueSiteIds.size).toBeLessThan(6);

  // (siteId + periodicImageShift) 6 个全唯一（已显式确认）。
  const keys = new Set(neighbors.map((n) => `${n.siteId}|${n.periodicImageShift.join(",")}`));
  expect(keys.size).toBe(6);

  // 每个重复 siteId 的镜像必须 periodicImageShift 不同。
  const shiftsBySite = new Map<string, Set<string>>();
  for (const n of neighbors) {
    const set = shiftsBySite.get(n.siteId) ?? new Set<string>();
    const key = n.periodicImageShift.join(",");
    expect(set.has(key)).toBe(false);
    set.add(key);
    shiftsBySite.set(n.siteId, set);
  }
});

test("getNaClCoordinationImages：N=2 / N=3 边界位点仍返回完整六配位", () => {
  for (const size of [2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    // 角落 Na：cell 全为 0（负侧边界，-x/-y/-z 方向越界）与 cell 全为 size-1（正侧边界，+x/+y/+z 越界）。
    const nearCornerNa = sites.find(
      (s) => s.element === "Na+" && s.cell.every((c) => c === 0),
    )!;
    const farCornerNa = sites.find(
      (s) => s.element === "Na+" && s.cell.every((c) => c === size - 1),
    )!;

    for (const center of [nearCornerNa, farCornerNa]) {
      const neighbors = getNaClCoordinationImages(center.id, sites, size);
      expect(neighbors).toHaveLength(6);
      // 边界位点必有非零 periodicImageShift（周期镜像补齐）。
      const hasNonZeroPeriodic = neighbors.some((n) =>
        n.periodicImageShift.some((c) => c !== 0),
      );
      expect(hasNonZeroPeriodic).toBe(true);
      for (const n of neighbors) {
        expect(distance(center.cartesian, n.cartesian)).toBeCloseTo(NACL_NEAREST_DISTANCE, 6);
      }
    }
  }
});

test("getNaClCoordinationImages：不返回同号离子", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const naCenter = sites.find((s) => s.element === "Na+")!;
    const clCenter = sites.find((s) => s.element === "Cl-")!;
    const naNeighbors = getNaClCoordinationImages(naCenter.id, sites, size);
    const clNeighbors = getNaClCoordinationImages(clCenter.id, sites, size);
    expect(naNeighbors.every((n) => n.element === "Cl-")).toBe(true);
    expect(clNeighbors.every((n) => n.element === "Na+")).toBe(true);
  }
});

test("getNaClCoordinationImages：不把周期镜像误算为额外 canonical site", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const siteIdSet = new Set(sites.map((s) => s.id));
    const center = sites.find((s) => s.element === "Na+")!;
    const neighbors = getNaClCoordinationImages(center.id, sites, size);
    for (const n of neighbors) {
      expect(siteIdSet.has(n.siteId)).toBe(true);
    }
  }
});

test("getNaClCoordinationImages：非法 size 或未知 siteId 抛错", () => {
  const sites = generateNaClPeriodicSites(2);
  expect(() => getNaClCoordinationImages("nope", sites, 2)).toThrow();
  expect(() => getNaClCoordinationImages(sites[0].id, sites, 0)).toThrow();
});

// === cellOffset 与 periodicImageShift 区分（T-028A.1 新增）==============

test("getNaClCoordinationImages：所有 periodicImageShift 分量均为整数", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    for (const element of ["Na+", "Cl-"] as const) {
      const center = sites.find((s) => s.element === element)!;
      const neighbors = getNaClCoordinationImages(center.id, sites, size);
      for (const n of neighbors) {
        for (const c of n.periodicImageShift) {
          expect(Number.isInteger(c)).toBe(true);
        }
      }
    }
  }
});

test("getNaClCoordinationImages：N=2 内部相邻晶胞邻居 cellOffset≠0 但 periodicImageShift=[0,0,0]", () => {
  const size = 2;
  const sites = generateNaClPeriodicSites(size);
  // 选 Na⁺ 中心 nacl-0-0-0-4（Na 基元 0，frac [0.5,0,0]）；其 +x 方向最近邻 Cl⁻
  // 落在相邻 canonical cell (1,0,0)，仍在当前超晶胞内。
  const center = sites.find((s) => s.id === "nacl-0-0-0-4")!;
  expect(center.element).toBe("Na+");
  const neighbors = getNaClCoordinationImages(center.id, sites, size);

  // 找 +x 方向（direction ≈ [1,0,0]）的邻居。
  const plusX = neighbors.find((n) => vec3Round(n.direction).join(",") === "1,0,0")!;
  // 它在相邻 canonical cell（cellOffset.x = 1），但仍在当前超晶胞内 → periodicImageShift 全 0。
  expect(plusX.cellOffset[0]).toBe(1);
  expect(plusX.periodicImageShift).toEqual([0, 0, 0]);
});

test("getNaClCoordinationImages：N=2 越界周期镜像 periodicImageShift 对应轴为 ±1", () => {
  const size = 2;
  const sites = generateNaClPeriodicSites(size);
  // 选 cell=[0,0,0] 的 Cl⁻ 中心；其 -x 方向最近邻越过超晶胞边界后 wrap 回来。
  const center = sites.find((s) => s.id === "nacl-0-0-0-0")!;
  const neighbors = getNaClCoordinationImages(center.id, sites, size);

  const minusX = neighbors.find((n) => vec3Round(n.direction).join(",") === "-1,0,0")!;
  // -x 邻居越过超晶胞外边界（cellOffset.x = -1），wrap 后 canonicalCell.x = 1，
  // periodicImageShift.x = (neighborCell - canonicalCell)/size = (-1 - 1)/2 = -1。
  expect(minusX.cellOffset[0]).toBe(-1);
  expect(minusX.periodicImageShift[0]).toBe(-1);
  // 其余两轴仍在内部，periodicImageShift 分量为 0。
  expect(minusX.periodicImageShift[1]).toBe(0);
  expect(minusX.periodicImageShift[2]).toBe(0);
});

test("getNaClCoordinationImages：periodicImageShift !== [0,0,0] 准确表示超晶胞外镜像（不用 cellOffset 判断）", () => {
  // cellOffset !== 0 不代表幽灵粒子：内部相邻晶胞邻居 cellOffset 非零但 periodicImageShift=0。
  // 只有 periodicImageShift !== [0,0,0] 才表示来自超晶胞外。
  // 用 Na⁺ 中心 nacl-0-0-0-4（frac [0.5,0,0]）：+x 邻居在 cell(1,0,0) 内部（cellOffset≠0, periodic=0），
  // -x 邻居在 cell(-1,0,0) 越界 wrap 回 cell(1,0,0)（cellOffset=-1, periodic=-1）。
  for (const size of [2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const center = sites.find((s) => s.id === `nacl-0-0-0-4`)!;
    const neighbors = getNaClCoordinationImages(center.id, sites, size);

    // 内部邻居：cellOffset 可能非零，但 periodicImageShift 必为 [0,0,0]。
    const internalNeighbors = neighbors.filter((n) =>
      n.periodicImageShift.every((c) => c === 0),
    );
    // 至少存在内部相邻晶胞邻居（cellOffset 非零但 periodic 为 0）。
    const hasCellOffsetNonZeroButPeriodicZero = internalNeighbors.some((n) =>
      n.cellOffset.some((c) => c !== 0),
    );
    expect(hasCellOffsetNonZeroButPeriodicZero).toBe(true);

    // 外部镜像：periodicImageShift 必非 [0,0,0]。
    const externalNeighbors = neighbors.filter((n) =>
      n.periodicImageShift.some((c) => c !== 0),
    );
    expect(externalNeighbors.length).toBeGreaterThan(0);
    for (const n of externalNeighbors) {
      // 外部镜像在越界轴上 cellOffset 与 periodicImageShift 同号。
      for (let i = 0; i < 3; i += 1) {
        if (n.periodicImageShift[i] !== 0) {
          expect(Math.sign(n.cellOffset[i])).toBe(Math.sign(n.periodicImageShift[i]));
        }
      }
    }
  }
});

// === 周期镜像可重建契约（T-028A.1 新增）================================

test("getNaClCoordinationImages：canonical site + periodicImageShift 重建镜像 cartesian", () => {
  // 对每个邻居：neighbor.cartesian[axis] ≈ canonicalSite.cartesian[axis]
  //   + periodicImageShift[axis] * size * NACL_LATTICE_PARAMETER
  const a = NACL_LATTICE_PARAMETER;
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const siteById = new Map(sites.map((s) => [s.id, s]));
    for (const element of ["Na+", "Cl-"] as const) {
      const center = sites.find((s) => s.element === element)!;
      const neighbors = getNaClCoordinationImages(center.id, sites, size);
      for (const n of neighbors) {
        const canonical = siteById.get(n.siteId)!;
        for (let axis = 0; axis < 3; axis += 1) {
          const expected =
            canonical.cartesian[axis] + n.periodicImageShift[axis] * size * a;
          expect(n.cartesian[axis]).toBeCloseTo(expected, 6);
        }
      }
    }
  }
});

// === API 一致性（T-028A.1 新增）========================================

test("getNaClCoordinationImages：sites 数量与 size 不匹配时抛错", () => {
  // 用 size=2 的 sites 配 size=3，数量不匹配应抛错，避免悄悄生成不存在的 canonical siteId。
  const size2Sites = generateNaClPeriodicSites(2);
  expect(() => getNaClCoordinationImages(size2Sites[0].id, size2Sites, 3)).toThrow();
  // 反向同理。
  const size3Sites = generateNaClPeriodicSites(3);
  expect(() => getNaClCoordinationImages(size3Sites[0].id, size3Sites, 2)).toThrow();
});

test("getNaClCoordinationImages：所有邻居 siteId 必须存在于传入 sites", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const siteIdSet = new Set(sites.map((s) => s.id));
    for (const element of ["Na+", "Cl-"] as const) {
      const center = sites.find((s) => s.element === element)!;
      const neighbors = getNaClCoordinationImages(center.id, sites, size);
      for (const n of neighbors) {
        expect(siteIdSet.has(n.siteId)).toBe(true);
      }
    }
  }
});

test("getNaClCoordinationImages：相同输入结果顺序与内容确定", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const center = sites.find((s) => s.element === "Na+")!;
    const first = getNaClCoordinationImages(center.id, sites, size);
    const second = getNaClCoordinationImages(center.id, sites, size);
    expect(second.length).toBe(first.length);
    for (let i = 0; i < first.length; i += 1) {
      expect(second[i].siteId).toBe(first[i].siteId);
      expect(second[i].periodicImageShift).toEqual(first[i].periodicImageShift);
      expect(vec3Equal(second[i].cartesian, first[i].cartesian)).toBe(true);
    }
  }
});

// === NACL_NEAREST_DISTANCE 常量一致性 ===================================

test("NACL_NEAREST_DISTANCE = a/2 = 1（a=2）", () => {
  expect(NACL_NEAREST_DISTANCE).toBe(1);
  expect(NACL_NEAREST_DISTANCE).toBe(NACL_LATTICE_PARAMETER / 2);
});

// === DisplayInstance（T-028B 新增）=====================================

test("generateNaClDisplayInstances：N=1 → 27 个显示实例", () => {
  const sites = generateNaClPeriodicSites(1);
  const instances = generateNaClDisplayInstances(sites, 1);
  expect(instances).toHaveLength(27);
  expect(27).toBe((2 * 1 + 1) ** 3);
});

test("generateNaClDisplayInstances：N=2 → 125 个显示实例", () => {
  const sites = generateNaClPeriodicSites(2);
  const instances = generateNaClDisplayInstances(sites, 2);
  expect(instances).toHaveLength(125);
  expect(125).toBe((2 * 2 + 1) ** 3);
});

test("generateNaClDisplayInstances：N=3 → 343 个显示实例", () => {
  const sites = generateNaClPeriodicSites(3);
  const instances = generateNaClDisplayInstances(sites, 3);
  expect(instances).toHaveLength(343);
  expect(343).toBe((2 * 3 + 1) ** 3);
});

test("generateNaClDisplayInstances：每个 canonical site 至少有一个 shift=[0,0,0] 实例", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const instances = generateNaClDisplayInstances(sites, size);
    const zeroShiftBySite = new Map<string, number>();
    for (const inst of instances) {
      if (inst.periodicImageShift.every((c) => c === 0)) {
        zeroShiftBySite.set(inst.siteId, (zeroShiftBySite.get(inst.siteId) ?? 0) + 1);
      }
    }
    // 每个 canonical site 都恰好有一个 shift=[0,0,0] 本体副本。
    expect(zeroShiftBySite.size).toBe(sites.length);
    for (const site of sites) {
      expect(zeroShiftBySite.get(site.id)).toBe(1);
    }
  }
});

test("generateNaClDisplayInstances：所有 ID 唯一", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const instances = generateNaClDisplayInstances(sites, size);
    const ids = new Set(instances.map((i) => i.id));
    expect(ids.size).toBe(instances.length);
  }
});

test("generateNaClDisplayInstances：所有 siteId 都存在于 canonical sites", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const siteIdSet = new Set(sites.map((s) => s.id));
    const instances = generateNaClDisplayInstances(sites, size);
    for (const inst of instances) {
      expect(siteIdSet.has(inst.siteId)).toBe(true);
    }
  }
});

test("generateNaClDisplayInstances：periodicImageShift 每个分量只能为 0 或 1", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const instances = generateNaClDisplayInstances(sites, size);
    for (const inst of instances) {
      for (const c of inst.periodicImageShift) {
        expect(c === 0 || c === 1).toBe(true);
      }
    }
  }
});

test("generateNaClDisplayInstances：只有 fractional 下边界(=0)的轴才生成 +1 副本", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const siteById = new Map(sites.map((s) => [s.id, s]));
    const instances = generateNaClDisplayInstances(sites, size);
    for (const inst of instances) {
      const canonical = siteById.get(inst.siteId)!;
      for (let axis = 0; axis < 3; axis += 1) {
        if (inst.periodicImageShift[axis] === 1) {
          // 该轴必须是下边界（canonical fractional[axis] = 0）。
          expect(Math.abs(canonical.fractional[axis])).toBeLessThan(1e-9);
        }
      }
    }
  }
});

test("generateNaClDisplayInstances：display cartesian 满足 canonical + shift 重建公式", () => {
  const a = NACL_LATTICE_PARAMETER;
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const siteById = new Map(sites.map((s) => [s.id, s]));
    const instances = generateNaClDisplayInstances(sites, size);
    for (const inst of instances) {
      const canonical = siteById.get(inst.siteId)!;
      for (let axis = 0; axis < 3; axis += 1) {
        const expected = canonical.cartesian[axis] + inst.periodicImageShift[axis] * size * a;
        expect(inst.cartesian[axis]).toBeCloseTo(expected, 6);
      }
    }
  }
});

test("generateNaClDisplayInstances：不创建新的 canonical site（实例数 > 位点数）", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const instances = generateNaClDisplayInstances(sites, size);
    // 显示实例数 (2N+1)³ 必大于 canonical 位点数 8N³（含边界镜像副本）。
    expect(instances.length).toBeGreaterThan(sites.length);
  }
});

test("generateNaClDisplayInstances：相同输入结果顺序与内容确定", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const first = generateNaClDisplayInstances(sites, size);
    const second = generateNaClDisplayInstances(sites, size);
    expect(second.length).toBe(first.length);
    for (let i = 0; i < first.length; i += 1) {
      expect(second[i].id).toBe(first[i].id);
      expect(second[i].siteId).toBe(first[i].siteId);
      expect(second[i].periodicImageShift).toEqual(first[i].periodicImageShift);
      expect(vec3Equal(second[i].cartesian, first[i].cartesian)).toBe(true);
    }
  }
});

test("generateNaClDisplayInstances：sites 数量与 size 不匹配时抛错", () => {
  const size2Sites = generateNaClPeriodicSites(2);
  expect(() => generateNaClDisplayInstances(size2Sites, 3)).toThrow();
  expect(() => generateNaClDisplayInstances([], 1)).toThrow();
});

// === FrameSegments（T-028B 新增）=======================================

test("generateNaClCellFrameSegments：hidden 返回 0 条", () => {
  for (const size of [1, 2, 3]) {
    expect(generateNaClCellFrameSegments(size, "hidden")).toHaveLength(0);
  }
});

test("generateNaClCellFrameSegments：outer 恒为 12 条", () => {
  for (const size of [1, 2, 3]) {
    const outer = generateNaClCellFrameSegments(size, "outer");
    expect(outer).toHaveLength(12);
    // 全部 kind 为 outer。
    expect(outer.every((s) => s.kind === "outer")).toBe(true);
  }
});

test("generateNaClCellFrameSegments：all 数量 = 3·N·(N+1)²", () => {
  expect(generateNaClCellFrameSegments(1, "all")).toHaveLength(3 * 1 * (1 + 1) ** 2); // 12
  expect(generateNaClCellFrameSegments(2, "all")).toHaveLength(3 * 2 * (2 + 1) ** 2); // 54
  expect(generateNaClCellFrameSegments(3, "all")).toHaveLength(3 * 3 * (3 + 1) ** 2); // 144
});

test("generateNaClCellFrameSegments：所有 ID 唯一", () => {
  for (const mode of ["outer", "all"] as CrystalCellFrameMode[]) {
    for (const size of [1, 2, 3]) {
      const segs = generateNaClCellFrameSegments(size, mode);
      const ids = new Set(segs.map((s) => s.id));
      expect(ids.size).toBe(segs.length);
    }
  }
});

test("generateNaClCellFrameSegments：不存在方向相反但实际相同的重复线段", () => {
  for (const mode of ["outer", "all"] as CrystalCellFrameMode[]) {
    for (const size of [1, 2, 3]) {
      const segs = generateNaClCellFrameSegments(size, mode);
      const keys = new Set<string>();
      for (const seg of segs) {
        // 规范化无向键：两端点分量按字典序排列后 join。
        const a = seg.start.map((c) => c.toFixed(6)).join(",");
        const b = seg.end.map((c) => c.toFixed(6)).join(",");
        const key = a < b ? `${a}|${b}` : `${b}|${a}`;
        expect(keys.has(key)).toBe(false);
        keys.add(key);
      }
    }
  }
});

test("generateNaClCellFrameSegments：坐标范围在 [-N, +N]（a=2，N=size）", () => {
  for (const mode of ["outer", "all"] as CrystalCellFrameMode[]) {
    for (const size of [1, 2, 3]) {
      const bound = size; // a=2，居中后边界 = size。
      const segs = generateNaClCellFrameSegments(size, mode);
      for (const seg of segs) {
        for (const v of [seg.start, seg.end]) {
          for (const c of v) {
            expect(c).toBeGreaterThanOrEqual(-bound - 1e-9);
            expect(c).toBeLessThanOrEqual(bound + 1e-9);
          }
        }
      }
    }
  }
});

test("generateNaClCellFrameSegments：outer 边界恰为 ±N", () => {
  for (const size of [1, 2, 3]) {
    const bound = size;
    const outer = generateNaClCellFrameSegments(size, "outer");
    // outer 线段的端点分量都应位于 ±bound。
    for (const seg of outer) {
      for (const v of [seg.start, seg.end]) {
        for (const c of v) {
          expect(Math.abs(Math.abs(c) - bound)).toBeLessThan(1e-9);
        }
      }
    }
  }
});

test("generateNaClCellFrameSegments：all 中每段长度等于 a=2", () => {
  for (const size of [1, 2, 3]) {
    const segs = generateNaClCellFrameSegments(size, "all");
    for (const seg of segs) {
      const len = distance(seg.start as Vec3Tuple, seg.end as Vec3Tuple);
      expect(len).toBeCloseTo(NACL_LATTICE_PARAMETER, 6);
    }
  }
});

// === 配位显示 cluster（T-028C 新增）====================================

/** 在 displayInstances 中构造一个精确 selection（默认取 shift=[0,0,0] 本体）。 */
function selectionOf(siteId: string, shift: Vec3 = [0, 0, 0]): NaClDisplaySelection {
  return { siteId, periodicImageShift: shift };
}

test("buildNaClCoordinationDisplayCluster：可选择 canonical 本体（shift=[0,0,0]）", () => {
  const size = 2;
  const sites = generateNaClPeriodicSites(size);
  const displayInstances = generateNaClDisplayInstances(sites, size);
  const cluster = buildNaClCoordinationDisplayCluster(
    sites,
    displayInstances,
    size,
    selectionOf("nacl-1-1-1-0"),
  );
  expect(cluster.center.siteId).toBe("nacl-1-1-1-0");
  expect(cluster.center.periodicImageShift).toEqual([0, 0, 0]);
  expect(cluster.center.role).toBe("center");
  expect(cluster.center.isGhost).toBe(false);
  // 该 canonical 本体在显示实例中的坐标应与 center 完全一致。
  const inst = displayInstances.find(
    (i) => i.siteId === "nacl-1-1-1-0" && i.periodicImageShift.every((c) => c === 0),
  )!;
  expect(vec3Equal(cluster.center.cartesian, inst.cartesian)).toBe(true);
});

test("buildNaClCoordinationDisplayCluster：可选择正侧边界显示副本（shift 非零）", () => {
  const size = 2;
  const sites = generateNaClPeriodicSites(size);
  const displayInstances = generateNaClDisplayInstances(sites, size);
  // nacl-0-0-0-0：Cl⁻ fractional [0,0,0]，三轴均为下边界 → 存在 [1,0,0] 边界副本。
  const selection = selectionOf("nacl-0-0-0-0", [1, 0, 0]);
  const cluster = buildNaClCoordinationDisplayCluster(sites, displayInstances, size, selection);
  expect(cluster.center.siteId).toBe("nacl-0-0-0-0");
  expect(cluster.center.periodicImageShift).toEqual([1, 0, 0]);
  // center 坐标 = 被点击边界副本坐标，而非 canonical 本体。
  const boundaryInst = displayInstances.find(
    (i) =>
      i.siteId === "nacl-0-0-0-0" &&
      i.periodicImageShift[0] === 1 &&
      i.periodicImageShift[1] === 0 &&
      i.periodicImageShift[2] === 0,
  )!;
  expect(vec3Equal(cluster.center.cartesian, boundaryInst.cartesian)).toBe(true);
  // canonical 本体在 [-2,-2,-2]，边界副本沿 +x 平移一个超晶胞（period=size·a=4）。
  const canonical = sites.find((s) => s.id === "nacl-0-0-0-0")!;
  expect(cluster.center.cartesian[0]).toBeCloseTo(canonical.cartesian[0] + 1 * size * NACL_LATTICE_PARAMETER, 6);
});

test("buildNaClCoordinationDisplayCluster：同 siteId 不同 shift 是不同显示实例（中心不同）", () => {
  const size = 2;
  const sites = generateNaClPeriodicSites(size);
  const displayInstances = generateNaClDisplayInstances(sites, size);
  const bodyCluster = buildNaClCoordinationDisplayCluster(
    sites,
    displayInstances,
    size,
    selectionOf("nacl-0-0-0-0", [0, 0, 0]),
  );
  const copyCluster = buildNaClCoordinationDisplayCluster(
    sites,
    displayInstances,
    size,
    selectionOf("nacl-0-0-0-0", [1, 0, 0]),
  );
  // 相同 siteId，但中心坐标与身份不同。
  expect(bodyCluster.center.siteId).toBe(copyCluster.center.siteId);
  expect(bodyCluster.center.id).not.toBe(copyCluster.center.id);
  expect(vec3Equal(bodyCluster.center.cartesian, copyCluster.center.cartesian)).toBe(false);
});

test("buildNaClCoordinationDisplayCluster：不存在的 selection 抛明确错误", () => {
  const size = 2;
  const sites = generateNaClPeriodicSites(size);
  const displayInstances = generateNaClDisplayInstances(sites, size);
  // nacl-0-0-0-0 的 x 轴是下边界，但 shift=[0,1,1] 组合仍存在；用一个不可能的 shift。
  // Na⁺ 基元 nacl-0-0-0-4 fractional [0.5,0,0]，x 轴非 0，[1,0,0] 副本不存在。
  expect(() =>
    buildNaClCoordinationDisplayCluster(sites, displayInstances, size, selectionOf("nacl-0-0-0-4", [1, 0, 0])),
  ).toThrow();
  // 完全不存在的 siteId。
  expect(() =>
    buildNaClCoordinationDisplayCluster(sites, displayInstances, size, selectionOf("nope", [0, 0, 0])),
  ).toThrow();
  // 非法 size。
  expect(() =>
    buildNaClCoordinationDisplayCluster(sites, displayInstances, 0, selectionOf("nacl-0-0-0-0")),
  ).toThrow();
});

test("buildNaClCoordinationDisplayCluster：N=1/2/3 本体选择 → 6 个异号最近邻，身份唯一、距离与方向正确", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const displayInstances = generateNaClDisplayInstances(sites, size);
    for (const element of ["Na+", "Cl-"] as const) {
      const centerSite = sites.find((s) => s.element === element)!;
      const cluster = buildNaClCoordinationDisplayCluster(
        sites,
        displayInstances,
        size,
        selectionOf(centerSite.id, [0, 0, 0]),
      );
      // 中心坐标与所选显示实例完全一致。
      const centerInst = displayInstances.find(
        (i) => i.siteId === centerSite.id && i.periodicImageShift.every((c) => c === 0),
      )!;
      expect(vec3Equal(cluster.center.cartesian, centerInst.cartesian)).toBe(true);
      // 恰好 6 个邻居，元素与中心相反。
      expect(cluster.neighbors).toHaveLength(6);
      const oppositeElement = element === "Na+" ? "Cl-" : "Na+";
      expect(cluster.neighbors.every((n) => n.element === oppositeElement)).toBe(true);
      expect(cluster.neighbors.every((n) => n.role === "neighbor")).toBe(true);
      // 6 个 siteId+periodicImageShift 唯一。
      const keys = new Set(cluster.neighbors.map((n) => `${n.siteId}|${n.periodicImageShift.join(",")}`));
      expect(keys.size).toBe(6);
      // 6 个距离均为最近邻距离；6 个方向覆盖 ±x/±y/±z。
      for (const n of cluster.neighbors) {
        expect(n.distance).toBeCloseTo(NACL_NEAREST_DISTANCE, 6);
        expect(distance(cluster.center.cartesian as Vec3Tuple, n.cartesian as Vec3Tuple)).toBeCloseTo(
          NACL_NEAREST_DISTANCE,
          6,
        );
      }
      const dirKeys = new Set(cluster.neighbors.map((n) => vec3Round(n.direction!).join(",")));
      expect(dirKeys).toEqual(
        new Set(["1,0,0", "-1,0,0", "0,1,0", "0,-1,0", "0,0,1", "0,0,-1"]),
      );
    }
  }
});

test("buildNaClCoordinationDisplayCluster：不修改输入 sites / displayInstances，且结果确定", () => {
  const size = 2;
  const sites = generateNaClPeriodicSites(size);
  const displayInstances = generateNaClDisplayInstances(sites, size);
  const sitesLen = sites.length;
  const instLen = displayInstances.length;
  const first = buildNaClCoordinationDisplayCluster(sites, displayInstances, size, selectionOf("nacl-1-1-1-0"));
  const second = buildNaClCoordinationDisplayCluster(sites, displayInstances, size, selectionOf("nacl-1-1-1-0"));
  // 输入未被修改。
  expect(sites.length).toBe(sitesLen);
  expect(displayInstances.length).toBe(instLen);
  // 结果确定。
  expect(second.center.id).toBe(first.center.id);
  expect(second.neighbors.length).toBe(first.neighbors.length);
  for (let i = 0; i < first.neighbors.length; i += 1) {
    expect(second.neighbors[i].id).toBe(first.neighbors[i].id);
    expect(second.neighbors[i].periodicImageShift).toEqual(first.neighbors[i].periodicImageShift);
    expect(vec3Equal(second.neighbors[i].cartesian, first.neighbors[i].cartesian)).toBe(true);
  }
});

test("buildNaClCoordinationDisplayCluster：canonical 中心案例——邻居 cellOffset 非零但最终非幽灵，ghost 不依赖 cellOffset", () => {
  const size = 2;
  const sites = generateNaClPeriodicSites(size);
  const displayInstances = generateNaClDisplayInstances(sites, size);
  // nacl-1-1-1-0：Cl⁻ 位于超晶胞中心（cartesian 恰为 [0,0,0]），六邻居全在超晶胞内。
  const centerSite = sites.find((s) => s.id === "nacl-1-1-1-0")!;
  expect(centerSite.cartesian).toEqual([0, 0, 0]);
  const cluster = buildNaClCoordinationDisplayCluster(sites, displayInstances, size, selectionOf(centerSite.id));

  // 所有邻居均在当前显示模型内 → 全部非幽灵。
  expect(cluster.neighbors.every((n) => n.isGhost === false)).toBe(true);

  // 取 canonical 邻居（含 cellOffset）验证：至少一个 cellOffset 非零但 periodicImageShift=0。
  const canonicalNeighbors = getNaClCoordinationImages(centerSite.id, sites, size);
  const cellOffsetNonZeroInternal = canonicalNeighbors.filter(
    (n) => n.cellOffset.some((c) => c !== 0) && n.periodicImageShift.every((c) => c === 0),
  );
  expect(cellOffsetNonZeroInternal.length).toBeGreaterThan(0);
  // 这些 cellOffset 非零的内部邻居在 cluster 中最终 isGhost=false（ghost 不看 cellOffset）。
  for (const cn of cellOffsetNonZeroInternal) {
    const match = cluster.neighbors.find(
      (n) => n.siteId === cn.siteId && n.periodicImageShift.every((c) => c === 0),
    )!;
    expect(match.isGhost).toBe(false);
  }
});

test("buildNaClCoordinationDisplayCluster：边界显示副本案例——cluster 整体平移，出现幽灵邻居", () => {
  const size = 2;
  const sites = generateNaClPeriodicSites(size);
  const displayInstances = generateNaClDisplayInstances(sites, size);
  const selectedShift: Vec3 = [1, 0, 0];
  const selection = selectionOf("nacl-0-0-0-0", selectedShift);
  const cluster = buildNaClCoordinationDisplayCluster(sites, displayInstances, size, selection);

  // 中心为被点击的边界副本位置。
  const boundaryInst = displayInstances.find(
    (i) =>
      i.siteId === "nacl-0-0-0-0" &&
      i.periodicImageShift.join(",") === selectedShift.join(","),
  )!;
  expect(vec3Equal(cluster.center.cartesian, boundaryInst.cartesian)).toBe(true);

  // 邻居 cluster 整体随 selectedShift 平移：每个邻居 = canonical 邻居 + selectedShift·period。
  const period = size * NACL_LATTICE_PARAMETER;
  const canonicalNeighbors = getNaClCoordinationImages("nacl-0-0-0-0", sites, size);
  for (const cn of canonicalNeighbors) {
    const combined: Vec3 = [
      selectedShift[0] + cn.periodicImageShift[0],
      selectedShift[1] + cn.periodicImageShift[1],
      selectedShift[2] + cn.periodicImageShift[2],
    ];
    const match = cluster.neighbors.find(
      (n) => n.siteId === cn.siteId && n.periodicImageShift.join(",") === combined.join(","),
    )!;
    expect(match).toBeTruthy();
    for (let axis = 0; axis < 3; axis += 1) {
      expect(match.cartesian[axis]).toBeCloseTo(cn.cartesian[axis] + selectedShift[axis] * period, 6);
    }
  }

  // 至少一个邻居为幽灵。
  const ghosts = cluster.neighbors.filter((n) => n.isGhost);
  expect(ghosts.length).toBeGreaterThan(0);
  // 幽灵的 combined periodicImageShift 可以超出 0/1（这里出现 -1）。
  const hasNegativeShift = ghosts.some((n) => n.periodicImageShift.some((c) => c < 0));
  expect(hasNegativeShift).toBe(true);
  // 幽灵不在常规 displayInstances 中。
  const displayKeys = new Set(displayInstances.map((i) => `${i.siteId}|${i.periodicImageShift.join(",")}`));
  for (const g of ghosts) {
    expect(displayKeys.has(`${g.siteId}|${g.periodicImageShift.join(",")}`)).toBe(false);
    // 幽灵 siteId 仍是 canonical site，不创建新位点。
    expect(sites.some((s) => s.id === g.siteId)).toBe(true);
  }
});

test("buildNaClCoordinationDisplayCluster：邻居满足 canonical + combined shift 重建公式", () => {
  const a = NACL_LATTICE_PARAMETER;
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const displayInstances = generateNaClDisplayInstances(sites, size);
    const siteById = new Map(sites.map((s) => [s.id, s]));
    // 取一个边界副本中心（若存在）与一个本体中心分别验证。
    const bodySelections: NaClDisplaySelection[] = [selectionOf(sites[0].id, [0, 0, 0])];
    if (size >= 2) bodySelections.push(selectionOf("nacl-0-0-0-0", [1, 0, 0]));
    for (const selection of bodySelections) {
      const cluster = buildNaClCoordinationDisplayCluster(sites, displayInstances, size, selection);
      for (const n of cluster.neighbors) {
        const canonical = siteById.get(n.siteId)!;
        for (let axis = 0; axis < 3; axis += 1) {
          const expected = canonical.cartesian[axis] + n.periodicImageShift[axis] * size * a;
          expect(n.cartesian[axis]).toBeCloseTo(expected, 6);
        }
      }
    }
  }
});
