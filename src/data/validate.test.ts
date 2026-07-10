import { describe, expect, test } from "bun:test";
import type { Question, QuestionBank } from "./schema";
import { validateBank } from "./validate";

// spec: question-bank / Question bank data shape — 壞資料樣本逐類斷言

const seg = (pairs: Array<[string, string?]>) => [pairs.map(([t, z]) => (z ? { t, z } : { t }))];

const goodSingle: Question = {
  id: "s1",
  type: "single",
  stem: seg([["水", "ㄕㄨㄟˇ"], ["果", "ㄍㄨㄛˇ"], ["?"]]),
  options: [seg([["蘋", "ㄆㄧㄥˊ"], ["果", "ㄍㄨㄛˇ"]]), seg([["白", "ㄅㄞˊ"], ["飯", "ㄈㄢˋ"]])],
  answer: 0,
};

function bankWith(qs: Question[]): QuestionBank {
  return { meta: { proofread: [] }, questions: qs };
}

describe("validateBank", () => {
  test("valid single question yields no errors for itself", () => {
    const errors = validateBank(bankWith([goodSingle]));
    expect(errors.filter((e) => e.questionId === "s1")).toHaveLength(0);
  });

  test("Chinese character without zhuyin is reported", () => {
    const bad: Question = { ...goodSingle, id: "bad-z", stem: seg([["水"]]) };
    const errors = validateBank(bankWith([bad]));
    expect(errors.some((e) => e.questionId === "bad-z" && e.field.includes("stem"))).toBe(true);
  });

  test("illegal zhuyin string is reported", () => {
    const bad: Question = { ...goodSingle, id: "bad-legal", stem: seg([["水", "shui3"]]) };
    expect(validateBank(bankWith([bad])).some((e) => e.questionId === "bad-legal")).toBe(true);
  });

  test("out-of-range answer index is reported", () => {
    const bad: Question = { ...goodSingle, id: "bad-idx", answer: 9 };
    expect(validateBank(bankWith([bad])).some((e) => e.questionId === "bad-idx" && e.field === "answer")).toBe(true);
  });

  test("non-bijective match mapping is reported", () => {
    const bad: Question = {
      id: "bad-match",
      type: "match",
      stem: seg([["配", "ㄆㄟˋ"], ["對", "ㄉㄨㄟˋ"]]),
      left: [seg([["魚", "ㄩˊ"]]), seg([["鳥", "ㄋㄧㄠˇ"]])],
      right: [seg([["水", "ㄕㄨㄟˇ"]]), seg([["巢", "ㄔㄠˊ"]])],
      answer: [0, 0],
    };
    expect(validateBank(bankWith([bad])).some((e) => e.questionId === "bad-match")).toBe(true);
  });

  test("fewer than three questions of a type is reported at bank level", () => {
    const errors = validateBank(bankWith([goodSingle]));
    expect(errors.some((e) => e.questionId === "(bank)" && e.field === "type-count")).toBe(true);
  });

  test("multi answer must be ascending unique indexes", () => {
    const bad: Question = {
      id: "bad-multi",
      type: "multi",
      stem: seg([["選", "ㄒㄩㄢˇ"]]),
      options: [seg([["一", "ㄧ"]]), seg([["二", "ㄦˋ"]]), seg([["三", "ㄙㄢ"]])],
      answer: [2, 1],
    };
    expect(validateBank(bankWith([bad])).some((e) => e.questionId === "bad-multi")).toBe(true);
  });
});

describe("neutral tone orthography", () => {
  test("leading ˙ is legal, trailing ˙ is not", () => {
    const mk = (z: string): Question => ({ ...goodSingle, id: "tone", stem: [[{ t: "吧", z }]] });
    expect(validateBank(bankWith([mk("˙ㄅㄚ")])).filter((e) => e.questionId === "tone")).toHaveLength(0);
    expect(validateBank(bankWith([mk("ㄅㄚ˙")])).some((e) => e.questionId === "tone")).toBe(true);
  });
});
