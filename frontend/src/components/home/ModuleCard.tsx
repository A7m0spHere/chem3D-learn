import { ChevronRight, Move3d, NotebookText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { prefetchViewerChunks } from "@/lib/prefetch";
import type { LearningModule } from "@/data/learningModules";

type ModuleCardProps = {
  module: LearningModule;
};

export function ModuleCard({ module }: ModuleCardProps) {
  const primaryFact = module.geometryName ?? module.bondAngle ?? module.polarity ?? module.hybridization;
  const hasInteractiveModel =
    module.hasInteractiveViewer === true || module.representativeModels.length > 0;

  return (
    <article
      onMouseEnter={prefetchViewerChunks}
      onFocus={prefetchViewerChunks}
      className="group flex h-full flex-col rounded-xl border border-border bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-panel sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 text-2xl font-black leading-none text-primary-dark">
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

      <div className={`mt-3 inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
        hasInteractiveModel ? "bg-primary-light text-primary-dark" : "bg-slate-100 text-text-secondary"
      }`}>
        {hasInteractiveModel ? <Move3d className="h-3.5 w-3.5" aria-hidden="true" /> : <NotebookText className="h-3.5 w-3.5" aria-hidden="true" />}
        {hasInteractiveModel ? "可交互 3D" : "引导学习"}
      </div>

      <p className="mt-3 flex-1 text-sm leading-6 text-text-secondary line-clamp-2">
        {module.description}
      </p>

      {primaryFact ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2">
          <div className="text-xs font-semibold text-text-secondary">看什么</div>
          <div className="text-right text-sm font-bold text-text-primary">{primaryFact}</div>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-background/70 px-3 py-2">
          <div className="text-xs font-semibold text-text-secondary">学习方式</div>
          <div className="text-sm font-semibold text-text-primary">引导观察</div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {module.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors group-hover:border-primary/20"
          >
            {tag}
          </span>
        ))}
      </div>

      <Button asChild className="mt-4 h-11 w-full rounded-lg transition-colors group-hover:bg-primary-dark">
        <Link to={`/module/${module.id}`}>
          进入模块
          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </Button>
    </article>
  );
}
