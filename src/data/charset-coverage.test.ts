import { describe, expect, test } from "bun:test";
import { create } from "fontkit";
import bankJson from "./questions.json";
import type { QuestionBank, Rich } from "./schema";

// spec: question-bank / Font glyph coverage for bank content
// 對「產物」woff2 的 cmap 斷言,關住「改 charset 沒重跑 subset」的洞。

const bank = bankJson as unknown as QuestionBank;

function collectChars(): Set<string> {
  const chars = new Set<string>();
  const addRich = (rich: Rich) => {
    for (const seg of rich)
      for (const tok of seg) {
        for (const ch of tok.t) chars.add(ch);
        if (tok.z) for (const ch of tok.z) chars.add(ch);
      }
  };
  for (const q of bank.questions) {
    addRich(q.stem);
    if ("options" in q) q.options.forEach(addRich);
    if ("left" in q) [...q.left, ...q.right].forEach(addRich);
    if ("suffix" in q && q.suffix) addRich(q.suffix);
    if ("shapes" in q) q.shapes.forEach((s) => addRich(s.label));
    if ("accept" in q) for (const a of q.accept) for (const ch of a) chars.add(ch);
  }
  return chars;
}

describe("charset coverage", () => {
  test("every bank character and zhuyin symbol has a glyph in huninn-400.woff2", async () => {
    const buf = await Bun.file(new URL("../assets/fonts/huninn-400.woff2", import.meta.url)).arrayBuffer();
    const font = create(Buffer.from(buf)) as { hasGlyphForCodePoint(cp: number): boolean };
    const missing: string[] = [];
    for (const ch of collectChars()) {
      if (ch === " " || ch === "\n") continue;
      if (!font.hasGlyphForCodePoint(ch.codePointAt(0)!)) missing.push(ch);
    }
    expect(missing).toEqual([]);
  });
});
