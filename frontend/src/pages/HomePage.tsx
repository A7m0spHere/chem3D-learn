import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Move3D, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModuleCard } from "@/components/home/ModuleCard";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { cn } from "@/lib/utils";
import { categories, getFeaturedModules, getModulesByCategory } from "@/data/learningModules";
import { ModulePlaceholderViewer } from "@/components/three/ModulePlaceholderViewer";

const learningSteps = [
  { number: "01", title: "带着问题来", copy: "从课本或题目里找到要看的结构" },
  { number: "02", title: "自由观察", copy: "旋转、缩放，建立空间直觉" },
  { number: "03", title: "回到题目", copy: "对照选项验证自己的空间判断" },
];

/**
 * Hero 元素平滑滑入的错峰（ms）。配合 1.1s 的滑入时长，
 * 让每个元素肉眼可辨地一个接一个浮上来。
 */
const heroDelays = {
  badge: 0,
  title: 120,
  copy: 240,
  actions: 360,
  steps: 500,
  panel: 220,
} as const;

export function HomePage() {
  const featuredModules = getFeaturedModules();
  const [entered, setEntered] = useState(false);

  // 首屏挂载后下一帧再触发滑入：先渲染出 48px 的初始偏移，过渡才平滑可见。
  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /**
   * 生成某个 Hero 元素的平滑滑入 props：合并 motion-hero-item 过渡类、
   * entered 后的 is-entered 触发类、错峰的 transitionDelay，以及元素自身的 className。
   */
  const reveal = (delay: number, className: string) => ({
    className: cn("motion-hero-item", entered && "is-entered", className),
    style: { transitionDelay: `${delay}ms` },
  });

  return (
    <main className="bg-background">
      <section className="border-b border-border bg-[linear-gradient(120deg,#f7faf9_0%,#eef7f4_52%,#f7faf9_100%)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <div
              {...reveal(heroDelays.badge, "inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1.5 text-sm font-semibold text-primary-dark")}
            >
              <Move3D className="h-4 w-4" aria-hidden="true" />
              高中结构化学 · 3D 结构参考库
            </div>
            <h1
              {...reveal(heroDelays.title, "mt-6 text-center text-5xl font-bold leading-[1.08] tracking-tight text-text-primary sm:text-6xl lg:text-left lg:text-7xl")}
            >
              <span className="block">结构化学</span>
              <span className="relative inline-block text-primary">
                3D 学习站
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 h-3 w-full text-accent opacity-60"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 20"
                >
                  <path d="M0,10 Q50,20 100,10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
                </svg>
              </span>
            </h1>
            <p {...reveal(heroDelays.copy, "mt-5 max-w-xl text-lg leading-8 text-text-secondary")}>
              做题、看书遇到想不出来的立体结构，就来这里亲手转一转。每个模型都可以自由旋转和缩放，配合你自己的课本与题目使用，不设固定学习流程。
            </p>
            <div {...reveal(heroDelays.actions, "mt-8 flex flex-wrap gap-3")}>
              <Button asChild size="lg" className="rounded-lg px-6 shadow-sm">
                <Link to="/modules">
                  开始探索
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-lg px-6">
                <Link to="/modules?category=molecular-geometry">从分子构型看起</Link>
              </Button>
            </div>
            <div {...reveal(heroDelays.steps, "mt-10 grid max-w-xl gap-3 sm:grid-cols-3")}>
              {learningSteps.map((step) => (
                <div key={step.number} className="border-l-2 border-primary/30 pl-3">
                  <p className="text-xs font-bold tracking-[0.16em] text-primary">{step.number}</p>
                  <p className="mt-1 font-semibold text-text-primary">{step.title}</p>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">{step.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            {...reveal(heroDelays.panel, "relative min-h-[380px] overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-panel sm:min-h-[450px]")}
          >
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-border bg-white/95 px-5 py-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-primary-dark">交互示例</p>
                <p className="mt-0.5 text-sm font-semibold text-text-primary">从 CH₄ 认识正四面体</p>
              </div>
              <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-dark">可旋转</span>
            </div>
            <div className="absolute inset-x-4 bottom-4 top-[68px]">
              <ModulePlaceholderViewer
                category="molecular-geometry"
                visualFocus="观察 4 个 H 原子如何围绕中心 C 原子均匀分布，形成正四面体。"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-primary">按主题进入</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary">选择你正在学习的主题</h2>
              </div>
              <Button asChild variant="outline" className="rounded-lg">
                <Link to="/modules">浏览全部结构 <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </ScrollReveal>
          <ScrollReveal className="mt-8" delay={80}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/modules?category=${category.id}`}
                  className="group rounded-xl border border-border bg-background p-5 transition-colors hover:border-primary/50 hover:bg-primary/[0.03]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-sm font-bold text-primary-dark">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-text-primary group-hover:text-primary">{category.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{category.subtitle}</p>
                  <p className="mt-3 text-xs font-semibold text-primary/80">{getModulesByCategory(category.id).length} 个可探索结构</p>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-border py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-primary">常查结构</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary">做题时最常需要对照的模型</h2>
                <p className="mt-3 text-base leading-7 text-text-secondary">键角对比、晶胞计数、共面判断——这几个结构在题目里出现得最多，收藏起来随时回来看。</p>
              </div>
              <Link to="/modules" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark">
                浏览全部结构 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal className="mt-8" delay={80}>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featuredModules.map((module) => <ModuleCard key={module.id} module={module} />)}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-primary-dark py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-start gap-3">
                <ScanSearch className="mt-1 h-5 w-5 text-accent" aria-hidden="true" />
                <div>
                  <h2 className="text-xl font-bold">不知道该先看哪个结构？</h2>
                  <p className="mt-1 text-sm leading-6 text-white/75">参考顺序页按课本递进整理了几条观察路线，供自学时对照，不必按部就班。</p>
                </div>
              </div>
              <Button asChild variant="secondary" className="rounded-lg bg-white text-primary-dark hover:bg-white/90">
                <Link to="/paths"><BookOpen className="h-4 w-4" />查看参考顺序</Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
