export type ExamQuizOption = {
  id: string;
  label: string;
  feedback: string;
};

export type ExamQuizQuestion = {
  id: string;
  learningGoal: string;
  prompt: string;
  correctOptionId: string;
  options: ExamQuizOption[];
};

export type ExamTopicQuiz = {
  id: string;
  topicId: string;
  title: string;
  description: string;
  questions: ExamQuizQuestion[];
};

export type ExamQuizAnswerResult = {
  optionId: string;
  isCorrect: boolean;
  feedback: string;
};
