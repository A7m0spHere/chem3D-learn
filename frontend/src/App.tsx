import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/common/AppHeader";
import { HomePage } from "@/pages/HomePage";
import { ModulesPage } from "@/pages/ModulesPage";
import { ModuleDetailPage } from "@/pages/ModuleDetailPage";

import { ExamPage } from "@/pages/ExamPage";
import { AboutPage } from "@/pages/AboutPage";

export default function App() {
  return (
    <>
      <RouteScrollHandler />
      <AppHeader />
      <div className="pt-[60px] min-h-screen flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/module/:id" element={<ModuleDetailPage />} />

          <Route path="/exam" element={<ExamPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </>
  );
}

function RouteScrollHandler() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const targetId = decodeURIComponent(location.hash.slice(1));
    const frameId = window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const headerOffset = 76;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.pathname, location.hash]);

  return null;
}
