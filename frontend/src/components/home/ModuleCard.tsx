import type { ReactNode } from "react";

type ModuleCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export function ModuleCard({ icon, title, description }: ModuleCardProps) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-surface p-5 shadow-panel transition-colors hover:border-primary/40">
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
    </article>
  );
}
