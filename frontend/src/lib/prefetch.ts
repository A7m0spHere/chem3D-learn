// 后台预热 3D viewer 的共享 chunk（three + @react-three/fiber/drei）。
// 不挂载任何 Canvas，仅在用户表现出进入 3D 模块的意图时触发一次：
// 悬停/聚焦模块卡、或在模块列表页空闲时。这样点进模块时 three/r3f 已缓存，
// 秒开；而首页等非 3D 页面仍保持轻量初始包。

let warmed = false;

export function prefetchViewerChunks(): void {
  if (warmed) return;
  warmed = true;
  // MoleculeViewer 的 chunk 依赖 three 与 r3f，import 它即可一并预热这些共享 chunk。
  void import("@/components/three/MoleculeViewer");
}
