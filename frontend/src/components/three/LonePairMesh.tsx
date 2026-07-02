import { Html } from "@react-three/drei";
import { Vector3 } from "three";
import { LonePairOrbital } from "@/components/three/OrbitalPrimitives";
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
  const directionTuple: [number, number, number] = [safeDirection.x, safeDirection.y, safeDirection.z];
  const labelPosition = center.clone().add(safeDirection.clone().multiplyScalar(centerAtom ? 1.26 : 0.72));

  return (
    <group>
      <LonePairOrbital
        direction={directionTuple}
        distance={centerAtom ? 0.5 : 0}
        length={0.58}
        opacity={0.42}
        origin={[center.x, center.y, center.z]}
        width={0.25}
      />
      <Html center distanceFactor={7} pointerEvents="none" position={labelPosition}>
        <span className="whitespace-nowrap rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-[#2563EB] shadow-sm ring-1 ring-white/80">
          {lonePair.label}
        </span>
      </Html>
    </group>
  );
}
