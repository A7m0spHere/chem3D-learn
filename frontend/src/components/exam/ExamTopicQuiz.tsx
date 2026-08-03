import { CheckCircle2, CircleHelp, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExamTopicQuiz } from "@/hooks/useExamTopicQuiz";
import { cn } from "@/lib/utils";
import type { ExamTopicQuiz as ExamTopicQuizData } from "@/types/examQuiz";

type ExamTopicQuizProps = {
  quiz: ExamTopicQuizData;
};

export function ExamTopicQuiz({ quiz }: ExamTopicQuizProps) {
  const {
    answers,
    answeredCount,
    correctCount,
    answerQuestion,
    getResult,
    resetQuiz,
    retryQuestion,
  } = useExamTopicQuiz(quiz);

  return (
    <section
      aria-labelledby={`${quiz.id}-title`}
      className="mx-auto mb-12 max-w-7xl px-4 sm:px-6 lg:px-8"
      data-testid="exam-topic-quiz"
    >
      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-sm">
        <div className="border-b border-primary/15 bg-primary/5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 text-primary-dark">
                <CircleHelp className="h-5 w-5" aria-hidden="true" />
                <span className="text-sm font-bold">动手自测</span>
              </div>
              <h2
                className="mt-2 text-2xl font-bold text-text-primary"
                id={`${quiz.id}-title`}
              >
                {quiz.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{quiz.description}</p>
            </div>
            <div
              aria-live="polite"
              className="shrink-0 rounded-xl border border-primary/20 bg-white px-4 py-3 text-sm font-semibold text-text-primary"
              data-testid="quiz-progress"
            >
              已作答 {answeredCount}/{quiz.questions.length} · 答对 {correctCount} 题
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {quiz.questions.map((question, questionIndex) => {
            const selectedOptionId = answers[question.id];
            const result = getResult(question.id);
            const feedbackId = `${quiz.id}-${question.id}-feedback`;

            return (
              <fieldset
                className="rounded-xl border border-border bg-background p-4 sm:p-5"
                data-testid={`quiz-question-${question.id}`}
                key={question.id}
              >
                <legend className="sr-only">
                  第 {questionIndex + 1} 题：{question.learningGoal}
                </legend>
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                  >
                    {questionIndex + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-primary-dark">{question.learningGoal}</p>
                    <p className="mt-1 font-semibold leading-7 text-text-primary">{question.prompt}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {question.options.map((option) => {
                    const isSelected = selectedOptionId === option.id;
                    const optionId = `${quiz.id}-${question.id}-${option.id}`;

                    return (
                      <label
                        className={cn(
                          "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-text-primary transition-colors",
                          "hover:border-primary/50 hover:bg-primary/5 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                          isSelected && result?.isCorrect && "border-primary bg-primary/5",
                          isSelected && result && !result.isCorrect && "border-amber-300 bg-amber-50",
                        )}
                        htmlFor={optionId}
                        key={option.id}
                      >
                        <input
                          aria-describedby={isSelected && result ? feedbackId : undefined}
                          checked={isSelected}
                          className="h-4 w-4 shrink-0 accent-primary"
                          id={optionId}
                          name={`${quiz.id}-${question.id}`}
                          onChange={() => answerQuestion(question.id, option.id)}
                          type="radio"
                          value={option.id}
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>

                {result && (
                  <div
                    aria-live="polite"
                    className={cn(
                      "mt-4 rounded-xl border p-4",
                      result.isCorrect
                        ? "border-primary/30 bg-primary/5"
                        : "border-amber-300 bg-amber-50",
                    )}
                    id={feedbackId}
                    role="status"
                  >
                    <div className="flex items-start gap-3">
                      {result.isCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                      ) : (
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-text-primary">
                          {result.isCorrect ? "回答正确" : "回答错误"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-text-secondary">{result.feedback}</p>
                      </div>
                    </div>
                    <Button
                      aria-label={`重试第 ${questionIndex + 1} 题`}
                      className="mt-3 min-h-11 w-full sm:w-auto"
                      onClick={() => retryQuestion(question.id)}
                      type="button"
                      variant="secondary"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      重试本题
                    </Button>
                  </div>
                )}
              </fieldset>
            );
          })}

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-text-secondary">
              结果只保存在当前页面，离开后不会记录成绩。
            </p>
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={answeredCount === 0}
              onClick={resetQuiz}
              type="button"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              重新练习全部题目
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
