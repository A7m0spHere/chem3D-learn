import { useEffect, useState } from "react";

export function FloatingChemistryBackground() {
  const [elements, setElements] = useState<
    { id: number; type: "water" | "benzene" | "orbit"; x: number; y: number; delay: number; scale: number }[]
  >([]);

  useEffect(() => {
    // Generate random background elements
    const types: ("water" | "benzene" | "orbit")[] = ["water", "benzene", "orbit"];
    const generated = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      type: types[i % types.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      scale: 0.5 + Math.random() * 1.5,
    }));
    setElements(generated);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white opacity-40">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute text-primary animate-float"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            animationDelay: `${el.delay}s`,
            transform: `scale(${el.scale})`,
            opacity: el.type === "water" ? 0.3 : 0.15,
          }}
        >
          {el.type === "water" && (
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
              <circle cx="50" cy="50" r="15" fill="currentColor" />
              <circle cx="20" cy="80" r="10" />
              <circle cx="80" cy="80" r="10" />
              <line x1="40" y1="60" x2="25" y2="75" strokeWidth="4" />
              <line x1="60" y1="60" x2="75" y2="75" strokeWidth="4" />
            </svg>
          )}
          {el.type === "benzene" && (
            <svg width="50" height="50" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M50 10 L84.64 30 L84.64 70 L50 90 L15.36 70 L15.36 30 Z" />
              <circle cx="50" cy="50" r="25" strokeDasharray="4 4" />
            </svg>
          )}
          {el.type === "orbit" && (
            <svg width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(30 50 50)" />
              <ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(-30 50 50)" />
              <circle cx="50" cy="50" r="6" fill="currentColor" />
            </svg>
          )}
        </div>
      ))}
      
      {/* Light gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-[100px]" />
    </div>
  );
}
