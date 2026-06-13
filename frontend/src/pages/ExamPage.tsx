import { Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { examTopics } from "@/data/examTopics";
import { ExamTopicCard } from "@/components/exam/ExamTopicCard";

export function ExamPage() {
  const partitions = [
    { id: "高频能力", title: "晶体化学 · 高频能力" },
    { id: "高考真题结构", title: "晶体化学 · 高考真题结构" },
    { id: "竞赛视野", title: "晶体化学 · 竞赛视野" },
  ] as const;

  return (
    <main className="motion-page-enter bg-background min-h-screen pb-20">
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="flex items-center text-sm font-medium text-text-secondary mb-6">
            <Link to="/" className="hover:text-primary transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-text-primary">能力扩展</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl mb-4">
            能力扩展
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl">
            围绕高考与竞赛中常见的结构化学题型，建立从“看图”到“解题”的能力。
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border border-primary/20">
          <h2 className="text-2xl font-bold text-text-primary mb-2">晶体化学专题</h2>
          <h3 className="text-lg font-medium text-primary mb-4">陌生晶胞、配位结构与材料晶体</h3>
          <p className="text-text-secondary leading-relaxed max-w-4xl">
            本专题聚焦晶体化学相关题型，包括晶胞计数、配位数、分数坐标、晶胞密度、非立方晶胞、配合物晶体和新材料结构。内容分为高考核心、高考提高和竞赛视野三个难度层级。
          </p>
        </div>

        <div className="space-y-16">
          {partitions.map((partition) => {
            const partitionTopics = examTopics.filter((t) => t.partition === partition.id);
            if (partitionTopics.length === 0) return null;

            return (
              <section key={partition.id}>
                <div className="mb-6 flex items-baseline gap-4 border-b border-border pb-4">
                  <h3 className="text-2xl font-bold text-text-primary">
                    {partition.title}
                  </h3>
                  <span className="text-sm font-medium text-text-secondary">
                    {partitionTopics.length} 个专题
                  </span>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {partitionTopics.map((topic) => (
                    <ExamTopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
