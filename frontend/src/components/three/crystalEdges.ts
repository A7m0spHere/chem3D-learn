// ---------------------------------------------------------------------------
// 立方晶胞 12 条棱的端点对（体检第三梯队，C-2）：[-half, half]³ 立方体的
// 全部 12 条边。各晶体 cell 组件此前各自内联同一拓扑、仅 half 不同
// （±0.5 / ±0.68 / ±1），合并为单一真源，半宽由调用方传入。
// ---------------------------------------------------------------------------

export type CellEdge = [[number, number, number], [number, number, number]];

export function unitCellEdges(half: number): Array<CellEdge> {
  const min = -half;
  const max = half;

  // 顺序与各 cell 组件原内联数组逐条一致，避免引入渲染顺序差异
  return [
    [[min, min, min], [max, min, min]],
    [[min, min, max], [max, min, max]],
    [[min, max, min], [max, max, min]],
    [[min, max, max], [max, max, max]],
    [[min, min, min], [min, max, min]],
    [[max, min, min], [max, max, min]],
    [[min, min, max], [min, max, max]],
    [[max, min, max], [max, max, max]],
    [[min, min, min], [min, min, max]],
    [[max, min, min], [max, min, max]],
    [[min, max, min], [min, max, max]],
    [[max, max, min], [max, max, max]],
  ];
}
