import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Move3D, Layers3, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingChemistryBackground } from "@/components/motion/FloatingChemistryBackground";
import { ChemistryCursor } from "@/components/motion/ChemistryCursor";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ModuleCard } from "@/components/home/ModuleCard";
import { categories, getModulesByCategory } from "@/data/learningModules";
import { ModulePlaceholderViewer } from "@/components/three/ModulePlaceholderViewer";

export function HomePage() {
  return (
    <main className="motion-page-enter relative overflow-hidden bg-background">
      <ChemistryCursor />
      <FloatingChemistryBackground />

      <section className="relative pt-20 pb-24 sm:pt-32 sm:pb-32 z-10 border-b border-white/40 bg-gradient-to-b from-transparent via-white/40 to-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <ScrollReveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-4 py-1.5 text-sm font-semibold text-primary-dark shadow-[inset_0_1px_1px_rgba(255,255,255,1)] backdrop-blur-md mb-8">
                  <Move3D className="h-4 w-4" />
                  高中结构化学 · 3D 辅助学习
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-6xl lg:text-7xl mb-8 leading-tight">
                  结构化学 <span className="text-primary relative inline-block">
                    3D 学习站
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent opacity-50" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path d="M0,10 Q50,20 100,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                  </span>
                </h1>
                <p className="max-w-2xl mx-auto lg:mx-0 text-lg leading-8 text-text-secondary sm:text-xl mb-10">
                  把抽象的分子构型、晶体结构和有机立体问题，变成可旋转、可观察、可理解的三维模型。以知识点为驱动，告别死记硬背。
                </p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02]">
                    <Link to="/modules">
                      开始学习
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary" className="rounded-full px-8 bg-white/80 backdrop-blur hover:bg-white shadow-sm transition-all hover:scale-[1.02] border border-white/60">
                    <Link to="/#molecular-geometry">查看知识模块</Link>
                  </Button>

                </div>
              </ScrollReveal>
            </div>
            <div className="hidden lg:block relative h-[500px] w-full rounded-3xl border border-white/50 bg-white/30 backdrop-blur-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <ModulePlaceholderViewer category="molecular-geometry" visualFocus="以甲烷为例：正四面体构型，C 原子位于中心，四个 H 原子位于顶点，键角为 109°28'。" />
              <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md text-xs font-medium px-3 py-1.5 rounded-full text-text-secondary border border-white/50 shadow-sm pointer-events-none">
                可交互 3D 模型演示 (甲烷)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="relative py-16 bg-white z-10 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text-primary">五大核心学习分类</h2>
              <p className="mt-4 text-text-secondary max-w-2xl mx-auto">涵盖高中结构化学全部空间痛点，从基础构型到能力扩展计算。</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories.map((cat) => (
                <Link to={`/#${cat.id}`} key={cat.id} className="group block rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-panel hover:bg-white text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary-dark mb-4 transition-transform group-hover:scale-110">
                    <Layers3 className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{cat.title}</h3>
                  <p className="mt-2 text-xs font-medium text-text-secondary">{cat.subtitle}</p>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Module Sections */}
      {categories.map((category, index) => {
        const modules = getModulesByCategory(category.id);
        if (modules.length === 0) return null;

        return (
          <Section
            key={category.id}
            id={category.id}
            title={category.title}
            description={category.description}
            altBg={index % 2 !== 0}
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((mod) => (
                <ModuleCard key={mod.id} module={mod} />
              ))}
            </div>
          </Section>
        );
      })}


    </main>
  );
}

function Section({ id, title, description, children, altBg }: { id: string; title: string; description: string; children: ReactNode; altBg?: boolean }) {
  return (
    <section id={id} className={`relative scroll-mt-20 py-16 sm:py-24 z-10 ${altBg ? 'bg-white' : 'bg-background'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-12 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">{title}</h2>
            <p className="mt-4 text-lg text-text-secondary">{description}</p>
          </div>
          {children}
        </ScrollReveal>
      </div>
    </section>
  );
}
