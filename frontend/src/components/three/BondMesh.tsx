import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import type { Atom, Bond } from "@/types/molecule";

type BondMeshProps = {
  bond: Bond;
  atomsById: Map<string, Atom>;
  isFocused?: boolean;
  radius?: number;
};

export function BondMesh({ bond, atomsById, isFocused = false, radius = 0.04 }: BondMeshProps) {
  const bondOrder =
    bond.order ??
    (bond.kind === "triple" ? 3 : bond.kind === "double" ? 2 : 1);
  const cylinderCount = Math.min(Math.max(bondOrder, 1), 3);
  const cylinderRadius = isFocused ? radius * 1.35 : radius;
  const offsetDistance = cylinderRadius * 2.5;
  const offsets =
    cylinderCount === 1
      ? [0]
      : cylinderCount === 2
        ? [-offsetDistance, offsetDistance]
        : [-offsetDistance, 0, offsetDistance];

  const geometry = useMemo(() => {
    const startAtom = atomsById.get(bond.atomIds[0]);
    const endAtom = atomsById.get(bond.atomIds[1]);

    if (!startAtom || !endAtom) {
      return null;
    }

    const start = new Vector3(...startAtom.position);
    const end = new Vector3(...endAtom.position);
    const direction = new Vector3().subVectors(end, start);
    const midpoint = new Vector3().addVectors(start, end).multiplyScalar(0.5);
    const quaternion = new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      direction.clone().normalize(),
    );

    return {
      length: direction.length(),
      midpoint,
      quaternion,
    };
  }, [atomsById, bond.atomIds]);

  if (!geometry) {
    return null;
  }

  return (
    <group position={geometry.midpoint} quaternion={geometry.quaternion}>
      {offsets.map((offset) => (
        <mesh key={offset} position={[offset, 0, 0]} castShadow>
          <cylinderGeometry args={[cylinderRadius, cylinderRadius, geometry.length, 24]} />
          <meshStandardMaterial color={isFocused ? "#F4A261" : "#B7C7C3"} roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}
