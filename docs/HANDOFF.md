# HANDOFF.md

## 当前任务

- **任务**：T-043 Phase 2 收口——Ren₃ 注释层 + 极性原子标签碰撞组（2026-09-30，Claude Code，直接 push）。至此 Phase 2 三项缺陷全部修复。
- **前序同日**：T-042（PR #10）、Phase 1 审计（PR #11）、文档整理（PR #12）、杂化体系（PR #13）、输出模式 D-051（PR #14）、交付流程 D-052（直接 push）。

## 本次改了什么

- **`Ren3Cell.tsx`（台账缺陷 2）**：压力窗口的模型边界注释「预测稳定 ≠ 已实验确认；晶格不按压力条比例形变」原为独立悬浮层，锚点落在压力图例卡视觉足迹内被 68-100% 完全遮盖。修复：**注释并入图例卡第三行**（分隔线 + 11px slate-500），独立层删除——注释本就是在解释压力条，合并后内容可达、叠印从结构上不可能。守卫：ren3-callout 新增断言（注释恰好一次 + 可见 + 是图例卡后代节点）。
- **`MolecularPolarityCell.tsx`（台账缺陷 3）**：`TinyAtomLabel` / `ChargeMarker` 接入 `useClampedHtmlPosition`（`polarity-callout` 碰撞组，与 TinyDipoleLabel 同组），三个组件统一挂 `data-polarity-label` 测试锚点。修复前「电子云偏向 F」×「F」45-61%、「B」×「F 更吸电子」27-31%（360/390/768）。
- **`useClampedHtmlPosition.ts`（算法语义修正）**：分离改为**严格单向让位**——只让位于更早注册（id 更小）的标签。原双向互推会让 A 推开 B 后 B 又推开 A，逐帧互赶、随 demand 帧数冻结在任意中间态（极性页实测同一对标签先后采样 25% / 31%）；单向化后一次确定收敛，D-050「后计算者让先计算者」的本意至此才真正成立（已补 D-050 实现勘误）。注意：id 顺序 = 挂载顺序，先挂载者保持锚点、后挂载者让位。
- **守卫**：新增 `polarity-labels.visual.spec.ts`（360/390/768 × 出界 0 + 互叠 **≤5%**——阈值取 5% 而非 25%，白底 pill 叠白底时 25% 面积重叠就足以盖断文字）；ren3-callout 追加上述注释守卫。
- **文档**：TASKS T-043 状态（Phase 2 完成）、DECISIONS D-050 勘误第 3 条、HANDOFF（本文件）。

## 验证

- 守卫与回归：polarity-labels 3/3、hybrid-scene-labels 3/3、ren3-callout（含新守卫）、mof5-callout、molecular-polarity、specialty-viewers、three-viewer-frame、crystal-viewer、molecule-viewer 合计 **99/99**；build / lint 通过。
- 目检：Ren₃ 1280（注释成为卡片可读第三行）、极性 360（全部标签清晰、零遮挡）。
- **基线预期**：`ren3-pressure-window-viewer.png` 将报告差异（注释从被遮盖变为可见，预期内改进）；极性三张基线（1280 默认视口无叠印）与另两张 ren3 基线预期零差异。**落地后需跑 verify 确认差异范围，再走 rebuild 通道更新 ren3 基线。**

## 遗留问题

- T-043 收尾两件：密堆积配位视图布局缺陷（原缺陷②，随 T-041-B rebuild 周期）→ 修完后逐 viewer 启用 fadeTo；「标签×信息卡」遮挡（360px 下 p1 徽章躲进杂化信息卡）待入台账。
- T-041-B/C/D、全项目体检优化清单、video 采集管线、rc.2 发布路径——见前次 HANDOFF 与体检报告。

## 下一步建议

1. 跑 `verify` 确认基线差异仅 ren3-pressure-window，触发 rebuild 更新该基线并人工审核。
2. 第二步：体检第一梯队快速赢（死代码删除、仓库卫生、CI 补 backend 测试）。
