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
    <mesh position={geometry.midpoint} quaternion={geometry.quaternion} castShadow>
      <cylinderGeometry args={[isFocused ? radius * 1.35 : radius, isFocused ? radius * 1.35 : radius, geometry.length, 24]} />
      <meshStandardMaterial color={isFocused ? "#F4A261" : "#B7C7C3"} roughness={0.45} />
    </mesh>
  );
}
