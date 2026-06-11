import { Html, Line } from "@react-three/drei";
import { useMemo } from "react";
import { QuadraticBezierCurve3, Vector3 } from "three";
import type { AngleSpec, Atom } from "@/types/molecule";

type AngleArcProps = {
  angle: AngleSpec;
  atomsById: Map<string, Atom>;
  radius?: number;
};

export function AngleArc({ angle, atomsById, radius = 0.82 }: AngleArcProps) {
  const arc = useMemo(() => {
    const first = atomsById.get(angle.atomIds[0]);
    const vertex = atomsById.get(angle.atomIds[1]);
    const third = atomsById.get(angle.atomIds[2]);

    if (!first || !vertex || !third) {
      return null;
    }

    const vertexPosition = new Vector3(...vertex.position);
    const firstDirection = new Vector3(...first.position).sub(vertexPosition).normalize();
    const thirdDirection = new Vector3(...third.position).sub(vertexPosition).normalize();
    const start = vertexPosition.clone().add(firstDirection.multiplyScalar(radius));
    const end = vertexPosition.clone().add(thirdDirection.multiplyScalar(radius));
    const centerDirection = start
      .clone()
      .sub(vertexPosition)
      .add(end.clone().sub(vertexPosition));
    if (centerDirection.lengthSq() < 0.0001) {
      centerDirection.set(0, 1, 0);
    } else {
      centerDirection.normalize();
    }
    const control = vertexPosition.clone().add(centerDirection.multiplyScalar(radius * 0.64));
    const curve = new QuadraticBezierCurve3(start, control, end);
    const points = curve.getPoints(24);
    const labelPosition = curve.getPoint(0.5).add(centerDirection.multiplyScalar(0.18));

    return { points, labelPosition };
  }, [angle.atomIds, atomsById, radius]);

  if (!arc) {
    return null;
  }

  return (
    <group>
      <Line color="#F4A261" lineWidth={2.5} points={arc.points} />
      <Html center distanceFactor={6} position={arc.labelPosition.toArray()}>
        <span className="whitespace-nowrap rounded-md border border-accent bg-white px-2 py-1 text-xs font-bold text-primary-dark shadow-sm">
          {angle.label}
        </span>
      </Html>
    </group>
  );
}
