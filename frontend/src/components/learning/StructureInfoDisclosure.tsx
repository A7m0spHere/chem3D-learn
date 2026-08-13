import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

export type StructureInfoItem = {
  label: string;
  testId?: string;
  value: string;
};

type StructureInfoDisclosureProps = {
  facts: StructureInfoItem[];
  modelBoundary?: string;
  summaryItems: StructureInfoItem[];
  title?: string;
};

export function StructureInfoDisclosure({
  facts,
  modelBoundary,
  summaryItems,
  title = "结构信息",
}: StructureInfoDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <section
      className="@container overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
      data-testid="structure-info-disclosure"
    >
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="flex min-h-11 w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-primary/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-5"
        data-testid="structure-info-toggle"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span className="min-w-0">
          <span className="block text-sm font-bold text-text-primary">{title}</span>
          <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-secondary">
            {summaryItems.map((item) => (
              <span key={item.label}>
                <span className="sr-only">{item.label}：</span>
                {item.value}
              </span>
            ))}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-primary-dark">
          {isOpen ? "收起" : "展开"}
          <ChevronDown
            aria-hidden="true"
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {isOpen ? (
        <div className="border-t border-border px-4 py-4 sm:px-5" id={contentId}>
          <dl className="grid gap-3 @[36rem]:grid-cols-3" data-testid="structure-info-facts">
            {facts.map((fact) => (
              <div
                className="rounded-xl bg-background px-4 py-3"
                data-testid={fact.testId}
                key={fact.label}
              >
                <dt className="text-xs font-semibold text-text-secondary">{fact.label}</dt>
                <dd className="mt-1 text-sm font-semibold leading-6 text-text-primary">{fact.value}</dd>
              </div>
            ))}
          </dl>
          {modelBoundary ? (
            <p className="mt-3 border-l-2 border-primary/30 pl-3 text-sm leading-6 text-text-secondary">
              <span className="font-semibold text-text-primary">模型边界：</span>
              {modelBoundary}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
