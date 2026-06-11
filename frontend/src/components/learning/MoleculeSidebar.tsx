import type { MockMoleculeRecord } from "@/data/mockMolecules";

type MoleculeSidebarProps = {
  molecules: MockMoleculeRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function MoleculeSidebar({ molecules, selectedId, onSelect }: MoleculeSidebarProps) {
  return (
    <aside className="hidden rounded-lg border border-border bg-surface shadow-panel lg:block">
      <div className="border-b border-border bg-background px-4 py-3">
        <h2 className="text-base font-semibold text-primary-dark">经典教学案例</h2>
        <p className="mt-1 text-sm text-text-secondary">核心 VSEPR 分子与简化晶体示意</p>
      </div>

      <div className="space-y-2 p-3">
        {molecules.map((molecule) => {
          const isSelected = molecule.id === selectedId;

          return (
            <button
              key={molecule.id}
              className={`w-full rounded-md border px-3 py-3 text-left transition-colors ${
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-text-primary hover:border-primary/50 hover:bg-background"
              }`}
              onClick={() => onSelect(molecule.id)}
              type="button"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="font-semibold">{molecule.formula}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    isSelected ? "bg-white/20 text-white" : "bg-background text-text-secondary"
                  }`}
                >
                  {molecule.categoryLabelZh}
                </span>
              </span>
              <span className={`mt-1 block text-sm ${isSelected ? "text-white/85" : "text-text-secondary"}`}>
                {molecule.nameZh} · {molecule.geometryZh}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
