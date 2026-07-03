import { Html, Line } from "@react-three/drei";
import { useMemo } from "react";
import { QuadraticBezierCurve3, Vector3 } from "three";
import { htmlOverlayAngleLabelClass } from "@/components/three/htmlOverlayStyles";
import type { AngleSpec, Atom } from "@/types/molecule";

type Vec3 = [number, number, number];

export type AngleArcLabelVariant = "default" | "minimal";

export type AngleArcProps = {
  angle: AngleSpec;
  atomsById: Map<string, Atom>;
  radius?: number;
  labelOffset?: Vec3;
  showGuideLine?: boolean;
  labelVariant?: AngleArcLabelVariant;
  htmlPointerEvents?: "auto" | "none";
};

const DEFAULT_LABEL_OFFSET: Vec3 = [0, 0, 0];

export function AngleArc({
  angle,
  atomsById,
  radius = 0.82,
  labelOffset = DEFAULT_LABEL_OFFSET,
  showGuideLine = false,
  labelVariant = "default",
  htmlPointerEvents = "auto",
}: AngleArcProps) {
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
    const guideStart = curve.getPoint(0.5);
    const labelPosition = guideStart
      .clone()
      .add(centerDirection.multiplyScalar(0.18))
      .add(new Vector3(...labelOffset));

    return { guideStart, points, labelPosition };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angle.atomIds, atomsById, labelOffset[0], labelOffset[1], labelOffset[2], radius]);

  if (!arc) {
    return null;
  }

  return (
    <group>
      <Line color="#F4A261" lineWidth={2.5} points={arc.points} />
      {showGuideLine ? (
        <Line
          color="#F4A261"
          lineWidth={1}
          opacity={0.72}
          points={[arc.guideStart, arc.labelPosition]}
          transparent
        />
      ) : null}
      <Html
        center
        distanceFactor={6}
        pointerEvents={htmlPointerEvents}
        position={arc.labelPosition.toArray()}
      >
        <span
          className={
            labelVariant === "minimal"
              ? "whitespace-nowrap text-[11px] font-bold text-[#B96320] drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]"
              : htmlOverlayAngleLabelClass
          }
        >
          {angle.label}
        </span>
      </Html>
    </group>
  );
}
