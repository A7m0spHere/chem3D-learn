import { Html } from "@react-three/drei";
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
};

export function AtomMesh({ atom, isFocused = false, atomScale = 1, showLabel = true }: AtomMeshProps) {
  const color = atom.color ?? elementColors[atom.element] ?? "#94A3B8";
  const radius = (atom.radius ?? 0.24) * atomScale;

  return (
    <group position={atom.position}>
      <mesh castShadow>
        <sphereGeometry args={[isFocused ? radius * 1.12 : radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.05}
          roughness={0.35}
          emissive={isFocused ? "#2A9D8F" : "#000000"}
          emissiveIntensity={isFocused ? 0.18 : 0}
        />
      </mesh>
      {showLabel ? (
        <Html center distanceFactor={7} pointerEvents="none" position={[0, radius + 0.16, 0]}>
          <span className="rounded-md border border-border bg-white/90 px-1.5 py-0.5 text-xs font-semibold text-text-primary shadow-sm">
            {atom.label}
          </span>
        </Html>
      ) : null}
    </group>
  );
}
