import { Html, Line } from "@react-three/drei";
import { useMemo, type ReactNode } from "react";
import { Vector3 } from "three";

// ---------------------------------------------------------------------------
// 引线标签（callout）。
//
// 问题：晶体 viewer 里大量恒显场景注释用 `<Html distanceFactor position={锚点}>`
// 直接浮在结构中央/近旁，模型一转就压到晶胞上遮挡视野（见 MOF-5）。
//
// 方案：把标签从锚点沿一个「外推方向」推到结构外围不挡视野处，再用一条 3D 引线
// 从锚点连到标签。引线两端都是 3D 坐标，R3F 每帧把它们重投影到屏幕，因此随相机
// 旋转/缩放自动跟随——这与 AngleArc 的 `<Line points={[guideStart, labelPosition]}>`
// 是同一范式（drei `Line`，项目多处已用，无需引新依赖）。
//
// 相比「屏幕边缘绝对固定 + 每帧手动投影」的方案，这种「3D 外推锚点」实现简单、
// 与现有 viewer 的 demand frameloop 天然兼容，且旋转时引线端点自洽，不需要额外
// 的逐帧 JS 投影代码。代价是标签位置随视角变化而非死锁在边缘——对课堂展示足够。
// ---------------------------------------------------------------------------

type Vec3 = [number, number, number];

export type CalloutLabelProps = {
  /** 引线所指的目标点（结构上的锚点），世界坐标。 */
  anchor: Vec3;
  /** 标签相对锚点的外推偏移，把标签推到结构外不挡视野处。 */
  offset: Vec3;
  /** 标签内容（通常是带 htmlOverlay* 样式类的 span）。 */
  children: ReactNode;
  /** 引线颜色，默认中性灰。 */
  lineColor?: string;
};

/**
 * 从 `anchor` 画一条引线到 `anchor + offset` 处的标签。
 * 引线端点均为 3D 坐标，随相机变换自动重投影。
 */
export function CalloutLabel({
  anchor,
  offset,
  children,
  lineColor = "#94A3B8",
}: CalloutLabelProps) {
  const labelPosition = useMemo<Vec3>(
    () => [anchor[0] + offset[0], anchor[1] + offset[1], anchor[2] + offset[2]],
    [anchor, offset],
  );

  // 引线不一直画到标签正中心，留一小段间隙，避免线头戳进文字。
  const lineEnd = useMemo<Vec3>(() => {
    const a = new Vector3(...anchor);
    const l = new Vector3(...labelPosition);
    const dir = l.clone().sub(a);
    const len = dir.length();
    if (len < 0.0001) return labelPosition;
    // 终点回退 12% 或 0.12（取较小），在标签根部留白。
    const pullback = Math.min(0.12, len * 0.12);
    const end = l.clone().sub(dir.normalize().multiplyScalar(pullback));
    return [end.x, end.y, end.z];
  }, [anchor, labelPosition]);

  return (
    <group>
      <Line color={lineColor} lineWidth={1.5} opacity={0.7} points={[anchor, lineEnd]} transparent />
      {/* 不用 distanceFactor：标签保持固定屏幕字号，放大看结构时文字不会被等比
          放大到撑出画布。锚点与引线仍是 3D 坐标、随相机跟随；只有文字大小恒定。
          zIndexRange 压低，避免标签盖住更靠前的原子球交互（本组件 pointerEvents 已关）。 */}
      <Html center pointerEvents="none" position={labelPosition} zIndexRange={[10, 0]}>
        {children}
      </Html>
    </group>
  );
}
