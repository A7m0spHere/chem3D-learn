import type { Atom } from "@/types/molecule";

// ---------------------------------------------------------------------------
// 晶体 viewer 共享「原子球对照图例」。
//
// 目标：把原本贴在 3D 原子上、会遮挡视图的浮动标签，替换成一个常驻脚注图例——
// 左边是按真实相对大小 + 真实颜色渲染的球，右边是对应离子/原子名称。
//
// 数据来源是各 viewer 传入的 `molecule.atoms`（手写 JSON）：图例颜色和相对大小
// 都直接取自数据里的 `color` / `radius`，因此图例与画布里真实渲染的球一致，
// 不再是等大色点。
//
// 之所以做成共享组件：此前 6 个 viewer 各自私有定义 AtomLegend/LegendItem，
// 是重复实现且都不体现真实球大小。这里收敛为单一真源，先铺到 4 个数据驱动的
// 核心晶体（NaCl / CsCl / BaTiO₃ / CaF₂），验证后再扩展到其余 viewer。
// ---------------------------------------------------------------------------

// 图例圆点的像素尺寸范围：最小的元素球映射到 MIN_PX，最大的映射到 MAX_PX，
// 其余按 radius 线性插值。这样既体现相对大小差异，又不会让某个球小到看不见
// 或大到撑破脚注行高。
const MIN_PX = 10;
const MAX_PX = 20;

type LegendEntry = {
  element: string;
  label: string;
  color: string;
  radius: number;
};

/**
 * 从 atoms 里按元素去重，得到每种元素的代表 label / 颜色 / 半径。
 * 同一元素可能在不同位点有不同 radius（晶胞顶点/面心球会做视觉微调），
 * 取该元素出现过的最大 radius 作为代表，保证图例里"最大的球"与画布观感一致。
 */
export function deriveLegendEntries(atoms: Atom[]): LegendEntry[] {
  const byElement = new Map<string, LegendEntry>();
  for (const atom of atoms) {
    const existing = byElement.get(atom.element);
    const radius = atom.radius ?? 0.08;
    if (!existing) {
      byElement.set(atom.element, {
        element: atom.element,
        label: atom.label,
        color: atom.color ?? "#64748B",
        radius,
      });
    } else if (radius > existing.radius) {
      existing.radius = radius;
    }
  }
  return [...byElement.values()];
}

/** 把一组 radius 线性映射到 [MIN_PX, MAX_PX] 像素直径。 */
function radiusToPx(radius: number, minRadius: number, maxRadius: number): number {
  if (maxRadius <= minRadius) return MAX_PX;
  const t = (radius - minRadius) / (maxRadius - minRadius);
  return Math.round(MIN_PX + t * (MAX_PX - MIN_PX));
}

type CrystalAtomLegendProps = {
  atoms: Atom[];
};

/**
 * 常驻脚注图例：每项为「按真实相对大小 + 颜色的球 + 名称」。
 * 挂在 ThreeViewerFrame 的 footerMeta 槽位。
 */
export function CrystalAtomLegend({ atoms }: CrystalAtomLegendProps) {
  const entries = deriveLegendEntries(atoms);
  if (entries.length === 0) return null;

  const radii = entries.map((entry) => entry.radius);
  const minRadius = Math.min(...radii);
  const maxRadius = Math.max(...radii);

  return (
    <ul
      aria-label="原子对照图例"
      className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs"
    >
      {entries.map((entry) => {
        const px = radiusToPx(entry.radius, minRadius, maxRadius);
        return (
          <li className="inline-flex items-center gap-1.5 whitespace-nowrap" key={entry.element}>
            {/* 固定 MAX_PX 见方的容器，让不同大小的球都在同一基线居中对齐。 */}
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center"
              style={{ width: MAX_PX, height: MAX_PX }}
            >
              <span
                className="rounded-full ring-1 ring-black/10"
                style={{ width: px, height: px, backgroundColor: entry.color }}
              />
            </span>
            <span className="font-medium text-text-secondary">{entry.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
