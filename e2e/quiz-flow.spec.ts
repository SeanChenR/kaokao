import { expect, test, type Page } from "@playwright/test";

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
    if (await next.isVisible()) await next.click();
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
  await expect(page.getByText("作答完成 🎉")).toBeVisible();
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
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(focused).toBe("H2");
});
