import { useEffect, useState } from "react";

export function usePullTransitionProgress(activeAtomId?: string, durationMs = 300): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!activeAtomId) {
      setProgress(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    const startedAt = performance.now();
    let frameId = 0;
    const tick = (now: number) => {
      const linear = Math.min((now - startedAt) / durationMs, 1);
      setProgress(1 - Math.pow(1 - linear, 3));
      if (linear < 1) frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [activeAtomId, durationMs]);

  return progress;
}
