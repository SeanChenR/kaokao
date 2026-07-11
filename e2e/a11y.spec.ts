import { expect, test } from "@playwright/test";
import { answerCorrectly, currentQuestion } from "./helpers";

// spec: polish / a11y 總檢

test("document language and heading structure", async ({ page }) => {
  await page.goto("/");
  expect(await page.locator("html").getAttribute("lang")).toBe("zh-Hant-TW");
  await expect(page.locator("h1")).toHaveCount(1);
  await page.getByLabel("你的名字").fill("結構星");
  await page.getByRole("button", { name: "開始測驗" }).click();
  await expect(page.getByRole("timer")).toBeVisible();
  await expect(page.locator("h2")).toHaveCount(1);
});

test("exactly one stem heading throughout transitions", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("你的名字").fill("過場星");
  await page.getByRole("button", { name: "開始測驗" }).click();
  await page.getByRole("button", { name: "下一題" }).click();
  // 過場採樣:任何瞬間 h2 數 ≤ 1(mode="wait")
  for (let i = 0; i < 5; i++) {
    const count = await page.locator("h2").count();
    expect(count).toBeLessThanOrEqual(1);
    await page.waitForTimeout(40);
  }
  await expect(page.locator("h2")).toHaveCount(1);
});

test("sound toggle is keyboard reachable with aria-pressed", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "開啟音效" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "關閉音效" })).toHaveAttribute("aria-pressed", "true");
});

test("reduced motion: question change has no positional animation", async ({ browser }) => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByLabel("你的名字").fill("靜態星");
  await page.getByRole("button", { name: "開始測驗" }).click();
  await answerCorrectly(page, await currentQuestion(page));
  await page.getByRole("button", { name: "下一題" }).click();
  // 無動畫 → 立即單 h2 且 transform 為 none/identity
  await expect(page.locator("h2")).toHaveCount(1);
  const transform = await page.locator("h2").evaluate((el) => {
    const card = el.closest("[data-question-id]")?.parentElement?.parentElement;
    return card ? getComputedStyle(card).transform : "none";
  });
  expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(transform);
});
