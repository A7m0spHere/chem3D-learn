import type { ReactNode } from "react";
import { BookOpen, MonitorPlay, Move3D } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function AboutPage() {
  return (
    <main className="motion-page-enter min-h-screen bg-background">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary-dark">
            <Move3D className="h-4 w-4" aria-hidden="true" />
            结构化学 3D 学习站
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            用可旋转的三维结构，讲清高中化学里的空间想象。
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-text-secondary">
            Chem3D Learn 面向中国高中普通学生和化学教师。它不是完整化学数据库，而是围绕分子构型、晶体结构和考试空间理解建立的轻量学习工具。
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="rounded-xl">
              <Link to="/modules">进入学习模块</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <AboutCard
          icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
          title="给学生"
          body="用短步骤理解 CH4、NH3、H2O、CO2、BF3 和典型晶体模型，少背结论，多看空间关系。"
        />
        <AboutCard
          icon={<MonitorPlay className="h-5 w-5" aria-hidden="true" />}
          title="给课堂"
          body="保持大视窗、清晰文字和触控友好的操作按钮，方便教师在投影或白板上一边旋转一边讲解。"
        />
        <AboutCard
          icon={<Move3D className="h-5 w-5" aria-hidden="true" />}
          title="给结构理解"
          body="优先呈现键角、孤对电子、标签和晶胞观察步骤，帮助学生把二维题目转成三维图像。"
        />
      </section>
    </main>
  );
}

function AboutCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-bold text-text-primary">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{body}</p>
    </article>
  );
}
