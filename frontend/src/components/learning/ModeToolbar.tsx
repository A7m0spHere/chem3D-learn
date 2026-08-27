import { Atom } from "lucide-react";
import { Button } from "@/components/ui/button";

// typeof Atom 是所有 lucide 图标的统一具体类型；用具体类型（而非泛型化的
// LucideIcon/ElementType）才能在 JSX 里正常渲染并接受 className/aria-hidden。
type IconType = typeof Atom;

// 通用模式工具条：把原先 Ethylene/Acetylene/Benzene/MolecularPolarity 四个
// 近乎逐行同构的 toolbar 收敛为一个数据驱动的泛型组件。
//
// - 渲染一组 mode 按钮（map modes，按 activeMode 高亮，inactive 用 ghost）。
// - 可选 viewToggle：当 activeMode === showWhenMode 时，额外渲染一组视图
//   切换按钮（inactive 用 outline）。覆盖"俯视/侧视""正视/侧视"等场景。

type ModeOption<M extends string> = {
  id: M;
  label: string;
  title: string;
};

type ViewOption<V extends string> = {
  id: V;
  label: string;
  title: string;
  icon: IconType;
};

type ViewToggle<M extends string, V extends string> = {
  showWhenMode: M;
  options: ReadonlyArray<ViewOption<V>>;
  activeView: V;
  onViewChange: (view: V) => void;
};

export type ModeToolbarProps<M extends string, V extends string = never> = {
  modes: ReadonlyArray<ModeOption<M>>;
  modeIcons: Record<M, IconType>;
  activeMode: M;
  onModeChange: (mode: M) => void;
  viewToggle?: ViewToggle<M, V>;
};

export function ModeToolbar<M extends string, V extends string = never>({
  modes,
  modeIcons,
  activeMode,
  onModeChange,
  viewToggle,
}: ModeToolbarProps<M, V>) {
  const buttonClassName = "chem-touch-button !h-11 w-full sm:w-auto";

  return (
    <div className="chem-control-console">
      <div className="chem-control-grid">
        {modes.map((mode) => {
          const Icon: IconType = modeIcons[mode.id];
          const isActive = mode.id === activeMode;

          return (
            <Button
              className={buttonClassName}
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              size="sm"
              title={mode.title}
              type="button"
              variant={isActive ? "default" : "ghost"}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {mode.label}
            </Button>
          );
        })}

        {viewToggle && activeMode === viewToggle.showWhenMode
          ? viewToggle.options.map((opt) => {
              const Icon = opt.icon;
              const isActive = viewToggle.activeView === opt.id;

              return (
            <Button
              aria-pressed={isActive}
              className={buttonClassName}
              key={opt.id}
              onClick={() => viewToggle.onViewChange(opt.id)}
              size="sm"
              title={opt.title}
              type="button"
              variant={isActive ? "default" : "outline"}
            >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {opt.label}
                </Button>
              );
            })
          : null}
      </div>
    </div>
  );
}
