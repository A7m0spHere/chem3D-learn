import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { LearningModule } from "@/data/learningModules";

type ModuleCardProps = {
  module: LearningModule;
};

export function ModuleCard({ module }: ModuleCardProps) {
  const primaryFact = module.geometryName ?? module.bondAngle ?? module.polarity ?? module.hybridization;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-panel">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div className="min-w-0">
          <div className="mb-3 text-4xl font-black leading-none text-primary-dark">
            {module.formula ?? module.title.split("：")[0]}
          </div>
          <h3 className="text-lg font-bold leading-snug text-text-primary transition-colors group-hover:text-primary">
            {module.title}
          </h3>
          <p className="mt-1 text-sm font-medium text-primary-dark">
            {module.subtitle}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-dark">
          {module.difficulty}
        </span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-text-secondary line-clamp-3">
        {module.description}
      </p>

      {primaryFact ? (
        <div className="mt-5 rounded-xl border border-border bg-background px-4 py-3">
          <div className="text-xs font-semibold text-text-secondary">观察重点</div>
          <div className="mt-1 text-base font-bold text-text-primary">{primaryFact}</div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-background/70 px-4 py-3">
          <div className="text-xs font-semibold text-text-secondary">学习状态</div>
          <div className="mt-1 text-sm font-semibold text-text-primary">轻量教学模块</div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {module.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors group-hover:border-primary/20"
          >
            {tag}
          </span>
        ))}
      </div>

      <Button asChild className="mt-6 w-full group-hover:bg-primary-dark transition-colors">
        <Link to={`/module/${module.id}`}>
          进入模块
          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </Button>
    </article>
  );
}
