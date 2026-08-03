import { ArrowRight, ChevronRight, ClipboardList, Home, Lightbulb, TriangleAlert } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ExamTopicQuiz } from "@/components/exam/ExamTopicQuiz";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { getExamTopicQuizByTopicId } from "@/data/examTopicQuizzes";
import { getExamTopicById, getExamTopicDetailById } from "@/data/examTopics";
import { getModuleById, type LearningModule } from "@/data/learningModules";

export function ExamTopicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const topic = id ? getExamTopicById(id) : undefined;
  const detail = id ? getExamTopicDetailById(id) : undefined;
  const quiz = id ? getExamTopicQuizByTopicId(id) : undefined;

  if (!topic || !detail || topic.status !== "ready") {
    return (
      <main className="flex min-h-[calc(100vh-60px)] flex-col items-center justify-center bg-background px-4 text-center">
        <h1 className="text-2xl font-bold text-text-primary">未找到该考试专题</h1>
        <p className="mt-3 max-w-md text-text-secondary">
          该专题可能仍在建设中。请回到能力扩展页查看当前已开放内容。
        </p>
        <Button asChild className="mt-6">
          <Link to="/exam">返回能力扩展</Link>
        </Button>
      </main>
    );
  }

  const relatedModules = detail.relatedModuleIds
    .map((moduleId) => getModuleById(moduleId))
    .filter((module): module is LearningModule => Boolean(module));

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
              <Link to="/exam" className="transition-colors hover:text-primary">
                能力扩展
              </Link>
              <ChevronRight className="mx-2 h-4 w-4" />
              <span className="text-text-primary">{topic.title}</span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary-dark">
                    {topic.domain}
                  </span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                    {topic.difficulty}
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                  {detail.title}
                </h1>
                <p className="mt-3 text-lg font-medium text-primary-dark">{detail.subtitle}</p>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-text-secondary">
                  {detail.summary}
                </p>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-3 text-primary-dark">
                  <Lightbulb className="h-5 w-5" aria-hidden="true" />
                  <h2 className="font-bold">考试提示</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-text-primary">{detail.examTip}</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <ScrollReveal>
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-text-primary">解题步骤</h2>
            </div>
            <div className="mt-6 space-y-4">
              {detail.coreSteps.map((step, index) => (
                <article key={step.title} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-text-primary">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">{step.body}</p>
                      {step.formula && (
                        <div className="mt-3 rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm font-semibold text-primary-dark">
                          {step.formula}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <aside className="space-y-6">
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-3 text-amber-800">
                <TriangleAlert className="h-5 w-5" aria-hidden="true" />
                <h2 className="font-bold">常见误区</h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-amber-900">
                {detail.commonMistakes.map((mistake) => (
                  <li key={mistake} className="border-b border-amber-200/70 pb-3 last:border-0 last:pb-0">
                    {mistake}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <h2 className="font-bold text-text-primary">自查提示</h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">{detail.selfStudyPrompt}</p>
            </section>
          </aside>
        </ScrollReveal>
      </div>

      {quiz && (
        <ScrollReveal>
          <ExamTopicQuiz quiz={quiz} />
        </ScrollReveal>
      )}

      {relatedModules.length > 0 && (
        <ScrollReveal>
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-text-primary">关联 3D 模块</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {relatedModules.map((module) => (
                <Link
                  key={module.id}
                  to={module.route}
                  className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-panel"
                >
                  <div className="text-sm font-semibold text-primary-dark">{module.difficulty}</div>
                  <h3 className="mt-2 text-lg font-bold text-text-primary group-hover:text-primary">
                    {module.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">
                    {module.visualFocus}
                  </p>
                  <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                    进入 3D 观察
                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}
    </main>
  );
}
