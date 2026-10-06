import { Html } from "@react-three/drei";
import type { Vector3 } from "three";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// 教学标签的 <Html> 薄包装（体检第三梯队）：收敛「center + pointerEvents=
// "none" + distanceFactor + position」形态的样板（three/ 下约 69 处），并为
// 后续标签体系加固（钳制 / 避让 / 层级）提供单一落点。
//
// 只统一非交互标签的默认形态：
// - 交互层（拼装手柄、画布工具条等 pointerEvents 可点击的标签）继续直接用
//   <Html>——pointerEvents 语义不同，不该被默认值掩护；
// - 接入 useClampedHtmlPosition 的受钳标签（CalloutLabel、SceneBadge、极性
//   标签等）也继续直接用 <Html>——calculatePosition 是它们的核心行为，
//   包装一层只会增加间接性。
// distanceFactor 不设默认值：各页现值（6.8-7.8）是调过的视觉参数，统一默认
// 会造成渲染漂移，由调用点显式传入。
// ---------------------------------------------------------------------------

export type TeachingHtmlProps = {
  children: ReactNode;
  /** 世界坐标锚点（与 drei Html 的 position 同型） */
  position: Vector3 | [number, number, number];
  /** 距离缩放字号系数，沿用各页现值 */
  distanceFactor?: number;
  /** 覆盖默认层级的标签（如 z 序受限的图例徽章）才需要传 */
  zIndexRange?: [number, number];
};

export function TeachingHtml({
  children,
  distanceFactor,
  position,
  zIndexRange,
}: TeachingHtmlProps) {
  return (
    <Html
      center
      distanceFactor={distanceFactor}
      pointerEvents="none"
      position={position}
      zIndexRange={zIndexRange}
    >
      {children}
    </Html>
  );
}
