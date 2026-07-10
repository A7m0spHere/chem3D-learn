import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { AngleArc } from "@/components/three/AngleArc";
import { AtomMesh } from "@/components/three/AtomMesh";
import { BondMesh } from "@/components/three/BondMesh";
import { LonePairMesh } from "@/components/three/LonePairMesh";
import { ThreeViewerFrame } from "@/components/three/ThreeViewerFrame";
import type { MoleculeRecord, LessonStep } from "@/types/molecule";

type MoleculeViewerProps = {
  molecule: MoleculeRecord;
  activeStep: LessonStep;
  autoRotate: boolean;
  loading?: boolean;
  isGuidedMode?: boolean;
  showAngles: boolean;
  showAtomLabels?: boolean;
  showLonePairs: boolean;
  onToggleAutoRotate?: () => void;
  onToggleAngles?: () => void;
  onToggleAtomLabels?: () => void;
  onToggleLonePairs?: () => void;
};

export function MoleculeViewer({
  molecule,
  activeStep,
  autoRotate,
  loading = false,
  isGuidedMode = false,
  showAngles,
  showAtomLabels = false,
  showLonePairs,
}: MoleculeViewerProps) {
  const atomsById = useMemo(
    () => new Map(molecule.atoms.map((atom) => [atom.id, atom])),
    [molecule.atoms],
  );
  const sceneOffset = useMemo(() => {
    const positions = molecule.atoms.map((atom) => atom.position);
    const min = positions.reduce(
      (current, position) => current.map((value, index) => Math.min(value, position[index])) as [number, number, number],
      [Infinity, Infinity, Infinity] as [number, number, number],
    );
    const max = positions.reduce(
      (current, position) => current.map((value, index) => Math.max(value, position[index])) as [number, number, number],
      [-Infinity, -Infinity, -Infinity] as [number, number, number],
    );

    return [0, -(min[1] + max[1]) / 2, 0] as [number, number, number];
  }, [molecule.atoms]);
  const focusedAtomIds = new Set(isGuidedMode ? activeStep.focusAtomIds ?? [] : []);
  const focusedBondIds = new Set(isGuidedMode ? activeStep.focusBondIds ?? [] : []);
  const visibleAngleIds = new Set(activeStep.focusAngleIds ?? molecule.keyAngles.map((angle) => angle.id));
  const displayName = molecule.names?.zh ?? molecule.nameZh;
  const cameraPosition: [number, number, number] = molecule.rendering?.cameraPosition ?? [3.6, 3, 4.2];
  const cameraFov = molecule.rendering?.cameraFov ?? 42;
  const angleRadius = molecule.rendering?.angleRadius ?? 0.82;
  const atomScale = molecule.rendering?.atomScale ?? 1;
  const bondRadius = molecule.rendering?.bondRadius ?? 0.04;
  // showAtomLabels is now a runtime toggle from the parent; defaults to false

  return (
    <ThreeViewerFrame
      className="min-h-[420px] transition-shadow duration-base ease-out-soft hover:shadow-lg lg:min-h-[620px]"
      loading={loading}
      meta={isGuidedMode ? `${displayName} · 跟随讲解` : `${displayName} · 自由探索`}
      stageTestId="molecule-viewer-canvas"
      summary={isGuidedMode ? activeStep.bodyZh : "拖拽旋转、滚轮缩放；可用下方控制显示键角、孤电子对和原子标记。"}
      title={`${molecule.formula}｜${isGuidedMode ? activeStep.titleZh : "自由探索"}`}
      viewerTestId="molecule-viewer"
    >
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
        frameloop={autoRotate ? "always" : "demand"}
        gl={{ alpha: false }}
        style={{ height: "100%", width: "100%" }}
      >
          <color attach="background" args={["#F7FAF9"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 5, 3]} intensity={1.45} />
          <group position={sceneOffset} rotation={[0, -0.35, 0]}>
            {molecule.bonds.map((bond) => (
              <BondMesh
                key={bond.id}
                atomsById={atomsById}
                bond={bond}
                isFocused={focusedBondIds.has(bond.id)}
                radius={bondRadius}
              />
            ))}
            {molecule.atoms.map((atom) => (
              <AtomMesh
                key={atom.id}
                atom={atom}
                atomScale={atomScale}
                isFocused={focusedAtomIds.has(atom.id)}
                showLabel={showAtomLabels}
              />
            ))}
            {showAngles &&
              molecule.keyAngles
                .filter((angle) => visibleAngleIds.has(angle.id))
                .map((angle) => (
                  <AngleArc
                    key={angle.id}
                    angle={angle}
                    atomsById={atomsById}
                    htmlPointerEvents="none"
                    radius={angleRadius}
                  />
                ))}
            {showLonePairs &&
              molecule.lonePairs.map((lonePair, index) => (
                <LonePairMesh
                  atomsById={atomsById}
                  key={lonePair.id}
                  lonePair={lonePair}
                  showLabel={
                    !lonePair.label ||
                    molecule.lonePairs.findIndex((candidate) => candidate.label === lonePair.label) === index
                  }
                />
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
    </ThreeViewerFrame>
  );
}
