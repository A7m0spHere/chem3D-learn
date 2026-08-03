import type { ExamQuizAnswerResult, ExamQuizQuestion } from "@/types/examQuiz";

export function evaluateExamQuizAnswer(
  question: ExamQuizQuestion,
  optionId: string,
): ExamQuizAnswerResult {
  const option = question.options.find((candidate) => candidate.id === optionId);

  if (!option) {
    throw new Error(`Unknown option ${optionId} for question ${question.id}`);
  }

  return {
    optionId,
    isCorrect: optionId === question.correctOptionId,
    feedback: option.feedback,
  };
}
