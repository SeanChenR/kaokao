import type { Question } from "../data/schema";
import type { AnswerValue } from "./answers";

/** 送出後才判分 — quiz 階段不得呼叫(spec: scoring / Per-type correctness judgement) */
export function isCorrect(q: Question, value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  switch (q.type) {
    case "single":
    case "image":
      return value === q.answer;
    case "multi":
      return (
        Array.isArray(value) &&
        value.length === q.answer.length &&
        value.every((v, i) => v === q.answer[i])
      );
    case "fill":
      return typeof value === "string" && q.accept.includes(value.trim());
    case "match":
      return (
        Array.isArray(value) &&
        value.length === q.answer.length &&
        value.every((v, i) => v === q.answer[i])
      );
  }
}

export function scoreOf(questions: Question[], answers: Record<string, AnswerValue>): number {
  return questions.filter((q) => isCorrect(q, answers[q.id])).length;
}
