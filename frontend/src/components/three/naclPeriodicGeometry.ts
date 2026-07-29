// ---------------------------------------------------------------------------
// NaCl 周期超晶胞的纯几何内核（Crystal Workspace 第一阶段 T-028A）。
//
// 这里只放无 React / R3F / Three.js 副作用的坐标、位点与配位计算，方便单测覆盖。
// 本内核不读取、不修改 frontend/src/data/manual/nacl.json；现有 NaClCell.tsx 的
// 单晶胞教学模式（27 个边界展开位置、均摊计数 4:4、siteType 显示属性）与
// NaClPeriodicCell.tsx 的周期探索模式保持数据源分离。
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
//     配位观察另有临时 ghost 镜像；三者均保持独立的数据身份与计数语义。
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
 * - `cartesian`：笛卡尔坐标，按**晶胞体积**居中（`centerFractional(fractional, size)`，
 *   即以 `size/2` 为原点），使 N×N×N 超晶胞的空间范围关于原点对称。canonical 位点
 *   集合自身的算术平均值不作为中心（正侧边界的显示镜像尚未包含在 canonical 集合中）。
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
 * （periodicImageShift 不同），尤其在 N=1 时，同一 siteId 会以不同
 * periodicImageShift 出现多次。因此六配位的唯一性按
 * `siteId + periodicImageShift` 判断，而不是只按 siteId 去重。
 *
 * 关键区分：
 *   - `cellOffset`：候选镜像晶胞相对中心位点所属晶胞的**局部整数偏移**，
 *     可能非零但仍在当前超晶胞内部（periodicImageShift 为 [0,0,0]）。
 *   - `periodicImageShift`：canonical 位点到当前镜像的**超晶胞周期平移**，
 *     每个分量表示跨越了多少个完整 N×N×N 超晶胞，恒为整数；非零值表示
 *     该镜像来自当前超晶胞外（用于 T-028B 判断幽灵粒子）。**不要用
 *     `cellOffset !== 0` 判断幽灵粒子**。
 */
export type NaClPeriodicNeighbor = {
  siteId: string;
  element: "Na+" | "Cl-";
  /** 邻居候选晶胞相对中心位点所属晶胞的整数偏移。 */
  cellOffset: Vec3;
  /**
   * canonical 位点到当前镜像的超晶胞周期平移。
   * 每个分量表示跨越了多少个完整 N×N×N 超晶胞，恒为整数。
   * 当前超晶胞内部的普通邻居为 [0,0,0]；非零值表示来自超晶胞外的周期镜像。
   */
  periodicImageShift: Vec3;
  /** 候选镜像的未居中绝对分数坐标，可超出 [0,size)。 */
  absoluteFractional: Vec3;
  /** 候选镜像在晶胞体积居中坐标系中的笛卡尔位置。 */
  cartesian: Vec3;
  /** 最近邻方向，单位向量，覆盖 ±x/±y/±z。 */
  direction: Vec3;
  /** 中心到该镜像的距离，等于理论最近邻距离 a/2。 */
  distance: number;
};

/**
 * 为补齐超晶胞外边界而显示的同一周期位点的镜像副本。
 *
 * `periodicImageShift` 与 NaClPeriodicNeighbor 同义：表示该显示副本对应的
 * 超晶胞周期平移，非零值表示它来自当前超晶胞外的周期镜像。T-028B 依据此字段
 * （而非 cellOffset）判断幽灵粒子。
 *
 * 由 generateNaClDisplayInstances 生成，且必须与 NaClPeriodicSite 明确区分。
 */
export type NaClDisplayInstance = {
  id: string;
  siteId: string;
  periodicImageShift: Vec3;
  cartesian: Vec3;
};

/**
 * 常规立方晶胞的分数坐标基元位点（按子格子分组，组内索引 0..3）。
 *
 * Cl⁻ 子格子构成面心立方（FCC）骨架；Na⁺ 子格子 = Cl⁻ 子格子整体平移 (1/2,0,0)
 * （等价于沿任一基矢平移 a/2），填入八面体空隙。两类子格子各 4 个位点。
 *
 * 已完成化学复核：见 docs/CHEMISTRY_VERIFICATION.md 的「常规晶胞与分数坐标」。
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

/**
 * 常规胞的无量纲显示尺度 a_model。
 * 取 2 使坐标系与现有 nacl.json 的 ±1 尺度量级一致；它不是 Å、nm 等物理晶格常数。
 */
export const NACL_LATTICE_PARAMETER = 2;

/**
 * Na⁺ 与 Cl⁻ 的理论最近邻距离 = a/2。
 *
 * NaCl 中 Na⁺ 位于 (1/2,0,0)，其最近邻 Cl⁻ 位于 (0,0,0)，位移 (−1/2,0,0)，
 * 距离 a/2。六个最近邻方向为 ±x、±y、±z（每方向各 ±a/2）。
 * 已完成化学复核：见 docs/CHEMISTRY_VERIFICATION.md 的「配位数与最近邻距离」。
 */
export const NACL_NEAREST_DISTANCE = NACL_LATTICE_PARAMETER / 2;

/**
 * 晶胞体积居中：把 `[0,size)` 半开周期区间整体平移到关于原点对称的 `[-size/2, +size/2]`。
 *
 * 居中的是晶胞空间范围（用于未来晶胞边框与相机目标），不是 canonical 位点
 * 列表的算术平均值——canonical 位点集合因不含正侧边界的显示镜像，平均值不为零。
 */
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
 * - `cartesian` 按**晶胞体积**居中（`centerFractional`，即 size/2 偏移），使超晶胞
 *   空间范围关于原点对称；canonical 位点集合自身的算术平均值不作为中心。
 * - 不依赖 React、R3F、Three.js；不读 nacl.json；不返回用于外边界闭合的重复显示实例。
 */
export function generateNaClPeriodicSites(size: number): NaClPeriodicSite[] {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error(`generateNaClPeriodicSites: size 必须是 >=1 的整数，收到 ${size}`);
  }

  const sites: NaClPeriodicSite[] = [];

  const buildSublattice = (sublattice: NaClSublattice) => {
    const basis = sublattice === "chloride" ? naclConventionalBasis.chloride : naclConventionalBasis.sodium;
    const element: "Na+" | "Cl-" = sublattice === "chloride" ? "Cl-" : "Na+";
    basis.forEach((b, subIndex) => {
      const basisIndex = globalBasisIndex(sublattice, subIndex);
      for (let i = 0; i < size; i += 1) {
        for (let j = 0; j < size; j += 1) {
          for (let k = 0; k < size; k += 1) {
            const fractional: Vec3 = [i + b[0], j + b[1], k + b[2]];
            const centered = centerFractional(fractional, size);
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
 * - `cellOffset`：邻居候选晶胞相对中心 cell 的局部整数偏移（可能非零但仍在当前超晶胞内）。
 * - `periodicImageShift`：canonical 位点到镜像的超晶胞周期平移（整数），非零值表示
 *   该镜像来自当前超晶胞外。**不要用 `cellOffset !== 0` 判断幽灵粒子**。
 * - 不把同一 canonical site 的不同周期镜像错误合并：N=1 时多个邻居可能拥有相同
 *   siteId，但必须拥有不同 periodicImageShift，六配位按 `siteId + periodicImageShift` 判断唯一性。
 * - N=2、N=3 的边界位点仍返回完整六配位（候选范围 ±1 晶胞足以覆盖周期镜像补齐）。
 * - 不返回同号离子。
 *
 * 返回顺序确定：按 periodicImageShift 字典序，再按 siteId 字典序排序。
 */
export function getNaClCoordinationImages(
  centerSiteId: string,
  sites: NaClPeriodicSite[],
  size: number,
): NaClPeriodicNeighbor[] {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error(`getNaClCoordinationImages: size 必须是 >=1 的整数，收到 ${size}`);
  }
  // 校验 sites 与 size 一致，避免悄悄生成不存在的 canonical siteId。
  if (sites.length !== 8 * size ** 3) {
    throw new Error(
      `getNaClCoordinationImages: sites 数量 ${sites.length} 与 size=${size} 不匹配（应为 ${8 * size ** 3}）`,
    );
  }

  const center = findSite(sites, centerSiteId);
  // 配位对象为异号子格子。
  const targetSublattice: NaClSublattice = center.sublattice === "chloride" ? "sodium" : "chloride";
  const targetBasis = targetSublattice === "chloride" ? naclConventionalBasis.chloride : naclConventionalBasis.sodium;
  const targetElement: "Na+" | "Cl-" = targetSublattice === "chloride" ? "Cl-" : "Na+";

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
          // 居中笛卡尔坐标（晶胞体积居中，与生成器同一 centerFractional）。
          const centered = centerFractional(absoluteFractional, size);
          const cartesian = fractionalToCartesian(centered);

          const dist = vec3Distance(center.cartesian, cartesian);
          if (Math.abs(dist - NACL_NEAREST_DISTANCE) >= COORDINATION_TOLERANCE) {
            continue;
          }

          // canonical siteId：把 neighborCell wrap 到 [0,size)，得到所属 canonical 晶胞。
          const canonicalCell: Vec3 = wrapPeriodicFractional(neighborCell, size);
          const siteId = `nacl-${canonicalCell[0]}-${canonicalCell[1]}-${canonicalCell[2]}-${basisIndex}`;
          // cellOffset：邻居候选晶胞相对中心 cell 的局部整数偏移。
          const cellOffset: Vec3 = [
            neighborCell[0] - center.cell[0],
            neighborCell[1] - center.cell[1],
            neighborCell[2] - center.cell[2],
          ];
          // periodicImageShift：canonical 位点到当前镜像的超晶胞周期平移（整数）。
          const periodicImageShift: Vec3 = [
            (neighborCell[0] - canonicalCell[0]) / size,
            (neighborCell[1] - canonicalCell[1]) / size,
            (neighborCell[2] - canonicalCell[2]) / size,
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
            cellOffset,
            periodicImageShift,
            absoluteFractional,
            cartesian,
            direction,
            distance: dist,
          });
        }
      }
    }
  }

  // 按确定性顺序排序：periodicImageShift 字典序，再 cellOffset，再 siteId 字典序。
  candidates.sort((x, y) => {
    for (let i = 0; i < 3; i += 1) {
      if (x.periodicImageShift[i] !== y.periodicImageShift[i]) {
        return x.periodicImageShift[i] - y.periodicImageShift[i];
      }
    }
    for (let i = 0; i < 3; i += 1) {
      if (x.cellOffset[i] !== y.cellOffset[i]) return x.cellOffset[i] - y.cellOffset[i];
    }
    return x.siteId < y.siteId ? -1 : x.siteId > y.siteId ? 1 : 0;
  });

  return candidates;
}

// ---------------------------------------------------------------------------
// 闭合显示实例（T-028B）
//
// canonical 位点集合不含正侧外边界的显示镜像（fractional 范围 [0,size)）。为了让
// [0,N]³ 晶胞区域在正侧边界视觉闭合，为位于下边界（fractional 某轴 = 0）的 canonical
// 位点生成向正侧平移一个完整超晶胞的显示副本。
//
// 关键区分：NaClDisplayInstance 只是显示用的镜像副本，**不是**新的 NaClPeriodicSite。
// 边界显示副本不重复计入化学组成。27/125/343 是「画面中的显示实例数」，
// 8/64/216 才是「周期独立离子位点数」。
// ---------------------------------------------------------------------------

/**
 * 生成用于闭合 N×N×N 超晶胞正侧边界的显示副本。
 *
 * 规则：
 * 1. 每个 canonical site 先生成一个 `periodicImageShift=[0,0,0]` 的本体副本；
 * 2. 检查该 site 的原始 fractional 坐标中哪些轴等于 0；
 * 3. 对这些零坐标轴的所有非空组合，生成向正侧平移一个完整超晶胞（shift=1）的显示副本。
 *
 * 显示位置使用重建公式：
 *   `display.cartesian[axis] = canonical.cartesian[axis] + shift[axis] * size * a`
 *
 * - 不创建新的 NaClPeriodicSite。
 * - 输出数量 = `(2*size+1)³`（N=1→27、N=2→125、N=3→343）。
 * - id 稳定唯一：`${site.id}@${shift.join(",")}`。
 * - 相同输入多次调用结果顺序与内容确定。
 */
export function generateNaClDisplayInstances(
  sites: NaClPeriodicSite[],
  size: number,
): NaClDisplayInstance[] {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error(`generateNaClDisplayInstances: size 必须是 >=1 的整数，收到 ${size}`);
  }
  if (sites.length !== 8 * size ** 3) {
    throw new Error(
      `generateNaClDisplayInstances: sites 数量 ${sites.length} 与 size=${size} 不匹配（应为 ${8 * size ** 3}）`,
    );
  }

  const a = NACL_LATTICE_PARAMETER;
  const instances: NaClDisplayInstance[] = [];

  // 三轴零坐标的所有非空组合（1..7，共 7 种），每轴分量取 0 或 1。
  const shiftCombinations: Vec3[] = [];
  for (let mask = 0; mask < 8; mask += 1) {
    const shift: Vec3 = [mask & 1 ? 1 : 0, mask & 2 ? 1 : 0, mask & 4 ? 1 : 0];
    shiftCombinations.push(shift);
  }

  for (const site of sites) {
    for (const shift of shiftCombinations) {
      // 只有当 site 在该轴 fractional=0 时，该轴的 shift=1 才生成副本。
      const valid = shift.every((s, axis) => s === 0 || Math.abs(site.fractional[axis]) < 1e-9);
      if (!valid) continue;

      const cartesian: Vec3 = [
        site.cartesian[0] + shift[0] * size * a,
        site.cartesian[1] + shift[1] * size * a,
        site.cartesian[2] + shift[2] * size * a,
      ];
      instances.push({
        id: `${site.id}@${shift.join(",")}`,
        siteId: site.id,
        periodicImageShift: shift,
        cartesian,
      });
    }
  }

  // 顺序确定：按 site 在 sites 中的顺序，再按 shiftCombinations 的固定顺序。
  // 上述遍历已是该顺序，无需额外排序，但显式保证稳定。
  return instances;
}

// ---------------------------------------------------------------------------
// 晶胞边框（T-028B）
//
// 在已居中笛卡尔空间（范围 [-N·a/2, +N·a/2]，即 [-N, +N]）生成晶胞边框线段。
// hidden=0；outer=12（外立方体）；all=3·N·(N+1)²（每个常规晶胞网格，共享边去重）。
// ---------------------------------------------------------------------------

/** 晶胞边框显示模式。 */
export type CrystalCellFrameMode = "outer" | "all" | "hidden";

/** 一条晶胞边框线段。 */
export type NaClCellFrameSegment = {
  id: string;
  start: Vec3;
  end: Vec3;
  /** outer=超晶胞外边框；internal=晶胞网格内部边。 */
  kind: "outer" | "internal";
};

/** 把一对端点规范成稳定的无向键（较小端在前，分量 join），用于去重与 id。 */
function segmentKey(start: Vec3, end: Vec3): string {
  const a = start.map((c) => c.toFixed(6));
  const b = end.map((c) => c.toFixed(6));
  const [first, second] = a.join(",") < b.join(",") ? [a, b] : [b, a];
  return `${first.join(",")}|${second.join(",")}`;
}

/**
 * 生成 N×N×N 超晶胞的晶胞边框线段。
 *
 * - `hidden`：空数组。
 * - `outer`：超晶胞外立方体的 12 条棱，坐标范围 `[-N, +N]`（a=2）。
 * - `all`：每个常规晶胞的完整网格，相邻晶胞共享的边只生成一次；数量 = `3·N·(N+1)²`
 *   （N=1→12、N=2→54、N=3→144）；每段长度 = a = 2。
 *
 * 坐标使用已居中的笛卡尔空间，与 generateNaClPeriodicSites 的 cartesian 一致。
 * 不依赖 React/R3F/Three.js。
 */
export function generateNaClCellFrameSegments(
  size: number,
  mode: CrystalCellFrameMode,
): NaClCellFrameSegment[] {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error(`generateNaClCellFrameSegments: size 必须是 >=1 的整数，收到 ${size}`);
  }

  if (mode === "hidden") {
    return [];
  }

  const a = NACL_LATTICE_PARAMETER;
  const half = (size / 2) * a; // 居中后边界，等于 size（因 a=2，size/2 * 2 = size）。
  // 边界坐标从 -half 到 +half，步长 a（一个常规晶胞边长）。
  // 顶点坐标分量取值：-half, -half+a, ..., +half，共 size+1 个。
  const linePoints: number[] = [];
  for (let i = 0; i <= size; i += 1) {
    linePoints.push(-half + i * a);
  }

  // 生成所有沿单轴、长度 a 的线段，用 segmentKey 去重。
  const segments = new Map<string, NaClCellFrameSegment>();
  const addSegment = (start: Vec3, end: Vec3) => {
    const key = segmentKey(start, end);
    if (segments.has(key)) return;
    segments.set(key, { id: `frame-${key}`, start, end, kind: "internal" });
  };

  for (const x of linePoints) {
    for (const y of linePoints) {
      // 沿 z 轴的线段
      for (let i = 0; i < size; i += 1) {
        addSegment([x, y, linePoints[i]], [x, y, linePoints[i + 1]]);
      }
      // 沿 y 轴的线段（遍历 z）
      // 已在上层循环固定 x、y，需遍历 z 才能生沿 y 的段；为避免三层嵌套混乱，
      // 这里单独遍历。
    }
  }
  // 沿 y 轴
  for (const x of linePoints) {
    for (const z of linePoints) {
      for (let i = 0; i < size; i += 1) {
        addSegment([x, linePoints[i], z], [x, linePoints[i + 1], z]);
      }
    }
  }
  // 沿 x 轴
  for (const y of linePoints) {
    for (const z of linePoints) {
      for (let i = 0; i < size; i += 1) {
        addSegment([linePoints[i], y, z], [linePoints[i + 1], y, z]);
      }
    }
  }

  if (mode === "all") {
    // all 模式返回全部线段（含外框与内部），kind 区分：
    // 外框线段 = 沿一个轴变化、另两个轴分量都位于 ±half 边界（即外立方体的棱）。
    const isOuterEdge = (start: Vec3, end: Vec3) => {
      let changingAxis = -1;
      for (let axis = 0; axis < 3; axis += 1) {
        if (Math.abs(start[axis] - end[axis]) > 1e-9) {
          if (changingAxis !== -1) return false;
          changingAxis = axis;
        }
      }
      if (changingAxis === -1) return false;
      const otherAxes = [0, 1, 2].filter((ax) => ax !== changingAxis);
      return otherAxes.every(
        (ax) =>
          Math.abs(Math.abs(start[ax]) - half) < 1e-9 &&
          Math.abs(Math.abs(end[ax]) - half) < 1e-9,
      );
    };
    return Array.from(segments.values()).map((seg) =>
      isOuterEdge(seg.start, seg.end) ? { ...seg, kind: "outer" as const } : seg,
    );
  }

  // outer 模式：只返回超晶胞外立方体的 12 条完整棱（端点为外立方体顶点 ±half）。
  // 不使用被切成 N 段的 grid 线段，保证恰好 12 条。
  const outer: NaClCellFrameSegment[] = [];
  const corners: Vec3[] = [];
  for (const sx of [-half, half]) {
    for (const sy of [-half, half]) {
      for (const sz of [-half, half]) {
        corners.push([sx, sy, sz]);
      }
    }
  }
  // 外立方体 12 条棱：顶点对之间恰有一个分量相同且另两分量在边界上、且沿一个轴跨 ±half。
  for (let i = 0; i < corners.length; i += 1) {
    for (let j = i + 1; j < corners.length; j += 1) {
      const a0 = corners[i];
      const a1 = corners[j];
      let diffAxis = -1;
      let shared = 0;
      for (let axis = 0; axis < 3; axis += 1) {
        if (Math.abs(a0[axis] - a1[axis]) > 1e-9) {
          if (diffAxis !== -1) {
            diffAxis = -2;
            break;
          }
          diffAxis = axis;
        } else {
          shared += 1;
        }
      }
      if (diffAxis >= 0 && shared === 2) {
        outer.push({ id: `frame-${segmentKey(a0, a1)}`, start: a0, end: a1, kind: "outer" });
      }
    }
  }
  return outer;
}

// ---------------------------------------------------------------------------
// 第一配位层显示模型（T-028C）
//
// 用户点击一个显示实例（canonical 本体或正侧边界镜像副本）后，围绕**被点击的那个
// 具体显示副本**展开第一配位层：中心 + 六个最近邻异号离子。
//
// 关键区分（教学正确性 + 空间正确性）：
//   - 选择身份是 `siteId + periodicImageShift`，不是单个 siteId：同一 canonical site
//     可以同时以 shift=[0,0,0] 本体和 shift 非零的边界副本出现，点击哪个就以哪个为中心。
//   - 中心可能本身是边界显示副本（selectedShift 非零），因此每个邻居的最终显示位置要
//     叠加 selectedShift：combinedShift = selectedShift + neighbor.periodicImageShift。
//   - 幽灵判定基于「当前 displayInstances 是否已包含最终显示身份 siteId+combinedShift」，
//     **不能**用 neighbor.periodicImageShift 或 cellOffset 单独判断——中心本身平移后，
//     原本在超晶胞内的邻居也可能被推到显示模型外，反之亦然。
//   - 幽灵粒子只是当前配位观察的临时周期镜像，不写回 canonical sites，也不写回
//     generateNaClDisplayInstances 的常规显示实例，不重复计入化学组成。
// ---------------------------------------------------------------------------

/** 精确显示实例选择身份：canonical siteId + 该副本的超晶胞周期平移。 */
export type NaClDisplaySelection = {
  siteId: string;
  periodicImageShift: Vec3;
};

/** 配位显示模型中的一个原子（中心或最近邻）。 */
export type NaClCoordinationDisplayAtom = {
  /** 稳定唯一 id：`${siteId}@${periodicImageShift.join(",")}`。 */
  id: string;
  siteId: string;
  element: "Na+" | "Cl-";
  /** 该原子在显示空间中的最终超晶胞周期平移（中心=selectedShift，邻居=combinedShift）。 */
  periodicImageShift: Vec3;
  cartesian: Vec3;
  role: "center" | "neighbor";
  /** true 表示该原子不在当前 displayInstances 中，是为补齐配位而临时绘制的周期镜像。 */
  isGhost: boolean;
  /** 中心→该邻居的单位方向（仅 neighbor 有）。 */
  direction?: Vec3;
  /** 中心→该邻居的距离（仅 neighbor 有，等于 NACL_NEAREST_DISTANCE）。 */
  distance?: number;
};

/** 以被点击显示副本为中心的第一配位层。 */
export type NaClCoordinationDisplayCluster = {
  center: NaClCoordinationDisplayAtom;
  neighbors: NaClCoordinationDisplayAtom[];
};

/** 显示实例身份键：siteId + shift。用于幽灵判定与选择匹配。 */
function displayIdentityKey(siteId: string, shift: Vec3): string {
  return `${siteId}@${shift.join(",")}`;
}

/**
 * 构建以被点击显示副本为中心的第一配位层显示模型。
 *
 * 算法：
 * 1. 在 displayInstances 中精确匹配被点击副本（siteId 与 periodicImageShift 三轴都相同）；
 *    找不到则抛错。
 * 2. 调用 getNaClCoordinationImages(selection.siteId, ...) 取 canonical 中心的六个周期邻居。
 * 3. 中心本身可能是边界副本：selectedShift = selection.periodicImageShift。
 *    每个邻居最终周期平移 combinedShift = selectedShift + neighbor.periodicImageShift；
 *    最终坐标 = neighbor.cartesian + selectedShift * (size * a)
 *            = canonicalNeighbor.cartesian + combinedShift * (size * a)。
 * 4. 幽灵判定：displayInstances 中存在 `neighbor.siteId + combinedShift` → 非幽灵；否则幽灵。
 * 5. 返回精确中心 + 六个异号最近邻（六个 siteId+combinedShift 唯一，距离均为 a/2）。
 *
 * 不修改输入 sites / displayInstances；不创建新的 canonical site；相同输入结果确定。
 */
export function buildNaClCoordinationDisplayCluster(
  sites: NaClPeriodicSite[],
  displayInstances: NaClDisplayInstance[],
  size: number,
  selection: NaClDisplaySelection,
): NaClCoordinationDisplayCluster {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error(`buildNaClCoordinationDisplayCluster: size 必须是 >=1 的整数，收到 ${size}`);
  }

  // 1. 精确匹配被点击的显示副本（siteId + periodicImageShift 三轴相同）。
  const selectedInstance = displayInstances.find(
    (inst) =>
      inst.siteId === selection.siteId &&
      inst.periodicImageShift[0] === selection.periodicImageShift[0] &&
      inst.periodicImageShift[1] === selection.periodicImageShift[1] &&
      inst.periodicImageShift[2] === selection.periodicImageShift[2],
  );
  if (!selectedInstance) {
    throw new Error(
      `buildNaClCoordinationDisplayCluster: 找不到显示副本 ${displayIdentityKey(selection.siteId, selection.periodicImageShift)}`,
    );
  }

  const centerSite = sites.find((s) => s.id === selection.siteId);
  if (!centerSite) {
    throw new Error(`buildNaClCoordinationDisplayCluster: 找不到 canonical 中心位点 ${selection.siteId}`);
  }

  // 当前显示模型的身份集合，用于幽灵判定。
  const displayKeySet = new Set(
    displayInstances.map((inst) => displayIdentityKey(inst.siteId, inst.periodicImageShift)),
  );

  const period = size * NACL_LATTICE_PARAMETER;
  const selectedShift = selection.periodicImageShift;

  // 中心显示副本本身。
  const center: NaClCoordinationDisplayAtom = {
    id: displayIdentityKey(centerSite.id, selectedShift),
    siteId: centerSite.id,
    element: centerSite.element,
    periodicImageShift: [...selectedShift] as Vec3,
    cartesian: [...selectedInstance.cartesian] as Vec3,
    role: "center",
    isGhost: false,
  };

  // 2. canonical 中心的六个周期邻居。
  const canonicalNeighbors = getNaClCoordinationImages(selection.siteId, sites, size);

  // 3-4. 叠加 selectedShift，判定幽灵。
  const neighbors: NaClCoordinationDisplayAtom[] = canonicalNeighbors.map((neighbor) => {
    const combinedShift: Vec3 = [
      selectedShift[0] + neighbor.periodicImageShift[0],
      selectedShift[1] + neighbor.periodicImageShift[1],
      selectedShift[2] + neighbor.periodicImageShift[2],
    ];
    const cartesian: Vec3 = [
      neighbor.cartesian[0] + selectedShift[0] * period,
      neighbor.cartesian[1] + selectedShift[1] * period,
      neighbor.cartesian[2] + selectedShift[2] * period,
    ];
    const key = displayIdentityKey(neighbor.siteId, combinedShift);
    return {
      id: key,
      siteId: neighbor.siteId,
      element: neighbor.element,
      periodicImageShift: combinedShift,
      cartesian,
      role: "neighbor" as const,
      isGhost: !displayKeySet.has(key),
      direction: [...neighbor.direction] as Vec3,
      distance: neighbor.distance,
    };
  });

  return { center, neighbors };
}
