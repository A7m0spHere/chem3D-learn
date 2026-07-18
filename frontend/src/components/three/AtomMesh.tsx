import { Html, Line } from "@react-three/drei";
import { useMemo } from "react";
import { AtomPullHandle } from "@/components/three/AtomPullHandle";
import { htmlOverlayLabelClass } from "@/components/three/htmlOverlayStyles";
import type { Atom } from "@/types/molecule";

const elementColors: Record<string, string> = {
  C: "#1F2933",
  H: "#FFFFFF",
};

type AtomMeshProps = {
  atom: Atom;
  isFocused?: boolean;
  atomScale?: number;
  showLabel?: boolean;
  isPulling?: boolean;
  onPullIntent?: (atomId: string) => void;
  pullProgress?: number;
};

export function AtomMesh({
  atom,
  isFocused = false,
  atomScale = 1,
  showLabel = true,
  isPulling = false,
  onPullIntent,
  pullProgress = 0,
}: AtomMeshProps) {
  const color = atom.color ?? elementColors[atom.element] ?? "#94A3B8";
  const radius = (atom.radius ?? 0.24) * atomScale;
  const pullDirection = useMemo(() => {
    const length = Math.hypot(...atom.position);
    if (length < 0.001) return [0.82, 0.46, 0.34] as [number, number, number];
    return atom.position.map((value) => value / length) as [number, number, number];
  }, [atom.position]);
  const displayPosition = atom.position.map(
    (value, index) => value + pullDirection[index] * 0.58 * pullProgress,
  ) as [number, number, number];

  return (
    <group position={displayPosition}>
      {onPullIntent ? (
        <mesh scale={isPulling ? 1.4 : 1.22}>
          <sphereGeometry args={[radius, 24, 24]} />
          <meshBasicMaterial color={isPulling ? "#F4A261" : "#2A9D8F"} opacity={isPulling ? 0.2 : 0.06} transparent />
        </mesh>
      ) : null}
      <mesh scale={isFocused || isPulling ? 1.12 : 1}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.05}
          roughness={0.35}
          emissive={isPulling ? "#F4A261" : isFocused ? "#2A9D8F" : "#000000"}
          emissiveIntensity={isPulling ? 0.28 : isFocused ? 0.18 : 0}
        />
      </mesh>
      {showLabel ? (
        <>
          <Line
            color="#64748B"
            lineWidth={1}
            opacity={0.7}
            points={[[0, radius * 0.86, 0], [0, radius + 0.24, 0]]}
            transparent
          />
          <Html center distanceFactor={7} pointerEvents="none" position={[0, radius + 0.34, 0]}>
          <span className={htmlOverlayLabelClass}>
            {atom.label}
          </span>
          </Html>
        </>
      ) : null}
      {onPullIntent && !isPulling ? (
        <AtomPullHandle atomId={atom.id} label={atom.label} onPullIntent={onPullIntent} />
      ) : null}
    </group>
  );
}
