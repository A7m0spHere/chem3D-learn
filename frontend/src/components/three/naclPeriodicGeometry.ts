// ---------------------------------------------------------------------------
// NaCl 周期超晶胞的纯几何内核（Crystal Workspace 第一阶段 T-028A）。
//
// 这里只放无 React / R3F / Three.js 副作用的坐标、位点与配位计算，方便单测覆盖。
// 本内核不读取、不修改 frontend/src/data/manual/nacl.json；现有 NaClCell.tsx 的
// 单晶胞教学模式（27 个边界展开位置、均摊计数 4:4、siteType 显示属性）保持不变，
// 本轮不接入旧 Viewer，不实现显示边界副本、点击选择与幽灵粒子。
//
// 晶体学约定：
//   - 使用 NaCl「常规立方晶胞」（conventional cubic cell），不是原胞（primitive cell）。
//     常规晶胞含 4 个 Cl⁻ + 4 个 Na⁺ 共 8 个分数坐标基元位点；原胞只含 1 个 NaCl
//     化学式单位且其基矢不是高中教材使用的正交立方晶胞。本阶段沿用常规立方晶胞。
//   - 不给周期位点附加 CrystalSiteType（corner / face-center / edge-center /
//     body-center 是相对单晶胞边界的「显示与均摊」属性，不是无限晶格中一个离子
//     的固有属性）。siteType 只服务于 nacl.json 的单晶胞计数教学。
//   - 区分两类对象：
//       * NaClPeriodicSite  —— N×N×N 超晶胞中的独立离子位点（8·N³ 个）；
//       * NaClDisplayInstance —— 为补齐外边界而显示的同一周期位点的镜像副本。
//     本轮只实现前者与配位镜像计算；后者仅预留类型边界，不实现其填充逻辑。
//
// basisIndex 约定：
//   全局索引 0..7，跨两个子格子在一个常规晶胞内唯一：Cl⁻ 子格子 0..3，Na⁺ 子格子 4..7。
//   这样 (cell + basisIndex) 组合在整个超晶胞内唯一，且 sublattice 字段仍显式保留
//   （basisIndex<4 ⟺ chloride）便于阅读与未来扩展。
// ---------------------------------------------------------------------------

export type Vec3 = [number, number, number];

export type NaClSublattice = "sodium" | "chloride";

/**
 * N×N×N 周期超晶胞中的一个独立离子位点。
 *
 * - `basisIndex`：常规晶胞内全局基元位点索引 0..7（Cl⁻ 0..3，Na⁺ 4..7），(cell + basisIndex) 唯一。
 * - `cell`：整数晶胞平移 [i,j,k]，i,j,k ∈ [0,size)。
 * - `fractional`：晶胞内分数坐标（已含 cell 平移，未居中，范围 [0,size)）。
 * - `cartesian`：笛卡尔坐标（已整体居中，几何中心落在原点，便于未来 Viewer 对准相机目标）。
 */
export type NaClPeriodicSite = {
  id: string;
  element: "Na+" | "Cl-";
  sublattice: NaClSublattice;
  basisIndex: number;
  cell: Vec3;
  fractional: Vec3;
  cartesian: Vec3;
};

/**
 * 中心位点的某个最近邻异号离子的周期镜像。
 *
 * 一个 canonical site（siteId）在周期边界条件下可对应多个不同的周期镜像
 * （imageShift 不同），尤其在 N=1 时，同一 siteId 会以不同 imageShift 出现多次。
 * 因此六配位的唯一性按 `siteId + imageShift` 判断，而不是只按 siteId 去重。
 */
export type NaClPeriodicNeighbor = {
  siteId: string;
  element: "Na+" | "Cl-";
  /** 周期镜像相对中心所在 cell 的整数平移。 */
  imageShift: Vec3;
  /** 周期镜像的绝对分数坐标（已居中）。 */
  fractional: Vec3;
  /** 周期镜像的笛卡尔坐标（已居中）。 */
  cartesian: Vec3;
  /** 最近邻方向，单位向量，覆盖 ±x/±y/±z。 */
  direction: Vec3;
  /** 中心到该镜像的距离，等于理论最近邻距离 a/2。 */
  distance: number;
};

/**
 * 为补齐超晶胞外边界而显示的同一周期位点的镜像副本。
 *
 * 本轮（T-028A）只预留类型边界，不实现其生成逻辑；后续 T-028B/C 在渲染层
 * 需要时再填充，且必须与 NaClPeriodicSite 明确区分。
 */
export type NaClDisplayInstance = {
  id: string;
  siteId: string;
  imageShift: Vec3;
  cartesian: Vec3;
};

/**
 * 常规立方晶胞的分数坐标基元位点（按子格子分组，组内索引 0..3）。
 *
 * Cl⁻ 子格子构成面心立方（FCC）骨架；Na⁺ 子格子 = Cl⁻ 子格子整体平移 (1/2,0,0)
 * （等价于沿任一基矢平移 a/2），填入八面体空隙。两类子格子各 4 个位点。
 *
 * 来源：标准 NaCl 结构（Cl⁻ 面心立方，Na⁺ 填全部八面体空隙）。
 * TODO-CHEM-VERIFY：基元位点取自 NaCl 标准晶体学表示，沿用高中教材常规立方晶胞画法。
 */
export const naclConventionalBasis: {
  chloride: Vec3[];
  sodium: Vec3[];
} = {
  chloride: [
    [0, 0, 0],
    [0, 1 / 2, 1 / 2],
    [1 / 2, 0, 1 / 2],
    [1 / 2, 1 / 2, 0],
  ],
  sodium: [
    [1 / 2, 0, 0],
    [1 / 2, 1 / 2, 1 / 2],
    [0, 0, 1 / 2],
    [0, 1 / 2, 0],
  ],
};

/** 常规立方晶胞边长 a。取 2 使坐标系与现有 nacl.json 的 ±1 尺度量级一致（本内核不读 nacl.json）。 */
export const NACL_LATTICE_PARAMETER = 2;

/**
 * Na⁺ 与 Cl⁻ 的理论最近邻距离 = a/2。
 *
 * NaCl 中 Na⁺ 位于 (1/2,0,0)，其最近邻 Cl⁻ 位于 (0,0,0)，位移 (−1/2,0,0)，
 * 距离 a/2。六个最近邻方向为 ±x、±y、±z（每方向各 ±a/2）。
 * TODO-CHEM-VERIFY：Na-Cl 最近邻距离 a/2、方向沿三轴 ±，为 NaCl 标准结构结果。
 */
export const NACL_NEAREST_DISTANCE = NACL_LATTICE_PARAMETER / 2;

/** 晶格超晶胞中心（分数坐标），用于把 [0,size) 范围整体平移到以原点为中心。 */
export function centerFractional(frac: Vec3, size: number): Vec3 {
  const half = size / 2;
  return [frac[0] - half, frac[1] - half, frac[2] - half];
}

/** 分数坐标 → 笛卡尔坐标（乘以晶格常数 a）。 */
export function fractionalToCartesian(frac: Vec3): Vec3 {
  return [
    frac[0] * NACL_LATTICE_PARAMETER,
    frac[1] * NACL_LATTICE_PARAMETER,
    frac[2] * NACL_LATTICE_PARAMETER,
  ];
}

/**
 * 把任意整数平移坐标压回 [0, size) 范围（周期性边界规范化）。
 * 用于判断一个绝对分数坐标对应的 canonical 基元位点与整数镜像平移。
 */
export function wrapPeriodicFractional(coord: Vec3, size: number): Vec3 {
  const wrap = (value: number) => {
    const modulo = ((value % size) + size) % size;
    // 规避 -0 与浮点误差：把极接近 size 的值归 0。
    return Math.abs(modulo - size) < 1e-9 || Math.abs(modulo) < 1e-9 ? 0 : modulo;
  };
  return [wrap(coord[0]), wrap(coord[1]), wrap(coord[2])];
}

/** 子格子组内索引（0..3）→ 全局 basisIndex（chloride 0..3，sodium 4..7）。 */
function globalBasisIndex(sublattice: NaClSublattice, subIndex: number): number {
  return sublattice === "chloride" ? subIndex : subIndex + naclConventionalBasis.chloride.length;
}

/**
 * 生成 N×N×N 周期超晶胞的全部独立离子位点。
 *
 * - 输出严格的 `8 * size³` 个位点（4·size³ Na⁺ + 4·size³ Cl⁻），Na⁺ 与 Cl⁻ 数量相同。
 * - 遍历顺序确定：先全 Cl⁻ 子格子（i,j,k,组内 basisIndex 升序），再全 Na⁺ 子格子。
 * - id 稳定且唯一：`nacl-${i}-${j}-${k}-${basisIndex}`（basisIndex 全局 0..7）。
 * - 笛卡尔坐标已整体居中，几何中心落在原点。
 * - 不依赖 React、R3F、Three.js；不读 nacl.json；不返回用于外边界闭合的重复显示实例。
 */
export function generateNaClPeriodicSites(size: number): NaClPeriodicSite[] {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error(`generateNaClPeriodicSites: size 必须是 >=1 的整数，收到 ${size}`);
  }

  const sites: NaClPeriodicSite[] = [];
  // 居中常量：让全部位点（含基元偏移与晶胞平移）的重心严格落在原点。
  // 常规晶胞 8 个基元位点的 fractional 重心 = 0.25（每晶胞），
  // 晶胞平移 i,j,k ∈ [0,size) 的均值 = (size-1)/2，故 centerOffset = 0.25 + (size-1)/2。
  const centerOffset = 1 / 4 + (size - 1) / 2;

  const buildSublattice = (sublattice: NaClSublattice) => {
    const basis = sublattice === "chloride" ? naclConventionalBasis.chloride : naclConventionalBasis.sodium;
    const element: "Na+" | "Cl-" = sublattice === "chloride" ? "Cl-" : "Na+";
    basis.forEach((b, subIndex) => {
      const basisIndex = globalBasisIndex(sublattice, subIndex);
      for (let i = 0; i < size; i += 1) {
        for (let j = 0; j < size; j += 1) {
          for (let k = 0; k < size; k += 1) {
            const fractional: Vec3 = [i + b[0], j + b[1], k + b[2]];
            const centered: Vec3 = [
              fractional[0] - centerOffset,
              fractional[1] - centerOffset,
              fractional[2] - centerOffset,
            ];
            const cartesian = fractionalToCartesian(centered);
            sites.push({
              id: `nacl-${i}-${j}-${k}-${basisIndex}`,
              element,
              sublattice,
              basisIndex,
              cell: [i, j, k],
              fractional,
              cartesian,
            });
          }
        }
      }
    });
  };

  // 顺序确定：先 Cl⁻ 子格子，再 Na⁺ 子格子。
  buildSublattice("chloride");
  buildSublattice("sodium");
  return sites;
}

// ---------------------------------------------------------------------------
// 配位计算（候选枚举法）
//
// 中心位点的最近邻为六个异号离子的周期镜像。Na⁺→6 个 Cl⁻ 镜像，Cl⁻→6 个 Na⁺ 镜像。
// 六个方向为 ±x、±y、±z，每个方向位移 a/2（分数坐标 1/2）。
//
// 算法：在中心 cell 的 ±1 晶胞邻域内枚举异号子格子的所有镜像位点，计算每个镜像
// 到中心的笛卡尔距离，取距离落在最近邻距离 a/2 容差内的全部镜像。这是几何上无歧义
// 的方法——直接按距离判定，不靠「晶胞内分数 0/½ 二分」推断 canonical site（后者在
// 跨越 a/2 边界时会错误地把 ±x 方向映射到同一基元位点）。
// ---------------------------------------------------------------------------

/** 最近邻距离判定的相对容差：镜像距离与 a/2 之差 < 此值视为配位最近邻。 */
const COORDINATION_TOLERANCE = 1e-6;

/** 在 sites 中按 id 查找中心位点。 */
function findSite(sites: NaClPeriodicSite[], siteId: string): NaClPeriodicSite {
  const site = sites.find((s) => s.id === siteId);
  if (!site) {
    throw new Error(`getNaClCoordinationImages: 找不到中心位点 ${siteId}`);
  }
  return site;
}

/** 三维距离。 */
function vec3Distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/**
 * 返回中心位点的 6 个最近邻异号离子周期镜像。
 *
 * - Na⁺ 中心 → 6 个 Cl⁻ 周期镜像；Cl⁻ 中心 → 6 个 Na⁺ 周期镜像。
 * - 6 个距离均等于理论最近邻距离 a/2。
 * - 6 个位移方向覆盖 ±x、±y、±z。
 * - 保留周期 `imageShift`（镜像所在 cell 相对中心 cell 的整数平移）。
 * - 不把同一 canonical site 的不同周期镜像错误合并：N=1 时多个邻居可能拥有相同
 *   siteId，但必须拥有不同 imageShift，六配位按 `siteId + imageShift` 判断唯一性。
 * - N=2、N=3 的边界位点仍返回完整六配位（候选范围 ±1 晶胞足以覆盖周期镜像补齐）。
 * - 不返回同号离子。
 *
 * 返回顺序确定：按 imageShift 字典序，再按 siteId 字典序排序。
 */
export function getNaClCoordinationImages(
  centerSiteId: string,
  sites: NaClPeriodicSite[],
  size: number,
): NaClPeriodicNeighbor[] {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error(`getNaClCoordinationImages: size 必须是 >=1 的整数，收到 ${size}`);
  }

  const center = findSite(sites, centerSiteId);
  // 配位对象为异号子格子。
  const targetSublattice: NaClSublattice = center.sublattice === "chloride" ? "sodium" : "chloride";
  const targetBasis = targetSublattice === "chloride" ? naclConventionalBasis.chloride : naclConventionalBasis.sodium;
  const targetElement: "Na+" | "Cl-" = targetSublattice === "chloride" ? "Cl-" : "Na+";

  // 枚举中心 cell 的 ±1 邻域内的晶胞整数偏移；size=1 时邻域也是 ±1（覆盖周期镜像）。
  // 居中常量与 generateNaClPeriodicSites 一致（重心居中），保证 center.cartesian 与
  // 邻居 cartesian 处于同一坐标系，距离判定正确。
  const centerOffset = 1 / 4 + (size - 1) / 2;
  const candidates: NaClPeriodicNeighbor[] = [];

  for (let di = -1; di <= 1; di += 1) {
    for (let dj = -1; dj <= 1; dj += 1) {
      for (let dk = -1; dk <= 1; dk += 1) {
        // 候选镜像所在 cell = 中心 cell + (di,dj,dk)。
        const neighborCell: Vec3 = [
          center.cell[0] + di,
          center.cell[1] + dj,
          center.cell[2] + dk,
        ];
        for (let subIndex = 0; subIndex < targetBasis.length; subIndex += 1) {
          const basisIndex = globalBasisIndex(targetSublattice, subIndex);
          // 邻居绝对分数坐标（未居中，范围可超出 [0,size)）。
          const absoluteFractional: Vec3 = [
            neighborCell[0] + targetBasis[subIndex][0],
            neighborCell[1] + targetBasis[subIndex][1],
            neighborCell[2] + targetBasis[subIndex][2],
          ];
          // 居中笛卡尔坐标（与生成器同一 centerOffset）。
          const centered: Vec3 = [
            absoluteFractional[0] - centerOffset,
            absoluteFractional[1] - centerOffset,
            absoluteFractional[2] - centerOffset,
          ];
          const cartesian = fractionalToCartesian(centered);

          const dist = vec3Distance(center.cartesian, cartesian);
          if (Math.abs(dist - NACL_NEAREST_DISTANCE) >= COORDINATION_TOLERANCE) {
            continue;
          }

          // canonical siteId：把 neighborCell wrap 到 [0,size)，得到所属 canonical 晶胞。
          const canonicalCell: Vec3 = wrapPeriodicFractional(neighborCell, size);
          const siteId = `nacl-${canonicalCell[0]}-${canonicalCell[1]}-${canonicalCell[2]}-${basisIndex}`;
          // imageShift：镜像 cell 相对中心 cell 的整数平移（保留周期镜像信息）。
          const imageShift: Vec3 = [
            neighborCell[0] - center.cell[0],
            neighborCell[1] - center.cell[1],
            neighborCell[2] - center.cell[2],
          ];
          // 方向：从中心指向镜像的单位方向（笛卡尔差归一化，方向应恰好沿 ±x/±y/±z）。
          const delta: Vec3 = [
            cartesian[0] - center.cartesian[0],
            cartesian[1] - center.cartesian[1],
            cartesian[2] - center.cartesian[2],
          ];
          const len = Math.hypot(delta[0], delta[1], delta[2]);
          const direction: Vec3 = len < 1e-9 ? [0, 0, 0] : [delta[0] / len, delta[1] / len, delta[2] / len];

          candidates.push({
            siteId,
            element: targetElement,
            imageShift,
            fractional: absoluteFractional,
            cartesian,
            direction,
            distance: dist,
          });
        }
      }
    }
  }

  // 按确定性顺序排序：imageShift 字典序，再 siteId 字典序。
  candidates.sort((x, y) => {
    for (let i = 0; i < 3; i += 1) {
      if (x.imageShift[i] !== y.imageShift[i]) return x.imageShift[i] - y.imageShift[i];
    }
    return x.siteId < y.siteId ? -1 : x.siteId > y.siteId ? 1 : 0;
  });

  return candidates;
}
