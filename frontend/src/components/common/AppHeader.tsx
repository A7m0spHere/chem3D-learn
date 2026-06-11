import { Beaker, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  currentPage: "home" | "learning";
  onNavigate: (page: "home" | "learning") => void;
};

export function AppHeader({ currentPage, onNavigate }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button
          className="flex items-center gap-3 text-left"
          onClick={() => onNavigate("home")}
          type="button"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
            <Beaker className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-semibold text-text-primary">Chem3D Learn</span>
            <span className="block text-xs text-text-secondary">结构化学 3D 学习站</span>
          </span>
        </button>

        <nav className="flex items-center gap-2" aria-label="主导航">
          <Button
            variant={currentPage === "home" ? "default" : "ghost"}
            size="sm"
            onClick={() => onNavigate("home")}
          >
            首页
          </Button>
          <Button
            variant={currentPage === "learning" ? "default" : "secondary"}
            size="sm"
            onClick={() => onNavigate("learning")}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            3D 结构学习
          </Button>
        </nav>
      </div>
    </header>
  );
}
