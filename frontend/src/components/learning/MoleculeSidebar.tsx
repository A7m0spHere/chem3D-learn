import type { MockMoleculeRecord } from "@/data/mockMolecules";

type MoleculeSidebarProps = {
  molecules: MockMoleculeRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function MoleculeSidebar({ molecules, selectedId, onSelect }: MoleculeSidebarProps) {
  // Group molecules by categoryLabelZh
  const groupedMolecules = molecules.reduce((acc, molecule) => {
    const cat = molecule.categoryLabelZh || "其他";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(molecule);
    return acc;
  }, {} as Record<string, MockMoleculeRecord[]>);

  return (
    <aside className="hidden h-full flex-col overflow-y-auto rounded-3xl border border-border bg-white shadow-sm lg:flex scrollbar-thin">
      <div className="sticky top-0 z-10 border-b border-border bg-background/90 px-6 py-5 backdrop-blur-md">
        <h2 className="text-lg font-bold text-text-primary">教学案例</h2>
        <p className="mt-1 text-xs text-text-secondary">选择结构模型进行观察</p>
      </div>

      <div className="p-4 space-y-6">
        {Object.entries(groupedMolecules).map(([category, items]) => (
          <div key={category}>
            <h3 className="mb-3 px-2 text-xs font-semibold tracking-wider text-primary/70">
              {category}
            </h3>
            <div className="space-y-2">
              {items.map((molecule) => {
                const isSelected = molecule.id === selectedId;

                return (
                  <button
                    key={molecule.id}
                    className={`group w-full rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                      isSelected
                        ? "border-primary/50 bg-primary-light/40 shadow-sm ring-1 ring-primary/20"
                        : "border-transparent bg-background hover:border-border hover:bg-white hover:shadow-sm"
                    }`}
                    onClick={() => onSelect(molecule.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-serif text-xl font-bold ${isSelected ? "text-primary-dark" : "text-text-primary group-hover:text-primary"}`}>
                        {molecule.formula}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className={isSelected ? "font-medium text-primary-dark" : "text-text-primary"}>
                        {molecule.nameZh}
                      </span>
                      <span className={`rounded px-2 py-0.5 ${isSelected ? "bg-primary/10 text-primary-dark" : "bg-border/50 text-text-secondary"}`}>
                        {molecule.geometryZh}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
