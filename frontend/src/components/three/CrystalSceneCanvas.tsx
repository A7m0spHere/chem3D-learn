import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { ReactNode } from "react";

import { SceneLighting } from "@/components/three/SceneLighting";
import type { MoleculeRecord } from "@/types/molecule";

// ---------------------------------------------------------------------------
// 晶体 cell 的 Canvas 标准块（体检第三梯队，C-2）：此前 CsCl / CaF₂ / Diamond /
// Pba / SodiumMetal / VoidStructure 各自内联同一段「Canvas(demand) +
// SceneLighting + OrbitControls」，仅灯光强度、相机回退与缩放距离不同。
// 本包装把这些参数显式化，渲染行为与原内联块逐点一致。
//
// 只覆盖简单单画布晶体页；带 CameraRig / 动态 frameloop / onCreated 的页面
// （BaTiO₃、MOF-5、Ren₃、MXene、石墨、锌金属、NaCl 工作台等）结构不同，
// 继续直接写 <Canvas>。
// ---------------------------------------------------------------------------

export type CrystalSceneCanvasProps = {
  children: ReactNode;
  molecule: MoleculeRecord;
  /** JSON 无 rendering 数据时的相机回退位（沿用各页原值） */
  cameraPosition: [number, number, number];
  /** JSON 无 rendering 数据时的相机 fov 回退（沿用各页原值） */
  cameraFov: number;
  /** 环境光强度（各页调过的值，显式传入防漂移） */
  ambient: number;
  /** 副光源强度（各页调过的值，显式传入防漂移） */
  secondaryIntensity: number;
  minDistance?: number;
  maxDistance?: number;
};

export function CrystalSceneCanvas({
  children,
  molecule,
  cameraPosition,
  cameraFov,
  ambient,
  secondaryIntensity,
  minDistance = 1.8,
  maxDistance = 6,
}: CrystalSceneCanvasProps) {
  return (
    <Canvas
      camera={{
        fov: molecule.rendering?.cameraFov ?? cameraFov,
        position: molecule.rendering?.cameraPosition ?? cameraPosition,
      }}
      frameloop="demand"
      style={{ height: "100%", width: "100%" }}
    >
      <SceneLighting
        ambient={ambient}
        mainIntensity={1.35}
        mainPosition={[4, 5, 4]}
        secondaryIntensity={secondaryIntensity}
        secondaryPosition={[-3, 2, -4]}
      />
      {children}
      <OrbitControls
        enableDamping
        enablePan={false}
        maxDistance={maxDistance}
        minDistance={minDistance}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
