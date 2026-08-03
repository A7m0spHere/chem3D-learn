import { expect, test } from "@playwright/test";
import { examTopicQuizzes, getExamTopicQuizByTopicId } from "../../src/data/examTopicQuizzes";
import { evaluateExamQuizAnswer } from "../../src/lib/examQuiz";

test("T-035 只为晶胞均摊专题注册三步自测", () => {
  expect(examTopicQuizzes).toHaveLength(1);

  const quiz = getExamTopicQuizByTopicId("exam-crystal-formula");
  expect(quiz).toBeDefined();
  expect(quiz?.questions).toHaveLength(3);
  expect(quiz?.questions.map((question) => question.learningGoal)).toEqual([
    "位置贡献",
    "平均占有数",
    "化学式最简比",
  ]);
  expect(getExamTopicQuizByTopicId("exam-coordination-number")).toBeUndefined();
});

test("每道公开自测题的 ID、选项和正确答案结构自洽", () => {
  const quiz = getExamTopicQuizByTopicId("exam-crystal-formula");
  expect(quiz).toBeDefined();

  const questionIds = quiz?.questions.map((question) => question.id) ?? [];
  expect(new Set(questionIds).size).toBe(questionIds.length);

  for (const question of quiz?.questions ?? []) {
    const optionIds = question.options.map((option) => option.id);
    expect(question.options.length).toBeGreaterThanOrEqual(2);
    expect(new Set(optionIds).size, `${question.id} 的选项 ID 应唯一`).toBe(optionIds.length);
    expect(optionIds, `${question.id} 应包含正确选项`).toContain(question.correctOptionId);
    expect(question.options.every((option) => option.feedback.length > 0)).toBe(true);
  }
});

test("判定函数返回明确的正确或错误文本原因", () => {
  const quiz = getExamTopicQuizByTopicId("exam-crystal-formula");
  const edgeQuestion = quiz?.questions[0];
  expect(edgeQuestion).toBeDefined();

  const correct = evaluateExamQuizAnswer(edgeQuestion!, "one-quarter");
  expect(correct).toEqual({
    optionId: "one-quarter",
    isCorrect: true,
    feedback: "棱心粒子由相邻 4 个晶胞共享，所以对一个晶胞贡献 1/4。",
  });

  const incorrect = evaluateExamQuizAnswer(edgeQuestion!, "one-eighth");
  expect(incorrect.isCorrect).toBe(false);
  expect(incorrect.feedback).toContain("顶点粒子");
  expect(() => evaluateExamQuizAnswer(edgeQuestion!, "missing-option")).toThrow(
    "Unknown option missing-option for question edge-contribution",
  );
});

test("三题答案锁定位置贡献、平均占有数和 AB₃ 最简比", () => {
  const quiz = getExamTopicQuizByTopicId("exam-crystal-formula");
  expect(quiz?.questions.map((question) => question.correctOptionId)).toEqual([
    "one-quarter",
    "two",
    "ab3",
  ]);
  expect(quiz?.questions[1].options.find((option) => option.id === "two")?.feedback).toContain(
    "8 × 1/8 + 1 × 1 = 2",
  );
  expect(quiz?.questions[2].options.find((option) => option.id === "ab3")?.feedback).toContain(
    "1 : 3",
  );
});
