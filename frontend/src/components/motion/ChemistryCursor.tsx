import { useEffect, useRef, useState } from "react";

export function ChemistryCursor() {
  const [isDesktop, setIsDesktop] = useState(true);
  const cursorRef = useRef<HTMLDivElement>(null);
  const mouseX = useRef(-100);
  const mouseY = useRef(-100);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;

      if (rafId.current !== null) return;

      rafId.current = requestAnimationFrame(() => {
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${mouseX.current}px, ${mouseY.current}px, 0) translate(-50%, -50%)`;
        }
        rafId.current = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] opacity-15 transition-transform duration-300 ease-out will-change-transform"
      style={{
        transform: `translate3d(-100px, -100px, 0) translate(-50%, -50%)`,
      }}
    >
      <svg
        width="60"
        height="60"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary animate-spin-slow"
      >
        <path
          d="M50 10 L84.64 30 L84.64 70 L50 90 L15.36 70 L15.36 30 Z"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
      </svg>
    </div>
  );
}
