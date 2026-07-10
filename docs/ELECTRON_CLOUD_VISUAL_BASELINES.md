# 电子云视觉快照基线

本清单把所有直接用于电子云、轨道云或孤对电子教学的 3D 场景集中到同一个 Playwright 套件：`frontend/tests/visual/electron-cloud-baselines.visual.spec.ts`。

## 统一捕获规则

- 视口：`1280 × 720`，浅色模式，设备像素比 `1`。
- 只截取 3D Canvas 区域；页头在捕获前隐藏，避免导航内容干扰教学模型基线。
- 每个模式切换完成后等待 `800ms`，再捕获静态基线。
- 捕获前会请求 React Three Fiber 额外绘制一帧；Canvas 使用不透明浅色背景，避免透明缓冲影响快照。
- 截图采用项目统一的 Playwright 阈值，不单独放宽单个电子云场景。

## 场景清单

| 基线 | 教学状态 | 审核重点 |
| --- | --- | --- |
| `01-nh3-lone-pair.png` | NH3 孤电子对 | 孤对电子与中心 N、说明标签分离。 |
| `02-h2o-lone-pairs.png` | H2O 两对孤电子对 | 两个云团可辨，且只保留一条教学标签。 |
| `03-organic-amine-lone-pair.png` | 胺基孤电子对 | 胺基标签避开孤对电子。 |
| `04-coordinate-bond-lone-pair.png` | 配位键提供体 | 孤对电子、空轨道与指向箭头层次清晰。 |
| `05-sigma-orbital-overlap.png` | s-p σ 键 | 头碰头重叠、键轴和原子核标签可区分。 |
| `06-pi-orbital-cloud.png` | p-p π 键成键后 | 键轴两侧电子云与肩并肩重叠提示可读。 |
| `07-hybrid-orbital-cloud.png` | 杂化轨道点云模式 | 点云密度、主瓣和副瓣的视觉层级稳定。 |
| `08-bond-polarity-cloud.png` | B-F 电子云偏移 | 偏移云团、偶极箭头和两条提示标签不遮挡。 |
| `09-ethylene-pi-cloud.png` | 乙烯 π 键 | 分子平面上下的两片电子云清晰。 |
| `10-benzene-delocalized-pi-cloud.png` | 苯环大 π 键 | 上下离域云、环骨架和“大 π 电子云”标签分离。 |
| `11-acetylene-two-pi-clouds.png` | 乙炔两组 π 键 | 两组互相垂直的电子云可分别辨认。 |
| `12-graphite-delocalized-pi-cloud.png` | 石墨层内离域 π 电子 | 云层不被碳层遮没，并与层间作用力语义区分。 |

## 集中审核结论

本次已逐张审阅全部 12 个基线：孤对电子、σ/π 云、杂化点云、极性偏移云及离域云均可辨；标签未遮住关键云团或键轴；未发现黑色透明缓冲残块。若后续模型或标签位置改变，只运行该集中套件即可确认全部电子云教学场景是否仍保持课堂投影可读性。
