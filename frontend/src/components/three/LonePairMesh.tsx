import { Html } from "@react-three/drei";
import type { LonePair } from "@/types/molecule";

type LonePairMeshProps = {
  lonePair: LonePair;
};

export function LonePairMesh({ lonePair }: LonePairMeshProps) {
  return (
    <group position={lonePair.position}>
      <mesh scale={[1.18, 0.72, 0.9]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial
          color="#F4A261"
          emissive="#F4A261"
          emissiveIntensity={0.16}
          opacity={0.34}
          roughness={0.28}
          transparent
        />
      </mesh>
      <mesh position={[-0.07, 0.02, 0.04]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#E76F51" />
      </mesh>
      <mesh position={[0.07, -0.02, -0.04]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#E76F51" />
      </mesh>
      {lonePair.label ? (
        <Html center distanceFactor={8} position={[0, 0.22, 0]}>
          <span className="rounded-full border border-accent bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-primary-dark shadow-sm">
            e-
          </span>
        </Html>
      ) : null}
    </group>
  );
}
