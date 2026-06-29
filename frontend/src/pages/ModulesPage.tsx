import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { ModuleCard } from "@/components/home/ModuleCard";
import { prefetchViewerChunks } from "@/lib/prefetch";
import { categories, getModulesByCategory, type ModuleCategory } from "@/data/learningModules";

export function ModulesPage() {
  const [activeCategory, setActiveCategory] = useState<ModuleCategory | "all">("all");

  // 模块列表页是 3D 入口，空闲时预热 three/r3f 共享 chunk，点进模块秒开。
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(prefetchViewerChunks);
    } else {
      window.setTimeout(prefetchViewerChunks, 2000);
    }
  }, []);

  return (
    <main className="motion-page-enter bg-background min-h-screen pb-20">
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="flex items-center text-sm font-medium text-text-secondary mb-6">
            <Link to="/" className="hover:text-primary transition-colors"><Home className="h-4 w-4" /></Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-text-primary">所有学习模块</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl mb-6">
            所有学习模块
          </h1>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === "all"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-text-secondary hover:bg-slate-200"
              }`}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-text-secondary hover:bg-slate-200"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {categories
          .filter((cat) => activeCategory === "all" || activeCategory === cat.id)
          .map((category) => {
            const modules = getModulesByCategory(category.id);
            if (modules.length === 0) return null;

            return (
              <section key={category.id} className="mb-16 last:mb-0">
                <div className="mb-6 flex items-baseline gap-4">
                  <h2 className="text-2xl font-bold text-text-primary">{category.title}</h2>
                  <span className="text-sm font-medium text-text-secondary">{modules.length} 个模块</span>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {modules.map((mod) => (
                    <ModuleCard key={mod.id} module={mod} />
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </main>
  );
}
