import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { Vector3 } from "three";
import { AtomMesh } from "@/components/three/AtomMesh";
import { BondMesh } from "@/components/three/BondMesh";
import type { AngleSpec, Atom, LonePair, MoleculeRecord, LessonStep } from "@/types/molecule";

type MoleculeViewerProps = {
  molecule: MoleculeRecord;
  activeStep: LessonStep;
  autoRotate: boolean;
  showAngles: boolean;
  showLonePairs: boolean;
};

export function MoleculeViewer({
  molecule,
  activeStep,
  autoRotate,
  showAngles,
  showLonePairs,
}: MoleculeViewerProps) {
  const atomsById = useMemo(
    () => new Map(molecule.atoms.map((atom) => [atom.id, atom])),
    [molecule.atoms],
  );
  const focusedAtomIds = new Set(activeStep.focusAtomIds ?? []);
  const focusedBondIds = new Set(activeStep.focusBondIds ?? []);
  const visibleAngleIds = new Set(activeStep.focusAngleIds ?? molecule.keyAngles.map((angle) => angle.id));

  return (
    <section className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-panel lg:min-h-[620px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">3D Viewer</h2>
          <p className="text-sm text-text-secondary">拖拽旋转，滚轮或触控板缩放</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-primary-dark">
          {molecule.formula} · {molecule.nameZh}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-[radial-gradient(circle_at_center,#ffffff_0%,#f7faf9_62%,#e8f3f0_100%)]">
        <Canvas camera={{ position: [3.6, 3, 4.2], fov: 42 }} shadows>
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 5, 3]} intensity={1.45} castShadow />
          <group rotation={[0, -0.35, 0]}>
            {molecule.bonds.map((bond) => (
              <BondMesh
                key={bond.id}
                atomsById={atomsById}
                bond={bond}
                isFocused={focusedBondIds.has(bond.id)}
              />
            ))}
            {molecule.atoms.map((atom) => (
              <AtomMesh key={atom.id} atom={atom} isFocused={focusedAtomIds.has(atom.id)} />
            ))}
            {showAngles &&
              molecule.keyAngles
                .filter((angle) => visibleAngleIds.has(angle.id))
                .map((angle) => <AngleAnnotation key={angle.id} angle={angle} atomsById={atomsById} />)}
            {showLonePairs &&
              molecule.lonePairs.map((lonePair) => (
                <LonePairMarker key={lonePair.id} lonePair={lonePair} />
              ))}
          </group>
          <OrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={1.2}
            enableDamping
            enablePan={false}
            maxDistance={8}
            minDistance={2.4}
          />
        </Canvas>
      </div>
    </section>
  );
}

type AngleAnnotationProps = {
  angle: AngleSpec;
  atomsById: Map<string, Atom>;
};

function AngleAnnotation({ angle, atomsById }: AngleAnnotationProps) {
  const points = useMemo(() => {
    const first = atomsById.get(angle.atomIds[0]);
    const vertex = atomsById.get(angle.atomIds[1]);
    const third = atomsById.get(angle.atomIds[2]);

    if (!first || !vertex || !third) {
      return null;
    }

    const vertexPosition = new Vector3(...vertex.position);
    const firstDirection = new Vector3(...first.position).sub(vertexPosition).normalize();
    const thirdDirection = new Vector3(...third.position).sub(vertexPosition).normalize();
    const firstPoint = vertexPosition.clone().add(firstDirection.multiplyScalar(0.72));
    const thirdPoint = vertexPosition.clone().add(thirdDirection.multiplyScalar(0.72));
    const labelPoint = vertexPosition
      .clone()
      .add(firstPoint.clone().sub(vertexPosition).add(thirdPoint.clone().sub(vertexPosition)).normalize().multiplyScalar(0.56));

    return { firstPoint, vertexPosition, thirdPoint, labelPoint };
  }, [angle.atomIds, atomsById]);

  if (!points) {
    return null;
  }

  return (
    <group>
      <Line
        color="#F4A261"
        lineWidth={2}
        points={[points.firstPoint, points.vertexPosition, points.thirdPoint]}
      />
      <Html center distanceFactor={6} position={points.labelPoint.toArray()}>
        <span className="whitespace-nowrap rounded-md bg-accent px-2 py-1 text-xs font-bold text-text-primary shadow-sm">
          {angle.label}
        </span>
      </Html>
    </group>
  );
}

type LonePairMarkerProps = {
  lonePair: LonePair;
};

function LonePairMarker({ lonePair }: LonePairMarkerProps) {
  return (
    <group position={lonePair.position}>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#2A9D8F" />
      </mesh>
      {lonePair.label ? (
        <Html center distanceFactor={7} position={[0, 0.18, 0]}>
          <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-xs font-semibold text-primary-dark shadow-sm">
            {lonePair.label}
          </span>
        </Html>
      ) : null}
    </group>
  );
}
