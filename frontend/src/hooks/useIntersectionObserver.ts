import { useEffect, useRef, useState } from "react";

interface IntersectionOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
}

export function useIntersectionObserver({
  triggerOnce = true,
  root = null,
  rootMargin = "0px",
  threshold = 0.1,
}: IntersectionOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<Element | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && triggerOnce) {
          observer.unobserve(element);
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [triggerOnce, root, rootMargin, threshold]);

  return { ref, isIntersecting };
}
