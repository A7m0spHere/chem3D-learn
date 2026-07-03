import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";

export type Vec3 = [number, number, number];

export type StickMaterial = "basic" | "standard";

export interface StickCylinderProps {
  start: Vec3;
  end: Vec3;
  color: string;
  opacity?: number;
  radius?: number;
  segments?: number;
  material?: StickMaterial;
  roughness?: number;
  depthWrite?: boolean;
}

/**
 * Cylinder stretched between two points. Shared by the molecule and crystal
 * cells (previously each carried a byte-duplicated copy). Geometry is memoized
 * on scalar start/end components so prop churn elsewhere doesn't rebuild it.
 */
export function StickCylinder({
  start,
  end,
  color,
  opacity = 1,
  radius = 0.018,
  segments = 16,
  material = "basic",
  roughness = 0.45,
  depthWrite = true,
}: StickCylinderProps) {
  const { length, midpoint, quaternion } = useMemo(() => {
    const startVector = new Vector3(start[0], start[1], start[2]);
    const endVector = new Vector3(end[0], end[1], end[2]);
    const direction = new Vector3().subVectors(endVector, startVector);
    return {
      length: direction.length(),
      midpoint: new Vector3().addVectors(startVector, endVector).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize()),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start[0], start[1], start[2], end[0], end[1], end[2]]);

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, segments]} />
      {material === "standard" ? (
        <meshStandardMaterial
          color={color}
          depthWrite={depthWrite}
          opacity={opacity}
          roughness={roughness}
          transparent={opacity < 1}
        />
      ) : (
        <meshBasicMaterial
          color={color}
          depthWrite={depthWrite}
          opacity={opacity}
          transparent={opacity < 1}
        />
      )}
    </mesh>
  );
}
