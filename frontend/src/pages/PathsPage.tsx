import { ArrowRight, BookOpenCheck, ChevronRight, Home, Map, Route as RouteIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import {
  getModuleById,
  learningPaths,
  type LearningModule,
  type LearningPath,
} from "@/data/learningModules";

const pathTeachingNotes: Record<string, { focus: string; selfStudy: string }> = {
  "vsepr-intro": {
    focus: "先建立电子对排斥的空间直觉，再用孤对电子解释键角递变。",
    selfStudy: "适合学 VSEPR 时对照课本从 CH4 看到 BF3，最后用极性判断检验自己是否真的理解。",
  },
  "crystal-intro": {
    focus: "先练均摊计数，再观察配位数和密堆积空隙。",
    selfStudy: "适合做晶胞计算题卡壳时，边旋转晶胞边亲手数顶点、体心、面心和最近邻。",
  },
  "organic-spatial": {
    focus: "从平面、直线、苯环三个母体出发，迁移到复杂有机物共线共面。",
    selfStudy: "适合做共线共面题之前，先把三个基础母体转熟，再看综合模型。",
  },
};

export function PathsPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <ScrollReveal direction="none">
        <section className="border-b border-border bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <nav className="mb-6 flex items-center text-sm font-medium text-text-secondary">
              <Link to="/" className="transition-colors hover:text-primary">
                <Home className="h-4 w-4" />
              </Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <span className="text-text-primary">参考顺序</span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary-dark">
                  <RouteIcon className="h-4 w-4" aria-hidden="true" />
                  自学参考顺序
                </div>
                <h1 className="mt-5 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                  不知道先看哪个？按理解顺序参考
                </h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-text-secondary">
                  这里把常一起对照的结构按课本递进排成几条参考路线。它们不是必须完成的课程——你随时可以跳到任何一步，或者直接回结构库搜自己需要的模型。
                </p>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-3 text-primary-dark">
                  <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
                  <h2 className="font-bold">自学建议</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  结合手头的课本或题目使用：先自己观察结构、做出判断，再打开角度、标签或配位提示核对。卡在哪一步，就多转一会儿哪一步。
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        {learningPaths.map((path, index) => (
          <ScrollReveal key={path.id} delay={index === 0 ? 100 : 0}>
            <LearningPathSection path={path} />
          </ScrollReveal>
        ))}
      </div>
    </main>
  );
}

function LearningPathSection({ path }: { path: LearningPath }) {
  const modules = path.steps
    .map((step) => getModuleById(step.moduleId))
    .filter((module): module is LearningModule => Boolean(module));
  const note = pathTeachingNotes[path.id];

  return (
    <section className="rounded-2xl border border-border bg-white/80 p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
            <Map className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-text-primary">{path.title}</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{path.subtitle}</p>
          {note && (
            <div className="mt-5 rounded-xl border border-border bg-background p-4">
              <div className="text-xs font-bold text-primary-dark">观察重点</div>
              <p className="mt-2 text-sm leading-6 text-text-primary">{note.focus}</p>
              <p className="mt-3 text-xs leading-5 text-text-secondary">{note.selfStudy}</p>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module, index) => (
            <article
              key={module.id}
              className="flex min-h-[220px] flex-col rounded-xl border border-border bg-background p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="rounded-full border border-primary/20 bg-white px-2.5 py-1 text-xs font-semibold text-primary-dark">
                  {module.difficulty}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold leading-snug text-text-primary">
                {module.title}
              </h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-text-secondary">
                {module.visualFocus}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {module.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-white px-2 py-0.5 text-xs text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button asChild className="mt-5 w-full">
                <Link to={module.route}>
                  打开这个结构
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
