import { Html } from "@react-three/drei";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";

type AtomPullHandleProps = {
  atomId: string;
  label: string;
  onPullIntent: (atomId: string) => void;
};

export function AtomPullHandle({ atomId, label, onPullIntent }: AtomPullHandleProps) {
  const gesture = useRef<{
    pointerId: number;
    x: number;
    y: number;
    startedAt: number;
    pointerType: string;
    triggered: boolean;
  }>();

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startedAt: performance.now(),
      pointerType: event.pointerType,
      triggered: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId || current.triggered) return;
    event.stopPropagation();
    const moved = Math.hypot(event.clientX - current.x, event.clientY - current.y);
    const heldLongEnough = current.pointerType !== "touch" || performance.now() - current.startedAt >= 160;
    if (moved < 8 || !heldLongEnough) return;
    current.triggered = true;
    onPullIntent(atomId);
  };

  const finishGesture = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (gesture.current?.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    gesture.current = undefined;
  };

  return (
    <Html center pointerEvents="auto" zIndexRange={[8, 0]}>
      <button
        aria-label={`抓取 ${label} 原子进入拼装实验室`}
        className="block h-11 w-11 cursor-grab rounded-full bg-transparent opacity-0 outline-none focus:opacity-100 focus:ring-2 focus:ring-primary/60 active:cursor-grabbing"
        data-testid={`atom-pull-handle-${atomId}`}
        onClick={(event) => {
          // 键盘触发的 click.detail 为 0；鼠标仍必须执行拉动手势。
          if (event.detail === 0) onPullIntent(atomId);
        }}
        onPointerCancel={finishGesture}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishGesture}
        style={{ touchAction: "none" }}
        type="button"
      />
    </Html>
  );
}
