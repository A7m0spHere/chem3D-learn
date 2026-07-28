import { expect, test } from "@playwright/test";
import {
  NACL_LATTICE_PARAMETER,
  NACL_NEAREST_DISTANCE,
  centerFractional,
  fractionalToCartesian,
  generateNaClPeriodicSites,
  getNaClCoordinationImages,
  naclConventionalBasis,
  wrapPeriodicFractional,
  type NaClPeriodicSite,
  type Vec3,
} from "../../src/components/three/naclPeriodicGeometry";

// ---------------------------------------------------------------------------
// T-028A：NaCl 周期超晶胞纯函数内核的契约测试。
//
// 只覆盖纯几何（位点计数、坐标、配位镜像、周期去重），不触碰 viewer 渲染 / 交互。
// 沿用 crystal-geometry.logic.spec.ts 的表驱动断言范式。
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

// === 基元定义 ===========================================================

test("naclConventionalBasis：Cl⁻ 与 Na⁺ 子格子各 4 个位点，Na⁺ = Cl⁻ + (½,0,0) 平移（mod 1）", () => {
  expect(naclConventionalBasis.chloride).toHaveLength(4);
  expect(naclConventionalBasis.sodium).toHaveLength(4);

  // Na⁺ 子格子 = 每个 Cl⁻ 位点 + (1/2,0,0) 后 mod 1 回到常规晶胞内。
  // 比较 mod-1 规范化后的无序分数坐标集合。
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
    // basisIndex 全局 0..7。
    for (const s of sites) {
      expect(s.basisIndex).toBeGreaterThanOrEqual(0);
      expect(s.basisIndex).toBeLessThanOrEqual(7);
    }
  }
});

test("generateNaClPeriodicSites：无重复 canonical fractional position", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    // canonical = wrap 到 [0,size) 后的分数坐标。
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
  // 逐项 id + cartesian 顺序相等。
  for (let i = 0; i < first.length; i += 1) {
    expect(second[i].id).toBe(first[i].id);
    expect(vec3Equal(second[i].cartesian, first[i].cartesian)).toBe(true);
  }
});

test("generateNaClPeriodicSites：先 Cl⁻ 子格子后 Na⁺ 子格子（顺序确定）", () => {
  const sites = generateNaClPeriodicSites(1);
  // 前 4 个应为 Cl⁻，后 4 个应为 Na⁺。
  expect(sites.slice(0, 4).every((s) => s.element === "Cl-")).toBe(true);
  expect(sites.slice(4, 8).every((s) => s.element === "Na+")).toBe(true);
});

// === 坐标居中与转换 ====================================================

test("generateNaClPeriodicSites：几何中心位于原点附近", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    const center = sites.reduce<Vec3>(
      (acc, s) => [acc[0] + s.cartesian[0], acc[1] + s.cartesian[1], acc[2] + s.cartesian[2]],
      [0, 0, 0],
    );
    const mean: Vec3 = [center[0] / sites.length, center[1] / sites.length, center[2] / sites.length];
    for (const m of mean) {
      expect(Math.abs(m)).toBeLessThan(1e-9);
    }
  }
});

test("fractionalToCartesian：分数坐标乘以晶格常数 a，比例明确可逆", () => {
  const a = NACL_LATTICE_PARAMETER;
  const frac: Vec3 = [0.25, 0.5, 0.75];
  const cart = fractionalToCartesian(frac);
  expect(cart[0]).toBeCloseTo(0.25 * a, 6);
  expect(cart[1]).toBeCloseTo(0.5 * a, 6);
  expect(cart[2]).toBeCloseTo(0.75 * a, 6);
  // 反向：cart / a 还原分数。
  for (let i = 0; i < 3; i += 1) {
    expect(cart[i] / a).toBeCloseTo(frac[i], 6);
  }
});

test("centerFractional：把 [0,size) 整体平移到以原点为中心", () => {
  // size=2 时，中心偏移 = 1；位点 0 → -1，位点 2 → 1。
  expect(centerFractional([0, 0, 0], 2)).toEqual([-1, -1, -1]);
  expect(centerFractional([2, 2, 2], 2)).toEqual([1, 1, 1]);
  // size=1 时，中心偏移 = 0.5；位点 0 → -0.5，位点 1 → 0.5。
  expect(centerFractional([0, 0, 0], 1)).toEqual([-0.5, -0.5, -0.5]);
  expect(centerFractional([1, 1, 1], 1)).toEqual([0.5, 0.5, 0.5]);
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

test("getNaClCoordinationImages：6 个 (siteId + imageShift) 唯一", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    // 取一个 Na⁺ 和一个 Cl⁻ 中心分别验证。
    for (const element of ["Na+", "Cl-"] as const) {
      const center = sites.find((s) => s.element === element)!;
      const neighbors = getNaClCoordinationImages(center.id, sites, size);
      const keys = new Set(
        neighbors.map((n) => `${n.siteId}|${n.imageShift.join(",")}`),
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
      // distance 字段与实际几何距离都应等于 a/2。
      expect(n.distance).toBeCloseTo(NACL_NEAREST_DISTANCE, 6);
      const geomDist = distance(center.cartesian, n.cartesian);
      expect(geomDist).toBeCloseTo(NACL_NEAREST_DISTANCE, 6);
    }
  }
});

test("getNaClCoordinationImages：6 个方向覆盖 ±x/±y/±z", () => {
  for (const size of [1, 2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    for (const element of ["Na+", "Cl-"] as const) {
      const center = sites.find((s) => s.element === element)!;
      const neighbors = getNaClCoordinationImages(center.id, sites, size);
      const dirKeys = new Set(neighbors.map((n) => n.direction.join(",")));
      expect(dirKeys.size).toBe(6);
      // 必须恰好包含六个单位方向。
      const expected = new Set([
        "1,0,0", "-1,0,0", "0,1,0", "0,-1,0", "0,0,1", "0,0,-1",
      ]);
      expect(dirKeys).toEqual(expected);
    }
  }
});

test("getNaClCoordinationImages：N=1 允许同 siteId 不同 imageShift（不合并周期镜像）", () => {
  const sites = generateNaClPeriodicSites(1);
  const center = sites.find((s) => s.element === "Cl-")!;
  const neighbors = getNaClCoordinationImages(center.id, sites, 1);

  // N=1 只有 4 个 Na⁺ siteId，6 个邻居必有 siteId 重复。
  const siteIds = neighbors.map((n) => n.siteId);
  const uniqueSiteIds = new Set(siteIds);
  expect(uniqueSiteIds.size).toBeLessThanOrEqual(4);
  expect(uniqueSiteIds.size).toBeLessThan(6);

  // 但 (siteId + imageShift) 6 个全唯一（上一用例已断言），此处再显式确认。
  const keys = new Set(neighbors.map((n) => `${n.siteId}|${n.imageShift.join(",")}`));
  expect(keys.size).toBe(6);

  // 每个重复 siteId 的镜像必须 imageShift 不同。
  const shiftsBySite = new Map<string, Set<string>>();
  for (const n of neighbors) {
    const set = shiftsBySite.get(n.siteId) ?? new Set<string>();
    const key = n.imageShift.join(",");
    expect(set.has(key)).toBe(false);
    set.add(key);
    shiftsBySite.set(n.siteId, set);
  }
});

test("getNaClCoordinationImages：N=2 / N=3 边界位点仍返回完整六配位", () => {
  for (const size of [2, 3]) {
    const sites = generateNaClPeriodicSites(size);
    // 找角落边界位点（cell 全为 0 或全为 size-1）验证周期补齐。
    const cornerNa = sites.find(
      (s) => s.element === "Na+" && s.cell.every((c) => c === 0),
    )!;
    const farCornerCl = sites.find(
      (s) => s.element === "Cl-" && s.cell.every((c) => c === size - 1),
    )!;

    for (const center of [cornerNa, farCornerCl]) {
      const neighbors = getNaClCoordinationImages(center.id, sites, size);
      expect(neighbors).toHaveLength(6);
      // 边界位点的某些 imageShift 必为非零（周期镜像补齐）。
      const hasNonZeroShift = neighbors.some((n) =>
        n.imageShift.some((c) => c !== 0),
      );
      expect(hasNonZeroShift).toBe(true);
      // 距离仍为 a/2。
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
  // 邻居的 siteId 必须真实存在于超晶胞 sites 中（canonical site，不是凭空镜像 id）。
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

// === NACL_NEAREST_DISTANCE 常量一致性 ===================================

test("NACL_NEAREST_DISTANCE = a/2 = 1（a=2）", () => {
  expect(NACL_NEAREST_DISTANCE).toBe(1);
  expect(NACL_NEAREST_DISTANCE).toBe(NACL_LATTICE_PARAMETER / 2);
});

// === 辅助函数 ==========================================================

function countByElement(sites: NaClPeriodicSite[]): Record<string, number> {
  return sites.reduce<Record<string, number>>((acc, s) => {
    acc[s.element] = (acc[s.element] ?? 0) + 1;
    return acc;
  }, {});
}
