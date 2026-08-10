# HANDOFF.md

## 最近一次交接

- **任务**：T-039B 专题展示 Viewer 3D-first 收缩
- **日期**：2026-08-10
- **分支**：`codex/t039b-specialty-viewers`
- **基线**：`origin/main@5f3606acc7f1cb4399f94c967ced5acda05758e9`
- **阶段状态**：T-039A 已通过 PR #2 合并闭环；T-039B 实现和本地验收完成，将以当前分支的独立 Draft PR 交付。T-039C / D 尚未启动。

## 本轮改动

- 覆盖 10 个公开专题：分子极性、σ 键、π 键、sp / sp² / sp³ 杂化、离子键、配位键、乙烯平面、苯环平面、乙炔直线和有机共线共面。
- `ModuleDetailPage` 删除 7 个旧专题教学 Panel 的注册与渲染；新增最小 `SpecialtyInfoDisclosure` 包装，统一消费 T-039A 的 `StructureInfoDisclosure`，默认折叠且模块切换后恢复关闭。
- 控制密度适中的极性、σ / π、有机平面和有机共面在 `xl` 以上使用大 Viewer + 304px Inspector rail；右栏依次放真实模式控制和折叠信息。杂化 / 成键基础含进度滑杆和四个附加开关，保持纵向控制区。低于 `xl` 的全部专题都按 Viewer → Toolbar → Disclosure 排列。
- 专题数据删除只服务旧 Panel 的 description / points / examNote / facts / notes / viewerNotes 等长教学字段；新增或保留短 `state`，以及 Viewer / Toolbar 真正消费的模式 ID、短标签、标题、Viewer 标题与摘要。
- 全部真实 3D 能力保持：极性箭头与角度、σ / π 轨道重叠、标注与播放、杂化进度 / 实体轨道 / 电子云 / 未杂化 p / 坐标轴、乙烯 / 苯 / 乙炔参考平面 / 参考线 / 角弧 / π 云，以及有机共面的标签和单键旋转。
- T-039B 专题 Toolbar 的按钮显式使用 `!h-11`，避免 `size="sm"` 把触控高度压到 36px；没有修改公共 Button 或其他 Viewer 家族。
- 没有修改晶体、NaCl 周期工作台、拼装实验室、Modules / Paths、Exam、路由、模块数量、原子坐标、化学键、相机、依赖、lockfile、版本、发布配置或 Darwin 快照。

## 验证

- `npm.cmd run lint`：通过。
- `npm.cmd run build`：通过；仅保留既有按需 `ThreeViewerFrame` large chunk 警告。
- `npm.cmd run test:logic`：162 / 162 通过；新增专题数据无旧 Panel 字段、模式 ID 唯一与短状态存在契约。
- 系统 Chrome `specialty-viewers.visual.spec.ts`：7 / 7 通过；覆盖 10 个入口、旧 Panel 消失、5 类代表真实 3D 状态、1280×720 的 304px rail、1024×768 / 390×844 的纵向布局、两列移动控制、键盘 Disclosure、44px 触控与无横向溢出。
- 系统 Chrome `module-state-reset.visual.spec.ts`：5 / 5 通过；杂化、有机平面和 σ 键在 SPA 往返后模式与 Disclosure 均恢复默认。
- `npm.cmd run test:production`：4 / 4 通过；首页仍不提前加载 ModuleDetailPage 或重型 3D chunk。
- `git diff --check`：提交前复核；Windows 未运行或更新 Darwin 快照。

## 已知边界

- T-039B 只收缩专题展示 Viewer。普通晶体、`CrystalKnowledgePanel` / `CrystalTeaching`、NaCl 周期工作台与拼装实验室仍保持原实现，留给 T-039C / D。
- 304px 只用于本阶段控制密度适中的专题，不是所有 Viewer 家族的全局固定规范；杂化 / 成键基础有意保留纵向控制布局。
- 既有 Darwin 截图基线未更新；T-039D 后需在 macOS 集中人工审核布局变化。当前 Windows 只运行无截图行为测试。
- 没有开展朋友 / 同学 Alpha，也不声称获得普通学生验证；没有恢复 T-038 引导、答题、评分或题库功能。

## 下一位 Agent

1. 只对 T-039B Draft PR 做桌面与手机真实页面视觉审阅，重点检查 304px rail、杂化纵向控制区和展开后的短信息。
2. 若发现阻断项，只在当前 T-039B 分支做窄范围修正并复跑相应无截图测试；不要修改晶体、NaCl 或拼装实验室。
3. 未经项目负责人单独授权，不要转 Ready、合并或启动 T-039C。
