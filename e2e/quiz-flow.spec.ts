import { expect, test, type Page } from "@playwright/test";
import { nextQuestion } from "./helpers";

async function startQuiz(page: Page, name = "測試星") {
  await page.goto("/");
  await page.getByLabel("你的名字").fill(name);
  await page.getByRole("button", { name: "開始測驗" }).click();
  await expect(page.getByRole("timer")).toBeVisible();
}

test("blank name shows accessible error", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "開始測驗" }).click();
  await expect(page.getByText("先寫上名字才能出發喔!")).toBeVisible();
  await expect(page.getByLabel("你的名字")).toHaveAttribute("aria-invalid", "true");
});

test("full flow: five typed questions in order, star jump, dialog, submit", async ({ page }) => {
  await startQuiz(page);
  for (const label of ["單選題", "多選題", "填空題", "配對題", "看圖選選看"]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
    const next = page.getByRole("button", { name: "下一題" });
    if (await next.isVisible()) await nextQuestion(page);
  }
  // 星軌跳回第 2 題
  await page.getByRole("button", { name: /第 2 題/ }).click();
  await expect(page.getByText("多選題", { exact: true })).toBeVisible();
  // 跳到最後送出 → 未答 dialog
  await page.getByRole("button", { name: /第 5 題/ }).click();
  await page.getByRole("button", { name: "送出答案" }).click();
  await expect(page.getByText(/還有 5 題沒寫完喔/)).toBeVisible();
  // 預設焦點在「回去作答」(安全動作)
  await expect(page.getByRole("button", { name: "回去作答" })).toBeFocused();
  await page.getByRole("button", { name: "直接送出" }).click();
  await expect(page.getByText("作答回顧")).toBeVisible();
});

test("reload resumes the same questions and continues the clock", async ({ page }) => {
  await startQuiz(page);
  const stem = await page.getByRole("heading", { level: 2 }).textContent();
  await page.waitForTimeout(2000); // 讓時鐘實際走掉幾秒,驗證續命而非重置
  await page.reload();
  await expect(page.getByRole("timer")).toBeVisible();
  expect(await page.getByRole("heading", { level: 2 }).textContent()).toBe(stem);
  const t = await page.getByRole("timer").textContent();
  expect(t).toMatch(/9:[0-5]\d/); // 時間延續,不是重置 10:00
});

test("keyboard: next moves focus to the new stem", async ({ page }) => {
  await startQuiz(page);
  await page.getByRole("button", { name: "下一題" }).click();
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe("H2"); // 焦點在進場動畫完成後落定

});

test("real answering: all five types, star track fills, direct submit", async ({ page }) => {
  await startQuiz(page, "全答星");
  // 1 單選
  await page.getByRole("radio").first().click();
  await nextQuestion(page);
  // 2 多選:勾兩個
  const boxes = page.getByRole("checkbox");
  await boxes.nth(0).click();
  await boxes.nth(1).click();
  await nextQuestion(page);
  // 3 填空
  await page.getByRole("textbox").fill("12");
  await nextQuestion(page);
  // 4 配對:依序全連
  const lefts = page.getByTestId("match-left").getByRole("button");
  const rights = page.getByTestId("match-right").getByRole("button");
  const half = await lefts.count();
  for (let i = 0; i < half; i++) {
    await lefts.nth(i).click();
    await rights.nth(i).click();
  }
  await expect(page.locator("svg line")).toHaveCount(half);
  await nextQuestion(page);
  // 5 圖片
  await page.getByRole("radio").first().click();
  await expect(page.getByText("已答 5/5")).toBeVisible();
  // 全答 → 直接送出,無 dialog
  await page.getByRole("button", { name: "送出答案" }).click();
  await expect(page.getByText("作答回顧")).toBeVisible();
});

test("zhuyin toggle strips ruby from option cards too", async ({ page }) => {
  await startQuiz(page, "注音星");
  await expect(page.locator("[role=radiogroup] ruby").first()).toBeVisible();
  await page.getByRole("button", { name: "注音顯示" }).click();
  await expect(page.locator("[role=radiogroup] ruby")).toHaveCount(0);
  await page.getByRole("button", { name: "注音顯示" }).click();
  await expect(page.locator("[role=radiogroup] ruby").first()).toBeVisible();
});


test("keyboard: arrows move radio focus, Space selects", async ({ page }) => {
  await startQuiz(page, "鍵盤星");
  await page.getByRole("radio").first().click();
  await page.keyboard.press("ArrowDown");
  const second = page.getByRole("radio").nth(1);
  await expect(second).toBeFocused();
  await page.keyboard.press(" ");
  await expect(second).toHaveAttribute("aria-checked", "true");
});
