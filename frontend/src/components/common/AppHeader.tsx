import { Beaker, BookOpen, Github } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const location = useLocation();

  const navLinks = [
    { name: "分子构型", href: "/#molecular-geometry" },
    { name: "晶体结构", href: "/#crystal-structure" },
    { name: "有机立体", href: "/#organic-stereochemistry" },
    { name: "化学键与轨道", href: "/#bonding-orbitals" },
    { name: "学习路径", href: "/paths" },
    { name: "能力扩展", href: "/exam" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] border-b border-border bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-left transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white shadow-sm">
            <Beaker className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-semibold text-text-primary">Chem3D Learn</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 lg:gap-6" aria-label="主导航">
          {navLinks.map((link) => {
            const isHash = link.href.startsWith("/#");
            const isActive = isHash
              ? location.pathname === "/" && location.hash === link.href.slice(1)
              : link.href === "/exam"
                ? location.pathname.startsWith("/exam")
                : location.pathname === link.href;

            return (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-text-secondary"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="default"
            size="sm"
            className="rounded-full shadow-sm"
          >
            <Link to="/modules">
              <BookOpen className="h-4 w-4 mr-1.5" aria-hidden="true" />
              探索全部
            </Link>
          </Button>
          <a
            href="https://github.com/a7m0sphere/chem3D-learn"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-gray-100 transition-colors"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
