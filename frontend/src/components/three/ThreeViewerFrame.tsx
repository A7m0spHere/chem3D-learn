import type { CSSProperties, ReactNode } from "react";

type ThreeViewerFrameProps = {
  title: ReactNode;
  meta?: ReactNode;
  summary: ReactNode;
  footerMeta?: ReactNode;
  loading?: boolean;
  viewerTestId?: string;
  stageTestId?: string;
  children: ReactNode;
  className?: string;
  immersive?: boolean;
  transitionName?: string;
};

export function ThreeViewerFrame({
  title,
  meta,
  summary,
  footerMeta,
  loading = false,
  viewerTestId,
  stageTestId,
  children,
  className = "",
  immersive = false,
  transitionName,
}: ThreeViewerFrameProps) {
  const transitionStyle = transitionName
    ? ({ viewTransitionName: transitionName } as CSSProperties)
    : undefined;

  return (
    <section
      className={immersive
        ? `grid h-full min-h-0 flex-1 grid-rows-[minmax(0,1fr)] overflow-hidden bg-surface ${className}`
        : `grid h-full min-h-[500px] flex-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl border border-border bg-surface ${className}`}
      data-testid={viewerTestId}
      style={transitionStyle}
    >
      {!immersive ? (
        <div
          className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border bg-white px-4 py-2.5 sm:px-5"
          data-testid={viewerTestId ? `${viewerTestId}-topbar` : undefined}
        >
          <h2 className="text-base font-semibold leading-snug text-text-primary sm:text-lg">
            {title}
          </h2>
          {meta ? <div className="text-xs text-text-secondary sm:text-sm">{meta}</div> : null}
        </div>
      ) : null}

      <div className="chem-viewer-stage relative min-h-0" data-testid={stageTestId}>
        {loading ? (
          <div className="motion-skeleton absolute inset-0 z-10 flex items-center justify-center bg-white/60" />
        ) : null}
        {children}
      </div>

      {!immersive ? (
        <div
          className="flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border bg-white px-4 py-2.5 text-sm leading-5 text-text-secondary sm:min-h-14 sm:px-5 sm:text-[15px]"
          data-testid={viewerTestId ? `${viewerTestId}-summary` : undefined}
        >
          <div className="min-w-0 flex-1">{summary}</div>
          {footerMeta ? <div className="shrink-0">{footerMeta}</div> : null}
        </div>
      ) : null}
    </section>
  );
}

export type { ThreeViewerFrameProps };
