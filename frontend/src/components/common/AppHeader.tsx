import { Beaker, BookOpen, Github } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/learningModules";

const categoryNavNames: Record<string, string> = {
  "bonding-orbitals": "化学键与轨道",
  "molecular-geometry": "分子构型",
  "crystal-structure": "晶体结构",
  "organic-stereochemistry": "有机立体",
};

export function AppHeader() {
  const location = useLocation();

  const navLinks = [
    ...categories.map((category) => ({
      name: categoryNavNames[category.id] ?? category.title,
      href: `/modules?category=${category.id}`,
    })),
    { name: "能力扩展", href: "/exam" },
    { name: "参考顺序", href: "/paths" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] border-b border-border bg-white/95 shadow-[0_1px_0_rgba(31,41,51,0.03)]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-left transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white shadow-sm">
            <Beaker className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-semibold tracking-tight text-text-primary">Chem3D Learn</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 lg:gap-6" aria-label="主导航">
          {navLinks.map((link) => {
            const [linkPath, linkQuery] = link.href.split("?");
            const isActive =
              linkPath === "/exam"
                ? location.pathname.startsWith("/exam")
                : location.pathname === linkPath &&
                  (linkQuery ? location.search === `?${linkQuery}` : true);

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
            className="rounded-lg shadow-sm"
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
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
