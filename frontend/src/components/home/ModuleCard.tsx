import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { LearningModule } from "@/data/learningModules";

type ModuleCardProps = {
  module: LearningModule;
};

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md hover:bg-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
            {module.title}
          </h3>
          <p className="mt-1 text-sm font-medium text-primary-dark">
            {module.subtitle}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-text-secondary">
          {module.difficulty}
        </span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-text-secondary line-clamp-3">
        {module.description}
      </p>

      {/* Optional details grid */}
      {(module.bondAngle || module.hybridization || module.polarity) && (
        <dl className="mt-5 grid grid-cols-2 gap-2 text-sm">
          {module.bondAngle && <Fact label="键角" value={module.bondAngle} />}
          {module.hybridization && <Fact label="杂化" value={module.hybridization} />}
          {module.lonePairs && <Fact label="孤对电子" value={module.lonePairs} />}
          {module.polarity && <Fact label="极性" value={module.polarity} />}
        </dl>
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background px-3 py-1.5 transition-colors group-hover:bg-primary-light/30">
      <dt className="text-xs text-text-secondary mb-0.5">{label}</dt>
      <dd className="font-semibold text-text-primary text-xs">{value}</dd>
    </div>
  );
}
