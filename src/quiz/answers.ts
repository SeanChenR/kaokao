import type { Question } from "../data/schema";

/** 各題型作答值形狀(spec: quiz-session / Answer-state contract) */
export interface AnswerValueMap {
  single: number | null;
  multi: number[];
  fill: string;
  match: (number | null)[];
  image: number | null;
}

export type AnswerValue = AnswerValueMap[keyof AnswerValueMap];

/** 全站唯一的「已作答」判定 — 星軌點亮、未答計數、送出提醒共用 */
export function isAnswered(q: Question, value: AnswerValue | undefined): boolean {
  if (value === undefined) return false;
  switch (q.type) {
    case "single":
    case "image":
      return value !== null;
    case "multi":
      return Array.isArray(value) && value.length > 0;
    case "fill":
      return typeof value === "string" && value.trim() !== "";
    case "match":
      return Array.isArray(value) && value.length > 0 && value.every((v) => v !== null);
  }
}
