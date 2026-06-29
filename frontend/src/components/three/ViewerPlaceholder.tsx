import { Atom, Rotate3D, ZoomIn } from "lucide-react";

export function ViewerPlaceholder() {
  return (
    <section className="flex min-h-[360px] flex-1 flex-col rounded-lg border border-border bg-surface shadow-panel lg:min-h-[620px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">3D 观察占位区</h2>
          <p className="text-sm text-text-secondary">真实 3D 渲染将在后续版本接入</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5">
            <Rotate3D className="h-4 w-4" aria-hidden="true" />
            旋转
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5">
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
            缩放
          </span>
        </div>
      </div>

      <div className="chem-viewer-stage relative flex flex-1 items-center justify-center overflow-hidden p-6">
        <div className="absolute inset-x-6 top-6 h-px bg-border" />
        <div className="absolute inset-y-6 left-6 w-px bg-border" />
        <div className="flex h-48 w-48 items-center justify-center rounded-full border border-dashed border-primary/50 bg-white/80 text-primary shadow-panel sm:h-64 sm:w-64">
          <div className="text-center">
            <Atom className="mx-auto h-14 w-14" aria-hidden="true" />
            <p className="mt-3 text-base font-semibold text-text-primary">CH4 模型预览</p>
            <p className="mt-1 text-sm text-text-secondary">静态骨架阶段</p>
          </div>
        </div>
      </div>
    </section>
  );
}
