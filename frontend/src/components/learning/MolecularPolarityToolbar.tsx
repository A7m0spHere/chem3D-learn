import { Atom, FlaskConical, GitBranch, MoveRight, Triangle, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { molecularPolarityModes } from "@/data/molecularPolarity";
import { ModeToolbar } from "@/components/learning/ModeToolbar";
import type { MolecularPolarityMode } from "@/data/molecularPolarity";

type MolecularPolarityToolbarProps = {
  activeMode: MolecularPolarityMode;
  onModeChange: (mode: MolecularPolarityMode) => void;
};

const modeIcons: Record<MolecularPolarityMode, LucideIcon> = {
  electronegativity: Atom,
  bondDipole: MoveRight,
  hcl: GitBranch,
  water: Waves,
  hypochlorousAcid: FlaskConical,
  bf3: Triangle,
};

export function MolecularPolarityToolbar({
  activeMode,
  onModeChange,
}: MolecularPolarityToolbarProps) {
  return (
    <ModeToolbar
      modes={molecularPolarityModes}
      modeIcons={modeIcons}
      activeMode={activeMode}
      onModeChange={onModeChange}
    />
  );
}
