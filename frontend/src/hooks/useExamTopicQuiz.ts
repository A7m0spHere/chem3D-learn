import { useCallback, useEffect, useMemo, useState } from "react";
import { evaluateExamQuizAnswer } from "@/lib/examQuiz";
import type { ExamQuizAnswerResult, ExamTopicQuiz } from "@/types/examQuiz";

type ExamQuizAnswers = Record<string, string>;

export type ExamTopicQuizState = {
  answers: ExamQuizAnswers;
  answeredCount: number;
  correctCount: number;
  answerQuestion: (questionId: string, optionId: string) => void;
  getResult: (questionId: string) => ExamQuizAnswerResult | undefined;
  resetQuiz: () => void;
  retryQuestion: (questionId: string) => void;
};

export function useExamTopicQuiz(quiz: ExamTopicQuiz): ExamTopicQuizState {
  const [answers, setAnswers] = useState<ExamQuizAnswers>({});

  useEffect(() => {
    setAnswers({});
  }, [quiz.id]);

  const answerQuestion = useCallback((questionId: string, optionId: string) => {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
  }, []);

  const retryQuestion = useCallback((questionId: string) => {
    setAnswers((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  }, []);

  const resetQuiz = useCallback(() => {
    setAnswers({});
  }, []);

  const results = useMemo(() => {
    return quiz.questions.reduce<Record<string, ExamQuizAnswerResult>>((current, question) => {
      const optionId = answers[question.id];
      if (optionId) {
        current[question.id] = evaluateExamQuizAnswer(question, optionId);
      }
      return current;
    }, {});
  }, [answers, quiz.questions]);

  const getResult = useCallback(
    (questionId: string) => results[questionId],
    [results],
  );

  return {
    answers,
    answeredCount: Object.keys(results).length,
    correctCount: Object.values(results).filter((result) => result.isCorrect).length,
    answerQuestion,
    getResult,
    resetQuiz,
    retryQuestion,
  };
}
