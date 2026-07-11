import { describe, expect, test } from "bun:test";
import bankJson from "./questions.json";
import type { QuestionBank, Rich } from "./schema";

// spec: question-bank / Polyphone coverage and regression guard
// Golden:鎖定破音字在特定題語境的正確讀音(台灣教育部字典為準)。
// 改題庫若標錯讀音,此檔必紅。

const bank = bankJson as unknown as QuestionBank;

function readingsOf(qid: string, char: string): string[] {
  const q = bank.questions.find((x) => x.id === qid);
  if (!q) throw new Error(`golden 指到不存在的題:${qid}`);
  const riches: Rich[] = [q.stem];
  if ("options" in q) riches.push(...q.options);
  if ("left" in q) riches.push(...q.left, ...q.right);
  if ("suffix" in q && q.suffix) riches.push(q.suffix);
  if ("shapes" in q) riches.push(...q.shapes.map((s) => s.label));
  const out: string[] = [];
  for (const rich of riches)
    for (const seg of rich) for (const tok of seg) if (tok.t === char && tok.z) out.push(tok.z);
  return out;
}

// 同字兩讀對照組(至少 3 組,spec 要求)
const GOLDEN: Array<{ char: string; a: [string, string]; b: [string, string] }> = [
  { char: "長", a: ["s-grow", "ㄓㄤˇ"], b: ["mt-opposite", "ㄔㄤˊ"] }, // 長大/長短
  { char: "樂", a: ["s-instrument", "ㄩㄝˋ"], b: ["f-antonym", "ㄌㄜˋ"] }, // 樂器/快樂
  { char: "行", a: ["m-vehicle", "ㄒㄧㄥˊ"], b: ["mt-place", "ㄏㄤˊ"] }, // 自行車/銀行
  { char: "一", a: ["s-grow", "ㄧˊ"], b: ["f-insect-legs", "ㄧˋ"] }, // 變調:四聲前ㄧˊ/非四聲前ㄧˋ
];

describe("polyphone golden readings", () => {
  test("at least 3 same-character two-reading pairs exist", () => {
    expect(GOLDEN.length).toBeGreaterThanOrEqual(3);
  });

  for (const { char, a, b } of GOLDEN) {
    test(`「${char}」:${a[0]} 讀 ${a[1]} / ${b[0]} 讀 ${b[1]}`, () => {
      expect(readingsOf(a[0], char)).toContain(a[1]);
      expect(readingsOf(b[0], char)).toContain(b[1]);
    });
  }

  test("星星 uses Taiwan MOE first tone on both characters (no mainland neutral tone)", () => {
    expect(readingsOf("i-star", "星")).toEqual(["ㄒㄧㄥ", "ㄒㄧㄥ", "ㄒㄧㄥ"]);
  });

  test("all proofread ids exist in the bank", () => {
    const ids = new Set(bank.questions.map((q) => q.id));
    for (const pid of bank.meta.proofread) expect(ids.has(pid)).toBe(true);
  });
});
