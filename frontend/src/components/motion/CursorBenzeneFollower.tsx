import React from "react";
import { usePointerFollower } from "@/hooks/usePointerFollower";

export function CursorBenzeneFollower() {
  const followerRef = usePointerFollower({
    offsetX: 20,
    offsetY: 20,
    stiffness: 0.12,
    disabledClasses: ["viewer-area"], // will hide when hovering elements with this class
  });

  return (
    <div
      ref={followerRef}
      className="pointer-events-none fixed left-0 top-0 z-50 flex items-center justify-center mix-blend-multiply transition-opacity duration-300"
      style={{
        width: "48px",
        height: "48px",
        marginLeft: "-24px",
        marginTop: "-24px",
        opacity: 0, // initially hidden until mouse moves
      }}
      aria-hidden="true"
    >
      {/* Kekule Benzene SVG */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary opacity-30 transition-transform duration-300 group-hover:scale-125"
      >
        {/* Outer Hexagon */}
        <polygon
          points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Inner double bonds */}
        <line x1="22" y1="32" x2="22" y2="68" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <line x1="44" y1="84" x2="74" y2="66" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <line x1="74" y1="34" x2="44" y2="16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
