# BACKEND_DATA_SYNC.md

> 前后端结构数据去重方案（T-005）。先设计后实现的设计文档 + 已落地的第一步（防漂移契约测试）。
> 关联决策见 `docs/DECISIONS.md` D-018。

## 背景

- 前端 `frontend/src/data/manual/` 下 23 个手写 JSON 是**结构数据的唯一真源**（源码即真源，见 AGENTS.md / D-001）。
- 后端 `backend/src/molecules.js` 独立维护了 6 条记录（`ch4` / `nh3` / `h2o` / `co2` / `bf3` / `nacl`），是前端数据的**第二份手写副本**，存在数据漂移风险。
- 目标：在**不引入数据库、不引入运行时大依赖、不让前端依赖后端**的前提下，去重 / 防漂移。

## 现状核实（2026-07-26 实测）

对比后端 6 条记录与前端同名 JSON：

| id | 结构核心（atoms/bonds/formula/names/nameZh/category/kind/lonePairs） | 教学字段（summaryZh/lessonSteps/keyAngles/rendering/metadata） |
| --- | --- | --- |
| ch4 | **逐字一致** | 已漂移（summaryZh、lessonSteps 文案不同） |
| nh3 | **逐字一致** | 已漂移（summaryZh、rendering 不同） |
| h2o | **逐字一致** | 已漂移（summaryZh、rendering 不同） |
| co2 | **逐字一致** | 已漂移（summaryZh、lessonSteps、keyAngles 不同） |
| bf3 | **逐字一致** | 已漂移（summaryZh、lessonSteps、keyAngles、rendering 不同） |
| nacl | **已实质分叉** | — |

关键发现：

- **5 个 VSEPR 分子的结构核心已经是逐字一致的**（`id` / `kind` / `formula` / `names` / `nameZh` / `category` / `atoms` / `bonds` / `lonePairs` 全等）。它们的差异只在「教学表现字段」——后端serving的是更早/更简的教学文案，前端是当前课堂版本。
- **`nacl` 是有意的教学简化，不是意外漂移**：后端 serving 15 原子的简化晶胞，前端是 27 原子完整晶胞；二者是**不同抽象层次的教学模型**，不应强行统一。历史审计时前端还带有 `crystalTeaching`，该兼容字段已在 T-039D 删除，不影响这里记录的结构分叉。

## 设计原则

1. **前端 JSON 是唯一真源**，后端永远是「读取 / 映射」的下游，绝不反向。
2. **前端零后端依赖**：前端构建 / 运行不读取后端任何产物；后端可选地读取前端 JSON。
3. **不引入数据库、ORM、构建期打包器、schema 校验运行时**（如 ajv）——保持 backend「纯 `node:http` + 零运行时依赖」的既定边界（D-001 / D-002）。
4. **结构核心可去重，教学表现可分叉**：结构（原子/键/式/分类）必须一致；教学文案（summaryZh/lessonSteps）允许后端有自己的精简版本，因为后端面向的是「只读 API 消费者」而非课堂 UI。
5. **`nacl` 的分叉是决策，不是 bug**：契约里显式豁免 nacl 的结构相等，只断言「双方都存在、都是 crystal」。

## 方案分级（先契约，后按需去重）

### 第 0 步（已落地）：防漂移契约测试

- **落地物**：`backend/test/data-parity.test.js`。
- **做法**：测试运行时用 `node:fs` 读取 `frontend/src/data/manual/<id>.json`（相对路径 `../frontend/...`），与 `backend/src/molecules.js` 导出的记录逐字段深比较**结构核心**。
- **断言**：
  - 后端 serving 的 6 个 id 与预期列表一致。
  - `ch4`/`nh3`/`h2o`/`co2`/`bf3` 的结构核心（9 个稳定字段）与前端 JSON `deepEqual`。
  - `nacl` 只断言「前后端都存在且 `category==="crystal"`」，显式记录为有意分叉、豁免结构相等。
- **效果**：任何一方之后改了 5 个分子的原子/键/式/分类而没同步，`backend npm test` 立刻失败。这是**最低风险**的去重——不改任何 serving 数据、不加依赖、前端照常独立，只加一道回归护栏。前端 JSON 缺失时测试直接失败并提示，不会静默通过。

### 第 1 步（可选，未实现）：后端启动时从前端 JSON 装载结构核心

- 后端 `molecules.js` 改为启动时 `fs.readFileSync` 读入 5 个前端 JSON 的结构核心，与后端自留的教学字段合并，彻底删除结构字段的第二份手写副本。
- **前提约束**：需确认后端**部署时**能访问到 `frontend/src/data/manual/`（同仓部署可以；若后端独立部署则需在构建期把 JSON 拷进后端产物目录）。因为部署边界当前**待确认**（见 PROJECT_STATUS），此步暂不实现。
- 采用前需要：明确后端发布产物如何包含前端 JSON（构建期 copy 脚本 vs 同仓相对路径），并保证 `nacl` 继续用后端自己的简化副本。

### 第 2 步（可选，未实现）：共享 TypeScript 类型已就绪

- 后端已通过 `backend/src/types/molecule.d.ts` + JSDoc `@typedef` 复用类型定义，类型层已不重复。无需额外动作。

## 发布边界（明确）

- **同仓部署**（前后端在同一仓库/镜像）：第 0 步的相对路径 `../frontend/src/data/manual/` 天然可用；第 1 步也可直接 `fs` 读取。
- **后端独立部署**：`../frontend/...` 不可用。此时第 0 步的**测试**仍在 CI（有完整仓库）里跑，不影响运行时；但第 1 步的**运行时**读取会失败，必须先加「构建期把 JSON 拷入后端产物」的步骤。**在部署方式确认前，不做运行时读取。**

## 验收对照（T-005）

- [x] 文档明确 Node 如何安全读取 / 生成共享数据及发布边界（本文件）。
- [x] 前端无需依赖后端即可构建和运行（方案不改前端；第 0 步只在后端测试期单向读前端 JSON）。
- [x] 后端 API 响应兼容现有测试（15 项原测试不变），并新增 7 项防漂移断言（`data-parity.test.js`）。

## 后续建议

- 若确定同仓部署，可推进第 1 步删除后端结构字段副本，把「5 个分子结构」真正做到单份。
- 教学文案（summaryZh/lessonSteps）是否要统一，取决于后端 API 消费者是谁——当前前端不调后端，API 无真实消费者，**不建议现在为对齐文案投入**。
