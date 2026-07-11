import { describe, expect, test } from "bun:test";
import { UI } from "./ui-text.gen";

// 所有 UI 文案:每個中文字必有合法注音(輕聲前置)— Sean 指示全站注音
const CJK = /\p{Script=Han}/u;
const ZHUYIN = /^(?:˙[ㄅ-ㄩ]+|[ㄅ-ㄩ]+[ˊˇˋ]?)$/u;

describe("ui-text.gen", () => {
  test("every Chinese character carries a legal zhuyin reading", () => {
    const bad: string[] = [];
    for (const [key, rich] of Object.entries(UI)) {
      for (const seg of rich)
        for (const tok of seg) {
          if (CJK.test(tok.t) && (!tok.z || !ZHUYIN.test(tok.z))) bad.push(`${key}:${tok.t}:${tok.z ?? "∅"}`);
        }
    }
    expect(bad).toEqual([]);
  });

  test("golden polyphones and tone rules in UI copy", () => {
    const reading = (key: string, char: string, occurrence = 1): string => {
      let n = 0;
      for (const seg of UI[key]!) for (const tok of seg) if (tok.t === char && ++n === occurrence) return tok.z!;
      throw new Error(`${key} 無「${char}」#${occurrence}`);
    };
    expect(reading("leaderboardTitle", "行")).toBe("ㄏㄤˊ"); // 排行
    expect(reading("morePick", "還")).toBe("ㄏㄞˊ");
    expect(reading("autoSubmitted", "間")).toBe("ㄐㄧㄢ"); // 時間
    expect(reading("typeFill", "空")).toBe("ㄎㄨㄥˋ"); // 填空
    expect(reading("prev", "一")).toBe("ㄧˋ"); // 二聲前
    expect(reading("playAgain", "一")).toBe("ㄧˊ"); // 四聲前
    expect(reading("tierZeroMsg", "一", 1)).toBe("ㄧ"); // 第一:序數不變調
    expect(reading("welcome2", "嗎")).toBe("˙ㄇㄚ");
    expect(reading("dialogBody1", "們")).toBe("˙ㄇㄣ");
  });
});

test("no half-width punctuation anywhere in student-facing data (中文配全形)", async () => {
  const HALF = /[,!?():;]/;
  const offenders: string[] = [];
  for (const [key, rich] of Object.entries(UI)) {
    for (const seg of rich) for (const tok of seg) if (HALF.test(tok.t)) offenders.push(`ui:${key}:${tok.t}`);
  }
  const bank = (await import("./data/questions.json")) as unknown as {
    questions: Array<Record<string, unknown>>;
  };
  const scan = (rich: Array<Array<{ t: string }>>, where: string) => {
    for (const seg of rich) for (const tok of seg) if (HALF.test(tok.t)) offenders.push(`${where}:${tok.t}`);
  };
  for (const q of bank.questions) {
    scan(q.stem as never, `bank:${q.id}`);
    for (const k of ["options", "left", "right"]) for (const o of (q[k] as never[]) ?? []) scan(o, `bank:${q.id}`);
    if (q.suffix) scan(q.suffix as never, `bank:${q.id}`);
    for (const sh of (q.shapes as Array<{ label: never }>) ?? []) scan(sh.label, `bank:${q.id}`);
  }
  expect(offenders).toEqual([]);
});
