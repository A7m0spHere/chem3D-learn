import {
  Atom,
  Eraser,
  Link2,
  Redo2,
  RotateCcw,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { builderElementConfig, builderFragmentTemplates } from "@/lib/organicBuilderChemistry";
import type {
  BuilderBond,
  BuilderBondOrder,
  BuilderElement,
  BuilderFragmentId,
} from "@/types/organicBuilder";

type OrganicBuilderToolboxProps = {
  canRedo: boolean;
  canUndo: boolean;
  selectedAtomId?: string;
  selectedAtomLabel?: string;
  selectedBond?: BuilderBond;
  selectedBondOrder: BuilderBondOrder;
  onAddAtom: (element: BuilderElement) => void;
  onAddFragment: (fragmentId: BuilderFragmentId) => void;
  onAutoFillHydrogens: () => void;
  onDetachAtom: () => void;
  onNewBlank: () => void;
  onRedo: () => void;
  onRemoveSelection: () => void;
  onReset: () => void;
  onSelectedBondOrderChange: (order: BuilderBondOrder) => void;
  onUndo: () => void;
};

const elements: BuilderElement[] = ["C", "H", "O", "N", "F", "Cl", "Br", "I"];

export function OrganicBuilderToolbox({
  canRedo,
  canUndo,
  selectedAtomId,
  selectedAtomLabel,
  selectedBond,
  selectedBondOrder,
  onAddAtom,
  onAddFragment,
  onAutoFillHydrogens,
  onDetachAtom,
  onNewBlank,
  onRedo,
  onRemoveSelection,
  onReset,
  onSelectedBondOrderChange,
  onUndo,
}: OrganicBuilderToolboxProps) {
  const selectionText = selectedAtomId
    ? `已选原子：${selectedAtomLabel ?? selectedAtomId}`
    : selectedBond
      ? `已选化学键：${selectedBond.order === 1 ? "单键" : selectedBond.order === 2 ? "双键" : "三键"}`
      : "未选择部件：新增内容将放入待连接区";

  return (
    <aside className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-overlay backdrop-blur-xl" data-testid="organic-builder-toolbox">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
          <Atom className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bold text-text-primary">分子模型盒</h2>
          <p className="text-xs text-text-secondary">先选原子，再添加即可自动连接</p>
        </div>
      </div>

      <ToolSection title="原子球">
        <div className="grid grid-cols-4 gap-2">
          {elements.map((element) => (
            <button
              aria-label={`添加 ${element} 原子`}
              className="group flex min-h-14 flex-col items-center justify-center rounded-xl border border-border bg-background transition hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/40"
              data-testid={`builder-add-${element.toLowerCase()}`}
              key={element}
              onClick={() => onAddAtom(element)}
              type="button"
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-xs font-black shadow-sm"
                style={{ backgroundColor: builderElementConfig[element].color, color: element === "C" || element === "Br" || element === "I" ? "white" : "#1F2933" }}
              >
                {element}
              </span>
              <span className="mt-1 text-[11px] text-text-secondary">{builderElementConfig[element].valence} 价</span>
            </button>
          ))}
        </div>
      </ToolSection>

      <ToolSection title="准备形成的键">
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="选择键级">
          {([1, 2, 3] as BuilderBondOrder[]).map((order) => (
            <Button
              className="h-10"
              data-testid={`builder-bond-order-${order}`}
              key={order}
              onClick={() => onSelectedBondOrderChange(order)}
              size="sm"
              variant={selectedBondOrder === order ? "default" : "outline"}
            >
              <Link2 className="mr-1.5 h-4 w-4" />
              {order === 1 ? "单键" : order === 2 ? "双键" : "三键"}
            </Button>
          ))}
        </div>
      </ToolSection>

      <ToolSection title="常用片段">
        <div className="grid grid-cols-2 gap-2">
          {builderFragmentTemplates.map((template) => (
            <Button
              className="justify-start"
              key={template.id}
              onClick={() => onAddFragment(template.id)}
              size="sm"
              variant="outline"
            >
              <Sparkles className="mr-1.5 h-4 w-4 text-accent" />
              {template.label}
            </Button>
          ))}
        </div>
      </ToolSection>

      <div className="mt-4 rounded-xl border border-border bg-background p-3">
        <p className="text-xs leading-5 text-text-secondary">{selectionText}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button disabled={!selectedAtomId} onClick={onDetachAtom} size="sm" variant="outline">
            <Eraser className="mr-1.5 h-4 w-4" />
            整体拔下
          </Button>
          <Button disabled={!selectedAtomId && !selectedBond} onClick={onRemoveSelection} size="sm" variant="outline">
            <Trash2 className="mr-1.5 h-4 w-4" />
            删除所选
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4">
        <Button disabled={!canUndo} onClick={onUndo} size="sm" variant="ghost">
          <Undo2 className="mr-1.5 h-4 w-4" />撤销
        </Button>
        <Button disabled={!canRedo} onClick={onRedo} size="sm" variant="ghost">
          <Redo2 className="mr-1.5 h-4 w-4" />重做
        </Button>
        <Button onClick={onAutoFillHydrogens} size="sm" variant="outline">
          <Sparkles className="mr-1.5 h-4 w-4" />一键补氢
        </Button>
        <Button onClick={onReset} size="sm" variant="outline">
          <RotateCcw className="mr-1.5 h-4 w-4" />恢复起点
        </Button>
        <Button className="col-span-2" onClick={onNewBlank} size="sm" variant="ghost">
          <Trash2 className="mr-1.5 h-4 w-4" />新建空白模型
        </Button>
      </div>
    </aside>
  );
}

function ToolSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">{title}</h3>
      {children}
    </section>
  );
}
