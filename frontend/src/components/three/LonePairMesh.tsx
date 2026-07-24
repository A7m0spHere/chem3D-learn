import { Html } from "@react-three/drei";
import { Vector3 } from "three";
import { htmlOverlayLonePairLabelClass } from "@/components/three/htmlOverlayStyles";
import { LonePairOrbital } from "@/components/three/OrbitalPrimitives";
import type { Atom, LonePair } from "@/types/molecule";

type LonePairMeshProps = {
  atomsById: Map<string, Atom>;
  lonePair: LonePair;
  showLabel?: boolean;
};

export function LonePairMesh({ atomsById, lonePair, showLabel = true }: LonePairMeshProps) {
  const centerAtom = atomsById.get(lonePair.atomId);
  const center = centerAtom ? new Vector3(...centerAtom.position) : new Vector3(...lonePair.position);
  const target = new Vector3(...lonePair.position);
  const direction = target.clone().sub(center);
  const safeDirection = direction.lengthSq() > 0.0001 ? direction.normalize() : new Vector3(0, 1, 0);
  const directionTuple: [number, number, number] = [safeDirection.x, safeDirection.y, safeDirection.z];
  const labelPosition = center.clone().add(safeDirection.clone().multiplyScalar(centerAtom ? 1.16 : 0.76));

  return (
    <group>
      <LonePairOrbital
        direction={directionTuple}
        distance={centerAtom ? 0.44 : 0}
        length={0.52}
        opacity={0.36}
        origin={[center.x, center.y, center.z]}
        width={0.19}
      />
      {showLabel && lonePair.label ? (
        <Html center distanceFactor={7} pointerEvents="none" position={labelPosition}>
          <span className={htmlOverlayLonePairLabelClass}>{lonePair.label}</span>
        </Html>
      ) : null}
    </group>
  );
}
