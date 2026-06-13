import { ChevronRight, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { ExamTopic } from "@/data/examTopics";

export function ExamTopicCard({ topic }: { topic: ExamTopic }) {
  const isChallenge = topic.difficulty === "竞赛挑战";

  return (
    <article className={`group flex h-full flex-col rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white ${isChallenge ? "border-amber-200 hover:border-amber-400" : "border-border hover:border-primary/30"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
            {topic.title}
          </h3>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
          {topic.domain}
        </span>
        <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          topic.difficulty.includes("竞赛") ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
        }`}>
          {topic.difficulty}
        </span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-text-secondary">
        {topic.description}
      </p>

      {isChallenge && (
        <div className="mt-4 rounded-md bg-amber-50 p-3 flex items-start gap-2 border border-amber-100">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            仅用于开阔视野，不作为高考基础要求。
          </p>
        </div>
      )}

      {topic.route ? (
        <Button asChild className="mt-6 w-full group-hover:bg-primary-dark transition-colors">
          <Link to={topic.route}>
            进入专题
            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Button>
      ) : (
        <Button disabled variant="outline" className="mt-6 w-full opacity-50 cursor-not-allowed">
          建设中
        </Button>
      )}
    </article>
  );
}
