import type { Page } from "@playwright/test";
import bank from "../src/data/questions.json" with { type: "json" };

export type Q = (typeof bank.questions)[number];

/** 以 data-question-id 穩定識別當前題目(不靠文字反推) */
export async function currentQuestion(page: Page): Promise<Q> {
  const id = await page.getByRole("heading", { level: 2 }).getAttribute("data-question-id");
  const q = bank.questions.find((x) => x.id === id);
  if (!q) throw new Error(`找不到題目 id:${id}`);
  return q;
}

export async function answerCorrectly(page: Page, q: Q): Promise<void> {
  if (q.type === "single" || q.type === "image") {
    await page.getByRole("radio").nth((q as { answer: number }).answer).click();
  } else if (q.type === "multi") {
    for (const i of (q as { answer: number[] }).answer) await page.getByRole("checkbox").nth(i).click();
  } else if (q.type === "fill") {
    await page.getByRole("textbox").fill((q as { accept: string[] }).accept[0]!);
  } else {
    const answer = (q as { answer: number[] }).answer;
    for (let li = 0; li < answer.length; li++) {
      await page.getByTestId("match-left").getByRole("button").nth(li).click();
      await page.getByTestId("match-right").getByRole("button").nth(answer[li]!).click();
    }
  }
}

import { expect } from "@playwright/test";

/** 點下一題並等切換完成(mode="wait" 離場期間舊 h2 仍在,直接讀會拿到舊題) */
export async function nextQuestion(page: Page): Promise<void> {
  const stem = page.getByRole("heading", { level: 2 });
  const before = await stem.getAttribute("data-question-id");
  await page.getByRole("button", { name: "下一題" }).click();
  await expect(stem).not.toHaveAttribute("data-question-id", before ?? "");
}

/** 容注音文字比對:真瀏覽器預設注音開,textContent 會混入 rt 注音字元 */
export function zt(text: string): RegExp {
  const esc = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    [...esc].map((ch) => (/\p{Script=Han}/u.test(ch) ? `${ch}[ㄅ-ㄩˊˇˋ˙]*` : ch)).join(""),
  );
}
