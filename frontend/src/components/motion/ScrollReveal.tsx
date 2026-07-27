import React from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

/**
 * 滚动进入视口时的「平滑滑入」容器。
 *
 * 手感：位移 48px + 1100ms + 项目统一的 ease-out-soft。
 * 只动 transform/opacity（GPU 合成层），不触发 layout，滚动更顺。
 * 触发线为视口底部内收 60px：元素滚进视野下沿一段距离后平滑滑入，
 * 既能清楚看到，又不会因视口较高而在滚动前就提前放完。
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "0px 0px -60px 0px",
  });

  const directionClasses = {
    up: "translate-y-12",
    down: "-translate-y-12",
    left: "translate-x-12",
    right: "-translate-x-12",
    none: "",
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "motion-scroll-reveal transition-all duration-[1100ms] ease-out-soft will-change-transform",
        isIntersecting ? "opacity-100 translate-y-0 translate-x-0" : `opacity-0 ${directionClasses[direction]}`,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
