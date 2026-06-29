import { Quaternion, Vector3 } from "three";
import type { Atom, LonePair } from "@/types/molecule";

type LonePairMeshProps = {
  atomsById: Map<string, Atom>;
  lonePair: LonePair;
};

export function LonePairMesh({ atomsById, lonePair }: LonePairMeshProps) {
  const centerAtom = atomsById.get(lonePair.atomId);
  const center = centerAtom ? new Vector3(...centerAtom.position) : new Vector3(...lonePair.position);
  const target = new Vector3(...lonePair.position);
  const direction = target.clone().sub(center);
  const safeDirection = direction.lengthSq() > 0.0001 ? direction.normalize() : new Vector3(0, 1, 0);
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), safeDirection);
  const orbitalCenter = centerAtom
    ? center.clone().add(safeDirection.clone().multiplyScalar(0.72))
    : target;

  return (
    <group position={orbitalCenter} quaternion={quaternion}>
      <mesh scale={[0.32, 0.62, 0.24]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#EEF7FF"
          depthWrite={false}
          emissive="#DBEAFE"
          emissiveIntensity={0.08}
          opacity={0.34}
          roughness={0.28}
          transparent
        />
      </mesh>
      <mesh scale={[0.325, 0.625, 0.245]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#AFC7E8" opacity={0.42} transparent wireframe />
      </mesh>
      <mesh position={[-0.085, 0.12, 0.03]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#94A3B8" emissive="#CBD5E1" emissiveIntensity={0.12} roughness={0.34} />
      </mesh>
      <mesh position={[0.085, 0.12, -0.03]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#B6A26A" emissive="#F4D98B" emissiveIntensity={0.1} roughness={0.34} />
      </mesh>
    </group>
  );
}
