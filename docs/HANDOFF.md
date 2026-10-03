# HANDOFF.md

## 当前任务

- **任务**：体检第二梯队——mock 层退役 + 23 份 JSON 按模块懒加载（2026-09-30，Claude Code，直接 push）。ModuleDetailPage chunk **165.5KB → 80.4KB（gzip 42.4 → 23.4）**，23 份结构 JSON 变为按需加载的独立小 chunk。
- **前序同日**：T-042、Phase 1 审计、文档整理、杂化体系、D-051/D-052、Phase 2 收口（含算法单向让位 + fadeTo 默认关闭落实）、backend 门禁、批次 A（移动端 340px 下限 + 推荐卡去重）。

## 本次改了什么

- **`data/mockMolecules.ts` 重写为懒加载器（约 425 行 → 40 行）**：
  - 删除 9 个 mock 记录（约 300 行）——`mergeMoleculeData` 本就无条件用 JSON 覆盖全部结构字段，mock 只贡献 5 个 UI 元数据字段，其中 **4 个零消费**（commonMistakeZh / centralAtomZh / lonePairsTextZh / categoryLabelZh 无任何渲染点），唯一活字段 geometryZh（vsepr 分子）提取为 9 条短语查表 `GEOMETRY_ZH_BY_ID`，晶体分子继续走 `crystal.typeZh`。
  - 新 API：`loadMoleculeData(id)`（`import.meta.glob` 非急速加载，未知 id 返回 undefined）+ `moleculeGeometryZh(record)`。
- **`ModuleDetailPage.tsx` 异步化**：同步查表改 `useEffect` + 三态 `MoleculeState`（loading / missing / ready）——loading 渲染 `ViewerChunkFallback` 骨架（与 chunk 加载的 Suspense fallback 同视觉），**只有确认 missing 才进 placeholder**，消除懒加载窗口闪现「引导学习」面板的问题。`molecule` 对象在 ready 态附加 geometryZh，下游 viewer/panel/FactBox 全部兼容。
- **`src/vite-env.d.ts` 新建**：`/// <reference types="vite/client" />`——项目首次使用 `import.meta.glob`，此前没有 Vite 客户端类型声明。
- **glob pattern 教训（重要）**：必须用 **root 绝对 pattern** `/src/data/manual/*.json`——相对 pattern（`./manual/*.json`）在 dev 下返回模块相对 key、build 下返回 root 绝对 key，查找只匹配其一时另一环境必然查不到（首跑实测：build 正常、dev 全部模块 404 到 placeholder、visual 套件 96 失败 52 分钟）。
- **`tests/logic/chemistry-content.logic.spec.ts`**：BF₃ 守卫原读取 mockMolecules **源码文本**钉住「所有原子都缺电子」句——mock 层退役后改为断言 `bf3.json`（该句在 JSON 中本就存在，T-033 核验文案的双载体只保留 JSON 一侧）。
- **文档**：AGENTS.md 更新 mockMolecules 描述（注册制 → glob 自动生效）；HANDOFF（本文件）。

## 验证

- `npm run build` 通过：**ModuleDetailPage chunk 165.5 → 80.4KB**；ch4/mof5/nacl 等 JSON 成为独立懒加载 chunk（dist/assets/ch4-*.js 等）。
- lint 通过；logic **163/163**；visual 全套 **177/177**（11.2 分钟；32 条路由全部走新的异步数据路径，含 module-state-reset / preload-recovery / organic-builder 转场等交互测试）。
- vite-env.d.ts 为标准 Vite 脚手架声明，不引入运行时代码。

## 遗留问题

- 「标签×信息卡」遮挡（360px 下 p1 徽章躲进杂化信息卡）待入台账处理。
- 体检第三梯队：TeachingHtml 包装器（79 处 Html 样板）、晶体 cell 样板合并（~600 行）、ChemCanvas wrapper、ModuleDetailPage registry 表格化、three chunk 函数式 manualChunks 隔离 + 体积守卫、11 条路由基线补齐、tsconfig 强化。
- video 采集管线修复 + 素材重采 → rc.2 发布 → T-031 反馈重启；backend 冻结决策。

## 下一步建议

1. 体检第三梯队第一批：TeachingHtml 包装器 + 晶体样板合并（约 600 行收益，需过一遍视觉基线 QA）。
2. three chunk 函数式 manualChunks 隔离 + CI 体积守卫（S）。
