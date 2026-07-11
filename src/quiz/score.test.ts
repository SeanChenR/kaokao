import { describe, expect, test } from "bun:test";
import type { Question } from "../data/schema";
import type { AnswerValue } from "./answers";
import { isCorrect, scoreOf } from "./score";

// spec: scoring / Per-type correctness judgement — Example: Judgement matrix

const q = (type: string, extra: Record<string, unknown>): Question =>
  ({ id: "x", type, stem: [], ...extra }) as unknown as Question;

const matrix: Array<[Question, AnswerValue | undefined, boolean]> = [
  [q("single", { options: [[], [], []], answer: 2 }), 2, true],
  [q("single", { options: [[], [], []], answer: 2 }), null, false],
  [q("single", { options: [[], [], []], answer: 2 }), undefined, false],
  [q("single", { options: [[], [], []], answer: 2 }), 1, false],
  [q("multi", { options: [[], [], []], answer: [0, 2] }), [0, 2], true],
  [q("multi", { options: [[], [], []], answer: [0, 2] }), [0], false],
  [q("multi", { options: [[], [], []], answer: [0, 2] }), [0, 1, 2], false],
  [q("fill", { accept: ["12", "十二"] }), "12", true],
  [q("fill", { accept: ["12", "十二"] }), " 十二 ", true],
  [q("fill", { accept: ["12", "十二"] }), "13", false],
  [q("fill", { accept: ["12", "十二"] }), "", false],
  [q("match", { left: [[], []], right: [[], []], answer: [1, 0] }), [1, 0], true],
  [q("match", { left: [[], []], right: [[], []], answer: [1, 0] }), [1, null], false],
  [q("match", { left: [[], []], right: [[], []], answer: [1, 0] }), [0, 1], false],
  [q("image", { shapes: [], answer: 1 }), 1, true],
  [q("image", { shapes: [], answer: 1 }), 0, false],
];

describe("isCorrect", () => {
  matrix.forEach(([question, value, expected], i) => {
    test(`#${i} ${question.type} → ${expected}`, () => {
      expect(isCorrect(question, value)).toBe(expected);
    });
  });
});

describe("scoreOf", () => {
  test("counts correct answers", () => {
    const qs = [
      q("single", { options: [[], []], answer: 0 }),
      q("fill", { accept: ["a"] }),
    ];
    qs[0]!.id = "a"; qs[1]!.id = "b";
    expect(scoreOf(qs, { a: 0, b: "x" })).toBe(1);
    expect(scoreOf(qs, {})).toBe(0);
  });
});
