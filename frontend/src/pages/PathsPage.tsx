import { ArrowRight, ChevronRight, Home, Map, Route as RouteIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import {
  getModuleById,
  learningPaths,
  type LearningModule,
  type LearningPath,
} from "@/data/learningModules";

const pathTeachingNotes: Record<string, string> = {
  "vsepr-intro": "电子对排斥 → 孤对挤压 → 键角与极性",
  "crystal-intro": "均摊计数 → 配位关系 → 密堆积空隙",
  "organic-spatial": "平面与直线母体 → 苯环 → 综合共线共面",
};

export function PathsPage() {
  return (
    <main className="min-h-screen bg-background pb-16">
      <ScrollReveal direction="none">
        <section className="border-b border-border bg-white">
          <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
            <nav className="mb-5 flex items-center text-sm font-medium text-text-secondary">
              <Link to="/" className="transition-colors hover:text-primary">
                <Home className="h-4 w-4" />
              </Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <span className="text-text-primary">参考顺序</span>
            </nav>

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary-dark">
                  <RouteIcon className="h-4 w-4" aria-hidden="true" />
                  自学参考顺序
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                  按理解顺序观察结构
                </h1>
                <p className="mt-3 text-base leading-7 text-text-secondary">
                  三条路线串起常对照的模型；按顺序看，也可以直接跳到需要的结构。
                </p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-3 text-sm font-semibold text-primary-dark">
                3 条参考顺序 · 可随时跳步
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
        {learningPaths.map((path, index) => (
          <ScrollReveal key={path.id} delay={index === 0 ? 100 : 0}>
            <LearningPathSection path={path} />
          </ScrollReveal>
        ))}
      </div>
    </main>
  );
}

function LearningPathSection({ path }: { path: LearningPath }) {
  const modules = path.steps
    .map((step) => getModuleById(step.moduleId))
    .filter((module): module is LearningModule => Boolean(module));
  const note = pathTeachingNotes[path.id];

  return (
    <section className="rounded-2xl border border-border bg-white/80 p-5 shadow-sm">
      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
            <Map className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-3 text-xl font-bold text-text-primary">{path.title}</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{path.subtitle}</p>
          {note && (
            <div className="mt-4 rounded-lg bg-background px-3 py-2.5">
              <div className="text-xs font-bold text-primary-dark">理解顺序</div>
              <p className="mt-1 text-sm leading-6 text-text-primary">{note}</p>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module, index) => (
            <article
              key={module.id}
              className="flex min-h-[190px] flex-col rounded-xl border border-border bg-background p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="rounded-full border border-primary/20 bg-white px-2.5 py-1 text-xs font-semibold text-primary-dark">
                  {module.difficulty}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-bold leading-snug text-text-primary">
                {module.title}
              </h3>
              <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-text-secondary">
                {module.visualFocus}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {module.tags.slice(0, 1).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-white px-2 py-0.5 text-xs text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button asChild className="mt-4 h-11 w-full">
                <Link to={module.route}>
                  打开这个结构
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
