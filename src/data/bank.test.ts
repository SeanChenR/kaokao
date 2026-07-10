import { describe, expect, test } from "bun:test";
import type { QType, QuestionBank } from "./schema";
import { validateBank } from "./validate";
import questionsJson from "./questions.json";

const bank = questionsJson as unknown as QuestionBank;
const TYPES: QType[] = ["single", "multi", "fill", "match", "image"];

describe("canonical question bank", () => {
  test("passes validateBank with zero errors", () => {
    const errors = validateBank(bank);
    expect(errors).toEqual([]);
  });

  test("holds at least fifteen questions with unique ids", () => {
    expect(bank.questions.length).toBeGreaterThanOrEqual(15);
    const ids = bank.questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test.each(TYPES)("has at least three %s questions", (type) => {
    const count = bank.questions.filter((q) => q.type === type).length;
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("meta.proofread lists every question id", () => {
    const ids = new Set(bank.questions.map((q) => q.id));
    expect(new Set(bank.meta.proofread)).toEqual(ids);
  });
});
