import React, { useMemo } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function MoleculeBackground() {
  const isReducedMotion = useReducedMotion();

  // Pre-generate stable random properties for 10 water molecules
  const molecules = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 90 + 5}%`,
      top: `${Math.random() * 90 + 5}%`,
      animationDuration: `${15 + Math.random() * 15}s`,
      animationDelay: `${Math.random() * 10}s`,
      scale: 0.6 + Math.random() * 0.8,
    }));
  }, []);

  if (isReducedMotion) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true" style={{ zIndex: -1 }}>
      {molecules.map((m) => (
        <div
          key={m.id}
          className="absolute"
          style={{
            left: m.left,
            top: m.top,
            transform: `scale(${m.scale})`,
            opacity: 0,
            animation: `motion-fade-in 4s ease-in-out ${m.animationDelay} forwards`,
          }}
        >
          <div
            style={{
              animation: `motion-float ${m.animationDuration} ease-in-out ${m.animationDelay} infinite alternate`,
            }}
          >
            {/* Simple H2O SVG (O-H-H angle ~104.5) */}
            <svg
              width="60"
              height="60"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary/10"
              style={{
                animation: `motion-rotate-slow ${m.animationDuration} linear ${m.animationDelay} infinite alternate`,
              }}
            >
              {/* O atom */}
              <circle cx="50" cy="40" r="14" stroke="currentColor" strokeWidth="4" />
              {/* H atoms */}
              <circle cx="25" cy="70" r="8" stroke="currentColor" strokeWidth="4" />
              <circle cx="75" cy="70" r="8" stroke="currentColor" strokeWidth="4" />
              {/* Bonds */}
              <line x1="42" y1="50" x2="28" y2="65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <line x1="58" y1="50" x2="72" y2="65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
