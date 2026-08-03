import type { ExamTopicQuiz } from "@/types/examQuiz";

export const examTopicQuizzes: ExamTopicQuiz[] = [
  {
    id: "crystal-formula-foundations",
    topicId: "exam-crystal-formula",
    title: "三步自测：从位置到化学式",
    description: "每次选择后立即查看判断和原因。答错可以重试，不记录成绩。",
    questions: [
      {
        id: "edge-contribution",
        learningGoal: "位置贡献",
        prompt: "在立方晶胞中，一个位于棱心的粒子对当前晶胞贡献多少？",
        correctOptionId: "one-quarter",
        options: [
          {
            id: "one-eighth",
            label: "1/8",
            feedback: "1/8 是立方晶胞顶点粒子的贡献；棱心粒子由 4 个晶胞共享。",
          },
          {
            id: "one-quarter",
            label: "1/4",
            feedback: "棱心粒子由相邻 4 个晶胞共享，所以对一个晶胞贡献 1/4。",
          },
          {
            id: "one-half",
            label: "1/2",
            feedback: "1/2 是面心粒子的贡献；棱心周围共有 4 个晶胞。",
          },
          {
            id: "one",
            label: "1",
            feedback: "只有完全位于晶胞内部的粒子才完整贡献 1；棱心粒子需要均摊。",
          },
        ],
      },
      {
        id: "average-occupancy",
        learningGoal: "平均占有数",
        prompt: "某立方晶胞中，同一种 A 粒子位于 8 个顶点和 1 个体心。平均每个晶胞含多少个 A？",
        correctOptionId: "two",
        options: [
          {
            id: "one",
            label: "1 个",
            feedback: "8 个顶点合计贡献 1 个 A，但还要加上体心完整贡献的 1 个 A。",
          },
          {
            id: "two",
            label: "2 个",
            feedback: "8 × 1/8 + 1 × 1 = 2，所以平均每个晶胞含 2 个 A。",
          },
          {
            id: "eight",
            label: "8 个",
            feedback: "顶点粒子不能按画出的完整球直接计数；每个顶点只贡献 1/8。",
          },
          {
            id: "nine",
            label: "9 个",
            feedback: "9 是画面中的位置数，不是均摊后的粒子数；顶点需要乘 1/8。",
          },
        ],
      },
      {
        id: "simplest-formula",
        learningGoal: "化学式最简比",
        prompt: "某立方晶胞中，A 位于 8 个顶点，B 位于 6 个面心。该晶体的最简化学式应写成什么？",
        correctOptionId: "ab3",
        options: [
          {
            id: "a3b",
            label: "A₃B",
            feedback: "A 的均摊数是 8 × 1/8 = 1，B 的均摊数是 6 × 1/2 = 3，顺序不能倒置。",
          },
          {
            id: "ab3",
            label: "AB₃",
            feedback: "A : B = (8 × 1/8) : (6 × 1/2) = 1 : 3，所以最简式为 AB₃。",
          },
          {
            id: "a2b3",
            label: "A₂B₃",
            feedback: "顶点 A 合计只有 1 个，不是 2 个；先分别均摊，再化成最简整数比。",
          },
          {
            id: "a8b6",
            label: "A₈B₆",
            feedback: "A₈B₆ 直接使用了画出的位置数，没有计算顶点和面心的共享贡献。",
          },
        ],
      },
    ],
  },
];

export function getExamTopicQuizByTopicId(topicId: string): ExamTopicQuiz | undefined {
  return examTopicQuizzes.find((quiz) => quiz.topicId === topicId);
}
