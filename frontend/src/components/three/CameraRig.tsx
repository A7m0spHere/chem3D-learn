import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { PerspectiveCamera } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type Vec3 = [number, number, number];

type CameraRigProps = {
  position: Vec3;
  fov?: number;
  /** Re-applies the camera preset (resetting user rotation) whenever it changes. */
  resetKey?: string;
};

/**
 * Repositions the default camera when the view preset changes, so mode
 * switches don't need to remount the Canvas (which rebuilds the whole
 * WebGL context). Requires OrbitControls with `makeDefault`.
 */
export function CameraRig({ position, fov, resetKey }: CameraRigProps) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null;
  const invalidate = useThree((state) => state.invalidate);
  const [x, y, z] = position;

  useEffect(() => {
    camera.position.set(x, y, z);
    if (fov !== undefined && camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    controls?.update();
    invalidate();
  }, [camera, controls, invalidate, fov, resetKey, x, y, z]);

  return null;
}
