import { describe, expect, test } from "bun:test";
import type { Question } from "../data/schema";
import { isAnswered, type AnswerValue } from "./answers";

// spec: quiz-session / Answer-state contract — 全型別矩陣

const q = (type: string): Question => ({ id: "x", type, stem: [] }) as unknown as Question;

const matrix: Array<[string, AnswerValue | undefined, boolean]> = [
  ["single", null, false],
  ["single", undefined, false],
  ["single", 0, true],
  ["single", 2, true],
  ["image", null, false],
  ["image", 1, true],
  ["multi", [], false],
  ["multi", [0], true],
  ["multi", [1, 3], true],
  ["fill", "", false],
  ["fill", "   ", false],
  ["fill", "12", true],
  ["match", [null, null, null], false],
  ["match", [0, null, 2], false], // 部分連線 = 未答
  ["match", [0, 1, 2], true],
];

describe("isAnswered", () => {
  for (const [type, value, expected] of matrix) {
    test(`${type} ${JSON.stringify(value)} → ${expected}`, () => {
      expect(isAnswered(q(type), value)).toBe(expected);
    });
  }
});
