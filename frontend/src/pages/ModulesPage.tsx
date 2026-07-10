import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Compass, Home, Search, Sparkles, X } from "lucide-react";
import { ModuleCard } from "@/components/home/ModuleCard";
import { prefetchViewerChunks } from "@/lib/prefetch";
import { searchModules } from "@/lib/search";
import { categories, getModulesByCategory, type ModuleCategory } from "@/data/learningModules";

const categoryIds = new Set(categories.map((category) => category.id));

function isModuleCategory(value: string | null): value is ModuleCategory {
  return value !== null && categoryIds.has(value as ModuleCategory);
}

export function ModulesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const activeCategory: ModuleCategory | "all" = isModuleCategory(categoryParam) ? categoryParam : "all";
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(prefetchViewerChunks);
    } else {
      window.setTimeout(prefetchViewerChunks, 2000);
    }
  }, []);

  const setActiveCategory = (category: ModuleCategory | "all") => {
    setSearchParams(category === "all" ? {} : { category }, { replace: true });
  };

  const visibleCategories = useMemo(
    () => categories.filter((category) => activeCategory === "all" || activeCategory === category.id),
    [activeCategory],
  );
  const visibleSections = useMemo(
    () =>
      visibleCategories
        .map((category) => ({ category, modules: searchModules(getModulesByCategory(category.id), query) }))
        .filter((section) => section.modules.length > 0),
    [visibleCategories, query],
  );
  const visibleCount = visibleSections.reduce((total, section) => total + section.modules.length, 0);

  return (
    <main className="motion-page-enter min-h-screen bg-background pb-16">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <nav className="flex items-center text-sm font-medium text-text-secondary">
            <Link to="/" className="hover:text-primary"><Home className="h-4 w-4" /></Link>
            <ChevronRight className="mx-2 h-4 w-4" />
            <span className="text-text-primary">全部结构</span>
          </nav>
          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Compass className="h-4 w-4" />结构库</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">找到你要观察的空间结构</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">直接搜索名称或化学式，或按主题筛选；点开结构即可自由旋转对照课本和题目。</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
              <p className="text-sm font-medium text-primary-dark">当前显示</p>
              <p className="mt-1 text-3xl font-bold text-text-primary">{visibleCount} <span className="text-base font-semibold text-text-secondary">个结构</span></p>
            </div>
          </div>
          <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
              <input
                aria-label="搜索结构"
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-9 text-sm text-text-primary placeholder:text-text-secondary/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索：H2O、苯环、晶胞、σ 键……"
                type="search"
                value={query}
              />
              {query && (
                <button
                  aria-label="清空搜索"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-secondary hover:text-text-primary"
                  onClick={() => setQuery("")}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2" aria-label="结构主题筛选">
              <FilterButton active={activeCategory === "all"} onClick={() => setActiveCategory("all")}>全部主题</FilterButton>
              {categories.map((category) => (
                <FilterButton active={activeCategory === category.id} key={category.id} onClick={() => setActiveCategory(category.id)}>
                  {category.title}
                </FilterButton>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {visibleSections.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-white/60 p-10 text-center text-sm text-text-secondary">
            没有找到匹配「{query}」的结构。试试化学式（如 CO2）、结构名（如 三角锥）或主题词（如 晶胞）。
          </div>
        )}
        {visibleSections.map(({ category, modules }) => (
          <section key={category.id} className="mb-14 last:mb-0" aria-labelledby={`${category.id}-title`}>
            <div className="flex items-start justify-between gap-5 border-b border-border pb-4">
              <div>
                <p className="text-sm font-semibold text-primary">{category.subtitle}</p>
                <h2 className="mt-1 text-2xl font-bold text-text-primary" id={`${category.id}-title`}>{category.title}</h2>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-text-secondary ring-1 ring-border">{modules.length} 个</span>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => <ModuleCard key={module.id} module={module} />)}
            </div>
          </section>
        ))}
        <div className="mt-12 flex items-start gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] p-5 text-sm leading-6 text-text-secondary">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          没有看到要找的结构？先打开同类的基础结构建立空间参照，再结合题目中的描述对照观察。
        </div>
      </div>
    </main>
  );
}

function FilterButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      aria-pressed={active}
      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "border-primary bg-primary text-white" : "border-border bg-background text-text-secondary hover:border-primary/40 hover:bg-white"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
