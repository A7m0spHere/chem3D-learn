import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Atom, Eye, EyeOff, Pause, Play } from "lucide-react";
import { useMemo } from "react";
import { AngleArc } from "@/components/three/AngleArc";
import { AtomMesh } from "@/components/three/AtomMesh";
import { BondMesh } from "@/components/three/BondMesh";
import { LonePairMesh } from "@/components/three/LonePairMesh";
import { Button } from "@/components/ui/button";
import type { MoleculeRecord, LessonStep } from "@/types/molecule";

type MoleculeViewerProps = {
  molecule: MoleculeRecord;
  activeStep: LessonStep;
  autoRotate: boolean;
  showAngles: boolean;
  showLonePairs: boolean;
  onToggleAutoRotate?: () => void;
  onToggleAngles?: () => void;
  onToggleLonePairs?: () => void;
};

export function MoleculeViewer({
  molecule,
  activeStep,
  autoRotate,
  showAngles,
  showLonePairs,
  onToggleAutoRotate,
  onToggleAngles,
  onToggleLonePairs,
}: MoleculeViewerProps) {
  const atomsById = useMemo(
    () => new Map(molecule.atoms.map((atom) => [atom.id, atom])),
    [molecule.atoms],
  );
  const focusedAtomIds = new Set(activeStep.focusAtomIds ?? []);
  const focusedBondIds = new Set(activeStep.focusBondIds ?? []);
  const visibleAngleIds = new Set(activeStep.focusAngleIds ?? molecule.keyAngles.map((angle) => angle.id));
  const displayName = molecule.names?.zh ?? molecule.nameZh;
  const cameraPosition: [number, number, number] = molecule.rendering?.cameraPosition ?? [3.6, 3, 4.2];
  const cameraFov = molecule.rendering?.cameraFov ?? 42;
  const angleRadius = molecule.rendering?.angleRadius ?? 0.82;
  const atomScale = molecule.rendering?.atomScale ?? 1;
  const bondRadius = molecule.rendering?.bondRadius ?? 0.04;
  const showAtomLabels = molecule.rendering?.showAtomLabels ?? true;
  const hasLonePairs = molecule.lonePairs.length > 0;

  return (
    <section className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-panel lg:min-h-[620px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">3D Viewer</h2>
          <p className="text-sm text-text-secondary">拖拽旋转，滚轮或触控板缩放</p>
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-primary-dark">
          {molecule.formula} · {displayName}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-[radial-gradient(circle_at_center,#ffffff_0%,#f7faf9_62%,#e8f3f0_100%)]">
        <Canvas camera={{ position: cameraPosition, fov: cameraFov }} shadows>
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 5, 3]} intensity={1.45} castShadow />
          <group rotation={[0, -0.35, 0]}>
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
                    radius={angleRadius}
                  />
                ))}
            {showLonePairs &&
              molecule.lonePairs.map((lonePair) => (
                <LonePairMesh key={lonePair.id} lonePair={lonePair} />
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

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Atom className="h-4 w-4 text-primary" aria-hidden="true" />
          {molecule.formula} · 真实 3D
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={!onToggleAutoRotate}
            onClick={onToggleAutoRotate}
            size="sm"
            type="button"
            variant={autoRotate ? "default" : "secondary"}
          >
            {autoRotate ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {autoRotate ? "暂停旋转" : "自动旋转"}
          </Button>
          <Button
            disabled={!onToggleAngles}
            onClick={onToggleAngles}
            size="sm"
            type="button"
            variant={showAngles ? "default" : "secondary"}
          >
            {showAngles ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            {showAngles ? "隐藏键角" : "显示键角"}
          </Button>
          <Button
            disabled={!hasLonePairs || !onToggleLonePairs}
            onClick={onToggleLonePairs}
            size="sm"
            type="button"
            variant={showLonePairs ? "default" : "secondary"}
          >
            {showLonePairs ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            {hasLonePairs ? "孤电子对" : "无孤电子对"}
          </Button>
        </div>
      </div>
    </section>
  );
}
