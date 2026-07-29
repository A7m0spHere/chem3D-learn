# Changelog

本文件记录 Chem3D Learn 面向用户的重要变化。

## [Unreleased]

## [0.1.0-rc.1] - 2026-07-29

### Added

- 发布首个中文结构化学 3D 学习站候选版本，覆盖分子构型、晶体结构、化学键、轨道与有机立体结构。
- 提供有机分子 3D 拼装实验室，可拖拽原子与常用片段，并在支持范围内反馈价态、分子式、官能团、键角和名称。
- NaCl Crystal Workspace 支持 1×1×1、2×2×2、3×3×3 周期模型，晶胞边框三态、具体显示副本选择、第一配位层、周期补齐镜像和配位隔离。
- 提供学习路径、考试专题、GitHub Pages 在线体验，以及适合课堂投影和移动设备的响应式布局。

### Changed

- 将多类 3D Viewer 的说明、工具栏与教学信息安排到不遮挡主要结构的区域，并为晶体场景加入外围引线标签。
- 优化 Crystal Workspace 控件分组、触控尺寸、信息层级与移动端布局。
- 收紧 NaCl 教学文案，区分 canonical 位点、边界显示副本与周期补齐镜像，并明确配位虚线不是共价键。
- 生产首页不再提前下载重型 Three.js / React Three Fiber 分包，3D 资源保持按学习意图加载。

### Fixed

- 修复 BaTiO₃ 的 O—O 轮廓标注越出 3D 画布。
- 修复 Crystal Workspace 的 WebGL 点击目标、Canvas-ready 测试稳定性，以及教学 Canvas 尚未完成事件连接时快速进入周期探索可能触发的 R3F 错误。
- 修复 GitHub Pages 深层路由在浏览器中的 SPA 恢复流程。
- 修复有机拼装中的几何、价态、命名、片段拼接与撤销行为问题。
- 修复多个晶体 Viewer 的恒显标签遮挡结构问题。

### Verified

- TypeScript production build 与 ESLint 通过。
- Playwright logic 149 / 149、production 3 / 3。
- macOS Darwin visual 146 / 146；Crystal Viewer 三轮 63 / 63，Crystal Workspace 三轮 12 / 12。
- GitHub Pages build / deploy 成功。
- NaCl 岩盐型结构、常规胞坐标、组成与第一配位层依据已用 IUCr、AFLOW、Materials Project 等来源复核。

### Known limitations

- 这是 release candidate，不是稳定版本。
- WebGL 空间离子主要依靠 pointer 选择；工具栏和选择结果已提供键盘与辅助技术支持。
- GitHub Pages 深层 URL 的首个 HTTP 响应可能是 404，随后由 SPA fallback 恢复到目标页面。
- 按需加载的 `ThreeViewerFrame` 仍有 Vite large chunk 非阻断警告。
- 前端与可选后端尚未统一结构数据真源。
- BF₃ 缺电子表述与 CaF₂ 晶胞参数仍有独立化学复核待办。
- 不提供账户、云保存、模型分享或真实能量计算。

[Unreleased]: https://github.com/A7m0spHere/chem3D-learn/compare/v0.1.0-rc.1...HEAD
[0.1.0-rc.1]: https://github.com/A7m0spHere/chem3D-learn/releases/tag/v0.1.0-rc.1
