import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface PointerFollowerOptions {
  offsetX?: number;
  offsetY?: number;
  stiffness?: number;
  disabledClasses?: string[]; // CSS classes that disable visibility when hovered
}

export function usePointerFollower({
  offsetX = 16,
  offsetY = 16,
  stiffness = 0.15,
  disabledClasses = ["viewer-area"],
}: PointerFollowerOptions = {}) {
  const followerRef = useRef<HTMLDivElement>(null);
  const isReducedMotion = useReducedMotion();
  
  // Real mouse coordinates
  const mouseX = useRef(-100);
  const mouseY = useRef(-100);
  
  // Follower element coordinates (for lerping)
  const followerX = useRef(-100);
  const followerY = useRef(-100);
  
  const isHidden = useRef(false);
  const rafId = useRef<number>(0);

  useEffect(() => {
    // Disable completely on mobile devices or if reduced motion is preferred
    const isMobile = window.matchMedia("(max-width: 768px)").matches || 
                    ("ontouchstart" in window) || 
                    (navigator.maxTouchPoints > 0);
                    
    if (isReducedMotion || isMobile) {
      if (followerRef.current) {
        followerRef.current.style.display = "none";
      }
      return;
    }

    if (followerRef.current) {
      followerRef.current.style.display = "block";
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX + offsetX;
      mouseY.current = e.clientY + offsetY;

      // Check if we are hovering over a disabled area
      const target = e.target as HTMLElement;
      if (target) {
        // Walk up the DOM tree to see if any parent has the disabled class
        let current: HTMLElement | null = target;
        let shouldHide = false;
        
        while (current && current !== document.body) {
          if (disabledClasses.some(c => current!.classList.contains(c))) {
            shouldHide = true;
            break;
          }
          current = current.parentElement;
        }
        
        isHidden.current = shouldHide;
      }
    };

    const animate = () => {
      // Lerp
      followerX.current += (mouseX.current - followerX.current) * stiffness;
      followerY.current += (mouseY.current - followerY.current) * stiffness;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${followerX.current}px, ${followerY.current}px, 0)`;
        followerRef.current.style.opacity = isHidden.current ? "0" : "1";
      }

      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [offsetX, offsetY, stiffness, disabledClasses, isReducedMotion]);

  return followerRef;
}
