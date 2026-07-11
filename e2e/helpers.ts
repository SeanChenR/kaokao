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
