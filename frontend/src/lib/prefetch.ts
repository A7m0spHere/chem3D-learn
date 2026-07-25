// 后台预热进入 3D 模块所需的 chunk。不挂载任何 Canvas，仅在用户表现出进入
// 3D 模块的意图时触发一次：悬停/聚焦模块卡、或在模块列表页空闲时。这样点进
// 模块时相关 chunk 已缓存、秒开；而首页等非 3D 页面仍保持轻量初始包。
//
// 预热两类共享 chunk：
//   1. `MoleculeViewer` —— 依赖 three 与 @react-three/fiber/drei，import 它即可
//      一并预热这些重型共享 vendor chunk。
//   2. `ModuleDetailPage` —— 自 T-008 起 `/module/:id` 路由改为 lazy，页面组件
//      连同它消费的 23 个分子 JSON 成了独立 chunk。只预热 three/r3f 而不预热
//      页面 chunk 的话，点击后仍要等页面 chunk 下载才能渲染，预取意图不完整。
//      这里指向的模块路径必须与 `router.tsx` 中 `import("@/pages/ModuleDetailPage")`
//      逐字一致，才能命中同一个 chunk。
//
// 单次守卫确保「首页 / 模块列表的初始渲染」本身不触发任何预取；只有用户
// hover/focus 卡片或列表页空闲时才发起，触屏设备的普通渲染不会自动下载 3D chunk。

let warmed = false;

export function prefetchViewerChunks(): void {
  if (warmed) return;
  warmed = true;
  void import("@/components/three/MoleculeViewer");
  void import("@/pages/ModuleDetailPage");
}
