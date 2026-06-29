import { Button } from "@/components/ui/button";
import type { CrystalModelStyle } from "@/types/molecule";

type CrystalModelStyleToggleProps = {
  value: CrystalModelStyle;
  onChange: (style: CrystalModelStyle) => void;
};

const options: Array<{ value: CrystalModelStyle; label: string }> = [
  { value: "ballStick", label: "球棍模型" },
  { value: "packing", label: "堆积模型" },
];

export function CrystalModelStyleToggle({ value, onChange }: CrystalModelStyleToggleProps) {
  return (
    <div className="pointer-events-auto inline-flex rounded-2xl border border-border bg-white/90 p-1.5 shadow-panel backdrop-blur">
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Button
            className="h-11 rounded-xl px-4 text-sm"
            key={option.value}
            onClick={() => onChange(option.value)}
            size="sm"
            type="button"
            variant={isActive ? "default" : "ghost"}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
